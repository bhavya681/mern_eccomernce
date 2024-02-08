import mongoose from "mongoose";
import dotenv from "dotenv";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`Successfully Connected to db host: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
