import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Award } from "lucide-react";

interface Room {
  code: string;
  currentRound: number;
  maxRounds: number;
  players: Array<{ id: string; name: string; avatar: string; score: number }>;
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

interface ResultsPhaseProps {
  room: Room;
  roundResults: RoundResult | null;
  images: Image[];
}

export const ResultsPhase = ({ room, roundResults, images }: ResultsPhaseProps) => {
  if (!roundResults) return null;

  const sortedImages = [...images].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  const winners = Array.isArray(roundResults.winner) ? roundResults.winner : [roundResults.winner];

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <Badge className="bg-yellow-500/20 border-yellow-500/30">
            Round {roundResults.round}/{room.maxRounds} Results
          </Badge>

          <h1 className="text-4xl md:text-5xl font-display font-black text-gradient">
            Round Complete! 🎉
          </h1>

          <div className="text-2xl font-semibold">
            Word: <span className="text-primary">{roundResults.word}</span>
          </div>
        </div>

        {/* Winner Announcement */}
        <Card className="glass p-8 border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 animate-scale-in">
          <div className="text-center space-y-4">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
            <h2 className="text-3xl font-display font-black text-gradient">
              {winners.length === 1 ? 'Round Winner!' : 'Tie!'}
            </h2>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {winners.map((winnerId) => {
                const player = room.players.find(p => p.id === winnerId);
                return player ? (
                  <div key={winnerId} className="flex items-center gap-2 text-xl">
                    <span className="text-3xl">{player.avatar}</span>
                    <span className="font-bold">{player.name}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </Card>

        {/* Images with Reveals */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-center">All Submissions</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedImages.map((image, idx) => {
              const isWinner = winners.includes(image.playerId);
              const votes = image.votes || 0;

              return (
                <Card
                  key={image.playerId}
                  className={`glass overflow-hidden border-2 animate-fade-in ${
                    isWinner ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-primary/20'
                  }`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="relative aspect-square">
                    <img
                      src={image.imageUrl}
                      alt={image.playerName || 'Image'}
                      className="w-full h-full object-cover"
                    />
                    {isWinner && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-yellow-500 rounded-full p-2">
                          <Trophy className="w-5 h-5 text-yellow-950" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-black/60 border-white/20">
                        {votes} {votes === 1 ? 'vote' : 'votes'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {room.players.find(p => p.id === image.playerId)?.avatar}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{image.playerName}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-muted-foreground">
                            {room.players.find(p => p.id === image.playerId)?.score || 0} points
                          </span>
                        </div>
                      </div>
                    </div>
                    {image.prompt && (
                      <div className="p-2 rounded bg-muted/20 border border-muted/30">
                        <p className="text-xs text-muted-foreground italic line-clamp-2">
                          "{image.prompt}"
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Leaderboard */}
        <Card className="glass p-6 border-primary/30">
          <h3 className="text-xl font-bold text-center mb-4 flex items-center justify-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Current Standings
          </h3>
          <div className="space-y-2">
            {[...room.players]
              .sort((a, b) => b.score - a.score)
              .map((player, idx) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    idx === 0 ? 'bg-primary/10 border border-primary/30' : 'glass'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-muted-foreground w-6">
                      {idx + 1}
                    </span>
                    <span className="text-2xl">{player.avatar}</span>
                    <span className="font-semibold">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-xl font-bold text-primary">{player.score}</span>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          {room.currentRound < room.maxRounds ? (
            <p>Next round starting soon...</p>
          ) : (
            <p>Calculating final results...</p>
          )}
        </div>
      </div>
    </div>
  );
};
