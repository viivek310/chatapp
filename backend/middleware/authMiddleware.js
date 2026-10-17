import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { User } from "../models/userModel.js";

export const protect = asyncHandler(async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = await User.findById(decoded.id).select("-password");
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found",
                    error: "jwt"
                });
            }
            return next();
        } catch (error) {
            console.error("[Auth Error]", error.message);
            return res.status(401).json({
                success: false,
                message: "Not Authorized, token failed",
                error: "jwt"
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not Authorized, no token provided",
            error: "jwt"
        });
    }
});
