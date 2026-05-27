import { useGetScoreStats, useListAchievements } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Palette, Rocket, Globe2, Gamepad2, Trophy, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function Home() {
  const { data: stats, isLoading: statsLoading } = useGetScoreStats();
  const { data: achievements, isLoading: achievementsLoading } = useListAchievements();

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-purple-500 to-secondary p-8 md:p-16 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight animate-in slide-in-from-left duration-500">
            Welcome to <br/>
            <span className="text-accent underline decoration-wavy decoration-8 underline-offset-8">KidsPlore!</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium opacity-90 animate-in slide-in-from-left duration-700 delay-150">
            Your magical digital playground for learning, creating, and discovering. 
            Ready for an adventure?
          </p>
          <div className="flex flex-wrap gap-4 pt-4 animate-in slide-in-from-bottom duration-500 delay-300">
            <Link href="/games" className="inline-flex h-14 items-center justify-center rounded-full bg-accent px-8 text-lg font-bold text-accent-foreground shadow-[0_6px_0_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-1 active:translate-y-1 active:shadow-none">
              <Play className="mr-2 h-6 w-6 fill-current" />
              Play Now
            </Link>
            <Link href="/worlds" className="inline-flex h-14 items-center justify-center rounded-full bg-white/20 px-8 text-lg font-bold text-white backdrop-blur-md transition-colors hover:bg-white/30">
              Explore Worlds
            </Link>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -bottom-32 right-10 h-80 w-80 rounded-full bg-secondary/40 blur-3xl" />
      </section>

      {/* Activity Zones */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <span className="bg-primary/10 text-primary p-2 rounded-xl">Activity Zones</span>
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ActivityCard 
            title="Animation Studio" 
            desc="Draw and animate your own characters!"
            icon={Palette}
            href="/animate"
            color="bg-pink-500"
            delay="delay-0"
          />
          <ActivityCard 
            title="Robotics" 
            desc="Code robots to complete epic missions."
            icon={Rocket}
            href="/robotics"
            color="bg-blue-500"
            delay="delay-100"
          />
          <ActivityCard 
            title="STEM Worlds" 
            desc="Explore science, math, and nature."
            icon={Globe2}
            href="/worlds"
            color="bg-green-500"
            delay="delay-200"
          />
          <ActivityCard 
            title="Mini Games" 
            desc="Play fun games and set high scores."
            icon={Gamepad2}
            href="/games"
            color="bg-orange-500"
            delay="delay-300"
          />
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Stats Summary */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <span className="bg-accent/10 text-accent-foreground p-2 rounded-xl">Global Stats</span>
          </h2>
          <Card className="border-4 shadow-[0_8px_0_0_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden">
            <CardContent className="p-8">
              {statsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : stats ? (
                <div className="grid grid-cols-2 gap-8">
                  <StatBox label="Explorers" value={stats.totalPlayers} color="text-primary" />
                  <StatBox label="Games Played" value={stats.totalGamesPlayed} color="text-secondary" />
                  <StatBox label="Top Game" value={stats.topGame} color="text-accent" className="col-span-2" />
                </div>
              ) : (
                <p className="text-muted-foreground">Stats unavailable right now.</p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Quick Achievements */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <span className="bg-secondary/10 text-secondary p-2 rounded-xl">Trophies</span>
            </h2>
            <Link href="/achievements" className="text-primary font-bold hover:underline">View All</Link>
          </div>
          <Card className="border-4 shadow-[0_8px_0_0_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden">
            <CardContent className="p-6">
              {achievementsLoading ? (
                <div className="flex gap-4 overflow-hidden">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-24 rounded-2xl flex-shrink-0" />)}
                </div>
              ) : achievements && achievements.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                  {achievements.slice(0, 5).map(ach => (
                    <div key={ach.id} className="snap-center flex flex-col items-center justify-center flex-shrink-0 w-28 p-4 rounded-2xl bg-muted/50 border-2 border-transparent hover:border-primary/20 transition-colors">
                      <div className="text-4xl mb-2">{ach.icon}</div>
                      <div className="text-xs font-bold text-center line-clamp-2">{ach.title}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No trophies yet. Start playing!</p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function ActivityCard({ title, desc, icon: Icon, href, color, delay }: any) {
  return (
    <Link href={href} className={`block group animate-in zoom-in-95 duration-500 fill-mode-both ${delay}`}>
      <Card className="h-full border-4 shadow-[0_8px_0_0_rgba(0,0,0,0.1)] rounded-[2rem] transition-transform hover:-translate-y-2 hover:shadow-[0_16px_0_0_rgba(0,0,0,0.1)] overflow-hidden">
        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
          <div className={`w-20 h-20 rounded-3xl ${color} text-white flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:rotate-6`}>
            <Icon className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-muted-foreground font-medium">{desc}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function StatBox({ label, value, color, className = "" }: any) {
  return (
    <div className={`bg-muted/50 p-4 rounded-2xl ${className}`}>
      <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-4xl font-extrabold ${color}`}>{value}</div>
    </div>
  );
}
