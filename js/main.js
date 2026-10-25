    /********************************************************************
     * 12. GAME LOOP (60 FPS) & TIMERE AUTOMATE
     ********************************************************************/
    let lastTick = performance.now();
    let fpsFrames = 0;
    let fpsLastSampleTime = performance.now();
    let currentFps = 60;
    let cachedCurrentCPS = -1;
    let lastCpsCalcTime = 0;
    function getCPSCached(now) {
      if (now - lastCpsCalcTime >= 100 || cachedCurrentCPS < 0) {
        lastCpsCalcTime = now;
        cachedCurrentCPS = getCPS();
      }
      return cachedCurrentCPS;
    }

    let secAccumulator = 0;
    let passivePulseAccumulator = 0;
    let autoCursorAccumulator = 0;
    let spectralClickAccumulator = 0;
    let robotBarrageAccumulator = 0;
    let tachyonBurstAccumulator = 0;
    let blackHoleEventAccumulator = 0;
    let universeEventAccumulator = 0;

    function gameLoop(now) {
      const dt = Math.min(0.25, (now - lastTick) / 1000);
      lastTick = now;
      secondsSinceLastManualClick += dt;

      // Contorizare & Calcul FPS (eșantionare precisă la 500ms, zero overhead pe CPU/GPU)
      fpsFrames++;
      const fpsElapsed = now - fpsLastSampleTime;
      if (fpsElapsed >= 500) {
        currentFps = Math.max(1, Math.round((fpsFrames * 1000) / fpsElapsed));
        fpsFrames = 0;
        fpsLastSampleTime = now;
        const fpsValEl = document.getElementById('fpsValueText');
        if (fpsValEl) {
          fpsValEl.textContent = currentFps;
        }
        const fpsBadgeEl = document.getElementById('fpsMeterBadge');
        if (fpsBadgeEl) {
          const tier = currentFps >= 50 ? 'fps-high' : (currentFps >= 30 ? 'fps-mid' : 'fps-low');
          if (fpsBadgeEl.dataset.tier !== tier) {
            fpsBadgeEl.dataset.tier = tier;
            fpsBadgeEl.className = 'fps-meter-badge ' + tier;
          }
        }
      }

      // Sistem Vreme Cosmică & Furtuni Stelare (Evenimente Dinamice)
      if (typeof tickCosmicWeather === 'function') {
        tickCosmicWeather(dt);
      }

      // Producția pasivă pe secundă (eșantionare optimizată la 100ms)
      const cps = getCPSCached(now);
      if (cps > 0) {
        addEnergy(cps * dt);
        if (cps > (state.maxCps || 0)) {
          state.maxCps = cps;
        }
        passivePulseAccumulator += dt;
        if (passivePulseAccumulator >= 1.35) {
          passivePulseAccumulator %= 1.35;
          triggerPassiveVisualPulse();
        }
      }

      // Mecanică Unică Nano-Cursor (g0): Auto-Click pe Nucleu perfect sincronizat cu cursoarele orbitale
      const g0Count = (state.generators && state.generators['g0']) || 0;
      const isOverdriveActive = Date.now() < (activeBuffs.overdriveOrbEnd || 0);
      if (g0Count > 0 || isOverdriveActive) {
        const visibleCursors = g0Count <= 0 ? 0 : Math.min(16, g0Count <= 8 ? g0Count : 8 + Math.floor(Math.log2(g0Count - 6) * 2.5));
        const activeCursorsCount = Math.max(1, visibleCursors);
        const cycleDuration = isOverdriveActive ? 0.6 : 1.2;
        const autoInterval = Math.max(0.075, cycleDuration / activeCursorsCount);
        autoCursorAccumulator += dt;
        if (autoCursorAccumulator >= autoInterval) {
          autoCursorAccumulator %= autoInterval;
          triggerAutoCursorStrike();
        }
      }

      // Mecanică Vizuală Dronă de Extracție / Roboți (g1): Salvă Laser Sincronizată la fiecare 7.5s
      if (((state.generators && state.generators['g1']) || 0) > 0) {
        robotBarrageAccumulator += dt;
        if (robotBarrageAccumulator >= 7.5) {
          robotBarrageAccumulator %= 7.5;
          triggerRobotLaserBarrage();
        }
      }

      // Mecanică Unică Condensator Tahionic (g3): Explozie Burst la fiecare 5.0s
      if (((state.generators && state.generators['g3']) || 0) > 0) {
        tachyonBurstAccumulator += dt;
        if (tachyonBurstAccumulator >= 5.0) {
          tachyonBurstAccumulator %= 5.0;
          triggerTachyonCapacitorBurst();
        }
      }

      // Eveniment Cinematic Micro-Gaură Neagră (g6): La fiecare 18s înghite Nucleul pentru câteva secunde și îl scuipă cu Erupție Hawking!
      if (((state.generators && state.generators['g6']) || 0) > 0) {
        blackHoleEventAccumulator += dt;
        if (blackHoleEventAccumulator >= 18.0) {
          blackHoleEventAccumulator %= 18.0;
          triggerBlackHoleDevourEvent();
        }
      }

      // Eveniment Cinematic Motor de Univers Sintetic (g9): La fiecare 22s deschide Portalul Big Bang Multi-Dimensional!
      if (((state.generators && state.generators['g9']) || 0) > 0) {
        universeEventAccumulator += dt;
        if (universeEventAccumulator >= 22.0) {
          universeEventAccumulator %= 22.0;
          triggerSyntheticUniverseGenesis();
        }
      }

      // Contorizare secunde în Overclock Fever (>=85%) & scădere adaptată cu Sincronizare Tahionică (p_combo_lock)
      const isTachyonStormActive = typeof activeCosmicStorm !== 'undefined' && activeCosmicStorm && activeCosmicStorm.id === 'tachyon_storm';
      if (isOverdriveActive || isTachyonStormActive) {
        comboMeter = 100;
      }
      if (comboMeter >= 85) {
        state.feverSeconds = (state.feverSeconds || 0) + dt;
      }
      const comboLockLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_combo_lock']) || 0;
      const graceTime = 1550 + comboLockLvl * 650;
      if (!isOverdriveActive && comboMeter > 0 && (now - lastComboClickTime) > graceTime) {
        const aiCount = (state.generators && state.generators['g2']) || 0;
        const decayRate = Math.max(2.0, 9.5 - aiCount * 0.25 - comboLockLvl * 0.6);
        comboMeter = Math.max(0, comboMeter - decayRate * dt);
      }

      // Autoclicker Spectral (Calea Manuală T4: Pulsar Spectral)
      const autoClickLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_autoclick_spectral']) || 0;
      if (autoClickLvl > 0) {
        spectralClickAccumulator += dt * (autoClickLvl * 4);
        while (spectralClickAccumulator >= 1) {
          spectralClickAccumulator -= 1;
          const center = getCoreCenter();
          const cx = center.x + (Math.random() - 0.5) * 40;
          const cy = center.y + (Math.random() - 0.5) * 40;
          handleCoreClick(cx, cy, true);
        }
      }

      secAccumulator += dt;
      if (secAccumulator >= 1) {
        state.playTimeSeconds += Math.floor(secAccumulator);
        secAccumulator %= 1;
        checkAchievements();
        if (document.getElementById('tab-stats').classList.contains('active')) {
          renderStats();
        }
        if (isStatsFullscreenOpen) {
          renderStatsFullscreen();
        }
      }

      updateUI();
      requestAnimationFrame(gameLoop);
    }

    /********************************************************************
     * 12. ECRAN DE ÎNCĂRCARE & BUN VENIT CU ANIMAȚIE CUANTICĂ (5 SECUNDE)
     ********************************************************************/
    function initWelcomeLoadingScreen() {
      const loadingScreen = document.getElementById('loadingScreen');
      if (!loadingScreen) return;

      // Pornim muzica de fundal la lansarea ecranului de încărcare
      if (state && state.musicEnabled) {
        startCosmicMusic();
      }

      // Orice atingere/click oriunde pe ecranul de încărcare deblochează instant sunetul și intră direct în joc
      loadingScreen.addEventListener('pointerdown', () => {
        if (state && state.musicEnabled && bgMusicAudio && bgMusicAudio.paused) {
          startCosmicMusic();
        }
        completeLoadingScreen();
      }, { passive: true });

      // Personalizare mesaj de bun venit dacă există nume salvat
      const greetEl = document.getElementById('loadingCommanderGreet');
      const cmdName = (typeof getCommanderDisplayName === 'function') ? getCommanderDisplayName() : 'Comandant';
      if (greetEl) {
        greetEl.innerText = (cmdName && cmdName !== 'Comandant')
          ? `Bun venit, ${cmdName}!`
          : 'Bun venit în Singularitate, Comandant!';
      }

      const loadVer = document.getElementById('loadingVersionSub');
      if (loadVer) loadVer.innerText = `Simulare Multiversală v${APP_VERSION} // Auto-Stabilizare Activă`;

      // Inițializare particule/stele cosmice pe fundal
      const canvas = document.getElementById('loadingStarsCanvas');
      let animFrameId = null;
      let stars = [];

      const onResize = () => {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      if (canvas) {
        const ctx = canvas.getContext('2d');
        onResize();
        window.addEventListener('resize', onResize);

        const starCount = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 12000));
        for (let i = 0; i < starCount; i++) {
          stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 0.8 + Math.random() * 2.2,
            speedY: -0.15 - Math.random() * 0.45,
            speedX: (Math.random() - 0.5) * 0.3,
            color: Math.random() > 0.4 ? '#38bdf8' : (Math.random() > 0.5 ? '#c084fc' : '#ffffff'),
            alpha: 0.2 + Math.random() * 0.7,
            pulseSpeed: 0.02 + Math.random() * 0.03
          });
        }

        const renderStars = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          stars.forEach(s => {
            s.y += s.speedY;
            s.x += s.speedX;
            if (s.y < 0) s.y = canvas.height;
            if (s.x < 0) s.x = canvas.width;
            if (s.x > canvas.width) s.x = 0;

            s.alpha += Math.sin(Date.now() * 0.003 * s.pulseSpeed) * 0.02;
            const a = Math.max(0.15, Math.min(0.95, s.alpha));

            ctx.save();
            ctx.globalAlpha = a;
            ctx.shadowBlur = s.size * 3;
            ctx.shadowColor = s.color;
            ctx.fillStyle = s.color;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
          animFrameId = requestAnimationFrame(renderStars);
        };
        animFrameId = requestAnimationFrame(renderStars);
      }

      // Progresie fină timp de exact 5 secunde (5000 ms)
      const TOTAL_DURATION = 5000;
      const startTime = performance.now();
      const fillEl = document.getElementById('loadingBarFill');
      const pctEl = document.getElementById('loadingPctText');
      const statusEl = document.getElementById('loadingStatusText');

      const statusPhases = [
        { at: 0, text: '⚡ Calibrare reactor cuantic & matrici fotonice...' },
        { at: 1100, text: '🌌 Stabilizare câmp de distorsiune spațiu-timp...' },
        { at: 2200, text: '🔮 Sincronizare rețea tachionică & salvare locală...' },
        { at: 3400, text: '✨ Încărcare generatoare & sinergie dimensională...' },
        { at: 4400, text: '🚀 Secvență finalizată. Bine ai venit în Quantum Nexus!' }
      ];

      let lastPhaseIdx = -1;

      const updateProgress = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / TOTAL_DURATION);
        const pct = Math.floor(progress * 100);

        if (fillEl) fillEl.style.width = `${progress * 100}%`;
        if (pctEl) pctEl.innerText = `${pct}%`;

        // Tranziție fină între fazele de status
        for (let i = statusPhases.length - 1; i >= 0; i--) {
          if (elapsed >= statusPhases[i].at) {
            if (lastPhaseIdx !== i) {
              lastPhaseIdx = i;
              if (statusEl) {
                statusEl.style.opacity = '0';
                setTimeout(() => {
                  statusEl.innerText = statusPhases[i].text;
                  statusEl.style.opacity = '1';
                }, 130);
              }
            }
            break;
          }
        }

        if (progress < 1) {
          requestAnimationFrame(updateProgress);
        } else {
          setTimeout(completeLoadingScreen, 120);
        }
      };

      requestAnimationFrame(updateProgress);

      let isCompleted = false;
      function completeLoadingScreen() {
        if (isCompleted) return;
        isCompleted = true;
        if (state && state.musicEnabled && bgMusicAudio && bgMusicAudio.paused) {
          startCosmicMusic();
        }
        // Sunet futurist de bun venit (Acord cosmic ascendent C5 -> E5 -> G5 -> C6)
        try {
          if (state && state.soundEnabled) {
            playTone(523.25, 'sine', 0.22, 0.08); // C5
            setTimeout(() => playTone(659.25, 'sine', 0.22, 0.09), 80); // E5
            setTimeout(() => playTone(783.99, 'sine', 0.30, 0.10), 160); // G5
            setTimeout(() => playTone(1046.50, 'triangle', 0.45, 0.12), 250); // C6
          }
        } catch (e) {}

        // Tranziție de ieșire (zoom out lin + estompare de luminozitate)
        loadingScreen.classList.add('loading-exit');

        setTimeout(() => {
          if (animFrameId) cancelAnimationFrame(animFrameId);
          window.removeEventListener('resize', onResize);
          loadingScreen.style.display = 'none';
          showToast('🌌 Bine ai venit în Quantum Nexus! Toate sistemele sunt online.');
          checkDailyAutoPopup();
        }, 850);
      }
    }

    // Inițializare la pornire
    window.addEventListener('DOMContentLoaded', () => {
      loadGame();
      initDailySystem();
      renderAll();
      initCloudSystem();
      initSocialSystem();
      hideInstallButtonsIfInstalled();
      initCosmicInteractiveCanvas();
      initCosmicStormCanvas();
      syncStormQualityUI();
      syncFpsCounterUI();
      initWelcomeLoadingScreen();
      requestAnimationFrame(gameLoop);
      if (state && state.musicEnabled) {
        startCosmicMusic();
      }

      const verSub = document.getElementById('versionHeaderSub');
      if (verSub) verSub.innerText = `v${APP_VERSION}`;
      const setVer = document.getElementById('settingsVersionText');
      if (setVer) setVer.innerText = `v${APP_VERSION}`;
      const loadVerInit = document.getElementById('loadingVersionSub');
      if (loadVerInit) loadVerInit.innerText = `Simulare Multiversală v${APP_VERSION} // Auto-Stabilizare Activă`;

      // Înregistrare Service Worker pentru rulare 100% Offline + Auto-Update
      if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
        navigator.serviceWorker.register('./sw.js').then((reg) => {
          swRegistration = reg;
          reg.addEventListener('updatefound', () => {
            checkForGameUpdate(false);
          });
        }).catch(() => {});
      }

      // Verificare inițială de Update când pornește jocul (dacă are internet)
      setTimeout(() => checkForGameUpdate(false), 2500);

      // Verificare automată de Update la fiecare 45 secunde (pentru toți jucătorii online)
      setInterval(() => {
        if (navigator.onLine) {
          checkForGameUpdate(false);
        }
      }, 45000);

      // Auto-Save local la fiecare 5 secunde
      setInterval(saveGame, 5000);

      // Auto-Sync silențios în Cloud la fiecare 25 secunde (sau retrimitere dacă era în așteptare)
      setInterval(() => {
        if (navigator.onLine && cloudSession && (cloudSession.access_token || cloudSession.refresh_token)) {
          if (pendingCloudSync) {
            syncOfflineProgressToServer();
          } else {
            cloudPushSave(false);
          }
        }
      }, 25000);

      // Heartbeat Social & Prezență Galactică (actualizare prezență la fiecare 35 secunde)
      setTimeout(() => {
        if (navigator.onLine) {
          updatePresence(true);
          fetchLiveCommanders(false);
        }
      }, 3000);
      setInterval(() => {
        if (navigator.onLine) {
          if (cloudSession && cloudSession.access_token) {
            updatePresence(true);
          }
          fetchLiveCommanders(false);
        }
      }, 35000);

      // Schedule dinamic pentru Sfere Cuantice Anomaly (influențat direct de talentul p_anom_frequency)
      function scheduleNextAnomaly() {
        const freqLvl = (state.prestigeUpgrades && state.prestigeUpgrades.p_anom_frequency) || 0;
        const baseDelay = 22000 + Math.random() * 14000;
        const isVoidSingularity = typeof activeCosmicStorm !== 'undefined' && activeCosmicStorm && activeCosmicStorm.id === 'void_singularity';
        const delay = Math.max(3500, (baseDelay / (1 + freqLvl * 0.25)) / (isVoidSingularity ? 3.0 : 1.0));
        setTimeout(() => {
          if (document.visibilityState === 'visible') {
            spawnQuantumAnomaly(false);
          }
          scheduleNextAnomaly();
        }, delay);
      }
      setTimeout(scheduleNextAnomaly, 14000);

      // Verificare parametru URL opțional pentru testare rapidă (ex: ?storm=solar_flare)
      try {
        const stormParam = new URLSearchParams(window.location.search).get('storm');
        if (stormParam && typeof forceTriggerStorm === 'function') {
          setTimeout(() => forceTriggerStorm(stormParam), 600);
        }
      } catch (e) {}
    });

    // Salvare garantată la închiderea sau schimbarea aplicației/tab-ului
    window.addEventListener('beforeunload', () => {
      saveGame();
      if (cloudSession && cloudSession.access_token) {
        cloudPushSave(false);
        updatePresence(false);
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        saveGame();
        if (cloudSession && cloudSession.access_token) {
          cloudPushSave(false);
          updatePresence(false);
        }
      } else if (document.visibilityState === 'visible' && navigator.onLine) {
        if (pendingCloudSync && cloudSession && (cloudSession.access_token || cloudSession.refresh_token)) {
          syncOfflineProgressToServer();
        }
        if (cloudSession && cloudSession.access_token) {
          updatePresence(true);
        }
        fetchLiveCommanders(false);
        checkForGameUpdate(false);
      }
    });
