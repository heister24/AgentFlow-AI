import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Payment Database connected at host ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error at Payment:", error);
  }
};

export default connectDB;
