/**
 * ============================================================================
 * CyberRainBackground — Advanced Interactive Rain & Ripple Canvas Engine
 * ============================================================================
 * 
 * Features:
 * - Ultra-aesthetic dark luxury theme (#08090d base with fluid atmospheric glows)
 * - Multi-layered depth raindrops (foreground, midground, background) with motion blur streaks
 * - 3D ground perspective ripples and micro-droplet splash physics
 * - Smooth interactive mouse repulsion field (aerodynamic deflection)
 * - Interactive click & hover shockwave liquid ripples
 * - High-DPI / Retina display crispness via devicePixelRatio
 * - Constant 60 FPS performance via requestAnimationFrame & memory pooling
 * - Fully responsive with debounce resize handling
 * 
 * @license MIT
 * @author Furkan Farooq / Antigravity
 */

class CyberRainBackground {
  /**
   * @param {Object} options Configuration overrides
   */
  constructor(options = {}) {
    this.options = Object.assign({
      container: document.body,
      canvasId: 'cyber-rain-canvas',
      zIndex: -10,
      backgroundColor: '#08090d',
      glowColors: {
        indigo: 'rgba(99, 102, 241, 0.12)',
        cyan: 'rgba(6, 182, 212, 0.14)',
        violet: 'rgba(139, 92, 246, 0.10)'
      },
      rainDensity: null, // Auto-calculated based on viewport if null
      windAngle: 0.18, // In radians (~10 degrees tilt)
      baseSpeed: 16,
      mouseRepulsionRadius: 140,
      mouseRepulsionStrength: 6.5,
      interactiveClicks: true,
      showVignette: true,
      maxRipples: 75,
      maxSplashes: 150
    }, options);

    this.canvas = null;
    this.ctx = null;
    this.glowContainer = null;
    this.dpr = 1;
    this.width = 0;
    this.height = 0;
    this.animationFrameId = null;

    // Particles & Object Pools
    this.raindrops = [];
    this.ripples = [];
    this.splashes = [];

    // Mouse Tracking
    this.mouse = {
      x: -9999,
      y: -9999,
      prevX: -9999,
      prevY: -9999,
      active: false,
      lastMoveTime: 0
    };

    // Bound listeners for clean destruction
    this.onResize = this.handleResize.bind(this);
    this.onMouseMove = this.handleMouseMove.bind(this);
    this.onMouseLeave = this.handleMouseLeave.bind(this);
    this.onClick = this.handleClick.bind(this);
    this.onTouchMove = this.handleTouchMove.bind(this);
    this.renderLoop = this.render.bind(this);

    this.init();
  }

  /**
   * Initialize DOM elements, canvas context, and event listeners
   */
  init() {
    this.createAtmosphericGlows();
    this.createCanvas();
    this.handleResize();
    this.initRaindrops();
    this.bindEvents();
    this.start();
  }

  /**
   * Creates subtle fluid radial glows & vignette behind canvas
   */
  createAtmosphericGlows() {
    let bg = document.getElementById('cyber-rain-glows');
    if (!bg) {
      bg = document.createElement('div');
      bg.id = 'cyber-rain-glows';
      bg.setAttribute('aria-hidden', 'true');
      bg.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: ${this.options.zIndex - 1};
        pointer-events: none;
        background-color: ${this.options.backgroundColor};
        background-image: 
          radial-gradient(circle at 50% 18%, ${this.options.glowColors.cyan} 0%, transparent 55%),
          radial-gradient(circle at 20% 70%, ${this.options.glowColors.indigo} 0%, transparent 60%),
          radial-gradient(circle at 85% 60%, ${this.options.glowColors.violet} 0%, transparent 50%);
        overflow: hidden;
        transition: background 0.5s ease;
      `;

      if (this.options.showVignette) {
        const vignette = document.createElement('div');
        vignette.style.cssText = `
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(8, 9, 13, 0.82) 100%);
          pointer-events: none;
        `;
        bg.appendChild(vignette);
      }

      this.options.container.appendChild(bg);
    }
    this.glowContainer = bg;
  }

  /**
   * Creates or binds the canvas element
   */
  createCanvas() {
    let canvas = document.getElementById(this.options.canvasId);
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = this.options.canvasId;
      this.options.container.appendChild(canvas);
    }

    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: ${this.options.zIndex};
      pointer-events: none; /* Allows user to interact with all page buttons/links freely */
      background: transparent;
      display: block;
    `;

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
  }

