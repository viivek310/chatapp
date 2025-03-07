import jwt, { decode } from "jsonwebtoken";
import asyncHandler from "express-async-handler"
import { User } from "../models/userModel.js";

export const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1]

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode)
            req.user = await User.findById(decoded.id).select("-password");

            next()
        } catch (error) {
            console.log(error)
            res.json({
                success: false,
                message:"Not Authorized, token failed",
                error: "jwt"
            })
        }
    }

    if (!token) {
        res.json({
            success:false,
            message:"Not Authorized, no token",
            error: "jwt"
        })
    }
})
