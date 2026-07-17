import mongoose from 'mongoose'

const githubUserSchema = new mongoose.Schema({
 userId:mongoose.Schema.Types.ObjectId,
 githubId:String,
 username:String,
 avatar:String,
 githubAccessToken:String
},{
 timestamps:true
})

const githubUserModel = mongoose.model('github',githubUserSchema);

export default githubUserModel;