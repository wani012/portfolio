/**
 * ============================================================================
 * SlowMoRainRipples — High-Performance Aesthetic Rain & Puddle Ripple Engine
 * ============================================================================
 * 
 * Features:
 * - Deep dark atmospheric palette (#08090d base with subtle cyan/indigo glows)
 * - Ultra-thin, calming slow-motion vertical raindrops (opacity 0.15 - 0.45)
 * - Interactive pointer tracking: glides and idle cursor generate natural periodic puddle ripples
 * - Soft neon cyan/sky glow ripples (rgba(56, 189, 248, 0.4) fading to transparent)
 * - Retina/High-DPI sharp rendering with devicePixelRatio
 * - Auto-pruned object pools ensuring zero memory leaks and solid 60 FPS
 * - Zero pointer blocking (pointer-events: none, z-index: -1)
 * 
 * @license MIT
 * @author Furkan Farooq / Antigravity
 */

class SlowMoRainRipples {
  /**
   * @param {Object} options Configuration overrides
   */
  constructor(options = {}) {
    this.options = Object.assign({
      container: document.body,
      canvasId: 'slowmo-rain-canvas',
      zIndex: -1,
      baseColor: '#08090d',
      dropCount: null, // Auto-scaled by resolution if null
      dripInterval: 650, // ms between idle drips at cursor
      showGlows: true,
      showVignette: true,
      maxRipples: 60,
    }, options);

    this.canvas = null;
    this.ctx = null;
    this.glowLayer = null;
    this.dpr = 1;
    this.width = 0;
    this.height = 0;
    this.animationFrameId = null;

    this.raindrops = [];
    this.ripples = [];

    this.pointer = {
      x: -9999,
      y: -9999,
      lastX: -9999,
      lastY: -9999,
      active: false,
      lastDripTime: 0,
      lastMoveTime: 0,
    };

    this.onResize = this.handleResize.bind(this);
    this.onPointerMove = this.handlePointerMove.bind(this);
    this.onPointerLeave = this.handlePointerLeave.bind(this);
    this.onPointerDown = this.handlePointerDown.bind(this);
    this.renderLoop = this.render.bind(this);

    this.init();
  }

  init() {
    if (this.options.showGlows) {
      this.createGlowBackdrop();
    }
    this.createCanvas();
    this.handleResize();
    this.initRaindrops();
    this.bindEvents();
    this.start();
  }

  createGlowBackdrop() {
    let glow = document.getElementById('slowmo-rain-glows');
    if (!glow) {
      glow = document.createElement('div');
      glow.id = 'slowmo-rain-glows';
      glow.setAttribute('aria-hidden', 'true');
      glow.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: ${this.options.zIndex - 1};
        pointer-events: none;
        background-color: ${this.options.baseColor};
        background-image:
          radial-gradient(circle at 50% 18%, rgba(6, 182, 212, 0.12) 0%, transparent 60%),
          radial-gradient(circle at 20% 75%, rgba(99, 102, 241, 0.10) 0%, transparent 55%),
          radial-gradient(circle at 85% 65%, rgba(56, 189, 248, 0.08) 0%, transparent 50%);
        overflow: hidden;
      `;

      if (this.options.showVignette) {
        const vignette = document.createElement('div');
        vignette.style.cssText = `
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(8, 9, 13, 0.85) 100%);
          pointer-events: none;
        `;
        glow.appendChild(vignette);
      }

      this.options.container.appendChild(glow);
    }
    this.glowLayer = glow;
  }

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
      pointer-events: none;
      background: transparent;
      display: block;
    `;

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
  }

  handleResize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.resetTransform?.();
    this.ctx.scale(this.dpr, this.dpr);

