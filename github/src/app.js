import express from 'express'
import morgan from 'morgan';
import githubRouter from './router/route.js';
import passport from 'passport';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(morgan('dev'));

app.use(passport.initialize());

app.get('/health',(req,res)=>{
 res.status(200).json({message:"OK"})
})

app.use('/api/github',githubRouter);

export default app
