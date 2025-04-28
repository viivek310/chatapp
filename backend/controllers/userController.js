import asyncHandler from 'express-async-handler';
import { User } from '../models/userModel.js';
import { generateToken } from '../jwt/generateToken.js';

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body;

    if (!name || !email || !password) {
        res.json({
            success: false,
            message: "Enter all fields"
        })
    }



    const userExists = await User.findOne({ email })

    if (userExists) {
        res.json({
            success: false,
            message: "User already exists"
        })
    }


    const user = new User({
        name,
        email,
        password,
        ...(pic && { pic }),
    })
    await user.save()

    if (user) {
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token: generateToken(user._id)
            }
        })
    } else {
        res.json({
            success: false,
            message: "Failed to create user"
        })

    }


})

export const authUser = asyncHandler(async (req, res) => {
    const { email, password, token } = req.body;

    try {
        
        const user = await User.findOne({ email })
        // const tf = await user.matchPassword(password)
        
        if (user && await user.matchPassword(password)) {
        const updToken = await User.updateOne({email},{$set:{fcmToken:token}})
            res.json({
                success: true,
                message: "login successful",
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    pic: user.pic,
                    token: generateToken(user._id)
                }
            })
        } else {
            res.json({
                success:false,
                message:"Incorrect Credentials"
            })
        }
    } catch (error) {
        console.log(error)
        res.json({
            success:false,
            message:"Incorrect Credentials"
        })
    }
})

export const searchUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
              $or: [
                  { name: { $regex: req.query.search, $options: "i" } },
                  { email: { $regex: req.query.search, $options: "i" } }
              ]
          }
        : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

    res.json({
        success: true,
        message: "Users fetched successfully",
        data: users
    });
});

export const updateProfile = asyncHandler(async (req, res) => {
    try {
        const { name, pic } = req.body;

        const up = {
            ...(name && { name }),
            ...(pic && { pic })
        };

        const update = await User.updateOne({ _id: req.user._id }, { $set: up });

        const updatedUser = await User.findById(req.user._id);

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                pic: updatedUser.pic,
                token: generateToken(updatedUser._id)
            }
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: "Profile update failed",
            error: error.message
        });
    }
});
