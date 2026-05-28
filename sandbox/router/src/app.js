import express from 'express';
import morgan from 'morgan';
import { createProxyMiddleware } from "http-proxy-middleware";
import http from 'http';

const app = express();
app.use(morgan('combined'));

app.get('/api/router/healthz', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/api/router/readyz', (req, res) => res.status(200).json({ status: 'ready' }));

const proxies = {};
const agentProxies = {};

function getProxy(sandboxId) {
    if (!proxies[sandboxId]) {
        proxies[sandboxId] = createProxyMiddleware({
            target: `http://sandbox-service-${sandboxId}`,
            changeOrigin: true,
            ws: true,  // ← key flag
        });
    }
    return proxies[sandboxId];
}

function getAgentProxy(sandboxId) {
    if (!agentProxies[sandboxId]) {
        agentProxies[sandboxId] = createProxyMiddleware({
            target: `http://sandbox-service-${sandboxId}:3000`,
            changeOrigin: true,
            ws: true,  // ← key flag
        });
    }
    return agentProxies[sandboxId];
}

app.use((req, res, next) => {
    const host = req.headers.host;
    if (!host) return next();

    const parts = host.split('.');
    const sandboxId = parts[0];
    const type = parts[1];

    if (type === 'agent') return getAgentProxy(sandboxId)(req, res, next);
    if (type === 'preview') return getProxy(sandboxId)(req, res, next);
    next();
});

const server = http.createServer(app);

// Single upgrade handler using http-proxy-middleware's own .upgrade()
server.on('upgrade', (req, socket, head) => {
    const host = req.headers.host;
    if (!host) { socket.destroy(); return; }

    socket.on('error', () => socket.destroy());

    const parts = host.split('.');
    const sandboxId = parts[0];
    const type = parts[1];

    console.log(`WS upgrade → sandboxId: ${sandboxId}, type: ${type}`);

    if (type === 'agent') {
        getAgentProxy(sandboxId).upgrade(req, socket, head);
    } else if (type === 'preview') {
        getProxy(sandboxId).upgrade(req, socket, head);
    } else {
        socket.destroy();
    }
});

export default server;