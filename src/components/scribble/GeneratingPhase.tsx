import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";

interface Room {
  code: string;
  currentRound: number;
  maxRounds: number;
}

interface GeneratingPhaseProps {
  room: Room;
  word: string;
}

export const GeneratingPhase = ({ room, word }: GeneratingPhaseProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto space-y-8 text-center">
        <Badge className="bg-purple-500/20 border-purple-500/30">
          Round {room.currentRound}/{room.maxRounds}
        </Badge>

        <Card className="glass p-12 border-primary/50 animate-scale-in">
          <div className="space-y-8">
            <div className="flex justify-center">
              <Loader2 className="w-20 h-20 text-primary animate-spin" />
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-display font-black text-gradient">
                AI is Creating Magic! ✨
              </h2>
              <p className="text-xl text-muted-foreground">
                Generating images for: <span className="font-bold text-foreground">{word}</span>
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 animate-pulse">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <p className="text-sm text-muted-foreground">Processing prompts...</p>
              </div>
              <div className="flex items-center justify-center gap-2 animate-pulse animate-delay-200">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <p className="text-sm text-muted-foreground">Creating unique images...</p>
              </div>
              <div className="flex items-center justify-center gap-2 animate-pulse animate-delay-400">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <p className="text-sm text-muted-foreground">Adding final touches...</p>
              </div>
            </div>

            <div className="pt-6">
              <p className="text-sm text-muted-foreground">
                Get ready to vote for your favorite!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
