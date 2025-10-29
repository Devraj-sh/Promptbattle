import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MirrorLessonProps {
  onComplete: () => void;
}

const techniques = {
  "few-shot": {
    name: "Few-Shot Learning",
    description: "Provide examples to guide the AI's response style",
    template: `Here are some examples:
Input: "Happy"
Output: "Feeling joyful and content! 😊"

Input: "Tired"
Output: "Feeling exhausted and need rest 😴"

Now, respond to: "Excited"`,
    expectedPattern: "emotion → descriptive response with emoji"
  },
  "chain-of-thought": {
    name: "Chain-of-Thought",
    description: "Guide the AI through step-by-step reasoning",
    template: `Let's solve this step by step:
Problem: If a train leaves at 2 PM traveling 60 mph, and another leaves at 3 PM traveling 80 mph in the same direction, when will the second train catch up?

Step 1: Calculate the head start...
Step 2: Find the relative speed...
Step 3: Calculate catch-up time...`,
    expectedPattern: "breaking down into sequential steps"
  },
  "role-context": {
    name: "Role + Rich Context",
    description: "Combine role with detailed background information",
    template: `You are a marine biologist who has spent 20 years studying coral reefs. You've witnessed their decline firsthand and are passionate about conservation. 

Explain to a group of students why coral reefs are important, drawing from your personal research experience.`,
    expectedPattern: "speaking from expert persona with specific context"
  }
};

export const MirrorLesson = ({ onComplete }: MirrorLessonProps) => {
  const [activeTechnique, setActiveTechnique] = useState("few-shot");
  const [userPrompt, setUserPrompt] = useState("");
  const [hasExperimented, setHasExperimented] = useState(false);

  const currentTechnique = techniques[activeTechnique as keyof typeof techniques];

  const handleTryIt = () => {
    setUserPrompt(currentTechnique.template);
  };

  const handleGenerate = () => {
    if (!hasExperimented) {
      setHasExperimented(true);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="glass p-8 border-primary/30">
        <h2 className="text-3xl font-display font-bold text-gradient mb-4">
          ✨ Lesson 4: Advanced Prompting Techniques
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          Master advanced techniques that dramatically improve AI output quality.
          These methods are used by prompt engineering professionals.
        </p>

        <Tabs value={activeTechnique} onValueChange={setActiveTechnique} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 glass">
            <TabsTrigger value="few-shot">Few-Shot</TabsTrigger>
            <TabsTrigger value="chain-of-thought">Chain-of-Thought</TabsTrigger>
            <TabsTrigger value="role-context">Role + Context</TabsTrigger>
          </TabsList>

          {Object.entries(techniques).map(([key, technique]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div className="glass p-6 rounded-lg border border-primary/20">
                <h3 className="text-xl font-semibold mb-2">{technique.name}</h3>
                <p className="text-muted-foreground mb-4">{technique.description}</p>
                <div className="glass p-4 rounded border border-secondary/20 bg-navy/30">
                  <p className="text-xs text-muted-foreground mb-2">Key Pattern:</p>
                  <p className="text-sm font-mono text-secondary">{technique.expectedPattern}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold">Try This Technique</label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleTryIt}
                        className="border-secondary/30 hover:border-secondary/50"
                      >
                        Load Example
                      </Button>
                    </div>
                    <Textarea
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      placeholder="Write or load an example prompt..."
                      className="min-h-[250px] glass border-primary/20 focus:border-primary/50 font-mono text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleGenerate}
                    disabled={!userPrompt.trim()}
                    className="w-full bg-gradient-to-r from-primary to-secondary"
                  >
                    Generate Response
                  </Button>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Expected Response Type</label>
                  <div className="glass p-6 rounded-lg border border-primary/20 min-h-[300px]">
                    {userPrompt ? (
                      <div className="space-y-4">
                        <div className="text-sm text-primary font-semibold">
                          ✓ Using {technique.name}
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          The AI will respond by {technique.expectedPattern}, providing 
                          a more structured and controlled output compared to basic prompts.
                        </p>
                        {key === "few-shot" && (
                          <p className="text-sm text-secondary">
                            Example: "Feeling thrilled and full of energy! ⚡"
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm italic">
                        Load an example or write your own prompt to see how this technique works...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {hasExperimented && (
        <Card className="glass p-6 border-primary/50 animate-scale-in">
          <div className="text-center space-y-4">
            <div className="text-5xl">🎓</div>
            <h3 className="text-2xl font-display font-bold text-gradient">
              Advanced Techniques Mastered!
            </h3>
            <p className="text-muted-foreground">
              You now know how to use few-shot learning, chain-of-thought reasoning, and rich context.
              These techniques will make your prompts significantly more effective!
            </p>
            <Button
              onClick={onComplete}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              Continue to Final Lesson
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
