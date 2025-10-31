import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Home, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
}

interface FinalScore {
  scores: Player[];
  winner: Player;
  allResults: Array<{round: number; word: string; votes: Record<string, number>; winner: string | string[]; scores: Array<{id: string; name: string; score: number}>}>;
}

interface FinalResultsProps {
  finalScores: FinalScore | null;
  onLeave: () => void;
}

export const FinalResults = ({ finalScores, onLeave }: FinalResultsProps) => {
  if (!finalScores) return null;

  const { scores, winner } = finalScores;
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="text-8xl animate-bounce">🏆</div>
          
          <h1 className="text-5xl md:text-6xl font-display font-black text-gradient">
            Game Over!
          </h1>
        </div>

        {/* Winner */}
        <Card className="glass p-12 border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 animate-scale-in">
          <div className="text-center space-y-6">
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto animate-pulse" />
            <div className="space-y-2">
              <h2 className="text-4xl font-display font-black text-gradient">
                Champion!
              </h2>
              <div className="flex items-center justify-center gap-3">
                <span className="text-6xl">{winner.avatar}</span>
                <div className="text-left">
                  <p className="text-3xl font-bold">{winner.name}</p>
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    <span className="text-2xl font-bold text-primary">{winner.score} points</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Final Leaderboard */}
        <Card className="glass p-8 border-primary/30">
          <h3 className="text-2xl font-bold text-center mb-6">Final Standings</h3>
          <div className="space-y-3">
            {sortedScores.map((player, idx) => {
              const isWinner = idx === 0;
              const medals = ['🥇', '🥈', '🥉'];
              
              return (
                <Card
                  key={player.id}
                  className={`glass p-6 border-2 transition-all animate-fade-in ${
                    isWinner
                      ? 'border-yellow-500/50 bg-yellow-500/5 scale-105'
                      : idx === 1
                      ? 'border-gray-400/30 bg-gray-400/5'
                      : idx === 2
                      ? 'border-orange-600/30 bg-orange-600/5'
                      : 'border-muted/20'
                  }`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">
                        {idx < 3 ? medals[idx] : `#${idx + 1}`}
                      </span>
                      <span className="text-4xl">{player.avatar}</span>
                      <div>
                        <p className="text-xl font-bold">{player.name}</p>
                        <Badge variant="outline" className={`mt-1 ${
                          isWinner ? 'border-yellow-500/50' : 'border-muted/30'
                        }`}>
                          {isWinner && '👑 '} {player.score} points
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(player.score, 10) }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                      {player.score > 10 && (
                        <span className="text-sm text-muted-foreground ml-1">
                          +{player.score - 10}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>

        {/* Game Stats */}
        <Card className="glass p-6 border-purple-500/30">
          <h3 className="text-lg font-bold text-center mb-4">Game Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">5</p>
              <p className="text-sm text-muted-foreground">Rounds Played</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">{scores.length}</p>
              <p className="text-sm text-muted-foreground">Players</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">{scores.reduce((sum, p) => sum + p.score, 0)}</p>
              <p className="text-sm text-muted-foreground">Total Votes</p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={onLeave}
            className="flex-1 bg-gradient-to-r from-primary to-secondary"
            size="lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
          <Link to="/" className="flex-1">
            <Button
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
