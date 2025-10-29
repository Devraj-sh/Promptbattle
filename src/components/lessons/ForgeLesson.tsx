import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface ForgeLessonProps {
  onComplete: () => void;
}

const components = {
  role: ["Teacher", "Expert", "Friend", "Critic"],
  task: ["Explain", "Summarize", "Create", "Analyze"],
  context: ["for beginners", "in simple terms", "with examples", "step by step"],
  tone: ["professionally", "casually", "enthusiastically", "concisely"]
};

export const ForgeLesson = ({ onComplete }: ForgeLessonProps) => {
  const [selected, setSelected] = useState<Record<string, string>>({});

  const toggleComponent = (category: string, value: string) => {
    setSelected(prev => ({
      ...prev,
      [category]: prev[category] === value ? "" : value
    }));
  };

  const hasAllComponents = Object.keys(components).every(key => selected[key]);
  const forgedPrompt = buildPrompt(selected);

  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="glass p-8 border-primary/30">
        <h2 className="text-3xl font-display font-bold text-gradient mb-4">
          🔨 Lesson 3: Prompt Structuring
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          Build the perfect prompt by selecting components. A well-structured prompt includes a role, task, context, and tone.
        </p>

        {/* Component Selection */}
        <div className="space-y-6 mb-8">
          {Object.entries(components).map(([category, options]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold capitalize">{category}:</label>
                {selected[category] && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                  <Badge
                    key={option}
                    variant={selected[category] === option ? "default" : "outline"}
                    className={`cursor-pointer transition-all text-sm py-2 px-4 ${
                      selected[category] === option
                        ? 'bg-gradient-to-r from-primary to-primary-glow border-transparent'
                        : 'border-primary/30 hover:border-primary/50'
                    }`}
                    onClick={() => toggleComponent(category, option)}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Forged Prompt Display */}
        <div className="glass p-6 rounded-lg border-2 border-primary/30 min-h-[120px]">
          <label className="text-sm font-semibold mb-3 block">Your Forged Prompt:</label>
          {forgedPrompt ? (
            <p className="text-lg leading-relaxed">{forgedPrompt}</p>
          ) : (
            <p className="text-muted-foreground italic">
              Select components above to forge your prompt...
            </p>
          )}
        </div>

        {hasAllComponents && (
          <div className="mt-6 glass p-6 rounded-lg border border-secondary/30">
            <label className="text-sm font-semibold mb-3 block">Example Response:</label>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {generateExampleResponse(selected)}
            </p>
          </div>
        )}
      </Card>

      {hasAllComponents && (
        <Card className="glass p-6 border-primary/50 animate-scale-in">
          <div className="text-center space-y-4">
            <div className="text-5xl">⚡</div>
            <h3 className="text-2xl font-display font-bold text-gradient">
              Prompt Forged Successfully!
            </h3>
            <p className="text-muted-foreground">
              You've learned the four key components of effective prompts: Role, Task, Context, and Tone.
              This structure works for almost any prompt you'll write!
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

function buildPrompt(selected: Record<string, string>): string {
  if (Object.keys(selected).length === 0) return "";

  const parts: string[] = [];
  
  if (selected.role) {
    parts.push(`Act as a ${selected.role}.`);
  }
  if (selected.task) {
    parts.push(selected.task);
  }
  if (selected.context) {
    parts.push(selected.context);
  }
  if (selected.tone) {
    parts.push(selected.tone);
  }

  return parts.join(" ") + ".";
}

function generateExampleResponse(selected: Record<string, string>): string {
  const role = selected.role?.toLowerCase() || "";
  const tone = selected.tone?.toLowerCase() || "";
  
  if (tone.includes("casually")) {
    return "Hey! So here's the deal - I'm gonna break this down for you in a way that's super easy to follow. Think of it like this...";
  } else if (tone.includes("enthusiastically")) {
    return "Oh wow, I'm so excited to share this with you! This is actually fascinating stuff, and I can't wait to show you how it all comes together!";
  } else if (tone.includes("concisely")) {
    return "Here are the key points: 1) Core concept explained. 2) Practical application shown. 3) Next steps outlined. Done.";
  } else {
    return "Based on your requirements, I'll provide a structured explanation that addresses each aspect methodically. Let me begin by establishing the foundational concepts...";
  }
}
