import 'dotenv/config';

if(!process.env.GITHUB_MONGO_URI){
 throw new Error("MongoDb String not found");
}

if(!process.env.GITHUB_JWT_SECRET){
 throw new Error('JWT_Secret Not found');
}

export const config = {
 GITHUB_CLIENT_ID:process.env.GITHUB_CLIENT_ID,
 GITHUB_CLIENT_SECRET:process.env.GITHUB_CLIENT_SECRET,
 MONGO_URI:process.env.GITHUB_MONGO_URI,
 GITHUB_JWT_SECRET:process.env.GITHUB_JWT_SECRET
}