import asyncHandler from "express-async-handler"
import { Chat } from "../models/chatModel.js"
import { User } from "../models/userModel.js"

export const accessChat = asyncHandler(async(req,res)=>{
    const {userId} = req.body
    if(!userId){
        return res.sendStatus(400)
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and:[
            {users:{$elemMatch:{$eq:req.user._id}}},
            {users:{$elemMatch:{$eq:userId}}},
        ],
    }).populate("users","-password").populate("latestMessage")

    isChat = await User.populate(isChat,{
        path: "latestMessage.sender",
        select: "name pic email",
    })
    if(isChat.length>0){
        res.send(isChat)
    }else{
        try {
            const createdChat = new Chat({chatName:"sender",isGroupChat:false,users:[req.user._id,userId]})
            await createdChat.save()

            const fullChat = await Chat.find({_id:createdChat._id}).populate("users","-password")
            res.status(200).send(fullChat)
        } catch (error) {
            res.status(400)
            throw new Error(error.message)
        }
    }
})

export const fetchChats = asyncHandler(async(req,res)=>{
    try {
        var chats = await Chat.find( {users:{$elemMatch:{$eq:req.user._id}}})
        .populate("users","-password")
        .populate("latestMessage")
        .populate("groupAdmin","-password")
        .sort({updatedAt:-1}    )

        chats = await User.populate(chats,{
            path:"latestMessage.sender",
            select: "name pic email",
        })

        res.status(200).send(chats)
    } catch (error) {
        res.status(400)
        throw new Error(error.message);
    }
})

export const createGroupChat = asyncHandler(async(req,res)=>{
    if(!req.body.users||!req.body.name){
        return res.status(400).send({message:"please fill all the fields"})
    }
    
    var users = JSON.parse(req.body.users)

    if(users.length<2){
        return res.status(400).send("More than 2 users are required to form a group chat")
    }

    users.push(req.user._id)
    
    try {
        const groupChat = new Chat({
            chatName: req.body.name,
            isGroupChat: true,
            users,
            groupAdmin: req.user
        })

        await groupChat.save()

        const fullGroupChat = await Chat.findOne({_id:groupChat._id}).populate("users","-password").populate("groupAdmin","-password")
        res.status(200).send(fullGroupChat)
    } catch (error) {
        res.status(400)
        throw new Error(error.message);
        
    }
})

export const renameGroup = asyncHandler(async(req,res)=>{
    const {chatId, chatName} = req.body 
    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName
        },
        {
            new: true
        }
    ).populate("users","-password")
    .populate("groupAdmin","-password")


    if(!updatedChat){
        res.status(400)
        throw new Error("Chat not found");
    }else{
        res.send(updatedChat)
    }
})

export const addToGroup = asyncHandler(async(req,res)=>{
    const {chatId,userId} = req.body
    
    const update = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push:{users:userId}
        },
        {
            new: true
        }
    ).populate("users","-password")
    .populate("groupAdmin","-password")

    if(!update){
        res.status(400)
        throw new Error("chat not found")
    }else{
        res.status(200).send(update)
    }
})

export const removeFromGroup = asyncHandler(async(req,res)=>{
    const {chatId,userId} = req.body

    const remove = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull:{users:userId}
        },
        {
            new: true
        }
    ).populate("users","-password")
    .populate("groupAdmin","-password")

    if(!remove){
        res.status(400)
        throw new Error("chat not found");
        
    }else{
        res.status(200).send(remove)
    }
})