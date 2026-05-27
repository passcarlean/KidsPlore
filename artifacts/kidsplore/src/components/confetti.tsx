import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  shape: "rect" | "circle" | "star";
  size: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  decay: number;
}

const COLORS = [
  "#FF6B9D","#FFD500","#4C97FF","#59C059","#9966FF",
  "#FF8C00","#00E5FF","#FF4081","#69F0AE","#FF6E40",
];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function createParticle(x: number, y: number): Particle {
  const angle = randomBetween(-80, -40) * (Math.PI / 180);
  const speed = randomBetween(6, 18);
  return {
    x, y,
    vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
    vy: Math.sin(angle) * speed,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: (["rect","circle","star"] as const)[Math.floor(Math.random() * 3)],
    size: randomBetween(8, 18),
    rotation: randomBetween(0, 360),
    rotationSpeed: randomBetween(-8, 8),
    alpha: 1,
    decay: randomBetween(0.012, 0.022),
  };
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const ai = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
    if (i === 0) ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a));
    else ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
    ctx.lineTo(x + (r / 2) * Math.cos(ai), y + (r / 2) * Math.sin(ai));
  }
  ctx.closePath();
}

export interface ConfettiRef {
  burst: (x?: number, y?: number) => void;
}

interface ConfettiProps {
  onRef?: (ref: ConfettiRef) => void;
}

export function Confetti({ onRef }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  function burst(cx?: number, cy?: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const x = cx ?? canvas.width / 2;
    const y = cy ?? canvas.height / 3;
    const count = 120;
    for (let i = 0; i < count; i++) {
      particlesRef.current.push(createParticle(x, y));
    }
  }

  useEffect(() => {
    if (onRef) onRef({ burst });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function tick() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      const gravity = 0.45;
      particlesRef.current = particlesRef.current.filter(p => p.alpha > 0.05);

      for (const p of particlesRef.current) {
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;
        p.vx *= 0.99;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          drawStar(ctx, 0, 0, p.size / 2);
          ctx.fill();
        }
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    tick();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
