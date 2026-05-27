import { useGetScoreStats, useListAchievements } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Palette, Rocket, Globe2, Gamepad2, Trophy, Play, Zap, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingShapes } from "@/components/floating-shapes";
import { useConfetti } from "@/components/confetti-context";
import { useEffect, useState } from "react";
import { iconToEmoji } from "@/lib/icon-map";

// ── Daily challenge pool (cycles by day-of-year) ──────────────────────────────

const DAILY_CHALLENGES = [
  { emoji: "🔭", title: "Space Observer", desc: "How many planets are in our solar system? Can you name them all in order?", zone: "/worlds", cta: "Explore Space", color: "from-indigo-600 to-purple-600" },
  { emoji: "🧪", title: "Lab Experiment", desc: "Mix two primary colors together — what new color do you get? Try all combinations!", zone: "/worlds", cta: "Visit Lab", color: "from-emerald-600 to-teal-600" },
  { emoji: "🤖", title: "Robot Challenge", desc: "Program a robot to move in a square shape. How many moves does it take?", zone: "/robotics", cta: "Start Mission", color: "from-blue-600 to-cyan-600" },
  { emoji: "🎨", title: "Create Art", desc: "Draw your favorite animal frame by frame and bring it to life with animation!", zone: "/animate", cta: "Open Studio", color: "from-pink-600 to-rose-600" },
  { emoji: "🧩", title: "Pattern Puzzle", desc: "Use Repeat blocks to make your sprite draw a perfect triangle with 3 moves!", zone: "/games", cta: "Start Coding", color: "from-orange-600 to-amber-600" },
  { emoji: "🌊", title: "Ocean Explorer", desc: "How deep is the Mariana Trench? Explore ocean depths in the STEM Worlds!", zone: "/worlds", cta: "Dive In", color: "from-cyan-600 to-blue-600" },
  { emoji: "⚡", title: "Speed Coder", desc: "Complete a robotics mission using fewer than 10 blocks. Think efficiently!", zone: "/robotics", cta: "Accept Challenge", color: "from-yellow-600 to-orange-600" },
];

function getTodaysChallenge() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
}

// ── Activity cards ─────────────────────────────────────────────────────────────

const ACTIVITIES = [
  {
    title: "Animation Studio",
    desc: "Draw characters frame by frame and watch them come alive!",
    icon: Palette,
    href: "/animate",
    from: "#FF6B9D", to: "#C951FF",
    emoji: "🎨",
    tag: "Creative",
  },
  {
    title: "Robotics",
    desc: "Program robots with visual blocks to complete epic missions!",
    icon: Rocket,
    href: "/robotics",
    from: "#4C97FF", to: "#00C9D4",
    emoji: "🤖",
    tag: "Engineering",
  },
  {
    title: "STEM Worlds",
    desc: "Explore science, math, nature, and space across 6 worlds!",
    icon: Globe2,
    href: "/worlds",
    from: "#59C059", to: "#00E676",
    emoji: "🌍",
    tag: "Science",
  },
  {
    title: "Coding Studio",
    desc: "Build programs with Scratch-like blocks — make things move and sing!",
    icon: Gamepad2,
    href: "/games",
    from: "#FFAB19", to: "#FF6E40",
    emoji: "🎮",
    tag: "Coding",
  },
];

// ── Stat box ──────────────────────────────────────────────────────────────────