    const targetDensity = this.options.dropCount || Math.max(40, Math.min(Math.floor((this.width * this.height) / 14000), 105));
    while (this.raindrops.length < targetDensity) {
      this.raindrops.push(this.createRaindrop(false));
    }
    if (this.raindrops.length > targetDensity) {
      this.raindrops.length = targetDensity;
    }
  }

  initRaindrops() {
    const targetDensity = this.options.dropCount || Math.max(40, Math.min(Math.floor((this.width * this.height) / 14000), 105));
    this.raindrops = [];
    for (let i = 0; i < targetDensity; i++) {
      this.raindrops.push(this.createRaindrop(true));
    }
  }

  createRaindrop(randomY = false) {
    const rand = Math.random();
    const layer = rand < 0.45 ? 0 : (rand < 0.80 ? 1 : 2);

    let speed, length, thickness, opacity, color;

    if (layer === 0) {
      speed = 1.6 + Math.random() * 0.8;
      length = 12 + Math.random() * 8;
      thickness = 0.65;
      opacity = 0.15 + Math.random() * 0.08;
      color = 'rgba(147, 197, 253,';
    } else if (layer === 1) {
      speed = 2.6 + Math.random() * 1.0;
      length = 22 + Math.random() * 10;
      thickness = 0.90;
      opacity = 0.24 + Math.random() * 0.10;
      color = 'rgba(56, 189, 248,';
    } else {
      speed = 3.8 + Math.random() * 1.2;
      length = 34 + Math.random() * 14;
      thickness = 1.20;
      opacity = 0.35 + Math.random() * 0.10;
      color = Math.random() > 0.4 ? 'rgba(56, 189, 248,' : 'rgba(224, 242, 254,';
    }

    const floorY = this.height - (Math.random() * 40 + 5);

    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : -Math.random() * 60 - 20,
      layer,
      speed,
      length,
      thickness,
      opacity,
      color,
      floorY,
    };
  }

  spawnRipple(x, y, maxRadius = 45, initialOpacity = 0.40, growthRate = 0.65) {
    if (this.ripples.length >= this.options.maxRipples) {
      this.ripples.shift();
    }
    this.ripples.push({
      x,
      y,
      radius: 1.5,
      maxRadius,
      growthRate,
      opacity: initialOpacity,
      decay: initialOpacity / (maxRadius / growthRate),
      lineWidth: 1.1,
    });
  }

  spawnConcentricRipples(x, y, count = 2) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (!this.canvas) return;
        this.spawnRipple(x, y, 38 + i * 16, 0.38 - i * 0.08, 0.60 + i * 0.15);
      }, i * 120);
    }
  }

  bindEvents() {
    window.addEventListener('resize', this.onResize, { passive: true });
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('pointerleave', this.onPointerLeave, { passive: true });
    window.addEventListener('pointerdown', this.onPointerDown, { passive: true });
  }

  handlePointerMove(e) {
    this.pointer.lastX = this.pointer.x;
    this.pointer.lastY = this.pointer.y;
    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;
    this.pointer.active = true;
    this.pointer.lastMoveTime = performance.now();

    const dx = this.pointer.x - this.pointer.lastX;
    const dy = this.pointer.y - this.pointer.lastY;
    const dist = Math.hypot(dx, dy);

    const now = performance.now();
    if (dist > 28 && now - this.pointer.lastDripTime > 140) {
      this.spawnRipple(this.pointer.x, this.pointer.y, 32, 0.35, 0.70);
      this.pointer.lastDripTime = now;
    }
  }

  handlePointerLeave() {
    this.pointer.active = false;
    this.pointer.x = -9999;
    this.pointer.y = -9999;
  }

  handlePointerDown(e) {
    this.spawnConcentricRipples(e.clientX, e.clientY, 3);
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const now = performance.now();

    // Natural periodic puddle drip at pointer
    if (this.pointer.active && this.pointer.x > 0 && this.pointer.x < this.width && this.pointer.y > 0 && this.pointer.y < this.height) {
      if (now - this.pointer.lastDripTime > this.options.dripInterval) {
        this.spawnConcentricRipples(this.pointer.x, this.pointer.y, 2);
        this.pointer.lastDripTime = now;
      }
    }

    // 1. Concentric Circular Ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.radius += rip.growthRate;
      rip.opacity -= rip.decay;

      if (rip.opacity <= 0.005 || rip.radius >= rip.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(56, 189, 248, ${rip.opacity.toFixed(3)})`;
      this.ctx.lineWidth = rip.lineWidth;
      this.ctx.stroke();
    }

    // 2. Slow-Motion Raindrops
    for (let i = 0; i < this.raindrops.length; i++) {
      const drop = this.raindrops[i];
      drop.y += drop.speed;

      if (drop.y >= drop.floorY) {
        if (drop.layer >= 1 && Math.random() < 0.65) {
          this.spawnRipple(drop.x, drop.floorY, 18 + drop.layer * 8, 0.28, 0.45);
        }
        drop.y = -Math.random() * 50 - 15;
        drop.x = Math.random() * this.width;
        drop.floorY = this.height - (Math.random() * 40 + 5);
        continue;
      }

      const tailY = drop.y - drop.length;
      const grad = this.ctx.createLinearGradient(drop.x, tailY, drop.x, drop.y);
      grad.addColorStop(0, `${drop.color}0.0)`);
      grad.addColorStop(0.6, `${drop.color}${(drop.opacity * 0.45).toFixed(3)})`);
      grad.addColorStop(1, `${drop.color}${drop.opacity.toFixed(3)})`);

      this.ctx.beginPath();
      this.ctx.moveTo(drop.x, tailY);
      this.ctx.lineTo(drop.x, drop.y);
      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = drop.thickness;
      this.ctx.lineCap = 'round';
      this.ctx.stroke();
    }

    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  }

  start() {
    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(this.renderLoop);
    }
  }

  pause() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  destroy() {
    this.pause();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerleave', this.onPointerLeave);
    window.removeEventListener('pointerdown', this.onPointerDown);

    if (this.canvas?.parentNode) this.canvas.parentNode.removeChild(this.canvas);
    if (this.glowLayer?.parentNode) this.glowLayer.parentNode.removeChild(this.glowLayer);
    this.raindrops = [];
    this.ripples = [];
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SlowMoRainRipples;
} else if (typeof window !== 'undefined') {
  window.SlowMoRainRipples = SlowMoRainRipples;
}
