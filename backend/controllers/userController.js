import asyncHandler from 'express-async-handler';
import { User } from '../models/userModel.js';
import { generateToken } from '../jwt/generateToken.js';

export const registerUser = asyncHandler(async (req,res)=>{
     const {name, email, password, pic} = req.body;
    
     if(!name || !email || !password ){
        res.status(400);
        throw new Error("Please enter all the fields");
     }



     const userExists = await User.findOne({email})

     if(userExists){
        res.status(400)
        throw new Error("User already exists");
     }

     console.log(pic)

     const user = new User({
        name,
        email,
        password,
        ...(pic && { pic }),
     })
    await user.save()

     if(user){
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id)
        })  
     }else{
        res.status(400);
        throw new Error("Failed to create user");
        
     }


})

export const authUser = asyncHandler(async(req,res)=>{
    const {email,password} = req.body;

    
    const user = await User.findOne({email})
    const tf = await user.matchPassword(password)
    
    if(user&&await user.matchPassword(password)){
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id)
        })
    }else{
        res.status(400)
        throw new Error("Incorrect Credentials");
    }
})

export const searchUsers = asyncHandler(async(req,res)=>{
    // if(req.query.search===" ")
    //     res.send("Enter user name")
    
    // console.log(req.query.search)
    const keyword = req.query.search?{
        $or:[
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } }
        ]
    }:{};
    
    const users = await User.find(keyword).find({_id:{$ne:req.user._id}})
    res.send(users)
})

export const updateProfile = asyncHandler(async(req,res)=>{
    try {
        const {name,pic} = req.body

        const up = {
            ...(name&&{name}),
            ...(pic&&{pic})
        }
        const update = await User.updateOne({_id:req.user._id},{$set:up})
        
        res.send({message:"profile updated successfully"})
    } catch (error) {
        res.status(400)
        console.log(error)
        throw new Error(error)
    }
})