import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Droplets, Rocket, Bone, Wrench, Calculator, X } from "lucide-react";
import { useSaveProgress } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const WORLDS = [
  { id: "volcano", name: "Volcano Lab", desc: "Chemistry & Reactions", icon: Flame, color: "bg-red-500", shadow: "shadow-red-500/20" },
  { id: "ocean", name: "Ocean Depths", desc: "Marine Biology", icon: Droplets, color: "bg-blue-500", shadow: "shadow-blue-500/20" },
  { id: "space", name: "Space Station", desc: "Physics & Astronomy", icon: Rocket, color: "bg-purple-500", shadow: "shadow-purple-500/20" },
  { id: "dino", name: "Dino Dig", desc: "Paleontology", icon: Bone, color: "bg-amber-600", shadow: "shadow-amber-500/20" },
  { id: "robot", name: "Robot Factory", desc: "Engineering", icon: Wrench, color: "bg-slate-600", shadow: "shadow-slate-500/20" },
  { id: "math", name: "Math Kingdom", desc: "Mathematics", icon: Calculator, color: "bg-pink-500", shadow: "shadow-pink-500/20" },
];

export function Worlds() {
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);
  const saveProgress = useSaveProgress();
  const { toast } = useToast();

  const handleCompleteChallenge = () => {
    saveProgress.mutate({
      data: {
        playerName: "SpaceExplorer",
        totalPoints: 100
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Challenge Completed!",
          description: "You earned 100 XP!",
        });
      }
    });
  };

  if (selectedWorld) {
    const world = WORLDS.find(w => w.id === selectedWorld);
    const Icon = world?.icon || Rocket;
    return (
      <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => setSelectedWorld(null)} className="font-bold -ml-4">
          <X className="mr-2 w-4 h-4" /> Back to Worlds
        </Button>
        
        <div className={`p-12 rounded-[3rem] text-white ${world?.color} relative overflow-hidden shadow-2xl`}>
          <div className="relative z-10 space-y-4">
            <Icon className="w-16 h-16 opacity-80" />
            <h1 className="text-5xl font-extrabold">{world?.name}</h1>
            <p className="text-xl font-medium opacity-90">{world?.desc}</p>
          </div>
          <Icon className="absolute -right-10 -bottom-10 w-96 h-96 opacity-10 rotate-12" />
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Mini Challenges</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-4 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] rounded-3xl hover:-translate-y-1 transition-transform cursor-pointer" onClick={handleCompleteChallenge}>
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-2xl ${world?.color} text-white flex items-center justify-center opacity-80`}>
                    <span className="font-bold text-xl">{i}</span>
                  </div>
                  <h3 className="font-bold text-lg">Challenge {i}</h3>
                  <Button variant="secondary" className="w-full font-bold">Play</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-16">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-5xl font-extrabold text-primary">STEM Worlds</h1>
        <p className="text-xl text-muted-foreground font-medium">Travel to different zones to learn and play!</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {WORLDS.map(world => (
          <button
            key={world.id}
            onClick={() => setSelectedWorld(world.id)}
            className={`group relative text-left outline-none`}
          >
            <div className={`absolute inset-0 bg-white border-4 border-muted rounded-[2rem] shadow-[0_8px_0_0_rgba(0,0,0,0.1)] transition-transform group-hover:-translate-y-2 group-hover:shadow-[0_16px_0_0_rgba(0,0,0,0.1)] group-active:translate-y-1 group-active:shadow-[0_4px_0_0_rgba(0,0,0,0.1)]`} />
            <div className="relative p-8 space-y-6 pointer-events-none">
              <div className={`w-20 h-20 rounded-[1.5rem] ${world.color} text-white flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                <world.icon className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">{world.name}</h3>
                <p className="text-muted-foreground font-medium">{world.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
