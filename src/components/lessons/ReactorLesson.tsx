import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AIOrb } from "../AIOrb";

interface ReactorLessonProps {
  onComplete: () => void;
}

export const ReactorLesson = ({ onComplete }: ReactorLessonProps) => {
  const [tone, setTone] = useState(50);
  const [detail, setDetail] = useState(50);
  const [creativity, setCreativity] = useState(50);
  const [hasAdjusted, setHasAdjusted] = useState(false);

  const basePrompt = "Explain artificial intelligence";
  const generatedResponse = generateResponseFromSliders(tone, detail, creativity);

  const handleSliderChange = () => {
    if (!hasAdjusted) {
      setHasAdjusted(true);
    }
  };

  const orbIntensity = (tone + detail + creativity) / 150;

  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="glass p-8 border-primary/30">
        <h2 className="text-3xl font-display font-bold text-gradient mb-4">
          🧠 Lesson 2: How AI Interprets Prompts
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          AI responses change based on how you frame your prompt. Adjust the sliders to see how tone, detail level, and creativity affect the output.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-lg border border-primary/20">
              <p className="font-semibold mb-4">Base Prompt:</p>
              <p className="text-muted-foreground italic">"{basePrompt}"</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold">Tone</label>
                  <span className="text-xs text-muted-foreground">
                    {getToneLabel(tone)}
                  </span>
                </div>
                <Slider
                  value={[tone]}
                  onValueChange={(val) => {
                    setTone(val[0]);
                    handleSliderChange();
                  }}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold">Detail Level</label>
                  <span className="text-xs text-muted-foreground">
                    {getDetailLabel(detail)}
                  </span>
                </div>
                <Slider
                  value={[detail]}
                  onValueChange={(val) => {
                    setDetail(val[0]);
                    handleSliderChange();
                  }}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold">Creativity</label>
                  <span className="text-xs text-muted-foreground">
                    {getCreativityLabel(creativity)}
                  </span>
                </div>
                <Slider
                  value={[creativity]}
                  onValueChange={(val) => {
                    setCreativity(val[0]);
                    handleSliderChange();
                  }}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Response Display */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Generated Response</label>
              <div className="glass p-6 rounded-lg border border-primary/20 min-h-[300px]">
                <p className="text-sm leading-relaxed">{generatedResponse}</p>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <AIOrb mood="thinking" intensity={orbIntensity} />
            </div>
          </div>
        </div>
      </Card>

      {hasAdjusted && (
        <Card className="glass p-6 border-primary/50 animate-scale-in">
          <div className="text-center space-y-4">
            <div className="text-5xl">🎛️</div>
            <h3 className="text-2xl font-display font-bold text-gradient">
              Excellent Discovery!
            </h3>
            <p className="text-muted-foreground">
              You've learned how AI interpretation changes with different parameters. 
              This understanding is key to crafting effective prompts!
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

function getToneLabel(value: number): string {
  if (value < 25) return "Professional";
  if (value < 50) return "Neutral";
  if (value < 75) return "Casual";
  return "Playful";
}

function getDetailLabel(value: number): string {
  if (value < 25) return "Brief";
  if (value < 50) return "Moderate";
  if (value < 75) return "Detailed";
  return "Comprehensive";
}

function getCreativityLabel(value: number): string {
  if (value < 25) return "Factual";
  if (value < 50) return "Balanced";
  if (value < 75) return "Creative";
  return "Imaginative";
}

function generateResponseFromSliders(tone: number, detail: number, creativity: number): string {
  const toneLevel = Math.floor(tone / 25);
  const detailLevel = Math.floor(detail / 25);
  const creativityLevel = Math.floor(creativity / 25);

  const responses = {
    professional: {
      brief: "Artificial Intelligence refers to computer systems designed to perform tasks that typically require human intelligence.",
      moderate: "Artificial Intelligence (AI) encompasses machine learning, neural networks, and algorithms that enable systems to analyze data, recognize patterns, and make decisions with minimal human intervention.",
      detailed: "Artificial Intelligence represents a comprehensive field of computer science focused on creating systems capable of performing tasks that traditionally require human cognitive abilities, including visual perception, speech recognition, decision-making, and language translation.",
      comprehensive: "Artificial Intelligence is a multifaceted discipline within computer science that develops sophisticated systems capable of simulating human intelligence through machine learning algorithms, neural networks, natural language processing, computer vision, and automated reasoning, enabling machines to learn from experience and adapt to new inputs."
    },
    creative: {
      brief: "AI is like teaching computers to think! 🤖✨",
      moderate: "Imagine giving a computer a brain - that's AI! It learns patterns, makes decisions, and can even create art or write stories.",
      detailed: "Picture this: machines that can learn from their mistakes, recognize your face in photos, chat with you naturally, and even dream up new ideas. That's the magic of AI!",
      comprehensive: "Artificial Intelligence is humanity's attempt to create digital minds - systems that don't just follow instructions, but truly understand, learn, and evolve. From self-driving cars navigating busy streets to AI artists painting masterpieces, these silicon brains are reshaping our world in ways we're only beginning to imagine! 🚀🎨🧠"
    }
  };

  const toneKey = toneLevel < 2 ? 'professional' : 'creative';
  const detailKey = ['brief', 'moderate', 'detailed', 'comprehensive'][detailLevel] as keyof typeof responses.professional;

  return responses[toneKey][detailKey];
}
