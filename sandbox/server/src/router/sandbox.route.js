import { Router } from "express";
import { createPod } from "../kubernetes/pod.js";
import { createService } from "../kubernetes/service.js";
import { v7 as uuid } from 'uuid';
import { authMiddleware } from "../middleware/auth.middleware.js";
import projectModel from "../models/project.model.js";
import { createSandboxKey } from "../config/redis.js";
import { setProjectSandbox,getProjectSandbox } from "../utils/sandboxCache.js";

const sandboxRoute = Router();

sandboxRoute.get('/healthz', (req, res) => {
 res.status(200).json({ message: "OK from sandbox" })
})

sandboxRoute.post('/project',authMiddleware,async(req,res)=>{
  const {title} = req.body;
  const {id} = req.user;
  const project = await projectModel.create({
    userId: id,
    title
  });
  
  return res.status(201).json({success:true,message:"Project Created",project})
})

sandboxRoute.post('/start',authMiddleware, async (req, res) => {
 try {
  const {id} = req.user;
  const {projectId} = req.body;
  const project = await projectModel.findOne({_id:projectId,userId:id});
  if(!project){
    return res.status(404).json({success:false,message:"NO project found"})
  }

  const sandboxId = uuid();
  await Promise.all([
    createPod(sandboxId,projectId),
    createService(sandboxId),
    createSandboxKey(sandboxId),
    setProjectSandbox(projectId, sandboxId),
  ])
  // await createPod(sandboxId);
  // await createService(sandboxId);

  return res.status(201).json({ success: true, 
    sandboxId,
    previewUrl: `http://${sandboxId}.preview.localhost`,
    agentUrl: `http://${sandboxId}.agent.localhost`
 });
 } catch (err) {
  console.log(err);
  return res.status(500).json({ message: "Sandbox creation error" });
 }

})

sandboxRoute.get('/project',authMiddleware,async(req,res)=>{
  try{
    const {id} = req.user;
    const project = await projectModel.find({userId:id});
    if(!project){
      return res.status(404).json({success:false,message:"No project found"});
    }
    return res.status(200).json({success:true,message:"Projects fetched",project,id})
  }catch(err){
    console.log(err);
    return res.status(500).json({success:false,message:"Error while fetching Project"})
  }
})

sandboxRoute.post('/open-project', authMiddleware, async (req, res) => {
  try {
    const { id } = req.user;
    const { projectId } = req.body;

    const project = await projectModel.findOne({ _id: projectId, userId: id });
    if (!project) {
      return res.status(404).json({ success: false, message: "No project found" });
    }

    // ✅ Check if a sandbox already exists for this project
    const existingSandboxId = await getProjectSandbox(projectId);

    if (existingSandboxId) {
      // Sandbox is already running — just return the existing URLs
      return res.status(200).json({
        success: true,
        sandboxId: existingSandboxId,
        previewUrl: `http://${existingSandboxId}.preview.localhost`,
        agentUrl: `http://${existingSandboxId}.agent.localhost`,
        reused: true, // optional flag for frontend awareness
      });
    }

    // No active sandbox found — create a fresh one
    const sandboxId = uuid();

    await Promise.all([
      createPod(sandboxId, projectId),
      createService(sandboxId),
      createSandboxKey(sandboxId),
      setProjectSandbox(projectId, sandboxId), // store the new mapping
    ]);

    return res.status(201).json({
      success: true,
      sandboxId,
      previewUrl: `http://${sandboxId}.preview.localhost`,
      agentUrl: `http://${sandboxId}.agent.localhost`,
      reused: false,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'Error while opening project' });
  }
});

export default sandboxRoute;