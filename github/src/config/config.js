import 'dotenv/config';

if(!process.env.MONGO_URI){
 throw new Error("MongoDb String not found");
}

if(!process.env.JWT_SECRET){
 throw new Error('JWT_Secret Not found');
}



export const config = {
 PORT:process.env.PORT,
 MONGO_URI:process.env.MONGO_URI,
 JWT_SECRET:process.env.JWT_SECRET
}