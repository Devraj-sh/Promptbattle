import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Trophy, Target, Zap, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const levels = [
  { id: 1, name: "Beginner", icon: "🎯", challenge: "Write a prompt to generate a creative product name for a new eco-friendly water bottle" },
  { id: 2, name: "Explorer", icon: "🔍", challenge: "Create a prompt that makes AI explain blockchain technology to a 10-year-old" },
  { id: 3, name: "Creator", icon: "🎨", challenge: "Design a prompt for writing an engaging opening paragraph for a sci-fi novel" },
  { id: 4, name: "Strategist", icon: "♟️", challenge: "Craft a prompt for analyzing pros and cons of remote work vs office work" },
  { id: 5, name: "Prodigy", icon: "⚡", challenge: "Build an advanced prompt using chain-of-thought for solving a complex math word problem" },
];

export const Arena = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [userPrompt, setUserPrompt] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{
    clarity: number;
    specificity: number;
    creativity: number;
    structure: number;
    feedbackText?: string;
    tip?: string;
  } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const { toast } = useToast();

  const level = levels[currentLevel];

  // Memoize backend URL to avoid recalculation
  const backendUrl = useMemo(
    () => import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
    []
  );

  // Memoize XP value to avoid unnecessary localStorage reads
  const currentXP = useMemo(
    () => parseInt(localStorage.getItem('arena_xp') || '0'),
    [] // Calculate once on mount
  );

  const handleSubmit = useCallback(async () => {
    setIsEvaluating(true);
    
    try {
      // Call the backend AI evaluation API
      const response = await fetch(`${backendUrl}/api/evaluate-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userPrompt,
          challenge: level.challenge,
          levelId: level.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate prompt');
      }

      const evaluation = await response.json();
      
      // Extract scores and set feedback
      const scores = {
        clarity: evaluation.clarity,
        specificity: evaluation.specificity,
        creativity: evaluation.creativity,
        structure: evaluation.structure,
      };
      
      setFeedback({
        ...scores,
        feedbackText: evaluation.feedback,
        tip: evaluation.tip,
      });
      
      const totalScore = Math.round(
        (scores.clarity + scores.specificity + scores.creativity + scores.structure) / 4
      );
      setScore(totalScore);

      // Store progress
      const xpGained = totalScore;
      const currentXP = parseInt(localStorage.getItem('arena_xp') || '0');
      localStorage.setItem('arena_xp', (currentXP + xpGained).toString());

      // Leaderboard entry
      const username = localStorage.getItem('username') || 'Player';
      const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
      leaderboard.push({
        username,
        level: level.name,
        score: totalScore,
        creativity: scores.creativity,
        date: new Date().toISOString(),
      });
      localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

      toast({
        title: "AI Evaluation Complete!",
        description: `You earned ${totalScore} points!`,
      });
    } catch (error) {
      console.error('Evaluation error:', error);
      toast({
        title: "Evaluation Failed",
        description: "Unable to evaluate prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  }, [userPrompt, level, backendUrl, toast]);

  const handleNext = useCallback(() => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setUserPrompt("");
      setFeedback(null);
      setScore(0);
    }
  }, [currentLevel]);

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
            <Zap className="w-4 h-4 text-secondary" />
            <span>Solo Arena</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-display font-black text-gradient">
            Battle Arena
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Test your prompt engineering skills. Complete challenges, earn XP, and climb the leaderboard!
          </p>
        </div>

        {/* Level Progress */}
        <Card className="glass p-6 border-primary/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{level.icon}</div>
              <div>
                <h3 className="text-2xl font-display font-bold">{level.name}</h3>
                <p className="text-sm text-muted-foreground">Level {currentLevel + 1} of {levels.length}</p>
              </div>
            </div>
            <Badge variant="outline" className="border-primary/30 text-lg px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              {parseInt(localStorage.getItem('arena_xp') || '0')} XP
            </Badge>
          </div>
          <Progress value={(currentLevel / levels.length) * 100} className="h-2" />
        </Card>

        {/* Challenge */}
        <Card className="glass p-8 border-secondary/30 animate-scale-in">
          <div className="flex items-start gap-3 mb-6">
            <Target className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Challenge</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {level.challenge}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Your Prompt</label>
              <Textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Write your best prompt here..."
                className="min-h-[150px] glass border-secondary/20 focus:border-secondary/50"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!userPrompt.trim() || !!feedback || isEvaluating}
              className="w-full bg-gradient-to-r from-secondary to-secondary-glow"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {isEvaluating ? 'AI Evaluating...' : 'Submit Prompt'}
            </Button>
          </div>
        </Card>

        {/* Feedback */}
        {feedback && (
          <Card className="glass p-8 border-primary/30 animate-fade-in-up">
            <h3 className="text-2xl font-display font-bold text-gradient mb-6">
              AI Judge Feedback
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {['clarity', 'specificity', 'creativity', 'structure'].map((key) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold capitalize">{key}</span>
                    <span className="text-lg font-bold text-primary">{feedback[key]}%</span>
                  </div>
                  <Progress value={feedback[key]} className="h-2" />
                </div>
              ))}
            </div>

            <div className="glass p-6 rounded-lg border border-primary/20 mb-6">
              <p className="text-sm font-semibold mb-2">Overall Score:</p>
              <p className="text-4xl font-display font-black text-gradient">{score}/100</p>
            </div>

            {feedback.feedbackText && (
              <div className="glass p-6 rounded-lg border border-secondary/20 bg-secondary/5 mb-4">
                <p className="text-sm font-semibold mb-2">� AI Feedback:</p>
                <p className="text-sm text-muted-foreground">
                  {feedback.feedbackText}
                </p>
              </div>
            )}

            {feedback.tip && (
              <div className="glass p-6 rounded-lg border border-secondary/20 bg-secondary/5 mb-6">
                <p className="text-sm font-semibold mb-2">💡 Tip:</p>
                <p className="text-sm text-muted-foreground">
                  {feedback.tip}
                </p>
              </div>
            )}

            <Button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-primary to-secondary"
              size="lg"
              disabled={currentLevel >= levels.length - 1}
            >
              Next Challenge
            </Button>

            {currentLevel >= levels.length - 1 && (
              <Link to="/leaderboard" className="block mt-4">
                <Button variant="outline" className="w-full" size="lg">
                  <Trophy className="w-5 h-5 mr-2" />
                  View Leaderboard
                </Button>
              </Link>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};
