import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Check, Loader2, AlertCircle, Sparkles, ChevronDown, ChevronRight } from "lucide-react";
import { generateResponse, isApiKeyConfigured } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";
import { AIOrb } from "../AIOrb";

interface ForgeLessonProps {
  onComplete: () => void;
}

const components = {
  role: ["Teacher", "Expert", "Friend", "Journalist", "Critic"],
  task: ["Explain", "Summarize", "Create", "Analyze", "Describe"],
  context: ["for beginners", "in simple terms", "with examples", "step by step", "in detail"],
  tone: ["professionally", "casually", "enthusiastically", "concisely", "creatively"]
};

export const ForgeLesson = ({ onComplete }: ForgeLessonProps) => {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [topic, setTopic] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [componentCount, setComponentCount] = useState<Record<string, number>>({
    role: 0,
    task: 0,
    context: 0,
    tone: 0
  });
  const { toast } = useToast();

  const templates = [
    {
      name: "Educational Explainer",
      icon: "📚",
      description: "Perfect for learning new concepts",
      preset: { role: "Teacher", task: "Explain", context: "with examples", tone: "professionally" },
      topic: "quantum physics",
      preview: { role: "Teacher", task: "Explain" }
    },
    {
      name: "Creative Writer",
      icon: "✍️",
      description: "Build imaginative stories and content",
      preset: { role: "Friend", task: "Create", context: "in detail", tone: "creatively" },
      topic: "a short story about time travel",
      preview: { role: "Friend", task: "Create" }
    },
    {
      name: "Quick Summary",
      icon: "⚡",
      description: "Get concise overviews fast",
      preset: { role: "Journalist", task: "Summarize", context: "in simple terms", tone: "concisely" },
      topic: "climate change",
      preview: { role: "Journalist", task: "Summarize" }
    }
  ];

  const applyTemplate = (template: typeof templates[0]) => {
    setSelected(template.preset);
    setTopic(template.topic);
    setShowTemplates(false);
    toast({
      title: "Template Applied! 🎨",
      description: `Try the ${template.name} template`,
    });
  };

  const toggleComponent = (category: string, value: string) => {
    const wasSelected = selected[category] === value;
    
    setSelected(prev => ({
      ...prev,
      [category]: prev[category] === value ? "" : value
    }));

    // Track component usage for badges
    if (!wasSelected) {
      setComponentCount(prev => ({
        ...prev,
        [category]: prev[category] + 1
      }));

      // Check if user tried all options in a category
      if (componentCount[category] + 1 === components[category as keyof typeof components].length) {
        if (!badges.includes(`all-${category}`)) {
          setBadges([...badges, `all-${category}`]);
          toast({
            title: "Badge Unlocked! 🏆",
            description: `${category.charAt(0).toUpperCase() + category.slice(1)} Explorer - Tried all ${category}s!`,
          });
        }
      }
    }
  };

  const hasAllComponents = Object.keys(components).every(key => selected[key]) && topic.trim();
  const forgedPrompt = buildPrompt(selected, topic);

  const handleGenerate = async () => {
    if (!isApiKeyConfigured()) {
      toast({
        title: "API Key Not Configured",
        description: "Please configure your Gemini API key in the .env file.",
        variant: "destructive",
      });
      return;
    }

    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic first.",
        variant: "destructive",
      });
      return;
    }

    if (!hasAllComponents) {
      toast({
        title: "Select All Components",
        description: "Please select Role, Task, Context, and Tone to forge your prompt.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      const aiResponse = await generateResponse({
        prompt: forgedPrompt,
        systemMessage: "Respond directly to the request as specified in the prompt. Follow the role, task, context, and tone exactly as described.",
        temperature: 0.7,
        maxTokens: 300,
        model: 'gemini-2.0-flash'
      });

      setResponse(aiResponse);
      
      // Track progress and unlock badges
      const newCount = generationCount + 1;
      setGenerationCount(newCount);

      // Check challenge completion
      if (challengeMode && hasAllComponents && !challengeComplete) {
        setChallengeComplete(true);
        toast({
          title: "Challenge Complete! 🎯",
          description: "You successfully built a complete structured prompt!",
        });
      }

      // Unlock badges based on milestones
      if (newCount === 1 && !badges.includes("first-forge")) {
        setBadges([...badges, "first-forge"]);
        toast({
          title: "Badge Unlocked! 🏆",
          description: "First Forge - Your first structured prompt!",
        });
      }

      if (newCount === 5 && !badges.includes("prompt-smith")) {
        setBadges([...badges, "prompt-smith"]);
        toast({
          title: "Badge Unlocked! 🏆",
          description: "Prompt Smith - Forged 5 prompts!",
        });
      }

      // Badge for using all 4 component types
      if (Object.keys(selected).length === 4 && !badges.includes("complete-builder")) {
        setBadges([...badges, "complete-builder"]);
        toast({
          title: "Badge Unlocked! 🏆",
          description: "Complete Builder - Used all components!",
        });
      }
      
      if (!hasGenerated) {
        setHasGenerated(true);
      }

      toast({
        title: "Prompt Forged!",
        description: "AI has responded to your structured prompt.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate response";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error generating response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Badge Progress */}
      {badges.length > 0 && (
        <Card className="glass p-4 border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <span className="text-sm font-semibold">Badges Unlocked: {badges.length}/7</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className={`text-xl ${badges.includes('first-forge') ? 'opacity-100' : 'opacity-30 grayscale'}`} title="First Forge">🔨</span>
              <span className={`text-xl ${badges.includes('prompt-smith') ? 'opacity-100' : 'opacity-30 grayscale'}`} title="Prompt Smith">⚒️</span>
              <span className={`text-xl ${badges.includes('complete-builder') ? 'opacity-100' : 'opacity-30 grayscale'}`} title="Complete Builder">🏗️</span>
              <span className={`text-xl ${badges.includes('all-role') ? 'opacity-100' : 'opacity-30 grayscale'}`} title="Role Explorer">👤</span>
              <span className={`text-xl ${badges.includes('all-task') ? 'opacity-100' : 'opacity-30 grayscale'}`} title="Task Explorer">🎯</span>
              <span className={`text-xl ${badges.includes('all-context') ? 'opacity-100' : 'opacity-30 grayscale'}`} title="Context Explorer">📚</span>
              <span className={`text-xl ${badges.includes('all-tone') ? 'opacity-100' : 'opacity-30 grayscale'}`} title="Tone Explorer">🎨</span>
            </div>
          </div>
          <div className="text-xs text-center mt-2 text-muted-foreground">
            Prompts forged: {generationCount}/5 • Explore all options in each category!
          </div>
        </Card>
      )}

      <Card className="glass p-8 border-primary/30">
        <h2 className="text-3xl font-display font-bold text-gradient mb-4">
          🔨 Lesson 3: Prompt Structuring
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          Build the perfect prompt by selecting components. A well-structured prompt includes a role, task, context, and tone.
        </p>

        {/* Template Quick-Start */}
        <Collapsible open={showTemplates} onOpenChange={setShowTemplates} className="mb-6">
          <Card className="glass border-green-500/30">
            <CardContent className="p-6">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-500/20">
                      <Sparkles className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">Quick-Start Templates</h3>
                      <p className="text-sm text-muted-foreground">Apply pre-built structures to learn faster</p>
                    </div>
                  </div>
                  {showTemplates ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  {templates.map((template) => (
                    <Card 
                      key={template.name}
                      className="glass border-green-500/20 hover:border-green-500/50 transition-all cursor-pointer"
                      onClick={() => applyTemplate(template)}
                    >
                      <CardContent className="p-4 space-y-2">
                        <div className="text-2xl mb-2">{template.icon}</div>
                        <h4 className="font-semibold text-sm">{template.name}</h4>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                        
                        <div className="pt-3 space-y-1 text-xs border-t border-primary/20">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Role:</span>
                            <span className="text-green-400">{template.preview.role}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Task:</span>
                            <span className="text-green-400">{template.preview.task}</span>
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="w-full mt-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            applyTemplate(template);
                          }}
                        >
                          Apply Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Component Selection */}
          <div className="space-y-6">
            {/* Topic Input */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2">
                Topic:
                {topic.trim() && <Check className="w-4 h-4 text-primary" />}
              </label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., artificial intelligence, cooking pasta, photosynthesis..."
                className="glass border-primary/20 focus:border-primary/50"
              />
            </div>

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

            <Button
              onClick={handleGenerate}
              disabled={!hasAllComponents || isLoading}
              className="w-full bg-gradient-to-r from-secondary to-secondary-glow mt-4"
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

          {/* Forged Prompt & Response Display */}
          <div className="space-y-6">
            {/* Forged Prompt Display */}
            <div className="glass p-6 rounded-lg border-2 border-primary/30">
              <label className="text-sm font-semibold mb-3 block">Your Forged Prompt:</label>
              {forgedPrompt ? (
                <p className="text-base leading-relaxed font-medium">{forgedPrompt}</p>
              ) : (
                <p className="text-muted-foreground italic text-sm">
                  Enter a topic and select components above to forge your prompt...
                </p>
              )}
            </div>

            {/* AI Thinking Process */}
            {forgedPrompt && (
              <div className="glass p-5 rounded-lg border border-secondary/30 bg-secondary/5">
                <label className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">🤖💭</span>
                  AI's Thinking Bubble:
                </label>
                <div className="space-y-3 text-sm">
                  {selected.role && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <span className="text-2xl">👤</span>
                      <div className="flex-1">
                        <span className="font-bold text-blue-400">Who am I?</span>
                        <p className="text-muted-foreground mt-1">
                          I'm pretending to be a <span className="text-blue-400 font-semibold">{selected.role}</span>!
                        </p>
                      </div>
                    </div>
                  )}
                  {selected.task && topic && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <span className="text-2xl">🎯</span>
                      <div className="flex-1">
                        <span className="font-bold text-green-400">What should I do?</span>
                        <p className="text-muted-foreground mt-1">
                          <span className="text-green-400 font-semibold">{selected.task}</span> all about <span className="text-green-400 font-semibold">{topic}</span>!
                        </p>
                      </div>
                    </div>
                  )}
                  {selected.context && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <span className="text-2xl">📚</span>
                      <div className="flex-1">
                        <span className="font-bold text-purple-400">How should I explain?</span>
                        <p className="text-muted-foreground mt-1">
                          I'll make it <span className="text-purple-400 font-semibold">{selected.context}</span>!
                        </p>
                      </div>
                    </div>
                  )}
                  {selected.tone && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <span className="text-2xl">🎨</span>
                      <div className="flex-1">
                        <span className="font-bold text-orange-400">What style should I use?</span>
                        <p className="text-muted-foreground mt-1">
                          I'll talk <span className="text-orange-400 font-semibold">{selected.tone}</span>!
                        </p>
                      </div>
                    </div>
                  )}

                  {response && (
                    <>
                      <div className="pt-2 border-t border-primary/10">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                          <span className="text-2xl">✨</span>
                          <div className="flex-1">
                            <span className="font-bold text-secondary mb-2 block">Why I answered this way:</span>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                              <li>• I became a <span className="text-blue-400">{selected.role}</span> who knows about this topic</li>
                              <li>• I focused on <span className="text-green-400">{selected.task?.toLowerCase()}</span> information</li>
                              {selected.context && (
                                <li>• I made sure it's <span className="text-purple-400">{selected.context}</span></li>
                              )}
                              {selected.tone && (
                                <li>• I used a <span className="text-orange-400">{selected.tone}</span> style</li>
                              )}
                              <li>• I put all these pieces together to make a great answer!</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <span className="text-2xl">💡</span>
                        <div className="flex-1">
                          <span className="font-bold text-yellow-500 mb-2 block">Make your prompt even better:</span>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            <li>• Try a <span className="text-yellow-500">different role</span> - how would a scientist vs artist answer differently?</li>
                            <li>• Change the <span className="text-yellow-500">context</span> - simple vs detailed can give very different answers!</li>
                            <li>• Mix <span className="text-yellow-500">serious tone + simple context</span> for professional but easy explanations</li>
                            <li>• Add more details to your <span className="text-yellow-500">topic</span> to get more specific answers</li>
                            <li>• Every component choice changes how I think - <span className="text-yellow-500">experiment</span>!</li>
                          </ul>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* AI Response */}
            <div className="glass p-6 rounded-lg border border-primary/30 min-h-[200px] max-h-[350px] overflow-y-auto">
              <label className="text-sm font-semibold mb-3 block">AI Response:</label>
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  <span className="text-sm">AI is thinking through your prompt structure...</span>
                </div>
              ) : response ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{response}</p>
              ) : (
                <p className="text-muted-foreground italic text-sm">
                  Forge your prompt and click generate to see the AI's response...
                </p>
              )}
            </div>

            {!isApiKeyConfigured() && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                <div className="text-xs text-destructive">
                  <p className="font-semibold">API Key Required</p>
                  <p className="text-muted-foreground">Configure your Gemini API key to use real AI responses.</p>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <AIOrb mood={isLoading ? "thinking" : response ? "happy" : "neutral"} intensity={isLoading ? 1.2 : response ? 1 : 0.5} />
            </div>
          </div>
        </div>
      </Card>

      {/* Challenge Mode */}
      <Card className="glass p-6 border-yellow-500/30">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-500/20">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Master Builder Challenge</h3>
              <p className="text-sm text-muted-foreground">
                Build a complete prompt using all four components
              </p>
            </div>
          </div>

          {!challengeMode ? (
            <Button
              onClick={() => {
                setChallengeMode(true);
                setSelected({});
                setTopic("");
                setResponse("");
                toast({
                  title: "Challenge Started! 🎯",
                  description: "Select one from each category and add a topic",
                });
              }}
              className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30"
            >
              Start Challenge
            </Button>
          ) : challengeComplete ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <Check className="w-5 h-5 text-green-400" />
                <p className="text-sm font-semibold text-green-400">Challenge Complete!</p>
              </div>
              <Button
                onClick={() => {
                  setChallengeMode(false);
                  setChallengeComplete(false);
                }}
                variant="outline"
                className="w-full"
              >
                Try Another Challenge
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                <p className="text-sm font-semibold mb-2">Progress:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    {selected.role ? <Check className="w-4 h-4 text-green-400" /> : <div className="w-4 h-4 border border-muted-foreground/30 rounded" />}
                    <span>Select a Role</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selected.task ? <Check className="w-4 h-4 text-green-400" /> : <div className="w-4 h-4 border border-muted-foreground/30 rounded" />}
                    <span>Select a Task</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selected.context ? <Check className="w-4 h-4 text-green-400" /> : <div className="w-4 h-4 border border-muted-foreground/30 rounded" />}
                    <span>Select a Context</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selected.tone ? <Check className="w-4 h-4 text-green-400" /> : <div className="w-4 h-4 border border-muted-foreground/30 rounded" />}
                    <span>Select a Tone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {topic.trim() ? <Check className="w-4 h-4 text-green-400" /> : <div className="w-4 h-4 border border-muted-foreground/30 rounded" />}
                    <span>Enter a Topic</span>
                  </div>
                </div>
              </div>
              
              {hasAllComponents && (
                <p className="text-sm text-green-400 text-center">
                  ✓ All components selected! Click "Forge Prompt" to complete the challenge
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      {hasGenerated && !isLoading && (
        <Card className="glass p-6 border-primary/50 animate-scale-in">
          <div className="text-center space-y-4">
            <div className="text-5xl">⚡</div>
            <h3 className="text-2xl font-display font-bold text-gradient">
              Prompt Forged Successfully!
            </h3>
            <p className="text-muted-foreground">
              You've learned the four key components of effective prompts: Role, Task, Context, and Tone.
              Try different combinations to see how they affect the response!
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

function buildPrompt(selected: Record<string, string>, topic: string): string {
  if (!topic.trim() || Object.keys(selected).length === 0) return "";

  const parts: string[] = [];
  
  if (selected.role) {
    parts.push(`Act as a ${selected.role}.`);
  }
  if (selected.task && topic) {
    parts.push(`${selected.task} ${topic}`);
  }
  if (selected.context) {
    parts.push(selected.context);
  }
  if (selected.tone) {
    parts.push(selected.tone);
  }

  return parts.join(" ") + ".";
}
