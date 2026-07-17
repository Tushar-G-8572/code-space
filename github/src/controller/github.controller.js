import githubUserModel from "../model/user.model.js";
import { createToken } from "../utils/jwt.js";

export async function githubCallback(req, res) {
  try {
    const { githubId, username, displayName, avatar, accesstoken } = req.user;

    const user = await githubUserModel.findOneAndUpdate(
      { githubId },
      { githubId, username, displayName, avatar, githubAccessToken: accesstoken },
      { upsert: true, new: true }
    );

    const appToken = createToken(user._id);

    res.cookie('appToken', appToken, { httpOnly: true, secure: true, sameSite: 'lax' });

    return res.status(200).json({
      success: true,
      message: "Github loggedIn",
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        githubId: user.githubId
      }
    });
  } catch (err) {
    console.log("err", err);
    return res.status(400).json({ success: false, message: "Github fetching failed" });
  }
}

export async function getAllRepo(req,res) {

 const user = await githubUserModel.findOne({githubId:'178663251'})

 try{
  const response = await fetch( "https://api.github.com/user/repos?visibility=public&sort=updated&per_page=100",{
   headers:{
    Authorization: `Bearer ${user.githubAccessToken}`,
    Accept: "application/vnd.github+json",
   }
  })

  const repos = await response.json()
  
    const simplified = repos.map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      defaultBranch: r.default_branch,
      private: r.private,
      updatedAt: r.updated_at,
      cloneUrl: r.clone_url,
    }));

    return res.status(200).json({ success: true,repos:simplified});

 }catch(err){
  console.log(err);
  return res.status(400).json({success:false,message:"error while fetching repositories"});
 }
}