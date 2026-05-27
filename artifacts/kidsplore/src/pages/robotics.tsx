import { useState } from "react";
import { useListMissions, useSubmitScore } from "@workspace/api-client-react";
import { BlockEditor, BlockEditorProject } from "@/components/block-editor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Static mission library (frontend-defined challenges) ─────────────────────

const STATIC_MISSIONS: BlockEditorProject[] = [
  {
    id: "mission-1",
    title: "Hello Robot",
    description: "Move the robot to the green star. Use Move forward and Turn right to find your way!",
    spriteType: "robot",
    stageColor: "#0a0a1e",
    categories: ["event", "motion"],
    mazeDef: {
      cols: 6, rows: 5,
      startCol: 0, startRow: 4,
      goalCol: 5, goalRow: 0,
      walls: [],
    },
  },
  {
    id: "mission-2",
    title: "Left Turn Larry",
    description: "The path has corners! Use turns and forward moves to navigate through.",
    spriteType: "robot",
    stageColor: "#0a0a1e",
    categories: ["event", "motion"],
    mazeDef: {
      cols: 7, rows: 6,
      startCol: 0, startRow: 5,
      goalCol: 6, goalRow: 0,
      walls: [
        {c:2,r:0},{c:2,r:1},{c:2,r:2},{c:2,r:3},
        {c:4,r:2},{c:4,r:3},{c:4,r:4},{c:4,r:5},
      ],
    },
  },
  {
    id: "mission-3",
    title: "The Maze",
    description: "A tricky maze! Use all movement commands — and try Repeat to write shorter programs.",
    spriteType: "robot",
    stageColor: "#0a0a1e",
    categories: ["event", "motion", "control"],
    mazeDef: {
      cols: 8, rows: 7,
      startCol: 0, startRow: 0,
      goalCol: 7, goalRow: 6,
      walls: [
        {c:1,r:0},{c:1,r:1},{c:1,r:2},
        {c:3,r:2},{c:3,r:3},{c:3,r:4},{c:3,r:5},
        {c:5,r:1},{c:5,r:2},{c:5,r:3},
        {c:2,r:6},{c:2,r:5},
        {c:6,r:4},{c:6,r:5},{c:6,r:6},
      ],
    },
  },
  {
    id: "mission-4",
    title: "Collect the Stars",
    description: "Pick up 3 star coins scattered across the grid before reaching the exit!",
    spriteType: "robot",
    stageColor: "#030818",
    categories: ["event", "motion", "control"],
    mazeDef: {
      cols: 7, rows: 7,
      startCol: 0, startRow: 0,
      goalCol: 6, goalRow: 6,
      walls: [
        {c:2,r:1},{c:2,r:2},
        {c:4,r:4},{c:4,r:5},
        {c:1,r:4},{c:1,r:5},
        {c:5,r:1},{c:5,r:2},
      ],
      coins: [{c:3,r:0},{c:6,r:3},{c:0,r:6}],
    },
  },
  {
    id: "mission-5",
    title: "Factory Sorter",
    description: "Navigate through the factory floor. Use Repeat blocks to write efficient code!",
    spriteType: "robot",
    stageColor: "#111827",
    categories: ["event", "motion", "control"],
    mazeDef: {
      cols: 9, rows: 7,
      startCol: 0, startRow: 6,
      goalCol: 8, goalRow: 0,
      walls: [
        {c:2,r:1},{c:2,r:2},{c:2,r:3},{c:2,r:4},{c:2,r:5},
        {c:4,r:1},{c:4,r:2},{c:4,r:3},
        {c:6,r:3},{c:6,r:4},{c:6,r:5},{c:6,r:6},
        {c:8,r:2},{c:8,r:3},
      ],
      coins: [{c:1,r:0},{c:5,r:0},{c:7,r:6}],
    },
  },
  {
    id: "mission-6",
    title: "Bridge Builder",
    description: "Use Jump to leap over gaps in the bridge! Combine Forward and Jump carefully.",
    spriteType: "robot",
    stageColor: "#1a0a00",
    categories: ["event", "motion", "control"],
    mazeDef: {
      cols: 9, rows: 5,
      startCol: 0, startRow: 4,
      goalCol: 8, goalRow: 0,
      walls: [
        {c:2,r:4},{c:4,r:4},{c:6,r:4},
        {c:2,r:3},{c:4,r:3},
        {c:1,r:1},{c:1,r:2},
        {c:5,r:1},{c:5,r:2},{c:5,r:3},
        {c:7,r:1},{c:7,r:2},{c:7,r:3},
      ],
      coins: [{c:3,r:4},{c:5,r:0}],
    },
  },
  {
    id: "mission-7",
    title: "Space Rescue",
    description: "Navigate an asteroid field to reach the stranded astronaut! Watch for asteroid walls.",
    spriteType: "rocket",
    stageColor: "#010614",
    categories: ["event", "motion", "control"],
    mazeDef: {
      cols: 10, rows: 8,
      startCol: 0, startRow: 7,
      goalCol: 9, goalRow: 0,
      walls: [
        {c:1,r:2},{c:2,r:2},{c:3,r:2},
        {c:1,r:5},{c:2,r:5},{c:2,r:6},
        {c:5,r:1},{c:5,r:2},{c:5,r:3},{c:5,r:4},
        {c:7,r:3},{c:7,r:4},{c:7,r:5},{c:7,r:6},
        {c:4,r:6},{c:4,r:7},
        {c:9,r:3},{c:9,r:4},
      ],
      coins: [{c:3,r:7},{c:8,r:7},{c:6,r:0}],
    },
  },
  {
    id: "mission-8",
    title: "Ocean Explorer",
    description: "Dive through the ocean depths! Collect 3 samples and reach the research station.",
    spriteType: "frog",
    stageColor: "#000d1a",
    categories: ["event", "motion", "control"],
    mazeDef: {
      cols: 8, rows: 8,
      startCol: 7, startRow: 7,
      goalCol: 0, goalRow: 0,
      walls: [
        {c:6,r:1},{c:6,r:2},{c:6,r:3},
        {c:4,r:0},{c:4,r:1},{c:4,r:2},
        {c:2,r:3},{c:2,r:4},{c:2,r:5},
        {c:5,r:5},{c:5,r:6},{c:5,r:7},
        {c:3,r:6},{c:3,r:7},
        {c:1,r:1},{c:1,r:2},
      ],
      coins: [{c:7,r:0},{c:0,r:7},{c:3,r:3}],
    },
  },
];

