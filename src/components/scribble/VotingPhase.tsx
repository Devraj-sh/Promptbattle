import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Vote, Clock, Check } from "lucide-react";

interface Room {
  code: string;
  currentRound: number;
  maxRounds: number;
}

interface Image {
  playerId: string;
  playerName?: string;
  imageUrl: string;
  prompt?: string;
  votes?: number;
}

interface VotingPhaseProps {
  room: Room;
  images: Image[];
  timer: number;
  hasVoted: boolean;
  myPlayerId: string;
  onVote: (targetPlayerId: string) => void;
}

export const VotingPhase = ({ room, images, timer, hasVoted, myPlayerId, onVote }: VotingPhaseProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleVote = (imageId: string) => {
    if (!hasVoted && imageId !== myPlayerId) {
      setSelectedImage(imageId);
      onVote(imageId);
    }
  };

  const timePercent = (timer / 30) * 100;
  const isLowTime = timer <= 10;

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <Badge className="bg-green-500/20 border-green-500/30">
            Round {room.currentRound}/{room.maxRounds}
          </Badge>

          <h1 className="text-4xl md:text-5xl font-display font-black text-gradient">
            Vote for the Best! 🎨
          </h1>

          {/* Timer */}
          <div className="flex items-center justify-center gap-4">
            <Clock className={`w-6 h-6 ${isLowTime ? 'text-destructive animate-pulse' : 'text-green-500'}`} />
            <div className="text-5xl font-black font-mono">
              <span className={isLowTime ? 'text-destructive animate-pulse' : 'text-green-500'}>
                {timer}s
              </span>
            </div>
          </div>
          <Progress 
            value={timePercent} 
            className={`h-2 ${isLowTime ? 'bg-destructive/20' : 'bg-green-500/20'}`}
          />

          {hasVoted && (
            <Badge className="bg-primary/20 border-primary/30 animate-scale-in">
              <Check className="w-4 h-4 mr-1" />
              Vote Submitted!
            </Badge>
          )}
        </div>

        {/* Image Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, idx) => {
            const isMyImage = image.playerId === myPlayerId;
            const isSelected = selectedImage === image.playerId;

            return (
              <Card
                key={image.playerId}
                className={`glass overflow-hidden border-2 transition-all ${
                  isMyImage
                    ? 'border-yellow-500/50 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'border-primary ring-2 ring-primary/50 scale-105'
                    : hasVoted
                    ? 'opacity-50 cursor-not-allowed'
                    : 'border-muted/20 hover:border-primary/50 cursor-pointer hover:scale-105'
                }`}
                onClick={() => !isMyImage && !hasVoted && handleVote(image.playerId)}
              >
                <div className="relative aspect-square">
                  <img
                    src={image.imageUrl}
                    alt={`Option ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {isMyImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <Badge className="bg-yellow-500/20 border-yellow-500/50">
                        Your Image
                      </Badge>
                    </div>
                  )}
                  {isSelected && !isMyImage && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-primary rounded-full p-2">
                        <Check className="w-6 h-6 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {!isMyImage && !hasVoted && (
                    <Button
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(image.playerId);
                      }}
                    >
                      <Vote className="w-4 h-4 mr-2" />
                      Vote for This
                    </Button>
                  )}
                  {isMyImage && (
                    <p className="text-xs text-center text-muted-foreground">
                      Can't vote for your own image
                    </p>
                  )}
                  {!isMyImage && hasVoted && isSelected && (
                    <p className="text-sm text-center font-semibold text-primary">
                      ✓ Your Vote
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Instructions */}
        {!hasVoted && (
          <Card className="glass p-6 border-purple-500/30">
            <p className="text-center text-sm text-muted-foreground">
              <Vote className="w-4 h-4 inline mr-2" />
              Click on any image to vote • All images are anonymous • Can't vote for your own
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
