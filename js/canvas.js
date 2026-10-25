    /********************************************************************
     * 3.5. MOTOR FUNDAL DINAMIC INTERACTIV (COSMIC INTERACTIVE CANVAS)
     *      - Particule de praf cosmic atrase fluid de cursorul mouse-ului / touch
     *      - Unde de șoc luminoase & pulsații radiale la click pe nucleu
     *      - Linii cuantice efemere și stele strălucitoare cu adâncime 3D
     ********************************************************************/
    let cosmicCanvas = null;
    let cosmicCtx = null;
    let cosmicParticles = [];
    let cosmicShockwaves = [];
    let cosmicPointer = { x: -9999, y: -9999, active: 0, lastMoved: 0 };
    let cosmicCanvasW = window.innerWidth;
    let cosmicCanvasH = window.innerHeight;
    let cosmicDpr = 1;
    let cosmicAnimFrameId = null;
    let cosmicBgInitialized = false;

    const COSMIC_PALETTE = [
      { r: 56, g: 189, b: 248 },  // Quantum Cyan (#38bdf8)
      { r: 168, g: 85, b: 247 }, // Nebula Purple (#a855f7)
      { r: 253, g: 224, b: 71 },  // Tachyon Gold (#fde047)
      { r: 255, g: 255, b: 255 }, // Diamond White (#ffffff)
      { r: 244, g: 63, b: 94 },   // Crimson Pink (#f43f5e)
      { r: 34, g: 211, b: 238 }   // Electric Teal (#22d3ee)
    ];

    function initCosmicInteractiveCanvas() {
      if (cosmicBgInitialized) return;
      cosmicCanvas = document.getElementById('cosmicBgCanvas');
      if (!cosmicCanvas) return;
      cosmicCtx = cosmicCanvas.getContext('2d');
      if (!cosmicCtx) return;

      cosmicBgInitialized = true;

      function resizeCosmic() {
        const isMobile = window.innerWidth < 768;
        cosmicDpr = 1;
        cosmicCanvasW = window.innerWidth;
        cosmicCanvasH = window.innerHeight;
        cosmicCanvas.width = cosmicCanvasW;
        cosmicCanvas.height = cosmicCanvasH;
        if (cosmicCtx) {
          cosmicCtx.setTransform(1, 0, 0, 1, 0, 0);
        }
      }

      window.addEventListener('resize', resizeCosmic, { passive: true });
      resizeCosmic();

      // Generare nor cosmic de particule inteligente cu adâncime 3D (scalată optim pentru mobile & desktop)
      const isMobile = window.innerWidth < 768;
      const count = isMobile ? 25 : 45;
      cosmicParticles = [];
      for (let i = 0; i < count; i++) {
        const depth = 0.45 + Math.random() * 0.75;
        cosmicParticles.push({
          x: Math.random() * cosmicCanvasW,
          y: Math.random() * cosmicCanvasH,
          vx: (Math.random() - 0.5) * 0.35 * depth,
          vy: (Math.random() - 0.5) * 0.35 * depth,
          baseRadius: (0.85 + Math.random() * 2.2) * (depth > 0.9 ? 1.15 : 0.9),
          pulseScale: 1.0,
          baseAlpha: 0.22 + Math.random() * 0.65,
          pulseAlphaBonus: 0,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.012 + Math.random() * 0.035,
          rgb: COSMIC_PALETTE[Math.floor(Math.random() * COSMIC_PALETTE.length)],
          depth: depth,
          driftAngle: Math.random() * Math.PI * 2,
          driftSpeed: (0.12 + Math.random() * 0.28) * depth
        });
      }

      // Evenimente Mouse & Touch pentru atragerea fluidă a particulelor
      const updatePointer = (clientX, clientY) => {
        cosmicPointer.x = clientX;
        cosmicPointer.y = clientY;
        cosmicPointer.active = 1;
        cosmicPointer.lastMoved = performance.now();
      };

      window.addEventListener('mousemove', (e) => {
        updatePointer(e.clientX, e.clientY);
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          updatePointer(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      window.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          updatePointer(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      let lastFrameTime = performance.now();

      function animateCosmicBg(now) {
        cosmicAnimFrameId = requestAnimationFrame(animateCosmicBg);

        if (document.hidden) return;

        if (state && state.cosmicBgEnabled === false) {
          if (cosmicCtx) cosmicCtx.clearRect(0, 0, cosmicCanvasW, cosmicCanvasH);
          return;
        }

        // Economisire maximă GPU pe telefon: când panoul de nucleu este activ pe ecran complet, canvasul este 100% acoperit
        if (cosmicCanvasW < 900) {
          const lz = document.getElementById('zone-left');
          if (lz && lz.classList.contains('mobile-active')) {
            return;
          }
        }

        const dt = Math.min(0.06, (now - lastFrameTime) / 1000);
        lastFrameTime = now;

        cosmicCtx.clearRect(0, 0, cosmicCanvasW, cosmicCanvasH);

        // Estompare treptată a atracției cursorului când mouse-ul stă pe loc > 1.8s
        if (cosmicPointer.active > 0) {
          if (now - cosmicPointer.lastMoved > 1800) {
            cosmicPointer.active = Math.max(0, cosmicPointer.active - dt * 1.6);
          }
        }

        // 1. Randare și propagare Unde de Șoc din nucleu (Zero shadowBlur pe GPU)
        for (let i = cosmicShockwaves.length - 1; i >= 0; i--) {
          const wave = cosmicShockwaves[i];
          wave.radius += wave.speed * (60 * dt);
          wave.alpha *= Math.pow(0.972, 60 * dt);

          if (wave.alpha < 0.015 || wave.radius >= wave.maxRadius) {
            cosmicShockwaves.splice(i, 1);
            continue;
          }

          cosmicCtx.beginPath();
          cosmicCtx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
          cosmicCtx.strokeStyle = `rgba(${wave.color}, ${wave.alpha})`;
          cosmicCtx.lineWidth = wave.width;
          cosmicCtx.stroke();
          if (wave.isCrit) {
            cosmicCtx.beginPath();
            cosmicCtx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
            cosmicCtx.strokeStyle = `rgba(${wave.color}, ${wave.alpha * 0.4})`;
            cosmicCtx.lineWidth = wave.width * 2.2;
            cosmicCtx.stroke();
          }
        }

        const pLen = cosmicParticles.length;
        const attractRadius = 220;
        const attractRadSq = attractRadius * attractRadius;

        // 2. Fizică Particule (Atracție Cursor + Pulsație la Șocul Nucleului)
        for (let i = 0; i < pLen; i++) {
          const p = cosmicParticles[i];

          // A. Atracție lină spre cursorul mouse-ului / deget
          if (cosmicPointer.active > 0.01) {
            const dx = cosmicPointer.x - p.x;
            const dy = cosmicPointer.y - p.y;
            const dSq = dx * dx + dy * dy;

            if (dSq < attractRadSq && dSq > 100) {
              const d = Math.sqrt(dSq);
              const nx = dx / d;
              const ny = dy / d;
              const factor = (1 - d / attractRadius) * cosmicPointer.active * 0.45 * p.depth;

              // Forță gravitațională de atragere:
              p.vx += nx * factor;
              p.vy += ny * factor;
              // Vârtej subtil orbital în jurul cursorului:
              p.vx += -ny * (factor * 0.22);
              p.vy += nx * (factor * 0.22);
            }
          }

          // B. Excitație și împingere din Undele de Șoc ale Nucleului
          for (let w = 0; w < cosmicShockwaves.length; w++) {
            const wave = cosmicShockwaves[w];
            const dx = p.x - wave.x;
            const dy = p.y - wave.y;
            const dist = Math.hypot(dx, dy) || 1;
            const diff = Math.abs(dist - wave.radius);

            if (diff < 60) {
              const norm = (1 - diff / 60);
              const push = (wave.isCrit ? 3.6 : (wave.isManual ? 2.2 : 1.1)) * norm * (wave.alpha / 0.8) * p.depth;
              p.vx += (dx / dist) * push;
              p.vy += (dy / dist) * push;

              const targetScale = wave.isCrit ? 2.6 : (wave.isManual ? 1.85 : 1.35);
              const targetBonus = wave.isCrit ? 0.95 : (wave.isManual ? 0.65 : 0.35);
              p.pulseScale = Math.max(p.pulseScale, targetScale * norm);
              p.pulseAlphaBonus = Math.max(p.pulseAlphaBonus, targetBonus * norm);
            }
          }

          // C. Frecare, inerție și derivă naturală cosmică
          p.vx *= 0.955;
          p.vy *= 0.955;
          p.vx += Math.cos(p.driftAngle) * (p.driftSpeed * 0.06);
          p.vy += Math.sin(p.driftAngle) * (p.driftSpeed * 0.06);

          p.x += p.vx * (60 * dt);
          p.y += p.vy * (60 * dt);

          // Înfășurare la marginea ecranului (Seamless Wrap)
          if (p.x < -25) p.x = cosmicCanvasW + 25;
          else if (p.x > cosmicCanvasW + 25) p.x = -25;
          if (p.y < -25) p.y = cosmicCanvasH + 25;
          else if (p.y > cosmicCanvasH + 25) p.y = -25;

          // Sclipire lentă și revenire după pulsație
          p.twinklePhase += p.twinkleSpeed;
          p.pulseScale = (p.pulseScale - 1) * 0.91 + 1;
          p.pulseAlphaBonus *= 0.93;
        }

        // 3. Randare particule de praf cosmic grupate în singur batch (Zero CPU overhead, 60-144 FPS fluid)
        cosmicCtx.beginPath();
        for (let i = 0; i < pLen; i++) {
          const p = cosmicParticles[i];
          const r = p.baseRadius * p.pulseScale;
          cosmicCtx.moveTo(p.x + r, p.y);
          cosmicCtx.arc(p.x, p.y, r, 0, Math.PI * 2);
        }
        cosmicCtx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        cosmicCtx.fill();

        // 5. Halou stelar subtil în jurul cursorului activ
        if (cosmicPointer.active > 0.05) {
          const haloGrad = cosmicCtx.createRadialGradient(cosmicPointer.x, cosmicPointer.y, 0, cosmicPointer.x, cosmicPointer.y, 90);
          haloGrad.addColorStop(0, `rgba(56, 189, 248, ${0.07 * cosmicPointer.active})`);
          haloGrad.addColorStop(0.5, `rgba(168, 85, 247, ${0.035 * cosmicPointer.active})`);
          haloGrad.addColorStop(1, 'transparent');
          cosmicCtx.fillStyle = haloGrad;
          cosmicCtx.beginPath();
          cosmicCtx.arc(cosmicPointer.x, cosmicPointer.y, 90, 0, Math.PI * 2);
          cosmicCtx.fill();
        }
      }

      cosmicAnimFrameId = requestAnimationFrame(animateCosmicBg);
    }

    function triggerCosmicCorePulse(x, y, isCrit = false, isManual = true) {
      if (!cosmicBgInitialized || (state && state.cosmicBgEnabled === false)) return;
      if (!isManual) return; // Economisim fillrate GPU pentru auto-click-uri dese - doar click-urile manuale propagă șocuri în fundal
      let ox = x;
      let oy = y;
      if (!ox || !oy) {
        const center = getCoreCenter();
        ox = center.x;
        oy = center.y;
      }

      if (cosmicShockwaves.length > 3) {
        cosmicShockwaves.shift();
      }

      const canvasMaxDim = Math.max(cosmicCanvasW, cosmicCanvasH);
      cosmicShockwaves.push({
        x: ox,
        y: oy,
        radius: 20,
        maxRadius: canvasMaxDim * (isCrit ? 1.05 : 0.8),
        speed: isCrit ? 18 : (isManual ? 12 : 7),
        width: isCrit ? 4.0 : (isManual ? 2.5 : 1.4),
        color: isCrit ? '253, 224, 71' : (isManual ? '56, 189, 248' : '34, 211, 238'),
        alpha: isCrit ? 0.90 : (isManual ? 0.65 : 0.35),
        isCrit: isCrit,
        isManual: isManual
      });
    }

    function toggleCosmicBg() {
      state.cosmicBgEnabled = !state.cosmicBgEnabled;
      syncCosmicBgUI();
      saveGame();
      if (state.cosmicBgEnabled) {
        showToast('🌌 Fundalul cosmic interactiv a fost activat!');
      } else {
        showToast('🌌 Fundalul cosmic a fost oprit.');
      }
    }

    function syncCosmicBgUI() {
      const btn = document.getElementById('btnCosmicBg');
      if (btn) {
        const isEnabled = state.cosmicBgEnabled !== false;
        btn.innerText = isEnabled ? '🌌 Fundal: ON' : '🌌 Fundal: OFF';
        btn.style.borderColor = isEnabled ? 'var(--accent-cyan)' : '';
        btn.style.color = isEnabled ? '#bae6fd' : '';
      }
    }

    function toggleFpsCounter() {
      state.fpsCounterEnabled = state.fpsCounterEnabled === false ? true : false;
      syncFpsCounterUI();
      saveGame();
      if (state.fpsCounterEnabled) {
        showToast('📊 Contorul de FPS a fost activat.');
      } else {
        showToast('📊 Contorul de FPS a fost ascuns.');
      }
    }

    function syncFpsCounterUI() {
      const badge = document.getElementById('fpsMeterBadge');
      const btn = document.getElementById('btnFpsToggle');
      const isEnabled = state.fpsCounterEnabled !== false;
      if (badge) {
        badge.style.display = isEnabled ? 'inline-flex' : 'none';
      }
      if (btn) {
        btn.innerText = isEnabled ? '📊 FPS: ON' : '📊 FPS: OFF';
        btn.style.borderColor = isEnabled ? 'var(--accent-cyan)' : '';
        btn.style.color = isEnabled ? '#bae6fd' : '';
      }
    }

    function showFpsInfo() {
      openFpsModal();
    }

    function openFpsModal() {
      const modal = document.getElementById('fpsModal');
      const valEl = document.getElementById('modalFpsValue');
      const badgeEl = document.getElementById('modalFpsStatusBadge');
      if (valEl) valEl.textContent = `${currentFps} FPS`;
      if (badgeEl) {
        if (currentFps >= 90) {
          badgeEl.textContent = '🚀 Fluiditate Extremă (120-144+ FPS)';
          badgeEl.style.background = 'rgba(16, 185, 129, 0.2)';
          badgeEl.style.borderColor = 'rgba(16, 185, 129, 0.5)';
          badgeEl.style.color = '#6ee7b7';
        } else if (currentFps >= 50) {
          badgeEl.textContent = '⚡ Fluiditate Optimă (60 FPS)';
          badgeEl.style.background = 'rgba(56, 189, 248, 0.2)';
          badgeEl.style.borderColor = 'rgba(56, 189, 248, 0.5)';
          badgeEl.style.color = '#bae6fd';
        } else {
          badgeEl.textContent = '⚠️ Limitat de Browser (~30-40 FPS)';
          badgeEl.style.background = 'rgba(234, 179, 8, 0.2)';
          badgeEl.style.borderColor = 'rgba(234, 179, 8, 0.5)';
          badgeEl.style.color = '#fef08a';
        }
      }
      if (modal) modal.classList.add('open');
    }

    function closeFpsModal() {
      const modal = document.getElementById('fpsModal');
      if (modal) modal.classList.remove('open');
    }

    function copyEdgeSettingsUrl() {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('edge://settings/system').then(() => {
          showToast('📋 Copiat în Clipboard! Lipește-l în bara de adrese din Edge.');
        }).catch(() => {
          showToast('Deschide în Edge: edge://settings/system');
        });
      } else {
        showToast('Deschide în Edge: edge://settings/system');
      }
    }

    /********************************************************************
     * 3.5. SISTEM DE VREME COSMICĂ & FURTUNI STELARE (60 FPS MOBILE GPU)
     * Evenimente dinamice globale cu animații spectaculoase și optimizate
     ********************************************************************/
    const COSMIC_STORMS = [
      {
        id: 'solar_flare',
        name: 'Furtună Solară Cuantică',
        icon: '🌪️',
        themeColor: '#f59e0b',
        glowColor: 'rgba(245, 158, 11, 0.45)',
        durationSec: 75,
        tag: 'SOLAR CORONA SUPERFLARE',
        shortDesc: 'Sateliții & Reactoarele produc x5.0 Energie/s (+150% Global)',
        detailDesc: 'O ejecție masivă de masă coronală hiper-încărcată scaldă întregul sistem! Sateliții Solari (g4) și Reactoarele de Fuziune (g5) produc la 500% randament, iar producția globală este amplificată cu +150%!',
        buffPill: 'Furtună Solară x2.5 (+5x Sateliți/Reactoare)'
      },
      {
        id: 'tachyon_storm',
        name: 'Furtună de Tahioni Superconductivă',
        icon: '⚡',
        themeColor: '#38bdf8',
        glowColor: 'rgba(56, 189, 248, 0.45)',
        durationSec: 60,
        tag: 'HYPER-TACHYON AURORA',
        shortDesc: '+350% Click Power, +40% Crit & Overclock 100% înghețat',
        detailDesc: 'Particulele tahionice călătoresc mai rapid decât lumina, ionizând nucleul cuantic! Puterea click-urilor crește cu +350%, rata critică crește masiv, iar Overclock-ul este înghețat la 100%!',
        buffPill: 'Furtună Tahionică (+350% Click & 100% Fever)'
      },
      {
        id: 'meteor_shower',
        name: 'Ploaie de Meteoriți Cuantici',
        icon: '☄️',
        themeColor: '#ec4899',
        glowColor: 'rgba(236, 72, 153, 0.45)',
        durationSec: 70,
        tag: 'QUANTUM METEOR SHOWER',
        shortDesc: 'Atinge meteoriții pentru energie masivă & Materie Întunecată 🔮!',
        detailDesc: 'O centură de asteroizi străvechi se prăbușește pe ecran! Atinge/dă click pe meteoriții în cădere pentru a-i pulveriza: fiecare acordă energie instantanee și are 10% șansă de a acorda Materie Întunecată 🔮!',
        buffPill: 'Ploaie de Meteoriți (Atinge-i pe ecran!)'
      },
      {
        id: 'chronos_rift',
        name: 'Falia Spațio-Temporală',
        icon: '⏳',
        themeColor: '#a855f7',
        glowColor: 'rgba(168, 85, 247, 0.45)',
        durationSec: 65,
        tag: 'CHRONOS TIME DILATION',
        shortDesc: 'Timpul curge x3.0 mai rapid (Toate generatoarele x3)',
        detailDesc: 'O ruptură în spațiu-timp dilată dimensiunea locală! Toate nucleele produc de 3 ori mai rapidă energie, iar timpii de reîncărcare la toate abilitățile se scurg triplu de repede!',
        buffPill: 'Falia Temporală (Timp Univers x3.0)'
      },
      {
        id: 'void_singularity',
        name: 'Alinierea Singularităților Vidului',
        icon: '🕳️',
        themeColor: '#c084fc',
        glowColor: 'rgba(192, 132, 252, 0.45)',
        durationSec: 75,
        tag: 'DARK MATTER SINGULARITY',
        shortDesc: 'Producție x2.8, Anomalii 3x mai dese & +25% Materie 🔮 la Rebirth',
        detailDesc: 'Găurile negre din multivers se aliniază în rezonanță gravitațională! Toată producția este amplificată x2.8, anomaliile cosmice apar de 3x mai frecvent, iar dacă declanșezi Rebirth primești +25% Materie Întunecată bonus!',
        buffPill: 'Aliniere Vid x2.8 (+25% 🔮 la Rebirth)'
      }
    ];

    let activeCosmicStorm = null;
    let nextStormTimestamp = Date.now() + (8 * 60 * 1000 + Math.random() * (5 * 60 * 1000)); // Programat natural 8-13 minute
    let stormWarningData = null; // { storm: obj, endWarningAt: timestamp }
    let stormCanvas = null;
    let stormCtx = null;
    let stormAnimFrameId = null;
    let stormCanvasW = window.innerWidth;
    let stormCanvasH = window.innerHeight;
    let stormDpr = 1;
    let stormLastTime = performance.now();
    let meteorSpawnTimer = 0;

    // ====================================================================
    // SPRITES GPU PRE-RANDATE ÎN MEMORIE (ZERO LAG PE MOBIL & DESKTOP)
    // ====================================================================
    let stormSpritesReady = false;
    let spriteGlowSun, spriteGlowCyan, spriteGlowPurple, spriteGlowPink, spriteSparkStar, spriteNebulaPuff;

    function buildStormSprites() {
      if (stormSpritesReady) return;
      stormSpritesReady = true;

      function createGlowSprite(r1, g1, b1, r2, g2, b2, size) {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const ctx = c.getContext('2d');
        const h = size * 0.5;
        const grad = ctx.createRadialGradient(h, h, 0, h, h, h);
        grad.addColorStop(0, `rgba(255, 255, 255, 1)`);
        grad.addColorStop(0.25, `rgba(${r1}, ${g1}, ${b1}, 0.85)`);
        grad.addColorStop(0.6, `rgba(${r2}, ${g2}, ${b2}, 0.35)`);
        grad.addColorStop(1, `rgba(${r2}, ${g2}, ${b2}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        return c;
      }

      function createSparkSprite(size) {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const ctx = c.getContext('2d');
        const h = size * 0.5;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(h, 2);
        ctx.quadraticCurveTo(h, h, size - 2, h);
        ctx.quadraticCurveTo(h, h, h, size - 2);
        ctx.quadraticCurveTo(h, h, 2, h);
        ctx.quadraticCurveTo(h, h, h, 2);
        ctx.fill();
        return c;
      }

      function createNebulaPuffSprite(r, greenVal, b, size) {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const ctx = c.getContext('2d');
        const h = size * 0.5;
        const grad = ctx.createRadialGradient(h, h, 0, h, h, h);
        grad.addColorStop(0, `rgba(${r}, ${greenVal}, ${b}, 0.28)`);
        grad.addColorStop(0.5, `rgba(${r}, ${greenVal}, ${b}, 0.12)`);
        grad.addColorStop(1, `rgba(${r}, ${greenVal}, ${b}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        return c;
      }

      spriteGlowSun = createGlowSprite(253, 224, 71, 245, 158, 11, 64);
      spriteGlowCyan = createGlowSprite(207, 250, 254, 56, 189, 248, 64);
      spriteGlowPurple = createGlowSprite(245, 208, 254, 168, 85, 247, 64);
      spriteGlowPink = createGlowSprite(254, 205, 211, 236, 72, 153, 64);
      spriteSparkStar = createSparkSprite(32);
      spriteNebulaPuff = createNebulaPuffSprite(245, 158, 11, 96);
    }

    // Pool-uri reutilizabile de particule (Zero alocări în requestAnimationFrame)
    const MAX_SOLAR_EMBERS = 50;
    const solarEmbersPool = [];
    for (let i = 0; i < MAX_SOLAR_EMBERS; i++) {
      solarEmbersPool.push({
        x: 0, y: 0, vx: 0, vy: 0, size: 20, alpha: 0, active: false, speed: 120, angle: 0.6,
        trail: [{x:0,y:0},{x:0,y:0},{x:0,y:0}]
      });
    }

    const MAX_FALLING_METEORS = 7;
    const meteorsPool = [];
    for (let i = 0; i < MAX_FALLING_METEORS; i++) {
      meteorsPool.push({
        x: 0, y: 0, vx: 0, vy: 0, size: 24, hitRadius: 40, speed: 280, angle: 0.75, active: false,
        tailLength: 140, color: '#ec4899', glow: '#f43f5e', hasDarkMatter: false,
        trailNodes: [{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}]
      });
    }

    const MAX_EXPLOSION_SPARKS = 80;
    const sparksPool = [];
    for (let i = 0; i < MAX_EXPLOSION_SPARKS; i++) {
      sparksPool.push({
        x: 0, y: 0, vx: 0, vy: 0, size: 3.5, alpha: 0, color: '#ffffff', active: false, life: 0, maxLife: 0.8
      });
    }

    const MAX_CHRONOS_PARTICLES = 45;
    const chronosDustPool = [];
    for (let i = 0; i < MAX_CHRONOS_PARTICLES; i++) {
      chronosDustPool.push({
        ang: Math.random() * Math.PI * 2,
        dist: 100 + Math.random() * 400,
        speed: 40 + Math.random() * 90,
        size: 2 + Math.random() * 3,
        alpha: 0.3 + Math.random() * 0.6
      });
    }

    let lightningActiveBolts = [];
    let lightningFlashAlpha = 0;
    let lastLightningTime = 0;
    let chronosPhase = 0;
    let voidAccretionAngle = 0;

    function initCosmicStormCanvas() {
      stormCanvas = document.getElementById('cosmicStormCanvas');
      if (!stormCanvas) return;
      stormCtx = stormCanvas.getContext('2d');
      if (!stormCtx) return;

      buildStormSprites();

      function resizeStormCanvas() {
        const isMobile = window.innerWidth < 768;
        const q = state.stormQuality || 'auto';
        stormDpr = 1.0;
        stormCanvasW = window.innerWidth;
        stormCanvasH = window.innerHeight;
        stormCanvas.width = stormCanvasW;
        stormCanvas.height = stormCanvasH;
        if (stormCtx) {
          stormCtx.setTransform(1, 0, 0, 1, 0, 0);
        }
      }

      window.addEventListener('resize', resizeStormCanvas, { passive: true });
      resizeStormCanvas();

      // Interacțiune tactilă / click pentru pulverizarea meteoriților în cădere
      window.addEventListener('pointerdown', (e) => {
        if (!activeCosmicStorm || activeCosmicStorm.id !== 'meteor_shower') return;
        checkMeteorHit(e.clientX, e.clientY);
      }, { passive: true });
    }

    function checkMeteorHit(clientX, clientY) {
      const isMobile = window.innerWidth < 768;
      const extraHit = isMobile ? 22 : 12; // Hitbox extrem de generos pe touch mobil

      for (let i = 0; i < meteorsPool.length; i++) {
        const m = meteorsPool[i];
        if (!m.active) continue;

        const dist = Math.hypot(m.x - clientX, m.y - clientY);
        if (dist <= m.hitRadius + extraHit) {
          // Lovitură directă!
          m.active = false;
          detonateMeteor(m, clientX, clientY);
          break;
        }
      }
    }

    function detonateMeteor(m, x, y) {
      state.meteorsCaught = (state.meteorsCaught || 0) + 1;

      // Calcul recompensă: 25 până la 65 secunde de CPS + Click Power
      const cps = getCPS();
      const vpc = getClickValue();
      const secEquivalent = 30 + Math.random() * 35;
      const gain = Math.max(250, Math.round(cps * secEquivalent + vpc * 55));
      addEnergy(gain);

      // Șansă de 14% pentru drop de Materie Întunecată bonus!
      if (m.hasDarkMatter || Math.random() < 0.14) {
        state.darkMatter = (state.darkMatter || 0) + 1;
        playXboxAchievementChime('rare');
        spawnFloatingText(x, y - 52, '🔮 +1 MATERIE ÎNTUNECATĂ BONUS!', true);
      }

      spawnFloatingText(x, y - 18, `☄️ +${formatNumber(gain)} ⚡`, true);

      // Feedback Haptic intens pe telefon
      if (navigator.vibrate) {
        try { navigator.vibrate([35, 25, 55]); } catch (e) {}
      }

      // Audio sintetizat cristal
      playMeteorShatterSFX();

      // Explozie de particule & scântei cinetice pe Canvas (GPU)
      const isMobile = window.innerWidth < 768;
      const sparkCount = isMobile ? 18 : 34;
      let spawned = 0;
      for (let s of sparksPool) {
        if (!s.active) {
          s.active = true;
          s.x = x;
          s.y = y;
          const ang = Math.random() * Math.PI * 2;
          const spd = 140 + Math.random() * 320;
          s.vx = Math.cos(ang) * spd;
          s.vy = Math.sin(ang) * spd;
          s.size = 2.5 + Math.random() * 4.5;
          s.alpha = 1.0;
          s.life = 0;
          s.maxLife = 0.55 + Math.random() * 0.45;
          s.color = Math.random() < 0.6 ? m.color : '#ffffff';
          spawned++;
          if (spawned >= sparkCount) break;
        }
      }
    }

    function startCosmicStorm(stormDef) {
      activeCosmicStorm = stormDef;
      activeCosmicStorm.startedAt = Date.now();
      activeCosmicStorm.endAt = Date.now() + stormDef.durationSec * 1000;

      state.totalStormsExperienced = (state.totalStormsExperienced || 0) + 1;

      // Sunet specific & vibrație
      if (stormDef.id === 'solar_flare') playSolarFlareHum();
      else if (stormDef.id === 'tachyon_storm') playTachyonThunderClap();
      else if (stormDef.id === 'meteor_shower') playMeteorShatterSFX();
      else if (stormDef.id === 'chronos_rift') playChronosWarpSFX();
      else if (stormDef.id === 'void_singularity') playVoidSingularitySFX();

      if (navigator.vibrate) {
        try { navigator.vibrate([40, 30, 60]); } catch (e) {}
      }

      showToast(`${stormDef.icon} ${stormDef.name} s-a dezlănțuit! (${stormDef.shortDesc})`);

      // Inițializare canvas loop dacă nu rulează
      if (!stormAnimFrameId) {
        stormLastTime = performance.now();
        stormAnimFrameId = requestAnimationFrame(animateStormCanvas);
      }

      // Reset pool-uri
      meteorsPool.forEach(m => m.active = false);
      sparksPool.forEach(s => s.active = false);
      solarEmbersPool.forEach(e => e.active = false);
      lightningActiveBolts = [];

      updateUI();
      if (document.getElementById('weatherModal')?.classList.contains('open')) {
        renderWeatherModal();
      }
    }

    function endCosmicStorm() {
      if (!activeCosmicStorm) return;
      const stormName = activeCosmicStorm.name;
      activeCosmicStorm = null;

      // Oprim bucla canvas când furtuna s-a terminat (0% GPU / Baterie conservată)
      if (stormAnimFrameId) {
        cancelAnimationFrame(stormAnimFrameId);
        stormAnimFrameId = null;
      }
      if (stormCtx) {
        stormCtx.clearRect(0, 0, stormCanvasW, stormCanvasH);
      }

      // Programăm următoarea furtună (aleatoriu între 8 și 13 minute)
      scheduleNextStorm();

      showToast(`🌌 ${stormName} s-a disipat. Condițiile cosmice au revenit la normal.`);
      updateUI();
      if (document.getElementById('weatherModal')?.classList.contains('open')) {
        renderWeatherModal();
      }
    }

    function scheduleNextStorm(delayMs = null) {
      if (delayMs !== null) {
        nextStormTimestamp = Date.now() + delayMs;
      } else {
        const minMs = 8 * 60 * 1000;
        const randMs = Math.random() * (5 * 60 * 1000);
        nextStormTimestamp = Date.now() + minMs + randMs;
      }
      if (typeof state !== 'undefined' && state) {
        state.nextStormTimestamp = nextStormTimestamp;
      }
    }

    function forceTriggerStorm(stormId) {
      const stormDef = COSMIC_STORMS.find(s => s.id === stormId);
      if (!stormDef) return;

      if (stormWarningData) {
        stormWarningData = null;
        const banner = document.getElementById('cosmicWeatherAlert');
        if (banner) banner.style.display = 'none';
      }

      if (activeCosmicStorm) {
        endCosmicStorm();
      }

      startCosmicStorm(stormDef);
      closeWeatherModal();
    }

    function tickCosmicWeather(dt) {
      const now = Date.now();

      // Actualizare live radar dacă modalul este deschis
      const weatherModalEl = document.getElementById('weatherModal');
      if (weatherModalEl && weatherModalEl.classList.contains('open')) {
        updateWeatherModalLiveTime(now);
      }

      // 1. Verificare sfârșit furtună activă
      if (activeCosmicStorm) {
        if (now >= activeCosmicStorm.endAt) {
          endCosmicStorm();
        }
        return;
      }

      // 2. Gestionare Avertisment (Warning Banner de 5s)
      if (stormWarningData) {
        const secLeft = Math.max(0, Math.ceil((stormWarningData.endWarningAt - now) / 1000));
        const timerEl = document.getElementById('weatherAlertTimer');
        if (timerEl) timerEl.innerText = `${secLeft}s`;

        if (now >= stormWarningData.endWarningAt) {
          const stormToStart = stormWarningData.storm;
          stormWarningData = null;
          const banner = document.getElementById('cosmicWeatherAlert');
          if (banner) banner.style.display = 'none';
          startCosmicStorm(stormToStart);
        }
        return;
      }

      // 3. Verificare declanșare avertisment pentru următoarea furtună
      if (now >= nextStormTimestamp) {
        const randomStorm = COSMIC_STORMS[Math.floor(Math.random() * COSMIC_STORMS.length)];
        triggerStormWarning(randomStorm);
      }
    }

    function triggerStormWarning(stormDef) {
      stormWarningData = {
        storm: stormDef,
        endWarningAt: Date.now() + 5000 // 5 secunde alertă
      };

      const banner = document.getElementById('cosmicWeatherAlert');
      const iconEl = document.getElementById('weatherAlertIcon');
      const titleEl = document.getElementById('weatherAlertTitle');
      const timerEl = document.getElementById('weatherAlertTimer');

      if (banner && iconEl && titleEl && timerEl) {
        banner.style.setProperty('--storm-color', stormDef.themeColor);
        banner.style.setProperty('--storm-glow', stormDef.glowColor);
        iconEl.innerText = stormDef.icon;
        titleEl.innerText = `Se apropie: ${stormDef.name}!`;
        timerEl.innerText = '5s';
        banner.style.display = 'flex';
      }

      playStormKlaxonAlert();
      if (navigator.vibrate) {
        try { navigator.vibrate([60, 40, 60]); } catch (e) {}
      }
      if (document.getElementById('weatherModal')?.classList.contains('open')) {
        renderWeatherModal();
      }
    }

    /********************************************************************
     * RENDERER CANVAS HYPER-DETALIAT & SPECTACULOS (60 FPS GPU ZERO-LAG)
     ********************************************************************/
    function animateStormCanvas(now) {
      if (!activeCosmicStorm) return;
      stormAnimFrameId = requestAnimationFrame(animateStormCanvas);

      if (document.hidden) return;

      const q = state.stormQuality || 'auto';
      if (q === 'off') {
        if (stormCtx) stormCtx.clearRect(0, 0, stormCanvasW, stormCanvasH);
        return;
      }

      const dt = Math.min(0.06, (now - stormLastTime) / 1000);
      stormLastTime = now;

      stormCtx.clearRect(0, 0, stormCanvasW, stormCanvasH);

      const isMobile = stormCanvasW < 768;
      const id = activeCosmicStorm.id;

      if (id === 'solar_flare') {
        renderSolarFlare(stormCtx, stormCanvasW, stormCanvasH, now, dt, isMobile);
      } else if (id === 'tachyon_storm') {
        renderTachyonStorm(stormCtx, stormCanvasW, stormCanvasH, now, dt, isMobile);
      } else if (id === 'meteor_shower') {
        renderMeteorShower(stormCtx, stormCanvasW, stormCanvasH, now, dt, isMobile);
      } else if (id === 'chronos_rift') {
        renderChronosRift(stormCtx, stormCanvasW, stormCanvasH, now, dt, isMobile);
      } else if (id === 'void_singularity') {
        renderVoidSingularity(stormCtx, stormCanvasW, stormCanvasH, now, dt, isMobile);
      }
    }

    // 1. FURTUNĂ SOLARĂ CUANTICĂ (Văluri de Auroră, Raze Volumetrice & Vânt Solar de Foc)
    function renderSolarFlare(ctx, w, h, now, dt, isMobile) {
      const t = now * 0.001;

      // A. Văluri de Auroră Solară Plasma pe toată marginea de sus a ecranului
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let layer = 0; layer < 3; layer++) {
        const yBase = 15 + layer * 22;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, yBase);
        const steps = isMobile ? 6 : 10;
        const stepW = w / steps;
        for (let i = 0; i <= steps; i++) {
          const x = i * stepW;
          const y = yBase + Math.sin(t * 1.8 + i * 0.6 + layer) * (20 + layer * 10);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, 0);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, 0, 90 + layer * 35);
        if (layer === 0) {
          grad.addColorStop(0, 'rgba(253, 224, 71, 0.42)');
          grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        } else if (layer === 1) {
          grad.addColorStop(0, 'rgba(245, 158, 11, 0.32)');
          grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        } else {
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.22)');
          grad.addColorStop(1, 'rgba(217, 70, 239, 0)');
        }
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // B. Raze Volumetrice de Lumină (God Rays) care mătură cerul în diagonală
      const rayCount = isMobile ? 4 : 7;
      const originX = w * 0.4;
      const originY = -50;
      for (let i = 0; i < rayCount; i++) {
        const sweepAngle = (0.35 + (i / rayCount) * 0.95) + Math.sin(t * 0.4 + i) * 0.12;
        const rayLen = Math.max(w, h) * 1.35;
        const endX = originX + Math.cos(sweepAngle) * rayLen;
        const endY = originY + Math.sin(sweepAngle) * rayLen;
        const widthHalf = 45 + Math.sin(t * 0.8 + i) * 18;

        const rayGrad = ctx.createLinearGradient(originX, originY, endX, endY);
        rayGrad.addColorStop(0, 'rgba(253, 224, 71, 0.25)');
        rayGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.14)');
        rayGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(endX - widthHalf, endY);
        ctx.lineTo(endX + widthHalf, endY);
        ctx.closePath();
        ctx.fillStyle = rayGrad;
        ctx.fill();
      }

      // C. Bucle Magnetice Erupționale de Plasmă (Curbe Bezier organice groase)
      const loopCount = isMobile ? 2 : 4;
      for (let i = 0; i < loopCount; i++) {
        const pStartX = w * (0.15 + i * 0.25);
        const pEndX = pStartX + 120 + Math.sin(t + i) * 30;
        const pTopY = h * 0.65 - Math.sin(t * 1.4 + i * 1.2) * 80;

        ctx.beginPath();
        ctx.moveTo(pStartX, h + 10);
        ctx.quadraticCurveTo((pStartX + pEndX) * 0.5, pTopY, pEndX, h + 10);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
        ctx.lineWidth = isMobile ? 5 : 8;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pStartX, h + 10);
        ctx.quadraticCurveTo((pStartX + pEndX) * 0.5, pTopY, pEndX, h + 10);
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = isMobile ? 2 : 3;
        ctx.stroke();
      }

      // D. Vânt Solar cu particule incandescente & dâre de scântei
      const maxEmbers = isMobile ? 22 : 42;
      for (let i = 0; i < maxEmbers; i++) {
        const e = solarEmbersPool[i];
        if (!e.active) {
          e.active = true;
          e.x = Math.random() * w;
          e.y = Math.random() * h;
          e.speed = 100 + Math.random() * 160;
          e.angle = 0.55 + (Math.random() - 0.5) * 0.25;
          e.vx = Math.cos(e.angle) * e.speed;
          e.vy = Math.sin(e.angle) * e.speed;
          e.size = 20 + Math.random() * 25;
          e.alpha = 0.4 + Math.random() * 0.5;
        }

        e.x += e.vx * dt;
        e.y += e.vy * dt;
        if (e.y > h + 30 || e.x > w + 30) {
          e.y = -20;
          e.x = Math.random() * w;
        }

        // Desenare sprite GPU pre-randat (Lighter blend)
        if (spriteGlowSun) {
          ctx.globalAlpha = e.alpha;
          ctx.drawImage(spriteGlowSun, e.x - e.size * 0.5, e.y - e.size * 0.5, e.size, e.size);
        }
      }

      // E. Vignetă atmosferică caldă la marginea ecranului
      ctx.globalAlpha = 1.0;
      const heatVignette = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.45, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
      const heatPulse = 0.16 + Math.sin(t * 2.2) * 0.05;
      heatVignette.addColorStop(0, 'transparent');
      heatVignette.addColorStop(1, `rgba(234, 88, 12, ${heatPulse})`);
      ctx.fillStyle = heatVignette;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    // 2. FURTUNĂ DE TAHIONI SUPERCONDUCTIVĂ (Fulgere Fractale Multi-Ramificate & Flash Ionizat)
    function renderTachyonStorm(ctx, w, h, now, dt, isMobile) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // A. Flash Atmosferic pe tot ecranul
      if (lightningFlashAlpha > 0.01) {
        ctx.fillStyle = `rgba(56, 189, 248, ${lightningFlashAlpha * 0.24})`;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = `rgba(168, 85, 247, ${lightningFlashAlpha * 0.14})`;
        ctx.fillRect(0, 0, w, h);
        lightningFlashAlpha *= 0.84;
      }

      // B. Declanșare Trăsnet Fractal Nou (Interval 1.1s - 1.8s)
      if (now - lastLightningTime > (isMobile ? 1600 : 1100)) {
        lastLightningTime = now;
        lightningFlashAlpha = 1.0;
        playSyntheticChimeTone(85, now / 1000, 0.35, 0.3, 'sawtooth');
        playSyntheticChimeTone(1200, now / 1000 + 0.02, 0.12, 0.2, 'square');

        // Construire trunchi principal + 2 ramuri secundare
        const rootX = w * (0.2 + Math.random() * 0.6);
        const rootY = 0;
        const targetX = rootX + (Math.random() - 0.5) * (w * 0.55);
        const targetY = h * (0.6 + Math.random() * 0.35);

        const trunk = buildFractalBranch(rootX, rootY, targetX, targetY, 5, 55);
        lightningActiveBolts = [{ points: trunk, life: 0.18, isMain: true }];

        // Ramură secundară 1
        const midIdx1 = Math.floor(trunk.length * 0.4);
        const fork1TargetX = trunk[midIdx1].x + (Math.random() < 0.5 ? -1 : 1) * (100 + Math.random() * 140);
        const fork1TargetY = trunk[midIdx1].y + (80 + Math.random() * 120);
        const fork1 = buildFractalBranch(trunk[midIdx1].x, trunk[midIdx1].y, fork1TargetX, fork1TargetY, 4, 35);
        lightningActiveBolts.push({ points: fork1, life: 0.14, isMain: false });

        // Ramură secundară 2
        const midIdx2 = Math.floor(trunk.length * 0.7);
        const fork2TargetX = trunk[midIdx2].x + (Math.random() < 0.5 ? -1 : 1) * (80 + Math.random() * 120);
        const fork2TargetY = trunk[midIdx2].y + (70 + Math.random() * 100);
        const fork2 = buildFractalBranch(trunk[midIdx2].x, trunk[midIdx2].y, fork2TargetX, fork2TargetY, 3, 25);
        lightningActiveBolts.push({ points: fork2, life: 0.12, isMain: false });
      }

      // C. Desenare Arcuri de Fulger cu Miez Alb-Incandescent & Halou Cian/Violet
      for (let b of lightningActiveBolts) {
        b.life -= dt;
        if (b.life <= 0) continue;
        const pts = b.points;
        if (!pts || pts.length < 2) continue;

        // Mantie Exterioară Neon
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.strokeStyle = b.isMain ? 'rgba(56, 189, 248, 0.75)' : 'rgba(168, 85, 247, 0.65)';
        ctx.lineWidth = b.isMain ? (isMobile ? 5 : 8) : 3.5;
        ctx.stroke();

        // Miez Interior Alb-Hot
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = b.isMain ? (isMobile ? 2 : 2.8) : 1.2;
        ctx.stroke();

        // Stea de impact la capătul fulgerului
        const lastPt = pts[pts.length - 1];
        if (spriteSparkStar) {
          ctx.drawImage(spriteSparkStar, lastPt.x - 20, lastPt.y - 20, 40, 40);
        }
      }

      // D. Micro-Scântei care Merg pe Marginile Ecranului (Border Crawlers)
      const crawlerCount = isMobile ? 8 : 16;
      for (let i = 0; i < crawlerCount; i++) {
        const edgePos = ((now * 0.08 + i * (w / crawlerCount)) % (w + h * 2));
        let cx = 0, cy = 0;
        if (edgePos < w) { cx = edgePos; cy = 2; }
        else if (edgePos < w + h) { cx = w - 2; cy = edgePos - w; }
        else { cx = w - (edgePos - (w + h)); cy = h - 2; }

        if (spriteGlowCyan) {
          ctx.globalAlpha = 0.6 + Math.sin(now * 0.01 + i) * 0.3;
          ctx.drawImage(spriteGlowCyan, cx - 14, cy - 14, 28, 28);
        }
      }

      ctx.restore();
    }

    function buildFractalBranch(x1, y1, x2, y2, depth, displace) {
      if (depth === 0) return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
      const midX = (x1 + x2) * 0.5 + (Math.random() - 0.5) * displace;
      const midY = (y1 + y2) * 0.5 + (Math.random() - 0.5) * displace;
      const left = buildFractalBranch(x1, y1, midX, midY, depth - 1, displace * 0.52);
      const right = buildFractalBranch(midX, midY, x2, y2, depth - 1, displace * 0.52);
      return left.concat(right.slice(1));
    }

    // 3. PLOAIE DE METEORIȚI CUANTICI (Bolizi Incandescenți, Cozi de Foc & Pulverizare Supernova)
    function renderMeteorShower(ctx, w, h, now, dt, isMobile) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      meteorSpawnTimer += dt;
      const spawnInterval = isMobile ? 1.3 : 0.85;

      // Generare meteoriți
      if (meteorSpawnTimer >= spawnInterval) {
        meteorSpawnTimer = 0;
        for (let m of meteorsPool) {
          if (!m.active) {
            m.active = true;
            m.x = Math.random() * (w * 0.9);
            m.y = -40;
            m.angle = 0.72 + (Math.random() - 0.5) * 0.22;
            m.speed = 260 + Math.random() * 220;
            m.vx = Math.cos(m.angle) * m.speed;
            m.vy = Math.sin(m.angle) * m.speed;
            m.size = isMobile ? 22 : 30;
            m.hitRadius = isMobile ? 42 : 32;
            m.hasDarkMatter = Math.random() < 0.15;
            m.color = m.hasDarkMatter ? '#c084fc' : (Math.random() < 0.5 ? '#f43f5e' : '#38bdf8');
            m.glow = m.hasDarkMatter ? '#a855f7' : (m.color === '#f43f5e' ? '#f59e0b' : '#0284c7');
            for (let n of m.trailNodes) { n.x = m.x; n.y = m.y; }
            break;
          }
        }
      }

      // A. Mișcare & Desenare Meteoriți
      for (let m of meteorsPool) {
        if (!m.active) continue;

        m.x += m.vx * dt;
        m.y += m.vy * dt;

        // Ieșire din ecran
        if (m.y > h + 80 || m.x > w + 80) {
          m.active = false;
          continue;
        }

        // Trena de Foc Conică
        const tailLen = m.size * 4.5;
        const tailEndX = m.x - Math.cos(m.angle) * tailLen;
        const tailEndY = m.y - Math.sin(m.angle) * tailLen;

        const tailGrad = ctx.createLinearGradient(m.x, m.y, tailEndX, tailEndY);
        tailGrad.addColorStop(0, '#ffffff');
        tailGrad.addColorStop(0.25, m.color);
        tailGrad.addColorStop(0.65, m.glow);
        tailGrad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.strokeStyle = tailGrad;
        ctx.lineWidth = m.size * 0.55;
        ctx.lineCap = 'round';
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailEndX, tailEndY);
        ctx.stroke();

        // Nucleu Incandescent & Halou Radiant cu Sprite GPU
        const spriteToUse = m.hasDarkMatter ? spriteGlowPurple : (m.color === '#f43f5e' ? spriteGlowPink : spriteGlowCyan);
        if (spriteToUse) {
          ctx.drawImage(spriteToUse, m.x - m.size, m.y - m.size, m.size * 2, m.size * 2);
        }
        if (spriteSparkStar) {
          ctx.drawImage(spriteSparkStar, m.x - m.size * 0.6, m.y - m.size * 0.6, m.size * 1.2, m.size * 1.2);
        }

        // Mici scântei care se desprind din meteorit
        if (Math.random() < 0.4) {
          for (let s of sparksPool) {
            if (!s.active) {
              s.active = true;
              s.x = m.x - Math.cos(m.angle) * 15;
              s.y = m.y - Math.sin(m.angle) * 15;
              s.vx = (Math.random() - 0.5) * 60;
              s.vy = (Math.random() - 0.5) * 60;
              s.size = 2.5;
              s.alpha = 0.8;
              s.life = 0;
              s.maxLife = 0.25;
              s.color = m.color;
              break;
            }
          }
        }
      }

      // B. Desenare Scântei de Explozie & Detonare Supernova
      for (let s of sparksPool) {
        if (!s.active) continue;
        s.life += dt;
        if (s.life >= s.maxLife) {
          s.active = false;
          continue;
        }

        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 140 * dt; // Gravitație
        s.alpha = Math.max(0, 1 - (s.life / s.maxLife));

        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.alpha, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 4. FALIA SPAȚIO-TEMPORALĂ (Grilă Deformată Einstein, Inele Crono & Vortex Retrograd)
    function renderChronosRift(ctx, w, h, now, dt, isMobile) {
      const cx = w * 0.5;
      const cy = h * 0.5;
      const t = now * 0.001;
      chronosPhase += dt * 1.8;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // A. Grilă de Spațiu-Timp Deformată spre centru
      ctx.lineWidth = 0.75;
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.16)';
      const gridCols = isMobile ? 8 : 16;
      for (let i = 0; i <= gridCols; i++) {
        const gx = (i / gridCols) * w;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.quadraticCurveTo(cx, cy, gx, h);
        ctx.stroke();
      }
      const gridRows = isMobile ? 6 : 10;
      for (let j = 0; j <= gridRows; j++) {
        const gy = (j / gridRows) * h;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.quadraticCurveTo(cx, cy, w, gy);
        ctx.stroke();
      }

      // B. Inele Concentrice de Distorsiune Spacetime cu Aberație Cromatică
      const ringCount = isMobile ? 4 : 7;
      for (let i = 0; i < ringCount; i++) {
        const r = ((chronosPhase * 40 + i * (450 / ringCount)) % 450) + 25;
        const alpha = Math.max(0, 0.5 * (1 - r / 450));

        ctx.beginPath();
        ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
        ctx.lineWidth = 2.6;
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Aberație cromatică cian pe margine
        ctx.beginPath();
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.55})`;
        ctx.lineWidth = 1.2;
        ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // C. Inele Holografice de Astrolab / Cadran Temporal
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.35);
      ctx.beginPath();
      ctx.arc(0, 0, 160, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(216, 180, 254, 0.35)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([8, 14]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-t * 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, 220, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.28)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([12, 18]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // D. Vortex de Praf Temporal cu Mișcare Inversă (Aspirat în gaură)
      for (let p of chronosDustPool) {
        p.dist -= p.speed * dt * 2.5;
        p.ang += dt * 1.2;
        if (p.dist < 20) {
          p.dist = 300 + Math.random() * 200;
        }

        const px = cx + Math.cos(p.ang) * p.dist;
        const py = cy + Math.sin(p.ang) * p.dist;

        if (spriteGlowPurple) {
          ctx.globalAlpha = p.alpha;
          ctx.drawImage(spriteGlowPurple, px - p.size * 3, py - p.size * 3, p.size * 6, p.size * 6);
        }
      }

      ctx.restore();
    }

    // 5. ALINIEREA SINGULARITĂȚILOR VIDULUI (Disc de Acreție Relativist & Jeturi Bipolare)
    function renderVoidSingularity(ctx, w, h, now, dt, isMobile) {
      const cx = w * 0.5;
      const cy = h * 0.5;
      const t = now * 0.001;
      voidAccretionAngle += dt * 1.2;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // A. Jeturi Relativiste Bipolare (Coloane gemene verticale de înaltă energie)
      const jetWidth = isMobile ? 18 : 28;
      const jetGradTop = ctx.createLinearGradient(cx, cy, cx, 0);
      jetGradTop.addColorStop(0, '#ffffff');
      jetGradTop.addColorStop(0.2, 'rgba(236, 72, 153, 0.85)');
      jetGradTop.addColorStop(0.65, 'rgba(168, 85, 247, 0.35)');
      jetGradTop.addColorStop(1, 'transparent');

      ctx.fillStyle = jetGradTop;
      ctx.fillRect(cx - jetWidth * 0.5, 0, jetWidth, cy);

      const jetGradBottom = ctx.createLinearGradient(cx, cy, cx, h);
      jetGradBottom.addColorStop(0, '#ffffff');
      jetGradBottom.addColorStop(0.2, 'rgba(236, 72, 153, 0.85)');
      jetGradBottom.addColorStop(0.65, 'rgba(168, 85, 247, 0.35)');
      jetGradBottom.addColorStop(1, 'transparent');

      ctx.fillStyle = jetGradBottom;
      ctx.fillRect(cx - jetWidth * 0.5, cy, jetWidth, h - cy);

      // B. Disc de Acreție Rotativ cu Asimetrie Relativistă (Doppler Beaming)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(voidAccretionAngle);

      const spiralArms = isMobile ? 3 : 5;
      for (let s = 0; s < spiralArms; s++) {
        const baseAng = (s / spiralArms) * Math.PI * 2;
        ctx.beginPath();
        for (let r = 35; r < 240; r += 12) {
          const theta = baseAng + r * 0.035;
          const sx = Math.cos(theta) * r * 1.35; // Elipsă de perspectivă
          const sy = Math.sin(theta) * r * 0.55;
          if (r === 35) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = s % 2 === 0 ? 'rgba(236, 72, 153, 0.45)' : 'rgba(168, 85, 247, 0.55)';
        ctx.lineWidth = isMobile ? 4 : 7;
        ctx.stroke();
      }

      ctx.restore();

      // C. Orizontul Evenimentelor (Miez Negru Absolut cu Inel de Fotoni)
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.fillStyle = '#020617';
      ctx.fill();

      // Inelul de Fotoni Alb-Hot
      ctx.globalCompositeOperation = 'lighter';
      ctx.beginPath();
      ctx.arc(cx, cy, 34, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // D. Vignetă Întunecată Cosmică de Vid
      ctx.globalAlpha = 1.0;
      const voidVignette = ctx.createRadialGradient(cx, cy, 40, cx, cy, Math.max(w, h) * 0.72);
      const voidBreath = 0.45 + Math.sin(t * 1.6) * 0.08;
      voidVignette.addColorStop(0, 'transparent');
      voidVignette.addColorStop(0.55, 'rgba(15, 23, 42, 0.15)');
      voidVignette.addColorStop(1, `rgba(2, 6, 23, ${voidBreath})`);
      ctx.fillStyle = voidVignette;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();
    }

    /********************************************************************
     * AUDIO SINTETIZAT DEDICAT (WEB AUDIO API) PENTRU EVENIMENTE COSMICE
     ********************************************************************/
    function playStormKlaxonAlert() {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        playSyntheticChimeTone(660, now, 0.14, 0.18, 'sine');
        playSyntheticChimeTone(880, now + 0.16, 0.22, 0.22, 'sine');
      } catch (e) {}
    }

    function playSolarFlareHum() {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        playSyntheticChimeTone(95, now, 0.65, 0.32, 'sawtooth');
        playSyntheticChimeTone(220, now + 0.1, 0.45, 0.2, 'triangle');
        playSyntheticChimeTone(440, now + 0.2, 0.35, 0.15, 'sine');
      } catch (e) {}
    }

    function playTachyonThunderClap() {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } catch (e) {}
    }

    function playMeteorShatterSFX() {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        playSyntheticChimeTone(1320, now, 0.08, 0.2, 'square');
        playSyntheticChimeTone(1760, now + 0.02, 0.12, 0.22, 'sine');
        playSyntheticChimeTone(2640, now + 0.05, 0.18, 0.16, 'sine');
        playSyntheticChimeTone(110, now, 0.25, 0.28, 'triangle');
      } catch (e) {}
    }

    function playChronosWarpSFX() {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.45);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      } catch (e) {}
    }

    function playVoidSingularitySFX() {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        playSyntheticChimeTone(65, now, 0.85, 0.4, 'sine');
        playSyntheticChimeTone(130, now + 0.1, 0.6, 0.25, 'triangle');
      } catch (e) {}
    }

    /********************************************************************
     * CONTROALE MODAL RADAR & SETĂRI GRAFICĂ METEO
     ********************************************************************/
    function openWeatherModal() {
      renderWeatherModal();
      const modal = document.getElementById('weatherModal');
      if (modal) modal.classList.add('open');
    }

    function closeWeatherModal() {
      const modal = document.getElementById('weatherModal');
      if (modal) modal.classList.remove('open');
    }

    function renderWeatherModal() {
      updateWeatherModalLiveTime();

      // Butoane de Calitate
      const currentQ = state.stormQuality || 'auto';
      document.querySelectorAll('.weather-quality-btn').forEach(b => b.classList.remove('active'));
      const activeBtn = document.getElementById(`btnQual${currentQ.charAt(0).toUpperCase() + currentQ.slice(1)}`);
      if (activeBtn) activeBtn.classList.add('active');

      const qText = document.getElementById('weatherQualityText');
      if (qText) {
        if (currentQ === 'auto') qText.innerText = 'Auto (Adaptiv 60 FPS)';
        else if (currentQ === 'high') qText.innerText = 'Maxim (Spectaculos 60 FPS)';
        else if (currentQ === 'optimized') qText.innerText = 'Mobile (Particule Optimizate)';
        else qText.innerText = 'Oprit (Doar bonusuri numerice)';
      }

      // Catalog Furtuni Detectabile in Sector (Prognoza fara declansare manuala)
      const grid = document.getElementById('weatherStormsGrid');
      if (grid) {
        const now = Date.now();
        const isWarning = stormWarningData && stormWarningData.storm;
        grid.innerHTML = COSMIC_STORMS.map(s => {
          const isThisActive = activeCosmicStorm && activeCosmicStorm.id === s.id;
          const isThisWarning = isWarning && stormWarningData.storm.id === s.id;

          let badgeHtml = '';
          let telemetryDesc = '';
          let dotClass = '';

          if (isThisActive) {
            const secLeft = Math.max(0, Math.ceil((activeCosmicStorm.endAt - now) / 1000));
            badgeHtml = `<span class="weather-telemetry-badge active">🔴 ACTIV ÎN SECTOR (${secLeft}s)</span>`;
            telemetryDesc = 'Transmisie Live din Furtună';
            dotClass = 'active';
          } else if (isThisWarning) {
            badgeHtml = `<span class="weather-telemetry-badge warning">⚠️ PERTURBAȚIE IMINENTĂ</span>`;
            telemetryDesc = 'Senzori aliniați pe perturbație';
            dotClass = 'warning';
          } else {
            badgeHtml = `<span class="weather-telemetry-badge standby">🛰️ DETECTABIL (~20% prob.)</span>`;
            telemetryDesc = 'Monitorizat de Rețeaua Deep Space';
            dotClass = '';
          }

          return `
            <div class="weather-storm-card ${isThisActive ? 'active-storm' : ''}" style="--card-storm-color: ${s.themeColor}">
              <div class="weather-storm-top">
                <div class="weather-storm-title-wrap">
                  <div class="weather-storm-icon">${s.icon}</div>
                  <div>
                    <div class="weather-storm-name">${s.name}</div>
                    <div class="weather-storm-badge">${s.tag} // ${s.durationSec}s</div>
                  </div>
                </div>
                ${badgeHtml}
              </div>
              <div class="weather-storm-desc">${s.detailDesc}</div>
              <div class="weather-storm-actions">
                <div class="weather-storm-buff-tag">${s.shortDesc}</div>
                <div class="weather-sensor-telemetry">
                  <span class="radar-pulse-dot ${dotClass}"></span>
                  <span>${telemetryDesc}</span>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    function updateWeatherModalLiveTime(now = Date.now()) {
      const statusIcon = document.getElementById('weatherRadarStatusIcon');
      const statusText = document.getElementById('weatherRadarStatusText');
      const timerVal = document.getElementById('weatherRadarTimerVal');
      const timerLabel = document.getElementById('weatherRadarTimerLabel');
      const hero = document.getElementById('weatherRadarHero');

      if (activeCosmicStorm) {
        const secLeft = Math.max(0, Math.ceil((activeCosmicStorm.endAt - now) / 1000));
        if (statusIcon) statusIcon.innerText = activeCosmicStorm.icon;
        if (statusText) statusText.innerText = `${activeCosmicStorm.name} (ACTIVĂ)`;
        if (timerLabel) timerLabel.innerText = 'Se disipează în:';
        if (timerVal) timerVal.innerText = `${secLeft} secunde`;
        if (hero) {
          hero.style.borderColor = activeCosmicStorm.themeColor;
          hero.style.boxShadow = `0 0 20px ${activeCosmicStorm.glowColor}`;
        }
      } else if (stormWarningData && stormWarningData.storm) {
        const secLeft = Math.max(0, Math.ceil((stormWarningData.endWarningAt - now) / 1000));
        if (statusIcon) statusIcon.innerText = stormWarningData.storm.icon;
        if (statusText) statusText.innerText = `IMINENT: ${stormWarningData.storm.name}`;
        if (timerLabel) timerLabel.innerText = 'Impact iminent în:';
        if (timerVal) timerVal.innerText = `${secLeft}s (ALERTĂ)`;
        if (hero) {
          hero.style.borderColor = stormWarningData.storm.themeColor;
          hero.style.boxShadow = `0 0 20px ${stormWarningData.storm.glowColor}`;
        }
      } else {
        const diffMs = Math.max(0, nextStormTimestamp - now);
        const mins = Math.floor(diffMs / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        if (statusIcon) statusIcon.innerText = '🌌';
        if (statusText) statusText.innerText = 'Calm Relativ în Deep Space';
        if (timerLabel) timerLabel.innerText = 'Următoarea perturbare în:';
        if (timerVal) timerVal.innerText = timeStr;
        if (hero) {
          hero.style.borderColor = 'rgba(56, 189, 248, 0.3)';
          hero.style.boxShadow = '';
        }
      }
    }

    function setStormQuality(mode) {
      state.stormQuality = mode;
      saveGame();
      syncStormQualityUI();
      renderWeatherModal();
      showToast(`⚙️ Calitate Efecte Furtună setată la: ${mode.toUpperCase()}`);
    }

    function cycleStormQuality() {
      const modes = ['auto', 'high', 'optimized', 'off'];
      const cur = state.stormQuality || 'auto';
      const next = modes[(modes.indexOf(cur) + 1) % modes.length];
      setStormQuality(next);
    }

    function syncStormQualityUI() {
      const btn = document.getElementById('btnStormQuality');
      if (btn) {
        const q = state.stormQuality || 'auto';
        btn.innerText = `🌪️ Meteo: ${q.toUpperCase()}`;
        btn.style.borderColor = q === 'off' ? '#ef4444' : 'var(--accent-cyan)';
      }
    }

