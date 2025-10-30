import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Pencil, Send, Clock, Sparkles } from "lucide-react";

interface Room {
  code: string;
  currentRound: number;
  maxRounds: number;
  players: Array<{id: string; name: string; avatar: string; isReady: boolean; isHost: boolean; score: number}>;
}

interface PromptPhaseProps {
  room: Room;
  word: string;
  timer: number;
  hasSubmitted: boolean;
  onSubmit: (prompt: string) => void;
  onLeave: () => void;
}

export const PromptPhase = ({ room, word, timer, hasSubmitted, onSubmit, onLeave }: PromptPhaseProps) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  const timePercent = (timer / 60) * 100;
  const isLowTime = timer <= 10;

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <Badge className="bg-blue-500/20 border-blue-500/30">
            Round {room.currentRound}/{room.maxRounds}
          </Badge>

          <h1 className="text-4xl md:text-5xl font-display font-black text-gradient">
            Write Your Prompt!
          </h1>

          {/* Timer */}
          <div className="flex items-center justify-center gap-4">
            <Clock className={`w-6 h-6 ${isLowTime ? 'text-destructive animate-pulse' : 'text-primary'}`} />
            <div className="text-5xl font-black font-mono">
              <span className={isLowTime ? 'text-destructive animate-pulse' : 'text-primary'}>
                {timer}s
              </span>
            </div>
          </div>
          <Progress 
            value={timePercent} 
            className={`h-2 ${isLowTime ? 'bg-destructive/20' : ''}`}
          />
        </div>

        {/* Word Display */}
        <Card className="glass p-12 border-primary/50 animate-scale-in">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold">Your Word</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-display font-black text-gradient uppercase tracking-wider">
              {word}
            </h2>
            <p className="text-muted-foreground">
              Write a creative prompt to generate an image of this word!
            </p>
          </div>
        </Card>

        {/* Prompt Input */}
        {!hasSubmitted ? (
          <Card className="glass p-8 border-secondary/30">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-lg font-semibold">
                  <Pencil className="w-5 h-5" />
                  Your Prompt
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Example: "A ${word} in a magical forest at sunset, glowing with mystical energy, digital art style..."`}
                  className="min-h-[150px] glass border-secondary/20 focus:border-secondary/50 text-lg"
                  maxLength={300}
                  autoFocus
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Be creative! Describe the style, mood, and details.</span>
                  <span>{prompt.length}/300</span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!prompt.trim() || prompt.length < 10}
                className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
                size="lg"
              >
                <Send className="w-5 h-5 mr-2" />
                Submit Prompt
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="glass p-8 border-primary/50 animate-scale-in">
            <div className="text-center space-y-4">
              <div className="text-6xl">✅</div>
              <h3 className="text-2xl font-bold text-gradient">
                Prompt Submitted!
              </h3>
              <p className="text-muted-foreground">
                Waiting for other players to finish...
              </p>
              <div className="glass p-4 rounded-lg border border-primary/20">
                <p className="text-sm font-semibold mb-2">Your Prompt:</p>
                <p className="text-sm text-muted-foreground italic">"{prompt}"</p>
              </div>
            </div>
          </Card>
        )}

        {/* Tips */}
        <Card className="glass p-6 border-purple-500/30">
          <h4 className="font-semibold mb-3 text-center">💡 Prompt Writing Tips</h4>
          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div className="text-center space-y-1">
              <p className="font-semibold">Be Specific</p>
              <p className="text-muted-foreground">Add details like colors, style, mood</p>
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold">Be Creative</p>
              <p className="text-muted-foreground">Unique ideas stand out!</p>
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold">Set the Scene</p>
              <p className="text-muted-foreground">Describe the environment & lighting</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
