# 🎮 Prompt Battle - Deployment Guide

## 📋 Overview

Prompt Battle is a full-stack educational game with:

- **Frontend**: React + TypeScript + Vite (port 8080/5173)
- **Backend**: Node.js + Express + Socket.IO (port 3001)
- **AI Services**: Google Gemini (evaluation) + Stability.ai (image generation)

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- npm or bun
- API Keys (Gemini + Stability.ai)

### 1. Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd Promptbattle

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Configure Environment Variables

**Backend (`server/.env`):**

```bash
cp server/.env.example server/.env
# Edit server/.env and add your API keys:
GEMINI_API_KEY=your_gemini_api_key_here
STABILITY_API_KEY=your_stability_api_key_here
PORT=3001
FRONTEND_URL=http://localhost:8080
```

**Frontend (`.env`):**

```bash
cp .env.example .env
# Edit .env:
VITE_BACKEND_URL=http://localhost:3001
```

### 3. Start Development Servers

**Terminal 1 - Backend:**

```bash
cd server
npm start
# Server runs on http://localhost:3001
```

**Terminal 2 - Frontend:**

```bash
npm run dev
# Frontend runs on http://localhost:8080
```

### 4. Verify Setup

Open browser: http://localhost:8080

Test endpoints:

```bash
# Health check
curl http://localhost:3001/health

# AI evaluation (requires backend running)
curl -X POST http://localhost:3001/api/evaluate-prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test prompt","challenge":"test challenge","levelId":1}'
```

## 🌐 Production Deployment

### Option 1: Separate Hosting (Recommended)

**Backend Deployment (e.g., Railway, Render, Fly.io):**

1. **Set Environment Variables:**

   ```bash
   GEMINI_API_KEY=<your-key>
   STABILITY_API_KEY=<your-key>
   PORT=3001
   FRONTEND_URL=https://your-frontend-domain.com
   NODE_ENV=production
   ```

2. **Start Command:**

   ```bash
   cd server && npm start
   ```

3. **Health Check Endpoint:**
   ```
   GET /health
   ```

**Frontend Deployment (e.g., Vercel, Netlify, Cloudflare Pages):**

1. **Set Environment Variables:**

   ```bash
   VITE_BACKEND_URL=https://your-backend-domain.com
   ```

2. **Build Command:**

   ```bash
   npm run build
   ```

3. **Output Directory:**
   ```
   dist/
   ```

### Option 2: Single Server (VPS, EC2)

1. **Setup with PM2:**

   ```bash
   # Install PM2
   npm install -g pm2

   # Start backend
   cd server
   pm2 start server.js --name promptbattle-backend

   # Build and serve frontend
   cd ..
   npm run build
   pm2 serve dist 8080 --name promptbattle-frontend

   # Save PM2 config
   pm2 save
   pm2 startup
   ```

2. **Nginx Reverse Proxy (Optional):**
   ```nginx
   # Frontend
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:8080;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Socket.IO
       location /socket.io {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```

### Option 3: Docker Deployment

**Backend Dockerfile:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --production
COPY server/ ./
EXPOSE 3001
CMD ["node", "server.js"]
```

**Frontend Dockerfile:**

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

**Docker Compose:**

```yaml
version: "3.8"
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - STABILITY_API_KEY=${STABILITY_API_KEY}
      - FRONTEND_URL=http://localhost:8080
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "8080:80"
    environment:
      - VITE_BACKEND_URL=http://localhost:3001
    depends_on:
      - backend
    restart: unless-stopped
```

## 🔑 Getting API Keys

### Google Gemini API

1. Visit: https://aistudio.google.com/app/apikey
2. Create new API key
3. Copy to `GEMINI_API_KEY` in server/.env

### Stability.ai API

1. Visit: https://platform.stability.ai/account/keys
2. Create new API key
3. Copy to `STABILITY_API_KEY` in server/.env

## 📊 Environment Variables Reference

### Backend (server/.env)

| Variable            | Required      | Description                 | Example         |
| ------------------- | ------------- | --------------------------- | --------------- |
| `GEMINI_API_KEY`    | ✅ Yes        | Google Gemini API key       | AIzaSy...       |
| `STABILITY_API_KEY` | ✅ Yes        | Stability.ai API key        | sk-...          |
| `PORT`              | ❌ No         | Server port (default: 3001) | 3001            |
| `FRONTEND_URL`      | ⚠️ Production | Frontend URL for CORS       | https://app.com |
| `NODE_ENV`          | ❌ No         | Environment mode            | production      |

### Frontend (.env)

| Variable           | Required      | Description     | Example         |
| ------------------ | ------------- | --------------- | --------------- |
| `VITE_BACKEND_URL` | ⚠️ Production | Backend API URL | https://api.com |

## 🧪 Testing Deployment

### Backend Tests

```bash
# Health check
curl https://your-backend.com/health

