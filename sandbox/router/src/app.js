import express from 'express'
import morgan from 'morgan'
import { createProxyServer } from 'httpxy';
import {createProxyMiddleware} from 'http-proxy-middleware'
import http from 'http';

const app = express();

app.use(morgan('combined'));

app.get('/api/router/healthz',(req,res)=>{
 res.status(200).json({success:'ok',message:"Router health"});
})

app.get('/api/router/readyz',(req,res)=>{
 res.status(200).json({success:'ok',message:"Router readyz"});
})


let proxies = {};
let agentProxy = {};

function getAgentProxy(sandboxId){
    console.log(sandboxId);
    const target = `http://sandbox-service-${sandboxId}:3000`;

    if(!agentProxy[sandboxId]){
        agentProxy[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin:true,
        })
    }
    return agentProxy[sandboxId];
}
function getProxy(sandboxId) {
    const target = `http://sandbox-service-${sandboxId}:80`;

    if (!proxies[sandboxId]) {
        proxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
        })
    }
    return proxies[sandboxId];
}

// const wsProxy = createProxyServer({ changeOrigin: true });
// wsProxy.on('error', (err, req, socket) => {
//     console.error('[WS ERROR]', err.message);
//     socket?.destroy();
// });

// app.use((req, res, next) => {
//     const host = req.headers.host;
//     const sandboxId = host.split('.')[0];
//     if (host.split('.')[1] === 'preview') {
//         return getProxy(sandboxId)(req, res, next);
//     }
//     else if(host.split('.')[1] === 'agent'){
//         return getAgentProxy(sandboxId)(req,res,next);
//     }
// });

app.use((req, res, next) => {
    const host = req.headers.host || '';
    const parts = host.split('.');
    const sandboxId = parts[0];
    const type = parts[1];

    console.log(`[HTTP] ${req.method} ${req.url} → host: ${host}, type: ${type}, sandbox: ${sandboxId}`);

    if (type === 'preview') {
        return getProxy(sandboxId)(req, res, next);
    } else if (type === 'agent') {
        return getAgentProxy(sandboxId)(req, res, next);
    } else {
        res.status(404).send('Unknown route type');
    }
});

const wsProxy = createProxyServer({ changeOrigin: true });

wsProxy.on('error', (err, req, socket) => {
    console.error('[WS ERROR]', err.message);
    socket?.destroy();
});

wsProxy.on('proxyReqWs', (proxyReq, req, socket, options, head) => {
    console.log(`[WS PROXIED] → ${options.target.host}`);
});

// const server = http.createServer(app);

// server.on('upgrade', (req, socket, head) => {
//     const host = req.headers.host;
//     if (!host) { socket.destroy(); return; }

//     // Prevent EPIPE and connection-reset errors from crashing the process
//     // during the active piped session (after ws() Promise has resolved)
//     socket.on('error', () => socket.destroy());

//     const sandboxId = host.split('.')[ 0 ];
//     const type = host.split('.')[ 1 ];

//     console.log(`WS upgrade request: ${host}, sandboxId: ${sandboxId}, type: ${type}`);

//     if (type === 'agent') {
//         wsProxy.ws(req, socket, { target: `http://sandbox-service-${sandboxId}:3000` }, head)
//             .catch(() => socket.destroy());
//     } else if (type === 'preview') {
//         wsProxy.ws(req, socket, { target: `http://sandbox-service-${sandboxId}` }, head)
//             .catch(() => socket.destroy());
//     } else {
//         socket.destroy();
//     }
// });

// server.on('upgrade', (req, socket, head) => {
//     const host = req.headers.host;
//     if (!host) { socket.destroy(); return; }

//     // Prevent EPIPE and connection-reset errors from crashing the process
//     // during the active piped session (after ws() Promise has resolved)
//     socket.on('error', () => socket.destroy());

//     const sandboxId = host.split('.')[ 0 ];
//     const type = host.split('.')[ 1 ];

//     console.log(`WS upgrade request: ${host}, sandboxId: ${sandboxId}, type: ${type}`);

//     if (type === 'agent') {
//         wsProxy.ws(req, socket, { target: `http://sandbox-service-${sandboxId}:3000` }, head)
//             .catch(() => socket.destroy());
//     } else if (type === 'preview') {
//         wsProxy.ws(req, socket, { target: `http://sandbox-service-${sandboxId}` }, head)
//             .catch(() => socket.destroy());
//     } else {
//         socket.destroy();
//     }
// });

const server = http.createServer(app);

server.on('upgrade', (req, socket, head) => {
    const host = req.headers.host || '';
    if (!host) { socket.destroy(); return; }

    socket.on('error', (err) => {
        console.error('[SOCKET ERROR]', err.message);
        socket.destroy();
    });

    const parts = host.split('.');
    const sandboxId = parts[0];
    const type = parts[1];

    console.log(`[WS UPGRADE] host=${host} type=${type} sandbox=${sandboxId} url=${req.url}`);

    if (type === 'agent') {
        const target = `http://sandbox-service-${sandboxId}:3000`;
        console.log(`[WS] routing agent WS → ${target}`);
        wsProxy.ws(req, socket, head, { target });

    } else if (type === 'preview') {
        const target = `http://sandbox-service-${sandboxId}:80`;
        console.log(`[WS] routing preview WS → ${target}`);
        wsProxy.ws(req, socket, head, { target });

    } else {
        console.warn(`[WS] unknown type "${type}", destroying socket`);
        socket.destroy();
    }
});

export default server;

