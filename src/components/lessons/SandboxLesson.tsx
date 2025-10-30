import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { AIOrb } from "../AIOrb";
import { generateLessonResponse, isApiKeyConfigured } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";

interface SandboxLessonProps {
  onComplete: () => void;
}

export const SandboxLesson = ({ onComplete }: SandboxLessonProps) => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [experimented, setExperimented] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    // Check if API key is configured
    if (!isApiKeyConfigured()) {
      toast({
        title: "API Key Not Configured",
        description: "Please configure your Gemini API key in the .env file.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      // Call Gemini API to generate response
      const aiResponse = await generateLessonResponse(prompt);
      setResponse(aiResponse);
      
      if (!experimented) {
        setExperimented(true);
      }

      toast({
        title: "Response Generated!",
        description: "The AI has responded to your prompt.",
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
              disabled={!prompt.trim() || isLoading}
              className="w-full bg-gradient-to-r from-primary to-primary-glow"
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
              <div className="min-h-[150px] max-h-[400px] overflow-y-auto glass p-4 rounded-lg border border-primary/20">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                ) : response ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{response}</p>
                ) : (
                  <p className="text-muted-foreground text-sm italic">
                    Submit a prompt to see the AI's response...
                  </p>
                )}
              </div>
            </div>

            {/* AI Thinking Process */}
            {prompt.trim() && (
              <div className="glass p-4 rounded-lg border border-secondary/30 bg-secondary/5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤖💭</span>
                  <span className="text-sm font-semibold">AI's Thinking Bubble:</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-lg">📖</span>
                    <p className="text-muted-foreground">
                      <span className="font-bold text-secondary">Reading:</span> "{prompt.slice(0, 60)}{prompt.length > 60 ? '...' : ''}"
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-lg">🤔</span>
                    <div className="flex-1">
                      <p className="text-muted-foreground">
                        <span className="font-bold text-primary">Understanding:</span> Let me figure out what you want...
                      </p>
                      <ul className="mt-1 ml-4 space-y-1 text-xs">
                        <li className="text-muted-foreground">
                          • Is this a <span className="text-primary">question</span> or a <span className="text-primary">command</span>?
                        </li>
                        <li className="text-muted-foreground">
                          • What <span className="text-secondary">type of answer</span> do you need? (story, explanation, list, etc.)
                        </li>
                        <li className="text-muted-foreground">
                          • Are there any <span className="text-primary">special words</span> that tell me how to respond?
                        </li>
                      </ul>
                    </div>
                  </div>

                  {response && (
                    <>
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-lg">✨</span>
                        <div className="flex-1">
                          <p className="text-muted-foreground">
                            <span className="font-bold text-secondary">Why I answered this way:</span>
                          </p>
                          <ul className="mt-1 ml-4 space-y-1 text-xs">
                            <li className="text-muted-foreground">
                              • I looked for <span className="text-primary">key words</span> in your prompt
                            </li>
                            <li className="text-muted-foreground">
                              • I matched the <span className="text-secondary">style</span> you seemed to want
                            </li>
                            <li className="text-muted-foreground">
                              • I made sure my answer was <span className="text-primary">helpful and clear</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm pt-2 border-t border-primary/10">
                        <span className="text-lg">💡</span>
                        <div className="flex-1">
                          <p className="text-muted-foreground">
                            <span className="font-bold text-yellow-500">Make it even better:</span>
                          </p>
                          <ul className="mt-1 ml-4 space-y-1 text-xs">
                            <li className="text-muted-foreground">
                              • Try adding <span className="text-yellow-500">more details</span> about what you want
                            </li>
                            <li className="text-muted-foreground">
                              • Tell me <span className="text-yellow-500">who the answer is for</span> (kid, adult, expert?)
                            </li>
                            <li className="text-muted-foreground">
                              • Mention the <span className="text-yellow-500">length</span> you want (short, long, 3 sentences?)
                            </li>
                            <li className="text-muted-foreground">
                              • Use words like "explain", "describe", "create" to be <span className="text-yellow-500">super clear</span>!
                            </li>
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
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                <div className="text-xs text-destructive">
                  <p className="font-semibold">API Key Required</p>
                  <p className="text-muted-foreground">Configure your Gemini API key to use real AI responses.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="flex justify-center">
        <AIOrb 
          mood={isLoading ? "thinking" : response ? "happy" : "neutral"} 
          intensity={isLoading ? 1.2 : response ? 1 : 0.5} 
        />
      </div>

      {experimented && !isLoading && (
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
