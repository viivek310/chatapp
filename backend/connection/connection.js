import mongoose from "mongoose";

export const connectDb = async () => {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        console.error("[Database] Error: MONGODB_URI environment variable is not defined.");
        return;
    }

    try {
        const conn = await mongoose.connect(mongoUri);
        console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[Database] Connection Error: ${error.message}`);
    }
};