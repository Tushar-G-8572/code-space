import { config } from "./config.js";
import mongoose from "mongoose";

export async function connectDB() {
  try{
   await mongoose.connect(config.GITHUB_MONGO_URI);
   console.log("github Connected to DB")
  }catch(err){
   console.log(err);
   process.exit(1);
  }
}