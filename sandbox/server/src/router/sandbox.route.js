import { Router } from "express";
import { createPod } from "../kubernetes/pod.js";
import { createService } from "../kubernetes/service.js";
import { v7 as uuid } from 'uuid';

const sandboxRoute = Router();

sandboxRoute.get('/healthz', (req, res) => {
 res.status(200).json({ message: "OK from sandbox" })
})

sandboxRoute.post('/start', async (req, res) => {
 try {

  const sandboxId = uuid();
  await createPod(sandboxId);
  await createService(sandboxId);
  return res.status(201).json({ success: true, sandboxId, previewUrl: `http://${sandboxId}.preview.localhost` });
 } catch (err) {
  console.log(err);
  return res.status(500).json({ message: "Sandbox creation error" });
 }

})

export default sandboxRoute;