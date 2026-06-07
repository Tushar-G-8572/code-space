import mongoose from "mongoose";

export async function connectToDB() {
 try{
  await mongoose.connect(process.env.SANDBOX_MONGO_URI);
  console.log("Sandbox-Server connected to DB")
 }catch(err){
  console.log(err);
  process.exit(1);
 }
}