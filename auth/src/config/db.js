import 'dotenv/config';
import mongoose from "mongoose";

export const connectToDB = async()=>{
 try{
  await mongoose.connect(process.env.AUTH_MONGO_URI)
  console.log("mongoDb connected")
 }catch(err){
  console.error('MongoDB connection error:',err);
  process.exit(1)
 }
}