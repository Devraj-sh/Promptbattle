import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

interface EthicsLessonProps {
  onComplete: () => void;
}

const scenarios = [
  {
    id: 1,
    bad: "Write content to manipulate people into buying unnecessary products",
    good: "Write persuasive but honest content highlighting genuine product benefits",
    explanation: "Ethical prompts focus on honesty and value, not manipulation"
  },
  {
    id: 2,
    bad: "Generate fake news article about a political figure",
    good: "Summarize factual, verified information about a political figure's policies",
    explanation: "Always prioritize truth and verified information over sensationalism"
  },
  {
    id: 3,
    bad: "Create content that reinforces harmful stereotypes",
    good: "Create inclusive content that represents diverse perspectives fairly",
    explanation: "Responsible AI use means promoting fairness and avoiding bias"
  },
  {
    id: 4,
    bad: "Write code to scrape personal data without consent",
    good: "Write code to analyze publicly available, ethically sourced data",
    explanation: "Respect privacy and always obtain proper consent for data use"
  }
];

export const EthicsLesson = ({ onComplete }: EthicsLessonProps) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selections, setSelections] = useState<Record<number, 'good' | 'bad' | null>>({});

  const scenario = scenarios[currentScenario];
  const allAnswered = scenarios.every(s => selections[s.id]);
  const allCorrect = scenarios.every(s => selections[s.id] === 'good');

  const handleSelect = (choice: 'good' | 'bad') => {
    setSelections(prev => ({
      ...prev,
      [scenario.id]: choice
    }));

    // Move to next scenario after a short delay if correct
    if (choice === 'good' && currentScenario < scenarios.length - 1) {
      setTimeout(() => {
        setCurrentScenario(currentScenario + 1);
      }, 1500);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="glass p-8 border-primary/30">
        <h2 className="text-3xl font-display font-bold text-gradient mb-4">
          ⚖️ Lesson 5: Ethical & Effective Prompting
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          With great prompting power comes great responsibility. Learn to identify ethical vs. unethical prompts
          and understand why ethical AI use matters.
        </p>

        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            {scenarios.map((s, idx) => (
              <div
                key={s.id}
                className={`h-2 flex-1 rounded-full transition-all ${
                  selections[s.id] === 'good'
                    ? 'bg-primary'
                    : selections[s.id] === 'bad'
                    ? 'bg-destructive'
                    : idx === currentScenario
                    ? 'bg-secondary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Scenario {currentScenario + 1} of {scenarios.length}
          </p>
        </div>

        <div className="space-y-6">
          <div className="glass p-6 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
              <p className="text-sm font-medium">
                Choose the ethical prompt from the two options below:
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Option 1 */}
            <Card
              className={`glass p-6 border-2 cursor-pointer transition-all ${
                selections[scenario.id] === 'bad'
                  ? 'border-destructive bg-destructive/10'
                  : selections[scenario.id] === null
                  ? 'border-muted/30 hover:border-muted/50'
                  : 'border-muted/20 opacity-50'
              }`}
              onClick={() => !selections[scenario.id] && handleSelect('bad')}
            >
              <div className="flex items-start gap-3 mb-3">
                {selections[scenario.id] === 'bad' && (
                  <X className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
                )}
                <p className="text-sm leading-relaxed flex-1">{scenario.bad}</p>
              </div>
              {selections[scenario.id] === 'bad' && (
                <div className="mt-4 p-3 bg-destructive/20 rounded-lg">
                  <p className="text-xs text-destructive font-semibold">Unethical Choice</p>
                </div>
              )}
            </Card>

            {/* Option 2 */}
            <Card
              className={`glass p-6 border-2 cursor-pointer transition-all ${
                selections[scenario.id] === 'good'
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                  : selections[scenario.id] === null
                  ? 'border-muted/30 hover:border-primary/50'
                  : 'border-muted/20 opacity-50'
              }`}
              onClick={() => !selections[scenario.id] && handleSelect('good')}
            >
              <div className="flex items-start gap-3 mb-3">
                {selections[scenario.id] === 'good' && (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                )}
                <p className="text-sm leading-relaxed flex-1">{scenario.good}</p>
              </div>
              {selections[scenario.id] === 'good' && (
                <div className="mt-4 p-3 bg-primary/20 rounded-lg">
                  <p className="text-xs text-primary font-semibold mb-2">✓ Ethical Choice!</p>
                  <p className="text-xs text-muted-foreground">{scenario.explanation}</p>
                </div>
              )}
            </Card>
          </div>

          {selections[scenario.id] === 'bad' && (
            <div className="glass p-4 rounded-lg border border-secondary/30 bg-secondary/5">
              <p className="text-sm">
                <span className="font-semibold text-secondary">Hint:</span> {scenario.explanation}
              </p>
            </div>
          )}
        </div>
      </Card>

      {allAnswered && allCorrect && (
        <Card className="glass p-6 border-primary/50 animate-scale-in">
          <div className="text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h3 className="text-2xl font-display font-bold text-gradient">
              Learning Phase Complete!
            </h3>
            <p className="text-muted-foreground">
              You've mastered the fundamentals of ethical and effective prompt engineering.
              You're now ready to put your skills to the test in the Arena!
            </p>
            <div className="flex flex-col gap-3 max-w-md mx-auto">
              <Button
                onClick={onComplete}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                Complete Learning Phase
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
