"use client";

import React, { useEffect, useRef } from "react";

/**
 * SlowMoRainBackground
 * ====================
 * A high-performance, aesthetic slow-motion rain and liquid ripple background component
 * for developer portfolios.
 * 
 * Key Features:
 * - Deep dark atmospheric palette (#08090d base with subtle cyan/indigo radial glows)
 * - Ultra-thin, calming slow-motion raindrops (opacity 0.15 to 0.45, 3 depth layers)
 * - Interactive pointer tracking: glides and idle cursor generate natural periodic puddle ripples
 * - Soft neon cyan/sky glow ripples (rgba(56, 189, 248, 0.4) fading to transparent)
 * - Retina/High-DPI sharp rendering with devicePixelRatio
 * - Auto-pruned object pools ensuring zero memory leaks and solid 60 FPS
 * - Zero pointer blocking (pointer-events: none, z-index: -1)
 * 
 * @param {Object} props
 * @param {string} [props.className] Additional Tailwind classes for wrapper
 * @param {string} [props.baseColor="#08090d"] Background base color
 * @param {number} [props.dropCount] Custom raindrop count (auto-scales by resolution if null)
 * @param {number} [props.dripInterval=650] Milliseconds between idle puddle drips at pointer
 */
export default function SlowMoRainBackground({
  className = "",
  baseColor = "#08090d",
  dropCount = null,
  dripInterval = 650,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    let animationFrameId;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Entity arrays
    let raindrops = [];
    let ripples = [];

    // Pointer state
    const pointer = {
      x: -9999,
      y: -9999,
      lastX: -9999,
      lastY: -9999,
      active: false,
      lastDripTime: 0,
      lastMoveTime: 0,
    };

    /**
     * Handle high-DPI canvas resizing
     */
    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);

      // Auto-scale drop density: ~85 on desktop, ~40 on mobile
      const targetDensity = dropCount || Math.max(40, Math.min(Math.floor((width * height) / 14000), 105));
      while (raindrops.length < targetDensity) {
        raindrops.push(createRaindrop(false));
      }
      if (raindrops.length > targetDensity) {
        raindrops.length = targetDensity;
      }
    };

    /**
     * Create individual raindrop with 3-tier depth stratification
     */
    const createRaindrop = (randomY = false) => {
      // 0 = Far Background, 1 = Midground, 2 = Foreground
      const rand = Math.random();
      const layer = rand < 0.45 ? 0 : (rand < 0.80 ? 1 : 2);

      let speed, length, thickness, opacity, color;

      if (layer === 0) {
        // Far Background: soft, gentle, atmospheric
        speed = 0.70 + Math.random() * 0.35;
        length = 8 + Math.random() * 6;
        thickness = 0.65;
        opacity = 0.15 + Math.random() * 0.08;
        color = "rgba(147, 197, 253,"; // Soft icy blue
      } else if (layer === 1) {
        // Midground: balanced
        speed = 1.10 + Math.random() * 0.40;
        length = 14 + Math.random() * 8;
        thickness = 0.90;
        opacity = 0.24 + Math.random() * 0.10;
        color = "rgba(56, 189, 248,"; // Neon cyan/sky
      } else {
        // Foreground: crystal luminous drops
        speed = 1.60 + Math.random() * 0.45;
        length = 20 + Math.random() * 10;
        thickness = 1.20;
        opacity = 0.35 + Math.random() * 0.10;
        color = Math.random() > 0.4 ? "rgba(56, 189, 248," : "rgba(224, 242, 254,";
      }

      const floorY = height - (Math.random() * 40 + 5);
      const baseSpeed = speed;
      const baseVx = 0;
      const baseVy = baseSpeed;

      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : -Math.random() * 60 - 20,
        layer,
        baseSpeed,
        speed: baseSpeed,
        baseVx,
        baseVy,
        vx: baseVx,
        vy: baseVy,
        length,
        thickness,
        opacity,
        color,
        floorY,
      };
    };

    /**
     * Spawn circular liquid puddle ripple
     */
    const spawnRipple = (x, y, maxRadius = 40, initialOpacity = 0.36, growthRate = 0.32) => {
      if (ripples.length >= 60) ripples.shift(); // Auto-prune oldest
      ripples.push({
        x,
        y,
        radius: 1.5,
        maxRadius,
        growthRate,
        opacity: initialOpacity,
        decay: initialOpacity / (maxRadius / growthRate),
        lineWidth: 1.0,
      });
    };

    /**
     * Spawn concentric double/triple ripple ring
     */
    const spawnConcentricRipples = (x, y, count = 2) => {
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          if (!canvas) return;
          spawnRipple(
            x,
            y,
            36 + i * 14,
            0.35 - i * 0.08,
            0.30 + i * 0.10
          );
        }, i * 140);
      }
    };

    // Pointer event handlers
    const handlePointerMove = (e) => {
      pointer.lastX = pointer.x;
      pointer.lastY = pointer.y;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      pointer.lastMoveTime = performance.now();

      // Drip while moving if sufficient distance travelled
      const dx = pointer.x - pointer.lastX;
      const dy = pointer.y - pointer.lastY;
      const dist = Math.hypot(dx, dy);

      const now = performance.now();
      if (dist > 28 && now - pointer.lastDripTime > 140) {
        spawnRipple(pointer.x, pointer.y, 32, 0.35, 0.70);
        pointer.lastDripTime = now;
      }
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const handlePointerDown = (e) => {
      spawnConcentricRipples(e.clientX, e.clientY, 3);
    };

    /**
     * Main 60 FPS Render Loop
     */
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const now = performance.now();

      // 1. Natural periodic puddle drip when pointer is active / staying still
      if (pointer.active && pointer.x > 0 && pointer.x < width && pointer.y > 0 && pointer.y < height) {
        if (now - pointer.lastDripTime > dripInterval) {
          spawnConcentricRipples(pointer.x, pointer.y, 2);
          pointer.lastDripTime = now;
        }
      }

      // 2. Update & Draw Expanding Concentric Circular Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += rip.growthRate;
        rip.opacity -= rip.decay;

        // Auto-prune expired ripples
        if (rip.opacity <= 0.005 || rip.radius >= rip.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${rip.opacity.toFixed(3)})`;
        ctx.lineWidth = rip.lineWidth;
        ctx.stroke();
      }

      // 3. Update & Draw Slow-Motion Raindrops with Magnetic Attraction & Aesthetic Release
      const attractRadius = 320;
      for (let i = 0; i < raindrops.length; i++) {
        const drop = raindrops[i];
        let targetVx = drop.baseVx;
        let targetVy = drop.baseVy;

        if (pointer.active && pointer.x > 0) {
          const dx = pointer.x - drop.x;
          const dy = pointer.y - drop.y;
          const dist = Math.hypot(dx, dy);

          if (dist < attractRadius) {
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);
            const proximity = Math.pow(1 - dist / attractRadius, 1.25);
            const coreDamp = Math.min(dist / 35, 1.0);
            const maxAttractSpeed = drop.baseSpeed * (2.8 + (drop.layer === 2 ? 1.0 : 0.4));
            targetVx = drop.baseVx * (1 - proximity) + nx * maxAttractSpeed * proximity * coreDamp;
            targetVy = drop.baseVy * (1 - proximity) + ny * maxAttractSpeed * proximity * coreDamp;
          }
        }

        const lerpRate = pointer.active ? 0.08 : 0.035;
        drop.vx += (targetVx - drop.vx) * lerpRate;
        drop.vy += (targetVy - drop.vy) * lerpRate;

        drop.x += drop.vx;
        drop.y += drop.vy;

        // Ground/Baseline impact -> spawn soft circular puddle ripple
        if (drop.y >= drop.floorY) {
          if (drop.layer >= 1 && Math.random() < 0.65) {
            spawnRipple(drop.x, drop.floorY, 18 + drop.layer * 8, 0.28, 0.45);
          }
          // Recycle drop above top viewport
          drop.y = -Math.random() * 50 - 15;
          drop.x = Math.random() * width;
          drop.vx = drop.baseVx;
          drop.vy = drop.baseVy;
          drop.floorY = height - (Math.random() * 40 + 5);
          continue;
        }

        if (drop.x < -100) drop.x = width + 50;
        else if (drop.x > width + 100) drop.x = -50;
        if (drop.y < -80) { drop.y = -20; drop.vy = Math.max(drop.baseVy, drop.vy); }

        // Dynamic motion streak aligned with velocity
        const vMag = Math.hypot(drop.vx, drop.vy) || 1;
        const currentLength = drop.length * Math.min(2.2, Math.max(0.75, vMag / drop.baseSpeed));
        const tailX = drop.x - (drop.vx / vMag) * currentLength;
        const tailY = drop.y - (drop.vy / vMag) * currentLength;

        const grad = ctx.createLinearGradient(tailX, tailY, drop.x, drop.y);
        grad.addColorStop(0, `${drop.color}0.0)`);
        grad.addColorStop(0.6, `${drop.color}${(drop.opacity * 0.45).toFixed(3)})`);
        grad.addColorStop(1, `${drop.color}${drop.opacity.toFixed(3)})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(drop.x, drop.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = drop.thickness;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Initialize
    handleResize();
    const initDensity = dropCount || Math.max(40, Math.min(Math.floor((width * height) / 14000), 105));
    raindrops = Array.from({ length: initDensity }, () => createRaindrop(true));

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("pointerdown", handlePointerDown);
      raindrops = [];
      ripples = [];
    };
  }, [baseColor, dropCount, dripInterval]);

  return (
    <>
      {/* Ambient Radial Gradient Atmospheric Glows */}
      <div
        className={`fixed inset-0 pointer-events-none -z-20 overflow-hidden ${className}`}
        aria-hidden="true"
        style={{
          backgroundColor: baseColor,
          backgroundImage: `
            radial-gradient(circle at 50% 18%, rgba(6, 182, 212, 0.12) 0%, transparent 60%),
            radial-gradient(circle at 20% 75%, rgba(99, 102, 241, 0.10) 0%, transparent 55%),
            radial-gradient(circle at 85% 65%, rgba(56, 189, 248, 0.08) 0%, transparent 50%)
          `,
        }}
      >
        {/* Soft Vignette Overlay for Crisp Foreground Content Readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(8, 9, 13, 0.85) 100%)",
          }}
        />
      </div>

      {/* 60 FPS Transparent HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-screen h-screen pointer-events-none -z-10 block"
        style={{ background: "transparent" }}
      />
    </>
  );
}
