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

// Optimization constants
const OPACITY_STEP = 0.05;
// Max opacity ~ 1.25 -> 25 steps + 1 safety
const NUM_OPACITY_BUCKETS = Math.ceil(1.3 / OPACITY_STEP) + 1;
// Hues: 0 (white), 60 (yellow), 180 (cyan) -> indices 0, 1, 2
// NOTE: This optimization assumes stars only use these 3 hues as defined in initStars.
// If new hues are added, they must be added to this map or they will default to index 0 (white).
const HUE_MAP: Record<number, number> = { 0: 0, 60: 1, 180: 2 };
const TOTAL_BUCKETS = 3 * NUM_OPACITY_BUCKETS;

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

    // Pre-allocated buckets for batching draw calls
    // Using simple arrays of Star references to avoid object allocation per frame
    const starBuckets: Star[][] = Array.from({ length: TOTAL_BUCKETS }, () => []);
    // Glow buckets only need to track stars that have glow (Hue 0, low opacity)
    // But we reuse the same bucket structure for simplicity in indexing
    // (though only Hue 0 buckets will likely be used for glow as it's white)
    const glowBuckets: Star[][] = Array.from({ length: TOTAL_BUCKETS }, () => []);

    const getBucketIndex = (hue: number, opacity: number): number => {
      const hueIdx = HUE_MAP[hue] || 0;
      let opacityIdx = Math.floor(opacity / OPACITY_STEP);
      if (opacityIdx < 0) opacityIdx = 0;
      if (opacityIdx >= NUM_OPACITY_BUCKETS) opacityIdx = NUM_OPACITY_BUCKETS - 1;
      return hueIdx * NUM_OPACITY_BUCKETS + opacityIdx;
    };

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
        speed: Math.random() * 300 + 250, // pixels per second (time-based)
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
      if (star.trail.length > 30) star.trail.pop();

      // Draw trail using a single linear gradient line for performance
      if (star.trail.length > 1) {
        const last = star.trail[star.trail.length - 1];
        const gradient = ctx.createLinearGradient(star.x, star.y, last.x, last.y);
        gradient.addColorStop(0, `hsla(${star.hue}, 100%, 95%, ${star.opacity})`);
        gradient.addColorStop(0.3, `hsla(${star.hue}, 100%, 80%, ${star.opacity * 0.6})`);
        gradient.addColorStop(1, `hsla(${star.hue}, 100%, 70%, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(star.trail[0].x, star.trail[0].y);
        for (let i = 1; i < star.trail.length; i++) {
          ctx.lineTo(star.trail[i].x, star.trail[i].y);
        }
        ctx.stroke();
      }

      // Bright head glow (outer)
      const headGlow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 18);
      headGlow.addColorStop(0, `hsla(${star.hue}, 100%, 95%, ${star.opacity * 0.5})`);
      headGlow.addColorStop(0.4, `hsla(${star.hue}, 100%, 70%, ${star.opacity * 0.15})`);
      headGlow.addColorStop(1, `hsla(${star.hue}, 100%, 50%, 0)`);
      ctx.fillStyle = headGlow;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 18, 0, Math.PI * 2);
      ctx.fill();

      // Bright head core
      const headCore = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 3.5);
      headCore.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
      headCore.addColorStop(1, `hsla(${star.hue}, 100%, 80%, 0)`);
      ctx.fillStyle = headCore;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      let deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      // Cap deltaTime to prevent huge jumps when tab regains focus
      if (deltaTime > 100) deltaTime = 16;

      ctx.clearRect(0, 0, width, height);

      // --- Optimized Star Rendering ---

      // 1. Update and Bucket Stars
      // Clear buckets
      for (let i = 0; i < TOTAL_BUCKETS; i++) {
        starBuckets[i].length = 0;
        glowBuckets[i].length = 0;
      }

      stars.forEach((star) => {
        // Update physics/animation
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.8 + 0.5;
        const currentOpacity = star.opacity * (0.3 + twinkle * 0.7);

        // Bucket for main star draw
        const bucketIdx = getBucketIndex(star.hue, currentOpacity);
        starBuckets[bucketIdx].push(star);

        // Bucket for glow draw (if applicable)
        if (star.size > 1.2 && currentOpacity > 0.6) {
          const glowOpacity = currentOpacity * 0.1;
          // Glow is always white (hue 0)
          const glowIdx = getBucketIndex(0, glowOpacity);
          glowBuckets[glowIdx].push(star);
        }

        // Update position for next frame
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
      });

      // 2. Draw Star Buckets
      for (let i = 0; i < TOTAL_BUCKETS; i++) {
        if (starBuckets[i].length === 0) continue;

        const hueIdx = Math.floor(i / NUM_OPACITY_BUCKETS);
        const opacityIdx = i % NUM_OPACITY_BUCKETS;

        const hue = hueIdx === 0 ? 0 : (hueIdx === 1 ? 60 : 180);
        // Use midpoint of opacity step to average out
        const opacity = (opacityIdx * OPACITY_STEP) + (OPACITY_STEP / 2);

        if (hue > 0) {
          ctx.fillStyle = `hsla(${hue}, 80%, 85%, ${opacity})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        }

        ctx.beginPath();
        const bucket = starBuckets[i];
        for (let j = 0; j < bucket.length; j++) {
          const s = bucket[j];
          ctx.moveTo(s.x + s.size, s.y);
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      // 3. Draw Glow Buckets
      for (let i = 0; i < TOTAL_BUCKETS; i++) {
        if (glowBuckets[i].length === 0) continue;

        const opacityIdx = i % NUM_OPACITY_BUCKETS;
        const opacity = (opacityIdx * OPACITY_STEP) + (OPACITY_STEP / 2);

        // Glow is always white
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

        ctx.beginPath();
        const bucket = glowBuckets[i];
        for (let j = 0; j < bucket.length; j++) {
          const s = bucket[j];
          // Glow is 3x larger
          const glowSize = s.size * 3;
          ctx.moveTo(s.x + glowSize, s.y);
          ctx.arc(s.x, s.y, glowSize, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      // --- End Optimized Star Rendering ---

      // Spawn shooting stars
      timeSinceLastShootingStar += deltaTime;
      if (timeSinceLastShootingStar > shootingStarInterval) {
        shootingStars.push(createShootingStar());
        timeSinceLastShootingStar = 0;
        shootingStarInterval = Math.random() * 5000 + 6000; // 6-11s between comets
      }

      // Update & draw shooting stars
      const dt = deltaTime / 1000; // convert to seconds
      shootingStars = shootingStars.filter((star) => {
        if (!star.active) return false;

        star.x += Math.cos(star.angle) * star.speed * dt;
        star.y += Math.sin(star.angle) * star.speed * dt;
        star.life += deltaTime;

        // Spawn sparkle particles along trail (reduced frequency)
        if (Math.random() > 0.7) {
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
        p.opacity -= p.decay * deltaTime * 0.06;
        if (p.opacity <= 0) return false;

        p.x += p.vx * deltaTime * 0.06;
        p.y += p.vy * deltaTime * 0.06;
        p.size *= 1 - 0.02 * deltaTime * 0.06;

        ctx.fillStyle = `hsla(${p.hue}, 100%, 80%, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    // Pause animation when tab is hidden to save CPU
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        lastTime = 0;
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibility);
    resize();
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
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
