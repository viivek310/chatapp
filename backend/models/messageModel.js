import mongoose, { mongo } from "mongoose";

const messageModel = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    content: {type: String, trim: true},
    chat:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
    },
    seenBy: [String]   
},
{timestamps: true,}
)

export const Message = mongoose.model("Message",messageModel)
