import React, { useEffect, useRef } from 'react';

interface Dot {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
}

interface DotGridBackgroundProps {
  dotSpacing?: number;
  dotRadius?: number;
  interactionRadius?: number;
  dotColor?: string;
  glowColor?: string;
}

const DotGridBackground: React.FC<DotGridBackgroundProps> = ({
  dotSpacing = 35,
  dotRadius = 1.5,
  interactionRadius = 120,
  dotColor = 'rgba(255, 255, 255, 0.12)',
  glowColor = 'rgba(34, 197, 220, 1)',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize dots
    const initDots = () => {
      dotsRef.current = [];
      const cols = Math.ceil(canvas.width / dotSpacing) + 1;
      const rows = Math.ceil(canvas.height / dotSpacing) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dotsRef.current.push({
            x: i * dotSpacing,
            y: j * dotSpacing,
            baseX: i * dotSpacing,
            baseY: j * dotSpacing,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDots();
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dotsRef.current.forEach((dot) => {
        const mouse = mouseRef.current;
        
        // Calculate distance from mouse
        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < interactionRadius) {
          // Push dot away from mouse
          const force = (interactionRadius - distance) / interactionRadius;
          const angle = Math.atan2(dy, dx);
          const pushX = Math.cos(angle) * force * 25;
          const pushY = Math.sin(angle) * force * 25;

          dot.vx -= pushX * 0.02;
          dot.vy -= pushY * 0.02;
        }

        // Spring back to original position
        const springX = (dot.baseX - dot.x) * 0.08;
        const springY = (dot.baseY - dot.y) * 0.08;

        dot.vx += springX;
        dot.vy += springY;

        // Apply friction
        dot.vx *= 0.9;
        dot.vy *= 0.9;

        // Update position
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Calculate glow intensity
        const glowDistance = Math.sqrt(
          Math.pow(mouse.x - dot.x, 2) + Math.pow(mouse.y - dot.y, 2)
        );

        let alpha = 0.12;
        let radius = dotRadius;
        let color = dotColor;

        if (glowDistance < interactionRadius * 1.5) {
          const intensity = 1 - glowDistance / (interactionRadius * 1.5);
          alpha = 0.12 + intensity * 0.8;
          radius = dotRadius + intensity * 2;

          if (intensity > 0.3) {
            // Parse glow color and apply alpha
            color = glowColor.replace('1)', `${alpha})`);
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 10 * intensity;
          } else {
            color = `rgba(255, 255, 255, ${alpha})`;
            ctx.shadowBlur = 0;
          }
        } else {
          ctx.shadowBlur = 0;
        }

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    // Mouse leave handler
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    // Initialize
    resizeCanvas();
    animate();

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dotSpacing, dotRadius, interactionRadius, dotColor, glowColor]);

  return (
    <canvas
      ref={canvasRef}
      className="dot-grid-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default DotGridBackground;
