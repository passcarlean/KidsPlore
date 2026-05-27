import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Square, RotateCcw, ChevronDown, ChevronRight, X, Plus, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BlockCategory = "event" | "motion" | "looks" | "control" | "sound" | "operator";

export interface BlockParam {
  name: string;
  type: "number" | "text" | "select";
  default: number | string;
  options?: string[];
  min?: number;
  max?: number;
}

export interface BlockDef {
  id: string;
  category: BlockCategory;
  label: string; // use {paramName} for inline params
  params?: BlockParam[];
  hat?: boolean;   // top block (event)
  cap?: boolean;   // terminator block
  loop?: boolean;  // indents next blocks
}

export interface PlacedBlock {
  uid: string;
  defId: string;
  values: Record<string, string | number>;
}

export interface SpriteState {
  x: number;
  y: number;
  angle: number;       // degrees, 0=right
  visible: boolean;
  size: number;        // 1 = 100%
  hue: number;         // 0-360
  saying: string | null;
  sayEnd: number;
  gridX?: number;
  gridY?: number;
}

export interface MazeDef {
  cols: number;
  rows: number;
  startCol: number;
  startRow: number;
  goalCol: number;
  goalRow: number;
  walls: { c: number; r: number }[];
  coins?: { c: number; r: number }[];
}

export interface BlockEditorProject {
  id: string;
  title: string;
  description: string;
  spriteType: "cat" | "robot" | "rocket" | "star" | "frog";
  stageColor: string;
  categories: BlockCategory[];
  mazeDef?: MazeDef;
  onComplete?: (steps: number, coins: number) => void;
}

// ─── Category config ───────────────────────────────────────────────────────────

const CAT: Record<BlockCategory, { color: string; dark: string; label: string }> = {
  event:    { color: "#FFD500", dark: "#CCA800", label: "Events"    },
  motion:   { color: "#4C97FF", dark: "#3373CC", label: "Motion"    },
  looks:    { color: "#9966FF", dark: "#7744CC", label: "Looks"     },
  control:  { color: "#FFAB19", dark: "#CC8800", label: "Control"   },
  sound:    { color: "#CF63CF", dark: "#9E3F9E", label: "Sound"     },
  operator: { color: "#59C059", dark: "#3D8F3D", label: "Operators" },
};

// ─── Block definitions ─────────────────────────────────────────────────────────

export const ALL_BLOCKS: BlockDef[] = [
  // Events
  { id: "when_start",   category: "event",    label: "When flag clicked",                hat: true },
  { id: "when_key",     category: "event",    label: "When {key} pressed",               hat: true,
    params: [{ name: "key", type: "select", default: "space",
               options: ["space", "left", "right", "up", "down"] }] },
  // Motion
  { id: "move",         category: "motion",   label: "Move {steps} steps",
    params: [{ name: "steps", type: "number", default: 10, min: -200, max: 200 }] },
  { id: "turn_cw",      category: "motion",   label: "Turn clockwise {deg} degrees",
    params: [{ name: "deg", type: "number", default: 15, min: 1, max: 360 }] },
  { id: "turn_ccw",     category: "motion",   label: "Turn counter-clockwise {deg} degrees",
    params: [{ name: "deg", type: "number", default: 15, min: 1, max: 360 }] },
  { id: "go_to",        category: "motion",   label: "Go to x: {x} y: {y}",
    params: [
      { name: "x", type: "number", default: 0, min: -240, max: 240 },
      { name: "y", type: "number", default: 0, min: -180, max: 180 },
    ] },
  { id: "go_dir",       category: "motion",   label: "Point in direction {dir}",
    params: [{ name: "dir", type: "select", default: "right",
               options: ["right", "left", "up", "down"] }] },
  // Grid motion (for maze)
  { id: "move_forward", category: "motion",   label: "Move forward" },
  { id: "move_back",    category: "motion",   label: "Move backward" },
  { id: "turn_left",    category: "motion",   label: "Turn left" },
  { id: "turn_right",   category: "motion",   label: "Turn right" },
  { id: "jump",         category: "motion",   label: "Jump" },
  // Looks
  { id: "say",          category: "looks",    label: "Say {msg} for {secs} secs",
    params: [
      { name: "msg",  type: "text",   default: "Hello!" },
      { name: "secs", type: "number", default: 2, min: 0.5, max: 10 },
    ] },
  { id: "think",        category: "looks",    label: "Think {msg} for {secs} secs",
    params: [
      { name: "msg",  type: "text",   default: "Hmm..." },
      { name: "secs", type: "number", default: 2, min: 0.5, max: 10 },
    ] },
  { id: "set_size",     category: "looks",    label: "Set size to {pct}%",
    params: [{ name: "pct", type: "number", default: 100, min: 10, max: 300 }] },
  { id: "change_color", category: "looks",    label: "Change color by {n}",
    params: [{ name: "n", type: "number", default: 25, min: -180, max: 180 }] },
  { id: "show",         category: "looks",    label: "Show" },
  { id: "hide",         category: "looks",    label: "Hide" },
  // Control
  { id: "wait",         category: "control",  label: "Wait {secs} secs",
    params: [{ name: "secs", type: "number", default: 1, min: 0.1, max: 10 }] },
  { id: "repeat",       category: "control",  label: "Repeat {n}",   loop: true,
    params: [{ name: "n", type: "number", default: 10, min: 1, max: 50 }] },
  { id: "forever",      category: "control",  label: "Forever",       loop: true },
  { id: "end_repeat",   category: "control",  label: "End repeat",    cap: true },
  { id: "if_at_edge",   category: "control",  label: "If on edge, bounce" },
  // Sound
  { id: "play_sound",   category: "sound",    label: "Play sound {sound}",
    params: [{ name: "sound", type: "select", default: "pop",
               options: ["pop", "meow", "boing", "drum", "beep"] }] },
  { id: "play_note",    category: "sound",    label: "Play note {note} for {beats} beats",
    params: [
      { name: "note",  type: "select", default: "C4",
        options: ["C3","D3","E3","F3","G3","A3","B3","C4","D4","E4","F4","G4","A4","B4","C5"] },
      { name: "beats", type: "number", default: 0.5, min: 0.25, max: 4 },
    ] },
  // Operators
  { id: "random",       category: "operator", label: "Pick random {lo} to {hi}",
    params: [
      { name: "lo", type: "number", default: 1,  min: -1000, max: 1000 },
      { name: "hi", type: "number", default: 10, min: -1000, max: 1000 },
    ] },
];

