import expressAsyncHandler from "express-async-handler";
import { Message } from "../models/messageModel.js";
import { Chat } from "../models/chatModel.js";
import { User } from "../models/userModel.js";

export const sendMessage = expressAsyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        return res.status(400).json({
            success: false,
            message: "Content and chatId are required"
        });
    }

    const newMessage = {
        sender: req.user._id,
        content,
        chat: chatId
    };

    try {
        let message = new Message(newMessage);
        await message.save();

        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email"
        });

        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message
        });

        res.json({
            success: true,
            message: "Message sent successfully",
            data: message
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to send message",
            error: error.message
        });
    }
});

export const allMessages = expressAsyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("chat");

        res.json({
            success: true,
            message: "Messages fetched successfully",
            data: messages
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to fetch messages",
            error: error.message
        });
    }
});
