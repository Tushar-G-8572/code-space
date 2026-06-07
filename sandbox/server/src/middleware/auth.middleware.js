import jwt from 'jsonwebtoken'

export async function authMiddleware(req,res,next) {
 const token = req.cookies?.token || req.headers[ 'authorization' ]?.split(' ')[ 1 ];
 console.log(token)
 try{
  if(!token){
   return res.status(403).json({success:false,message:"Unauthorised"});
  }
  const decoded = jwt.verify(token,process.env.JWT_SECRET);
  if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
  req.user = decoded;
  next();
 }catch(err){
  console.log("authMiddleware Error",err);
  return res.status(500).json({success:false,message:"Error in auth Middleware"})
 }
}