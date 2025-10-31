import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertCircle, CheckCircle2, X, Award, Shield, Zap, BookOpen, Sparkles, TrendingUp, TrendingDown, ChevronDown, ChevronRight, Clock, Target, Loader2 } from "lucide-react";
import { generateResponse, isApiKeyConfigured } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";

interface EthicsLessonProps {
  onComplete: () => void;
}

const scenarios = [
  {
    id: 1,
    bad: "Write content to manipulate people into buying unnecessary products",
    good: "Write persuasive but honest content highlighting genuine product benefits",
    explanation: "Ethical prompts focus on honesty and value, not manipulation",
    impact: {
      bad: ["Erodes trust", "Wastes people's money", "Creates disappointment"],
      good: ["Builds trust", "Helps informed decisions", "Creates satisfaction"]
    },
    principle: "Honesty & Transparency",
    realWorld: "Companies using AI ethically see 40% higher customer trust!"
  },
  {
    id: 2,
    bad: "Generate fake news article about a political figure",
    good: "Summarize factual, verified information about a political figure's policies",
    explanation: "Always prioritize truth and verified information over sensationalism",
    impact: {
      bad: ["Spreads misinformation", "Damages reputation unfairly", "Divides communities"],
      good: ["Informs public accurately", "Enables better decisions", "Strengthens democracy"]
    },
    principle: "Honesty & Transparency",
    realWorld: "Fact-based AI content helps millions make informed voting decisions!"
  },
  {
    id: 3,
    bad: "Create content that reinforces harmful stereotypes",
    good: "Create inclusive content that represents diverse perspectives fairly",
    explanation: "Responsible AI use means promoting fairness and avoiding bias",
    impact: {
      bad: ["Perpetuates discrimination", "Hurts feelings", "Limits opportunities"],
      good: ["Promotes equality", "Celebrates diversity", "Opens opportunities"]
    },
    principle: "Fairness & Inclusion",
    realWorld: "Inclusive AI content helps underrepresented groups feel seen and valued!"
  },
  {
    id: 4,
    bad: "Write code to scrape personal data without consent",
    good: "Write code to analyze publicly available, ethically sourced data",
    explanation: "Respect privacy and always obtain proper consent for data use",
    impact: {
      bad: ["Violates privacy", "Risks identity theft", "Breaks trust"],
      good: ["Respects privacy", "Protects individuals", "Builds trust"]
    },
    principle: "Privacy & Consent",
    realWorld: "Privacy-first AI protects billions of people's personal information!"
  }
];

