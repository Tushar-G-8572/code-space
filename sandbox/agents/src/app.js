import express from 'express'
import morgan from 'morgan'
import agentRouter from './router/agent.routes.js';

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.use('/',agentRouter);

export default app;