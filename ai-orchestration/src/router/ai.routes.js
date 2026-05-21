import { Router } from "express";
import agent from "../agents/code.agent.js";

const aiRouter = Router();

aiRouter.get('/healthz',(req,res)=>{
 res.status(200).json({success:"ok"})
})

aiRouter.post('/invoke',async(req,res)=>{
 try{
  const message = req.body.message;
  const response = await agent.invoke({
   messages:[
    {
     role:"user",
     content:message
    }
   ]
  })
  res.json({ response });
 }catch(err){
  console.log("Error invoking Agent",err);
  return res.status(500).json({message:"Error while invoking"})
 }
})

export default aiRouter