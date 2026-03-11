# 🐇 Sales Insight Automator — Rabbitt AI

> **AI-powered sales data analysis.** Upload CSV/XLSX files, get executive summaries delivered to your inbox in seconds.

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start (Docker)](#quick-start-docker)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Security Measures](#security-measures)
- [CI/CD Pipeline](#cicd-pipeline)
- [Deployment](#deployment)
- [Project Structure](#project-structure)

---

## Overview

The **Sales Insight Automator** is a full-stack application built for Rabbitt AI's sales team. It solves the problem of manually analyzing quarterly sales data by automating the entire flow:

1. **Upload** — Team member uploads a `.csv` or `.xlsx` sales data file
2. **AI Analysis** — Google Gemini AI parses the data and generates a professional executive summary
3. **Email Delivery** — The summary is sent directly to the specified email inbox with a beautifully formatted HTML template

---

## Architecture

```
┌─────────────────┐     ┌──────────────────────────────┐     ┌────────────┐
│   React SPA     │────▶│   Express.js API              │────▶│  Gemini AI │
│   (Vite)        │     │   • Multer (file upload)      │     └────────────┘
│                 │◀────│   • Helmet (security headers) │
│   Port: 5173    │     │   • Rate Limiting             │────▶┌────────────┐
└─────────────────┘     │   • Swagger/OpenAPI           │     │  Gmail     │
                        │   Port: 8000                  │     │  (SMTP)    │
                        └──────────────────────────────┘     └────────────┘
```

---

## Tech Stack

| Layer         | Technology              | Purpose                        |
|---------------|-------------------------|--------------------------------|
| Frontend      | React 18 + Vite         | Single-page application        |
| Backend       | Node.js + Express       | REST API server                |
| AI Engine     | Groq (Llama 3.3 70B)   | Sales data analysis            |
| Email         | Nodemailer + Gmail SMTP | HTML email delivery            |
| Docs          | Swagger UI              | Interactive API documentation  |
| Container     | Docker + docker-compose | Containerized deployment       |
| CI/CD         | GitHub Actions          | Automated lint & build checks  |

---

## Quick Start (Docker)

### Prerequisites
- Docker & Docker Compose installed
- Gmail account with [App Password](https://myaccount.google.com/apppasswords) (enable 2FA first)
- [Groq API Key](https://console.groq.com/keys)

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/rabit_ai.git
   cd rabit_ai
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example backend/.env
   ```
   Edit `backend/.env` with your actual keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=your_app_password
   API_KEY=any_random_secret_key
   ```

3. **Start the entire stack:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - 🌐 **Frontend:** http://localhost:3000
   - 📖 **Swagger Docs:** http://localhost:8000/docs
   - ❤️ **Health Check:** http://localhost:8000/api/health

---

## Local Development

### Backend

```bash
cd backend
cp .env.example .env   # Edit with your keys
npm install
npm run dev            # Starts on http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # Starts on http://localhost:5173
```

> The Vite dev server proxies `/api/*` requests to `http://localhost:8000` automatically.

---

## Environment Variables

| Variable            | Required | Description                                    |
|---------------------|----------|------------------------------------------------|
| `GROQ_API_KEY`      | ✅       | Groq API key (Llama 3.3)                       |
| `GMAIL_USER`        | ✅       | Gmail address for sending emails               |
| `GMAIL_APP_PASSWORD`| ✅       | Gmail App Password (not your regular password) |
| `API_KEY`           | ✅       | Secret key for API authentication              |
| `ALLOWED_ORIGINS`   | ❌       | Comma-separated CORS origins (has defaults)    |
| `PORT`              | ❌       | Server port (default: 8000)                    |
| `MAX_FILE_SIZE_MB`  | ❌       | Max upload size in MB (default: 10)            |
| `VITE_API_URL`      | ❌       | Backend URL for frontend (default: '')         |
| `VITE_API_KEY`      | ❌       | API key sent from frontend                     |

### Gmail App Password Setup

1. Go to your Google Account → **Security**
2. Enable **2-Step Verification**
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Generate a new App Password for "Mail"
5. Copy the 16-character password into `GMAIL_APP_PASSWORD`

---

## API Documentation

Interactive Swagger documentation is available at `/docs` when the server is running.

### Endpoints

| Method | Endpoint      | Description                           |
|--------|---------------|---------------------------------------|
| GET    | `/api/health` | Service health check                  |
| POST   | `/api/upload` | Upload file & trigger AI + email flow |
| GET    | `/docs`       | Swagger UI documentation              |

### Example cURL

```bash
curl -X POST http://localhost:8000/api/upload \
  -H "X-API-Key: your_api_key" \
  -F "file=@data/sales_q1_2026.csv" \
  -F "email=manager@company.com"
```

---

## Security Measures

| Measure               | Implementation                                      |
|-----------------------|------------------------------------------------------|
| **Security Headers**  | `helmet` — XSS protection, frame guard, HSTS, etc. |
| **CORS**              | Whitelist-only origins, no wildcard                   |
| **Rate Limiting**     | `express-rate-limit` — 10 req/min per IP on upload   |
| **API Key Auth**      | `X-API-Key` header validation (optional)              |
| **File Validation**   | Whitelist extensions (.csv/.xlsx), 10MB size cap      |
| **Input Sanitization**| Email regex validation, multer file filtering         |
| **Non-root Docker**   | Backend container runs as non-root `appuser`          |
| **Dependency Audit**  | CI pipeline validates dependencies                    |

---

## CI/CD Pipeline

GitHub Actions triggers on every **Pull Request to `main`** and every **push to `main`**:

1. **Backend Job** — Installs deps, lints with ESLint, starts server & runs health check
2. **Frontend Job** — Installs deps, lints with ESLint, builds production bundle
3. **Docker Job** — Builds both Docker images to verify Dockerfiles

---

## Deployment

### Frontend → Vercel
1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add `VITE_API_URL` env var pointing to your backend URL

### Backend → Render
1. Connect your GitHub repo to [Render](https://render.com)
2. Set root directory to `backend`
3. Build command: `npm install`
4. Start command: `node src/server.js`
5. Add all backend env vars from `.env.example`

---

## Project Structure

```
rabit_ai/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express app entry point
│   │   ├── config.js              # Environment configuration
│   │   ├── swagger.js             # OpenAPI/Swagger config
│   │   ├── middleware/
│   │   │   └── auth.js            # API key validation
│   │   ├── routes/
│   │   │   ├── health.js          # GET /api/health
│   │   │   └── upload.js          # POST /api/upload
│   │   └── services/
│   │       ├── aiService.js       # Google Gemini integration
│   │       ├── emailService.js    # Nodemailer + Gmail SMTP
│   │       └── parserService.js   # CSV/XLSX parser
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Main SPA component
│   │   ├── main.jsx               # React entry point
│   │   ├── index.css              # Premium dark theme
│   │   └── components/
│   │       ├── Header.jsx         # Branding header
│   │       ├── UploadForm.jsx     # Drag & drop + email form
│   │       └── StatusFeedback.jsx # Loading/success/error
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── data/
│   └── sales_q1_2026.csv         # Test data
├── docker-compose.yml
├── .github/workflows/ci.yml      # CI/CD pipeline
├── .env.example
└── README.md
```

---

## 📜 License

MIT License — Built with ❤️ by the Rabbitt AI Engineering Team.
