import { useState } from "react";
import { useSubmitScore, useListScores } from "@workspace/api-client-react";
import { BlockEditor, BlockEditorProject } from "@/components/block-editor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy } from "lucide-react";

// ─── Project definitions ───────────────────────────────────────────────────────

const PROJECTS: BlockEditorProject[] = [
  {
    id: "dance-party",
    title: "Dance Party",
    description: "Animate your cat using motion and looks blocks. Make it dance, spin, and change color!",
    spriteType: "cat",
    stageColor: "#1a0533",
    categories: ["event", "motion", "looks", "control", "sound"],
  },
  {
    id: "rocket-launch",
    title: "Rocket Launch",
    description: "Program a rocket to soar through space. Use motion and looks to create a launch sequence!",
    spriteType: "rocket",
    stageColor: "#030818",
    categories: ["event", "motion", "looks", "control", "sound"],
  },
  {
    id: "star-story",
    title: "Star Story",
    description: "Tell a story with your star character. Use say blocks, sound, and motion to create a scene!",
    spriteType: "star",
    stageColor: "#0a1628",
    categories: ["event", "looks", "sound", "control", "operator"],
  },
  {
    id: "frog-maze",
    title: "Frog Maze",
    description: "Guide the frog to the lily pad! Use move forward, turn, and jump blocks to reach the goal.",
    spriteType: "frog",
    stageColor: "#0d2b1a",
    categories: ["event", "motion", "control"],
    mazeDef: {
      cols: 8, rows: 6,
      startCol: 0, startRow: 0,
      goalCol: 7, goalRow: 5,
      walls: [
        {c:1,r:0},{c:1,r:1},{c:1,r:2},
        {c:3,r:1},{c:3,r:2},{c:3,r:3},{c:3,r:4},
        {c:5,r:2},{c:5,r:3},{c:5,r:4},{c:5,r:5},
        {c:2,r:5},{c:2,r:4},
        {c:6,r:0},{c:6,r:1},
      ],
      coins: [{c:2,r:2},{c:4,r:4},{c:7,r:1}],
    },
  },
  {
    id: "robot-factory",
    title: "Robot Factory",
    description: "Program the robot to collect all 3 items and reach the exit. Use repeat and turns to be efficient!",
    spriteType: "robot",
    stageColor: "#111827",
    categories: ["event", "motion", "control"],
    mazeDef: {
      cols: 7, rows: 7,
      startCol: 0, startRow: 6,
      goalCol: 6, goalRow: 0,
      walls: [
        {c:2,r:1},{c:2,r:2},{c:2,r:3},{c:2,r:4},
        {c:4,r:2},{c:4,r:3},{c:4,r:4},{c:4,r:5},
        {c:0,r:3},{c:1,r:3},
        {c:5,r:0},{c:5,r:1},
      ],
      coins: [{c:1,r:1},{c:3,r:5},{c:6,r:4}],
    },
  },
  {
    id: "pattern-art",
    title: "Pattern Art",
    description: "Use repeat blocks and motion to make your rocket draw beautiful patterns on the stage!",
    spriteType: "rocket",
    stageColor: "#12033d",
    categories: ["event", "motion", "looks", "control", "operator"],
  },
];

// ─── Project card ──────────────────────────────────────────────────────────────

const PROJECT_EMOJIS: Record<string, string> = {
  "dance-party":   "🐱",
  "rocket-launch": "🚀",
  "star-story":    "⭐",
  "frog-maze":     "🐸",
  "robot-factory": "🤖",
  "pattern-art":   "🎨",
};

