import { Router } from "express";
import passport from "passport";
import { getAllRepo, githubCallback } from "../controller/github.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const githubRouter = Router();

githubRouter.get('/health',(req,res)=>{
 res.status(200).json({message:"OK"})
})

githubRouter.get("/signin",passport.authenticate("github", {session: false,scope: ["user:email", "read:user", "public_repo"],}));

githubRouter.get("/signin/callback",passport.authenticate("github",{session: false,failureRedirect: "/"}),githubCallback);

githubRouter.get('/repo',authMiddleware,getAllRepo)

export default githubRouter;
