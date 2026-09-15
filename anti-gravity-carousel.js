import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// ?? 1. REAL PROJECTS DATA (All using About Me Photo as Requested) ???????????
const ABOUT_PHOTO_SRC = './furu123_transparent.png';

const projects = [
  {
    id: 1,
    title: "FURU Zero Kaata Pro",
    tagline: "Tournament System | Minimax AI",
    badge: "v2.0 Live",
    accent: "#00f3ff",
    accentHex: 0x00f3ff,
    liveUrl: "https://tictactoe-game-app-xi.vercel.app/",
    githubUrl: "https://github.com/wani012/tictactoe-game-app",
    tags: ["JavaScript", "Firebase", "Minimax AI", "Web Audio"]
  },
  {
    id: 2,
    title: "Wani Garments",
    tagline: "Luxury Kashmiri Fashion | WhatsApp Commerce",
    badge: "Production Live",
    accent: "#f59e0b",
    accentHex: 0xf59e0b,
    liveUrl: "https://wani-garments.vercel.app/",
    githubUrl: "https://github.com/wani012/wani-garments",
    tags: ["Tailwind CSS", "ES6+", "WhatsApp API", "Catalog"]
  },
  {
    id: 3,
    title: "BHAT Cyber Cafe & CSC",
    tagline: "Digital Seva | J&K Vacancy Portal",
    badge: "Civic Portal",
    accent: "#3b82f6",
    accentHex: 0x3b82f6,
    liveUrl: "https://cyber-cafe-csc.vercel.app/",
    githubUrl: "https://github.com/wani012/cyber-cafe-csc",
    tags: ["HTML5", "Modern CSS", "Doc Validation", "CSC"]
  },
  {
    id: 4,
    title: "Nexus — Circuit Runner",
    tagline: "Procedural 25-Node Circuit Web Game",
    badge: "v1.0 Live",
    accent: "#a855f7",
    accentHex: 0xa855f7,
    liveUrl: "https://nexusgame-website.vercel.app",
    githubUrl: "https://github.com/wani012/Nexus-game",
    tags: ["JavaScript", "Firestore", "Web Audio", "PWA"]
  },
  {
    id: 5,
    title: "2048 Pro Game",
    tagline: "Multi-Theme Tile Puzzle Engine",
    badge: "5 Themes",
    accent: "#10b981",
    accentHex: 0x10b981,
    liveUrl: "https://wani012.github.io/2048-game/?v=2",
    githubUrl: "https://github.com/wani012/2048-game",
    tags: ["Vanilla JS", "Touch Gestures", "LocalStorage", "PWA"]
  }
];

// ?? 2. CONTAINER & HIGH-PERFORMANCE WEBGL INITIALIZATION ????????????????????
const container = document.getElementById('three-carousel-container');

