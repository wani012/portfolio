import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// ── 1. REAL PROJECTS DATA (All using About Me Photo as Requested) ───────────
const ABOUT_PHOTO_SRC = './furu123_transparent.png';

const projects = [
  {
    id: 1,
    title: "FURU Zero Kaata Pro",
    tagline: "Tournament System • Minimax AI",
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
    tagline: "Luxury Kashmiri Fashion & WhatsApp Commerce",
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
    tagline: "Digital Seva & J&K Vacancy Portal",
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

// ── 2. CONTAINER & SCENE INITIALIZATION ─────────────────────────────────────
const container = document.getElementById('three-carousel-container');

if (container) {
  const count = projects.length;
  let width = container.clientWidth || 800;
  let height = container.clientHeight || 560;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 5.2);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.zIndex = '1';
  renderer.domElement.style.pointerEvents = 'auto';
  container.appendChild(renderer.domElement);

  // ── 3. HIGH-END STUDIO LIGHTING ────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0x00f3ff, 2.4);
  dirLight1.position.set(5, 7, 8);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xa855f7, 2.0);
  dirLight2.position.set(-5, -5, 8);
  scene.add(dirLight2);

  const pointLight = new THREE.PointLight(0xffffff, 1.8, 25);
  pointLight.position.set(0, 0.5, 6);
  scene.add(pointLight);

  // ── 4. CAROUSEL GROUP ─────────────────────────────────────────────────────
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

  // ── 5. CARD TEXTURE GENERATION (About Me Photo Background + Cyber Glass) ──
  function createCardTexture(proj, imgElement) {
    const canvas = document.createElement('canvas');
    canvas.width = 680;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');

    // Rounded card clipping boundary
    roundRectPath(ctx, 0, 0, canvas.width, canvas.height, 28);
    ctx.clip();

    // Dark base background
    ctx.fillStyle = '#060a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw About Me photo with proper cover aspect ratio (never stretched!)
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

    // High-Contrast Cyberpunk Glass Gradient Overlay (Ensures Text is 100% Crisp & Readable while photo shines through)
    const overlayGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    overlayGrad.addColorStop(0, 'rgba(4, 9, 22, 0.45)');
    overlayGrad.addColorStop(0.45, 'rgba(4, 9, 22, 0.58)');
    overlayGrad.addColorStop(1, 'rgba(2, 6, 16, 0.84)');
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top Glowing Neon Accent Line
    const neonGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    neonGrad.addColorStop(0, 'transparent');
    neonGrad.addColorStop(0.5, proj.accent);
    neonGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = neonGrad;
    ctx.fillRect(0, 0, canvas.width, 6);

    // Status Badge Top Left
    ctx.fillStyle = proj.accent + '22';
    ctx.strokeStyle = proj.accent + 'aa';
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, 32, 28, 136, 28, 14);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = proj.accent;
    ctx.textAlign = 'center';
    ctx.fillText(proj.badge.toUpperCase(), 100, 46);

    // Project Title (Crisp, High Contrast, Straight)
    ctx.textAlign = 'left';
    ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = proj.accent;
    ctx.shadowBlur = 12;
    ctx.fillText(proj.title, 32, 106);
    ctx.shadowBlur = 0;

    // Subtitle / Tagline
    ctx.font = '15px monospace';
    ctx.fillStyle = proj.accent;
    ctx.fillText(proj.tagline, 32, 140);

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(32, 168);
    ctx.lineTo(canvas.width - 32, 168);
    ctx.stroke();

    // Tech Stack Badges / Pills
    let tagX = 32;
    proj.tags.forEach((tag) => {
      ctx.font = '12px monospace';
      const textWidth = ctx.measureText(tag).width;
      const pillWidth = textWidth + 22;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
      ctx.lineWidth = 1;
      roundRectPath(ctx, tagX, 192, pillWidth, 26, 13);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f1f5f9';
      ctx.fillText(tag, tagX + 11, 209);
      tagX += pillWidth + 8;
    });

    // Bottom Action Prompt Button on Card
    ctx.fillStyle = proj.accent + '25';
    ctx.strokeStyle = proj.accent + '88';
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, 32, canvas.height - 54, 250, 32, 16);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('▶ CLICK TO EXPLORE LIVE APP', 46, canvas.height - 34);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // Pre-load About Me Photo
  const aboutImage = new Image();
  aboutImage.crossOrigin = 'anonymous';
  aboutImage.src = ABOUT_PHOTO_SRC;

  // ── 6. CREATE 3D CARDS ────────────────────────────────────────────────────
  const cardWidth = 2.8;
  const cardHeight = 1.73;

  projects.forEach((proj, i) => {
    const geometry = new THREE.PlaneGeometry(cardWidth, cardHeight, 16, 16);
    const canvasTexture = createCardTexture(proj, null);

    const cardMaterial = new THREE.MeshStandardMaterial({
      map: canvasTexture,
      roughness: 0.25,
      metalness: 0.15,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, cardMaterial);

    // Glowing Neon Edge Wireframe
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: proj.accentHex,
      transparent: true,
      opacity: 0.9,
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

  // ── 7. AMBIENT FLOATING PARTICLES ─────────────────────────────────────────
  const particlesCount = 200;
  const particlePositions = new Float32Array(particlesCount * 3);
  const particleColors = new Float32Array(particlesCount * 3);

  const colCyan = new THREE.Color(0x00f3ff);
  const colPurple = new THREE.Color(0xa855f7);

  for (let i = 0; i < particlesCount; i++) {
    particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 16;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 9;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 12;

    const mixedColor = colCyan.clone().lerp(colPurple, Math.random());
    particleColors[i * 3 + 0] = mixedColor.r;
    particleColors[i * 3 + 1] = mixedColor.g;
    particleColors[i * 3 + 2] = mixedColor.b;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  // ── 8. SMOOTH CAROUSEL NAVIGATION & PHYSICS ───────────────────────────────
  let targetIndex = 0;
  let currentIndex = 0;
  let isDragging = false;
  let startX = 0;
  let pointerTotalDelta = 0;

  // Trackpad / Wheel scroll (Discrete smooth snap per project)
  let wheelTimeout = null;
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (wheelTimeout) return;

    if (e.deltaY > 20 || e.deltaX > 20) {
      targetIndex = (targetIndex + 1) % count;
      wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 280);
    } else if (e.deltaY < -20 || e.deltaX < -20) {
      targetIndex = (targetIndex - 1 + count) % count;
      wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 280);
    }
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

    if (deltaX < -65) {
      targetIndex = (targetIndex + 1) % count;
      startX = e.clientX;
    } else if (deltaX > 65) {
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

    if (deltaX < -50) {
      targetIndex = (targetIndex + 1) % count;
      startX = e.touches[0].clientX;
    } else if (deltaX > 50) {
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

  // ── 9. HUD DOM ELEMENTS UPDATE ────────────────────────────────────────────
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

  // ── 10. CURVED STAGE LAYOUT & WEIGHTLESS LEVITATION LOOP ──────────────────
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Smooth inertia interpolation toward target active card
    currentIndex += (targetIndex - currentIndex) * 0.10;

    // Ambient particles gentle drift
    if (particleSystem) {
      particleSystem.rotation.y = time * 0.035;
      particleSystem.rotation.x = Math.sin(time * 0.025) * 0.04;
    }

    const isMobile = width < 640;
    const spacingX = isMobile ? 2.1 : 2.7;

    cardMeshes.forEach((mesh) => {
      const idx = mesh.userData.index;

      // Calculate circular offset relative to active card
      let diff = idx - currentIndex;
      // Handle modular wrapping around 5 cards
      while (diff > count / 2) diff -= count;
      while (diff < -count / 2) diff += count;

      // Absolute distance from center
      const absDiff = Math.abs(diff);

      // Target Coordinates (Center card is SEEDHA at x=0, z=0.5, rotY=0)
      const targetX = diff * spacingX;
      const targetZ = -Math.pow(absDiff, 1.35) * 0.75 + 0.5;

      // Gentle perspective angle for side cards (Max 22 degrees, NO tilt on X or Z!)
      const targetRotY = -Math.sign(diff) * Math.min(absDiff * 0.38, 0.45);

      // Scale: Center card is 100%, side cards gracefully scale down
      const targetScale = Math.max(1.0 - absDiff * 0.16, 0.65);

      // Subtle weightless anti-gravity floating (ONLY Y translation, ZERO rotational wobble!)
      const floatY = Math.sin(time * 1.5 + idx * 1.2) * 0.07;

      // Apply coordinates smoothly
      mesh.position.x += (targetX - mesh.position.x) * 0.14;
      mesh.position.y = floatY;
      mesh.position.z += (targetZ - mesh.position.z) * 0.14;

      // Rotation: Strictly SEEDHA (Upright)! rotation.x = 0, rotation.z = 0!
      mesh.rotation.x = 0;
      mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.14;
      mesh.rotation.z = 0;

      // Uniform Scale
      mesh.scale.set(targetScale, targetScale, targetScale);
    });

    // Update active HUD to nearest center card
    const nearestIndex = ((Math.round(currentIndex) % count) + count) % count;
    updateHud(projects[nearestIndex], nearestIndex);

    renderer.render(scene, camera);
  }

  // Initial HUD sync
  updateHud(projects[0], 0);
  animate();

  // ── 11. RESPONSIVE RESIZE LISTENER ────────────────────────────────────────
  function handleResize() {
    if (!container) return;
    width = container.clientWidth;
    height = container.clientHeight;

    camera.aspect = width / height;
    camera.position.z = width < 640 ? 5.8 : 5.2;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  }

  window.addEventListener('resize', handleResize);
  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(container);
}
