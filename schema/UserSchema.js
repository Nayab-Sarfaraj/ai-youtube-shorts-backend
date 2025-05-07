import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      maxlength: 15,
    },
    credits: {
      type: Number,
      default: 3,
    },
  },
  {
    timestamps: true, // createdAt and updatedAt auto-managed
  }
);

const User = mongoose.model("User", userSchema);

export default User;
