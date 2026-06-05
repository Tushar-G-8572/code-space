import express from 'express'
import morgan from 'morgan';
const app = express();
import notifyRoute from './routes/notification.route.js';

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(morgan("dev"));

app.use('/api/notify',notifyRoute);

export default app;