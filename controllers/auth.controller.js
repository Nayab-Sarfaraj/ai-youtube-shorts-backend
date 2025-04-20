import { PrismaClient } from "../generated/prisma/client.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient(); 

export const register = async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, phoneNumber },
    });
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET);
    res.status(201).json({ user: newUser,token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
