import {Router} from 'express'
import fs from 'fs'
import path from 'path'

const agentRouter = Router()
const WORKING_DIR = '/workspace';

agentRouter.get('/',(req,res)=>{
 res.status(200).json({message:"agent Router health"})
})

agentRouter.get('/list-files',async(req,res)=>{
  const files = await fs.promises.readdir(WORKING_DIR);

  res.status(200).json({success:"Elements in files",files})
})


export default agentRouter;