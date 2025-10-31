# 🔧 Production Connection Troubleshooting Guide

## Problem: "Connecting..." Forever / Can't Connect to Server

### 🔍 Quick Diagnosis

**Check browser console for errors:**

```
F12 → Console Tab
```

Look for messages like:

- `🔌 Attempting to connect to: [URL]`
- `🔴 Connection error: [message]`
- `⚠️ CORS blocked origin: [URL]`

---

## ✅ Solution Steps

### 1. **Set Environment Variables** (Most Common Issue)

**Frontend (Vercel/Netlify):**

```bash
VITE_BACKEND_URL=https://your-backend-domain.com
```

**Backend (Railway/Render):**

```bash
FRONTEND_URL=https://your-frontend-domain.com
GEMINI_API_KEY=your_key
STABILITY_API_KEY=your_key
PORT=3001
```

⚠️ **Important:** After setting environment variables, **redeploy** both frontend and backend!

---

### 2. **Verify Backend is Running**

Test the health endpoint:

```bash
curl https://your-backend-domain.com/health
```

Should return:

```json
{ "status": "ok", "rooms": 0 }
```

If this fails, your backend isn't running or the URL is wrong.

---

### 3. **Check CORS Configuration**

**Backend logs should show:**

```
🌐 Allowed origins: [ 'http://localhost:8080', 'https://your-frontend.com' ]
```

**If you see:**

```
⚠️ CORS blocked origin: https://your-frontend.com
```

**Fix:** Add your frontend URL to `server/.env`:

```bash
FRONTEND_URL=https://your-frontend-domain.com
```

---

### 4. **Verify WebSocket Support**

Some hosting platforms require special WebSocket configuration:

**Railway/Render:** ✅ WebSocket supported by default

**Heroku:** Add this to your backend:

```javascript
// In server.js, add:
if (process.env.NODE_ENV === "production") {
  app.enable("trust proxy");
}
```

**Nginx/Apache:** Ensure WebSocket proxy is configured:

```nginx
location /socket.io/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

---

### 5. **Check Network Tab**

**In browser DevTools:**

1. F12 → Network tab
2. Filter: "WS" (WebSocket) or "socket.io"
3. Look for connection attempts

**Expected:**

- Status: 101 Switching Protocols ✅

**If you see:**

- Status: 400, 403, 404 ❌ - Backend not configured correctly
- Status: 502, 503 ❌ - Backend is down
- CORS error ❌ - CORS configuration issue

---

### 6. **Test Connection Locally**

**Frontend:**

```bash
# Set backend URL temporarily
export VITE_BACKEND_URL=https://your-backend.com
npm run dev
```

**Backend:**

```bash
# Set frontend URL temporarily
export FRONTEND_URL=https://your-frontend.com
npm start
```

Open http://localhost:8080 and check if it connects.

---

## 🐛 Common Issues & Fixes

### Issue 1: "Mixed Content" Error

**Error:** `Mixed Content: The page at 'https://...' was loaded over HTTPS, but attempted to connect to 'http://...'`

**Fix:** Ensure backend URL uses HTTPS:

```bash
VITE_BACKEND_URL=https://your-backend.com  # ✅ HTTPS
# NOT http://your-backend.com  # ❌ HTTP
```

---

### Issue 2: Wrong Backend URL

**Check frontend build:**

```bash
# Frontend should have embedded the correct URL
grep -r "VITE_BACKEND_URL" dist/
```

If it shows `localhost`, you forgot to set the environment variable before building!

**Fix:**

```bash
# Set env var BEFORE building
export VITE_BACKEND_URL=https://your-backend.com
npm run build
# Then deploy the new dist/ folder
```

---

### Issue 3: CORS Wildcard Not Working

**Problem:** Socket.IO requires explicit origins, not `*`

**Fix:** Already handled in the updated code - it now dynamically checks origins.

---

### Issue 4: Firewall Blocking WebSocket

**Check if polling works:**

In `SocketProvider.tsx`, temporarily change:

```javascript
transports: ['polling', 'websocket'], // Try polling first
```

If this works, your firewall blocks WebSocket. Contact hosting support.

---

### Issue 5: Port Issues

**Backend must listen on the correct port:**

```javascript
// server.js should have:
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🎮 Server running on port ${PORT}`);
});
```

Most platforms (Railway, Render) set `PORT` automatically. Don't hardcode it!

---

## 📊 Debugging Checklist

Run through this checklist:

- [ ] Backend health endpoint responds (curl test)
- [ ] `VITE_BACKEND_URL` set in frontend environment
- [ ] `FRONTEND_URL` set in backend environment
- [ ] Frontend URL in backend logs: `🌐 Allowed origins:`
- [ ] Browser console shows connection attempt
- [ ] Backend logs show incoming connection
- [ ] No CORS errors in browser console
- [ ] Both frontend and backend use HTTPS (not mixed)
- [ ] Redeployed after setting environment variables
- [ ] WebSocket status code is 101 (not 400/403)

---

## 🔍 Advanced Debugging

### Enable Detailed Socket.IO Logs

**Frontend:**

```javascript
// Add to SocketProvider.tsx temporarily
const socketInstance = io(backendUrl, {
  // ... other options
  debug: true, // Enable debug mode
});

// Enable client logs
localStorage.debug = "socket.io-client:*";
```

**Backend:**

```javascript
// Add to server.js temporarily
import { Server } from "socket.io";

const io = new Server(httpServer, {
  // ... other options
});

// Log all events
io.engine.on("connection_error", (err) => {
  console.log("Connection error:", err);
});
```

---

## 🚀 Quick Fix Commands

**Restart everything with proper environment:**

**Backend:**

```bash
# Set env vars
export FRONTEND_URL=https://your-frontend.com
export GEMINI_API_KEY=your_key
export STABILITY_API_KEY=your_key

# Restart
npm start
```

**Frontend:**

```bash
# Set env var
export VITE_BACKEND_URL=https://your-backend.com

# Rebuild and redeploy
npm run build
# Upload dist/ to hosting
```

---

## 📞 Still Not Working?

**Collect this information:**

1. **Backend logs** (last 50 lines)
2. **Browser console errors** (screenshot)
3. **Network tab** (WebSocket requests)
4. **Environment variables** (don't share API keys!)

   ```bash
   # Backend
   echo $FRONTEND_URL
   echo $PORT

   # Frontend
   echo $VITE_BACKEND_URL
   ```

5. **Hosting platforms**

   - Backend: [Railway/Render/Heroku/VPS]
   - Frontend: [Vercel/Netlify/Cloudflare]

6. **URLs**
   - Frontend: https://...
   - Backend: https://...

---

## ✅ Success Indicators

**When it works, you'll see:**

**Frontend console:**

```
🔌 Attempting to connect to: https://your-backend.com
✅ Connected to server: https://your-backend.com
```

**Backend logs:**

```
🌐 Allowed origins: [ ... ]
🎮 Server running on port 3001
Player connected: [socket-id]
```

**Browser Network tab:**

```
socket.io/?EIO=4&transport=websocket
Status: 101 Switching Protocols
```

---

**Last Updated:** October 31, 2024  
**Status:** Enhanced CORS and debugging added
