import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB")
  } catch (error) {
    console.error("Failed to connect to MongoDB")
  }
};
