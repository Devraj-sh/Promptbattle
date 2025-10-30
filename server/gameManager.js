import { v4 as uuidv4 } from 'uuid';
import { ImageGenerator } from './imageGenerator.js';

export class GameManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
    this.socketToRoom = new Map();
    this.imageGenerator = new ImageGenerator();
  }

  generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  createRoom(socket, playerName, avatar) {
    const roomCode = this.generateRoomCode();
    const roomId = uuidv4();
    
    const player = {
      id: socket.id,
      name: playerName,
      avatar: avatar || '👤',
      isReady: false,
      isHost: true,
      score: 0
    };

    const room = {
      id: roomId,
      code: roomCode,
      players: [player],
      state: 'waiting',
      currentRound: 0,
      maxRounds: 5,
      word: null,
      prompts: new Map(),
      images: new Map(),
      votes: new Map(),
      roundResults: [],
      timer: 0,
      timerInterval: null
    };

    this.rooms.set(roomId, room);
    this.socketToRoom.set(socket.id, roomId);
    socket.join(roomId);

    socket.emit('roomCreated', {
      roomCode,
      roomId,
      room: this.sanitizeRoom(room)
    });

    // Also send roomUpdated so the room component can initialize properly
    socket.emit('roomUpdated', this.sanitizeRoom(room));

    console.log(`Room created: ${roomCode} by ${playerName}`);
  }

  joinRoom(socket, roomCode, playerName, avatar) {
    // Find room by code
    const room = Array.from(this.rooms.values()).find(r => r.code === roomCode);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.players.length >= 5) {
      socket.emit('error', { message: 'Room is full (max 5 players)' });
      return;
    }

    if (room.state !== 'waiting') {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      avatar: avatar || '👤',
      isReady: false,
      isHost: false,
      score: 0
    };

    room.players.push(player);
    this.socketToRoom.set(socket.id, room.id);
    socket.join(room.id);

    // Notify everyone in the room
    this.io.to(room.id).emit('roomUpdated', this.sanitizeRoom(room));
    this.io.to(room.id).emit('playerJoined', { player });

    console.log(`${playerName} joined room ${roomCode}`);
  }

  getRoomData(socket, roomCode) {
    const room = Array.from(this.rooms.values()).find(r => r.code === roomCode);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    // Check if socket is already in this room
    const isInRoom = room.players.some(p => p.id === socket.id);
    
    if (isInRoom) {
      // Send current room state
      socket.emit('roomUpdated', this.sanitizeRoom(room));
    } else {
      socket.emit('error', { message: 'You are not in this room' });
    }
  }

  toggleReady(socket) {
    const roomId = this.socketToRoom.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    const player = room.players.find(p => p.id === socket.id);
    
    if (player && !player.isHost) {
      player.isReady = !player.isReady;
      this.io.to(room.id).emit('roomUpdated', this.sanitizeRoom(room));
    }
  }

  startGame(socket) {
    const roomId = this.socketToRoom.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    const player = room.players.find(p => p.id === socket.id);
    
    // Only host can start
    if (!player?.isHost) {
      socket.emit('error', { message: 'Only the host can start the game' });
      return;
    }

    // Need at least 1 player (for testing/debugging)
    if (room.players.length < 1) {
      socket.emit('error', { message: 'Need at least 1 player to start' });
      return;
    }

    // All non-host players must be ready
    const allReady = room.players.filter(p => !p.isHost).every(p => p.isReady);
    if (!allReady && room.players.length > 1) {
      socket.emit('error', { message: 'All players must be ready' });
      return;
    }

    room.state = 'starting';
    this.io.to(room.id).emit('gameStarting', { countdown: 3 });

    // Countdown
    let countdown = 3;
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown >= 0) {
        this.io.to(room.id).emit('gameStarting', { countdown });
      }
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        this.startRound(room);
      }
    }, 1000);
  }

  startRound(room) {
    room.currentRound++;
    room.state = 'prompting';
    room.word = this.getRandomWord();
    room.prompts.clear();
    room.images.clear();
    room.votes.clear();

    this.io.to(room.id).emit('roundStart', {
      round: room.currentRound,
      word: room.word,
      totalRounds: room.maxRounds
    });

    // Start 30s timer for prompting
    this.startTimer(room, 30, () => {
      this.generateImages(room);
    });
  }

  async generateImages(room) {
    room.state = 'generating';
    this.io.to(room.id).emit('phaseChange', { phase: 'generating' });

    const imagePromises = [];
    
    // Generate images for all players who submitted prompts
    for (const [playerId, prompt] of room.prompts.entries()) {
      const promise = this.imageGenerator.generateImage(room.word, prompt)
        .then(imageUrl => {
          room.images.set(playerId, imageUrl);
          console.log(`Image generated for player ${playerId}`);
        })
        .catch(err => {
          console.error(`Failed to generate image for ${playerId}:`, err);
          // Use a distinctive fallback URL
          room.images.set(playerId, `https://via.placeholder.com/400x400/ef4444/ffffff?text=Error`);
        });
      
      imagePromises.push(promise);
    }

    // For players who didn't submit, generate a default image
    for (const player of room.players) {
      if (!room.prompts.has(player.id)) {
        console.log(`Player ${player.id} (${player.name}) didn't submit prompt, using word only`);
        const promise = this.imageGenerator.generateImage(room.word, '')
          .then(imageUrl => {
            room.images.set(player.id, imageUrl);
          })
          .catch(err => {
            console.error(`Failed to generate default image for ${player.id}:`, err);
            room.images.set(player.id, `https://via.placeholder.com/400x400/94a3b8/ffffff?text=No+Prompt`);
          });
        
        imagePromises.push(promise);
      }
    }

    await Promise.all(imagePromises);

    console.log(`Generated ${room.images.size} images for room ${room.code}`);

    // Start voting phase
    this.startVoting(room);
  }

  startVoting(room) {
    room.state = 'voting';
    
    // Shuffle images for anonymous voting
    const shuffledImages = this.shuffleImages(room);
    
    this.io.to(room.id).emit('votingStart', {
      images: shuffledImages
    });

    // Start 30s timer for voting
    this.startTimer(room, 30, () => {
      this.revealResults(room);
    });
  }

  revealResults(room) {
    room.state = 'revealing';
    
    // Calculate scores
    const voteCount = new Map();
    for (const [voterId, targetId] of room.votes.entries()) {
      voteCount.set(targetId, (voteCount.get(targetId) || 0) + 1);
    }

    // Award points
    let maxVotes = 0;
    let winners = [];
    
    for (const [playerId, votes] of voteCount.entries()) {
      const player = room.players.find(p => p.id === playerId);
      if (player) {
        player.score += votes; // 1 point per vote
        
        if (votes > maxVotes) {
          maxVotes = votes;
          winners = [playerId];
        } else if (votes === maxVotes) {
          winners.push(playerId);
        }
      }
    }

    // Bonus points for most votes
    if (maxVotes > 0) {
      const bonusPerWinner = Math.floor(2 / winners.length);
      winners.forEach(winnerId => {
        const player = room.players.find(p => p.id === winnerId);
        if (player) player.score += bonusPerWinner;
      });
    }

    const roundResult = {
      round: room.currentRound,
      word: room.word,
      votes: Object.fromEntries(voteCount),
      winner: winners.length === 1 ? winners[0] : winners,
      scores: room.players.map(p => ({ id: p.id, name: p.name, score: p.score }))
    };

    room.roundResults.push(roundResult);

    this.io.to(room.id).emit('roundResults', {
      results: roundResult,
      images: Array.from(room.images.entries()).map(([id, url]) => ({
        playerId: id,
        playerName: room.players.find(p => p.id === id)?.name,
        imageUrl: url,
        prompt: room.prompts.get(id),
        votes: voteCount.get(id) || 0
      }))
    });

    // Next round or end game
    setTimeout(() => {
      if (room.currentRound < room.maxRounds) {
        this.startRound(room);
      } else {
        this.endGame(room);
      }
    }, 8000); // 8 seconds to view results
  }

  endGame(room) {
    room.state = 'finished';
    
    // Sort players by score
    const finalScores = room.players
      .map(p => ({ id: p.id, name: p.name, avatar: p.avatar, score: p.score }))
      .sort((a, b) => b.score - a.score);

    this.io.to(room.id).emit('gameFinished', {
      finalScores,
      winner: finalScores[0],
      allResults: room.roundResults
    });
  }

  submitPrompt(socket, prompt) {
    const roomId = this.socketToRoom.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (room.state !== 'prompting') return;

    room.prompts.set(socket.id, prompt);
    
    // Notify that player submitted
    this.io.to(room.id).emit('promptSubmitted', {
      playerId: socket.id,
      submitted: room.prompts.size,
      total: room.players.length
    });

    // If all submitted, skip to next phase early
    if (room.prompts.size === room.players.length) {
      this.stopTimer(room);
      this.generateImages(room);
    }
  }

  submitVote(socket, targetPlayerId) {
    const roomId = this.socketToRoom.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (room.state !== 'voting') return;

    // Can't vote for yourself
    if (targetPlayerId === socket.id) {
      socket.emit('error', { message: "Can't vote for yourself!" });
      return;
    }

    room.votes.set(socket.id, targetPlayerId);
    
    // Notify vote received
    socket.emit('voteConfirmed');
    
    this.io.to(room.id).emit('voteSubmitted', {
      voted: room.votes.size,
      total: room.players.length
    });

    // If all voted, skip to results early
    if (room.votes.size === room.players.length) {
      this.stopTimer(room);
      this.revealResults(room);
    }
  }

  startTimer(room, duration, onComplete) {
    room.timer = duration;
    
    this.io.to(room.id).emit('timerStart', { duration });

    room.timerInterval = setInterval(() => {
      room.timer--;
      this.io.to(room.id).emit('timerTick', { timeLeft: room.timer });

      if (room.timer <= 0) {
        this.stopTimer(room);
        onComplete();
      }
    }, 1000);
  }

  stopTimer(room) {
    if (room.timerInterval) {
      clearInterval(room.timerInterval);
      room.timerInterval = null;
    }
  }

  handleDisconnect(socket) {
    const roomId = this.socketToRoom.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1) return;

    const player = room.players[playerIndex];
    room.players.splice(playerIndex, 1);

    this.socketToRoom.delete(socket.id);

    // If room is empty, delete it
    if (room.players.length === 0) {
      this.stopTimer(room);
      this.rooms.delete(roomId);
      console.log(`Room ${room.code} deleted (empty)`);
      return;
    }

    // If host left, assign new host
    if (player.isHost && room.players.length > 0) {
      room.players[0].isHost = true;
    }

    this.io.to(room.id).emit('playerLeft', { player });
    this.io.to(room.id).emit('roomUpdated', this.sanitizeRoom(room));
  }

  shuffleImages(room) {
    const images = Array.from(room.images.entries()).map(([playerId, imageUrl]) => ({
      playerId: playerId,
      imageUrl
    }));
    
    // Fisher-Yates shuffle
    for (let i = images.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [images[i], images[j]] = [images[j], images[i]];
    }
    
    return images;
  }

  getRandomWord() {
    const words = [
      'sunset', 'dragon', 'castle', 'robot', 'galaxy',
      'ocean', 'mountain', 'wizard', 'spaceship', 'unicorn',
      'forest', 'phoenix', 'portal', 'cyborg', 'temple',
      'volcano', 'mermaid', 'lighthouse', 'ninja', 'pyramid'
    ];
    return words[Math.floor(Math.random() * words.length)];
  }

  sanitizeRoom(room) {
    return {
      id: room.id,
      code: room.code,
      players: room.players,
      state: room.state,
      currentRound: room.currentRound,
      maxRounds: room.maxRounds,
      word: room.word,
      timer: room.timer
    };
  }

  getRoomCount() {
    return this.rooms.size;
  }
}
