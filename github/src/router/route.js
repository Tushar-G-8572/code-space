import { Router } from "express";
import passport from "passport";

const githubRouter = Router();

githubRouter.get(
  "/signin",
  passport.authenticate("github", {
    session: false,
    scope: ["user:email", "read:user", "repo"],
  }),
);

githubRouter.get(
  "/signin/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/",
  }),
  async (req, res) => {
    try {
     const githubUser = req.user;
    console.log(githubUser);
      return res.status(200).json({success:true,message:"Github loggedIn",githubRouter})
    } catch (err) {
      console.log("err", err);
      return res.status(400).json({success:false,message:"Github fetching failed"})
    }
  },
);

export default githubRouter;
