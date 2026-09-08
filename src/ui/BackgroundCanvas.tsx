import { useEffect, useRef } from 'react';
import { engine } from '../engine/singleton';
import { useFrame } from './hooks';

interface GearShape {
  x: number;
  y: number;
  radius: number;
  teeth: number;
  speed: number;
  angle: number;
  depth: number;
}

function makeGears(width: number, height: number): GearShape[] {
  const count = Math.max(5, Math.floor((width * height) / 220000));
  const gears: GearShape[] = [];
  for (let i = 0; i < count; i++) {
    const depth = 0.3 + Math.random() * 0.7;
    gears.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: (40 + Math.random() * 110) * depth,
      teeth: 8 + Math.floor(Math.random() * 6),
      speed: (Math.random() < 0.5 ? -1 : 1) * (0.05 + Math.random() * 0.12) * depth,
      angle: Math.random() * Math.PI * 2,
      depth,
    });
  }
  return gears;
}

function drawGear(ctx: CanvasRenderingContext2D, g: GearShape, tint: string) {
  const { x, y, radius, teeth, angle } = g;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  const inner = radius * 0.72;
  const toothDepth = radius * 0.16;
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2;
    const a1 = a0 + (Math.PI * 2) / teeth / 2;
    const a2 = a0 + (Math.PI * 2) / teeth;
    ctx.lineTo(Math.cos(a0) * radius, Math.sin(a0) * radius);
    ctx.lineTo(Math.cos(a1) * (radius + toothDepth), Math.sin(a1) * (radius + toothDepth));
    ctx.lineTo(Math.cos(a2) * radius, Math.sin(a2) * radius);
  }
  ctx.closePath();
  ctx.fillStyle = tint;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, inner * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10,10,14,0.55)';
  ctx.fill();
  ctx.restore();
}

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gearsRef = useRef<GearShape[]>([]);
  const heatRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useFrame(engine, (frame) => {
    heatRef.current = frame.heatPercent;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gearsRef.current = makeGears(window.innerWidth, window.innerHeight);
    };
    resize();
    window.addEventListener('resize', resize);

    let last = performance.now();
    const reduced = () => document.body.classList.contains('reduced-motion');

    const render = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const heat = heatRef.current;
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.42, h * 0.1, w * 0.5, h * 0.5, h * 0.9);
      grad.addColorStop(0, `rgba(${30 + heat * 60},${26 + heat * 10},${34 - heat * 10},1)`);
      grad.addColorStop(1, 'rgba(8,9,13,1)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const tint = `rgba(${120 + heat * 90},${90 + heat * 20},${60 - heat * 20},${0.1})`;
      for (const g of gearsRef.current) {
        if (!reduced()) g.angle += g.speed * dt * (1 + heat * 1.5);
        drawGear(ctx, g, tint);
      }

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="bg-canvas" aria-hidden="true" />;
}
