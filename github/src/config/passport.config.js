import 'dotenv/config'
import passport from "passport";
import { Strategy as GitHubStrategy } from 'passport-github2';

export default function configPassport(){
 passport.use(new GitHubStrategy({
 clientID:process.env.GITHUB_CLIENT_ID,
 clientSecret:process.env.GITHUB_CLIENT_SECRET,
 callbackURL:"http://localhost:3000/api/github/signin/callback"
},(accesstoken,refreshtoken,profile,done)=>{
 const user = {
      githubId: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      avatar: profile.photos?.[0]?.value,
      accesstoken 
    };
 return done(null,user);
}))
}