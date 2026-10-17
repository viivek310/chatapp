import asyncHandler from 'express-async-handler';
import { User } from '../models/userModel.js';
import { generateToken } from '../jwt/generateToken.js';

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please enter all required fields",
        });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
        return res.status(400).json({
            success: false,
            message: "User with this email already exists",
        });
    }

    const user = new User({
        name: name.trim(),
        email: normalizedEmail,
        password,
        ...(pic && { pic }),
    });
    
    await user.save();

    if (user) {
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token: generateToken(user._id),
            },
        });
    } else {
        return res.status(500).json({
            success: false,
            message: "Failed to create user account",
        });
    }
});

export const authUser = asyncHandler(async (req, res) => {
    const { email, password, token } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide both email and password",
        });
    }

    try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (user && (await user.matchPassword(password))) {
            if (token) {
                await User.updateOne({ _id: user._id }, { $set: { fcmToken: token } });
            }

            return res.status(200).json({
                success: true,
                message: "Login successful",
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    pic: user.pic,
                    token: generateToken(user._id),
                },
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
    } catch (error) {
        console.error("[Login Error]:", error);
        return res.status(500).json({
            success: false,
            message: "Authentication error",
            error: error.message,
        });
    }
});

export const searchUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
              $or: [
                  { name: { $regex: req.query.search.trim(), $options: "i" } },
                  { email: { $regex: req.query.search.trim(), $options: "i" } },
              ],
          }
        : {};

    const users = await User.find(keyword)
        .find({ _id: { $ne: req.user._id } })
        .select("-password");

    return res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: users,
    });
});

export const updateProfile = asyncHandler(async (req, res) => {
    try {
        const { name, pic } = req.body;

        const up = {
            ...(name && { name: name.trim() }),
            ...(pic && { pic }),
        };

        await User.updateOne({ _id: req.user._id }, { $set: up });
        const updatedUser = await User.findById(req.user._id).select("-password");

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                pic: updatedUser.pic,
                token: generateToken(updatedUser._id),
            },
        });
    } catch (error) {
        console.error("[Profile Update Error]:", error);
        return res.status(400).json({
            success: false,
            message: "Profile update failed",
            error: error.message,
        });
    }
});
