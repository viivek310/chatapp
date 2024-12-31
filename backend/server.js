import express from "express";
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



configDotenv()
connectDb()


const app = express()
app.use(cors())

app.use(express.json())

app.use("/api/user",userRouter)
app.use("/api/chat",chatRouter)
app.use("/api/message",messageRouter)

// -----------------------------------------------
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log(process.env.NODE_ENV)
if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.resolve(__dirname,"../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname,"../frontend/dist/index.html"));
    });
}else{
    app.get("/",(req,res)=>{
        res.send("server is running")
    })
}

// -----------------------------------------------

app.use(notfound)
app.use(errorHandler)
const port = process.env.PORT || 5000

const server = app.listen(port,()=>{
    console.log("App running on 5000 port")
})

const io = new Server(server,{
    pingTimeout: 60000,
    cors:{
        origin: `https://v-chat-2y3m.onrender.com`
    }
})

io.on("connection",(socket)=>{
    // console.log("connected to socket io")

    socket.on("setup",(userData)=>{
        socket.join(userData._id)
        // console.log(userData._id)
        socket.emit("connected")
    })

    socket.on("join chat",(room)=>{
        socket.join(room)
        // console.log("user joined room",room)
    })

    socket.on("new message",(msg)=>{
        const chat = msg.chat

        if(!chat.users) return

        chat.users.forEach(user => {
            if(user._id===msg.sender._id) return

            socket.in(user._id).emit("message received",msg)
        })
    })

    socket.on("typing",(room)=>socket.in(room).emit("typing"))
    socket.on(("stop typing"),(room=>socket.in(room).emit("stop typing")))

    socket.off("setup",(userData)=>{
        console.log("user diconneted")
        socket.leave(userData._id)
    })
})