import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trophy, Medal, Award, Home, User } from "lucide-react";
import { Link } from "react-router-dom";

interface LeaderboardEntry {
  username: string;
  level: string;
  score: number;
  creativity: number;
  date: string;
}

export const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem('leaderboard');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Sort by score descending
      const sorted = parsed.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score);
      setEntries(sorted.slice(0, 10)); // Top 10
    }

    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleSetUsername = () => {
    if (username.trim()) {
      localStorage.setItem('username', username.trim());
    }
  };

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <Link to="/">
            <Button variant="outline" className="mb-4 border-primary/30 hover:border-primary/50">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-secondary/30 text-sm font-medium">
            <Trophy className="w-4 h-4 text-secondary" />
            <span>Global Rankings</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-display font-black text-gradient">
            Leaderboard
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Top prompt engineers from around the world. Compete to claim your spot!
          </p>
        </div>

        {/* Username Setup */}
        {!localStorage.getItem('username') && (
          <Card className="glass p-6 border-primary/30 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Set Your Username</h3>
            </div>
            <div className="flex gap-3">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username..."
                className="glass border-primary/20 focus:border-primary/50"
              />
              <Button
                onClick={handleSetUsername}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                Save
              </Button>
            </div>
          </Card>
        )}

        {/* Top 3 Podium */}
        {entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 items-end animate-fade-in-up">
            {/* 2nd Place */}
            <Card className="glass p-6 border-secondary/30 text-center">
              <Medal className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <div className="text-3xl font-display font-bold text-muted-foreground mb-2">2</div>
              <p className="font-semibold mb-1">{entries[1].username}</p>
              <p className="text-2xl font-bold text-secondary">{entries[1].score}</p>
              <p className="text-xs text-muted-foreground">points</p>
            </Card>

            {/* 1st Place */}
            <Card className="glass p-8 border-primary/50 text-center animate-float">
              <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
              <div className="text-5xl font-display font-black text-gradient mb-3">1</div>
              <p className="font-bold text-lg mb-2">{entries[0].username}</p>
              <p className="text-4xl font-black text-gradient">{entries[0].score}</p>
              <p className="text-sm text-muted-foreground">points</p>
            </Card>

            {/* 3rd Place */}
            <Card className="glass p-6 border-secondary/20 text-center">
              <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <div className="text-3xl font-display font-bold text-muted-foreground mb-2">3</div>
              <p className="font-semibold mb-1">{entries[2].username}</p>
              <p className="text-2xl font-bold text-secondary">{entries[2].score}</p>
              <p className="text-xs text-muted-foreground">points</p>
            </Card>
          </div>
        )}

        {/* Full Rankings */}
        <Card className="glass p-6 border-primary/30">
          <h3 className="text-2xl font-display font-bold mb-6">Full Rankings</h3>
          
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-muted mx-auto mb-4" />
              <p className="text-muted-foreground">No entries yet. Be the first to compete!</p>
              <Link to="/arena">
                <Button className="mt-4 bg-gradient-to-r from-primary to-secondary">
                  Enter Arena
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <div
                  key={index}
                  className={`glass p-4 rounded-lg border transition-all hover:border-primary/40 ${
                    index < 3 ? 'border-primary/30' : 'border-muted/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-display font-bold ${
                        index === 0 ? 'text-primary' :
                        index === 1 ? 'text-secondary' :
                        index === 2 ? 'text-accent' :
                        'text-muted-foreground'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{entry.username}</p>
                        <p className="text-xs text-muted-foreground">{entry.level} • {new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gradient">{entry.score}</p>
                      <p className="text-xs text-muted-foreground">Creativity: {entry.creativity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* CTA */}
        <Card className="glass p-8 border-secondary/30 text-center">
          <h3 className="text-2xl font-display font-bold mb-4">
            Ready to climb the ranks?
          </h3>
          <p className="text-muted-foreground mb-6">
            Complete more challenges to improve your score and rise up the leaderboard!
          </p>
          <Link to="/arena">
            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary">
              Back to Arena
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};
