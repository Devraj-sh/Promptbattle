import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import { AIOrb } from "../AIOrb";

interface SandboxLessonProps {
  onComplete: () => void;
}

export const SandboxLesson = ({ onComplete }: SandboxLessonProps) => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [experimented, setExperimented] = useState(false);

  const handleSubmit = () => {
    // Mock AI response based on prompt
    const mockResponse = generateMockResponse(prompt);
    setResponse(mockResponse);
    
    if (!experimented) {
      setExperimented(true);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="glass p-8 border-primary/30">
        <h2 className="text-3xl font-display font-bold text-gradient mb-4">
          🎯 Lesson 1: What is a Prompt?
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          A prompt is your instruction to the AI. Try different phrasings and see how the AI responds. 
          The clearer your prompt, the better the response!
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Your Prompt</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Try: 'Write a short story about a robot learning to paint'"
                className="min-h-[150px] glass border-primary/20 focus:border-primary/50"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              className="w-full bg-gradient-to-r from-primary to-primary-glow"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Response
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrompt("Write a haiku about technology")}
                className="border-secondary/30 hover:border-secondary/50"
              >
                Try Example 1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrompt("Explain quantum computing like I'm 5")}
                className="border-secondary/30 hover:border-secondary/50"
              >
                Try Example 2
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">AI Response</label>
              <div className="min-h-[150px] glass p-4 rounded-lg border border-primary/20">
                {response ? (
                  <p className="text-sm leading-relaxed">{response}</p>
                ) : (
                  <p className="text-muted-foreground text-sm italic">
                    Submit a prompt to see the AI's response...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-center">
        <AIOrb mood={response ? "happy" : "neutral"} intensity={response ? 1 : 0.5} />
      </div>

      {experimented && (
        <Card className="glass p-6 border-primary/50 animate-scale-in">
          <div className="text-center space-y-4">
            <div className="text-5xl">✨</div>
            <h3 className="text-2xl font-display font-bold text-gradient">
              Great Job!
            </h3>
            <p className="text-muted-foreground">
              You've discovered how prompts work! Notice how different wording changes the response?
            </p>
            <Button
              onClick={onComplete}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              Continue to Next Lesson
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

function generateMockResponse(prompt: string): string {
  const responses: Record<string, string> = {
    "haiku": "Silicon dreams flow,\nData streams through copper veins,\nFuture whispers code.",
    "quantum": "Imagine you have a magic coin that can be both heads AND tails at the same time until you look at it. That's kind of how quantum computers work - they use special 'quantum coins' to solve really hard problems much faster!",
    "robot": "ZX-7 stood before the blank canvas, its mechanical fingers trembling with uncertainty. For years, it had calculated, computed, and optimized. But painting? That was different. As it dipped the brush into vibrant blue paint, something unexpected happened - it felt... joy.",
    "default": `I understand you want me to help with: "${prompt.slice(0, 50)}..."\n\nBased on your prompt, I would focus on providing a clear, helpful response that addresses your specific request. The more detail you give me about what you need, the better I can assist you!`
  };

  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.includes("haiku")) return responses.haiku;
  if (lowerPrompt.includes("quantum") || lowerPrompt.includes("like i'm 5")) return responses.quantum;
  if (lowerPrompt.includes("robot") && lowerPrompt.includes("paint")) return responses.robot;
  
  return responses.default;
}
