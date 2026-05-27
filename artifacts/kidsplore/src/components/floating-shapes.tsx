import { useEffect, useRef } from "react";

const SHAPES = ["★","●","▲","◆","♥","✦","○","✿","⬡","☁"];
const COLORS = ["#FF6B9D","#FFD500","#4C97FF","#59C059","#9966FF","#FF8C00","#00E5FF"];

interface FloatingShape {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  opacity: number;
  symbol: string;
  color: string;
  wobble: number;
  wobbleSpeed: number;
  angle: number;
}

export function FloatingShapes() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    function resize() {
      if (!canvas) return;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    }
    resize();

    const shapes: FloatingShape[] = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 12 + Math.random() * 22,
      speed: 0.2 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 0.4,
      opacity: 0.06 + Math.random() * 0.12,
      symbol: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.01 + Math.random() * 0.02,
      angle: Math.random() * 360,
    }));

    let raf: number;
    function tick() {
      ctx.clearRect(0, 0, width, height);
      for (const s of shapes) {
        s.y -= s.speed;
        s.x += s.drift + Math.sin(s.wobble) * 0.3;
        s.wobble += s.wobbleSpeed;
        s.angle += 0.3;
        if (s.y < -40) {
          s.y = height + 40;
          s.x = Math.random() * width;
        }
        if (s.x < -40) s.x = width + 40;
        if (s.x > width + 40) s.x = -40;

        ctx.save();
        ctx.globalAlpha = s.opacity;
        ctx.fillStyle = s.color;
        ctx.font = `${s.size}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.translate(s.x, s.y);
        ctx.rotate((s.angle * Math.PI) / 180);
        ctx.fillText(s.symbol, 0, 0);
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    }
    tick();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        borderRadius: "inherit",
      }}
    />
  );
}