  /**
   * Handle responsive resize with Retina High-DPI backing store scaling
   */
  handleResize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for optimal battery/FPS
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.resetTransform?.();
    this.ctx.scale(this.dpr, this.dpr);

    // Recalculate optimal particle density if not locked
    const calculatedCount = Math.floor((this.width * this.height) / 10000);
    const targetCount = this.options.rainDensity || Math.max(70, Math.min(calculatedCount, 190));

    if (this.raindrops.length !== targetCount) {
      this.adjustRaindropCount(targetCount);
    }
  }

  /**
   * Initialize or scale raindrops array
   */
  initRaindrops() {
    const targetCount = this.options.rainDensity || Math.max(70, Math.min(Math.floor((this.width * this.height) / 10000), 190));
    this.raindrops = [];
    for (let i = 0; i < targetCount; i++) {
      this.raindrops.push(this.createRaindrop(true));
    }
  }

  /**
   * Adjust raindrop pool count seamlessly during resize
   */
  adjustRaindropCount(targetCount) {
    while (this.raindrops.length < targetCount) {
      this.raindrops.push(this.createRaindrop(false));
    }
    if (this.raindrops.length > targetCount) {
      this.raindrops.length = targetCount;
    }
  }

  /**
   * Factory for individual raindrop with 3-tier depth stratification
   */
  createRaindrop(randomY = false) {
    // Depth layer: 0 = Far Background, 1 = Midground, 2 = Foreground
    const rand = Math.random();
    let layer = 1;
    if (rand < 0.40) layer = 0;       // 40% Background (slower, blurred, subtle)
    else if (rand < 0.78) layer = 1;  // 38% Midground (balanced)
    else layer = 2;                  // 22% Foreground (rapid, prominent streaks)

    let speed, length, thickness, opacity, color;

    if (layer === 0) {
      // Far Background
      speed = this.options.baseSpeed * (0.45 + Math.random() * 0.25);
      length = 10 + Math.random() * 8;
      thickness = 0.75 + Math.random() * 0.3;
      opacity = 0.15 + Math.random() * 0.18;
      color = Math.random() > 0.4 ? 'rgba(129, 140, 248,' : 'rgba(56, 189, 248,'; // Soft indigo / sky
    } else if (layer === 1) {
      // Midground
      speed = this.options.baseSpeed * (0.80 + Math.random() * 0.35);
      length = 20 + Math.random() * 12;
      thickness = 1.1 + Math.random() * 0.4;
      opacity = 0.30 + Math.random() * 0.25;
      color = Math.random() > 0.3 ? 'rgba(6, 182, 212,' : 'rgba(147, 197, 253,'; // Electric cyan / ice blue
    } else {
      // Foreground
      speed = this.options.baseSpeed * (1.30 + Math.random() * 0.50);
      length = 34 + Math.random() * 18;
      thickness = 1.6 + Math.random() * 0.6;
      opacity = 0.55 + Math.random() * 0.25;
      color = Math.random() > 0.25 ? 'rgba(0, 243, 255,' : 'rgba(255, 255, 255,'; // Neon cyan / pure white
    }

    // Floor baseline with random perspective variance near the bottom
    const floorY = this.height - (Math.random() * 60 + 5);

    return {
      x: Math.random() * (this.width + 200) - 100,
      y: randomY ? Math.random() * this.height : -Math.random() * 80 - 20,
      layer,
      speed,
      length,
      thickness,
      opacity,
      color,
      floorY,
      windDrift: Math.sin(this.options.windAngle) * speed
    };
  }

  /**
   * Spawns an expanding 3D elliptical ripple ring
   */
  spawnRipple(x, y, layer = 1, intensity = 1.0) {
    if (this.ripples.length >= this.options.maxRipples) {
      this.ripples.shift();
    }

    const maxRadius = (16 + layer * 9 + Math.random() * 8) * intensity;
    const color = layer === 2 ? 'rgba(0, 243, 255,' : 'rgba(6, 182, 212,';

    this.ripples.push({
      x,
      y,
      radiusX: 1,
      radiusY: 0.35, // 3D perspective flattening
      maxRadius,
      growthRate: (0.75 + layer * 0.35) * intensity,
      opacity: (0.45 + layer * 0.18) * Math.min(intensity, 1.2),
      decay: 0.016 / (0.8 + layer * 0.4),
      lineWidth: 0.9 + layer * 0.4,
      color
    });
  }

  /**
   * Spawns micro-droplet splash particles upon surface impact
   */
  spawnSplashes(x, y, layer = 1) {
    const count = layer === 2 ? 3 + Math.floor(Math.random() * 3) : (layer === 1 ? 2 : 1);
    for (let i = 0; i < count; i++) {
      if (this.splashes.length >= this.options.maxSplashes) {
        this.splashes.shift();
      }

      const angle = Math.PI + (Math.random() - 0.5) * 1.5; // Upward arc
      const velocity = (1.5 + Math.random() * 2.5) * (0.8 + layer * 0.3);

      this.splashes.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 1.2,
        gravity: 0.18,
        radius: 0.8 + Math.random() * 0.8,
        opacity: 0.6 + Math.random() * 0.3,
        color: layer === 2 ? 'rgba(0, 243, 255,' : 'rgba(56, 189, 248,'
      });
    }
  }

  /**
   * Trigger intense shockwave ripples from mouse or touch event
   */
  triggerInteractionWave(clientX, clientY, strong = false) {
    const rings = strong ? 3 : 2;
    for (let r = 0; r < rings; r++) {
      setTimeout(() => {
        if (!this.canvas) return;
        this.ripples.push({
          x: clientX,
          y: clientY,
          radiusX: 2,
          radiusY: 0.55,
          maxRadius: strong ? 90 + r * 25 : 55 + r * 15,
          growthRate: 2.2 + r * 0.8,
          opacity: strong ? 0.75 : 0.50,
          decay: 0.018,
          lineWidth: strong ? 1.8 : 1.2,
          color: r % 2 === 0 ? 'rgba(0, 243, 255,' : 'rgba(168, 85, 247,'
        });
      }, r * 80);
    }
  }

  /**
   * Event Listeners
   */
  bindEvents() {
    window.addEventListener('resize', this.onResize, { passive: true });
    window.addEventListener('mousemove', this.onMouseMove, { passive: true });
    window.addEventListener('mouseleave', this.onMouseLeave, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: true });

    if (this.options.interactiveClicks) {
      window.addEventListener('click', this.onClick, { passive: true });
    }
  }

  handleMouseMove(e) {
    this.mouse.prevX = this.mouse.x;
    this.mouse.prevY = this.mouse.y;
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
    this.mouse.active = true;
    this.mouse.lastMoveTime = performance.now();

    // Occasional subtle fluid wake behind fast cursor
    const dx = this.mouse.x - this.mouse.prevX;
    const dy = this.mouse.y - this.mouse.prevY;
    const speed = Math.hypot(dx, dy);

    if (speed > 18 && Math.random() < 0.28) {
      this.spawnRipple(this.mouse.x, this.mouse.y, 1, 0.65);
    }
  }

  handleMouseLeave() {
    this.mouse.active = false;
  }

  handleTouchMove(e) {
    if (e.touches && e.touches.length > 0) {
      this.mouse.x = e.touches[0].clientX;
      this.mouse.y = e.touches[0].clientY;
      this.mouse.active = true;
      this.mouse.lastMoveTime = performance.now();
    }
  }

  handleClick(e) {
    this.triggerInteractionWave(e.clientX, e.clientY, true);
  }

  /**
   * Main Physics & Animation Frame Loop
   */
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const now = performance.now();
    if (now - this.mouse.lastMoveTime > 3000) {
      this.mouse.active = false;
    }

    const repulsionRadius = this.options.mouseRepulsionRadius;
    const repulsionStrength = this.options.mouseRepulsionStrength;

    // -------------------------------------------------------------
    // 1. UPDATE & DRAW EXPANDING RIPPLES
    // -------------------------------------------------------------
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.radiusX += rip.growthRate;
      rip.opacity -= rip.decay;

      if (rip.opacity <= 0 || rip.radiusX >= rip.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.ellipse(
        rip.x,
        rip.y,
        rip.radiusX,
        rip.radiusX * rip.radiusY,
        0,
        0,
        Math.PI * 2
      );
      this.ctx.strokeStyle = `${rip.color}${rip.opacity.toFixed(3)})`;
      this.ctx.lineWidth = rip.lineWidth;
      this.ctx.stroke();
    }

    // -------------------------------------------------------------
    // 2. UPDATE & DRAW SURFACE SPLASHES
    // -------------------------------------------------------------
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const sp = this.splashes[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.vy += sp.gravity;
      sp.opacity -= 0.024;

      if (sp.opacity <= 0 || sp.y > this.height) {
        this.splashes.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `${sp.color}${sp.opacity.toFixed(3)})`;
      this.ctx.fill();
    }

    // -------------------------------------------------------------
    // 3. UPDATE & DRAW RAINDROP STREAKS WITH FLUID MOUSE DEFLECTION
    // -------------------------------------------------------------
    for (let i = 0; i < this.raindrops.length; i++) {
      const drop = this.raindrops[i];

      // Mouse Proximity Aerodynamic Deflection Field
      if (this.mouse.active) {
        const mdx = drop.x - this.mouse.x;
        const mdy = drop.y - this.mouse.y;
        const dist = Math.hypot(mdx, mdy);

        if (dist < repulsionRadius && dist > 1) {
          const force = Math.pow(1 - dist / repulsionRadius, 1.6) * repulsionStrength;
          const nx = mdx / dist;
          const ny = mdy / dist;

          drop.x += nx * force * (drop.layer === 2 ? 1.4 : 1.0);
          drop.y += Math.max(0, ny) * force * 0.6;
        }
      }

      // Normal falling physics
      drop.x += drop.windDrift;
      drop.y += drop.speed;

      // Ground Impact Detection
      if (drop.y >= drop.floorY) {
        this.spawnRipple(drop.x, drop.floorY, drop.layer);
        if (drop.layer >= 1 && Math.random() < 0.65) {
          this.spawnSplashes(drop.x, drop.floorY, drop.layer);
        }

        drop.y = -Math.random() * 60 - 20;
        drop.x = Math.random() * (this.width + 200) - 100;
        drop.floorY = this.height - (Math.random() * 60 + 5);
        continue;
      }

      // Calculate motion blur tail coordinate
      const tailX = drop.x - Math.sin(this.options.windAngle) * drop.length;
      const tailY = drop.y - Math.cos(this.options.windAngle) * drop.length;

      // Draw streak with linear fading tail for realistic motion blur
      const gradient = this.ctx.createLinearGradient(tailX, tailY, drop.x, drop.y);
      gradient.addColorStop(0, `${drop.color}0.0)`);
      gradient.addColorStop(0.5, `${drop.color}${(drop.opacity * 0.45).toFixed(3)})`);
      gradient.addColorStop(1, `${drop.color}${drop.opacity.toFixed(3)})`);

      this.ctx.beginPath();
      this.ctx.moveTo(tailX, tailY);
      this.ctx.lineTo(drop.x, drop.y);
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = drop.thickness;
      this.ctx.lineCap = 'round';
      this.ctx.stroke();
    }

    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  }

  /**
   * Start animation
   */
  start() {
    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(this.renderLoop);
    }
  }

  /**
   * Pause animation
   */
  pause() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Cleanup and remove DOM elements
   */
  destroy() {
    this.pause();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseleave', this.onMouseLeave);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('click', this.onClick);

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    if (this.glowContainer && this.glowContainer.parentNode) {
      this.glowContainer.parentNode.removeChild(this.glowContainer);
    }

    this.raindrops = [];
    this.ripples = [];
    this.splashes = [];
  }
}

// Export for module systems or global window attachment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CyberRainBackground;
} else if (typeof window !== 'undefined') {
  window.CyberRainBackground = CyberRainBackground;
}
