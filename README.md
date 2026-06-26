<div align="center">

<h1>⚡ CodeSpace</h1>

<p><strong>An AI-powered, browser-based cloud IDE that provisions isolated React sandboxes on demand — built with Kubernetes, LangChain, and a multi-container microservices architecture.</strong></p>

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" />
  <img src="https://img.shields.io/badge/AWS_EKS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
</p>



</div>

---

## 📌 What is CodeSpace?

CodeSpace is a **Lovable / Replit-inspired cloud IDE** built entirely from scratch. It lets users create and preview React frontends in an isolated, on-demand Kubernetes sandbox — without installing anything locally.

Every session gets its own:
- 🖥️ **Live Vite preview** — hot-reload inside the browser
- 📂 **Monaco code editor** — with full file explorer
- 💬 **AI Copilot** — types code directly into your files via LangChain tool-calling
- 🖥️ **Integrated terminal** — powered by node-pty and xterm.js
- ☁️ **Auto-sync to AWS S3** — workspace persists across sessions

> Built as a capstone to learn production-grade microservices, container orchestration, and AI agent integration.

---

## ✨ Features

-  **On-demand Kubernetes sandbox** — one pod per user, spun up in seconds via `/api/sandbox/start`
-  **AI-driven code editing** — LangChain tool-calling (ListFiles, ReadFiles, UpdateFiles, CreateFiles) edits your live React codebase from a natural-language prompt
-  **Real-time SSE streaming** — AI responses stream live to the browser as tokens arrive
-  **Browser terminal** — full PTY terminal via node-pty + Socket.IO
-  **Live preview** — Vite dev server runs inside each sandbox pod, instantly reflecting file changes
-  **Google OAuth** — Passport.js + JWT access/refresh token flow
-  **Async notifications** — RabbitMQ message queue + Nodemailer sends email on login
-  **S3 workspace sync** — sidecar sync-agent continuously persists `/workspace` to AWS S3
-  **Redis TTL session management** — auto-cleanup after 20 minutes of inactivity
-  **Wildcard ingress routing** — per-sandbox subdomains via Nginx (`*.preview.localhost`, `*.agent.localhost`)

---

## 🏗️ Architecture <a name="architecture"></a>

CodeSpace is composed of **4 independent microservices** plus a **multi-container sandbox pod** provisioned per user.

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER CLIENT                           │
│          React + Monaco + xterm.js + Redux Toolkit              │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Nginx Ingress Controller
          ┌─────────────────┼──────────────────────┐
          ▼                 ▼                       ▼
  ┌───────────────┐  ┌─────────────┐       ┌──────────────────┐
  │  Auth Service │  │ AI Service  │       │  Sandbox Server  │
  │  Passport.js  │  │  LangChain  │       │  K8s Pod Creator │
  │  Google OAuth │  │  Mistral AI │       │  Redis TTL Mgmt  │
  │  JWT + Mongo  │  │  SSE Stream │       │  MongoDB Meta    │
  │  RabbitMQ pub │  └──────┬──────┘       └────────┬─────────┘
  └───────┬───────┘         │                       │ creates
          │                 │ tool calls             ▼
          ▼                 ▼              ┌──────────────────────────────────────┐
  ┌───────────────┐  ┌─────────────┐      │        SANDBOX POD (per user)        │
  │ Notification  │  │  /workspace │      │                                      │
  │   Service     │  │   files     │      │  ┌─────────┐  ┌────────────────────┐ │
  │  RabbitMQ sub │  └─────────────┘      │  │ Init    │  │   Vite Dev Server  │ │
  │  Nodemailer   │                       │  │Container│→ │   (template)       │ │
  └───────────────┘                       │  │ (seeds  │  │   Preview URL      │ │
                                          │  │ /worksp)│  └────────────────────┘ │
                                          │  └─────────┘  ┌────────────────────┐ │
                                          │               │  Agent Sidecar     │ │
                                          │               │  node-pty terminal │ │
  ┌───────────────┐                       │               │  File API          │ │
  │  Router Pod   │                       │               └────────────────────┘ │
  │  Nginx Proxy  │                       │               ┌────────────────────┐ │
  │  *.preview.*  │←──────────────────────│               │  Sync Agent        │ │
  │  *.agent.*    │                       │               │  AWS S3 sync       │ │
  └───────────────┘                       │               └────────────────────┘ │
                                          └──────────────────────────────────────┘
