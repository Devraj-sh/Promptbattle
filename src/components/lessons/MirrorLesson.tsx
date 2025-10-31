import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { generateLessonResponse, isApiKeyConfigured } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";

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
    expectedPattern: "emotion → descriptive response with emoji",
    basicPrompt: "Tell me about feeling excited",
    whyBetter: "Examples teach AI the exact style and format you want, instead of AI guessing!",
    useCases: [
      "🎨 Creative writing with specific styles",
      "🌍 Translations with tone matching",
      "📊 Data formatting (like CSV or JSON)",
      "✍️ Writing with consistent voice"
    ]
  },
  "chain-of-thought": {
    name: "Chain-of-Thought",
    description: "Guide the AI through step-by-step reasoning",
    template: `Let's solve this step by step:
Problem: If a train leaves at 2 PM traveling 60 mph, and another leaves at 3 PM traveling 80 mph in the same direction, when will the second train catch up?

Step 1: Calculate the head start...
Step 2: Find the relative speed...
Step 3: Calculate catch-up time...`,
    expectedPattern: "breaking down into sequential steps",
    basicPrompt: "When will the second train catch the first train?",
    whyBetter: "Step-by-step thinking helps AI show its work and catch mistakes, making answers more accurate!",
    useCases: [
      "🧮 Math problems & calculations",
      "🧩 Logic puzzles & brain teasers",
      "🔬 Science explanations",
      "🤔 Complex decision-making"
    ]
  },
  "role-context": {
    name: "Role + Rich Context",
    description: "Combine role with detailed background information",
    template: `You are a marine biologist who has spent 20 years studying coral reefs. You've witnessed their decline firsthand and are passionate about conservation. 

Explain to a group of students why coral reefs are important, drawing from your personal research experience.`,
    expectedPattern: "speaking from expert persona with specific context",
    basicPrompt: "Why are coral reefs important?",
    whyBetter: "Giving AI a role with experience makes it answer like a real expert with passion and details!",
    useCases: [
      "👨‍🏫 Getting expert explanations",
      "📚 Educational tutoring",
      "💼 Professional advice",
      "🎭 Character-based storytelling"
    ]
  }
};

