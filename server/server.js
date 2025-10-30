import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { GameManager } from './gameManager.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:8080", "http://localhost:8081"], // Support all Vite ports
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const gameManager = new GameManager(io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: gameManager.getRoomCount() });
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
