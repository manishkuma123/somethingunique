import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();
let db ='mongodb+srv://manishpdotpitchtechnologies:DQg0IO0SCPX6VvaU@cluster0.rgekx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is undefined. Check your .env file.");
    }

    const conn = await mongoose.connect(db);
    console.log(`MongoDB Connected`);
  } catch (error: any) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
