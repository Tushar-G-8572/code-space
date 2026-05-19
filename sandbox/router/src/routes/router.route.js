import { Router } from "express";

const router = Router();

router.get('/healthz',(req,res)=>{
 res.status(200).json({success:'ok',message:"Router health"});
})

router.get('/readyz',(req,res)=>{
 res.status(200).json({success:'ok',message:"Router readyz"});
})



export default router;
