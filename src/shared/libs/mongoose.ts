"use server";

import mongoose from "mongoose";

let isConnected = false;

export const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  const mongoUrl = process.env.MONGODB_URL;

  if (!mongoUrl) {
    throw new Error("MONGODB_URL is not defined");
  }

  try {
    await mongoose.connect(mongoUrl);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};
