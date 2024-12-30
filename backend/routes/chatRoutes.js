import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { accessChat, addToGroup, createGroupChat, fetchChats, removeFromGroup, renameGroup } from "../controllers/chatController.js";


export const chatRouter = express.Router()

chatRouter.post("/",protect,accessChat)
chatRouter.get("/",protect,fetchChats)
chatRouter.post("/group",protect,createGroupChat)
chatRouter.put("/rename",protect,renameGroup)
chatRouter.put("/groupadd",protect,addToGroup)
chatRouter.put("/groupremove",protect,removeFromGroup)
