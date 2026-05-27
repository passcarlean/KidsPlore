import { useState } from "react";
import { useSubmitScore, useListScores } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2, Trophy, BrainCircuit, Type, Timer, Search, Rocket } from "lucide-react";

const GAMES = [
  { id: "code-breaker", name: "Code Breaker", icon: Search, color: "bg-red-500" },
  { id: "math-blaster", name: "Math Blaster", icon: Rocket, color: "bg-orange-500" },
  { id: "memory-matrix", name: "Memory Matrix", icon: BrainCircuit, color: "bg-yellow-500" },
  { id: "pattern-patrol", name: "Pattern Patrol", icon: Gamepad2, color: "bg-green-500" },
  { id: "reaction-racer", name: "Reaction Racer", icon: Timer, color: "bg-blue-500" },
  { id: "spelling-space", name: "Spelling Space", icon: Type, color: "bg-purple-500" },
];

export function Games() {
  const { data: scores } = useListScores({ limit: 5 });
  const submitScore = useSubmitScore();
  const { toast } = useToast();

  const handleSimulateWin = (gameName: string) => {
    const points = Math.floor(Math.random() * 500) + 100;
    submitScore.mutate({
      data: {
        playerName: "SpaceExplorer",
        game: gameName,
        score: points
      }
    }, {
      onSuccess: () => {
        toast({ title: "Score Submitted!", description: `You scored ${points} in ${gameName}!` });
      }
    });
  };

  return (
    <div className="space-y-12 pb-16 max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold text-orange-500 flex items-center justify-center gap-4">
          <Gamepad2 className="w-12 h-12" />
          Games Hub
        </h1>
        <p className="text-xl text-muted-foreground font-medium">Play mini-games to boost your brain power!</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_350px] gap-8">
        <div className="grid sm:grid-cols-2 gap-6">
          {GAMES.map(game => (
            <Card key={game.id} className="border-4 shadow-[0_6px_0_0_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden hover:-translate-y-1 transition-transform group">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <div className={`w-20 h-20 rounded-3xl ${game.color} text-white flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:rotate-12`}>
                  <game.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold">{game.name}</h3>
                <Button 
                  className="w-full rounded-xl font-bold h-12 mt-2" 
                  onClick={() => handleSimulateWin(game.name)}
                  disabled={submitScore.isPending}
                >
                  Play Game
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" /> Leaderboard
          </h2>
          <Card className="border-4 rounded-3xl overflow-hidden">
            <CardContent className="p-0 divide-y-2">
              {scores?.map((s, i) => (
                <div key={s.id} className="flex justify-between items-center p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-muted-foreground w-4">{i + 1}.</span>
                    <div>
                      <div className="font-bold text-sm">{s.playerName}</div>
                      <div className="text-xs text-muted-foreground">{s.game}</div>
                    </div>
                  </div>
                  <div className="font-extrabold text-primary">{s.score}</div>
                </div>
              ))}
              {!scores?.length && (
                <div className="p-8 text-center text-muted-foreground font-medium">
                  No scores yet. Be the first!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
