import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// ── 1. REAL PROJECTS DATA ───────────────────────────────────────────────────
const projects = [
  {
    id: 1,
    title: "FURU Zero Kaata Pro",
    tagline: "Tournament Engine • Minimax AI",
    badge: "v2.0 Live",
    img: "./furu123.png",
    accent: "#00f3ff",
    accentHex: 0x00f3ff,
    liveUrl: "https://tictactoe-game-app-xi.vercel.app/",
    githubUrl: "https://github.com/wani012/tictactoe-game-app",
    tags: ["JavaScript", "Firebase", "Minimax AI", "Web Audio"]
  },
  {
    id: 2,
    title: "Wani Garments",
    tagline: "Luxury Kashmiri Fashion & WhatsApp Store",
    badge: "Production Live",
    img: "./profile.jpg",
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
    img: "./profile_portrait.jpg",
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
    img: "./furu123_transparent.png",
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
    img: "./furu123.png",
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

  // Carousel Radius and Camera
  let radius = width < 640 ? 3.0 : 3.4;
  const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
  camera.position.set(0, 0.15, radius + (width < 640 ? 2.5 : 2.2));
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

  // ── 3. LIGHTING ────────────────────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0x00f3ff, 2.2);
  dirLight1.position.set(5, 6, 8);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xa855f7, 1.8);
  dirLight2.position.set(-5, -4, 8);
  scene.add(dirLight2);

  const pointLight = new THREE.PointLight(0xffffff, 1.5, 20);
  pointLight.position.set(0, 0, radius + 2);
  scene.add(pointLight);

  // ── 4. CAROUSEL GROUP ─────────────────────────────────────────────────────
  const carouselGroup = new THREE.Group();
  scene.add(carouselGroup);

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

  // ── 5. CARD TEXTURE GENERATION ────────────────────────────────────────────
  function createCardTexture(proj, imgElement) {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');

    // Rounded background clip
    roundRectPath(ctx, 0, 0, canvas.width, canvas.height, 28);
    ctx.clip();

    // Deep glass background
    const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGrad.addColorStop(0, '#0a1020');
    bgGrad.addColorStop(1, '#020610');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw project preview image (semi-transparent for cyber HUD look)
    if (imgElement && imgElement.complete && imgElement.naturalWidth > 0) {
      ctx.globalAlpha = 0.38;
      ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;
    }

    // Top Glowing Neon Line
    const neonGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    neonGrad.addColorStop(0, 'transparent');
    neonGrad.addColorStop(0.5, proj.accent);
    neonGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = neonGrad;
    ctx.fillRect(0, 0, canvas.width, 6);

    // Status Badge Top Left
    ctx.fillStyle = proj.accent + '22';
    ctx.strokeStyle = proj.accent + '88';
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, 32, 28, 130, 28, 14);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = proj.accent;
    ctx.textAlign = 'center';
    ctx.fillText(proj.badge.toUpperCase(), 97, 46);

    // Project Title
    ctx.textAlign = 'left';
    ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = proj.accent;
    ctx.shadowBlur = 10;
    ctx.fillText(proj.title, 32, 102);
    ctx.shadowBlur = 0;

    // Subtitle / Tagline
    ctx.font = '15px monospace';
    ctx.fillStyle = proj.accent;
    ctx.fillText(proj.tagline, 32, 134);

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(32, 162);
    ctx.lineTo(canvas.width - 32, 162);
    ctx.stroke();

    // Tech Tags Pills
    let tagX = 32;
    proj.tags.forEach((tag) => {
      ctx.font = '12px monospace';
      const textWidth = ctx.measureText(tag).width;
      const pillWidth = textWidth + 20;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
      ctx.lineWidth = 1;
      roundRectPath(ctx, tagX, 182, pillWidth, 26, 13);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(tag, tagX + 10, 199);
      tagX += pillWidth + 8;
    });

    // Bottom Action Prompt
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = proj.accent;
    ctx.fillText('▶ CLICK TO INSPECT / PLAY LIVE', 32, canvas.height - 34);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // ── 6. CREATE 3D CARDS WITH GLOWING EDGES ──────────────────────────────────
  projects.forEach((proj, i) => {
    // Angle in the circle
    const angle = (i / count) * Math.PI * 2;
    const cardWidth = 2.4;
    const cardHeight = 1.58;
    const geometry = new THREE.PlaneGeometry(cardWidth, cardHeight, 8, 8);

    // Initial canvas texture
    const canvasTexture = createCardTexture(proj, null);

    const cardMaterial = new THREE.MeshStandardMaterial({
      map: canvasTexture,
      roughness: 0.25,
      metalness: 0.15,
      side: THREE.DoubleSide
    });

    // Load actual image and update texture
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = proj.img;
    img.onload = () => {
      const updatedTexture = createCardTexture(proj, img);
      cardMaterial.map = updatedTexture;
      cardMaterial.needsUpdate = true;
    };

    const mesh = new THREE.Mesh(geometry, cardMaterial);

    // Position around circle center (0, 0, 0)
    mesh.position.x = Math.sin(angle) * radius;
    mesh.position.z = Math.cos(angle) * radius;
    // Rotate to face outward toward the camera
    mesh.rotation.y = angle;

    // Glowing Neon Edge Wireframe
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: proj.accentHex,
      transparent: true,
      opacity: 0.85
    });
    const wireframe = new THREE.LineSegments(edgesGeometry, lineMaterial);
    mesh.add(wireframe);

    mesh.userData = {
      initialY: 0,
      index: i,
      project: proj,
      baseAngle: angle
    };

    carouselGroup.add(mesh);
    cardMeshes.push(mesh);
  });

  // ── 7. AMBIENT FLOATING CYBER PARTICLES ────────────────────────────────────
  const particlesCount = 200;
  const particlePositions = new Float32Array(particlesCount * 3);
  const particleColors = new Float32Array(particlesCount * 3);

  const colCyan = new THREE.Color(0x00f3ff);
  const colPurple = new THREE.Color(0xa855f7);

  for (let i = 0; i < particlesCount; i++) {
    particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 14;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10;

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
    opacity: 0.65,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  // ── 8. INTERACTION STATE: WHEEL, DRAG & TOUCH ─────────────────────────────
  let targetRotation = 0;
  let currentRotation = 0;
  let isDragging = false;
  let startX = 0;
  let pointerTotalDelta = 0;
  let activeIndex = 0;

  // Trackpad / Wheel
  container.addEventListener('wheel', (e) => {
    targetRotation += e.deltaY * 0.0016;
  }, { passive: true });

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
    targetRotation -= deltaX * 0.0035;
    startX = e.clientX;
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
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
    targetRotation -= deltaX * 0.004;
    startX = e.touches[0].clientX;
  }, { passive: true });

  container.addEventListener('touchend', () => {
    isDragging = false;
  });

  // ── 9. ARROW BUTTON NAVIGATION ────────────────────────────────────────────
  const prevBtn = document.getElementById('carouselPrevBtn');
  const nextBtn = document.getElementById('carouselNextBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      targetRotation += (Math.PI * 2 / count);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      targetRotation -= (Math.PI * 2 / count);
    });
  }

  // ── 10. RAYCASTER CLICK TO INSPECT OR OPEN ────────────────────────────────
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
      const clickedIndex = clickedMesh.userData.index;
      const clickedProj = clickedMesh.userData.project;

      if (clickedIndex === activeIndex) {
        window.open(clickedProj.liveUrl, '_blank');
      } else {
        const angleStep = (Math.PI * 2 / count);
        let diff = (clickedIndex - activeIndex);
        if (diff > count / 2) diff -= count;
        if (diff < -count / 2) diff += count;
        targetRotation -= diff * angleStep;
      }
    }
  });

  // ── 11. HUD DOM ELEMENTS UPDATE ───────────────────────────────────────────
  const hudBadge = document.getElementById('hudBadge');
  const hudIndex = document.getElementById('hudIndex');
  const hudTitle = document.getElementById('hudTitle');
  const hudTagline = document.getElementById('hudTagline');
  const hudLiveBtn = document.getElementById('hudLiveBtn');
  const hudCodeBtn = document.getElementById('hudCodeBtn');
  const hudCard = document.getElementById('carouselProjectHud');

  function updateHud(proj, idx) {
    if (hudBadge) {
      hudBadge.textContent = proj.badge.toUpperCase();
      hudBadge.style.color = proj.accent;
      hudBadge.style.borderColor = proj.accent + '55';
      hudBadge.style.backgroundColor = proj.accent + '15';
    }
    if (hudIndex) hudIndex.textContent = (idx + 1) + ' / ' + count;
    if (hudTitle) hudTitle.textContent = proj.title;
    if (hudTagline) {
      hudTagline.textContent = proj.tagline;
      hudTagline.style.color = proj.accent;
    }
    if (hudLiveBtn) hudLiveBtn.href = proj.liveUrl;
    if (hudCodeBtn) hudCodeBtn.href = proj.githubUrl;

    if (hudCard) {
      hudCard.style.borderColor = proj.accent + '66';
      hudCard.style.boxShadow = '0 12px 36px -10px ' + proj.accent + '33';
    }
  }

  // ── 12. ANIMATION & PHYSICS LOOP ──────────────────────────────────────────
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Smooth inertia lerp for carousel rotation
    currentRotation += (targetRotation - currentRotation) * 0.085;
    carouselGroup.rotation.y = currentRotation;

    // Float ambient particles
    if (particleSystem) {
      particleSystem.rotation.y = time * 0.04;
      particleSystem.rotation.x = Math.sin(time * 0.03) * 0.05;
    }

    // Weightless anti-gravity floating & tilt on cards
    let closestIndex = 0;
    let maxZ = -9999;

    // Eye target in world coordinates (slightly in front of camera)
    const worldEye = new THREE.Vector3(0, 0, radius + 2.6);
    const localEye = carouselGroup.worldToLocal(worldEye.clone());

    cardMeshes.forEach((mesh) => {
      const idx = mesh.userData.index;

      // Subtle sine wave anti-gravity floating
      mesh.position.y = Math.sin(time * 1.5 + idx * 1.25) * 0.14;

      // Dynamically face outward towards viewer (prevents mirrored backface)
      mesh.lookAt(localEye.x, mesh.position.y, localEye.z);
      mesh.rotation.x += Math.cos(time * 1.1 + idx * 0.9) * 0.04;
      mesh.rotation.z += Math.sin(time * 1.3 + idx * 0.7) * 0.03;

      // Get world position to determine which card is facing camera front
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);

      if (worldPos.z > maxZ) {
        maxZ = worldPos.z;
        closestIndex = idx;
      }
    });

    // If active front card changed, update HUD
    if (closestIndex !== activeIndex) {
      activeIndex = closestIndex;
      updateHud(projects[activeIndex], activeIndex);
    }

    renderer.render(scene, camera);
  }

  // Initial HUD sync
  updateHud(projects[0], 0);
  animate();

  // ── 13. RESPONSIVE RESIZE LISTENER ────────────────────────────────────────
  function handleResize() {
    if (!container) return;
    width = container.clientWidth;
    height = container.clientHeight;

    camera.aspect = width / height;
    radius = width < 640 ? 3.0 : 3.4;
    camera.position.z = radius + (width < 640 ? 2.5 : 2.2);
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

    cardMeshes.forEach((mesh) => {
      const angle = mesh.userData.baseAngle;
      mesh.position.x = Math.sin(angle) * radius;
      mesh.position.z = Math.cos(angle) * radius;
    });
  }

  window.addEventListener('resize', handleResize);
  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(container);
}
