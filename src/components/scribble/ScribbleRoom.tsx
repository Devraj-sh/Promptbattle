import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSocket } from "@/hooks/useSocket";
import { useToast } from "@/hooks/use-toast";
import { PlayerLobby } from "./PlayerLobby";
import { PromptPhase } from "./PromptPhase";
import { GeneratingPhase } from "./GeneratingPhase";
import { VotingPhase } from "./VotingPhase";
import { ResultsPhase } from "./ResultsPhase";
import { FinalResults } from "./FinalResults";

type GameState = "waiting" | "starting" | "prompting" | "generating" | "voting" | "revealing" | "finished";

interface Player {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  isHost: boolean;
  score: number;
}

interface Room {
  id: string;
  code: string;
  players: Player[];
  state: GameState;
  currentRound: number;
  maxRounds: number;
  word: string | null;
  timer: number;
}

interface Image {
  playerId: string;
  playerName?: string;
  imageUrl: string;
  prompt?: string;
  votes?: number;
}

interface RoundResult {
  round: number;
  word: string;
  votes: Record<string, number>;
  winner: string | string[];
  scores: Array<{ id: string; name: string; score: number }>;
}

export const ScribbleRoom = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, connected } = useSocket();
  const { toast } = useToast();

  const [room, setRoom] = useState<Room | null>(null);
  const [playerName] = useState(location.state?.playerName || "");
  const [isHost] = useState(location.state?.isHost || false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [roundResults, setRoundResults] = useState<RoundResult | null>(null);
  const [finalScores, setFinalScores] = useState<{scores: Array<{id: string; name: string; avatar: string; score: number}>; winner: {id: string; name: string; avatar: string; score: number}; allResults: Array<{round: number; word: string; votes: Record<string, number>; winner: string | string[]; scores: Array<{id: string; name: string; score: number}>}>} | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (!socket || !connected) {
      toast({
        title: "Connection Lost",
        description: "Trying to reconnect...",
        variant: "destructive"
      });
      return;
    }

    // Request room data when component mounts
    if (roomCode) {
      socket.emit('getRoomData', { roomCode });
    }

    // Room updates
    socket.on('roomUpdated', (updatedRoom: Room) => {
      setRoom(updatedRoom);
    });

    socket.on('playerJoined', ({ player }) => {
      toast({
        title: "Player Joined",
        description: `${player.name} joined the room!`,
      });
    });

    socket.on('playerLeft', ({ player }) => {
      toast({
        title: "Player Left",
        description: `${player.name} left the room`,
        variant: "destructive"
      });
    });

    // Game flow
    socket.on('gameStarting', ({ countdown: cd }) => {
      setCountdown(cd);
      if (cd === 0) {
        setCountdown(null); // Clear countdown immediately if 0
      }
    });

    socket.on('roundStart', ({ round, word, totalRounds }) => {
      setCountdown(null); // Clear countdown when round starts
      setRoom(prev => prev ? { ...prev, currentRound: round, word, state: 'prompting' } : null);
      setHasSubmitted(false);
      setHasVoted(false);
      setRoundResults(null);
      toast({
        title: `Round ${round}/${totalRounds}`,
        description: `Your word: ${word}`,
      });
    });

    socket.on('timerStart', ({ duration }) => {
      setRoom(prev => prev ? { ...prev, timer: duration } : null);
    });

    socket.on('timerTick', ({ timeLeft }) => {
      setRoom(prev => prev ? { ...prev, timer: timeLeft } : null);
    });

    socket.on('phaseChange', ({ phase }) => {
      setRoom(prev => prev ? { ...prev, state: phase } : null);
    });

    socket.on('promptSubmitted', ({ submitted, total }) => {
      toast({
        title: "Prompt Submitted",
        description: `${submitted}/${total} players submitted`,
      });
    });

    socket.on('votingStart', ({ images: imgs }) => {
      setImages(imgs);
      setRoom(prev => prev ? { ...prev, state: 'voting' } : null);
    });

    socket.on('voteConfirmed', () => {
      setHasVoted(true);
      toast({
        title: "Vote Recorded",
        description: "Your vote has been counted!",
      });
    });

    socket.on('voteSubmitted', ({ voted, total }) => {
      toast({
        title: "Vote Received",
        description: `${voted}/${total} players voted`,
      });
    });

    socket.on('roundResults', ({ results, images: resultImages }) => {
      setRoundResults(results);
      setImages(resultImages);
      setRoom(prev => prev ? { ...prev, state: 'revealing', players: results.scores.map((s: {id: string; name: string; score: number}) => {
        const player = prev.players.find(p => p.id === s.id);
        return { ...player, score: s.score } as Player;
      }) } : null);
    });

    socket.on('gameFinished', ({ finalScores: scores, winner, allResults }) => {
      setFinalScores({ scores, winner, allResults });
      setRoom(prev => prev ? { ...prev, state: 'finished' } : null);
    });

    socket.on('error', ({ message }) => {
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    });

    return () => {
      socket.off('roomUpdated');
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('gameStarting');
      socket.off('roundStart');
      socket.off('timerStart');
      socket.off('timerTick');
      socket.off('phaseChange');
      socket.off('promptSubmitted');
      socket.off('votingStart');
      socket.off('voteConfirmed');
      socket.off('voteSubmitted');
      socket.off('roundResults');
      socket.off('gameFinished');
      socket.off('error');
    };
  }, [socket, connected, toast, roomCode]);

  const handleToggleReady = () => {
    if (socket && !isHost) {
      socket.emit('toggleReady');
    }
  };

  const handleStartGame = () => {
    if (socket && isHost) {
      socket.emit('startGame');
    }
  };

  const handleSubmitPrompt = (prompt: string) => {
    if (socket) {
      socket.emit('submitPrompt', { prompt });
      setHasSubmitted(true);
    }
  };

  const handleVote = (targetPlayerId: string) => {
    if (socket && !hasVoted) {
      socket.emit('submitVote', { targetPlayerId });
    }
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
    navigate('/battle');
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">🎮</div>
          <p className="text-xl">Loading room...</p>
        </div>
      </div>
    );
  }

  // Countdown overlay
  if (countdown !== null && countdown > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-blue-900/50">
        <div className="text-center space-y-8 animate-scale-in">
          <h1 className="text-9xl font-black text-gradient animate-pulse">
            {countdown}
          </h1>
          <p className="text-3xl font-bold">Get Ready!</p>
        </div>
      </div>
    );
  }

  // Render appropriate phase
  switch (room.state) {
    case "waiting":
    case "starting":
      return (
        <PlayerLobby
          room={room}
          isHost={isHost}
          onToggleReady={handleToggleReady}
          onStartGame={handleStartGame}
          onLeave={handleLeaveRoom}
        />
      );

    case "prompting":
      return (
        <PromptPhase
          room={room}
          word={room.word || ""}
          timer={room.timer}
          hasSubmitted={hasSubmitted}
          onSubmit={handleSubmitPrompt}
          onLeave={handleLeaveRoom}
        />
      );

    case "generating":
      return (
        <GeneratingPhase
          room={room}
          word={room.word || ""}
        />
      );

    case "voting":
      return (
        <VotingPhase
          room={room}
          images={images}
          timer={room.timer}
          hasVoted={hasVoted}
          myPlayerId={socket?.id || ""}
          onVote={handleVote}
        />
      );

    case "revealing":
      return (
        <ResultsPhase
          room={room}
          roundResults={roundResults}
          images={images}
        />
      );

    case "finished":
      return (
        <FinalResults
          finalScores={finalScores}
          onLeave={handleLeaveRoom}
        />
      );

    default:
      return null;
  }
};
