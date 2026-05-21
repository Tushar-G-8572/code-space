import { Router } from "express";
import agent from "../agents/code.agent.js";

const aiRouter = Router();

aiRouter.get('/healthz', (req, res) => {
    res.status(200).json({ success: "ok" })
})

aiRouter.post('/invoke', async (req, res) => {
    try {
        const { message, projectId } = req.body || {};
        if (typeof projectId === 'undefined') {
            return res.status(400).json({ error: 'projectId is required' });
        }
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });
        const response = await agent.stream({
            messages: [
                {
                    role: "user",
                    content: message
                }
            ]
        }, {
            context: {
                projectId: projectId
            },
            streamMode: "custom"
        })
        for await (const chunk of response) {
            console.log(chunk);
            res.write(`data:${chunk}\n\n`)
        }
        res.json({ response });
    } catch (err) {
        console.log("Error invoking Agent", err);
        return res.status(500).json({ message: "Error while invoking" })
    }
})

export default aiRouter