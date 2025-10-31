# 🎮 Prompt Battle

> **Master the art of prompt engineering through competitive gameplay and AI-powered challenges**

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6-black.svg)](https://socket.io/)

**Prompt Battle** is an educational game that teaches prompt engineering through two exciting modes:

- 🎯 **Solo Arena**: Challenge yourself with AI-evaluated prompt engineering exercises
- 👥 **Multiplayer Battle**: Compete with friends in real-time prompt battles with AI image generation

## ✨ Features

### 🎯 Solo Arena Mode

- **5 Difficulty Levels**: Progress from Beginner to Prodigy
- **Real AI Evaluation**: Google Gemini 2.5 Flash analyzes your prompts
- **4 Scoring Dimensions**: Clarity, Specificity, Creativity, Structure
- **Personalized Feedback**: Get detailed tips to improve your prompts
- **XP & Leaderboard**: Track your progress and compete

### 👥 Multiplayer Mode

- **Real-Time Gameplay**: Socket.IO powered multiplayer rooms
- **AI Image Generation**: Stability.ai SDXL creates images from prompts
- **Vote-Based System**: Players vote for the best image
- **5 Rounds**: Fast-paced 30-second prompt and voting phases
- **Room System**: Create/join rooms with unique codes
- **Avatar Selection**: Choose from 10 unique avatars

### 🎨 User Experience

- **Beautiful UI**: Modern glassmorphism design with animations
- **Responsive**: Works on desktop, tablet, and mobile
- **Real-Time Updates**: Live game state synchronization
- **Error Handling**: Graceful fallbacks and user-friendly messages

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or bun
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))
- Stability.ai API key ([Get one here](https://platform.stability.ai/account/keys))

### Installation

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd Promptbattle
   ```

2. **Install dependencies:**

   ```bash
   # Frontend
   npm install

   # Backend
   cd server
   npm install
   cd ..
   ```

3. **Configure environment variables:**

   **Backend** (`server/.env`):

   ```bash
   cp server/.env.example server/.env
   ```

   Edit `server/.env`:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   STABILITY_API_KEY=your_stability_api_key_here
   PORT=3001
   FRONTEND_URL=http://localhost:8080
   ```

   **Frontend** (`.env`):

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:

   ```env
   VITE_BACKEND_URL=http://localhost:3001
   ```

4. **Start the servers:**

   **Terminal 1 - Backend:**

   ```bash
   cd server
   npm start
   ```

   **Terminal 2 - Frontend:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:8080
   ```

## 🎮 How to Play

### Solo Arena

1. Click **"Solo Arena"** from the homepage
2. Read the challenge prompt
3. Write your best prompt in the textarea
4. Click **"Submit Prompt"** to get AI evaluation
5. Review your scores and feedback
6. Progress to the next level!

### Multiplayer Battle

1. Click **"Multiplayer"** from the homepage
2. **Create Room**: Choose avatar → Click "Create Room" → Share code
3. **Join Room**: Enter room code → Choose avatar → Click "Join"
4. Wait for host to start the game (minimum 1 player for testing)
5. **Prompt Phase** (30s): Write a creative prompt based on the word
6. **AI Generation**: Watch as AI creates images from all prompts
7. **Voting Phase** (30s): Vote for the best image
8. **Results**: See round winners and scores
9. Play 5 rounds, highest score wins!

## 🏗️ Project Structure

```
Promptbattle/
├── src/                          # Frontend React application
│   ├── components/
│   │   ├── Arena.tsx            # Solo arena component
│   │   ├── scribble/            # Multiplayer game components
│   │   │   ├── ScribbleHome.tsx # Room creation/joining
│   │   │   ├── ScribbleRoom.tsx # Game coordinator
│   │   │   ├── PromptPhase.tsx  # Prompt writing phase
│   │   │   ├── VotingPhase.tsx  # Voting phase
│   │   │   └── ...
│   │   └── ui/                   # shadcn/ui components
│   ├── contexts/
│   │   ├── SocketContext.tsx    # Socket.IO context
│   │   └── SocketProvider.tsx   # Socket.IO provider
│   ├── pages/                    # Page components
│   └── lib/                      # Utilities
│
├── server/                       # Backend Node.js server
│   ├── server.js                # Express + Socket.IO server
│   ├── gameManager.js           # Multiplayer game logic (490 lines)
│   ├── imageGenerator.js        # Stability.ai SDXL integration
│   ├── promptEvaluator.js       # Gemini AI evaluation
│   ├── .env                     # Environment variables (not in git)
│   └── package.json             # Backend dependencies
│
├── public/                       # Static assets
├── .env                          # Frontend env variables (not in git)
├── package.json                  # Frontend dependencies
├── DEPLOYMENT.md                 # Comprehensive deployment guide
├── SOLO_ARENA_AI_UPGRADE.md     # Solo arena feature documentation
└── README.md                     # This file
```

## 🔧 Tech Stack

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **Socket.IO Client** - Real-time communication
- **Lucide Icons** - Icon library

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **Socket.IO** - WebSocket server
- **Google Gemini 2.5 Flash** - Prompt evaluation
- **Stability.ai SDXL** - Image generation
- **dotenv** - Environment management

### AI Services

- **Gemini 2.5 Flash**: Fast, accurate prompt analysis
- **SDXL 1.0**: High-quality image generation (1024x1024)
- **Optimized Parameters**: cfg_scale=7.5, steps=40, FAST_BLUE guidance

## 📊 API Endpoints

### Backend API

**Health Check:**

```bash
GET /health
Response: {"status":"ok","rooms":0}
```

**Prompt Evaluation:**

```bash
POST /api/evaluate-prompt
Body: {
  "prompt": "Your prompt text",
  "challenge": "Challenge description",
  "levelId": 1
}
Response: {
  "clarity": 85,
  "specificity": 75,
  "creativity": 90,
  "structure": 80,
  "feedback": "Detailed feedback...",
  "tip": "Actionable improvement tip..."
}
```

### Socket.IO Events

**Client → Server:**

- `createRoom` - Create new game room
- `joinRoom` - Join existing room
- `startGame` - Start the game (host only)
- `submitPrompt` - Submit prompt during prompt phase
- `submitVote` - Vote for image during voting phase

**Server → Client:**

- `roomCreated` - Room created successfully
- `playerJoined` - Player joined room
- `gameStarted` - Game has started
- `phaseChange` - Game phase changed
- `countdown` - Timer countdown
- `roundResults` - Round results with winner
- `finalResults` - Game over with final scores

## 🧪 Testing

### Manual Testing Checklist

**Solo Arena:**

- [ ] Load arena page
- [ ] Submit prompt on each difficulty level
- [ ] Verify AI evaluation returns scores
- [ ] Check feedback and tips display
- [ ] Verify XP increases
- [ ] Check leaderboard updates

**Multiplayer:**

- [ ] Create room with avatar selection
- [ ] Join room with second browser tab
- [ ] Start game as host
- [ ] Submit prompts during prompt phase
- [ ] Verify images generate correctly
- [ ] Vote during voting phase
- [ ] Check round results display
- [ ] Complete all 5 rounds
- [ ] Verify final results and winner

**API Tests:**

```bash
# Health check
curl http://localhost:3001/health

# Prompt evaluation
curl -X POST http://localhost:3001/api/evaluate-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt":"Test prompt for evaluation",
    "challenge":"Test challenge",
    "levelId":1
  }'
```

## 🚀 Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for comprehensive deployment instructions including:

- Railway/Render/Fly.io deployment
- Vercel/Netlify frontend hosting
- Docker deployment
- Environment configuration
- Production optimization
- Troubleshooting guide

**Quick Deploy Commands:**

```bash
# Build frontend
npm run build

# Start backend (production)
cd server && NODE_ENV=production npm start

# Or use PM2
pm2 start server/server.js --name promptbattle-backend
pm2 serve dist 8080 --name promptbattle-frontend
```

## 🔑 Environment Variables

### Required API Keys

**Google Gemini API:**

- Get key: https://aistudio.google.com/app/apikey
- Free tier: 60 requests/minute
- Used for: Solo arena prompt evaluation

**Stability.ai API:**

- Get key: https://platform.stability.ai/account/keys
- Paid service (check pricing)
- Used for: Multiplayer image generation

### Configuration Files

**server/.env:**

```env
GEMINI_API_KEY=your_key_here
STABILITY_API_KEY=your_key_here
PORT=3001
FRONTEND_URL=http://localhost:8080
```

**.env:**

```env
VITE_BACKEND_URL=http://localhost:3001
```

## 🎓 Learning Resources

### Prompt Engineering

- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Prompt Library](https://docs.anthropic.com/claude/prompt-library)
- [Learn Prompting](https://learnprompting.org/)

### Game Development

- Understanding the game mechanics and scoring
- Best practices for prompt writing
- Tips from AI feedback

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Google AI](https://ai.google.dev/) - Gemini API
- [Stability.ai](https://stability.ai/) - Image generation
- [Socket.IO](https://socket.io/) - Real-time communication
- [Vite](https://vitejs.dev/) - Lightning fast build tool

## 📧 Contact

- Project Link: [GitHub Repository URL]
- Issues: [GitHub Issues URL]

## 📊 Project Status

✅ **Production Ready**

- [x] Multiplayer game fully functional
- [x] Solo arena with AI evaluation
- [x] Real-time image generation
- [x] Responsive UI design
- [x] Error handling & fallbacks
- [x] Production configuration
- [x] Comprehensive documentation

---

**Built with ❤️ for the prompt engineering community**

_Master your prompts, win the battle!_ 🏆
