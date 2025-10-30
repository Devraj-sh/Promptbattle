import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";
import { AIOrb } from "../AIOrb";
import { generateResponse, isApiKeyConfigured } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";

interface ReactorLessonProps {
  onComplete: () => void;
}

export const ReactorLesson = ({ onComplete }: ReactorLessonProps) => {
  const [basePrompt, setBasePrompt] = useState("Explain artificial intelligence");
  const [tone, setTone] = useState(50);
  const [detail, setDetail] = useState(50);
  const [creativity, setCreativity] = useState(50);
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!isApiKeyConfigured()) {
      toast({
        title: "API Key Not Configured",
        description: "Please configure your Gemini API key in the .env file.",
        variant: "destructive",
      });
      return;
    }

    if (!basePrompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a prompt first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      // Convert slider values to parameters
      const temperature = creativity / 100; // 0-1 range
      const maxTokens = Math.floor((detail / 100) * 300) + 50; // 50-350 tokens
      
      // Build system message based on tone
      const toneInstruction = getToneInstruction(tone);
      const systemMessage = `${toneInstruction} Keep your response concise and clear.`;

      const aiResponse = await generateResponse({
        prompt: basePrompt,
        systemMessage,
        temperature,
        maxTokens,
        model: 'gemini-2.0-flash'
      });

      setResponse(aiResponse);
      
      if (!hasGenerated) {
        setHasGenerated(true);
      }

      toast({
        title: "Response Generated!",
        description: "The AI has responded with your custom parameters.",
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

  const orbIntensity = isLoading ? 1.2 : (tone + detail + creativity) / 300;

  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="glass p-8 border-primary/30">
        <h2 className="text-3xl font-display font-bold text-gradient mb-4">
          🧠 Lesson 2: How AI Interprets Prompts
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          AI responses change based on how you frame your prompt. Adjust the parameters to see how tone, detail level, and creativity affect the output.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold mb-2 block">Your Prompt</label>
              <Textarea
                value={basePrompt}
                onChange={(e) => setBasePrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                className="min-h-[100px] glass border-primary/20 focus:border-primary/50"
              />
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold">Tone</label>
                  <span className="text-xs px-2 py-1 rounded-full glass border border-primary/30">
                    {getToneLabel(tone)} ({tone}%)
                  </span>
                </div>
                <Slider
                  value={[tone]}
                  onValueChange={(val) => setTone(val[0])}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Professional</span>
                  <span>Playful</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold">Detail Level</label>
                  <span className="text-xs px-2 py-1 rounded-full glass border border-secondary/30">
                    {getDetailLabel(detail)} ({detail}%)
                  </span>
                </div>
                <Slider
                  value={[detail]}
                  onValueChange={(val) => setDetail(val[0])}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Brief</span>
                  <span>Comprehensive</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold">Creativity</label>
                  <span className="text-xs px-2 py-1 rounded-full glass border border-primary/30">
                    {getCreativityLabel(creativity)} ({creativity}%)
                  </span>
                </div>
                <Slider
                  value={[creativity]}
                  onValueChange={(val) => setCreativity(val[0])}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Factual</span>
                  <span>Imaginative</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!basePrompt.trim() || isLoading}
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
                  Generate with Parameters
                </>
              )}
            </Button>
          </div>

          {/* Response Display */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">AI Response</label>
              <div className="glass p-6 rounded-lg border border-primary/20 min-h-[250px] max-h-[350px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                ) : response ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{response}</p>
                ) : (
                  <p className="text-muted-foreground text-sm italic">
                    Adjust the parameters and click generate to see how they affect the AI's response...
                  </p>
                )}
              </div>
            </div>

            {/* AI Thinking Process */}
            {basePrompt.trim() && (
              <div className="glass p-4 rounded-lg border border-secondary/30 bg-secondary/5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤖💭</span>
                  <span className="text-sm font-semibold">AI's Thinking Bubble:</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-lg">📖</span>
                    <p className="text-muted-foreground">
                      <span className="font-bold text-secondary">Reading:</span> "{basePrompt.slice(0, 40)}..."
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-lg">🎚️</span>
                    <div className="flex-1">
                      <p className="text-muted-foreground">
                        <span className="font-bold text-primary">Checking my settings:</span>
                      </p>
                      <ul className="mt-1 ml-4 space-y-1 text-xs">
                        <li className="text-muted-foreground">
                          • <span className="text-primary">Tone {getToneLabel(tone)}:</span> {tone < 30 ? 'I\'ll sound serious and factual' : tone < 70 ? 'I\'ll be balanced and friendly' : 'I\'ll be super fun and casual!'}
                        </li>
                        <li className="text-muted-foreground">
                          • <span className="text-secondary">Detail {getDetailLabel(detail)}:</span> {detail < 30 ? 'I\'ll keep it quick and simple' : detail < 70 ? 'I\'ll give a good amount of info' : 'I\'ll explain everything deeply!'}
                        </li>
                        <li className="text-muted-foreground">
                          • <span className="text-primary">Creativity {getCreativityLabel(creativity)}:</span> {creativity < 30 ? 'I\'ll stick to facts only' : creativity < 70 ? 'I\'ll add some creative touches' : 'I\'ll be super imaginative!'}
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
                            <span className="font-bold text-secondary">Why this response:</span>
                          </p>
                          <ul className="mt-1 ml-4 space-y-1 text-xs">
                            <li className="text-muted-foreground">
                              • My <span className="text-primary">tone slider</span> told me how formal or fun to be
                            </li>
                            <li className="text-muted-foreground">
                              • My <span className="text-secondary">detail slider</span> decided how much to explain
                            </li>
                            <li className="text-muted-foreground">
                              • My <span className="text-primary">creativity slider</span> controlled if I should be factual or imaginative
                            </li>
                            <li className="text-muted-foreground">
                              • I combined all these to make the <span className="text-secondary">perfect answer</span> for you!
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm pt-2 border-t border-primary/10">
                        <span className="text-lg">💡</span>
                        <div className="flex-1">
                          <p className="text-muted-foreground">
                            <span className="font-bold text-yellow-500">Experiment more:</span>
                          </p>
                          <ul className="mt-1 ml-4 space-y-1 text-xs">
                            <li className="text-muted-foreground">
                              • Try <span className="text-yellow-500">extreme settings</span> (all low or all high) to see big differences!
                            </li>
                            <li className="text-muted-foreground">
                              • Mix <span className="text-yellow-500">high creativity with low tone</span> for fun formal answers
                            </li>
                            <li className="text-muted-foreground">
                              • Use <span className="text-yellow-500">high detail + low creativity</span> for factual deep dives
                            </li>
                            <li className="text-muted-foreground">
                              • Change <span className="text-yellow-500">one slider at a time</span> to see what each one does!
                            </li>
                          </ul>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {!isApiKeyConfigured() && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                <div className="text-xs text-destructive">
                  <p className="font-semibold">API Key Required</p>
                  <p className="text-muted-foreground">Configure your Gemini API key to use real AI responses.</p>
                </div>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <AIOrb mood={isLoading ? "thinking" : response ? "happy" : "neutral"} intensity={orbIntensity} />
            </div>
          </div>
        </div>
      </Card>

      {hasGenerated && !isLoading && (
        <Card className="glass p-6 border-primary/50 animate-scale-in">
          <div className="text-center space-y-4">
            <div className="text-5xl">🎛️</div>
            <h3 className="text-2xl font-display font-bold text-gradient">
              Excellent Discovery!
            </h3>
            <p className="text-muted-foreground">
              You've learned how AI interpretation changes with different parameters. 
              Try adjusting the sliders to see how tone, detail, and creativity affect the response!
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

function getToneInstruction(value: number): string {
  if (value <= 20) return "Respond in a very professional, formal, and technical manner.";
  if (value <= 40) return "Respond in a professional and clear manner.";
  if (value <= 60) return "Respond in a neutral and balanced manner.";
  if (value <= 80) return "Respond in a casual and friendly manner.";
  return "Respond in a playful, fun, and engaging manner with enthusiasm.";
}

function getToneLabel(value: number): string {
  if (value <= 20) return "Very Professional";
  if (value <= 40) return "Professional";
  if (value <= 60) return "Neutral";
  if (value <= 80) return "Casual";
  return "Playful";
}

function getDetailLabel(value: number): string {
  if (value <= 20) return "Very Brief";
  if (value <= 40) return "Brief";
  if (value <= 60) return "Moderate";
  if (value <= 80) return "Detailed";
  return "Comprehensive";
}

function getCreativityLabel(value: number): string {
  if (value <= 20) return "Very Factual";
  if (value <= 40) return "Factual";
  if (value <= 60) return "Balanced";
  if (value <= 80) return "Creative";
  return "Very Imaginative";
}
