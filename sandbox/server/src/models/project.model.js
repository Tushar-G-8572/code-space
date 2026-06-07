import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
 userId:{
  type: mongoose.Schema.Types.ObjectId,
  required: true
 },
 title: {
  type: String,
  default: "Untitled Project"
 }
},{
 timestamps: true
})

const projectModel =  mongoose.model('project',projectSchema)

export default projectModel