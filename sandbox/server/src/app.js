import express from 'express'
import morgan from 'morgan'
import sandboxRoute from './router/sandbox.route.js';

const app = express();

app.use(morgan('dev'));

app.use('/api/sandbox',sandboxRoute);

export default app;