import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;
    if (!mongoUri) {
      throw new Error("Missing MongoDB connection string (MONGO_URI or MONGO_URL)");
    }
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`Agent Database connected on host ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error at Agent:", error);
  }
};

export default connectDB;
