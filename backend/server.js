import express, { json } from "express";
import { userRouter } from "./routes/userRoutes.js";
import { connectDb } from "./connection/connection.js";
import { configDotenv } from "dotenv";
import { errorHandler, notfound } from "./middleware/errorMiddleware.js";
import cors from "cors";
import { chatRouter } from "./routes/chatRoutes.js";
import { messageRouter } from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import path from "path"
import { fileURLToPath } from "url";
import { messaging } from "./firebase.js";
import { protect } from "./middleware/authMiddleware.js";
import { User } from "./models/userModel.js";
import { Message } from "./models/messageModel.js";




configDotenv()
connectDb()


const app = express()
app.use(cors())

app.use(express.json())

app.use("/api/user", userRouter)
app.use("/api/chat", chatRouter)
app.use("/api/message", messageRouter)

app.post('/send-notification', protect, async (req, res) => {
  const { title, body, userId, chat } = req.body; // Expecting device token, title, and body in the 

  const token = await User.findById(userId)

  if (!title || !body) {
    return res.status(400).send('Missing required fields');
  }

  if (!token) {
    return res.send("no user found")
  }

  if (!token?.fcmToken) {
    return res.send("no fcm token")
  }

  const message = {
    notification: {
      title: title,
      body: body,
    },
    android: {
      notification: {
        icon: 'ic_notification',  // Custom notification icon (from mipmap)
      },
    },
    data: {
      chat: JSON.stringify(chat)
    },
    token: token.fcmToken,
  };

  try {
    // Send the notification to the device
    const response = await messaging.send(message);

    res.status(200).send('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).send('Failed to send notification');
  }
});


// -----------------------------------------------
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("server is running")
  })
}

// -----------------------------------------------

app.use(notfound)
app.use(errorHandler)
const port = process.env.PORT || 5000

const server = app.listen(port, () => {
  console.log("App running on 5000 port")
})

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: `${process.env.NODE_ENV === "production" ? "https://v-chat-2y3m.onrender.com" : "http://localhost:5173"}`
  }
})

io.on("connection", (socket) => {
  // console.log("connected to socket io")

  socket.on("setup", (userData) => {
    socket.join(userData._id)
    // console.log(userData._id)
    socket.emit("connected")
  })

  socket.on("join chat", (room) => {
    socket.join(room)
    // console.log("user joined room",room)
  })

  socket.on("new message", (msg) => {
    const chat = msg.chat

    if (!chat?.users) return

    chat.users.forEach(user => {
      if (user._id === msg.sender._id) return

      socket.in(user._id).emit("message received", msg)
    })
  })



  //seen feature
  socket.on("message_seen", ({ messageId, seenBy, chat }) => {
    chat.users.forEach(user => {
      if (user._id === seenBy) return

      socket.in(user._id).emit('message_seen_ack', { messageId, seenBy })
    })
  })

  socket.on('db_updated', ({ tempId, messageId, chat, seenBy }) => {
    chat.users.forEach(user => {
      if (user._id === seenBy) return
      socket.in(user._id).emit("message_updated_db", { tempId, messageId })
    })
  })

  socket.on('db_seenmessage', async ({ messageId, seenBy }) => {
  
    if (!messageId || !seenBy) {
      console.warn('⚠️ Invalid payload for db_seenmessage');
      return;
    }
  
    try {
      await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { seenBy: seenBy } },
        { new: true } // optional: return updated doc if you need it
      );

    } catch (err) {
      console.error('❌ Error marking message as seen:', err);
    }
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"))
  socket.on(("stop typing"), (room => socket.in(room).emit("stop typing")))

  socket.off("setup", (userData) => {
    console.log("user diconneted")
    socket.leave(userData._id)
  })
})