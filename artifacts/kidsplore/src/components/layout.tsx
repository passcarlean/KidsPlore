import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Gamepad2, Trophy, Rocket, Globe2, Palette, Home, Menu, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useConfetti } from "./confetti-context";

const NAV_ITEMS = [
  { href: "/",            label: "Hub",      emoji: "🏠", bg: "from-pink-500 to-rose-500"     },
  { href: "/animate",     label: "Studio",   emoji: "🎨", bg: "from-purple-500 to-pink-500"   },
  { href: "/robotics",    label: "Robotics", emoji: "🚀", bg: "from-blue-500 to-cyan-500"     },
  { href: "/worlds",      label: "Worlds",   emoji: "🌍", bg: "from-green-500 to-emerald-500" },
  { href: "/games",       label: "Coding",   emoji: "🎮", bg: "from-orange-500 to-yellow-500" },
  { href: "/achievements",label: "Trophies", emoji: "🏆", bg: "from-yellow-500 to-amber-500"  },
];

const FUN_FACTS = [
  "Did you know? The first computer bug was an actual bug — a moth stuck in a relay!",
  "Robots can now perform surgery with more precision than human hands!",
  "The internet is estimated to weigh about 50 grams (the weight of electrons)!",
  "The first video game was created in 1958 — it was a tennis game!",
  "There are more possible chess games than atoms in the observable universe!",
  "NASA's Apollo computers had less processing power than a modern smartphone!",
  "The word 'robot' comes from the Czech word 'robota', meaning forced labor!",
  "Over 90% of the world's data was created in the last two years!",
  "The average cloud weighs over 1 million pounds!",
  "Octopuses have three hearts and blue blood!",
];

// ── Reusable logo — one word, two colours, no gap ─────────────────────────────
function KidsPlore({ size = "text-2xl" }: { size?: string }) {
  return (
    <span className={`font-extrabold tracking-tight ${size}`} style={{ whiteSpace: "nowrap" }}>
      <span style={{ background: "linear-gradient(135deg,#FF6B9D,#FF3366)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Kids</span><span style={{ background: "linear-gradient(135deg,#00C9D4,#0099FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Plore</span>
    </span>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [factIndex, setFactIndex] = useState(() => Math.floor(Math.random() * FUN_FACTS.length));
  const [factVisible, setFactVisible] = useState(true);
  const { burst } = useConfetti();

  useEffect(() => {
    const t = setInterval(() => {
      setFactVisible(false);
      setTimeout(() => {
        setFactIndex(i => (i + 1) % FUN_FACTS.length);
        setFactVisible(true);
      }, 400);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  function handleLogoBurst(e: React.MouseEvent) {
    burst(e.clientX, e.clientY);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">

      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-50 w-full border-b-2 border-b-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link
            href="/"
            onClick={handleLogoBurst}
            className="flex items-center select-none shrink-0 group"
            title="Click for a surprise!"
          >
            <KidsPlore />
            <Sparkles className="w-4 h-4 ml-1 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-1 flex-1 justify-center">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2 rounded-2xl font-bold text-sm transition-all duration-200",
                    "hover:-translate-y-0.5 active:scale-95",
                    isActive
                      ? `bg-gradient-to-r ${item.bg} text-white shadow-md`
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="text-base">{item.emoji}</span>
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/60" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0 overflow-y-auto">
                <div className="p-6 pb-4 border-b border-border/40">
                  <KidsPlore size="text-2xl" />
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Your STEM adventure awaits!</p>
                </div>
                <nav className="flex flex-col gap-2 p-4">
                  {NAV_ITEMS.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-base transition-all active:scale-95",
                          isActive
                            ? `bg-gradient-to-r ${item.bg} text-white shadow-md`
                            : "bg-muted/60 text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <span className="text-2xl">{item.emoji}</span>
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="m-4 p-4 bg-muted/50 rounded-2xl">
                  <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Fun Fact</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{FUN_FACTS[factIndex]}</p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ── Fun fact ticker ── */}
      <div className="hidden md:flex items-center justify-center gap-3 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-b border-border/30 py-1.5 px-4 overflow-hidden">
        <span className="text-xs font-extrabold text-primary uppercase tracking-widest shrink-0">STEM Fact</span>
        <span className="text-yellow-500">✦</span>
        <p
          className="text-xs font-semibold text-muted-foreground truncate transition-opacity duration-400"
          style={{ opacity: factVisible ? 1 : 0 }}
        >
          {FUN_FACTS[factIndex]}
        </p>
      </div>

      {/* ── Page content ── */}
      <main
        key={location}
        className="flex-1 container py-6 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden kidsplore-page"
      >
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t-2 border-border/40 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
        <div className="container max-w-7xl mx-auto px-4 md:px-8 py-6">

          {/* Zone quick links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl font-bold text-xs text-center bg-white/60 hover:bg-white transition-all hover:-translate-y-0.5 border border-border/30 shadow-sm group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{item.emoji}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/30">
            <KidsPlore size="text-xl" />

            <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground font-medium">
              <span>Your STEM adventure playground</span>
              <span className="hidden sm:inline text-border">•</span>
              <span>Built with love for curious minds</span>
            </div>

            <div className="flex items-center gap-2 text-sm font-bold">
              <span className="text-muted-foreground">Created by</span>
              <span
                className="font-extrabold text-base"
                style={{
                  background: "linear-gradient(90deg,#FF6B9D,#9966FF,#4C97FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Paschaline
              </span>
              <span className="text-lg">✨</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
