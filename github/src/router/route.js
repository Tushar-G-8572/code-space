import { Router } from "express";
import passport from "passport";
import { getAllRepo, githubCallback } from "../controller/github.controller.js";

const githubRouter = Router();

githubRouter.get("/signin",passport.authenticate("github", {session: false,scope: ["user:email", "read:user", "public_repo"],}));

githubRouter.get("/signin/callback",passport.authenticate("github",{session: false,failureRedirect: "/"}),githubCallback);

githubRouter.get('/repo',getAllRepo)

export default githubRouter;
