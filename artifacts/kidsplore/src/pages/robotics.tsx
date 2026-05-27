import { useState } from "react";
import { useListMissions, useSubmitScore } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, ArrowUp, ArrowRight, ArrowLeft, ArrowDown, Play, RotateCcw, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const COMMANDS = [
  { id: "UP", icon: ArrowUp, label: "Forward", color: "bg-blue-500" },
  { id: "DOWN", icon: ArrowDown, label: "Back", color: "bg-blue-600" },
  { id: "LEFT", icon: ArrowLeft, label: "Left", color: "bg-indigo-500" },
  { id: "RIGHT", icon: ArrowRight, label: "Right", color: "bg-indigo-600" },
];

const GRID_SIZE = 8;
const START_POS = { x: 0, y: GRID_SIZE - 1 };
const GOAL_POS = { x: GRID_SIZE - 1, y: 0 };

export function Robotics() {
  const { data: fetchedMissions } = useListMissions();
  const submitScore = useSubmitScore();
  const { toast } = useToast();

  const [sequence, setSequence] = useState<string[]>([]);
  const [robotPos, setRobotPos] = useState(START_POS);
  const [isPlaying, setIsPlaying] = useState(false);

  const addCommand = (cmd: string) => {
    if (!isPlaying && sequence.length < 20) {
      setSequence([...sequence, cmd]);
    }
  };

  const reset = () => {
    setRobotPos(START_POS);
    setIsPlaying(false);
    setSequence([]);
  };

  const runSequence = async () => {
    if (sequence.length === 0 || isPlaying) return;
    setIsPlaying(true);
    let curr = { ...START_POS };
    setRobotPos(curr);

    for (let i = 0; i < sequence.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      const cmd = sequence[i];
      if (cmd === "UP" && curr.y > 0) curr.y -= 1;
      if (cmd === "DOWN" && curr.y < GRID_SIZE - 1) curr.y += 1;
      if (cmd === "LEFT" && curr.x > 0) curr.x -= 1;
      if (cmd === "RIGHT" && curr.x < GRID_SIZE - 1) curr.x += 1;
      setRobotPos({ ...curr });
    }

    if (curr.x === GOAL_POS.x && curr.y === GOAL_POS.y) {
      const stars = sequence.length <= 14 ? 3 : sequence.length <= 17 ? 2 : 1;
      toast({
        title: "Mission Accomplished!",
        description: `You reached the goal with ${stars} stars!`,
      });
      submitScore.mutate({
        data: {
          playerName: "SpaceExplorer",
          game: "RoboticsMission",
          score: stars * 100
        }
      });
    } else {
      toast({
        title: "Mission Failed",
        description: "You didn't reach the goal. Try again!",
        variant: "destructive"
      });
    }
    setIsPlaying(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in zoom-in-95">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-blue-500 flex items-center justify-center gap-3">
          <Rocket className="w-10 h-10" />
          Mission Control
        </h1>
        <p className="text-xl text-muted-foreground font-medium">Program your robot to reach the green base!</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        {/* World Grid */}
        <Card className="border-4 shadow-[0_8px_0_0_rgba(0,0,0,0.1)] rounded-[2rem] overflow-hidden bg-slate-900 p-8 flex items-center justify-center relative">
          <div 
            className="grid gap-1"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              width: "100%", maxWidth: "500px", aspectRatio: "1/1"
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const isRobot = x === robotPos.x && y === robotPos.y;
              const isGoal = x === GOAL_POS.x && y === GOAL_POS.y;
              const isStart = x === START_POS.x && y === START_POS.y;

              return (
                <div key={i} className={`rounded-md relative ${isGoal ? 'bg-green-500/50 border-2 border-green-400' : isStart ? 'bg-blue-500/20' : 'bg-slate-800'}`}>
                  {isRobot && (
                    <div className="absolute inset-1 bg-blue-500 rounded-md shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center transition-all duration-300">
                      <Rocket className="text-white w-3/4 h-3/4" />
                    </div>
                  )}
                  {isGoal && !isRobot && (
                    <div className="absolute inset-1 bg-green-400/20 rounded-md flex items-center justify-center animate-pulse">
                      <Star className="text-green-300 w-1/2 h-1/2" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Controls */}
        <div className="space-y-6">
          <Card className="border-4 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] rounded-3xl">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-bold text-muted-foreground uppercase text-sm tracking-wider">Commands</h3>
              <div className="grid grid-cols-2 gap-2">
                {COMMANDS.map(cmd => (
                  <Button 
                    key={cmd.id} 
                    className={`${cmd.color} hover:${cmd.color}/90 text-white h-12 font-bold`}
                    onClick={() => addCommand(cmd.id)}
                    disabled={isPlaying || sequence.length >= 20}
                  >
                    <cmd.icon className="w-5 h-5 mr-1" />
                    {cmd.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] rounded-3xl min-h-[200px]">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-muted-foreground uppercase text-sm tracking-wider">Program ({sequence.length}/20)</h3>
                <Button variant="ghost" size="sm" onClick={() => setSequence([])} disabled={isPlaying} className="h-8">Clear</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sequence.map((cmd, i) => {
                  const command = COMMANDS.find(c => c.id === cmd);
                  const Icon = command?.icon || ArrowRight;
                  return (
                    <div key={i} className={`${command?.color} text-white p-2 rounded-lg shadow-sm animate-in zoom-in`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  );
                })}
                {sequence.length === 0 && (
                  <div className="text-muted-foreground/50 text-sm font-medium w-full text-center py-8">
                    Add commands here to build your program!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              className="flex-1 h-14 rounded-2xl font-bold text-lg bg-green-500 hover:bg-green-600 text-white" 
              onClick={runSequence}
              disabled={isPlaying || sequence.length === 0}
            >
              <Play className="w-6 h-6 mr-2 fill-current" /> Run
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 h-14 rounded-2xl font-bold text-lg border-4"
              onClick={reset}
            >
              <RotateCcw className="w-6 h-6 mr-2" /> Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
