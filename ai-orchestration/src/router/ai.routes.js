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
        const writer = (text) => res.write(text);
    //     const response = await agent.stream({
    //         messages: [
    //             {
    //                 role: "user",
    //                 content: message
    //             }
    //         ]
    //     }, {
    //         context: {
    //             projectId: projectId,
    //             writer: writer
    //         },
    //         streamMode: "custom"
    //     })
    //     for await (const chunk of response) {
    //         console.log(chunk);
    //         res.write(`data:${chunk}\n\n`)
    //     }
    //    return res.end(); 
        // res.json({ response });
    
        const stream = await agent.stream(
            {messages:[{role:"user",content:message}]},
            {context:{projectId,writer},streamMode:'values'}
        )
        let lastState = null;
        for await (const state of stream){
            lastState = state;
        }
        if(lastState?.messages?.length){
            const msgs = lastState.messages;
            for (let i = msgs.length - 1; i >= 0; i--) {
                const m = msgs[i];
                const role = m.role ?? m._getType?.();
                if ((role === 'ai' || role === 'assistant') && !m.tool_calls?.length) {
                    const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
                    res.write(content + '\n');
                    break;
                }
            }
        }
        res.end()
    } catch (err) {

        console.log("Error invoking Agent", err);
        if (res.headersSent) { res.end(); }
        else { res.status(500).json({ error: "Failed to invoke agent" });
    }
        res.end();
        return res.status(500).json({ message: "Error while invoking" })
    }
})

export default aiRouter