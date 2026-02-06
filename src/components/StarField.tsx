import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

export const StarField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: Star[] = [];
    let shootingStar: ShootingStar | null = null;
    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let lastTime = 0;
    let shootingStarInterval = Math.random() * 3000 + 2000; // Initial delay 2-5s
    let timeSinceLastShootingStar = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initStars();
    };

    const initStars = () => {
      const starCount = Math.floor((width * height) / 3000);
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random(),
          speed: Math.random() * 0.2 + 0.05,
          twinkleSpeed: Math.random() * 0.05 + 0.02,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    const createShootingStar = (): ShootingStar => {
        // Start from random side (top or left)
        const startX = Math.random() * width;
        const startY = Math.random() * (height / 2); // Mostly upper half
        
        return {
            x: startX,
            y: startY,
            length: Math.random() * 80 + 100, // Length of trail
            speed: Math.random() * 2 + 1, // Much slower (was 15+10)
            angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1), // Diagonal down-right approx 45deg
            opacity: 1,
            active: true
        };
    };

    const drawShootingStar = (star: ShootingStar) => {
        if (!star.active) return;

        const tailX = star.x - Math.cos(star.angle) * star.length;
        const tailY = star.y - Math.sin(star.angle) * star.length;

        const gradient = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`); // Head bright
        gradient.addColorStop(0.1, `rgba(255, 255, 255, ${star.opacity * 0.8})`); // Core
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`); // Tail transparent

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Optional: Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = "white";
        ctx.stroke();
        ctx.shadowBlur = 0;
    };

    const draw = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      ctx.clearRect(0, 0, width, height);

      // Draw normal stars
      stars.forEach((star) => {
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.8 + 0.5;
        const currentOpacity = star.opacity * (0.3 + twinkle * 0.7);

        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
      });

      // Handle Shooting Star
      timeSinceLastShootingStar += deltaTime;
      if (timeSinceLastShootingStar > shootingStarInterval) {
          shootingStar = createShootingStar();
          timeSinceLastShootingStar = 0;
          shootingStarInterval = 10000; // Fixed interval of 10 seconds
      }

      if (shootingStar && shootingStar.active) {
          shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
          shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
          
          // Fade out near end
          if (shootingStar.x > width || shootingStar.y > height) {
              shootingStar.active = false;
          }

          drawShootingStar(shootingStar);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-1 pointer-events-none mix-blend-screen"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