function getDef(id: string) {
  return ALL_BLOCKS.find(b => b.id === id)!;
}

// ─── Block shape via SVG ───────────────────────────────────────────────────────

function blockPath(w: number, h: number, hat: boolean, cap: boolean): string {
  const r = 6;       // corner radius
  const nx = 14;     // notch x start
  const nw = 24;     // notch width
  const nh = 7;      // notch height
  const nr = 4;      // notch corner radius

  const top = hat ? hatTop(w, r) : stackTop(w, r, nx, nw, nh, nr);
  const bottom = cap ? capBottom(w, r) : stackBottom(w, h, r, nx, nw, nh, nr);

  return `${top}${bottom}`;
}

function hatTop(w: number, r: number) {
  return `M ${r},0 Q 0,0 0,${r} `;
}

function stackTop(w: number, r: number, nx: number, nw: number, nh: number, nr: number) {
  return `M 0,${r} Q 0,0 ${r},0 L ${nx},0 Q ${nx},${nh} ${nx+nr},${nh} L ${nx+nw-nr},${nh} Q ${nx+nw},${nh} ${nx+nw},0 `;
}

function capBottom(w: number, r: number) {
  const h = 0; // placeholder: height comes from content
  return ``;
}

function stackBottom(w: number, h: number, r: number, nx: number, nw: number, nh: number, nr: number) {
  return ``;
}

// ─── Simpler visual block ──────────────────────────────────────────────────────
// Use a pure CSS/div approach that reads clearly as a code block

interface BlockPieceProps {
  block: PlacedBlock;
  def: BlockDef;
  index: number;
  indent: number;
  onRemove: (uid: string) => void;
  onParamChange: (uid: string, param: string, val: string | number) => void;
  dragging: boolean;
  onDragStart: (e: React.DragEvent, uid: string) => void;
  onDragOver: (e: React.DragEvent, uid: string) => void;
  onDrop: (e: React.DragEvent, uid: string) => void;
}

function BlockPiece({ block, def, indent, onRemove, onParamChange, onDragStart, onDragOver, onDrop }: BlockPieceProps) {
  const cat = CAT[def.category];
  const isHat = !!def.hat;

  function renderLabel() {
    const parts = def.label.split(/(\{[^}]+\})/);
    return parts.map((part, i) => {
      const match = part.match(/^\{(.+)\}$/);
      if (!match) return <span key={i}>{part}</span>;
      const paramName = match[1];
      const paramDef = def.params?.find(p => p.name === paramName);
      if (!paramDef) return <span key={i} style={{ color: cat.dark, fontWeight: 900 }}>{paramName}</span>;
      const val = block.values[paramName] ?? paramDef.default;

      if (paramDef.type === "select") {
        return (
          <select
            key={i}
            value={String(val)}
            onClick={e => e.stopPropagation()}
            onChange={e => onParamChange(block.uid, paramName, e.target.value)}
            style={{
              background: cat.dark,
              color: "white",
              border: "none",
              borderRadius: 4,
              padding: "1px 4px",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              margin: "0 2px",
            }}
          >
            {paramDef.options!.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        );
      }

      if (paramDef.type === "text") {
        return (
          <input
            key={i}
            type="text"
            value={String(val)}
            onClick={e => e.stopPropagation()}
            onChange={e => onParamChange(block.uid, paramName, e.target.value)}
            style={{
              background: "white",
              color: "#333",
              border: "none",
              borderRadius: 4,
              padding: "1px 6px",
              fontWeight: 700,
              fontSize: 12,
              width: 60,
              margin: "0 2px",
            }}
          />
        );
      }

      return (
        <input
          key={i}
          type="number"
          value={String(val)}
          min={paramDef.min}
          max={paramDef.max}
          onClick={e => e.stopPropagation()}
          onChange={e => onParamChange(block.uid, paramName, Number(e.target.value))}
          style={{
            background: "white",
            color: "#333",
            border: "none",
            borderRadius: 4,
            padding: "1px 4px",
            fontWeight: 700,
            fontSize: 12,
            width: 46,
            margin: "0 2px",
            textAlign: "center",
          }}
        />
      );
    });
  }

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, block.uid)}
      onDragOver={e => { e.preventDefault(); onDragOver(e, block.uid); }}
      onDrop={e => onDrop(e, block.uid)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        marginLeft: indent * 20,
        marginBottom: 2,
        cursor: "grab",
        userSelect: "none",
      }}
    >
      {/* Left drag handle */}
      <GripVertical size={14} color="#aaa" style={{ flexShrink: 0 }} />

      {/* Block body */}
      <div
        style={{
          position: "relative",
          background: cat.color,
          borderRadius: isHat ? "20px 20px 4px 4px" : "4px",
          padding: isHat ? "10px 14px 8px 14px" : "6px 10px",
          color: "white",
          fontSize: 13,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 4,
          flexWrap: "wrap",
          boxShadow: `0 3px 0 ${cat.dark}`,
          flex: 1,
          minHeight: isHat ? 40 : 34,
          borderLeft: isHat ? `5px solid ${cat.dark}` : `4px solid ${cat.dark}`,
        }}
      >
        {/* Category dot */}
        <span style={{
          display: "inline-block",
          width: 8, height: 8,
          background: cat.dark,
          borderRadius: "50%",
          flexShrink: 0,
        }} />
        {renderLabel()}

        {/* Bottom connector notch (visual only) */}
        {!def.cap && (
          <div style={{
            position: "absolute",
            bottom: -8,
            left: 16,
            width: 22,
            height: 8,
            background: cat.color,
            borderRadius: "0 0 4px 4px",
            boxShadow: `0 3px 0 ${cat.dark}`,
            zIndex: 2,
          }} />
        )}
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(block.uid)}
        style={{
          background: "#ff6b6b",
          border: "none",
          borderRadius: "50%",
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "white",
          flexShrink: 0,
          opacity: 0.8,
        }}
        title="Remove block"
      >
        <X size={11} />
      </button>
    </div>
  );
}

