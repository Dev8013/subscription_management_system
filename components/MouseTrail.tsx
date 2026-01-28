
import React, { useEffect, useRef, useState } from 'react';

const TRAIL_COUNT = 8;

const MouseTrail: React.FC = () => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const dotsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    const dots = dotsRef.current;
    let requestRef: number;

    const animate = () => {
      let x = coords.x;
      let y = coords.y;

      dots.forEach((dot, index) => {
        if (!dot) return;
        
        // Simple easing: each dot follows the one before it
        const nextDot = dots[index + 1] || { 
          offsetLeft: coords.x, 
          offsetTop: coords.y,
          style: { left: `${coords.x}px`, top: `${coords.y}px` } 
        };

        // Update current dot position to move towards the target
        // We use a bit of math to make them trail behind
        const dotX = parseFloat(dot.style.left);
        const dotY = parseFloat(dot.style.top);
        
        const dx = (x - dotX) * 0.35;
        const dy = (y - dotY) * 0.35;

        dot.style.left = `${dotX + dx}px`;
        dot.style.top = `${dotY + dy}px`;

        // Update x and y for the next dot in the loop to follow this one
        x = dotX;
        y = dotY;
      });

      requestRef = requestAnimationFrame(animate);
    };

    requestRef = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(requestRef);
    };
  }, [coords]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { if (el) dotsRef.current[i] = el; }}
          className="absolute w-3 h-3 rounded-full bg-indigo-500/40 dark:bg-indigo-400/60 blur-[2px] transition-opacity duration-300"
          style={{
            left: '0px',
            top: '0px',
            transform: `scale(${(TRAIL_COUNT - i) / TRAIL_COUNT})`,
            opacity: (TRAIL_COUNT - i) / (TRAIL_COUNT * 1.5),
          }}
        />
      ))}
    </div>
  );
};

export default MouseTrail;
