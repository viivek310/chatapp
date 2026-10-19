import mongoose from "mongoose";
import { seedDemoData } from "../config/seedDemo.js";

export const connectDb = async () => {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        console.error("[Database] Error: MONGODB_URI environment variable is not defined.");
        return;
    }

    try {
        const conn = await mongoose.connect(mongoUri);
        console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
        await seedDemoData();
    } catch (error) {
        console.error(`[Database] Connection Error: ${error.message}`);
    }
};