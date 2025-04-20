// config/dbConnect.js
import mongoose from "mongoose";
// const { default: mongoose } = require("mongoose");

export default async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI
        );
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit on connection failure
    }
};

