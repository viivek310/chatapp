import { Router } from "express";
import { authUser, registerUser, searchUsers } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

export const userRouter = Router();

userRouter.post("/",registerUser)
userRouter.post("/login",authUser)
userRouter.get("/",protect,searchUsers)