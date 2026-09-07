"use client";

import React, { useEffect, useRef } from "react";

/**
 * CyberRainBackground — Ultra-Aesthetic React & Next.js Component
 * 
 * Drop-in interactive rain canvas with fluid atmospheric glows,
 * multi-layered motion blur raindrops, 3D surface ripples, and mouse repulsion physics.
 * 
 * @param {Object} props
 * @param {string} [props.className] Additional Tailwind or CSS classes for container
 * @param {string} [props.backgroundColor="#08090d"] Deep dark luxury base color
 * @param {number} [props.rainDensity] Optional particle count override
 * @param {number} [props.windAngle=0.18] In radians (~10 degrees slant)
 * @param {number} [props.baseSpeed=16] Base terminal velocity
 * @param {number} [props.mouseRepulsionRadius=140] Distance where cursor deflects rain
 * @param {boolean} [props.interactiveClicks=true] Trigger shockwave ripples on click
 */
export default function CyberRainBackground({
  className = "",
  backgroundColor = "#08090d",
  rainDensity = null,
  windAngle = 0.18,
  baseSpeed = 16,
  mouseRepulsionRadius = 140,
  mouseRepulsionStrength = 6.5,
  interactiveClicks = true,
  showVignette = true,
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

    let raindrops = [];
    let ripples = [];
    let splashes = [];

    const mouse = {
      x: -9999,
      y: -9999,
      prevX: -9999,
      prevY: -9999,
      active: false,
      lastMoveTime: 0,
    };

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

      const calculated = Math.floor((width * height) / 10000);
      const targetCount = rainDensity || Math.max(70, Math.min(calculated, 190));

      while (raindrops.length < targetCount) {
        raindrops.push(createRaindrop(false));
      }
      if (raindrops.length > targetCount) {
        raindrops.length = targetCount;
      }
    };

    const createRaindrop = (randomY = false) => {
      const rand = Math.random();
      let layer = 1;
      if (rand < 0.4) layer = 0;      // 40% Background (slower, blurred)
      else if (rand < 0.78) layer = 1;// 38% Midground (balanced)
      else layer = 2;                 // 22% Foreground (fast, bright)

      let speed, length, thickness, opacity, color;

      if (layer === 0) {
        speed = baseSpeed * (0.45 + Math.random() * 0.25);
        length = 10 + Math.random() * 8;
        thickness = 0.75 + Math.random() * 0.3;
        opacity = 0.15 + Math.random() * 0.18;
        color = Math.random() > 0.4 ? "rgba(129, 140, 248," : "rgba(56, 189, 248,";
      } else if (layer === 1) {
        speed = baseSpeed * (0.80 + Math.random() * 0.35);
        length = 20 + Math.random() * 12;
        thickness = 1.1 + Math.random() * 0.4;
        opacity = 0.30 + Math.random() * 0.25;
        color = Math.random() > 0.3 ? "rgba(6, 182, 212," : "rgba(147, 197, 253,";
      } else {
        speed = baseSpeed * (1.30 + Math.random() * 0.50);
        length = 34 + Math.random() * 18;
        thickness = 1.6 + Math.random() * 0.6;
        opacity = 0.55 + Math.random() * 0.25;
        color = Math.random() > 0.25 ? "rgba(0, 243, 255," : "rgba(255, 255, 255,";
      }

      const floorY = height - (Math.random() * 60 + 5);

      return {
        x: Math.random() * (width + 200) - 100,
        y: randomY ? Math.random() * height : -Math.random() * 80 - 20,
        layer,
        speed,
        length,
        thickness,
        opacity,
        color,
        floorY,
        windDrift: Math.sin(windAngle) * speed,
      };
    };

    const spawnRipple = (x, y, layer = 1, intensity = 1.0) => {
      if (ripples.length >= 75) ripples.shift();
      const maxRadius = (16 + layer * 9 + Math.random() * 8) * intensity;
      const color = layer === 2 ? "rgba(0, 243, 255," : "rgba(6, 182, 212,";

      ripples.push({
        x,
        y,
        radiusX: 1,
        radiusY: 0.35,
        maxRadius,
        growthRate: (0.75 + layer * 0.35) * intensity,
        opacity: (0.45 + layer * 0.18) * Math.min(intensity, 1.2),
        decay: 0.016 / (0.8 + layer * 0.4),
        lineWidth: 0.9 + layer * 0.4,
        color,
      });
    };

    const spawnSplashes = (x, y, layer = 1) => {
      const count = layer === 2 ? 3 + Math.floor(Math.random() * 3) : (layer === 1 ? 2 : 1);
      for (let i = 0; i < count; i++) {
        if (splashes.length >= 150) splashes.shift();
        const angle = Math.PI + (Math.random() - 0.5) * 1.5;
        const velocity = (1.5 + Math.random() * 2.5) * (0.8 + layer * 0.3);

        splashes.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 1.2,
          gravity: 0.18,
          radius: 0.8 + Math.random() * 0.8,
          opacity: 0.6 + Math.random() * 0.3,
          color: layer === 2 ? "rgba(0, 243, 255," : "rgba(56, 189, 248,",
        });
      }
    };

    const triggerInteractionWave = (clientX, clientY, strong = false) => {
      const rings = strong ? 3 : 2;
      for (let r = 0; r < rings; r++) {
        setTimeout(() => {
          ripples.push({
            x: clientX,
            y: clientY,
            radiusX: 2,
            radiusY: 0.55,
            maxRadius: strong ? 90 + r * 25 : 55 + r * 15,
            growthRate: 2.2 + r * 0.8,
            opacity: strong ? 0.75 : 0.50,
            decay: 0.018,
            lineWidth: strong ? 1.8 : 1.2,
            color: r % 2 === 0 ? "rgba(0, 243, 255," : "rgba(168, 85, 247,",
          });
        }, r * 80);
      }
    };

    const handleMouseMove = (e) => {
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      mouse.lastMoveTime = performance.now();

      const dx = mouse.x - mouse.prevX;
      const dy = mouse.y - mouse.prevY;
      if (Math.hypot(dx, dy) > 18 && Math.random() < 0.28) {
        spawnRipple(mouse.x, mouse.y, 1, 0.65);
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
        mouse.lastMoveTime = performance.now();
      }
    };

    const handleClick = (e) => {
      triggerInteractionWave(e.clientX, e.clientY, true);
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const now = performance.now();
      if (now - mouse.lastMoveTime > 3000) {
        mouse.active = false;
      }

      // 1. Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radiusX += rip.growthRate;
        rip.opacity -= rip.decay;

        if (rip.opacity <= 0 || rip.radiusX >= rip.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.ellipse(rip.x, rip.y, rip.radiusX, rip.radiusX * rip.radiusY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `${rip.color}${rip.opacity.toFixed(3)})`;
        ctx.lineWidth = rip.lineWidth;
        ctx.stroke();
      }

      // 2. Splashes
      for (let i = splashes.length - 1; i >= 0; i--) {
        const sp = splashes[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += sp.gravity;
        sp.opacity -= 0.024;

        if (sp.opacity <= 0 || sp.y > height) {
          splashes.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${sp.color}${sp.opacity.toFixed(3)})`;
        ctx.fill();
      }

      // 3. Raindrops
      for (let i = 0; i < raindrops.length; i++) {
        const drop = raindrops[i];

        if (mouse.active) {
          const mdx = drop.x - mouse.x;
          const mdy = drop.y - mouse.y;
          const dist = Math.hypot(mdx, mdy);

          if (dist < mouseRepulsionRadius && dist > 1) {
            const force = Math.pow(1 - dist / mouseRepulsionRadius, 1.6) * mouseRepulsionStrength;
            drop.x += (mdx / dist) * force * (drop.layer === 2 ? 1.4 : 1.0);
            drop.y += Math.max(0, (mdy / dist)) * force * 0.6;
          }
        }

        drop.x += drop.windDrift;
        drop.y += drop.speed;

        if (drop.y >= drop.floorY) {
          spawnRipple(drop.x, drop.floorY, drop.layer);
          if (drop.layer >= 1 && Math.random() < 0.65) {
            spawnSplashes(drop.x, drop.floorY, drop.layer);
          }
          drop.y = -Math.random() * 60 - 20;
          drop.x = Math.random() * (width + 200) - 100;
          drop.floorY = height - (Math.random() * 60 + 5);
          continue;
        }

        const tailX = drop.x - Math.sin(windAngle) * drop.length;
        const tailY = drop.y - Math.cos(windAngle) * drop.length;

        const grad = ctx.createLinearGradient(tailX, tailY, drop.x, drop.y);
        grad.addColorStop(0, `${drop.color}0.0)`);
        grad.addColorStop(0.5, `${drop.color}${(drop.opacity * 0.45).toFixed(3)})`);
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

    // Initial setup
    handleResize();
    const count = rainDensity || Math.max(70, Math.min(Math.floor((width * height) / 10000), 190));
    raindrops = Array.from({ length: count }, () => createRaindrop(true));

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    if (interactiveClicks) {
      window.addEventListener("click", handleClick, { passive: true });
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      if (interactiveClicks) {
        window.removeEventListener("click", handleClick);
      }
    };
  }, [
    backgroundColor,
    rainDensity,
    windAngle,
    baseSpeed,
    mouseRepulsionRadius,
    mouseRepulsionStrength,
    interactiveClicks,
  ]);

  return (
    <>
      {/* Deep Luxury Atmospheric Glows & Vignette Layer */}
      <div
        className={`fixed inset-0 pointer-events-none -z-20 overflow-hidden ${className}`}
        aria-hidden="true"
        style={{
          backgroundColor,
          backgroundImage: `
            radial-gradient(circle at 50% 18%, rgba(6, 182, 212, 0.14) 0%, transparent 55%),
            radial-gradient(circle at 20% 70%, rgba(99, 102, 241, 0.12) 0%, transparent 60%),
            radial-gradient(circle at 85% 60%, rgba(139, 92, 246, 0.10) 0%, transparent 50%)
          `,
        }}
      >
        {showVignette && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(8, 9, 13, 0.82) 100%)",
            }}
          />
        )}
      </div>

      {/* High-Performance Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-screen h-screen pointer-events-none -z-10 block"
        style={{ background: "transparent" }}
      />
    </>
  );
}
