import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Home, Users, Pencil, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSocket } from "@/hooks/useSocket";
import { useToast } from "@/hooks/use-toast";

export const ScribbleHome = () => {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [avatar, setAvatar] = useState("👤");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  const { socket, connected } = useSocket();
  const { toast } = useToast();
  const navigate = useNavigate();

  const avatars = ["👤", "😀", "😎", "🤖", "👻", "🦄", "🐱", "🐶", "🦊", "🐼"];

  const createRoom = () => {
    if (!playerName.trim()) {
      toast({
        title: "Enter Your Name",
        description: "Please enter your name to create a room",
        variant: "destructive"
      });
      return;
    }

    if (!connected || !socket) {
      toast({
        title: "Connection Error",
        description: "Not connected to server. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    socket.emit('createRoom', { playerName, avatar });

    socket.once('roomCreated', ({ roomCode, roomId }) => {
      setIsCreating(false);
      toast({
        title: "Room Created! 🎉",
        description: `Room code: ${roomCode}`,
      });
      navigate(`/battle/room/${roomCode}`, { 
        state: { playerName, avatar, isHost: true } 
      });
    });

    socket.once('error', ({ message }) => {
      setIsCreating(false);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    });
  };

  const joinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both your name and room code",
        variant: "destructive"
      });
      return;
    }

    if (!connected || !socket) {
      toast({
        title: "Connection Error",
        description: "Not connected to server. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    setIsJoining(true);

    socket.emit('joinRoom', { roomCode: roomCode.toUpperCase(), playerName, avatar });

    socket.once('roomUpdated', () => {
      setIsJoining(false);
      toast({
        title: "Joined Room! 🎉",
        description: `Welcome to room ${roomCode}`,
      });
      navigate(`/battle/room/${roomCode.toUpperCase()}`, { 
        state: { playerName, avatar, isHost: false } 
      });
    });

    socket.once('error', ({ message }) => {
      setIsJoining(false);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    });
  };

  return (
          <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl space-y-8 animate-fade-in-up">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Multiplayer Prompt Challenge</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight">
              <span className="text-gradient">Prompt Battle</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create AI-generated images with prompts, vote for your favorites, and climb the leaderboard!
            </p>

            {/* Connection Status */}
            <div className="flex items-center justify-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <span className="text-sm text-muted-foreground">
                {connected ? 'Connected to server' : 'Connecting...'}
              </span>
            </div>
          </div>

        {/* Player Setup */}
        <Card className="glass p-8 border-primary/30 animate-scale-in">
          <h2 className="text-2xl font-bold mb-6 text-center">Player Setup</h2>
          
          <div className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Your Name</label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                className="glass border-primary/20 focus:border-primary/50"
                maxLength={20}
              />
            </div>

            {/* Avatar Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Choose Avatar</label>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {avatars.map((ava) => (
                  <button
                    key={ava}
                    onClick={() => setAvatar(ava)}
                    className={`p-3 text-3xl rounded-lg border-2 transition-all hover:scale-110 ${
                      avatar === ava
                        ? 'border-primary bg-primary/20 scale-110'
                        : 'border-muted/20 hover:border-primary/50'
                    }`}
                  >
                    {ava}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Create/Join Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Room */}
          <Card className="glass p-8 border-green-500/30 hover:border-green-500/50 transition-all">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400">
                <Sparkles className="w-8 h-8" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-2">Create Room</h3>
                <p className="text-sm text-muted-foreground">
                  Start a new game and invite friends
                </p>
              </div>

              <Button
                onClick={createRoom}
                disabled={!connected || isCreating || !playerName.trim()}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                size="lg"
              >
                {isCreating ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Room
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Join Room */}
          <Card className="glass p-8 border-blue-500/30 hover:border-blue-500/50 transition-all">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 text-blue-400">
                <Users className="w-8 h-8" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-2">Join Room</h3>
                <p className="text-sm text-muted-foreground">
                  Enter a room code to join friends
                </p>
              </div>

              <Input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter room code..."
                className="glass border-blue-500/20 focus:border-blue-500/50 text-center text-2xl font-mono tracking-wider"
                maxLength={6}
              />

              <Button
                onClick={joinRoom}
                disabled={!connected || isJoining || !playerName.trim() || !roomCode.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                size="lg"
              >
                {isJoining ? (
                  <>Joining...</>
                ) : (
                  <>
                    <Users className="w-5 h-5 mr-2" />
                    Join Room
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* How to Play */}
        <Card className="glass p-8 border-purple-500/30">
          <h3 className="text-xl font-bold mb-4 text-center">How to Play</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-4xl mb-2">✍️</div>
              <h4 className="font-semibold">1. Write Prompt</h4>
              <p className="text-sm text-muted-foreground">
                Get a word and write a creative prompt to generate an image (30s)
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl mb-2">🎨</div>
              <h4 className="font-semibold">2. AI Generates</h4>
              <p className="text-sm text-muted-foreground">
                AI creates images from everyone's prompts (anonymous)
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl mb-2">🏆</div>
              <h4 className="font-semibold">3. Vote & Win</h4>
              <p className="text-sm text-muted-foreground">
                Vote for the best images (30s), then names are revealed!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
