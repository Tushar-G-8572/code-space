import 'dotenv/config'
import express from 'express'
import authRouter from './routes/auth.route.js';
import morgan from 'morgan';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cors from 'cors'

const app = express();
app.use(morgan('dev'))

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(passport.initialize());

app.use(cors({
 origin:"*",
 credentials:true,
 methods: [ 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS' ],
}))

passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"http://localhost:5173/api/auth/google/callback"
},(accessToken,refreshToken,profile,done)=>{
    return done(null, profile);
}))

app.set('trust proxy', 1);
app.get("/_status/healthz", (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get("/_status/readyz", (req, res) => {
    res.status(200).json({ status: 'ready' });
});

app.use('/api/auth',authRouter);

export default app;