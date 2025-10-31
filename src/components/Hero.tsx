import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float animate-delay-1000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto space-y-8 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Master AI Prompting Through Play</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-display font-black tracking-tight">
          <span className="text-gradient">Prompt Battle</span>
          <br />
          <span className="text-foreground">Arena</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
          Command the AI, Rule the Arena. Learn prompt engineering through interactive lessons, compete in epic battles, and climb the global leaderboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link to="/learn">
            <Button 
              size="lg" 
              className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 text-primary-foreground font-bold px-8 py-6 text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Start Learning
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Button>
          </Link>

          <Link to="/arena">
            <Button 
              size="lg" 
              variant="outline"
              className="group border-2 border-secondary hover:bg-secondary/10 hover:border-secondary-glow px-8 py-6 text-lg font-bold"
            >
              <Zap className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Solo Arena
            </Button>
          </Link>

          <Link to="/battle">
            <Button 
              size="lg" 
              variant="outline"
              className="group border-2 border-primary hover:bg-primary/10 hover:border-primary-glow px-8 py-6 text-lg font-bold"
            >
              <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Prompt Battle
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
          <div className="glass rounded-2xl p-6 border border-primary/20 hover:border-primary/40 transition-colors">
            <div className="text-4xl font-display font-bold text-gradient">5</div>
            <div className="text-sm text-muted-foreground mt-2">Interactive Lessons</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-secondary/20 hover:border-secondary/40 transition-colors">
            <div className="text-4xl font-display font-bold text-gradient">∞</div>
            <div className="text-sm text-muted-foreground mt-2">Battle Challenges</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-primary/20 hover:border-primary/40 transition-colors">
            <Trophy className="w-8 h-8 text-secondary mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Global Leaderboard</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
          <div className="w-1 h-3 rounded-full bg-primary animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