const PROJECT_COLORS: Record<string, string> = {
  "dance-party":   "linear-gradient(135deg,#ff6b9d,#c951ff)",
  "rocket-launch": "linear-gradient(135deg,#e63946,#f4a261)",
  "star-story":    "linear-gradient(135deg,#ffd700,#ff8c00)",
  "frog-maze":     "linear-gradient(135deg,#4caf50,#009688)",
  "robot-factory": "linear-gradient(135deg,#5a7dd6,#3d5a9e)",
  "pattern-art":   "linear-gradient(135deg,#9b5de5,#00bbf9)",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Games() {
  const [selected, setSelected] = useState<BlockEditorProject | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const submitScore = useSubmitScore();
  const { data: scores } = useListScores({ limit: 10 });

  function handleComplete(projectId: string, steps: number, coins: number) {
    const points = Math.max(50, 500 - steps * 10 + coins * 100);
    submitScore.mutate({
      data: { playerName: "Explorer", game: projectId, score: points },
    });
  }

  if (selected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button
            variant="ghost"
            onClick={() => setSelected(null)}
            style={{ gap: 6, fontWeight: 700 }}
          >
            <ArrowLeft size={16} /> Back to Projects
          </Button>
          <span style={{
            background: PROJECT_COLORS[selected.id],
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 900,
            fontSize: 20,
          }}>
            {PROJECT_EMOJIS[selected.id]} {selected.title}
          </span>
        </div>
        <BlockEditor
          project={selected}
          onComplete={(steps, coins) => handleComplete(selected.id, steps, coins)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-5xl font-extrabold" style={{
          background: "linear-gradient(90deg,#ff6b9d,#c951ff,#00bbf9)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Coding Studio
        </h1>
        <p className="text-xl text-muted-foreground font-semibold">
          Build programs with visual blocks — like Scratch and Blockly!
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {["Events", "Motion", "Looks", "Control", "Sound", "Operators"].map((cat, i) => {
            const colors = ["#FFD500","#4C97FF","#9966FF","#FFAB19","#CF63CF","#59C059"];
            return (
              <span key={cat} style={{
                background: colors[i],
                color: "white",
                borderRadius: 20,
                padding: "3px 12px",
                fontSize: 12,
                fontWeight: 800,
              }}>{cat}</span>
            );
          })}
        </div>
      </div>

      {/* Project grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 20,
      }}>
        {PROJECTS.map(proj => (
          <div
            key={proj.id}
            onClick={() => setSelected(proj)}
            style={{
              background: "white",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "transform 0.15s, box-shadow 0.15s",
              border: "3px solid transparent",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
            }}
          >
            {/* Banner */}
            <div style={{
              background: PROJECT_COLORS[proj.id],
              height: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
            }}>
              {PROJECT_EMOJIS[proj.id]}
            </div>
            {/* Content */}
            <div style={{ padding: "16px 18px 18px" }}>
              <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>{proj.title}</div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 12, lineHeight: 1.5 }}>
                {proj.description}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {proj.categories.map(cat => {
                  const colors: Record<string, string> = {
                    event:"#FFD500",motion:"#4C97FF",looks:"#9966FF",
                    control:"#FFAB19",sound:"#CF63CF",operator:"#59C059",
                  };
                  return (
                    <span key={cat} style={{
                      background: colors[cat] + "22",
                      color: colors[cat],
                      border: `1.5px solid ${colors[cat]}`,
                      borderRadius: 10,
                      padding: "1px 8px",
                      fontSize: 11,
                      fontWeight: 700,
                    }}>
                      {cat}
                    </span>
                  );
                })}
                {proj.mazeDef && (
                  <span style={{
                    background: "#ff6b6b22",
                    color: "#ff6b6b",
                    border: "1.5px solid #ff6b6b",
                    borderRadius: 10,
                    padding: "1px 8px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    maze
                  </span>
                )}
              </div>
              <button style={{
                width: "100%",
                background: PROJECT_COLORS[proj.id],
                border: "none",
                borderRadius: 12,
                color: "white",
                fontWeight: 900,
                fontSize: 15,
                padding: "10px",
                cursor: "pointer",
              }}>
                Open Project
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard toggle */}
      <div>
        <button
          onClick={() => setShowLeaderboard(s => !s)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            fontWeight: 800,
            fontSize: 18,
            cursor: "pointer",
            color: "#ff8c00",
            marginBottom: 12,
          }}
        >
          <Trophy size={20} /> Top Scores {showLeaderboard ? "▲" : "▼"}
        </button>
        {showLeaderboard && (
          <div style={{
            background: "white",
            borderRadius: 16,
            overflow: "hidden",
            border: "3px solid #f0f0f0",
            maxWidth: 500,
          }}>
            {scores?.slice(0, 10).map((s, i) => (
              <div key={s.id} style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                borderBottom: i < 9 ? "1px solid #f5f5f5" : undefined,
                gap: 12,
              }}>
                <span style={{
                  fontWeight: 900,
                  fontSize: 16,
                  color: i < 3 ? ["#ffd700","#c0c0c0","#cd7f32"][i] : "#aaa",
                  width: 24,
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{s.playerName}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{s.game}</div>
                </div>
                <div style={{ fontWeight: 900, fontSize: 18, color: "#4C97FF" }}>{s.score}</div>
              </div>
            ))}
            {!scores?.length && (
              <div style={{ padding: 24, textAlign: "center", color: "#aaa", fontWeight: 600 }}>
                No scores yet — be the first!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
