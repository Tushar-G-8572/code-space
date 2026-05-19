import express from 'express'
import morgan from 'morgan'
import router from './routes/router.route.js';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

app.use('/api/router',router);

let proxies = {};
let agentProxy = {};

function getAgentProxy(sandboxId){
    const target = `http://sandbox-service-${sandboxId}:3000`;

    if(!agentProxy[sandboxId]){
        agentProxy[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin:true,
            ws:true
        })
    }
    return agentProxy[sandboxId];
}
function getProxy(sandboxId) {
    const target = `http://sandbox-service-${sandboxId}`;

    if (!proxies[sandboxId]) {
        proxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: true,
        })
    }
    return proxies[sandboxId];
}

app.use((req, res, next) => {
    const host = req.headers.host;
    const sandboxId = host.split('.')[0];
    if (host.split('.')[1] === 'preview') {
        return getProxy(sandboxId)(req, res, next);
    }
    else if(host.split('.')[1] === 'agent'){
        return getAgentProxy(sandboxId)(req,res,next);
    }
})

export default app;

