import { Router } from "express";
import { sendEmail } from "../config/email.js";
import channel from "../config/mq.js";

const notifyRoute = Router();

notifyRoute.get('/healthz',(req,res)=>{
 res.status(200).json({success:true,message:"Notify Healthz"})
})

notifyRoute.get('/readyz',(req,res)=>{
 res.status(200).json({success:true,message:"Notify readyz"})
})



channel.consume('auth_notification_queue', async (msg) => {

    if (msg !== null) {
        const messageContent = msg.content.toString();
        console.log('Received message from queue:', messageContent);

        try {
            console.log(JSON.parse(messageContent))
            const { userId, timestamps, email } = JSON.parse(messageContent);
            
            const subject = 'New Login Notification';
            const text = `A new login was detected for your account at ${timestamps}. If this was not you, please secure your account immediately.`;
            const html = `<p>A new login was detected for your account at <strong>${timestamps}</strong>. If this was not you, please secure your account immediately.</p>`;

            await sendEmail(email, subject, text, html);
            
            channel.ack(msg);
        } catch (error) {
            console.error('Error processing message:', error);
            // Optionally, you can choose to nack the message to requeue it
            // channel.nack(msg);
        }
    } else {
        console.log('Received null message');
    }
})

export default notifyRoute;