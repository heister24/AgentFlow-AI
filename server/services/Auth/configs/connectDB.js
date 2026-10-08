import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`Database connected on host ${conn.connection.host}`);
  } catch (error) {
    console.log(`Authentication Database connection error ${error}`);
  }
};

export default connectDB;
