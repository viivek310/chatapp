import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { allMessages, sendMessage } from "../controllers/messageController.js"

export const messageRouter = express.Router()

messageRouter.post("/",protect,sendMessage)
messageRouter.get("/:chatId",allMessages)

