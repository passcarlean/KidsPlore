import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Gamepad2, Trophy, Rocket, Globe2, Palette, Home, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/", label: "Hub", icon: Home, color: "text-primary" },
  { href: "/animate", label: "Studio", icon: Palette, color: "text-secondary" },
  { href: "/robotics", label: "Robotics", icon: Rocket, color: "text-accent" },
  { href: "/worlds", label: "Worlds", icon: Globe2, color: "text-green-500" },
  { href: "/games", label: "Games", icon: Gamepad2, color: "text-orange-500" },
  { href: "/achievements", label: "Trophy Room", icon: Trophy, color: "text-yellow-500" },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Topbar */}
      <header className="sticky top-0 z-50 w-full border-b-4 border-b-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight">
            <span className="bg-primary text-white px-2 py-1 rounded-xl rotate-[-2deg]">Kids</span>
            <span className="text-secondary rotate-[2deg] inline-block">Plore</span>
          </Link>
          
          <div className="hidden md:flex gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95",
                    isActive ? "bg-primary text-white shadow-[0_4px_0_0_rgba(0,0,0,0.1)]" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", !isActive && item.color)} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {NAV_ITEMS.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-4 px-6 py-4 rounded-3xl font-bold text-xl transition-transform active:scale-95",
                          isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                        )}
                      >
                        <item.icon className={cn("w-8 h-8", !isActive && item.color)} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-8 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
        {children}
      </main>
    </div>
  );
}