// ─── Palette block (click to add) ─────────────────────────────────────────────

function PaletteBlock({ def, onAdd }: { def: BlockDef; onAdd: (def: BlockDef) => void }) {
  const cat = CAT[def.category];
  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.setData("defId", def.id); }}
      onClick={() => onAdd(def)}
      title="Click or drag to add"
      style={{
        background: cat.color,
        borderRadius: def.hat ? "20px 20px 4px 4px" : "6px",
        padding: "6px 10px",
        color: "white",
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        boxShadow: `0 2px 0 ${cat.dark}`,
        borderLeft: `4px solid ${cat.dark}`,
        transition: "transform 0.1s",
        userSelect: "none",
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
    >
      <span style={{ width: 7, height: 7, background: cat.dark, borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />
      {def.label.replace(/\{[^}]+\}/g, (m) => {
        const name = m.slice(1, -1);
        const p = def.params?.find(p => p.name === name);
        return p ? `[${p.default}]` : m;
      })}
      <Plus size={12} style={{ marginLeft: "auto", opacity: 0.7 }} />
    </div>
  );
}

// ─── Canvas sprite drawing ─────────────────────────────────────────────────────

function drawCat(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, hue: number, sayMsg: string | null) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ctx.filter = `hue-rotate(${hue}deg)`;

  // Body
  ctx.fillStyle = "#ff8c42";
  ctx.beginPath(); ctx.ellipse(0, 10, 22, 16, 0, 0, Math.PI * 2); ctx.fill();

  // Head
  ctx.fillStyle = "#ff8c42";
  ctx.beginPath(); ctx.arc(0, -14, 20, 0, Math.PI * 2); ctx.fill();

  // Ears
  ctx.fillStyle = "#e0642b";
  ctx.beginPath(); ctx.moveTo(-20, -28); ctx.lineTo(-28, -38); ctx.lineTo(-10, -30); ctx.fill();
  ctx.beginPath(); ctx.moveTo(20, -28); ctx.lineTo(28, -38); ctx.lineTo(10, -30); ctx.fill();

  // Eyes
  ctx.fillStyle = "white";
  ctx.beginPath(); ctx.arc(-8, -16, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(8, -16, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#222";
  ctx.beginPath(); ctx.arc(-8, -15, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(8, -15, 3, 0, Math.PI * 2); ctx.fill();

  // Nose & mouth
  ctx.fillStyle = "#ff4d8b";
  ctx.beginPath(); ctx.arc(0, -8, 3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#333"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-3, -5); ctx.quadraticCurveTo(-6, -2, -4, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3, -5); ctx.quadraticCurveTo(6, -2, 4, 0); ctx.stroke();

  // Whiskers
  ctx.strokeStyle = "#aaa"; ctx.lineWidth = 1;
  [-1,0,1].forEach(i => {
    ctx.beginPath(); ctx.moveTo(-4, -8+i*4); ctx.lineTo(-24, -10+i*5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, -8+i*4); ctx.lineTo(24, -10+i*5); ctx.stroke();
  });

  ctx.filter = "none";
  ctx.restore();

  // Speech bubble
  if (sayMsg) {
    ctx.save();
    ctx.font = "bold 13px sans-serif";
    const w = ctx.measureText(sayMsg).width + 20;
    const bx = x - w / 2, by = y - 70;
    ctx.fillStyle = "white";
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 2;
    roundRect(ctx, bx, by, w, 30, 8);
    ctx.fill(); ctx.stroke();
    // tail
    ctx.fillStyle = "white";
    ctx.beginPath(); ctx.moveTo(x-5, y-42); ctx.lineTo(x+5, y-42); ctx.lineTo(x, y-38); ctx.fill();
    ctx.fillStyle = "#333";
    ctx.fillText(sayMsg, bx + 10, by + 19);
    ctx.restore();
  }
}

function drawRobot(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, hue: number, sayMsg: string | null) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ctx.filter = `hue-rotate(${hue}deg)`;

  // Body
  ctx.fillStyle = "#5a7dd6";
  ctx.fillRect(-18, -6, 36, 28);

  // Head
  ctx.fillStyle = "#7b9be0";
  ctx.fillRect(-14, -30, 28, 24);

  // Antenna
  ctx.strokeStyle = "#ffd700"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, -40); ctx.stroke();
  ctx.fillStyle = "#ffd700";
  ctx.beginPath(); ctx.arc(0, -42, 4, 0, Math.PI * 2); ctx.fill();

  // Eyes
  ctx.fillStyle = "#00ffcc";
  ctx.fillRect(-10, -24, 8, 8);
  ctx.fillRect(2, -24, 8, 8);

  // Mouth
  ctx.fillStyle = "#3d5a9e";
  ctx.fillRect(-8, -10, 16, 4);

  // Chest panel
  ctx.fillStyle = "#3d5a9e";
  ctx.fillRect(-10, 0, 20, 12);
  ctx.fillStyle = "#ff4d4d"; ctx.beginPath(); ctx.arc(-5, 6, 3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#4dff91"; ctx.beginPath(); ctx.arc(5, 6, 3, 0, Math.PI*2); ctx.fill();

  // Arms
  ctx.fillStyle = "#5a7dd6";
  ctx.fillRect(-26, -4, 8, 20);
  ctx.fillRect(18, -4, 8, 20);

  // Legs
  ctx.fillRect(-14, 22, 10, 14);
  ctx.fillRect(4, 22, 10, 14);

  ctx.filter = "none";
  ctx.restore();

  if (sayMsg) drawSpeechBubble(ctx, x, y - 70, sayMsg);
}

function drawRocket(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, hue: number, sayMsg: string | null) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ctx.filter = `hue-rotate(${hue}deg)`;

  // Flames
  ctx.fillStyle = "#ff6a00";
  ctx.beginPath(); ctx.moveTo(-10, 24); ctx.quadraticCurveTo(-16, 40, 0, 36); ctx.quadraticCurveTo(16, 40, 10, 24); ctx.fill();
  ctx.fillStyle = "#ffd700";
  ctx.beginPath(); ctx.moveTo(-6, 24); ctx.quadraticCurveTo(-8, 34, 0, 30); ctx.quadraticCurveTo(8, 34, 6, 24); ctx.fill();

  // Body
  ctx.fillStyle = "#e63946";
  ctx.beginPath();
  ctx.moveTo(0, -36);
  ctx.bezierCurveTo(12, -20, 14, -8, 14, 8);
  ctx.lineTo(14, 24); ctx.lineTo(-14, 24); ctx.lineTo(-14, 8);
  ctx.bezierCurveTo(-14, -8, -12, -20, 0, -36);
  ctx.fill();

  // Window
  ctx.fillStyle = "#a8dadc";
  ctx.beginPath(); ctx.arc(0, -4, 8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke();

  // Fins
  ctx.fillStyle = "#e63946";
  ctx.beginPath(); ctx.moveTo(-14, 10); ctx.lineTo(-24, 24); ctx.lineTo(-14, 24); ctx.fill();
  ctx.beginPath(); ctx.moveTo(14, 10); ctx.lineTo(24, 24); ctx.lineTo(14, 24); ctx.fill();

  // Stars on body
  ctx.fillStyle = "white";
  [[-4, 5], [4, 10]].forEach(([sx, sy]) => {
    ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI*2); ctx.fill();
  });

  ctx.filter = "none";
  ctx.restore();

  if (sayMsg) drawSpeechBubble(ctx, x, y - 80, sayMsg);
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, hue: number, sayMsg: string | null) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ctx.filter = `hue-rotate(${hue}deg)`;

  const spikes = 5, outerR = 28, innerR = 12;
  ctx.fillStyle = "#ffd700";
  ctx.strokeStyle = "#e6a200";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i * Math.PI / spikes) - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();

  // Face
  ctx.fillStyle = "#333";
  ctx.beginPath(); ctx.arc(-7, -4, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(7, -4, 3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#333"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 4, 6, 0, Math.PI); ctx.stroke();

  ctx.filter = "none";
  ctx.restore();

  if (sayMsg) drawSpeechBubble(ctx, x, y - 60, sayMsg);
}

function drawFrog(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, hue: number, sayMsg: string | null) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ctx.filter = `hue-rotate(${hue}deg)`;

  // Body
  ctx.fillStyle = "#4caf50";
  ctx.beginPath(); ctx.ellipse(0, 10, 22, 16, 0, 0, Math.PI * 2); ctx.fill();

  // Head
  ctx.beginPath(); ctx.arc(0, -10, 20, 0, Math.PI * 2); ctx.fill();

  // Eye sockets
  ctx.fillStyle = "#81c784";
  ctx.beginPath(); ctx.arc(-10, -22, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(10, -22, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "white";
  ctx.beginPath(); ctx.arc(-10, -22, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(10, -22, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1a237e";
  ctx.beginPath(); ctx.arc(-10, -22, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(10, -22, 3, 0, Math.PI * 2); ctx.fill();

  // Belly
  ctx.fillStyle = "#a5d6a7";
  ctx.beginPath(); ctx.ellipse(0, 10, 14, 10, 0, 0, Math.PI * 2); ctx.fill();

  // Smile
  ctx.strokeStyle = "#388e3c"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, -6, 10, 0.2, Math.PI - 0.2); ctx.stroke();

  // Legs
  ctx.fillStyle = "#4caf50";
  ctx.fillRect(-30, 18, 12, 8);
  ctx.fillRect(18, 18, 12, 8);

  ctx.filter = "none";
  ctx.restore();

  if (sayMsg) drawSpeechBubble(ctx, x, y - 60, sayMsg);
}

function drawSpeechBubble(ctx: CanvasRenderingContext2D, x: number, y: number, msg: string) {
  ctx.save();
  ctx.font = "bold 13px sans-serif";
  const w = Math.max(ctx.measureText(msg).width + 20, 60);
  const h = 30;
  ctx.fillStyle = "white";
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 2;
  roundRect(ctx, x - w/2, y, w, h, 10);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = "white";
  ctx.beginPath(); ctx.moveTo(x-6, y+h); ctx.lineTo(x+6, y+h); ctx.lineTo(x+2, y+h+8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#222";
  ctx.fillText(msg, x - w/2 + 10, y + 20);
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const SPRITE_DRAWERS: Record<string, (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, h: number, msg: string | null) => void> = {
  cat: drawCat,
  robot: drawRobot,
  rocket: drawRocket,
  star: drawStar,
  frog: drawFrog,
};

// ─── Stage canvas ──────────────────────────────────────────────────────────────

interface StageProps {
  spriteType: string;
  stageColor: string;
  spriteState: SpriteState;
  running: boolean;
  mazeDef?: MazeDef;
  highlightBlock?: string | null;
  collectiblesLeft?: number[];
}

const STAGE_W = 360;
const STAGE_H = 240;

function SpriteStage({ spriteType, stageColor, spriteState, running, mazeDef, collectiblesLeft }: StageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const now = Date.now();
  const sayMsg = spriteState.saying && spriteState.sayEnd > now ? spriteState.saying : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, STAGE_W, STAGE_H);

    if (mazeDef) {
      drawMaze(ctx, mazeDef, spriteState, collectiblesLeft ?? []);
    } else {
      // Free stage background
      ctx.fillStyle = stageColor;
      ctx.fillRect(0, 0, STAGE_W, STAGE_H);
      // Grid dots
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      for (let gx = 20; gx < STAGE_W; gx += 30)
        for (let gy = 20; gy < STAGE_H; gy += 30) {
          ctx.beginPath(); ctx.arc(gx, gy, 1.5, 0, Math.PI*2); ctx.fill();
        }

      // Center cross
      ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(STAGE_W/2-10, STAGE_H/2); ctx.lineTo(STAGE_W/2+10, STAGE_H/2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(STAGE_W/2, STAGE_H/2-10); ctx.lineTo(STAGE_W/2, STAGE_H/2+10); ctx.stroke();

      if (spriteState.visible) {
        const drawer = SPRITE_DRAWERS[spriteType] ?? drawCat;
        drawer(ctx, spriteState.x + STAGE_W/2, STAGE_H/2 - spriteState.y, spriteState.size, spriteState.hue, sayMsg);
      }
    }

    // "Running" indicator
    if (running) {
      ctx.fillStyle = "rgba(0,255,0,0.15)";
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 3;
      ctx.strokeRect(1.5, 1.5, STAGE_W-3, STAGE_H-3);
    }
  });

  return (
    <canvas
      ref={canvasRef}
      width={STAGE_W}
      height={STAGE_H}
      style={{
        width: "100%",
        borderRadius: 12,
        display: "block",
        border: "3px solid rgba(255,255,255,0.2)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
    />
  );
}

function drawMaze(ctx: CanvasRenderingContext2D, maze: MazeDef, sprite: SpriteState, coinsLeft: number[]) {
  const cw = STAGE_W / maze.cols;
  const ch = STAGE_H / maze.rows;

  // Background
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);

  // Grid
  for (let r = 0; r < maze.rows; r++) {
    for (let c = 0; c < maze.cols; c++) {
      const x = c * cw, y = r * ch;
      const isWall = maze.walls.some(w => w.c === c && w.r === r);
      const isGoal = c === maze.goalCol && r === maze.goalRow;
      const isStart = c === maze.startCol && r === maze.startRow;

      if (isWall) {
        ctx.fillStyle = "#2d4a8c";
        ctx.fillRect(x+1, y+1, cw-2, ch-2);
        ctx.fillStyle = "#3d5ab0";
        ctx.fillRect(x+2, y+2, cw-4, 3);
      } else if (isGoal) {
        ctx.fillStyle = "#0d3d1a";
        ctx.fillRect(x, y, cw, ch);
        // Glowing goal
        const grd = ctx.createRadialGradient(x+cw/2, y+ch/2, 2, x+cw/2, y+ch/2, cw/2);
        grd.addColorStop(0, "rgba(0,255,100,0.6)");
        grd.addColorStop(1, "rgba(0,255,100,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(x, y, cw, ch);
        ctx.fillStyle = "#00ff64";
        ctx.font = `bold ${Math.min(cw, ch) * 0.5}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("★", x + cw/2, y + ch/2);
      } else if (isStart) {
        ctx.fillStyle = "#1a3d1a";
        ctx.fillRect(x, y, cw, ch);
      } else {
        ctx.fillStyle = r % 2 === c % 2 ? "#16213e" : "#1a2040";
        ctx.fillRect(x, y, cw, ch);
      }

      // Grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, cw, ch);
    }
  }

  // Coins
  maze.coins?.forEach((coin, i) => {
    if (coinsLeft.includes(i)) {
      const cx = coin.c * cw + cw/2;
      const cy = coin.r * ch + ch/2;
      ctx.fillStyle = "#ffd700";
      ctx.beginPath(); ctx.arc(cx, cy, Math.min(cw, ch) * 0.25, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = "#b8860b"; ctx.lineWidth = 1.5; ctx.stroke();
    }
  });

  // Sprite (grid)
  const sx = (sprite.gridX ?? maze.startCol) * cw + cw/2;
  const sy = (sprite.gridY ?? maze.startRow) * ch + ch/2;
  const drawer = SPRITE_DRAWERS["robot"] ?? drawRobot;
  drawer(ctx, sx, sy, Math.min(cw, ch) / 80, sprite.hue, null);
}

// ─── Block execution engine ────────────────────────────────────────────────────

function initSprite(maze?: MazeDef): SpriteState {
  return {
    x: 0, y: 0, angle: 0,
    visible: true, size: 1, hue: 0,
    saying: null, sayEnd: 0,
    gridX: maze?.startCol, gridY: maze?.startRow,
  };
}

// ─── Main BlockEditor component ────────────────────────────────────────────────

export interface BlockEditorProps {
  project: BlockEditorProject;
  onComplete?: (steps: number, coins: number) => void;
}

export function BlockEditor({ project, onComplete }: BlockEditorProps) {
  const [openCats, setOpenCats] = useState<Set<BlockCategory>>(new Set(project.categories));
  const [blocks, setBlocks] = useState<PlacedBlock[]>([]);
  const [sprite, setSprite] = useState<SpriteState>(() => initSprite(project.mazeDef));
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<"idle" | "win" | "fail">("idle");
  const [activeUid, setActiveUid] = useState<string | null>(null);
  const [coinsLeft, setCoinsLeft] = useState<number[]>(() =>
    project.mazeDef?.coins?.map((_, i) => i) ?? []
  );
  const [dragOverUid, setDragOverUid] = useState<string | null>(null);
  const stopRef = useRef(false);
  const spriteRef = useRef(sprite);
  spriteRef.current = sprite;

  const availableDefs = ALL_BLOCKS.filter(b => project.categories.includes(b.category));
  const catGroups = project.categories.map(cat => ({
    cat,
    defs: availableDefs.filter(b => b.category === cat),
  }));

  // ── Add block ──
  function addBlock(def: BlockDef) {
    const uid = Math.random().toString(36).slice(2);
    const values: Record<string, string | number> = {};
    def.params?.forEach(p => { values[p.name] = p.default; });
    setBlocks(prev => [...prev, { uid, defId: def.id, values }]);
  }

  // ── Remove block ──
  function removeBlock(uid: string) {
    setBlocks(prev => prev.filter(b => b.uid !== uid));
  }

  // ── Update param ──
  function updateParam(uid: string, param: string, val: string | number) {
    setBlocks(prev => prev.map(b => b.uid === uid ? { ...b, values: { ...b.values, [param]: val } } : b));
  }

  // ── Drag & drop reorder ──
  const dragSrc = useRef<string | null>(null);
  function onDragStart(e: React.DragEvent, uid: string) {
    dragSrc.current = uid;
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e: React.DragEvent, uid: string) {
    e.preventDefault();
    setDragOverUid(uid);
  }
  function onDrop(e: React.DragEvent, targetUid: string) {
    e.preventDefault();
    setDragOverUid(null);
    const defId = e.dataTransfer.getData("defId");
    if (defId) {
      const def = getDef(defId);
      if (def) {
        const uid = Math.random().toString(36).slice(2);
        const values: Record<string, string | number> = {};
        def.params?.forEach(p => { values[p.name] = p.default; });
        setBlocks(prev => {
          const idx = prev.findIndex(b => b.uid === targetUid);
          const newBlock = { uid, defId: def.id, values };
          const next = [...prev];
          next.splice(idx + 1, 0, newBlock);
          return next;
        });
      }
      return;
    }
    if (!dragSrc.current || dragSrc.current === targetUid) return;
    setBlocks(prev => {
      const srcIdx = prev.findIndex(b => b.uid === dragSrc.current);
      const dstIdx = prev.findIndex(b => b.uid === targetUid);
      if (srcIdx < 0 || dstIdx < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(srcIdx, 1);
      next.splice(dstIdx, 0, moved);
      return next;
    });
    dragSrc.current = null;
  }

  // ── Execution engine ──
  async function runProgram() {
    if (running || blocks.length === 0) return;
    setRunning(true);
    setStatus("idle");
    stopRef.current = false;
    let s = initSprite(project.mazeDef);
    let coins = project.mazeDef?.coins?.map((_, i) => i) ?? [];
    setSprite({ ...s });
    setCoinsLeft([...coins]);

    const sleep = (ms: number) => new Promise<void>(res => {
      const t = setTimeout(res, ms);
      if (stopRef.current) { clearTimeout(t); res(); }
    });

    let stepCount = 0;
    const maze = project.mazeDef;

    // Process block list, handling loops
    async function runBlocks(blockList: PlacedBlock[]): Promise<void> {
      let i = 0;
      while (i < blockList.length) {
        if (stopRef.current) return;
        const block = blockList[i];
        const def = getDef(block.defId);
        setActiveUid(block.uid);

        stepCount++;

        switch (block.defId) {
          case "move":        { const steps = Number(block.values.steps ?? 10); s.x += Math.cos(s.angle * Math.PI/180) * steps; s.y += Math.sin(s.angle * Math.PI/180) * steps; break; }
          case "turn_cw":     { s.angle += Number(block.values.deg ?? 15); break; }
          case "turn_ccw":    { s.angle -= Number(block.values.deg ?? 15); break; }
          case "go_to":       { s.x = Number(block.values.x ?? 0); s.y = Number(block.values.y ?? 0); break; }
          case "go_dir":      {
            const dirs: Record<string, number> = { right: 0, left: 180, up: 90, down: -90 };
            s.angle = dirs[String(block.values.dir)] ?? 0;
            break;
          }
          case "if_at_edge": {
            if (s.x + STAGE_W/2 > STAGE_W - 20) { s.x = STAGE_W/2 - 20; s.angle = 180; }
            if (s.x + STAGE_W/2 < 20) { s.x = -STAGE_W/2 + 20; s.angle = 0; }
            if (STAGE_H/2 - s.y > STAGE_H - 20) { s.y = -(STAGE_H/2 - 20); s.angle = 90; }
            if (STAGE_H/2 - s.y < 20) { s.y = STAGE_H/2 - 20; s.angle = -90; }
            break;
          }
          case "say": case "think": {
            s.saying = String(block.values.msg ?? "Hello!");
            s.sayEnd = Date.now() + Number(block.values.secs ?? 2) * 1000;
            await sleep(Number(block.values.secs ?? 2) * 1000);
            s.saying = null; s.sayEnd = 0;
            break;
          }
          case "set_size":    { s.size = Number(block.values.pct ?? 100) / 100; break; }
          case "change_color":{ s.hue = (s.hue + Number(block.values.n ?? 25) + 360) % 360; break; }
          case "show":        { s.visible = true; break; }
          case "hide":        { s.visible = false; break; }
          case "wait":        { await sleep(Number(block.values.secs ?? 1) * 1000); break; }
          case "play_note":   { playNote(String(block.values.note ?? "C4"), Number(block.values.beats ?? 0.5)); await sleep(Number(block.values.beats ?? 0.5) * 500); break; }
          case "play_sound":  { playSound(String(block.values.sound ?? "pop")); break; }

          // Grid (maze) movement
          case "move_forward": {
            if (maze) {
              const dirs: Record<number, [number, number]> = { 0: [1,0], 90: [0,-1], 180: [-1,0], 270: [0,1] };
              const ang = ((Math.round(s.angle / 90) * 90) + 360) % 360;
              const d = dirs[ang] ?? [1, 0];
              const nc = (s.gridX ?? 0) + d[0], nr = (s.gridY ?? 0) + d[1];
              if (nc >= 0 && nc < maze.cols && nr >= 0 && nr < maze.rows && !maze.walls.some(w => w.c===nc && w.r===nr)) {
                s.gridX = nc; s.gridY = nr;
                // Collect coin?
                maze.coins?.forEach((coin, ci) => {
                  if (coin.c === nc && coin.r === nr && coins.includes(ci)) {
                    coins = coins.filter(x => x !== ci);
                    setCoinsLeft([...coins]);
                  }
                });
              }
            }
            break;
          }
          case "move_back": {
            if (maze) {
              const dirs: Record<number, [number, number]> = { 0: [-1,0], 90: [0,1], 180: [1,0], 270: [0,-1] };
              const ang = ((Math.round(s.angle / 90) * 90) + 360) % 360;
              const d = dirs[ang] ?? [-1, 0];
              const nc = (s.gridX ?? 0) + d[0], nr = (s.gridY ?? 0) + d[1];
              if (nc >= 0 && nc < maze.cols && nr >= 0 && nr < maze.rows && !maze.walls.some(w => w.c===nc && w.r===nr)) {
                s.gridX = nc; s.gridY = nr;
              }
            }
            break;
          }
          case "turn_left":  { s.angle = ((s.angle - 90) + 360) % 360; break; }
          case "turn_right": { s.angle = (s.angle + 90) % 360; break; }
          case "jump": {
            if (maze) {
              const dirs: Record<number, [number, number]> = { 0: [2,0], 90: [0,-2], 180: [-2,0], 270: [0,2] };
              const ang = ((Math.round(s.angle / 90) * 90) + 360) % 360;
              const d = dirs[ang] ?? [2, 0];
              const nc = (s.gridX ?? 0) + d[0], nr = (s.gridY ?? 0) + d[1];
              if (nc >= 0 && nc < maze.cols && nr >= 0 && nr < maze.rows) {
                s.gridX = nc; s.gridY = nr;
              }
            }
            break;
          }

          case "repeat": {
            const n = Number(block.values.n ?? 10);
            // Find matching end_repeat
            let depth = 1, endIdx = i + 1;
            while (endIdx < blockList.length && depth > 0) {
              if (blockList[endIdx].defId === "repeat" || blockList[endIdx].defId === "forever") depth++;
              else if (blockList[endIdx].defId === "end_repeat") depth--;
              if (depth > 0) endIdx++;
            }
            const inner = blockList.slice(i + 1, endIdx);
            for (let r = 0; r < n; r++) {
              if (stopRef.current) break;
              await runBlocks(inner);
            }
            i = endIdx;
            continue;
          }
          case "forever": {
            let fIdx = i + 1;
            while (fIdx < blockList.length && blockList[fIdx].defId !== "end_repeat") fIdx++;
            const inner = blockList.slice(i + 1, fIdx);
            for (let r = 0; r < 100; r++) {
              if (stopRef.current) break;
              await runBlocks(inner);
              await sleep(50);
            }
            i = fIdx;
            continue;
          }
          case "end_repeat": break;
        }

        setSprite({ ...s });
        await sleep(350);
        i++;
      }
    }

    await runBlocks(blocks);
    setActiveUid(null);

    // Check win for maze
    if (maze) {
      const win = s.gridX === maze.goalCol && s.gridY === maze.goalRow;
      setStatus(win ? "win" : "fail");
      if (win && onComplete) onComplete(stepCount, (maze.coins?.length ?? 0) - coins.length);
    } else {
      setStatus("win");
      if (onComplete) onComplete(stepCount, 0);
    }

    setRunning(false);
  }

  function stopProgram() {
    stopRef.current = true;
    setRunning(false);
    setActiveUid(null);
  }

  function reset() {
    stopRef.current = true;
    setRunning(false);
    setActiveUid(null);
    setStatus("idle");
    setBlocks([]);
    const fresh = initSprite(project.mazeDef);
    setSprite(fresh);
    setCoinsLeft(project.mazeDef?.coins?.map((_, i) => i) ?? []);
  }

  // Compute indent for visual nesting
  function getIndent(i: number): number {
    let depth = 0;
    for (let j = 0; j < i; j++) {
      const def = getDef(blocks[j].defId);
      if (def?.loop) depth++;
      if (def?.cap) depth = Math.max(0, depth - 1);
    }
    return depth;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 380px", gap: 12, height: "calc(100vh - 200px)", minHeight: 480 }}>

      {/* ── Left: Block Palette ── */}
      <div style={{
        background: "#1e1e2e",
        borderRadius: 16,
        padding: "12px 8px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}>
        <div style={{ color: "white", fontWeight: 900, fontSize: 13, padding: "4px 8px 8px", letterSpacing: 1 }}>
          BLOCKS
        </div>
        {catGroups.map(({ cat, defs }) => {
          const isOpen = openCats.has(cat);
          const cfg = CAT[cat];
          return (
            <div key={cat}>
              <button
                onClick={() => setOpenCats(prev => {
                  const s = new Set(prev);
                  if (s.has(cat)) s.delete(cat); else s.add(cat);
                  return s;
                })}
                style={{
                  width: "100%",
                  background: cfg.color,
                  border: "none",
                  borderRadius: 8,
                  color: "white",
                  fontWeight: 800,
                  fontSize: 12,
                  padding: "6px 10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textAlign: "left",
                }}
              >
                {cfg.label}
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {isOpen && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "4px 2px" }}>
                  {defs.map(def => (
                    <PaletteBlock key={def.id} def={def} onAdd={addBlock} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Middle: Workspace ── */}
      <div style={{
        background: "#f0f0f0",
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "2px solid #ddd",
      }}>
        {/* Toolbar */}
        <div style={{
          background: "#282838",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <span style={{ color: "white", fontWeight: 800, fontSize: 13, flex: 1 }}>
            {project.title}
          </span>
          <Button
            size="sm"
            onClick={running ? stopProgram : runProgram}
            disabled={blocks.length === 0 && !running}
            style={{
              background: running ? "#ff4d4d" : "#00cc44",
              border: "none",
              color: "white",
              fontWeight: 800,
              borderRadius: 8,
              gap: 4,
            }}
          >
            {running ? <><Square size={14} /> Stop</> : <><Play size={14} /> Run</>}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={reset}
            style={{ color: "white", borderRadius: 8 }}
          >
            <RotateCcw size={14} />
          </Button>
        </div>

        {/* Drop zone + workspace */}
        <div
          style={{ flex: 1, overflowY: "auto", padding: 12 }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const defId = e.dataTransfer.getData("defId");
            if (defId) {
              const def = getDef(defId);
              if (def) addBlock(def);
            }
          }}
        >
          {blocks.length === 0 ? (
            <div style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: "#aaa",
              fontWeight: 700,
              fontSize: 14,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 48 }}>📦</div>
              <div>Drag blocks here or click them<br/>in the palette to add</div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>{project.description}</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingBottom: 40 }}>
              {blocks.map((block, i) => {
                const def = getDef(block.defId);
                if (!def) return null;
                const isActive = activeUid === block.uid;
                return (
                  <div
                    key={block.uid}
                    style={{
                      transition: "transform 0.1s",
                      transform: isActive ? "translateX(4px)" : undefined,
                      outline: isActive ? "2px solid #00ff88" : undefined,
                      borderRadius: 8,
                      background: dragOverUid === block.uid ? "rgba(255,255,255,0.5)" : undefined,
                    }}
                  >
                    <BlockPiece
                      block={block}
                      def={def}
                      index={i}
                      indent={getIndent(i)}
                      onRemove={removeBlock}
                      onParamChange={updateParam}
                      dragging={dragSrc.current === block.uid}
                      onDragStart={onDragStart}
                      onDragOver={onDragOver}
                      onDrop={onDrop}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Block count */}
        <div style={{ background: "#282838", padding: "6px 12px", color: "#aaa", fontSize: 12, fontWeight: 600 }}>
          {blocks.length} block{blocks.length !== 1 ? "s" : ""} in program
        </div>
      </div>

      {/* ── Right: Stage ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Stage */}
        <div style={{
          background: "#111",
          borderRadius: 16,
          overflow: "hidden",
          flex: 1,
        }}>
          <SpriteStage
            spriteType={project.spriteType}
            stageColor={project.stageColor}
            spriteState={sprite}
            running={running}
            mazeDef={project.mazeDef}
            collectiblesLeft={coinsLeft}
          />
        </div>

        {/* Status / info panel */}
        <div style={{
          background: "#1e1e2e",
          borderRadius: 12,
          padding: "10px 14px",
          color: "white",
        }}>
          {status === "win" && (
            <div style={{ color: "#00ff88", fontWeight: 900, fontSize: 16, marginBottom: 4 }}>
              Mission Complete!
            </div>
          )}
          {status === "fail" && (
            <div style={{ color: "#ff6b6b", fontWeight: 900, fontSize: 16, marginBottom: 4 }}>
              Not quite — try again!
            </div>
          )}
          <div style={{ fontSize: 12, color: "#aaa", fontWeight: 600 }}>
            {project.description}
          </div>
          {project.mazeDef && (
            <div style={{ marginTop: 6, fontSize: 12, color: "#aaa" }}>
              Facing: {["Right","","Up","","Left","","Down"][Math.round(sprite.angle / 45) % 8] ?? "Right"}&nbsp;•&nbsp;
              Pos: ({sprite.gridX ?? project.mazeDef.startCol}, {sprite.gridY ?? project.mazeDef.startRow})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Web Audio helpers ─────────────────────────────────────────────────────────

const NOTE_FREQS: Record<string, number> = {
  C3:130.8,D3:146.8,E3:164.8,F3:174.6,G3:196,A3:220,B3:246.9,
  C4:261.6,D4:293.7,E4:329.6,F4:349.2,G4:392,A4:440,B4:493.9,
  C5:523.3,
};

let audioCtx: AudioContext | null = null;
function getAudio() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playNote(note: string, beats: number) {
  try {
    const ac = getAudio();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.frequency.value = NOTE_FREQS[note] ?? 261.6;
    osc.type = "triangle";
    gain.gain.setValueAtTime(0.4, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + beats * 0.5);
    osc.start(); osc.stop(ac.currentTime + beats * 0.5);
  } catch { /* ignore */ }
}

function playSound(sound: string) {
  try {
    const ac = getAudio();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    const configs: Record<string, [number, string, number]> = {
      pop:   [880, "sine", 0.1],
      meow:  [600, "sawtooth", 0.3],
      boing: [200, "sine", 0.5],
      drum:  [100, "square", 0.15],
      beep:  [1200, "square", 0.1],
    };
    const [freq, type, dur] = configs[sound] ?? [440, "sine", 0.2];
    osc.type = type as OscillatorType;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.start(); osc.stop(ac.currentTime + dur);
  } catch { /* ignore */ }
}
