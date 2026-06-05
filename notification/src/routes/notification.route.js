import { Router } from "express";

const notifyRoute = Router();

notifyRoute.get('/healthz',(req,res)=>{
 res.status(200).json({success:true,message:"Notify Healthz"})
})



export default notifyRoute;