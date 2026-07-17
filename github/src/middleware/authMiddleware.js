import { verifyToken } from "../utils/jwt.js";

export async function authMiddleware(req,res,next) {
 try{
   const token = req.cookies?.appToken || req.headers[ 'authorization' ]?.split(' ')[ 1 ];
   if(!token) return res.status(400).json({success:false,message:"Token needed"});
   const decoded = verifyToken(token);
   req.user = decoded;
   next();
   }catch(err){
    console.log("github middleware Error",err);
    return res.status(500).json({success:false,message:"middleware Error"});
   }
}