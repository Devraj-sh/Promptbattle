import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { GameManager } from './gameManager.js';
import { PromptEvaluator } from './promptEvaluator.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration - add your production URL here
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080", 
  "http://localhost:8081",
  process.env.FRONTEND_URL, // Add production frontend URL to .env
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  // Performance optimizations
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '1mb' })); // Limit payload size
app.use(compression()); // Enable gzip compression

const gameManager = new GameManager(io);
const promptEvaluator = new PromptEvaluator();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: gameManager.getRoomCount() });
});

// Prompt evaluation endpoint for solo arena
app.post('/api/evaluate-prompt', async (req, res) => {
  try {
    const { prompt, challenge, levelId } = req.body;
    
    if (!prompt || !challenge) {
      return res.status(400).json({ error: 'Missing prompt or challenge' });
    }
    
    const evaluation = await promptEvaluator.evaluatePrompt(prompt, challenge, levelId);
    res.json(evaluation);
    
  } catch (error) {
    console.error('Evaluation endpoint error:', error);
    res.status(500).json({ error: 'Failed to evaluate prompt' });
  }
});

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Room management
  socket.on('createRoom', ({ playerName, avatar }) => {
    gameManager.createRoom(socket, playerName, avatar);
  });

  socket.on('joinRoom', ({ roomCode, playerName, avatar }) => {
    gameManager.joinRoom(socket, roomCode, playerName, avatar);
  });

  socket.on('getRoomData', ({ roomCode }) => {
    gameManager.getRoomData(socket, roomCode);
  });

  socket.on('toggleReady', () => {
    gameManager.toggleReady(socket);
  });

  socket.on('startGame', () => {
    gameManager.startGame(socket);
  });

  // Gameplay
  socket.on('submitPrompt', ({ prompt }) => {
    gameManager.submitPrompt(socket, prompt);
  });

  socket.on('submitVote', ({ targetPlayerId }) => {
    gameManager.submitVote(socket, targetPlayerId);
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    gameManager.handleDisconnect(socket);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🎮 Prompt Battle server running on port ${PORT}`);
});