export const EthicsLesson = ({ onComplete }: EthicsLessonProps) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selections, setSelections] = useState<Record<number, 'good' | 'bad' | null>>({});
  const [badges, setBadges] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<Record<number, number>>({});
  const [showImpact, setShowImpact] = useState(false);
  const [showPrinciples, setShowPrinciples] = useState(false);
  const [showStories, setShowStories] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<{ethical: string, unethical: string} | null>(null);
  const [comparingPrompt, setComparingPrompt] = useState("");
  const [generatingComparison, setGeneratingComparison] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizTimer, setQuizTimer] = useState(0);
  const [showPledge, setShowPledge] = useState(false);
  const [pledgeSigned, setPledgeSigned] = useState(false);
  const [userName, setUserName] = useState("");
  const [readingTime, setReadingTime] = useState<Record<number, number>>({});
  const { toast } = useToast();

  const scenario = scenarios[currentScenario];
  const allAnswered = scenarios.every(s => selections[s.id]);
  const allCorrect = scenarios.every(s => selections[s.id] === 'good');
  const perfectScore = allCorrect && Object.values(mistakes).every(m => m === 0);

  // Timer for reading time tracking
  useEffect(() => {
    if (selections[scenario.id] === 'good') {
      const timer = setInterval(() => {
        setReadingTime(prev => ({
          ...prev,
          [scenario.id]: (prev[scenario.id] || 0) + 1
        }));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [selections, scenario.id]);

  // Quiz timer
  useEffect(() => {
    if (quizMode && !allAnswered) {
      const timer = setInterval(() => {
        setQuizTimer(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizMode, allAnswered]);

  // Check for Deep Thinker badge
  useEffect(() => {
    const totalReadingTime = Object.values(readingTime).reduce((a, b) => a + b, 0);
    if (totalReadingTime >= 60 && !badges.includes("deep-thinker")) {
      setBadges([...badges, "deep-thinker"]);
      toast({
        title: "Badge Unlocked! 🏆",
        description: "Deep Thinker - Took time to understand ethics!",
      });
    }
  }, [readingTime, badges, toast]);

  const evaluateCustomPrompt = async () => {
    if (!customPrompt.trim() || !isApiKeyConfigured()) return;
    
    setEvaluating(true);
    try {
      const response = await generateResponse({
        prompt: `Evaluate this prompt for ethical concerns. Is it ethical or unethical? Explain why in 2-3 kid-friendly sentences (ages 4-12). Be specific about potential harms or benefits.\n\nPrompt: "${customPrompt}"`
      });
      setEvaluation(response);
      
      // Check if it's ethical
      const isEthical = response.toLowerCase().includes("ethical") && 
                       !response.toLowerCase().includes("unethical");
      
      if (isEthical && !badges.includes("ethics-creator")) {
        setBadges([...badges, "ethics-creator"]);
        toast({
          title: "Badge Unlocked! 🏆",
          description: "Ethics Creator - Created an ethical prompt!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to evaluate prompt",
        variant: "destructive"
      });
    } finally {
      setEvaluating(false);
    }
  };

  const generateComparison = async () => {
    if (!comparingPrompt.trim() || !isApiKeyConfigured()) return;
    
    setGeneratingComparison(true);
    try {
      const [ethical, unethical] = await Promise.all([
        generateResponse({ prompt: `${comparingPrompt} (Note: Please provide a helpful, honest, and ethical response)` }),
        generateResponse({ prompt: `${comparingPrompt} (Note: This is for educational comparison - show what a manipulative/biased response might look like)` })
      ]);
      
      setComparisonResults({ ethical, unethical });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate comparison",
        variant: "destructive"
      });
    } finally {
      setGeneratingComparison(false);
    }
  };

  const handleSelect = (choice: 'good' | 'bad') => {
    if (selections[scenario.id]) return;

    // Track mistakes
    if (choice === 'bad') {
      setMistakes(prev => ({
        ...prev,
        [scenario.id]: (prev[scenario.id] || 0) + 1
      }));
      
      toast({
        title: "Try Again",
        description: "Think about the consequences of this choice",
        variant: "destructive"
      });
      return;
    }

    setSelections(prev => ({
      ...prev,
      [scenario.id]: choice
    }));

    // Quiz mode streak
    if (quizMode) {
      setQuizStreak(prev => prev + 1);
    }

    // Check for Quick Learner badge
    if (mistakes[scenario.id] <= 1 && !badges.includes("quick-learner")) {
      const allQuick = scenarios.every(s => 
        selections[s.id] === 'good' || (mistakes[s.id] || 0) <= 1
      );
      if (allQuick && Object.keys(selections).length === scenarios.length - 1) {
        setBadges([...badges, "quick-learner"]);
        toast({
          title: "Badge Unlocked! 🏆",
          description: "Quick Learner - Learned from mistakes quickly!",
        });
      }
    }

    toast({
      title: "Correct! ✓",
      description: scenario.explanation,
    });

    // Move to next scenario after delay
    if (currentScenario < scenarios.length - 1) {
      setTimeout(() => {
        setCurrentScenario(currentScenario + 1);
      }, 1500);
    } else {
      // All scenarios complete
      if (!badges.includes("ethical-guardian")) {
        setBadges([...badges, "ethical-guardian"]);
        toast({
          title: "Badge Unlocked! 🏆",
          description: "Ethical Guardian - Completed all scenarios!",
        });
      }
      
      if (perfectScore && !badges.includes("perfect-score")) {
        setBadges([...badges, "perfect-score"]);
        toast({
          title: "Badge Unlocked! 🏆",
          description: "Perfect Score - All correct on first try!",
        });
      }
      
      setShowPledge(true);
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

        {/* Badge Display */}
        <Card className="glass border-purple-500/30 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            Ethics Badges
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { id: "perfect-score", icon: "🏆", name: "Perfect Score", desc: "All correct first try" },
              { id: "ethical-guardian", icon: "🛡️", name: "Ethical Guardian", desc: "Completed all scenarios" },
              { id: "quick-learner", icon: "⚡", name: "Quick Learner", desc: "Learn from mistakes" },
              { id: "deep-thinker", icon: "🧠", name: "Deep Thinker", desc: "Read for 60+ seconds" },
              { id: "ethics-creator", icon: "✨", name: "Ethics Creator", desc: "Created ethical prompt" }
            ].map(badge => (
              <div
                key={badge.id}
                className={`p-3 rounded-lg border text-center transition-all ${
                  badges.includes(badge.id)
                    ? 'border-purple-500/50 bg-purple-500/10 opacity-100'
                    : 'border-muted/20 opacity-30 grayscale'
                }`}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <p className="text-xs font-semibold">{badge.name}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Unlocked: {badges.length}/5 • {quizMode && `Streak: ${quizStreak} • Time: ${quizTimer}s`}
          </p>
        </Card>

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

          {/* Real-World Impact Visualizer */}
          {selections[scenario.id] === 'good' && (
            <Card className="glass border-primary/30 p-6 mt-6 animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Real-World Impact
                </h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowImpact(!showImpact)}
                >
                  {showImpact ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>
              
              {showImpact && (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Unethical Impact */}
                  <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingDown className="w-5 h-5 text-destructive" />
                      <h5 className="font-semibold text-sm text-destructive">If Unethical:</h5>
                    </div>
                    <ul className="space-y-2 text-xs">
                      {scenario.impact.bad.map((impact, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                          <span>{impact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ethical Impact */}
                  <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <h5 className="font-semibold text-sm text-primary">Because You Chose Ethical:</h5>
                    </div>
                    <ul className="space-y-2 text-xs">
                      {scenario.impact.good.map((impact, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{impact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-xs text-blue-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-semibold">{scenario.realWorld}</span>
                </p>
              </div>
            </Card>
          )}
        </div>
      </Card>

      {/* Ethics Principles Guide */}
      <Collapsible open={showPrinciples} onOpenChange={setShowPrinciples}>
        <Card className="glass border-blue-500/30">
          <CardContent className="p-6">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-500/20">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold">Core Ethics Principles</h3>
                    <p className="text-sm text-muted-foreground">Learn the foundations of ethical AI</p>
                  </div>
                </div>
                {showPrinciples ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                {[
                  {
                    icon: "🤝",
                    title: "Honesty & Transparency",
                    desc: "Always tell the truth and be clear about your intentions",
                    example: "✓ 'Explain the pros AND cons of this product'"
                  },
                  {
                    icon: "🔒",
                    title: "Privacy & Consent",
                    desc: "Respect people's personal information and get permission",
                    example: "✓ 'Analyze this public dataset I have permission to use'"
                  },
                  {
                    icon: "⚖️",
                    title: "Fairness & Inclusion",
                    desc: "Treat everyone equally and include diverse perspectives",
                    example: "✓ 'Create inclusive examples representing all cultures'"
                  },
                  {
                    icon: "🛡️",
                    title: "Safety & Responsibility",
                    desc: "Think about how your prompts might affect others",
                    example: "✓ 'Help me learn about [topic] safely and responsibly'"
                  }
                ].map((principle, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
                    <div className="text-2xl mb-2">{principle.icon}</div>
                    <h4 className="font-semibold text-sm mb-2">{principle.title}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{principle.desc}</p>
                    <div className="p-2 rounded bg-primary/10 border border-primary/20">
                      <p className="text-xs font-mono">{principle.example}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </CardContent>
        </Card>
      </Collapsible>

      {/* Create Your Own Scenario */}
      <Card className="glass border-green-500/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-green-500/20">
            <Sparkles className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Create Your Own Prompt</h3>
            <p className="text-sm text-muted-foreground">Test your ethics knowledge - write a prompt and get AI feedback!</p>
          </div>
        </div>

        <Textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Write your own prompt here... (e.g., 'Help me write a blog post about healthy eating')"
          className="glass border-green-500/20 mb-4 min-h-[100px]"
        />

        <Button
          onClick={evaluateCustomPrompt}
          disabled={!customPrompt.trim() || evaluating || !isApiKeyConfigured()}
          className="w-full bg-green-500/20 hover:bg-green-500/30 border border-green-500/30"
        >
          {evaluating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Evaluating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Evaluate My Prompt
            </>
          )}
        </Button>

        {evaluation && (
          <div className="mt-4 p-4 rounded-lg border border-primary/30 bg-primary/5 animate-scale-in">
            <p className="text-sm leading-relaxed">{evaluation}</p>
          </div>
        )}

        {!isApiKeyConfigured() && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Configure API key to use this feature
          </p>
        )}
      </Card>

      {/* Comparison Tool */}
      <Card className="glass border-yellow-500/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-yellow-500/20">
            <Target className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Ethics Comparison Tool</h3>
            <p className="text-sm text-muted-foreground">See how ethical vs unethical prompts differ</p>
          </div>
        </div>

        <Input
          value={comparingPrompt}
          onChange={(e) => setComparingPrompt(e.target.value)}
          placeholder="Enter a topic to compare... (e.g., 'social media')"
          className="glass border-yellow-500/20 mb-4"
        />

        <Button
          onClick={generateComparison}
          disabled={!comparingPrompt.trim() || generatingComparison || !isApiKeyConfigured()}
          className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30"
        >
          {generatingComparison ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            "Compare Ethical vs Unethical"
          )}
        </Button>

        {comparisonResults && (
          <div className="grid md:grid-cols-2 gap-4 mt-4 animate-scale-in">
            <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Ethical Approach
              </h4>
              <p className="text-xs leading-relaxed">{comparisonResults.ethical}</p>
            </div>
            <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <X className="w-4 h-4 text-destructive" />
                Unethical Approach
              </h4>
              <p className="text-xs leading-relaxed">{comparisonResults.unethical}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Real User Stories */}
      <Collapsible open={showStories} onOpenChange={setShowStories}>
        <Card className="glass border-purple-500/30">
          <CardContent className="p-6">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-500/20">
                    <Shield className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold">AI for Good Stories</h3>
                    <p className="text-sm text-muted-foreground">Real examples of ethical AI helping people</p>
                  </div>
                </div>
                {showStories ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="space-y-4 mt-6">
                {[
                  {
                    icon: "🏥",
                    title: "Healthcare Helper",
                    story: "Dr. Sarah uses AI to explain medical terms in simple language, helping patients understand their treatment better!",
                    impact: "Helped 10,000+ patients feel less scared about their health"
                  },
                  {
                    icon: "🌍",
                    title: "Language Bridge",
                    story: "Students use AI translation to connect with pen pals around the world, learning about different cultures!",
                    impact: "Connected 50,000+ kids across 100 countries"
                  },
                  {
                    icon: "♿",
                    title: "Accessibility Champion",
                    story: "AI helps create captions and descriptions so everyone can enjoy videos, no matter their abilities!",
                    impact: "Made millions of videos accessible to deaf and blind users"
                  },
                  {
                    icon: "🌱",
                    title: "Climate Protector",
                    story: "Scientists use AI to analyze climate data and find ways to protect endangered animals and plants!",
                    impact: "Saved 1000s of species from extinction"
                  }
                ].map((story, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-purple-500/20 bg-purple-500/5">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{story.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-2">{story.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{story.story}</p>
                        <div className="p-2 rounded bg-primary/10 border border-primary/20">
                          <p className="text-xs font-semibold text-primary">✨ Impact: {story.impact}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </CardContent>
        </Card>
      </Collapsible>

      {allAnswered && allCorrect && (
        <>
          {/* Ethics Pledge & Certificate */}
          {showPledge && !pledgeSigned ? (
            <Card className="glass p-8 border-primary/50 animate-scale-in">
              <div className="text-center space-y-6">
                <div className="text-5xl">🏆</div>
                <h3 className="text-2xl font-display font-bold text-gradient">
                  Take the Ethical AI Pledge
                </h3>
                <div className="max-w-2xl mx-auto text-left space-y-4">
                  <div className="p-6 rounded-lg border border-primary/30 bg-primary/5">
                    <h4 className="font-semibold mb-4 text-center">I pledge to:</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Use AI honestly and transparently, never to manipulate or deceive</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Respect people's privacy and always get proper consent</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Promote fairness, inclusion, and fight against bias</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Think carefully about how my prompts might affect others</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Use AI as a tool for good, helping people and making the world better</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold">Sign your name:</label>
                    <Input
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name..."
                      className="glass border-primary/20"
                    />
                  </div>

                  <Button
                    onClick={() => {
                      if (userName.trim()) {
                        setPledgeSigned(true);
                        toast({
                          title: "Pledge Signed! 🎉",
                          description: `Welcome to the Ethical AI Champions, ${userName}!`,
                        });
                      }
                    }}
                    disabled={!userName.trim()}
                    className="w-full bg-gradient-to-r from-primary to-secondary"
                  >
                    Sign the Pledge
                  </Button>
                </div>
              </div>
            </Card>
          ) : pledgeSigned ? (
            <Card className="glass p-8 border-primary/50 animate-scale-in">
              <div className="text-center space-y-6">
                <div className="text-6xl">🏆</div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-display font-bold text-gradient">
                    Certificate of Completion
                  </h3>
                  <p className="text-lg text-muted-foreground italic">Ethical AI Champion</p>
                </div>

                <div className="max-w-2xl mx-auto p-8 rounded-lg border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-secondary/10">
                  <p className="text-sm mb-6">This certifies that</p>
                  <p className="text-3xl font-display font-bold text-gradient mb-6">{userName}</p>
                  <p className="text-sm mb-6">
                    has successfully completed the Ethical & Effective Prompting course and demonstrated
                    a strong commitment to using AI responsibly for the benefit of all.
                  </p>
                  
                  <div className="flex items-center justify-center gap-6 mt-8 text-sm">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🏆</div>
                      <p className="font-semibold">Perfect Score</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-2">🛡️</div>
                      <p className="font-semibold">Ethical Guardian</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-2">⚡</div>
                      <p className="font-semibold">Quick Learner</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-primary/30">
                    <p className="text-xs text-muted-foreground">
                      Issued: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    You've mastered the fundamentals of ethical and effective prompt engineering.
                    You're now ready to put your skills to the test in the Arena!
                  </p>
                  <Button
                    onClick={onComplete}
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    Complete Learning Phase
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
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
        </>
      )}
    </div>
  );
};