export const MirrorLesson = ({ onComplete }: MirrorLessonProps) => {
  const [activeTechnique, setActiveTechnique] = useState("few-shot");
  const [userPrompt, setUserPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasExperimented, setHasExperimented] = useState(false);
  const [customExamples, setCustomExamples] = useState<Array<{ input: string; output: string }>>([
    { input: "", output: "" }
  ]);
  const [showInteractive, setShowInteractive] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [challengeResult, setChallengeResult] = useState<"correct" | "incorrect" | null>(null);
  const { toast } = useToast();

  const currentTechnique = techniques[activeTechnique as keyof typeof techniques];

  const challenges: Record<string, { question: string; keywords: string[] }> = {
    "few-shot": {
      question: "You want AI to format city names like 'New York → NY'. Write a prompt with 2-3 examples to teach this pattern.",
      keywords: ["input", "output", "example", "→", ":", "format"]
    },
    "chain-of-thought": {
      question: "Ask AI to calculate: 'If Sarah has 5 apples and gives 2 to Tom, then buys 3 more, how many does she have?' Use step-by-step.",
      keywords: ["step", "first", "then", "next", "calculate", "solve"]
    },
    "role-context": {
      question: "Ask AI to explain photosynthesis as a botanist with 15 years of plant research experience, talking to middle school students.",
      keywords: ["botanist", "years", "experience", "explain", "students", "photosynthesis"]
    }
  };

  const checkChallenge = () => {
    const currentChallenge = challenges[activeTechnique];
    const answer = challengeAnswer.toLowerCase();
    const matchCount = currentChallenge.keywords.filter(keyword => 
      answer.includes(keyword.toLowerCase())
    ).length;

    if (matchCount >= 3) {
      setChallengeResult("correct");
      toast({
        title: "Challenge Passed! 🎉",
        description: "You understand how to use this technique!",
      });
    } else {
      setChallengeResult("incorrect");
      toast({
        title: "Try Again! 💪",
        description: `Hint: Include words like "${currentChallenge.keywords.slice(0, 3).join('", "')}"`,
        variant: "destructive",
      });
    }
  };

  const handleTryIt = () => {
    setUserPrompt(currentTechnique.template);
    setShowInteractive(false);
  };

  const addExample = () => {
    setCustomExamples([...customExamples, { input: "", output: "" }]);
  };

  const removeExample = (index: number) => {
    const newExamples = customExamples.filter((_, i) => i !== index);
    setCustomExamples(newExamples.length > 0 ? newExamples : [{ input: "", output: "" }]);
  };

  const updateExample = (index: number, field: 'input' | 'output', value: string) => {
    const newExamples = [...customExamples];
    newExamples[index][field] = value;
    setCustomExamples(newExamples);
  };

  const buildCustomPrompt = () => {
    if (activeTechnique === "few-shot") {
      const examplesText = customExamples
        .filter(ex => ex.input.trim() && ex.output.trim())
        .map(ex => `Input: "${ex.input}"\nOutput: "${ex.output}"`)
        .join('\n\n');
      
      if (examplesText) {
        setUserPrompt(`Here are some examples:\n${examplesText}\n\nNow, respond to: "[Your input here]"`);
        toast({
          title: "Examples Built!",
          description: "Edit the prompt to add your test input.",
        });
      } else {
        toast({
          title: "Add Examples First",
          description: "Fill in at least one input-output pair.",
          variant: "destructive",
        });
      }
    }
  };

  const handleGenerate = async () => {
    if (!userPrompt.trim()) return;

    setIsLoading(true);
    setResponse("");

    try {
      // Add context about the technique to the prompt
      const contextualPrompt = `[Learning ${currentTechnique.name}: ${currentTechnique.description}]\n\n${userPrompt}`;
      
      const aiResponse = await generateLessonResponse(contextualPrompt);
      setResponse(aiResponse);
      
      // Unlock badge for this technique
      if (!unlockedBadges.includes(activeTechnique)) {
        setUnlockedBadges([...unlockedBadges, activeTechnique]);
        const badgeNames: Record<string, string> = {
          "few-shot": "🎯 Few-Shot Master",
          "chain-of-thought": "🧠 Step-by-Step Thinker",
          "role-context": "👤 Context Creator"
        };
        toast({
          title: "Badge Unlocked! 🏆",
          description: badgeNames[activeTechnique],
        });
      }
      
      if (!hasExperimented) {
        setHasExperimented(true);
      }

      toast({
        title: "Response Generated!",
        description: `See how ${currentTechnique.name} improves the output.`,
      });
    } catch (error) {
      console.error("Error generating response:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating the response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Badge Progress */}
      {unlockedBadges.length > 0 && (
        <Card className="glass p-4 border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <span className="text-sm font-semibold">Badges Unlocked: {unlockedBadges.length}/3</span>
            </div>
            <div className="flex gap-2">
              <span className={`text-2xl ${unlockedBadges.includes('few-shot') ? 'opacity-100' : 'opacity-30 grayscale'}`}>🎯</span>
              <span className={`text-2xl ${unlockedBadges.includes('chain-of-thought') ? 'opacity-100' : 'opacity-30 grayscale'}`}>🧠</span>
              <span className={`text-2xl ${unlockedBadges.includes('role-context') ? 'opacity-100' : 'opacity-30 grayscale'}`}>👤</span>
            </div>
          </div>
          {unlockedBadges.length === 3 && (
            <p className="text-xs text-center mt-2 text-primary animate-pulse">
              🎉 All techniques mastered! You're a prompt engineering pro!
            </p>
          )}
        </Card>
      )}

      <Card className="glass p-8 border-primary/30">
        <h2 className="text-3xl font-display font-bold text-gradient mb-4">
          ✨ Lesson 4: Advanced Prompting Techniques
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          Master advanced techniques that dramatically improve AI output quality.
          These methods are used by prompt engineering professionals.
        </p>

        {/* Before/After Comparison */}
        <div className="glass p-6 rounded-lg border border-yellow-500/30 bg-yellow-500/5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⚡</span>
            <h3 className="text-lg font-semibold">See the Difference!</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">❌</span>
                <span className="text-sm font-bold text-red-400">Basic Prompt</span>
              </div>
              <div className="glass p-3 rounded border border-red-500/30 bg-red-500/5">
                <p className="text-sm text-muted-foreground italic">
                  "{currentTechnique.basicPrompt}"
                </p>
                <p className="text-xs text-red-400 mt-2">
                  → Generic answer, AI guesses what you want
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <span className="text-sm font-bold text-green-400">With {currentTechnique.name}</span>
              </div>
              <div className="glass p-3 rounded border border-green-500/30 bg-green-500/5">
                <p className="text-sm text-muted-foreground">
                  Uses examples, steps, or expert role...
                </p>
                <p className="text-xs text-green-400 mt-2">
                  → {currentTechnique.whyBetter}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTechnique} onValueChange={setActiveTechnique} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 glass">
            <TabsTrigger value="few-shot">Few-Shot</TabsTrigger>
            <TabsTrigger value="chain-of-thought">Chain-of-Thought</TabsTrigger>
            <TabsTrigger value="role-context">Role + Context</TabsTrigger>
          </TabsList>

          {Object.entries(techniques).map(([key, technique]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div className={`glass p-6 rounded-lg border ${
                key === 'few-shot' ? 'border-blue-500/30 bg-blue-500/5' :
                key === 'chain-of-thought' ? 'border-green-500/30 bg-green-500/5' :
                'border-purple-500/30 bg-purple-500/5'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {key === 'few-shot' && <span className="text-2xl">🎯</span>}
                  {key === 'chain-of-thought' && <span className="text-2xl">🧠</span>}
                  {key === 'role-context' && <span className="text-2xl">👤</span>}
                  <h3 className={`text-xl font-semibold ${
                    key === 'few-shot' ? 'text-blue-400' :
                    key === 'chain-of-thought' ? 'text-green-400' :
                    'text-purple-400'
                  }`}>{technique.name}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{technique.description}</p>
                <div className={`glass p-4 rounded border ${
                  key === 'few-shot' ? 'border-blue-500/20 bg-blue-500/10' :
                  key === 'chain-of-thought' ? 'border-green-500/20 bg-green-500/10' :
                  'border-purple-500/20 bg-purple-500/10'
                }`}>
                  <p className="text-xs text-muted-foreground mb-2">🔑 Key Pattern:</p>
                  <p className={`text-sm font-mono ${
                    key === 'few-shot' ? 'text-blue-400' :
                    key === 'chain-of-thought' ? 'text-green-400' :
                    'text-purple-400'
                  }`}>{technique.expectedPattern}</p>
                </div>

                {/* Real-World Use Cases */}
                <div className="mt-4 glass p-4 rounded border border-primary/20">
                  <p className="text-xs font-semibold text-primary mb-2">💡 When to use this technique:</p>
                  <ul className="space-y-1">
                    {technique.useCases.map((useCase, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground">{useCase}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Interactive Example Builder (Few-Shot only) */}
              {key === 'few-shot' && (
                <div className="glass p-6 rounded-lg border border-blue-500/30 bg-blue-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🎮</span>
                      <h4 className="text-lg font-semibold text-blue-400">Build Your Own Examples!</h4>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowInteractive(!showInteractive)}
                      className="border-blue-500/30 hover:border-blue-500/50"
                    >
                      {showInteractive ? "Hide" : "Show"} Builder
                    </Button>
                  </div>
                  
                  {showInteractive && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Create your own input-output pairs to teach AI your style:
                      </p>
                      
                      {customExamples.map((example, index) => (
                        <div key={index} className="glass p-4 rounded border border-blue-500/20 space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-blue-400">Example {index + 1}</span>
                            {customExamples.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeExample(index)}
                                className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                              >
                                ✕
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-muted-foreground">Input:</label>
                              <input
                                type="text"
                                value={example.input}
                                onChange={(e) => updateExample(index, 'input', e.target.value)}
                                placeholder="e.g., Happy"
                                className="w-full px-3 py-2 text-sm glass rounded border border-blue-500/20 focus:border-blue-500/50 bg-background"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Output:</label>
                              <input
                                type="text"
                                value={example.output}
                                onChange={(e) => updateExample(index, 'output', e.target.value)}
                                placeholder="e.g., Feeling joyful! 😊"
                                className="w-full px-3 py-2 text-sm glass rounded border border-blue-500/20 focus:border-blue-500/50 bg-background"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={addExample}
                          className="border-blue-500/30 hover:border-blue-500/50"
                        >
                          + Add Example
                        </Button>
                        <Button
                          size="sm"
                          onClick={buildCustomPrompt}
                          className="bg-gradient-to-r from-blue-500 to-blue-600"
                        >
                          Build Prompt from Examples
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Visual Flowchart for Chain-of-Thought */}
              {key === 'chain-of-thought' && (
                <div className="glass p-6 rounded-lg border border-green-500/30 bg-green-500/5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">📊</span>
                    <h4 className="text-lg font-semibold text-green-400">Step-by-Step Flow</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="glass p-3 rounded-lg border border-green-500/30 bg-green-500/10 flex-1 text-center">
                        <div className="text-2xl mb-1">🤔</div>
                        <p className="text-xs font-semibold text-green-400">Step 1</p>
                        <p className="text-xs text-muted-foreground mt-1">Understand the problem</p>
                      </div>
                      <span className="text-green-400 text-xl">→</span>
                      <div className="glass p-3 rounded-lg border border-green-500/30 bg-green-500/10 flex-1 text-center">
                        <div className="text-2xl mb-1">🔍</div>
                        <p className="text-xs font-semibold text-green-400">Step 2</p>
                        <p className="text-xs text-muted-foreground mt-1">Break it down</p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <span className="text-green-400 text-xl">↓</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="glass p-3 rounded-lg border border-green-500/30 bg-green-500/10 flex-1 text-center">
                        <div className="text-2xl mb-1">💡</div>
                        <p className="text-xs font-semibold text-green-400">Step 3</p>
                        <p className="text-xs text-muted-foreground mt-1">Solve each part</p>
                      </div>
                      <span className="text-green-400 text-xl">→</span>
                      <div className="glass p-3 rounded-lg border border-green-500/30 bg-green-500/10 flex-1 text-center">
                        <div className="text-2xl mb-1">✅</div>
                        <p className="text-xs font-semibold text-green-400">Final</p>
                        <p className="text-xs text-muted-foreground mt-1">Combine answers</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    💡 Each arrow shows AI's thinking process!
                  </p>
                </div>
              )}

              {/* Challenge Mode */}
              <div className="glass p-6 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    <h4 className="text-lg font-semibold text-yellow-500">Challenge Mode!</h4>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowChallenge(!showChallenge);
                      setChallengeAnswer("");
                      setChallengeResult(null);
                    }}
                    className="border-yellow-500/30 hover:border-yellow-500/50"
                  >
                    {showChallenge ? "Hide" : "Try"} Challenge
                  </Button>
                </div>

                {showChallenge && (
                  <div className="space-y-4">
                    <div className="glass p-4 rounded border border-yellow-500/20">
                      <p className="text-sm font-semibold text-yellow-500 mb-2">Your Mission:</p>
                      <p className="text-sm text-muted-foreground">
                        {challenges[activeTechnique].question}
                      </p>
                    </div>

                    <Textarea
                      value={challengeAnswer}
                      onChange={(e) => {
                        setChallengeAnswer(e.target.value);
                        setChallengeResult(null);
                      }}
                      placeholder="Write your prompt here..."
                      className="min-h-[120px] glass border-yellow-500/20 focus:border-yellow-500/50"
                    />

                    <Button
                      onClick={checkChallenge}
                      disabled={!challengeAnswer.trim()}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500"
                    >
                      Check My Answer
                    </Button>

                    {challengeResult && (
                      <div className={`glass p-4 rounded border ${
                        challengeResult === "correct" 
                          ? "border-green-500/30 bg-green-500/10" 
                          : "border-red-500/30 bg-red-500/10"
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{challengeResult === "correct" ? "✅" : "❌"}</span>
                          <p className="text-sm font-semibold">
                            {challengeResult === "correct" 
                              ? "Perfect! You've mastered this technique!" 
                              : "Not quite! Try including the key elements."}
                          </p>
                        </div>
                        {challengeResult === "incorrect" && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Hint: Your prompt should include elements like examples, steps, or role details depending on the technique.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
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
                    disabled={!userPrompt.trim() || isLoading}
                    className="w-full bg-gradient-to-r from-primary to-secondary"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Response
                      </>
                    )}
                  </Button>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">AI Response</label>
                  <div className="glass p-6 rounded-lg border border-primary/20 min-h-[300px] max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                        <span className="text-sm">AI is using {technique.name}...</span>
                      </div>
                    ) : response ? (
                      <div className="space-y-4">
                        <div className="text-sm text-primary font-semibold">
                          ✓ Using {technique.name}
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{response}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm italic">
                        Load an example or write your own prompt, then click generate to see how this technique works...
                      </p>
                    )}
                  </div>

                  {/* AI Thinking Process */}
                  {userPrompt.trim() && (
                    <div className="glass p-4 rounded-lg border border-secondary/30 bg-secondary/5 space-y-3 mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🤖💭</span>
                        <span className="text-sm font-semibold">AI's Thinking Bubble:</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <span className="text-lg">📖</span>
                          <div className="flex-1">
                            <p className="text-muted-foreground">
                              <span className="font-bold text-secondary">Reading your technique:</span> {technique.name}
                            </p>
                          </div>
                        </div>

                        {key === "few-shot" && (
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-lg">🎯</span>
                            <div className="flex-1">
                              <p className="text-muted-foreground">
                                <span className="font-bold text-primary">Learning from examples:</span> I'll look at your examples and follow the same pattern!
                              </p>
                              <ul className="mt-1 ml-4 space-y-1 text-xs">
                                <li className="text-muted-foreground">• Counting how many <span className="text-primary">examples</span> you gave me (more is better!)</li>
                                <li className="text-muted-foreground">• Finding the <span className="text-secondary">pattern</span> in your examples</li>
                                <li className="text-muted-foreground">• Copying that <span className="text-primary">style</span> for my answer</li>
                              </ul>
                            </div>
                          </div>
                        )}

                        {key === "chain-of-thought" && (
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-lg">🧠</span>
                            <div className="flex-1">
                              <p className="text-muted-foreground">
                                <span className="font-bold text-primary">Breaking it into steps:</span> I'll solve this one step at a time!
                              </p>
                              <ul className="mt-1 ml-4 space-y-1 text-xs">
                                <li className="text-muted-foreground">• <span className="text-primary">Step 1:</span> Figure out what we need to find</li>
                                <li className="text-muted-foreground">• <span className="text-secondary">Step 2:</span> Do the math or reasoning</li>
                                <li className="text-muted-foreground">• <span className="text-primary">Step 3:</span> Give you the final answer</li>
                              </ul>
                            </div>
                          </div>
                        )}

                        {key === "role-context" && (
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-lg">👤</span>
                            <div className="flex-1">
                              <p className="text-muted-foreground">
                                <span className="font-bold text-primary">Becoming an expert:</span> I'll pretend to be that person with all their knowledge!
                              </p>
                              <ul className="mt-1 ml-4 space-y-1 text-xs">
                                <li className="text-muted-foreground">• Taking on the <span className="text-primary">role</span> you gave me</li>
                                <li className="text-muted-foreground">• Using their <span className="text-secondary">experience</span> and background</li>
                                <li className="text-muted-foreground">• Speaking like a <span className="text-primary">real expert</span> would</li>
                              </ul>
                            </div>
                          </div>
                        )}

                        {response && (
                          <>
                            <div className="flex items-start gap-2 text-sm pt-2 border-t border-primary/10">
                              <span className="text-lg">✨</span>
                              <div className="flex-1">
                                <p className="text-muted-foreground">
                                  <span className="font-bold text-secondary">Why this is better than a basic prompt:</span>
                                </p>
                                <ul className="mt-1 ml-4 space-y-1 text-xs">
                                  {key === "few-shot" && (
                                    <>
                                      <li className="text-muted-foreground">• Basic prompt: AI guesses what style you want</li>
                                      <li className="text-muted-foreground">• <span className="text-primary">With examples:</span> AI knows exactly the style you need!</li>
                                    </>
                                  )}
                                  {key === "chain-of-thought" && (
                                    <>
                                      <li className="text-muted-foreground">• Basic prompt: AI jumps to answer (might be wrong!)</li>
                                      <li className="text-muted-foreground">• <span className="text-primary">Step-by-step:</span> AI shows its work and catches mistakes!</li>
                                    </>
                                  )}
                                  {key === "role-context" && (
                                    <>
                                      <li className="text-muted-foreground">• Basic prompt: AI gives general info</li>
                                      <li className="text-muted-foreground">• <span className="text-primary">With role:</span> AI gives expert-level detailed answers!</li>
                                    </>
                                  )}
                                </ul>
                              </div>
                            </div>

                            <div className="flex items-start gap-2 text-sm pt-2 border-t border-primary/10">
                              <span className="text-lg">💡</span>
                              <div className="flex-1">
                                <p className="text-muted-foreground">
                                  <span className="font-bold text-yellow-500">Pro tips to make it even better:</span>
                                </p>
                                <ul className="mt-1 ml-4 space-y-1 text-xs">
                                  {key === "few-shot" && (
                                    <>
                                      <li className="text-muted-foreground">• Use <span className="text-yellow-500">3-5 examples</span> (not too few, not too many!)</li>
                                      <li className="text-muted-foreground">• Make your examples <span className="text-yellow-500">diverse</span> but follow same pattern</li>
                                      <li className="text-muted-foreground">• Show the <span className="text-yellow-500">exact format</span> you want back</li>
                                    </>
                                  )}
                                  {key === "chain-of-thought" && (
                                    <>
                                      <li className="text-muted-foreground">• Use phrases like <span className="text-yellow-500">"Let's think step by step"</span></li>
                                      <li className="text-muted-foreground">• Number your steps: <span className="text-yellow-500">Step 1, Step 2, Step 3...</span></li>
                                      <li className="text-muted-foreground">• Works great for <span className="text-yellow-500">math, logic, and complex problems</span></li>
                                    </>
                                  )}
                                  {key === "role-context" && (
                                    <>
                                      <li className="text-muted-foreground">• Add <span className="text-yellow-500">specific experience</span> (like "20 years" or "award-winning")</li>
                                      <li className="text-muted-foreground">• Tell their <span className="text-yellow-500">personality</span> (passionate, serious, funny)</li>
                                      <li className="text-muted-foreground">• Mention who they're <span className="text-yellow-500">talking to</span> (kids, experts, beginners)</li>
                                    </>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* API Status Indicator */}
                  {!isApiKeyConfigured() && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 mt-4">
                      <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                      <div className="text-xs text-destructive">
                        <p className="font-semibold">API Key Required</p>
                        <p className="text-muted-foreground">Configure your Gemini API key to use real AI responses.</p>
                      </div>
                    </div>
                  )}
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
