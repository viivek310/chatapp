import mongoose from "mongoose";

export const connectDb = async () => {
    // const mon = process.env.MONGODB_URI;
    // console.log(mon)
    try {
        const con = await mongoose.connect(process.env.MONGODB_URI)
    } catch (error) {
        console.log(error)
        process.exit()
    }
}