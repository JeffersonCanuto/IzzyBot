# 🤖 IzzyBot - A Chatbot Agent Platform

A modular chatbot system built by using **Node.js (Express) + TypeScript** for the Backend and **React + TypeScript** for the Frontend. It integrates **LLM (OpenAI gpt-4o-mini) + RAG (LangChain)** for intelligent responses with robust **Input Sanitization**, **Error Handling** and **Advanced Caching (Redis)**. It is designed with Security, Observability and Scalability in mind and supports local or cloud deployment via **Docker** and **Kubernetes**.

> _This README provides technical explanation on project aspects such as Architecture, Configuration, Build & Run, Workflow, Security, Agents (RouterAgent, MathAgent and KnowledgeAgent) with their expected input and output in JSON format, and ultimately Ports & Endpoints map._

---

## ⚡ Quick Start (Local Deployment using Docker Compose)

1) **Clone the repository**
~~~bash
git clone https://github.com/JeffersonCanuto/IzzyBot.git
cd IzzyBot/
~~~

2) **Create the following file in the root folter (IzzyBot/):  `.env`.**

> **Use **.env.example** file as reference**.

~~~bash
# ============================================
# Shared infrastructure between environments
# ============================================

# Client and Server ports for prod environment
IZZYBOT_CLIENT_INNER_PORT_PROD=
IZZYBOT_CLIENT_OUTER_PORT_PROD=
IZZYBOT_SERVER_INNER_PORT_PROD=
IZZYBOT_SERVER_OUTER_PORT_PROD=

# Client and Server ports for dev environment
IZZYBOT_CLIENT_INNER_PORT_DEV=
IZZYBOT_CLIENT_OUTER_PORT_DEV=
IZZYBOT_SERVER_INNER_PORT_DEV=
IZZYBOT_SERVER_OUTER_PORT_DEV=

# Client and Server ports for test environment
IZZYBOT_CLIENT_INNER_PORT_TEST=
IZZYBOT_CLIENT_OUTER_PORT_TEST=
IZZYBOT_SERVER_INNER_PORT_TEST=
IZZYBOT_SERVER_OUTER_PORT_TEST=

# Optional parameters
DOCKER_NETWORK=
~~~

> **Make sure to set the ports and network properly, as they're gonna be used later to deploy the Docker containers**.

3) **Create the following folder inside the root directory (IzzyBot/): `certs/`.**

> **The steps here are to create `certs/` folder inside `IzzyBot/` directory**. 

- Create `certs` folder:

~~~bash
mkdir certs
~~~

- Go into certs folder:

~~~bash
cd certs
~~~

- Generate self-signed certificate and key:

~~~bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem -subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=localhost"
~~~

> **This way, both cert.pem and key.pem will be placed inside `IzzyBot/certs`**. 

4) **Create the following files inside the client directory (IzzyBot/client/): `.env.dev`, `.env.prod` and `.env.test`.**

> **Use **.env.dev.example**, **.env.prod.example** and **.env.test.example** files as references**.

~~~bash
# =======================
# Client general settings
# =======================

# API connection settings
VITE_API_HOST=
VITE_API_PORT=
~~~

> **Make sure to set VITE_API_HOST (e.g, localhost) and VITE_API_PORT (e.g, same value as IZZYBOT_SERVER_OUTER_PORT_... from Step 2) properly**.

5) **Create the following files inside the server directory (IzzyBot/server/): `.env.dev`, `.env.prod` and `.env.test`.**

> Use **.env.dev.example**, **.env.prod.example** and **.env.test.example** files as references.

~~~bash
# =======================
# Server general settings
# =======================

# Server settings
CLIENT_OUTER_PORT=
SERVER_INNER_PORT=
APPLICATION_HOST=
REDIS_URL=
INFINITE_PAY_INDEX_DIR=

# Outer API Keys
OPEN_AI_API_KEY=
~~~

