# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment Verification

Run this checklist before deploying to production.

### 1. Environment Variables ✅

- [x] `server/.env` created and configured
- [x] `GEMINI_API_KEY` set with valid key
- [x] `STABILITY_API_KEY` set with valid key
- [x] `PORT` configured (default: 3001)
- [x] `FRONTEND_URL` set to production URL (for CORS)
- [x] `.env` created with `VITE_BACKEND_URL` (optional for local)

### 2. Security ✅

- [x] `.env` files in `.gitignore`
- [x] No API keys committed to repository
- [x] CORS properly configured with allowed origins
- [x] Environment variables use production URLs

### 3. Code Quality ✅

- [x] All TypeScript errors resolved
- [x] Frontend builds successfully (`npm run build`)
- [x] Backend starts without errors (`node server/server.js`)
- [x] No console.error for expected flows
- [x] Proper error handling in place

### 4. API Testing ✅

- [x] Health check endpoint: `GET /health`
- [x] Prompt evaluation: `POST /api/evaluate-prompt`
- [x] Socket.IO connection working
- [x] Image generation working (Stability.ai)
- [x] AI evaluation working (Gemini)

### 5. Game Testing ✅

**Solo Arena:**

- [x] Page loads correctly
- [x] Can submit prompts
- [x] AI evaluation returns scores
- [x] Feedback displays properly
- [x] XP system works
- [x] Leaderboard updates

**Multiplayer:**

- [x] Can create rooms
- [x] Can join rooms
- [x] Game starts correctly
- [x] Prompt phase works (30s timer)
- [x] Image generation succeeds
- [x] Voting phase works (30s timer)
- [x] Results display correctly
- [x] 5 rounds complete successfully

### 6. Documentation ✅

- [x] `README.md` updated
- [x] `DEPLOYMENT.md` created
- [x] `SOLO_ARENA_AI_UPGRADE.md` documented
- [x] `.env.example` files created
- [x] API endpoints documented

### 7. Dependencies ✅

- [x] All npm packages installed
- [x] No critical vulnerabilities (`npm audit`)
- [x] Package versions compatible

## 🎯 Deployment Steps

### Quick Deploy Script

```bash
# Run pre-deployment check
./pre-deploy-check.sh

# If all checks pass, deploy!
```

### Backend Deployment

**Option A: Simple VPS/EC2**

```bash
# SSH into server
ssh user@your-server.com

# Clone repo
git clone <your-repo> && cd Promptbattle

# Install dependencies
cd server && npm install

# Set environment variables
nano .env  # Add your API keys

# Start with PM2
pm2 start server.js --name promptbattle-backend
pm2 save
```

**Option B: Platform as a Service (Railway/Render)**

1. Connect GitHub repository
2. Set root directory: `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables in platform dashboard
6. Deploy!

### Frontend Deployment

**Option A: Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variable in Vercel dashboard:
# VITE_BACKEND_URL=https://your-backend-url.com
```

**Option B: Netlify**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Set environment variable in Netlify dashboard
```

**Option C: Static Hosting + PM2**

```bash
# Build frontend
npm run build

# Serve with PM2
pm2 serve dist 8080 --name promptbattle-frontend --spa
pm2 save
```

## 🧪 Post-Deployment Testing

### 1. Health Checks

```bash
# Backend health
curl https://your-backend.com/health

# Expected: {"status":"ok","rooms":0}
```

### 2. CORS Verification

- Open browser console on frontend
- Should see: "✅ Connected to server"
- No CORS errors in console

### 3. Functionality Tests

- [ ] Homepage loads
- [ ] Solo Arena works end-to-end
- [ ] Can create multiplayer room
- [ ] Can join multiplayer room
- [ ] Images generate correctly
- [ ] Voting works
- [ ] Game completes all 5 rounds

### 4. Performance Checks

- [ ] Page load time < 3s
- [ ] API response time < 5s (AI calls)
- [ ] Images load within 10s
- [ ] No memory leaks during gameplay

## 🔧 Common Issues & Fixes

### Issue: CORS Error

**Symptom:** "Access-Control-Allow-Origin" error in browser console

**Fix:**

```bash
# Add frontend URL to server/.env
FRONTEND_URL=https://your-frontend-domain.com

# Restart backend
pm2 restart promptbattle-backend
```

### Issue: Socket.IO Not Connecting

**Symptom:** "❌ Disconnected from server" in console

**Fix:**

1. Check `VITE_BACKEND_URL` in frontend .env
2. Verify backend is running: `curl https://backend.com/health`
3. Check firewall allows WebSocket connections
4. Verify HTTPS/WSS if using SSL

### Issue: API Key Invalid

**Symptom:** 401/403 errors from Gemini or Stability

**Fix:**

```bash
# Verify keys in server/.env
cat server/.env | grep API_KEY

# Test Gemini key
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY"

# Regenerate keys if needed
```

### Issue: Images Not Generating

**Symptom:** Placeholder images shown instead of AI-generated

**Fix:**

1. Check Stability.ai API key validity
2. Verify API credits available
3. Check server logs: `pm2 logs promptbattle-backend`
4. Test endpoint: `POST /api/evaluate-prompt`

## 📊 Monitoring Setup

### PM2 Monitoring

```bash
# View all processes
pm2 list

# View logs
pm2 logs promptbattle-backend

# Monitor resources
pm2 monit

# Setup startup script
pm2 startup
pm2 save
```

### Health Check Monitoring

Use services like UptimeRobot, Pingdom, or Better Stack:

- Monitor: `https://your-backend.com/health`
- Interval: 5 minutes
- Alert on: HTTP != 200

### API Usage Monitoring

- **Gemini**: Check usage at https://aistudio.google.com/
- **Stability.ai**: Check credits at https://platform.stability.ai/

## 🔒 Security Checklist

- [x] HTTPS enabled (use Cloudflare, Nginx with Let's Encrypt, or platform SSL)
- [x] API keys stored in environment variables, not code
- [x] CORS restricted to known domains
- [x] Rate limiting considered (optional: add express-rate-limit)
- [x] Input validation on all endpoints
- [x] Error messages don't expose sensitive info
- [x] Dependencies updated and audited

## 📈 Performance Optimization

### Already Implemented ✅

- Vite build optimization
- Code splitting (automatic with Vite)
- Gzip compression (in production build)
- Optimized AI parameters (Gemini 2.5 Flash, SDXL with optimal settings)

### Optional Enhancements

- [ ] Add CDN for static assets (Cloudflare)
- [ ] Implement Redis for game state caching
- [ ] Add rate limiting for API endpoints
- [ ] Enable HTTP/2
- [ ] Implement image caching strategy

## 🎉 Deployment Complete!

After deployment, you should have:

- ✅ Backend running and accessible
- ✅ Frontend deployed and loading
- ✅ Socket.IO connections working
- ✅ AI evaluation functional
- ✅ Image generation working
- ✅ Both game modes playable
- ✅ Monitoring in place

## 📞 Support

If issues persist:

1. Check logs: `pm2 logs` or platform logs
2. Verify environment variables
3. Test API endpoints manually
4. Check GitHub issues
5. Review DEPLOYMENT.md for detailed guides

---

**Last Updated:** October 31, 2024  
**Status:** Production Ready ✅  
**Next Steps:** Monitor and enjoy! 🎮
