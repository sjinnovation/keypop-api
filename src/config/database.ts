import mongoose from "mongoose";
import dotenv from "dotenv";
import { envConfig } from "./env";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(envConfig.MONGO_URI as string);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  }
};

export default connectDB;
