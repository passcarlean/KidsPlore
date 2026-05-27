import { useListAchievements, useGetProgress, useListScores } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Medal, Crown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const PLAYER_NAME = "SpaceExplorer"; // Hardcoded for demo

export function Achievements() {
  const { data: achievements, isLoading: achLoading } = useListAchievements();
  const { data: progress, isLoading: progLoading } = useGetProgress({ playerName: PLAYER_NAME }, { query: { enabled: true } });
  const { data: scores, isLoading: scoresLoading } = useListScores({ limit: 10 });

  const currentLevel = progress?.level || 1;
  const xp = progress?.totalPoints || 0;
  const xpNeeded = currentLevel * 1000;
  const progressPercent = Math.min((xp / xpNeeded) * 100, 100);

  return (
    <div className="space-y-12 pb-16 max-w-5xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold flex items-center justify-center gap-4">
          <Trophy className="w-12 h-12 text-yellow-500" />
          Trophy Room
          <Trophy className="w-12 h-12 text-yellow-500" />
        </h1>
        <p className="text-xl text-muted-foreground font-medium">Celebrate your amazing learning journey!</p>
      </div>

      {/* Progress Card */}
      <Card className="border-4 shadow-[0_8px_0_0_rgba(0,0,0,0.1)] rounded-[2rem] overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-8">
          {progLoading ? (
            <Skeleton className="h-32 w-full bg-white/20" />
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/50 relative">
                <Crown className="w-16 h-16 text-yellow-300" />
                <div className="absolute -bottom-4 bg-yellow-400 text-yellow-950 font-bold px-4 py-1 rounded-full text-lg border-2 border-white">
                  Lvl {currentLevel}
                </div>
              </div>
              <div className="flex-1 w-full space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold">{PLAYER_NAME}</h2>
                    <p className="text-white/80 font-medium text-lg">Total XP: {xp}</p>
                  </div>
                  <div className="text-right text-white/80 font-medium">
                    Next Level: {xpNeeded} XP
                  </div>
                </div>
                <Progress value={progressPercent} className="h-6 rounded-full bg-black/20 [&>div]:bg-yellow-400" />
                <div className="flex justify-between text-sm font-bold bg-black/20 p-3 rounded-xl">
                  <span>Missions: {progress?.missionsCompleted || 0}</span>
                  <span>Games: {progress?.gamesPlayed || 0}</span>
                  <span>Animations: {progress?.animationsCreated || 0}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Medal className="w-8 h-8 text-primary" />
            Your Achievements
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {achLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))
            ) : achievements?.map((ach) => (
              <div key={ach.id} className="bg-card border-4 border-muted p-4 rounded-2xl flex gap-4 items-center hover:border-primary/50 transition-colors">
                <div className="text-5xl bg-muted/50 w-20 h-20 flex items-center justify-center rounded-2xl">
                  {ach.icon}
                </div>
                <div>
                  <h4 className="font-bold text-lg leading-tight">{ach.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{ach.description}</p>
                  <div className="text-xs font-bold text-primary mt-2 bg-primary/10 inline-block px-2 py-1 rounded-md">
                    +{ach.points} XP
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Star className="w-8 h-8 text-accent" />
            Top Scores
          </h2>
          <Card className="border-4 rounded-[2rem] overflow-hidden">
            <CardContent className="p-0">
              {scoresLoading ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="divide-y-2">
                  {scores?.map((score, i) => (
                    <div key={score.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
                          ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-muted-foreground'}`}>
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-bold">{score.playerName}</div>
                          <div className="text-xs text-muted-foreground">{score.game}</div>
                        </div>
                      </div>
                      <div className="font-extrabold text-lg text-primary">
                        {score.score}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
