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
    console.log(`Payment Database connected at host ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error at Payment:", error);
  }
};

export default connectDB;
