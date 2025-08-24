# 🤖 IzzyBot - A Chatbot Agent Platform

A modular chatbot system built by using **Node.js (Express) + TypeScript** for the Backend and **React + TypeScript** for the Frontend. It integrates **LLM (OpenAI gpt-4o-mini) + RAG (LangChain)** for intelligent responses with robust **Input Sanitization**, **Error Handling** and **Advanced Caching (Redis)**. It is designed with Security, Observability and Scalability in mind and supports local or cloud deployment via **Docker** and **Kubernetes**.

> _This README provides a technical explanation on project aspects such as Architecture, Configuration, Build & Run, Workflow, Security, Agents (RouterAgent, MathAgent and KnowledgeAgent) with their expected input and output in JSON format, and ultimately Ports & Endpoints map._

---

## ⚡ Quick Start (Local Deployment)

1) **Clone the repository**
~~~bash
git clone https://github.com/JeffersonCanuto/IzzyBot.git
cd IzzyBot/
~~~

2) **Create the following file in the root directory (IzzyBot/):  `.env`.**

> Use **.env.example** file as reference.

~~~bash
# ============================================
# Shared infrastructure between environments
# ============================================

# Client and Server ports for prod environment
IZZYBOT_CLIENT_INNER_PORT_PROD=5173
IZZYBOT_CLIENT_OUTER_PORT_PROD=8080
IZZYBOT_SERVER_INNER_PORT_PROD=3000
IZZYBOT_SERVER_OUTER_PORT_PROD=3000

# Client and Server ports for dev environment
IZZYBOT_CLIENT_INNER_PORT_DEV=5173
IZZYBOT_CLIENT_OUTER_PORT_DEV=8081
IZZYBOT_SERVER_INNER_PORT_DEV=3000
IZZYBOT_SERVER_OUTER_PORT_DEV=5000

# Optional parameters
DOCKER_NETWORK=izzybot-network
~~~

3) **Create the following files in the client folder: `.env.development`, `.env.production` and `.env.test`.**

> Use **.env.development.example**, **.env.production.example** and **.env.test.example** files as references.

~~~bash
# =======================
# Client general settings
# =======================

# API connection settings
VITE_API_URL=localhost
VITE_API_PORT=3000
~~~

4) **Create the following files in the server folder: `.env.development`, `.env.production` and `.env.test`.**

> Use **.env.development.example**, **.env.production.example** and **.env.test.example** files as references.

~~~bash
# =======================
# Server general settings
# =======================

# Server settings
PORT=3000
HOST=localhost
INFINITE_PAY_INDEX_DIR=data/infinitepay_index

# Outer API Keys
OPEN_AI_API_KEY=sk-proj-... (CREATE AND USE YOUR OWN OPENAI API KEY)
~~~

> Create an OpenAI API Key: https://platform.openai.com/settings/organization/api-keys
> 
> Add credit in order to use it: https://platform.openai.com/settings/organization/billing/overview

5) **Run with Docker Compose**

- First off, make sure you have both [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

- Then, you can spin up the system in different environments: Development, Production or Test.

- For Development, just run:
  
~~~bash
docker-compose -f docker-compose.dev.yml up -d
~~~

- For Production, just run:

~~~bash
docker-compose -f docker-compose.prod.yml up -d
~~~

- For Test, just run:

~~~bash
docker-compose -f docker-compose.test.yml up -d
~~~

6) **Open the Frontend**
- Visit: http://localhost:8081 (For Development Environment)
- Or visit: http://localhost:8080 (For Production Enviroment)
- Start interacting with IzzyBot via chat messages 🎉

> Notes:
> 
> **Services (defaults):**
> 
> **Backend API** → Development: http://localhost:5000  | Production: http://localhost:3000
> 
> **Frontend UI** → Development: http://localhost:8081 | Production: http://localhost:8080
> 
> **Redis** → Development: http://localhost:6379 | Production: http://localhost:6379

---

## 🧭 Table of Contents

