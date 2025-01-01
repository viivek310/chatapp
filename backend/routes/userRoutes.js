import { Router } from "express";
import { authUser, registerUser, searchUsers, updateProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

export const userRouter = Router();

userRouter.post("/",registerUser)
userRouter.post("/login",authUser)
userRouter.post("/update",protect,updateProfile)
userRouter.get("/",protect,searchUsers)