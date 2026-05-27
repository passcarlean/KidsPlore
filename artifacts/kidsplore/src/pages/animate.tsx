import { useRef, useState, useEffect } from "react";
import { useSaveProgress, useGetProgress } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Trash2, Plus, Eraser, Pen, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["#000000", "#FFFFFF", "#EF4444", "#F97316", "#F59E0B", "#84CC16", "#22C55E", "#06B6D4", "#3B82F6", "#6366F1", "#A855F7", "#D946EF", "#EC4899"];

export function AnimateStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frames, setFrames] = useState<ImageData[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState([5]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [fps, setFps] = useState([5]);
  const playRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { toast } = useToast();
  const { data: progress } = useGetProgress({ playerName: "SpaceExplorer" });
  const saveProgress = useSaveProgress();

  useEffect(() => {
    addNewFrame();
  }, []);

  const getCtx = () => canvasRef.current?.getContext("2d", { willReadFrequently: true });

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = isEraser ? "#FFFFFF" : color;
    ctx.lineWidth = brushSize[0];
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveCurrentFrameToState();
    }
  };

  const saveCurrentFrameToState = () => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    setFrames((prev) => {
      const next = [...prev];
      if (currentFrameIndex >= 0) {
        next[currentFrameIndex] = imageData;
      }
      return next;
    });
  };

  const addNewFrame = () => {
    const ctx = getCtx();
    if (ctx && canvasRef.current) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      const newFrame = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      setFrames((prev) => [...prev, newFrame]);
      setCurrentFrameIndex(frames.length);
    }
  };

  const selectFrame = (index: number) => {
    setCurrentFrameIndex(index);
    const ctx = getCtx();
    if (ctx && frames[index]) {
      ctx.putImageData(frames[index], 0, 0);
    }
  };

  const deleteFrame = (index: number) => {
    if (frames.length <= 1) return;
    const newFrames = frames.filter((_, i) => i !== index);
    setFrames(newFrames);
    const newIndex = Math.min(index, newFrames.length - 1);
    selectFrame(newIndex);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (playRef.current) clearInterval(playRef.current);
    } else {
      setIsPlaying(true);
      let i = currentFrameIndex;
      playRef.current = setInterval(() => {
        i = (i + 1) % frames.length;
        const ctx = getCtx();
        if (ctx && frames[i]) {
          ctx.putImageData(frames[i], 0, 0);
        }
        setCurrentFrameIndex(i);
      }, 1000 / fps[0]);
    }
  };

  const handleSaveCreation = () => {
    if (progress) {
      saveProgress.mutate({
        data: {
          playerName: "SpaceExplorer",
          animationsCreated: (progress.animationsCreated || 0) + 1,
          totalPoints: (progress.totalPoints || 0) + 50
        }
      }, {
        onSuccess: () => {
          toast({ title: "Animation Saved!", description: "You earned 50 XP!" });
        }
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-primary">Animation Studio</h1>
        <p className="text-muted-foreground font-medium">Draw your own cartoon frame by frame!</p>
      </div>

      <div className="grid md:grid-cols-[250px_1fr] gap-6">
        {/* Toolbar */}
        <Card className="border-4 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] rounded-3xl">
          <CardContent className="p-4 space-y-6">
            <div className="space-y-3">
              <h3 className="font-bold text-sm uppercase text-muted-foreground">Tools</h3>
              <div className="flex gap-2">
                <Button variant={!isEraser ? "default" : "outline"} size="icon" onClick={() => setIsEraser(false)}>
                  <Pen className="w-5 h-5" />
                </Button>
                <Button variant={isEraser ? "default" : "outline"} size="icon" onClick={() => setIsEraser(true)}>
                  <Eraser className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-sm uppercase text-muted-foreground">Color</h3>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c && !isEraser ? 'scale-125 border-foreground' : 'border-transparent hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => { setColor(c); setIsEraser(false); }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-sm uppercase text-muted-foreground">Brush Size: {brushSize}</h3>
              <Slider value={brushSize} onValueChange={setBrushSize} min={1} max={50} step={1} />
            </div>

            <Button className="w-full font-bold h-12 rounded-xl" onClick={handleSaveCreation} disabled={saveProgress.isPending}>
              <Save className="w-5 h-5 mr-2" />
              Save Animation
            </Button>
          </CardContent>
        </Card>

        {/* Canvas Area */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border-4 border-muted overflow-hidden shadow-[0_8px_0_0_rgba(0,0,0,0.1)] mx-auto" style={{ width: 600, height: 400 }}>
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              className={`cursor-crosshair w-full h-full ${isPlaying ? 'pointer-events-none' : ''}`}
            />
          </div>

          <Card className="border-4 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] rounded-3xl">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex gap-2">
                <Button size="icon" variant={isPlaying ? "destructive" : "default"} onClick={togglePlayback} className="h-12 w-12 rounded-xl">
                  {isPlaying ? <Pause className="fill-current w-6 h-6" /> : <Play className="fill-current w-6 h-6" />}
                </Button>
              </div>
              <div className="flex-1 w-full space-y-2">
                <div className="text-xs font-bold text-muted-foreground uppercase flex justify-between">
                  <span>Speed (FPS)</span>
                  <span>{fps[0]}</span>
                </div>
                <Slider value={fps} onValueChange={setFps} min={1} max={24} step={1} />
              </div>
            </CardContent>
          </Card>

          {/* Frames */}
          <div className="flex gap-2 overflow-x-auto pb-4 pt-2 px-2">
            {frames.map((_, i) => (
              <div key={i} className={`relative flex-shrink-0 w-24 h-16 rounded-xl border-4 cursor-pointer transition-transform hover:-translate-y-1 ${currentFrameIndex === i ? 'border-primary' : 'border-muted bg-white'}`} onClick={() => selectFrame(i)}>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-muted-foreground/30 text-2xl">{i + 1}</div>
                {frames.length > 1 && (
                  <button className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-sm opacity-0 hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); deleteFrame(i); }}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <button className="flex-shrink-0 w-24 h-16 rounded-xl border-4 border-dashed border-muted flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors font-bold" onClick={addNewFrame}>
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