- [Architecture Overview (Router, Agents, Logs, Redis)](#-architecture-overview-router-agents-logs-redis)
- [Running IzzyBot application using Kubernetes (K8s)](#️-running-izzybot-application-using-kubernetes)
- [Example of Structured Logs for Observability (JSON)](#-example-of-structured-logs-for-observability-json)
- [Security: Sanitization & Prompt Injection Protection](#-security-sanitization--prompt-injection-protection)
- [Ports & Endpoints](#-ports--endpoints)
- [Future Improvements](#-future-improvements-izzybot-v2)

---

## 🏗️ Architecture Overview (Router, Agents, Logs, Redis)

**Core components: Server side**
- **RouterAgent** → Entry point that implements an internal logic to route each message to the right agent (MathAgent or KnowledgeAgent).
- **MathAgent** → Handles math queries from common symbols (`+`, `-`, `*`, `/`) or word-based operators (plus, times, divided by, etc).
- **KnowledgeAgent** → Handles InfinitePay-related user queries based on LLM (OpenAI) + vectorized RAG content that is stored locally.
- **Logs** → Structured JSON logs created in each step of the user message processing by the Agent for observability purpose (see examples).
- **Redis** → Caching method used to persist conversations and messages history and display it whenever an user loads the application.

**High-Level Flow**
~~~mermaid
flowchart LR
    User --> Frontend --> RouterAgent
    RouterAgent -->|Mathematical Query| MathAgent
    RouterAgent -->|InfinitePay Query| KnowledgeAgent
    RouterAgent --> Logs
    RouterAgent --> Redis
~~~

**Typical Workflow**
1. **Frontend** sends `{ message, user_id, conversation_id }` for an **API** endpoint that triggers **RouterAgent**.
2. **RouterAgent** inspects the message content and chooses to forward it to **MathAgent** or **KnowledgeAgent**.
3. **MathAgent** generates a prompt message for the LLM (OpenAI) based on the user's mathematical operation input.
4. **KnowledgeAgent** generates a prompt message for the LLM (OpenAI) based on the user input + vectorized RAG content.
5. **Backend** returns the LLM (OpenAI) answer for the **Frontend** and emits **JSON logs** in each step for observability purpose.
6. **Frontend** updates the user interface with the LLM response generated by either MathAgent or KnowledgeAgent.

---

## ☸️ Running IzzyBot application using Kubernetes

> Assumes you have a kubeconfig pointing to a cluster (kind, minikube, or managed k8s).

### 1) Apply Manifests
~~~bash
kubectl apply -f k8s/
~~~

This typically creates:
- **Deployments**: `backend`, `frontend`, `redis`
- **Services**: cluster IPs and/or NodePorts
- **ConfigMaps/Secrets**: environment & credentials

### 2) Check Status
~~~bash
kubectl get pods
kubectl get svc
kubectl logs deploy/backend
~~~

### 3) Access the App
- If using **NodePort**:  
  Find the NodePort of the frontend service:
  ~~~bash
  kubectl get svc frontend -o wide
  ~~~
  Then open `http://<node-ip>:<nodeport>`

- If using **Ingress** (recommended):  
  Point your DNS/hosts to the ingress controller address and open the configured host (e.g., `http://chatbot.local`).

---

## 📜 Example of Structured Logs for Observability (JSON)

**Routing Event**
~~~json
{
  "timestamp": "2025-08-07T14:32:12Z",
  "module": "RouterAgent",
  "event": "agent_routed",
  "user_id": "client789",
  "conversation_id": "conv-1234",
  "target_agent": "MathAgent",
  "message": "How much is 65 x 3.11?"
}
~~~

**Knowledge Index Build**
~~~json
{
  "timestamp": "2025-08-07T14:40:10Z",
  "module": "buildInfinitePayIndex",
  "event": "index_built",
  "indexDir": "server/data/infinitepay_index",
  "documents_processed": 124
}
~~~

**Agent Response**
~~~json
{
  "timestamp": "2025-08-07T14:41:05Z",
  "module": "MathAgent",
  "event": "agent_response",
  "conversation_id": "conv-1234",
  "input": "How much is 65 x 3.11?",
  "output": "65 × 3.11 = 202.15"
}
~~~

> All logs are single-line JSON (great for ELK/Datadog). In production, prefer `new Date().toISOString()` (UTC).

---

## 🔒 Security: Sanitization & Prompt Injection Protection

**Input Sanitization**
- Normalize Unicode (e.g., **NFKC**), trim whitespace, collapse control chars.
- Escape/strip dangerous characters before logging or templating.
- Enforce max length to avoid abuse (truncate with notice).

**Prompt Injection Protection**
- **Heuristics**: Flag phrases like “_ignore previous instructions_”, “_act as system_”, “_reveal system prompt_”.
- **Allowlist routing**: Only forward to **known agents** with explicit capabilities.
- **Context scoping**: Agents receive **only** the context they need (no raw system prompts).
- **Output gating**: Validate agent output against expected schema (e.g., math result must be numeric).

**Operational Safeguards**
- Rate limiting & basic auth on admin endpoints.
- Secrets via env vars/Secret manager (never in code).
- Structured logging (no PII where not needed).

---

## 🔌 Ports & Endpoints

| Component   | Default Port | Example URL                     | Notes                         |
|-------------|--------------|----------------------------------|-------------------------------|
| Frontend    | 5173         | http://localhost:5173            | Vite dev/served build         |
| Backend API | 3000         | http://localhost:3000            | `/chat`, `/health`, `/logs`   |
| Redis       | 6379         | n/a                              | Internal only (no public exp) |

**Primary API Example**
~~~bash
# POST /chat
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
        "message": "How much is 65 x 3.11?",
        "user_id": "client789",
        "conversation_id": "conv-1234"
      }'
~~~

**Expected Response (example)**
~~~json
{
  "conversation_id": "conv-1234",
  "agent": "MathAgent",
  "reply": "65 × 3.11 = 202.15",
  "latency_ms": 42
}
~~~

---

## 🚀 Future Improvements: IzzyBot V2

- **Add Sign-Up and Login Page** — implement authentication and authorization using **JWT Bearer Tokens**.  
- **Adopt WebSockets over HTTP** — enable real-time communication for smoother chatbot interactions.  
- **Enhance Scalability** — apply **Design Patterns**, **SOLID Principles** and **Performance Optimization**.  
- **Increase Test Coverage** — add unit, integration and functional tests (e.g., **Jest**, **React Testing Library**).  
- **Implement CI/CD Pipelines** — automate builds, deployments and tests with **GitHub Actions** or **GitLab CI/CD**.