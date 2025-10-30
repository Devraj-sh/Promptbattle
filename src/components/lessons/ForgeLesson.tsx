import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Loader2, AlertCircle, Sparkles } from "lucide-react";
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
  const { toast } = useToast();

  const toggleComponent = (category: string, value: string) => {
    setSelected(prev => ({
      ...prev,
      [category]: prev[category] === value ? "" : value
    }));
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
      
      if (!hasGenerated) {
        setHasGenerated(true);
      }

      toast({
        title: "Response Generated!",
        description: "AI has responded to your forged prompt.",
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
      <Card className="glass p-8 border-primary/30">
        <h2 className="text-3xl font-display font-bold text-gradient mb-4">
          🔨 Lesson 3: Prompt Structuring
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          Build the perfect prompt by selecting components. A well-structured prompt includes a role, task, context, and tone.
        </p>

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
