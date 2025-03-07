import asyncHandler from "express-async-handler";
import { Chat } from "../models/chatModel.js";
import { User } from "../models/userModel.js";

export const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User ID is required",
        });
    }

    try {
        let isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ],
        })
            .populate("users", "-password")
            .populate("latestMessage");

        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "name pic email",
        });

        if (isChat.length > 0) {
            return res.json({
                success: true,
                message: "Chat found",
                data: isChat,
            });
        }

        const createdChat = new Chat({
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        });

        await createdChat.save();

        const fullChat = await Chat.findById(createdChat._id).populate("users", "-password");

        res.status(201).json({
            success: true,
            message: "Chat created successfully",
            data: fullChat,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error accessing chat",
            error: error.message,
        });
    }
});

export const fetchChats = asyncHandler(async (req, res) => {
    try {
        let chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("latestMessage")
            .populate("groupAdmin", "-password")
            .sort({ updatedAt: -1 });

        chats = await User.populate(chats, {
            path: "latestMessage.sender",
            select: "name pic email",
        });

        res.json({
            success: true,
            message: "Chats fetched successfully",
            data: chats,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error fetching chats",
            error: error.message,
        });
    }
});

export const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields",
        });
    }

    let users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res.status(400).json({
            success: false,
            message: "At least 3 users are required to create a group chat",
        });
    }

    users.push(req.user._id);

    try {
        const groupChat = new Chat({
            chatName: req.body.name,
            isGroupChat: true,
            users,
            groupAdmin: req.user,
        });

        await groupChat.save();

        const fullGroupChat = await Chat.findById(groupChat._id)
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(201).json({
            success: true,
            message: "Group chat created successfully",
            data: fullGroupChat,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error creating group chat",
            error: error.message,
        });
    }
});

export const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    try {
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { chatName },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!updatedChat) {
            return res.status(400).json({
                success: false,
                message: "Chat not found",
            });
        }

        res.json({
            success: true,
            message: "Group chat renamed successfully",
            data: updatedChat,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error renaming group chat",
            error: error.message,
        });
    }
});

export const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    try {
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { $push: { users: userId } },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!updatedChat) {
            return res.status(400).json({
                success: false,
                message: "Chat not found",
            });
        }

        res.json({
            success: true,
            message: "User added to group successfully",
            data: updatedChat,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error adding user to group",
            error: error.message,
        });
    }
});

export const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    try {
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { $pull: { users: userId } },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!updatedChat) {
            return res.status(400).json({
                success: false,
                message: "Chat not found",
            });
        }

        res.json({
            success: true,
            message: "User removed from group successfully",
            data: updatedChat,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error removing user from group",
            error: error.message,
        });
    }
});
