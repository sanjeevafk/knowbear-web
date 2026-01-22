# KnowBear Knowledge Engine

AI-powered layered explanations for any topic. Built with FastAPI (Python) and React (TypeScript).

## Features

- **Layered Explanations**: ELI5 to ELI15, meme-style, technical deep dives
- **Multi-Model Ensemble**: Parallel generation with judge-based voting
- **Redis Caching**: 24-hour TTL for fast repeat queries
- **Export Options**: Download as .txt, .json, or .pdf
- **Dark Theme UI**: Minimalist design with color-coded complexity levels

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Redis (optional, for caching)

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
GROQ_API_KEY=your_groq_api_key
REDIS_URL=redis://localhost:6379
VITE_API_URL=http://localhost:8000
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Testing

### Backend Tests

```bash
cd backend
pip install pytest pytest-asyncio
pytest -v
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Linting

```bash
# Backend
cd backend
pip install black pylint
black --check .
pylint app/

# Frontend
cd frontend
npm run lint
npm run format:check
```

## Build

```bash
cd frontend
npm run build
```

## Deployment (Render)

### Prerequisites
- GitHub account
- Render account (https://render.com)
- Redis instance (free:  https://redis.com/try-free/)

### Steps

1. **Push to GitHub**:
   ```bash
   git add -A
   git commit -m "deployment: prepare for Render"
   git push origin main
   ```

2. **Deploy Backend API**:
   - Go to https://dashboard.render.com
   - Click "New+" → "Web Service"
   - Connect GitHub repo:  `voidcommit-afk/KnowBear`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
   - Click "Create Web Service"

3. **Set Environment Variables** (in Render Dashboard):
   ```
   ENVIRONMENT=production
   REDIS_URL=<your-redis-url>
   GROQ_API_KEY=<your-groq-key>
   GEMINI_API_KEY=<your-gemini-key>
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_ANON_KEY=<your-anon-key>
   ALLOWED_ORIGINS=https://<your-domain>.onrender.com
   ```

4. **Verify Deployment**:
   ```bash
   curl https://<your-service>.onrender.com/health
   ```

See `.env.example` for complete list of required variables.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pinned` | GET | Curated popular topics |
| `/api/query` | POST | Generate explanations |
| `/api/export` | POST | Export as file |
| `/health` | GET | Health check |

## Architecture

```
KnowBear/
├── backend/           # FastAPI server
│   ├── app/
│   │   ├── main.py    # App entry
│   │   ├── routers/   # API endpoints
│   │   └── services/  # Business logic
│   └── tests/         # pytest tests
├── frontend/          # React app
│   ├── src/
│   │   ├── components/
│   │   └── tests/     # Vitest tests
└── vercel.json        # Deployment config
```