# Prompt evaluation
curl -X POST https://your-backend.com/api/evaluate-prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test","challenge":"Test","levelId":1}'

# Socket.IO connection (check browser console)
# Should see: ✅ Connected to server
```

### Frontend Tests

1. **Home Page**: Should load with animations
2. **Multiplayer**: Create room → Join with second tab → Test game
3. **Solo Arena**: Submit prompt → Verify AI evaluation works
4. **Image Generation**: Play multiplayer round → Check images load

## 🔧 Troubleshooting

### Backend Issues

**Port already in use:**

```bash
# Find process
lsof -i :3001
# Kill process
kill -9 <PID>
```

**API key errors:**

```bash
# Check .env file exists
ls -la server/.env

# Verify keys are loaded
node -e "require('dotenv').config({path:'server/.env'}); console.log(process.env.GEMINI_API_KEY ? 'OK' : 'MISSING')"
```

**CORS errors:**

```bash
# Add frontend URL to server/.env
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend Issues

**Backend connection failed:**

```bash
# Check VITE_BACKEND_URL in .env
cat .env | grep VITE_BACKEND_URL

# Verify backend is accessible
curl https://your-backend.com/health
```

**Build fails:**

```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

## 📁 Project Structure

```
Promptbattle/
├── src/                      # Frontend React app
│   ├── components/          # React components
│   │   ├── Arena.tsx        # Solo arena (AI evaluation)
│   │   ├── scribble/        # Multiplayer game components
│   │   └── ui/              # shadcn/ui components
│   ├── contexts/            # React contexts (Socket.IO)
│   ├── pages/               # Page components
│   └── lib/                 # Utilities
├── server/                  # Backend Node.js server
│   ├── server.js           # Express + Socket.IO server
│   ├── gameManager.js      # Multiplayer game logic
│   ├── imageGenerator.js   # Stability.ai integration
│   ├── promptEvaluator.js  # Gemini AI evaluation
│   ├── .env                # Backend environment variables
│   └── package.json        # Backend dependencies
├── public/                  # Static assets
├── .env                     # Frontend environment variables
├── package.json            # Frontend dependencies
└── vite.config.ts          # Vite configuration
```

## 🎯 Features Checklist

- ✅ Multiplayer prompt battle with Socket.IO
- ✅ Real-time AI image generation (Stability.ai SDXL)
- ✅ Solo arena with AI prompt evaluation (Gemini)
- ✅ 5 difficulty levels with unique challenges
- ✅ XP system and leaderboard
- ✅ 30-second timer for rounds
- ✅ Vote-based winner selection
- ✅ Responsive UI with animations
- ✅ Error handling and fallbacks
- ✅ Production-ready configuration

## 🔒 Security Considerations

1. **Never commit .env files** - Already in .gitignore ✅
2. **Use HTTPS in production** - Configure SSL certificate
3. **Rate limiting** - Consider adding rate limits to API endpoints
4. **Input validation** - Already implemented for prompts
5. **CORS** - Properly configured with allowed origins
6. **API key rotation** - Rotate keys periodically

## 📝 Maintenance

### Updating Dependencies

```bash
# Frontend
npm update
npm audit fix

# Backend
cd server
npm update
npm audit fix
```

### Monitoring

- Check server logs: `pm2 logs promptbattle-backend`
- Monitor API usage on Gemini/Stability dashboards
- Set up health check monitoring (e.g., UptimeRobot)

### Backup

- Database: Not required (uses localStorage)
- Environment files: Securely backup .env files
- Code: Regular git commits

## 🆘 Support

- GitHub Issues: [Your repo URL]
- Documentation: See SOLO_ARENA_AI_UPGRADE.md
- API Docs:
  - Gemini: https://ai.google.dev/docs
  - Stability: https://platform.stability.ai/docs

## 📄 License

[Your License]

---

**Last Updated:** October 31, 2024  
**Version:** 1.0.0  
**Status:** Production Ready ✅
