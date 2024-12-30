import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userModel = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pic: { type: String,},
}, { timestamps: true });

userModel.methods.matchPassword=async function matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password)
}

userModel.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

export const User = mongoose.model("User", userModel);