> Create an OpenAI API Key: https://platform.openai.com/settings/organization/api-keys
> 
> Add credit in order to use it: https://platform.openai.com/settings/organization/billing/overview

6) **Run with Docker Compose**

- First off, make sure you have both [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

- Then, you can spin up the system in different environments: Development, Production or Test.

- For Development — from the root directory, just run:
  
~~~bash
docker-compose -f docker-compose.dev.yml up -d
~~~

- For Production — from the root directory, just run:

~~~bash
docker-compose -f docker-compose.prod.yml up -d
~~~

- For Test — from the root directory, just run:

~~~bash
docker-compose -f docker-compose.test.yml up -d
~~~

7) **Open the Frontend**
- Visit: http://localhost:IZZYBOT_CLIENT_OUTER_PORT_DEV (Dev Environment: Port is defined in IzzyBot/.env - Step 2)
- Or visit: http://localhost:IZZYBOT_CLIENT_OUTER_PORT_PROD (Prod Environment: Port is defined in IzzyBot/.env - Step 2)
- Or visit: http://localhost:IZZYBOT_CLIENT_OUTER_PORT_TEST (Test Environment: Port is defined in IzzyBot/.env - Step 2)
- Start interacting with IzzyBot via chat messages 🎉

> Notes:
> 
> **Services (defaults):**
> 
> **Backend API:**
> 
>  Dev: http://localhost:IZZYBOT_SERVER_OUTER_PORT_DEV (Dev Environment: Port is defined in IzzyBot/.env - Step 2)
> 
>  Prod: http://localhost:IZZYBOT_SERVER_OUTER_PORT_PROD (Prod Environment: Port is defined in IzzyBot/.env - Step 2)
> 
>  Test: http://localhost:IZZYBOT_SERVER_OUTER_PORT_TEST (Test Environment: Port is defined in IzzyBot/.env - Step 2)
> 
> **Frontend UI:**
> 
>  Dev: http://localhost:IZZYBOT_CLIENT_OUTER_PORT_DEV (Dev Environment: Port is defined in IzzyBot/.env - Step 2)
>  
>  Prod: http://localhost:IZZYBOT_CLIENT_OUTER_PORT_PROD (Prod Environment: Port is defined in IzzyBot/.env - Step 2)
>  
>  Test: http://localhost:IZZYBOT_CLIENT_OUTER_PORT_TEST (Test Environment: Port is defined in IzzyBot/.env - Step 2)
> 
> **Redis:** Redis is an internal service used to perform advanced caching (data persistence) and so it should not be publicly accessible.

---

## 🧭 Table of Contents