// ─── Mission card ──────────────────────────────────────────────────────────────

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "#59C059",
  Medium: "#FFAB19",
  Hard: "#e63946",
};

function MissionCard({
  mission,
  index,
  dbMission,
  onSelect,
}: {
  mission: BlockEditorProject;
  index: number;
  dbMission?: { difficulty: string; starCount: number; isUnlocked: boolean } | null;
  onSelect: () => void;
}) {
  const locked = index > 0 && !dbMission?.isUnlocked && index > 1;
  const diff = index < 2 ? "Easy" : index < 5 ? "Medium" : "Hard";
  const stars = dbMission?.starCount ?? 0;

  return (
    <div
      onClick={locked ? undefined : onSelect}
      style={{
        background: locked ? "#f5f5f5" : "white",
        borderRadius: 16,
        padding: "16px 18px",
        border: "3px solid",
        borderColor: locked ? "#e0e0e0" : "#e8e8ff",
        cursor: locked ? "not-allowed" : "pointer",
        opacity: locked ? 0.6 : 1,
        transition: "transform 0.15s, box-shadow 0.15s",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
      onMouseEnter={e => !locked && ((e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)")}
      onMouseLeave={e => !locked && ((e.currentTarget as HTMLDivElement).style.transform = "translateY(0)")}
    >
      {/* Number */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: locked ? "#ccc" : "linear-gradient(135deg,#4C97FF,#9966FF)",
        color: "white",
        fontWeight: 900,
        fontSize: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        {locked ? <Lock size={18} /> : index + 1}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{mission.title}</div>
        <div style={{ fontSize: 12, color: "#777", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {mission.description}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
          <span style={{
            background: (DIFFICULTY_COLORS[diff] ?? "#ccc") + "22",
            color: DIFFICULTY_COLORS[diff] ?? "#ccc",
            border: `1.5px solid ${DIFFICULTY_COLORS[diff] ?? "#ccc"}`,
            borderRadius: 8,
            padding: "1px 8px",
            fontSize: 11,
            fontWeight: 700,
          }}>
            {diff}
          </span>
          <div style={{ display: "flex", gap: 2 }}>
            {[0,1,2].map(si => (
              <Star key={si} size={14} fill={si < stars ? "#ffd700" : "none"} color={si < stars ? "#ffd700" : "#ccc"} />
            ))}
          </div>
        </div>
      </div>

      {/* Arrow */}
      {!locked && (
        <div style={{ color: "#4C97FF", fontWeight: 900, fontSize: 20 }}>›</div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function Robotics() {
  const { data: dbMissions } = useListMissions();
  const submitScore = useSubmitScore();
  const { toast } = useToast();
  const [activeMission, setActiveMission] = useState<BlockEditorProject | null>(null);

  function handleComplete(steps: number, coins: number) {
    if (!activeMission) return;
    const stars = steps <= 12 ? 3 : steps <= 20 ? 2 : 1;
    const points = stars * 100 + coins * 50;
    submitScore.mutate({
      data: { playerName: "Explorer", game: activeMission.title, score: points },
    });
    toast({
      title: `Mission Complete! ${["","★","★★","★★★"][stars]}`,
      description: `You scored ${points} points! ${coins > 0 ? `Collected ${coins} coin${coins > 1 ? "s" : ""}!` : ""}`,
    });
  }

  if (activeMission) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button variant="ghost" onClick={() => setActiveMission(null)} style={{ gap: 6, fontWeight: 700 }}>
            <ArrowLeft size={16} /> Mission Select
          </Button>
          <span style={{ fontWeight: 900, fontSize: 18, color: "#4C97FF" }}>
            {activeMission.title}
          </span>
        </div>
        <BlockEditor project={activeMission} onComplete={handleComplete} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1
          className="text-5xl font-extrabold"
          style={{
            background: "linear-gradient(90deg,#4C97FF,#9966FF,#00bbf9)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Robotics Mission Control
        </h1>
        <p className="text-xl text-muted-foreground font-semibold">
          Program a robot using visual blocks to complete each mission!
        </p>
      </div>

      {/* How it works */}
      <div style={{
        background: "linear-gradient(135deg,#1e1e3e,#2d2d5e)",
        borderRadius: 20,
        padding: "20px 24px",
        color: "white",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
        gap: 16,
      }}>
        {[
          { icon: "📦", label: "Pick a block", desc: "Click blocks in the palette" },
          { icon: "📝", label: "Build program", desc: "Stack blocks in the workspace" },
          { icon: "▶️", label: "Run & watch", desc: "See your robot move live" },
          { icon: "⭐", label: "Earn stars", desc: "Fewer steps = more stars" },
        ].map(step => (
          <div key={step.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>{step.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{step.label}</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{step.desc}</div>
          </div>
        ))}
      </div>

      {/* Mission list */}
      <div>
        <h2 className="text-2xl font-extrabold mb-6" style={{ color: "#4C97FF" }}>
          Choose a Mission
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 12 }}>
          {STATIC_MISSIONS.map((mission, index) => {
            const dbM = dbMissions?.[index];
            return (
              <MissionCard
                key={mission.id}
                mission={mission}
                index={index}
                dbMission={dbM ? {
                  difficulty: dbM.difficulty,
                  starCount: dbM.starCount,
                  isUnlocked: dbM.isUnlocked,
                } : null}
                onSelect={() => setActiveMission(mission)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
