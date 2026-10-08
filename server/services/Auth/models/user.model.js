import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUID: {
      type: String,
      required: true,
      unique: true,
    },
    email: String,
    name: String,
    avatar: String,
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
