import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinklePhase: number;
  hue: number; // subtle color variation
}

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  decay: number;
  vx: number;
  vy: number;
  hue: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
  trail: { x: number; y: number; opacity: number }[];
  hue: number; // color of the comet (cyan, lime, etc.)
  life: number;
}

export const StarField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: Star[] = [];
    let particles: Particle[] = [];
    let shootingStars: ShootingStar[] = [];
    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let lastTime = 0;
    let timeSinceLastShootingStar = 0;
    let shootingStarInterval = Math.random() * 2000 + 1500;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initStars();
    };

    const initStars = () => {
      const starCount = Math.floor((width * height) / 2500);
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.3,
          opacity: Math.random(),
          speed: Math.random() * 0.15 + 0.03,
          twinkleSpeed: Math.random() * 0.04 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
          hue: Math.random() > 0.85 ? (Math.random() > 0.5 ? 180 : 60) : 0, // some stars cyan or yellow
        });
      }
    };

    const cometHues = [180, 160, 80, 300, 200]; // cyan, teal, lime, magenta, blue

    const createShootingStar = (): ShootingStar => {
      const startX = Math.random() * width * 0.8;
      const startY = Math.random() * (height * 0.4);

      return {
        x: startX,
        y: startY,
        length: Math.random() * 100 + 120,
        speed: Math.random() * 3 + 2,
        angle: Math.PI / 4 + (Math.random() * 0.3 - 0.15),
        opacity: 1,
        active: true,
        trail: [],
        hue: cometHues[Math.floor(Math.random() * cometHues.length)],
        life: 0,
      };
    };

    const spawnParticles = (x: number, y: number, hue: number) => {
      const count = Math.random() > 0.6 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        particles.push({
          x,
          y,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          decay: Math.random() * 0.015 + 0.008,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5 + 0.2,
          hue: hue + (Math.random() * 30 - 15),
        });
      }
    };

    const drawShootingStar = (star: ShootingStar) => {
      if (!star.active) return;

      // Store trail points
      star.trail.unshift({ x: star.x, y: star.y, opacity: star.opacity });
      if (star.trail.length > 40) star.trail.pop();

      // Draw trail with gradient segments
      for (let i = 0; i < star.trail.length - 1; i++) {
        const p = star.trail[i];
        const pNext = star.trail[i + 1];
        const frac = 1 - i / star.trail.length;
        const alpha = frac * frac * star.opacity;
        const lineWidth = frac * 2.5 + 0.5;

        ctx.strokeStyle = `hsla(${star.hue}, 100%, ${70 + frac * 30}%, ${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(pNext.x, pNext.y);
        ctx.stroke();
      }

      // Bright head glow (outer)
      const headGlow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 20);
      headGlow.addColorStop(0, `hsla(${star.hue}, 100%, 95%, ${star.opacity * 0.6})`);
      headGlow.addColorStop(0.3, `hsla(${star.hue}, 100%, 70%, ${star.opacity * 0.2})`);
      headGlow.addColorStop(1, `hsla(${star.hue}, 100%, 50%, 0)`);
      ctx.fillStyle = headGlow;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 20, 0, Math.PI * 2);
      ctx.fill();

      // Bright head core
      const headCore = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 4);
      headCore.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
      headCore.addColorStop(1, `hsla(${star.hue}, 100%, 80%, 0)`);
      ctx.fillStyle = headCore;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      ctx.clearRect(0, 0, width, height);

      // Draw stars
      stars.forEach((star) => {
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.8 + 0.5;
        const currentOpacity = star.opacity * (0.3 + twinkle * 0.7);

        if (star.hue > 0) {
          ctx.fillStyle = `hsla(${star.hue}, 80%, 85%, ${currentOpacity})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glow for brighter stars
        if (star.size > 1.2 && currentOpacity > 0.6) {
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.1})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
      });

      // Spawn shooting stars
      timeSinceLastShootingStar += deltaTime;
      if (timeSinceLastShootingStar > shootingStarInterval) {
        shootingStars.push(createShootingStar());
        timeSinceLastShootingStar = 0;
        shootingStarInterval = Math.random() * 5000 + 6000; // 6-11s between comets
      }

      // Update & draw shooting stars
      shootingStars = shootingStars.filter((star) => {
        if (!star.active) return false;

        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.life += deltaTime;

        // Spawn sparkle particles along trail
        if (Math.random() > 0.4) {
          spawnParticles(
            star.x - Math.cos(star.angle) * 5 + (Math.random() - 0.5) * 4,
            star.y - Math.sin(star.angle) * 5 + (Math.random() - 0.5) * 4,
            star.hue
          );
        }

        // Fade out after leaving screen
        if (star.x > width + 50 || star.y > height + 50 || star.x < -50) {
          star.active = false;
          return false;
        }

        drawShootingStar(star);
        return true;
      });

      // Update & draw particles (sparkles)
      particles = particles.filter((p) => {
        p.opacity -= p.decay;
        if (p.opacity <= 0) return false;

        p.x += p.vx;
        p.y += p.vy;
        p.size *= 0.98;

        ctx.fillStyle = `hsla(${p.hue}, 100%, 80%, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

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