```

### Microservices

| Service | Port | Responsibility |
|---------|------|----------------|
| `auth` | 4001 | Google OAuth, JWT issuance, MongoDB user persistence, RabbitMQ publish |
| `ai-orchestration` | 3000 | LangChain tool-calling, Mistral AI, SSE streaming to browser |
| `notification` | — | RabbitMQ consumer, Nodemailer email on auth events |
| `sandbox/server` | 3000 | K8s pod + service creation, Redis TTL, sandbox metadata |
| `sandbox/router` | 3000 | Nginx reverse proxy, wildcard subdomain routing |
| `sandbox/agent` | 3000 | File CRUD API + node-pty terminal via Socket.IO |
| `sandbox/sync-agent` | — | Watches `/workspace`, syncs to AWS S3 |
| `sandbox/template` | 5173 | Vite React boilerplate seeded into each new sandbox |
| `frontend` | 5173 | React IDE — editor, preview, terminal, AI chat |

---

## 🛠️ Tech Stack

### Backend
| Technology | Usage |
|-----------|-------|
| Node.js + Express.js | All microservices |
| LangChain | AI tool-calling orchestration |
| Mistral AI | LLM model (`mistral-medium-latest`) |
| MongoDB | User data, sandbox metadata |
| Redis | Sandbox TTL + session lifecycle |
| RabbitMQ (amqplib) | Auth → Notification async messaging |
| Passport.js | Google OAuth 2.0 |
| JWT | Access + refresh token auth |
| Socket.IO | Real-time terminal communication |
| node-pty | PTY terminal inside container |
| Nodemailer | Email notifications |
| Morgan | HTTP request logging |

### Frontend
| Technology | Usage |
|-----------|-------|
| React 19 + Vite | Main browser IDE |
| Redux Toolkit | Global state management |
| Monaco Editor | Code editing |
| xterm.js | Browser terminal |
| Tailwind CSS | Styling |

### Infrastructure
| Technology | Usage |
|-----------|-------|
| Kubernetes | Pod orchestration, per-user sandboxes |
| Docker | Container images for all services |
| Skaffold | Local build + deploy dev loop |
| AWS EKS | Production Kubernetes cluster |
| AWS S3 | Workspace file persistence |
| Nginx Ingress | Wildcard subdomain routing |
| GitHub CI/CD | Automated pipelines |

---

## 📁 Project Structure

```
code-space/
├── auth/                     # Auth microservice
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
├── ai-orchestration/         # AI + LangChain service
│   ├── server.js
│   ├── tools/                # ListFiles, ReadFiles, UpdateFiles, CreateFiles
│   ├── Dockerfile
│   └── package.json
├── notification/             # Email notification service
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
├── sandbox/
│   ├── server/               # K8s pod orchestrator
│   ├── router/               # Nginx proxy + subdomain routing
│   ├── agents/               # File API + PTY terminal
│   ├── sync-agent/           # AWS S3 workspace sync
│   └── template/             # Vite React boilerplate
├── frontend/                 # React IDE
│   └── src/
│       ├── components/       # Editor, Terminal, Preview, AIChat
│       └── store/            # Redux slices
├── k8s/                      # Kubernetes manifests
│   ├── auth-deployment.yml
│   ├── auth-service.yml
│   ├── ai-deployment.yml
│   ├── ai-service.yml
│   ├── sandbox-deployment.yml
│   ├── sandbox-service.yml
│   ├── notification-deployment.yml
│   ├── router-deployment.yml
│   ├── router-service.yml
│   ├── ingress.yml
│   └── rbac.yml
└── skaffold.yml              # Skaffold build/deploy config
```

---

## 🚀 Getting Started <a name="getting-started"></a>

### Prerequisites

- Node.js 20+
- Docker
- Kubernetes cluster (or Minikube locally)
- kubectl configured
- Skaffold installed
- MongoDB instance
- Redis instance
- RabbitMQ instance
- Google OAuth credentials
- Mistral AI API key
- AWS account (for S3 sync)

### 1. Clone the repository

```bash
git clone https://github.com/Tushar-G-8572/code-space.git
cd code-space
```

### 2. Set up environment variables

Create a `.env` file in each service directory. Never commit `.env` files.

**auth/.env**
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
MONGO_URI=your_mongodb_uri
RABBITMQ_URL=amqp://localhost
```

**ai-orchestration/.env**
```env
MISTRALAI_API_KEY=your_mistral_api_key
SANDBOX_SERVICE_URL=http://sandbox-service:3000
```

