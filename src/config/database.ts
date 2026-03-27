import mongoose from "mongoose";
import dotenv from "dotenv";
import { envConfig } from "./env";

dotenv.config();

const connectDB = async () => {
  try {
    const uri = envConfig.MONGO_URI as string;
    console.log("[database] MONGO_URI (full string):", uri || "(empty — set MONGO_URI in env)");
    await mongoose.connect(uri);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  }
};

export default connectDB;
