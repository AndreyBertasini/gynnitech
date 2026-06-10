import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  driftX: number;
  driftY: number;
  twinkleSpeed: number;
  twinklePhase: number;
  hue: number;
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
  width: number;
  hue: number;
  life: number;
  maxLife: number;
  shimmer: number;
}

const OPACITY_STEP = 0.05;
const NUM_OPACITY_BUCKETS = Math.ceil(1.3 / OPACITY_STEP) + 1;
const HUE_MAP: Record<number, number> = { 0: 0, 60: 1, 180: 2 };
const TOTAL_BUCKETS = 3 * NUM_OPACITY_BUCKETS;
const COMET_HUES = [78, 120, 168, 188, 210];

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

export const StarField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let stars: Star[] = [];
    let particles: Particle[] = [];
    let shootingStars: ShootingStar[] = [];
    let animationFrameId: number | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let lastTime = 0;
    let timeSinceLastShower = 0;
    let nextShowerIn = 500;

    const starBuckets: Star[][] = Array.from({ length: TOTAL_BUCKETS }, () => []);
    const glowBuckets: Star[][] = Array.from({ length: TOTAL_BUCKETS }, () => []);

    const getBucketIndex = (hue: number, opacity: number): number => {
      const hueIdx = HUE_MAP[hue] || 0;
      const opacityIdx = Math.max(
        0,
        Math.min(NUM_OPACITY_BUCKETS - 1, Math.floor(opacity / OPACITY_STEP)),
      );
      return hueIdx * NUM_OPACITY_BUCKETS + opacityIdx;
    };

    const initStars = () => {
      const density = width < 768 ? 4200 : 3000;
      const starCount = Math.max(80, Math.floor((width * height) / density));
      stars = [];

      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: randomBetween(0.35, 1.65),
          opacity: randomBetween(0.25, 1),
          driftX: randomBetween(1.5, 5),
          driftY: randomBetween(-1.2, 0.6),
          twinkleSpeed: randomBetween(0.004, 0.018),
          twinklePhase: Math.random() * Math.PI * 2,
          hue: Math.random() > 0.88 ? (Math.random() > 0.5 ? 180 : 60) : 0,
        });
      }
    };

    const createShootingStar = (laneY?: number, delayOffset = 0, hue?: number): ShootingStar => {
      const angle = randomBetween(-0.08, 0.17);
      const length = Math.min(width * 0.46, randomBetween(210, 420));
      const speed = Math.min(920, Math.max(520, width * randomBetween(0.52, 0.78)));
      const startY = laneY ?? randomBetween(height * 0.11, height * 0.56);

      return {
        x: -length - randomBetween(80, 260) - delayOffset,
        y: startY + randomBetween(-24, 24),
        length,
        speed,
        angle,
        opacity: 0,
        width: randomBetween(1.5, 2.8),
        hue: hue ?? COMET_HUES[Math.floor(Math.random() * COMET_HUES.length)],
        life: 0,
        maxLife: ((width + length + 420 + delayOffset) / speed) * 1000,
        shimmer: randomBetween(0, Math.PI * 2),
      };
    };

    const spawnMeteorShower = (opening = false) => {
      if (reduceMotion || width === 0 || height === 0) return;

      const cometCount = opening ? 4 : Math.random() > 0.72 ? 3 : Math.random() > 0.38 ? 2 : 1;
      const laneY = randomBetween(height * 0.12, height * 0.48);
      const hue = COMET_HUES[Math.floor(Math.random() * COMET_HUES.length)];

      for (let i = 0; i < cometCount; i++) {
        shootingStars.push(createShootingStar(laneY + i * randomBetween(18, 38), i * randomBetween(120, 230), hue));
      }
    };

    const spawnParticles = (star: ShootingStar) => {
      const count = Math.random() > 0.58 ? 2 : 1;
      const tailOffset = randomBetween(18, star.length * 0.48);
      const baseX = star.x - Math.cos(star.angle) * tailOffset;
      const baseY = star.y - Math.sin(star.angle) * tailOffset;

      for (let i = 0; i < count; i++) {
        particles.push({
          x: baseX + randomBetween(-6, 6),
          y: baseY + randomBetween(-5, 5),
          size: randomBetween(0.45, 1.8),
          opacity: randomBetween(0.25, 0.9) * star.opacity,
          decay: randomBetween(0.8, 1.6),
          vx: randomBetween(-10, 22),
          vy: randomBetween(-12, 18),
          hue: star.hue + randomBetween(-18, 18),
        });
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width || window.innerWidth));
      height = Math.max(1, Math.floor(rect.height || window.innerHeight));
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      initStars();
      particles = [];
      shootingStars = [];
      timeSinceLastShower = 0;
      nextShowerIn = 350;

      if (reduceMotion) {
        drawStaticSky();
      }
    };

    const drawStarBuckets = (deltaTime: number, animate: boolean) => {
      for (let i = 0; i < TOTAL_BUCKETS; i++) {
        starBuckets[i].length = 0;
        glowBuckets[i].length = 0;
      }

      const seconds = deltaTime / 1000;

      for (const star of stars) {
        if (animate) {
          star.twinklePhase += star.twinkleSpeed * deltaTime;
          star.x += star.driftX * seconds;
          star.y += star.driftY * seconds;

          if (star.x > width + 8) star.x = -8;
          if (star.y < -8) star.y = height + 8;
          if (star.y > height + 8) star.y = -8;
        }

        const twinkle = animate ? Math.sin(star.twinklePhase) * 0.5 + 0.5 : 0.75;
        const currentOpacity = star.opacity * (0.38 + twinkle * 0.62);
        starBuckets[getBucketIndex(star.hue, currentOpacity)].push(star);

        if (star.size > 1.15 && currentOpacity > 0.58) {
          glowBuckets[getBucketIndex(0, currentOpacity * 0.11)].push(star);
        }
      }

      for (let i = 0; i < TOTAL_BUCKETS; i++) {
        const bucket = starBuckets[i];
        if (bucket.length === 0) continue;

        const hueIdx = Math.floor(i / NUM_OPACITY_BUCKETS);
        const opacityIdx = i % NUM_OPACITY_BUCKETS;
        const hue = hueIdx === 0 ? 0 : hueIdx === 1 ? 60 : 180;
        const opacity = opacityIdx * OPACITY_STEP + OPACITY_STEP / 2;
        ctx.fillStyle = hue > 0 ? `hsla(${hue}, 82%, 84%, ${opacity})` : `rgba(255, 255, 255, ${opacity})`;

        ctx.beginPath();
        for (const star of bucket) {
          ctx.moveTo(star.x + star.size, star.y);
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      for (let i = 0; i < TOTAL_BUCKETS; i++) {
        const bucket = glowBuckets[i];
        if (bucket.length === 0) continue;

        const opacityIdx = i % NUM_OPACITY_BUCKETS;
        const opacity = opacityIdx * OPACITY_STEP + OPACITY_STEP / 2;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

        ctx.beginPath();
        for (const star of bucket) {
          const glowSize = star.size * 3.3;
          ctx.moveTo(star.x + glowSize, star.y);
          ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    };

    const drawShootingStar = (star: ShootingStar) => {
      const tailX = star.x - Math.cos(star.angle) * star.length;
      const tailY = star.y - Math.sin(star.angle) * star.length;
      const shimmer = 0.84 + Math.sin(star.life * 0.018 + star.shimmer) * 0.16;
      const alpha = star.opacity * shimmer;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const outer = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
      outer.addColorStop(0, `hsla(${star.hue}, 100%, 96%, ${alpha * 0.9})`);
      outer.addColorStop(0.18, `hsla(${star.hue}, 100%, 76%, ${alpha * 0.34})`);
      outer.addColorStop(0.58, `hsla(${star.hue}, 100%, 62%, ${alpha * 0.12})`);
      outer.addColorStop(1, `hsla(${star.hue}, 100%, 54%, 0)`);

      ctx.strokeStyle = outer;
      ctx.lineWidth = star.width * 5.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(star.x, star.y);
      ctx.stroke();

      const core = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
      core.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      core.addColorStop(0.24, `hsla(${star.hue}, 100%, 86%, ${alpha * 0.78})`);
      core.addColorStop(1, `hsla(${star.hue}, 100%, 70%, 0)`);

      ctx.strokeStyle = core;
      ctx.lineWidth = star.width;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(star.x, star.y);
      ctx.stroke();

      const headGlow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 28);
      headGlow.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      headGlow.addColorStop(0.18, `hsla(${star.hue}, 100%, 82%, ${alpha * 0.52})`);
      headGlow.addColorStop(0.5, `hsla(${star.hue}, 100%, 64%, ${alpha * 0.14})`);
      headGlow.addColorStop(1, `hsla(${star.hue}, 100%, 50%, 0)`);
      ctx.fillStyle = headGlow;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 2.2 + star.width * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const updateShootingStars = (deltaTime: number) => {
      const seconds = deltaTime / 1000;

      shootingStars = shootingStars.filter((star) => {
        star.life += deltaTime;
        const progress = Math.min(1, star.life / star.maxLife);
        star.opacity = Math.sin(progress * Math.PI);
        star.x += Math.cos(star.angle) * star.speed * seconds;
        star.y += Math.sin(star.angle) * star.speed * seconds;

        if (Math.random() > 0.54) {
          spawnParticles(star);
        }

        drawShootingStar(star);
        return progress < 1 && star.x < width + star.length + 80 && star.y > -120 && star.y < height + 120;
      });
    };

    const updateParticles = (deltaTime: number) => {
      const seconds = deltaTime / 1000;

      particles = particles.filter((particle) => {
        particle.opacity -= particle.decay * seconds;
        if (particle.opacity <= 0) return false;

        particle.x += particle.vx * seconds;
        particle.y += particle.vy * seconds;
        particle.size *= 1 - 0.55 * seconds;

        ctx.fillStyle = `hsla(${particle.hue}, 100%, 82%, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, Math.max(0.2, particle.size), 0, Math.PI * 2);
        ctx.fill();

        return true;
      });
    };

    const drawStaticSky = () => {
      ctx.clearRect(0, 0, width, height);
      drawStarBuckets(0, false);
    };

    const draw = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      let deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      if (deltaTime > 100) deltaTime = 16;

      ctx.clearRect(0, 0, width, height);
      drawStarBuckets(deltaTime, true);

      timeSinceLastShower += deltaTime;
      if (timeSinceLastShower >= nextShowerIn) {
        spawnMeteorShower();
        timeSinceLastShower = 0;
        nextShowerIn = randomBetween(2600, 5200);
      }

      updateShootingStars(deltaTime);
      updateParticles(deltaTime);

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleVisibility = () => {
      if (document.hidden && animationFrameId !== undefined) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = undefined;
      } else if (!document.hidden && !reduceMotion && animationFrameId === undefined) {
        lastTime = 0;
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    const hostElement = canvas.parentElement ?? canvas;
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(hostElement);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibility);

    resize();

    if (!reduceMotion) {
      spawnMeteorShower(true);
      animationFrameId = requestAnimationFrame(draw);
    }

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animationFrameId !== undefined) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 z-[2] pointer-events-none opacity-95 mix-blend-screen"
      style={{
        width: '100%',
        height: '100%',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 72%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 72%, transparent 100%)',
      } as React.CSSProperties}
    />
  );
};