**notification/.env**
```env
RABBITMQ_URL=amqp://localhost
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

**sandbox/server/.env**
```env
SANDBOX_MONGO_URI=your_mongodb_uri
REDIS_URL=redis://localhost:6379
```

**sandbox/sync-agent/.env**
```env
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_region
S3_BUCKET=your_bucket_name
```

### 3. Run with Skaffold (recommended)

```bash
# Start everything in Kubernetes with hot-reload
skaffold dev
```

### 4. Run locally (without Kubernetes)

Start each service in a separate terminal:

```bash
# Terminal 1 — Auth
cd auth && npm install && npm run dev

# Terminal 2 — AI Orchestration
cd ai-orchestration && npm install && npm run dev

# Terminal 3 — Notification
cd notification && npm install && npm run dev

# Terminal 4 — Sandbox Server
cd sandbox/server && npm install && npm run dev

# Terminal 5 — Sandbox Router
cd sandbox/router && npm install && npm run dev

# Terminal 6 — Sandbox Agent
cd sandbox/agents && npm install && npm run dev

# Terminal 7 — Frontend
cd frontend && npm install && npm run dev
```

### 5. Deploy to Kubernetes manually

```bash
# Apply RBAC first
kubectl apply -f k8s/rbac.yml

# Apply all manifests
kubectl apply -f k8s/

# Check pods are running
kubectl get pods
```

---

## 📡 API Reference

### Auth Service (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/google` | Initiate Google OAuth flow |
| `GET` | `/api/auth/google/callback` | OAuth callback, issues JWT cookie |
| `GET` | `/api/auth/health` | Health check |

### AI Service (`/api/ai`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/agent/invoke` | Invoke AI agent with prompt — streams response via SSE |
| `GET` | `/api/ai/healthz` | Kubernetes health probe |

### Sandbox Service (`/api/sandbox`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/sandbox/start` | Create sandbox pod + service, returns `previewUrl` + `agentUrl` |
| `GET` | `/api/sandbox/health` | Health check |

### Agent Service (inside each sandbox pod)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/list-files` | List all workspace files recursively |
| `GET` | `/read-files?files=a,b` | Read one or more files |
| `PATCH` | `/update-files` | Update existing files |
| `POST` | `/create-files` | Create new files |
| `DELETE` | `/delete-files` | Delete files |
| Socket.IO | `terminal-input` | Send terminal command |
| Socket.IO | `terminal-output` | Receive terminal output |

---

## ⚙️ How a Sandbox Session Works

```
1. User clicks "Create Sandbox"
2. Frontend → POST /api/sandbox/start
3. Sandbox server calls Kubernetes API → creates a Pod + 2 ClusterIP Services
4. Pod starts with:
   └── Init container → seeds /workspace with Vite React boilerplate
   └── Template container → runs Vite dev server (hot-reload preview)
   └── Agent container → exposes file API + PTY terminal via Socket.IO
   └── Sync-agent container → watches /workspace, syncs to AWS S3
5. Server returns:
   previewUrl: http://{sandboxId}.preview.localhost
   agentUrl:   http://{sandboxId}.agent.localhost
6. Router pod handles wildcard subdomain → proxies to correct pod service
7. User types a prompt → Frontend → POST /api/ai/agent/invoke
8. AI reads files via ListFiles + ReadFiles tools
9. AI writes changes via UpdateFiles tool → calls agent service internally
10. Vite hot-reloads → preview updates instantly in browser
11. Redis TTL: after 20 min inactivity → pod + services auto-deleted
```

---

## 🌐 Kubernetes Ingress Routing

| Path | Backend Service |
|------|----------------|
| `/api/auth` | auth-service |
| `/api/ai` | ai-service |
| `/api/sandbox` | sandbox-service |
| `/preview/:sandboxId/*` | router-service |
| `/socket.io` | router-service |
| `*.preview.localhost` | router → sandbox preview container |
| `*.agent.localhost` | router → sandbox agent container |

---

## 🔮 Roadmap

- [ ] Full-stack support (Node.js backend + React frontend sandboxes)
- [ ] Collaborative editing (multiple users per sandbox)
- [ ] Persistent projects (save/load from S3)
- [ ] Custom sandbox templates (Next.js, Vue, Svelte)
- [ ] Usage dashboard and sandbox analytics

---

## 👨‍💻 Author

**Tushar Gupta**
- GitHub: [@Tushar-G-8572](https://github.com/Tushar-G-8572)
- LinkedIn: [tushar-gupta-018805259](https://www.linkedin.com/in/tushar-gupta-018805259/)
- Portfolio: [portfolio-tg-3g81.onrender.com](https://portfolio-tg-3g81.onrender.com)

---

<div align="center">
  <p>If this project helped you or you found it interesting, consider giving it a ⭐</p>
</div>