- [Architecture Overview (Router, Agents, Logs, Redis)](#architecture-overview-router-agents-logs-redis)
- [Running IzzyBot application using Kubernetes (K8s)](#️-running-izzybot-application-using-kubernetes)
- [Example of Structured Logs for Observability (JSON)](#-example-of-structured-logs-for-observability-json)
- [Security (XSS/HTML protection)](#-security-xsshtml-protection)
- [Ports & Endpoints](#-ports--endpoints)
- [Future Improvements](#-future-improvements-izzybot-v2)

---

## 🏗️ Architecture Overview (Router, Agents, Logs, Redis)

**Core components**
- **RouterAgent** → Entrypoint that implements a RegEx logic to route each message to the right agent (MathAgent or KnowledgeAgent).
- **MathAgent** → Handles math queries from common symbols (`+`, `-`, `*`, `/`) or word-based operators (mais, menos, vezes, etc).
- **KnowledgeAgent** → Handles InfinitePay-related user queries based on LLM (OpenAI) + vectorized RAG content that is stored locally.
- **Logs** → Structured JSON logs created in each step of the user message processing by the Agent for observability purpose (see examples).
- **Redis** → Caching method used to persist conversations and messages history and display them whenever IzzyBot application first renders.

**High-Level Workflow**
~~~mermaid
flowchart LR
    User --> Client --> RouterAgent
    RouterAgent -->|Mathematical Query| MathAgent
    RouterAgent -->|InfinitePay Query| KnowledgeAgent
    RouterAgent --> Logs
    RouterAgent --> Redis
~~~

**Main Workflow**
1. **Client** makes a request to an **API** endpoint sending payload as `{ message, user_id, conversation_id }`, which triggers **RouterAgent**.
2. **RouterAgent** inspects the user's message and uses a RegEx-based rule to decide where to forward it: **MathAgent** or **KnowledgeAgent**.
3. **MathAgent** generates a prompt message for the LLM (OpenAI) based on the user's math expression input and retrieves the answer.
4. **KnowledgeAgent** generates a message for the LLM (OpenAI) based on the user input + InfinitePay's RAG content and retrieves the answer.
5. **RouterAgent** retrieves the response from either **MathAgent** or **KnowledgeAgent**, cache it on Redis along with the user input message.
6. **API** endpoint returns the **RouterAgent** answer for the **Client** and emits **JSON logs** in each step of the process for observability purpose.
7. **Client** updates the user interface (ChatPage) with the LLM response generated by **RouterAgent** from **MathAgent** or **KnowledgeAgent**.

---

## ☸️ Running IzzyBot using Kubernetes

### 1) Install a Kubernetes cluster locally

- Install kubectl

~~~bash
curl -LO "https://dl.k8s.io/release/$(curl -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
kubectl version --client
~~~

- Install minikube

~~~bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
minikube version
~~~

- Start a cluster

~~~bash
minikube start --driver=docker
kubectl get nodes
~~~

- Enable required addons

~~~bash
minikube addons enable ingress
~~~

- Run minikube tunnel (IN A SEPARATE TERMINAL)

~~~bash
minikube tunnel
~~~

### 2) Build & Run

~~~bash
# 1) Switch Docker CLI to Minikube's Docker daemon
eval $(minikube -p minikube docker-env)

# 2) Build Docker images inside Minikube
docker build -f client/Dockerfile.prod -t client:prod ./client
docker build -f server/Dockerfile.prod -t server:prod ./server

# 3) Apply Kubernetes manifests in the correct order

# Redis
kubectl apply -f k8s/redis/pvc.yaml
kubectl apply -f k8s/redis/service.yaml
kubectl apply -f k8s/redis/deployment.yaml

# Server
kubectl apply -f k8s/server/configmap.yaml
kubectl apply -f k8s/server/secret.yaml
kubectl apply -f k8s/server/service.yaml
kubectl apply -f k8s/server/deployment.yaml
kubectl apply -f k8s/server/ingress.yaml

# Client
kubectl apply -f k8s/client/configmap.yaml
kubectl apply -f k8s/client/service.yaml
kubectl apply -f k8s/client/deployment.yaml
kubectl apply -f k8s/client/ingress.yaml
~~~

### 3) Check Status
~~~bash
kubectl get pods
kubectl get svc
kubectl get ingress
kubectl logs <pod-name>
~~~

---

## 📜 Example of Structured Logs for Observability (JSON)

**RouterAgent**
~~~json
{
  "utc_timestamp":"2025-08-28T17:34:40.182Z",
  "level":"INFO",
  "agent":"RouterAgent",
  "event":"handle_user_message",
  "conversation_id":"3f0be6b9-2d83-468f-86c4-196e2f9eb11c",
  "user_id":"9982d2a2-45be-4be8-a75a-2fdb265b4dca",
  "decision":"MathAgent",
  "message":"Quanto é 4 + 4?",
  "response":"A resposta é: 8. Fácil! 😎",
  "execution_time_ms":3682
}
~~~

**MathAgent**
~~~json
{
  "utc_timestamp":"2025-08-28T17:36:42.215Z",
  "level":"INFO",
  "agent":"MathAgent",
  "event":"handle_user_message",
  "message":"Quanto é 4 + 4?",
  "response":"8.",
  "execution_time_ms":1676
}
~~~

**KnowledgeAgent**
~~~json
{
  "utc_timestamp":"2025-08-28T17:42:07.282Z",
  "level":"INFO",
  "agent":"KnowledgeAgent",
  "event":"handle_user_message",
  "message":"Qual a taxa da maquininha?",
  "response":"As taxas da maquininha da InfinitePay começam a partir de 0,75% e o recebimento pode ser feito na hora ou em 1 dia útil.",
  "execution_time_ms":4834
}
~~~

> All logs are single-line JSON — great for log observability tools such as ELK and Datadog.

---

## 🔒 Security (XSS/HTML protection)

**Input Sanitization (DOMPurify)**
- Removes malicious HTML tags (e.g., `<script>`, `<iframe>`)  .
- Strips dangerous attributes (e.g., `onerror=`, `javascript:` URLs).  
- Neutralizes DOM clobbering attempts and browser-specific quirks.
- Ensures clean, safe HTML output for rendering.

---

## 🔌 Service Ports & Endpoints

> The ports defined below are the default ones. The real ones to access Frontend and Backend services are set in IzzyBot/.env (Step 2).

| Component   | Default Port | Example URL                     |  Notes                         |
|-------------|--------------|----------------------------------|-------------------------------|
| Frontend    | 5173         | http://localhost:5173            | Vite dev/served build        |
| Backend API | 3000         | http://localhost:3000            | `/chat`, `/chat/conversations`, `/chat/labels`   |
| Redis       | 6379         | N/A                              | Internal only (not publicly accessible) |

**API Request Example - MathAgent**
~~~bash
# POST /chat
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
        "message": "Quanto é 65 * 3.11?",
        "user_id": "9982d2a2-45be-4be8-a75a-2fdb265b4dca",
        "conversation_id": "3f0be6b9-2d83-468f-86c4-196e2f9eb11c"
      }'
~~~

**Expected Response**
~~~json
{
  "response": "A resposta é: 202.15. Fácil! 😎",
  "source_agent_response": "202.15.",
  "agent_workflow": [
    { "agent": "RouterAgent", "decision": "MathAgent" },
    { "agent": "MathAgent" }
  ]
}
~~~

**API Request Example - KnowledgeAgent**

~~~bash
# POST /chat
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
        "message": "Qual a taxa da maquininha?",
        "user_id": "9982d2a2-45be-4be8-a75a-2fdb265b4dca",
        "conversation_id": "3f0be6b9-2d83-468f-86c4-196e2f9eb11c"
      }'
~~~

**Expected Response**
~~~json
{
  "response": "Aqui está o que encontrei nos artigos da Central de Ajuda da InfinitePay: As taxas da maquininha da InfinitePay começam a partir de 0,75% e o recebimento pode ser feito na hora ou em 1 dia útil. Espero ter sido útil! 😊",
  "source_agent_response": "As taxas da maquininha da InfinitePay começam a partir de 0,75% e o recebimento pode ser feito na hora ou em 1 dia útil.",
  "agent_workflow": [
    { "agent": "RouterAgent", "decision": "KnowledgeAgent" },
    { "agent": "KnowledgeAgent" }
  ]
}
~~~

---

## 🚀 Future Improvements: IzzyBot V2

- **Responsive Design** - resolve general layout bugs spot on IzzyBot V1 for different screen sizes.
- **Add Sign-Up and Login Page** — implement authentication and authorization using **JWT Bearer Tokens**.  
- **Adopt WebSockets over HTTP** — enable real-time communication for smoother chatbot interactions.  
- **Enhance Scalability** — apply **Design Patterns**, **SOLID Principles** and **Performance Optimization**.  
- **Increase Test Coverage** — add unit and integration/functional tests (e.g., **Jest** and **React Testing Library**).  
- **Implement CI/CD Pipelines** — automate builds, deployments and tests with **GitHub Actions** or **GitLab CI/CD**.