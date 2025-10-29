import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Trophy, Users, Home, Swords } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const challenges = [
  "Write a prompt to generate a creative product name for a new eco-friendly water bottle",
  "Create a prompt that makes AI explain blockchain technology to a 10-year-old",
  "Design a prompt for writing an engaging opening paragraph for a sci-fi novel",
  "Craft a prompt for analyzing pros and cons of remote work vs office work",
  "Build an advanced prompt using chain-of-thought for solving a complex math word problem",
];

type GameState = "setup" | "playing" | "results" | "finished";

export const MultiplayerArena = () => {
  const [gameState, setGameState] = useState<GameState>("setup");
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [currentRound, setCurrentRound] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [player1Prompt, setPlayer1Prompt] = useState("");
  const [player2Prompt, setPlayer2Prompt] = useState("");
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [roundScores, setRoundScores] = useState<{ p1: number; p2: number }[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<any>(null);
  const { toast } = useToast();

  const startGame = () => {
    if (!player1Name.trim() || !player2Name.trim()) {
      toast({
        title: "Enter Names",
        description: "Both players must enter their names!",
        variant: "destructive",
      });
      return;
    }
    setGameState("playing");
  };

  const submitPrompt = () => {
    const prompt = currentPlayer === 1 ? player1Prompt : player2Prompt;
    
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please write a prompt before submitting!",
        variant: "destructive",
      });
      return;
    }

    const scores = evaluatePrompt(prompt);
    const totalScore = Math.round(
      (scores.clarity + scores.specificity + scores.creativity + scores.structure) / 4
    );
    
    setCurrentFeedback({ ...scores, total: totalScore });
    setGameState("results");
  };

  const nextTurn = () => {
    const totalScore = currentFeedback.total;
    
    if (currentPlayer === 1) {
      // Player 1 just finished, move to player 2
      setCurrentPlayer(2);
      setPlayer1Prompt("");
      setCurrentFeedback(null);
      setGameState("playing");
    } else {
      // Player 2 just finished, calculate round winner
      const p1RoundScore = roundScores.length > 0 ? roundScores[currentRound]?.p1 || 0 : 0;
      const p2RoundScore = totalScore;
      
      const newRoundScores = [...roundScores];
      if (newRoundScores[currentRound]) {
        newRoundScores[currentRound].p2 = p2RoundScore;
      } else {
        newRoundScores.push({ p1: p1RoundScore, p2: p2RoundScore });
      }
      setRoundScores(newRoundScores);
      
      const newP1Score = player1Score + (p1RoundScore > p2RoundScore ? 1 : 0);
      const newP2Score = player2Score + (p2RoundScore > p1RoundScore ? 1 : 0);
      setPlayer1Score(newP1Score);
      setPlayer2Score(newP2Score);
      
      if (currentRound < 4) {
        // More rounds to play
        setCurrentRound(currentRound + 1);
        setCurrentPlayer(1);
        setPlayer2Prompt("");
        setCurrentFeedback(null);
        setGameState("playing");
      } else {
        // Game finished
        setGameState("finished");
      }
    }
  };

  const savePlayer1Score = () => {
    const totalScore = currentFeedback.total;
    const newRoundScores = [...roundScores];
    if (newRoundScores[currentRound]) {
      newRoundScores[currentRound].p1 = totalScore;
    } else {
      newRoundScores.push({ p1: totalScore, p2: 0 });
    }
    setRoundScores(newRoundScores);
    nextTurn();
  };

  const resetGame = () => {
    setGameState("setup");
    setPlayer1Name("");
    setPlayer2Name("");
    setCurrentRound(0);
    setCurrentPlayer(1);
    setPlayer1Prompt("");
    setPlayer2Prompt("");
    setPlayer1Score(0);
    setPlayer2Score(0);
    setRoundScores([]);
    setCurrentFeedback(null);
  };

  if (gameState === "setup") {
    return (
      <div className="min-h-screen p-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4 animate-fade-in">
            <Link to="/">
              <Button variant="outline" className="mb-4 border-primary/30 hover:border-primary/50">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-secondary/30 text-sm font-medium">
              <Users className="w-4 h-4 text-secondary" />
              <span>Multiplayer Arena</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-display font-black text-gradient">
              Prompt Duel
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Battle your friend! 5 rounds, best prompts win. Enter your names to begin.
            </p>
          </div>

          <Card className="glass p-8 border-primary/30 animate-scale-in">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Player 1 Name</label>
                <Input
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  placeholder="Enter Player 1 name..."
                  className="glass border-primary/20 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Player 2 Name</label>
                <Input
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder="Enter Player 2 name..."
                  className="glass border-secondary/20 focus:border-secondary/50"
                />
              </div>

              <Button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-primary to-secondary"
                size="lg"
              >
                <Swords className="w-5 h-5 mr-2" />
                Start Battle
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (gameState === "finished") {
    const winner = player1Score > player2Score ? player1Name : player2Score > player1Score ? player2Name : "Tie";
    const isDraw = player1Score === player2Score;

    return (
      <div className="min-h-screen p-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-display font-black text-gradient">
              Battle Complete!
            </h1>
            
            <div className="text-6xl animate-scale-in">
              {isDraw ? "🤝" : "🏆"}
            </div>
            
            <p className="text-3xl font-bold">
              {isDraw ? "It's a Draw!" : `${winner} Wins!`}
            </p>
          </div>

          <Card className="glass p-8 border-primary/30">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded-lg ${player1Score > player2Score ? 'bg-primary/10 border-2 border-primary' : 'glass border border-primary/20'}`}>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Player 1</p>
                  <p className="text-2xl font-bold">{player1Name}</p>
                  <p className="text-4xl font-black text-primary">{player1Score}</p>
                  <p className="text-sm text-muted-foreground">rounds won</p>
                </div>
              </div>

              <div className={`p-6 rounded-lg ${player2Score > player1Score ? 'bg-secondary/10 border-2 border-secondary' : 'glass border border-secondary/20'}`}>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Player 2</p>
                  <p className="text-2xl font-bold">{player2Name}</p>
                  <p className="text-4xl font-black text-secondary">{player2Score}</p>
                  <p className="text-sm text-muted-foreground">rounds won</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h3 className="font-semibold text-center mb-4">Round by Round</h3>
              {roundScores.map((scores, idx) => (
                <div key={idx} className="flex items-center justify-between glass p-3 rounded-lg">
                  <span className="text-sm font-medium">Round {idx + 1}</span>
                  <div className="flex items-center gap-6">
                    <span className={`font-bold ${scores.p1 > scores.p2 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {player1Name}: {scores.p1}
                    </span>
                    <span className={`font-bold ${scores.p2 > scores.p1 ? 'text-secondary' : 'text-muted-foreground'}`}>
                      {player2Name}: {scores.p2}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button onClick={resetGame} className="flex-1" size="lg">
                Play Again
              </Button>
              <Link to="/leaderboard" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  <Trophy className="w-5 h-5 mr-2" />
                  Leaderboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const challenge = challenges[currentRound];
  const currentPlayerName = currentPlayer === 1 ? player1Name : player2Name;
  const currentPromptValue = currentPlayer === 1 ? player1Prompt : player2Prompt;
  const setCurrentPromptValue = currentPlayer === 1 ? setPlayer1Prompt : setPlayer2Prompt;

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-secondary/30 text-sm font-medium">
            <Users className="w-4 h-4 text-secondary" />
            <span>Round {currentRound + 1} of 5</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-black text-gradient">
            {currentPlayerName}'s Turn
          </h1>
        </div>

        {/* Score Display */}
        <Card className="glass p-6 border-primary/30">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-sm text-muted-foreground mb-1">{player1Name}</p>
              <Badge variant="outline" className="border-primary/30 text-xl px-4 py-2">
                <Trophy className="w-4 h-4 mr-2" />
                {player1Score}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-muted-foreground">VS</div>
            <div className="text-center flex-1">
              <p className="text-sm text-muted-foreground mb-1">{player2Name}</p>
              <Badge variant="outline" className="border-secondary/30 text-xl px-4 py-2">
                <Trophy className="w-4 h-4 mr-2" />
                {player2Score}
              </Badge>
            </div>
          </div>
          <Progress value={(currentRound / 5) * 100} className="h-2 mt-4" />
        </Card>

        {/* Challenge */}
        {gameState === "playing" && (
          <Card className="glass p-8 border-secondary/30 animate-scale-in">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Challenge</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {challenge}
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold block">Your Prompt</label>
                <Textarea
                  value={currentPromptValue}
                  onChange={(e) => setCurrentPromptValue(e.target.value)}
                  placeholder="Write your best prompt here..."
                  className="min-h-[150px] glass border-secondary/20 focus:border-secondary/50"
                />
              </div>

              <Button
                onClick={submitPrompt}
                className="w-full bg-gradient-to-r from-secondary to-secondary-glow"
                size="lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Submit Prompt
              </Button>
            </div>
          </Card>
        )}

        {/* Feedback */}
        {gameState === "results" && currentFeedback && (
          <Card className="glass p-8 border-primary/30 animate-fade-in-up">
            <h3 className="text-2xl font-display font-bold text-gradient mb-6">
              {currentPlayerName}'s Results
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {Object.entries(currentFeedback).filter(([key]) => key !== 'total').map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold capitalize">{key}</span>
                    <span className="text-lg font-bold text-primary">{String(value)}%</span>
                  </div>
                  <Progress value={value as number} className="h-2" />
                </div>
              ))}
            </div>

            <div className="glass p-6 rounded-lg border border-primary/20 mb-6">
              <p className="text-sm font-semibold mb-2">Round Score:</p>
              <p className="text-4xl font-display font-black text-gradient">{currentFeedback.total}/100</p>
            </div>

            <Button
              onClick={currentPlayer === 1 ? savePlayer1Score : nextTurn}
              className="w-full bg-gradient-to-r from-primary to-secondary"
              size="lg"
            >
              {currentPlayer === 1 ? `${player2Name}'s Turn` : currentRound < 4 ? 'Next Round' : 'See Results'}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

function evaluatePrompt(prompt: string): any {
  const baseScore = 60;
  const randomVariance = Math.floor(Math.random() * 20);
  
  const hasContext = prompt.length > 50;
  const hasSpecifics = /\b(specific|detailed|example|step|format)\b/i.test(prompt);
  const isCreative = /\b(creative|innovative|unique|interesting)\b/i.test(prompt);
  const isStructured = prompt.includes("role") || prompt.includes("act as") || prompt.includes(":");

  return {
    clarity: Math.min(100, baseScore + randomVariance + (hasContext ? 10 : 0)),
    specificity: Math.min(100, baseScore + randomVariance + (hasSpecifics ? 15 : 0)),
    creativity: Math.min(100, baseScore + randomVariance + (isCreative ? 12 : 0)),
    structure: Math.min(100, baseScore + randomVariance + (isStructured ? 8 : 0)),
  };
}
