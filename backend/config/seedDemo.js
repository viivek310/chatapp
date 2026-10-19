import { User } from "../models/userModel.js";
import { Chat } from "../models/chatModel.js";
import { Message } from "../models/messageModel.js";

export const seedDemoData = async () => {
  try {
    const existingDemo = await User.findOne({ email: "guest@vchat.dev" });
    if (existingDemo) {
      if (existingDemo.pic && existingDemo.pic.includes("icon-library.com")) {
        existingDemo.pic = "";
        await existingDemo.save();
        console.log("[Seeder] Repaired existing demo recruiter avatar.");
      }
      return;
    }

    console.log("[Seeder] Initializing demo recruiter accounts...");

    const demoUser = await User.create({
      name: "Demo Recruiter",
      email: "guest@vchat.dev",
      password: "GuestPass123!",
      pic: "",
    });

    const contactUser = await User.create({
      name: "Aarav Sharma (Lead Engineer)",
      email: "aarav@vchat.dev",
      password: "GuestPass123!",
      pic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    });

    const sampleChat = await Chat.create({
      chatName: "Aarav Sharma (Lead Engineer)",
      isGroupChat: false,
      users: [demoUser._id, contactUser._id],
    });

    const sampleMessage = await Message.create({
      sender: contactUser._id,
      content: "Namaste! Welcome to V-Chat. Feel free to send messages, test typing indicators, and search users.",
      chat: sampleChat._id,
    });

    sampleChat.latestMessage = sampleMessage._id;
    await sampleChat.save();

    console.log("[Seeder] Demo recruiter account (guest@vchat.dev) ready.");
  } catch (error) {
    console.error("[Seeder Error]:", error.message);
  }
};
