import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../schema/UserSchema.js";

export const register = async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getMe = async (req, res) => {
  try {
    const user = req.user; 

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Error in /me:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updatePushToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { expoPushToken: token },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user: updatedUser, message: "Push token updated" });
  } catch (error) {
    console.error("Failed to update push token:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
