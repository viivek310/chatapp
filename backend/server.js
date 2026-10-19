import express from "express";
import mongoose from "mongoose";
import { userRouter } from "./routes/userRoutes.js";
import { chatRouter } from "./routes/chatRoutes.js";
import { messageRouter } from "./routes/messageRoutes.js";
import { uploadRouter } from "./routes/uploadRoutes.js";
import { connectDb } from "./connection/connection.js";
import { configDotenv } from "dotenv";
import { errorHandler, notfound } from "./middleware/errorMiddleware.js";
import cors from "cors";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { messaging } from "./firebase.js";
import { protect } from "./middleware/authMiddleware.js";
import { User } from "./models/userModel.js";
import { Message } from "./models/messageModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

configDotenv();
connectDb();

const app = express();

// Serve local uploaded media statically
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or matching clientOrigin / localhost
      if (
        !origin ||
        origin === clientOrigin ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in deployment if behind reverse proxy
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// System Health Check (Database-Aware)
app.get("/api/health", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const status = isDbConnected ? "healthy" : "degraded";
  const statusCode = isDbConnected ? 200 : 503;

  res.status(statusCode).json({
    status,
    database: isDbConnected ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});


// API Routes
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);
app.use("/api/upload", uploadRouter);

// Push Notification Endpoint (Firebase)
app.post("/send-notification", protect, async (req, res) => {
  const { title, body, userId, chat } = req.body;

  if (!title || !body || !userId) {
    return res.status(400).json({ success: false, message: "Missing required notification fields" });
  }

  try {
    const user = await User.findById(userId);

    if (!user || !user.fcmToken) {
      return res.status(200).json({ success: false, message: "No FCM token registered for recipient" });
    }

    const message = {
      notification: { title, body },
      android: {
        notification: { icon: "ic_notification" },
      },
      data: {
        chat: JSON.stringify(chat || {}),
      },
      token: user.fcmToken,
    };

    const response = await messaging.send(message);
    res.status(200).json({ success: true, message: "Notification sent successfully", response });
  } catch (error) {
    console.error("[Notification Error]:", error.message);
    res.status(500).json({ success: false, message: "Failed to send notification", error: error.message });
  }
});

// Production Static Assets
if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res, next) => {
    // If request is for an API route that wasn't matched, delegate to 404 handler
    if (req.originalUrl.startsWith("/api/")) {
      return next();
    }
    res.sendFile(path.resolve(frontendDistPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("MERN Chat Application Server is running.");
  });
}

app.use(notfound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`[Server] Live and running on port ${port} (mode: ${process.env.NODE_ENV || "development"})`);
});

// Socket.io Realtime Setup
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*", // Handled by express CORS and reverse proxy
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    if (userData?._id) {
      socket.join(userData._id);
      socket.emit("connected");
    }
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing", room);
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing", room);
  });

  socket.on("new message", (newMessageRecieved) => {
    const chat = newMessageRecieved?.chat;
    if (!chat?._id) return;

    // Broadcast to room
    socket.in(chat._id).emit("message received", newMessageRecieved);

    // Also notify individual user rooms if provided (for unread counters)
    if (Array.isArray(chat.users)) {
      chat.users.forEach((user) => {
        const recipientId = typeof user === "object" ? user._id : user;
        if (recipientId && recipientId !== newMessageRecieved?.sender?._id) {
          socket.in(recipientId).emit("notification received", newMessageRecieved);
        }
      });
    }
  });

  socket.on("message_seen", ({ messageId, seenBy, chat }) => {
    if (chat?.users && Array.isArray(chat.users)) {
      chat.users.forEach((user) => {
        const uId = typeof user === "object" ? user._id : user;
        if (uId && uId !== seenBy) {
          socket.in(uId).emit("message_seen_ack", { messageId, seenBy });
        }
      });
    }
  });

  socket.on("seenAllMessages", async ({ chat, senderId, seenBy }) => {
    try {
      if (chat && senderId && seenBy) {
        await Message.updateMany(
          { sender: senderId, chat, seenBy: { $ne: seenBy } },
          { $addToSet: { seenBy } }
        );
      }
    } catch (error) {
      console.error("[Socket seenAllMessages Error]:", error.message);
    }
  });

  socket.on("disconnect", () => {
    // Socket disconnected cleanly
  });
});