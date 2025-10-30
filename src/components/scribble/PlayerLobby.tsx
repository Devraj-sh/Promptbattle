import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, Copy, Check, LogOut, Sparkles } from "lucide-react";
import { useState } from "react";

interface Player {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  isHost: boolean;
  score: number;
}

interface Room {
  code: string;
  players: Player[];
  state: string;
  currentRound: number;
  maxRounds: number;
}

interface PlayerLobbyProps {
  room: Room;
  isHost: boolean;
  onToggleReady: () => void;
  onStartGame: () => void;
  onLeave: () => void;
}

export const PlayerLobby = ({ room, isHost, onToggleReady, onStartGame, onLeave }: PlayerLobbyProps) => {
  const [copied, setCopied] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allReady = room.players.filter(p => !p.isHost).every(p => p.isReady);
  const canStart = room.players.length >= 1 && (room.players.length === 1 || allReady);

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/30 text-sm font-medium">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Waiting for Players</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-display font-black text-gradient">
            Room Lobby
          </h1>

          {/* Room Code */}
          <div className="flex items-center justify-center gap-3">
            <Card className="glass px-6 py-3 border-primary/30">
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Room Code</p>
                  <p className="text-3xl font-mono font-bold tracking-wider text-primary">
                    {room.code}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyRoomCode}
                  className="hover:bg-primary/20"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </Card>
          </div>

          <p className="text-muted-foreground">
            Share this code with friends to join!
          </p>
        </div>

        {/* Players */}
        <Card className="glass p-8 border-primary/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              Players ({room.players.length}/5)
            </h2>
            <Button
              onClick={onLeave}
              variant="outline"
              size="sm"
              className="border-destructive/30 hover:border-destructive/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Leave
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {room.players.map((player) => (
              <Card
                key={player.id}
                className={`glass p-4 border-2 transition-all ${
                  player.isReady || player.isHost
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-muted/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{player.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{player.name}</p>
                      {player.isHost && (
                        <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {player.isHost ? (
                        <Badge variant="outline" className="border-yellow-400/30 text-xs">
                          Host
                        </Badge>
                      ) : player.isReady ? (
                        <Badge variant="outline" className="border-primary/30 text-xs">
                          ✓ Ready
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-muted/30 text-xs opacity-50">
                          Not Ready
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Empty slots */}
            {Array.from({ length: 5 - room.players.length }).map((_, idx) => (
              <Card
                key={`empty-${idx}`}
                className="glass p-4 border-2 border-dashed border-muted/20 opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="text-4xl opacity-30">👤</div>
                  <div>
                    <p className="text-sm text-muted-foreground">Waiting...</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Ready/Start Controls */}
          <div className="space-y-4">
            {isHost ? (
              <>
                <Button
                  onClick={onStartGame}
                  disabled={!canStart}
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {!canStart
                    ? room.players.length < 1
                      ? 'Need 1+ Player'
                      : 'Waiting for Ready...'
                    : 'Start Game'}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  {room.players.length < 1 && "At least 1 player needed to start"}
                  {room.players.length > 1 && !allReady && "All players must be ready"}
                  {canStart && "All ready! Click to start the game"}
                </p>
              </>
            ) : (
              <>
                <Button
                  onClick={onToggleReady}
                  className={`w-full ${
                    room.players.find(p => p.id === room.players.find(p => !p.isHost)?.id)?.isReady
                      ? 'bg-muted hover:bg-muted/80'
                      : 'bg-gradient-to-r from-primary to-secondary'
                  }`}
                  size="lg"
                >
                  {room.players.find(p => p.id === room.players.find(p => !p.isHost)?.id)?.isReady
                    ? 'Not Ready'
                    : 'Ready Up!'}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Waiting for host to start the game...
                </p>
              </>
            )}
          </div>
        </Card>

        {/* Game Info */}
        <Card className="glass p-6 border-purple-500/30">
          <h3 className="text-lg font-bold mb-4 text-center">Game Rules</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center space-y-2">
              <div className="text-3xl">📝</div>
              <p className="font-semibold">5 Rounds</p>
              <p className="text-xs text-muted-foreground">
                Each round: write prompt, AI generates, vote!
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl">⏱️</div>
              <p className="font-semibold">30 Seconds</p>
              <p className="text-xs text-muted-foreground">
                30s to write prompt, 30s to vote
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl">🏆</div>
              <p className="font-semibold">Vote to Win</p>
              <p className="text-xs text-muted-foreground">
                1 point per vote + 2 bonus for most votes
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