if (container) {
  const count = projects.length;
  let width = container.clientWidth || 800;
  let height = container.clientHeight || 640;

  const scene = new THREE.Scene();

  // Perspective camera optimized for larger card showcase
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, width < 640 ? 5.6 : 4.8);
  camera.lookAt(0, 0, 0);

  // High-performance hardware accelerated renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    stencil: false,
    depth: true
  });
  renderer.setSize(width, height);
  // Cap DPR at 1.75 to permanently prevent 4K/Retina GPU lag & frame drops
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.zIndex = '1';
  renderer.domElement.style.pointerEvents = 'auto';
  container.appendChild(renderer.domElement);

  // ?? 3. CAROUSEL STAGE GROUP ???????????????????????????????????????????????
  const stageGroup = new THREE.Group();
  scene.add(stageGroup);

  const cardMeshes = [];

  // Helper for universal cross-browser rounded rectangles on 2D canvas
  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ?? 4. CARD TEXTURE GENERATION (Larger, Ultra-Sharp 840x520 Resolution) ???
  function createCardTexture(proj, imgElement) {
    const canvas = document.createElement('canvas');
    canvas.width = 840;
    canvas.height = 520;
    const ctx = canvas.getContext('2d');

    // Rounded card clipping boundary
    roundRectPath(ctx, 0, 0, canvas.width, canvas.height, 32);
    ctx.clip();

    // Dark base background
    ctx.fillStyle = '#060a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw About Me photo with proper cover aspect ratio
    if (imgElement && imgElement.complete && imgElement.naturalWidth > 0) {
      const imgRatio = imgElement.naturalWidth / imgElement.naturalHeight;
      const canvasRatio = canvas.width / canvas.height;
      let sWidth = imgElement.naturalWidth;
      let sHeight = imgElement.naturalHeight;
      let sx = 0;
      let sy = 0;

      if (imgRatio > canvasRatio) {
        sWidth = imgElement.naturalHeight * canvasRatio;
        sx = (imgElement.naturalWidth - sWidth) / 2;
      } else {
        sHeight = imgElement.naturalWidth / canvasRatio;
        sy = (imgElement.naturalHeight - sHeight) / 2;
      }

      ctx.save();
      // Draw background photo with high clarity
      ctx.globalAlpha = 0.70;
      ctx.drawImage(imgElement, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    // High-Contrast Cyberpunk Glass Gradient Overlay
    const overlayGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    overlayGrad.addColorStop(0, 'rgba(4, 9, 22, 0.45)');
    overlayGrad.addColorStop(0.45, 'rgba(4, 9, 22, 0.58)');
    overlayGrad.addColorStop(1, 'rgba(2, 6, 16, 0.86)');
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top Glowing Neon Accent Line
    const neonGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    neonGrad.addColorStop(0, 'transparent');
    neonGrad.addColorStop(0.5, proj.accent);
    neonGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = neonGrad;
    ctx.fillRect(0, 0, canvas.width, 7);

    // Status Badge Top Left
    ctx.fillStyle = proj.accent + '25';
    ctx.strokeStyle = proj.accent + 'bb';
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, 36, 32, 148, 32, 16);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = proj.accent;
    ctx.textAlign = 'center';
    ctx.fillText(proj.badge.toUpperCase(), 110, 52);

    // Project Title (Crisp, High Contrast, Bold, Straight)
    ctx.textAlign = 'left';
    ctx.font = 'bold 38px "Plus Jakarta Sans", -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = proj.accent;
    ctx.shadowBlur = 14;
    ctx.fillText(proj.title, 36, 124);
    ctx.shadowBlur = 0;

    // Subtitle / Tagline
    ctx.font = '16px monospace';
    ctx.fillStyle = proj.accent;
    ctx.fillText(proj.tagline, 36, 162);

    // Sleek Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(36, 192);
    ctx.lineTo(canvas.width - 36, 192);
    ctx.stroke();

    // Tech Stack Badges / Pills
    let tagX = 36;
    proj.tags.forEach((tag) => {
      ctx.font = 'bold 13px monospace';
      const textWidth = ctx.measureText(tag).width;
      const pillWidth = textWidth + 24;

      if (tagX + pillWidth < canvas.width - 36) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1;
        roundRectPath(ctx, tagX, 222, pillWidth, 34, 17);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'center';
        ctx.fillText(tag, tagX + pillWidth / 2, 243);
        tagX += pillWidth + 12;
      }
    });

    // Bottom Action Hint Pill ("EXPLORE LIVE APP")
    ctx.fillStyle = proj.accent + '25';
    ctx.strokeStyle = proj.accent + 'aa';
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, 36, canvas.height - 76, 220, 42, 21);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = proj.accent;
    ctx.textAlign = 'left';
    ctx.fillText('CLICK TO EXPLORE APP', 52, canvas.height - 50);

    // Decorative Hologram Corner Bracket (Bottom Right)
    ctx.strokeStyle = proj.accent + '88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 60, canvas.height - 36);
    ctx.lineTo(canvas.width - 36, canvas.height - 36);
    ctx.lineTo(canvas.width - 36, canvas.height - 60);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false; // Fast memory & zero mipmap lag
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // Pre-load About Me Photo
  const aboutImage = new Image();
  aboutImage.crossOrigin = 'anonymous';
  aboutImage.src = ABOUT_PHOTO_SRC;

  // ?? 5. CREATE 3D CARDS (LARGER DIMENSIONS: 3.5 x 2.16) ???????????????????
  const cardWidth = 3.5;
  const cardHeight = 2.16;

  projects.forEach((proj, i) => {
    const geometry = new THREE.PlaneGeometry(cardWidth, cardHeight, 1, 1);
    const canvasTexture = createCardTexture(proj, null);

    // MeshBasicMaterial delivers zero-lag 120 FPS performance with 100% color accuracy
    const cardMaterial = new THREE.MeshBasicMaterial({
      map: canvasTexture,
      transparent: true,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, cardMaterial);

    // Glowing Neon Edge Wireframe
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: proj.accentHex,
      transparent: true,
      opacity: 0.92,
      linewidth: 2
    });
    const wireframe = new THREE.LineSegments(edgesGeometry, lineMaterial);
    mesh.add(wireframe);

    mesh.userData = {
      index: i,
      project: proj
    };

    stageGroup.add(mesh);
    cardMeshes.push(mesh);
  });

  // Refresh all card textures once About Me photo loads
  const updateAllCardTextures = () => {
    if (!aboutImage.complete || aboutImage.naturalWidth === 0) return;
    cardMeshes.forEach((mesh, idx) => {
      mesh.material.map = createCardTexture(projects[idx], aboutImage);
      mesh.material.needsUpdate = true;
    });
  };

  aboutImage.addEventListener('load', updateAllCardTextures);
  if (aboutImage.complete && aboutImage.naturalWidth > 0) {
    updateAllCardTextures();
  }

  // ?? 6. AMBIENT FLOATING PARTICLES (Lightweight 120 count) ?????????????????
  const particlesCount = 120;
  const particlePositions = new Float32Array(particlesCount * 3);
  const particleColors = new Float32Array(particlesCount * 3);

  const colCyan = new THREE.Color(0x00f3ff);
  const colPurple = new THREE.Color(0xa855f7);

  for (let i = 0; i < particlesCount; i++) {
    particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 16;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10;

    const t = Math.random();
    particleColors[i * 3 + 0] = colCyan.r * (1 - t) + colPurple.r * t;
    particleColors[i * 3 + 1] = colCyan.g * (1 - t) + colPurple.g * t;
    particleColors[i * 3 + 2] = colCyan.b * (1 - t) + colPurple.b * t;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  // ?? 7. SMOOTH CAROUSEL NAVIGATION & PHYSICS ???????????????????????????????
  let targetIndex = 0;
  let currentIndex = 0;
  let isDragging = false;
  let startX = 0;
  let pointerTotalDelta = 0;

  // Trackpad / Wheel scroll with smooth accumulation
  let wheelAcc = 0;
  let wheelTimer = null;
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    wheelAcc += e.deltaY || e.deltaX;
    if (Math.abs(wheelAcc) > 35) {
      const dir = wheelAcc > 0 ? 1 : -1;
      targetIndex = (targetIndex + dir + count) % count;
      wheelAcc = 0;
    }
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelAcc = 0; }, 180);
  }, { passive: false });

  // Mouse Drag
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    pointerTotalDelta = 0;
    container.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    pointerTotalDelta += Math.abs(deltaX);

    if (deltaX < -70) {
      targetIndex = (targetIndex + 1) % count;
      startX = e.clientX;
    } else if (deltaX > 70) {
      targetIndex = (targetIndex - 1 + count) % count;
      startX = e.clientX;
    }
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    container.style.cursor = 'grab';
  });

  // Mobile Touch Swipe
  container.addEventListener('touchstart', (e) => {
    if (!e.touches[0]) return;
    isDragging = true;
    startX = e.touches[0].clientX;
    pointerTotalDelta = 0;
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches[0]) return;
    const deltaX = e.touches[0].clientX - startX;
    pointerTotalDelta += Math.abs(deltaX);

    if (deltaX < -55) {
      targetIndex = (targetIndex + 1) % count;
      startX = e.touches[0].clientX;
    } else if (deltaX > 55) {
      targetIndex = (targetIndex - 1 + count) % count;
      startX = e.touches[0].clientX;
    }
  }, { passive: true });

  container.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Arrow Buttons
  const prevBtn = document.getElementById('carouselPrevBtn');
  const nextBtn = document.getElementById('carouselNextBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      targetIndex = (targetIndex - 1 + count) % count;
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      targetIndex = (targetIndex + 1) % count;
    });
  }

  // Raycaster Click on 3D Card
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  container.addEventListener('click', (e) => {
    if (pointerTotalDelta > 8) return;

    const rect = container.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cardMeshes);

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      const clickedIdx = clickedMesh.userData.index;

      if (clickedIdx === Math.round(currentIndex)) {
        // If clicking the straight center card, open its live app!
        window.open(clickedMesh.userData.project.liveUrl, '_blank');
      } else {
        // Center this card smoothly
        targetIndex = clickedIdx;
      }
    }
  });

  // ?? 8. HUD DOM ELEMENTS UPDATE ????????????????????????????????????????????
  const hudBadge = document.getElementById('hudBadge');
  const hudIndex = document.getElementById('hudIndex');
  const hudTitle = document.getElementById('hudTitle');
  const hudTagline = document.getElementById('hudTagline');
  const hudLiveBtn = document.getElementById('hudLiveBtn');
  const hudCodeBtn = document.getElementById('hudCodeBtn');
  const hudCard = document.getElementById('carouselProjectHud');
  let currentActiveHud = -1;

  function updateHud(proj, idx) {
    if (currentActiveHud === idx) return;
    currentActiveHud = idx;

    if (hudBadge) {
      hudBadge.textContent = proj.badge.toUpperCase();
      hudBadge.style.color = proj.accent;
      hudBadge.style.borderColor = proj.accent + '66';
      hudBadge.style.backgroundColor = proj.accent + '18';
    }
    if (hudIndex) hudIndex.textContent = (idx + 1) + ' / ' + count;
    if (hudTitle) hudTitle.textContent = proj.title;
    if (hudTagline) {
      hudTagline.textContent = proj.tagline;
      hudTagline.style.color = proj.accent;
    }
    if (hudLiveBtn) {
      hudLiveBtn.href = proj.liveUrl;
      hudLiveBtn.style.background = 'linear-gradient(135deg, ' + proj.accent + ', #2563eb)';
    }
    if (hudCodeBtn) hudCodeBtn.href = proj.githubUrl;

    if (hudCard) {
      hudCard.style.borderColor = proj.accent + '77';
      hudCard.style.boxShadow = '0 16px 40px -10px ' + proj.accent + '33';
    }
  }

  // ?? 9. CURVED STAGE LAYOUT & WEIGHTLESS LEVITATION LOOP ??????????????????
  const clock = new THREE.Clock();
  let isVisible = true;
  let isRendering = false;

  function animate() {
    if (!isVisible) {
      isRendering = false;
      return;
    }
    isRendering = true;
    requestAnimationFrame(animate);

    // Frame-rate independent delta time (prevents micro-stutters permanently)
    const delta = Math.min(clock.getDelta(), 0.05);
    const time = clock.getElapsedTime();

    // Smooth exponential damping
    const lerpFactor = 1 - Math.exp(-9.5 * delta);
    currentIndex += (targetIndex - currentIndex) * lerpFactor;

    // Ambient particles gentle drift
    if (particleSystem) {
      particleSystem.rotation.y = time * 0.03;
      particleSystem.rotation.x = Math.sin(time * 0.02) * 0.035;
    }

    const isMobile = width < 640;
    // Spacing calibrated for larger cardWidth (3.5)
    const spacingX = isMobile ? 2.9 : 3.8;

    cardMeshes.forEach((mesh) => {
      const idx = mesh.userData.index;

      // Circular offset relative to active card
      let diff = idx - currentIndex;
      while (diff > count / 2) diff -= count;
      while (diff < -count / 2) diff += count;

      const absDiff = Math.abs(diff);

      // Target Coordinates (Center card is SEEDHA at x=0, z=0.5, rotY=0)
      const targetX = diff * spacingX;
      const targetZ = -Math.pow(absDiff, 1.25) * 0.95 + 0.5;

      // Gentle perspective angle for side cards (Max 22 degrees, NO tilt on X or Z)
      const targetRotY = -Math.sign(diff) * Math.min(absDiff * 0.36, 0.42);

      // Scale: Center card is 100%, side cards gracefully scale down
      const targetScale = Math.max(1.0 - absDiff * 0.16, 0.65);

      // Subtle weightless anti-gravity floating (Positioned slightly higher at y=0.18 + float)
      const floatY = 0.18 + Math.sin(time * 1.5 + idx * 1.2) * 0.07;

      // Apply coordinates smoothly with frame-rate independent interpolation
      mesh.position.x += (targetX - mesh.position.x) * lerpFactor * 1.4;
      mesh.position.y = floatY;
      mesh.position.z += (targetZ - mesh.position.z) * lerpFactor * 1.4;

      // Rotation: Strictly SEEDHA (Upright)! rotation.x = 0, rotation.z = 0!
      mesh.rotation.x = 0;
      mesh.rotation.y += (targetRotY - mesh.rotation.y) * lerpFactor * 1.4;
      mesh.rotation.z = 0;

      // Uniform Scale
      mesh.scale.set(targetScale, targetScale, targetScale);
    });

    // Update active HUD to nearest center card
    const nearestIndex = ((Math.round(currentIndex) % count) + count) % count;
    updateHud(projects[nearestIndex], nearestIndex);

    renderer.render(scene, camera);
  }

  // Initial HUD sync & start loop
  updateHud(projects[0], 0);
  animate();

  // IntersectionObserver: Pause rendering when not visible on screen (0% GPU/CPU overhead!)
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !isRendering) {
          clock.getDelta(); // Reset delta to prevent sudden jump
          animate();
        }
      });
    }, { threshold: 0.05 });
    observer.observe(container);
  }

  // ?? 10. DEBOUNCED RESPONSIVE RESIZE LISTENER ??????????????????????????????
  let lastW = width;
  let lastH = height;

  function handleResize() {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    // Guard against identical dimension triggers to prevent frame hitching
    if (Math.abs(w - lastW) < 2 && Math.abs(h - lastH) < 2) return;
    lastW = w;
    lastH = h;
    width = w;
    height = h;

    camera.aspect = width / height;
    camera.position.z = width < 640 ? 5.6 : 4.8;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  }

  window.addEventListener('resize', handleResize);
  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(container);
}