function StatBox({ label, value, emoji }: { label: string; value: string | number; emoji: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-5 rounded-3xl bg-white/60 border border-border/30 shadow-sm hover:shadow-md transition-shadow">
      <span className="text-3xl">{emoji}</span>
      <span className="text-3xl font-extrabold text-foreground leading-none">{value}</span>
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">{label}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function Home() {
  const { data: stats, isLoading: statsLoading } = useGetScoreStats();
  const { data: achievements } = useListAchievements();
  const { burst } = useConfetti();
  const [challenge] = useState(getTodaysChallenge);
  const [pulseHero, setPulseHero] = useState(false);

  // Subtle pulse on first load to draw attention
  useEffect(() => {
    const t = setTimeout(() => setPulseHero(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-10 pb-16">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden rounded-[2rem] text-white shadow-2xl"
        style={{ background: "linear-gradient(135deg, #FF3366 0%, #9933CC 40%, #0066FF 80%, #00CCFF 100%)" }}
      >
        <FloatingShapes />
        <div className="relative z-10 px-8 py-14 md:px-16 md:py-20 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-bold mb-2">
            <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            Happy Children's Day!
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
            Welcome to{" "}
            <span className="relative inline-block">
              <span style={{ textShadow: "0 2px 20px rgba(255,255,255,0.3)" }}>KidsPlore!</span>
              <svg
                viewBox="0 0 300 12"
                className="absolute -bottom-2 left-0 w-full"
                preserveAspectRatio="none"
              >
                <path d="M0,6 Q75,0 150,6 Q225,12 300,6" stroke="rgba(255,213,0,0.9)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>
          <p className="text-xl md:text-2xl font-semibold opacity-90 leading-relaxed">
            Your magical digital playground for learning, creating, and discovering. Ready for an adventure?
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/games"
              className={`inline-flex h-14 items-center justify-center rounded-full bg-yellow-400 px-8 text-lg font-extrabold text-gray-900 shadow-[0_6px_0_0_#b45309] transition-all hover:-translate-y-1 hover:shadow-[0_8px_0_0_#b45309] active:translate-y-1 active:shadow-none gap-2 ${pulseHero ? "animate-bounce" : ""}`}
              style={{ animationDuration: "2s", animationIterationCount: "3" }}
            >
              <Play className="w-5 h-5 fill-current" />
              Start Playing
            </Link>
            <Link
              href="/worlds"
              className="inline-flex h-14 items-center justify-center rounded-full bg-white/20 px-8 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:-translate-y-0.5 gap-2"
            >
              <Globe2 className="w-5 h-5" />
              Explore Worlds
            </Link>
            <button
              onClick={(e) => burst(e.clientX, e.clientY)}
              className="inline-flex h-14 items-center justify-center rounded-full bg-white/10 px-6 text-base font-bold text-white hover:bg-white/20 transition-all hover:-translate-y-0.5 gap-2"
              title="Surprise!"
            >
              🎉 Celebrate!
            </button>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-20 h-64 w-64 rounded-full bg-yellow-300/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 h-32 w-32 rounded-full bg-cyan-300/20 blur-2xl pointer-events-none" />
      </section>

      {/* ── Today's Challenge ─────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 bg-yellow-400/20 text-yellow-700 rounded-full px-4 py-1.5 font-extrabold text-sm uppercase tracking-wider">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            Today's Challenge
          </div>
          <div className="h-px flex-1 bg-border/40" />
        </div>
        <div
          className={`relative overflow-hidden rounded-[1.5rem] text-white p-6 md:p-8 bg-gradient-to-br ${challenge.color} shadow-lg`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="text-6xl shrink-0">{challenge.emoji}</div>
            <div className="flex-1 space-y-2">
              <div className="font-extrabold text-xl">{challenge.title}</div>
              <p className="text-white/90 font-medium leading-relaxed">{challenge.desc}</p>
            </div>
            <Link
              href={challenge.zone}
              className="shrink-0 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold px-6 py-3 rounded-2xl transition-all hover:-translate-y-0.5 whitespace-nowrap"
            >
              {challenge.cta} →
            </Link>
          </div>
          {/* Decorative */}
          <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        </div>
      </section>

      {/* ── Activity Zones ────────────────────────────────────────────────── */}
      <section className="space-y-5">
        <h2 className="text-2xl font-extrabold flex items-center gap-3">
          <span className="text-3xl">🚀</span> Activity Zones
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIVITIES.map((act, i) => (
            <Link key={act.href} href={act.href}>
              <div
                className="group relative overflow-hidden rounded-[1.5rem] text-white shadow-lg cursor-pointer h-full"
                style={{
                  background: `linear-gradient(135deg, ${act.from}, ${act.to})`,
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div className="relative z-10 p-6 flex flex-col gap-3 h-full">
                  <div className="flex items-start justify-between">
                    <span className="text-5xl group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 inline-block">
                      {act.emoji}
                    </span>
                    <span className="text-xs font-extrabold bg-white/20 rounded-full px-3 py-1 uppercase tracking-wider">
                      {act.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold leading-tight mb-1">{act.title}</h3>
                    <p className="text-white/85 text-sm font-medium leading-relaxed">{act.desc}</p>
                  </div>
                  <div className="mt-auto pt-2">
                    <span className="inline-flex items-center gap-1 text-sm font-bold bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 transition-colors">
                      Explore →
                    </span>
                  </div>
                </div>
                {/* Hover glow */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 rounded-[1.5rem]" />
                {/* Decorative blob */}
                <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-white/15 blur-xl pointer-events-none" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Stats + Trophies ──────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* Global Stats */}
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold flex items-center gap-3">
            <span className="text-3xl">📊</span> Global Stats
          </h2>
          {statsLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-3xl" />)}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-3 gap-4">
              <StatBox label="Explorers" value={stats.totalPlayers} emoji="🧒" />
              <StatBox label="Games Played" value={stats.totalGamesPlayed} emoji="🎮" />
              <StatBox label="Avg Score" value={stats.averageScore} emoji="⭐" />
            </div>
          ) : (
            <Card className="rounded-3xl"><CardContent className="p-6 text-muted-foreground">Stats unavailable</CardContent></Card>
          )}
          {stats && (
            <div className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4">
              <span className="text-2xl">🏆</span>
              <div>
                <div className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Most Popular</div>
                <div className="font-extrabold text-base">{stats.topGame}</div>
              </div>
            </div>
          )}
        </section>

        {/* Quick Achievements */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold flex items-center gap-3">
              <span className="text-3xl">🏅</span> Trophies
            </h2>
            <Link href="/achievements" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              View All <Trophy className="w-4 h-4" />
            </Link>
          </div>
          {achievements && achievements.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {achievements.slice(0, 8).map(ach => (
                <div
                  key={ach.id}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-border/30 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default group"
                  title={`${ach.title} — ${ach.description}`}
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{iconToEmoji(ach.icon)}</span>
                  <span className="text-[10px] font-bold text-center text-muted-foreground leading-tight line-clamp-2">
                    {ach.title}
                  </span>
                  <span className="text-[10px] font-extrabold text-primary">{ach.points}pts</span>
                </div>
              ))}
            </div>
          ) : (
            <Card className="rounded-3xl border-2">
              <CardContent className="p-8 text-center space-y-3">
                <div className="text-5xl">🎯</div>
                <p className="font-bold text-muted-foreground">No trophies yet — start playing to earn them!</p>
                <Link href="/games" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-2.5 rounded-2xl hover:opacity-90 transition-opacity">
                  <Play className="w-4 h-4 fill-current" /> Play Now
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      {/* ── Quick Navigation ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold flex items-center gap-3">
          <span className="text-3xl">⚡</span> Jump In
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { href: "/robotics", label: "Mission 1 — Hello Robot", emoji: "🤖", color: "bg-blue-500" },
            { href: "/animate", label: "Start Animating", emoji: "🎬", color: "bg-pink-500" },
            { href: "/worlds", label: "Volcano Lab", emoji: "🌋", color: "bg-red-500" },
            { href: "/games", label: "Dance Party", emoji: "🐱", color: "bg-purple-500" },
            { href: "/achievements", label: "My Trophies", emoji: "🏆", color: "bg-yellow-500" },
            { href: "/worlds", label: "Space Station", emoji: "🚀", color: "bg-indigo-500" },
          ].map(item => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="flex items-center gap-3 p-4 rounded-2xl bg-white border-2 border-border/30 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all font-bold text-sm group"
            >
              <span className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform`}>
                {item.emoji}
              </span>
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
