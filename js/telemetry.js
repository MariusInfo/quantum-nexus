    // =========================================================================
    // V3.9.5: TELEMETRIE & OBSERVATOR CUANTIC (FULLSCREEN STATISTICS & WARP)
    // =========================================================================
    let isStatsFullscreenOpen = false;
    let statsBgAnimFrame = null;
    let statsWarpAnimFrameId = null;
    const statsBgStars = [];
    let statsEventsBound = false;

    function playStatsWarpSound(direction = 'enter') {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;

        if (direction === 'enter') {
          // Futuristic telemetry electronic harmonic sweep
          const freqs = [220.00, 277.18, 329.63, 415.30, 659.25];
          freqs.forEach((f, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = idx === 0 ? 'sine' : 'triangle';
            const st = now + idx * 0.035;
            osc.frequency.setValueAtTime(f * 0.85, st);
            osc.frequency.exponentialRampToValueAtTime(f * 1.05, st + 0.35);
            gain.gain.setValueAtTime(0.001, st);
            gain.gain.linearRampToValueAtTime(0.08 / freqs.length, st + 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, st + 0.55);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(st);
            osc.stop(st + 0.55);
          });
        } else {
          // Exit telemetry frequency drop
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(340, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.32);
        }
      } catch (e) {}
    }

    function runStatsFullscreenWarp(duration = 700, onComplete) {
      const canvas = document.getElementById('statsWarpCanvas');
      if (!canvas) {
        if (onComplete) onComplete();
        return;
      }
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      const ctx = canvas.getContext('2d');

      canvas.style.display = 'block';
      canvas.style.opacity = '1';

      const particleCount = 360;
      const particles = [];
      const colors = ['#06b6d4', '#10b981', '#38bdf8', '#ffffff', '#a7f3d0', '#0ea5e9'];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: (Math.random() - 0.5) * w * 2.2,
          y: (Math.random() - 0.5) * h * 2.2,
          z: Math.random() * 1500 + 100,
          pz: 1600,
          color: colors[i % colors.length],
          size: Math.random() * 2.4 + 0.8
        });
      }

      const startTime = performance.now();

      function stepWarp(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.fillStyle = 'rgba(2, 6, 23, 0.28)';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const speed = 25 + progress * 55;

        particles.forEach(p => {
          p.pz = p.z;
          p.z -= speed;
          if (p.z <= 0) {
            p.z = 1500;
            p.pz = 1500;
            p.x = (Math.random() - 0.5) * w * 2.2;
            p.y = (Math.random() - 0.5) * h * 2.2;
          }

          const k = 400 / p.z;
          const px = p.x * k + cx;
          const py = p.y * k + cy;

          const pk = 400 / p.pz;
          const ppx = p.x * pk + cx;
          const ppy = p.y * pk + cy;

          ctx.beginPath();
          ctx.moveTo(ppx, ppy);
          ctx.lineTo(px, py);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.min(4, p.size * k * 0.8);
          ctx.lineCap = 'round';
          ctx.stroke();
        });

        // Peak Flash
        if (progress > 0.35 && progress < 0.7) {
          const flashAlpha = Math.sin(((progress - 0.35) / 0.35) * Math.PI) * 0.7;
          ctx.fillStyle = '#06b6d4';
          ctx.globalAlpha = flashAlpha * 0.4;
          ctx.fillRect(0, 0, w, h);
          ctx.globalAlpha = 1.0;
        }

        ctx.restore();

        if (progress < 1) {
          statsWarpAnimFrameId = requestAnimationFrame(stepWarp);
        } else {
          canvas.style.transition = 'opacity 0.25s ease';
          canvas.style.opacity = '0';
          setTimeout(() => {
            canvas.style.display = 'none';
            canvas.style.transition = '';
            if (onComplete) onComplete();
          }, 250);
        }
      }

      statsWarpAnimFrameId = requestAnimationFrame(stepWarp);
    }

    function openStatsFullscreen() {
      if (isStatsFullscreenOpen) return;
      isStatsFullscreenOpen = true;

      playStatsWarpSound('enter');

      const appShell = document.querySelector('.app-shell');
      if (appShell) appShell.classList.add('app-shell-warp-out');

      runStatsFullscreenWarp(700, () => {});

      setTimeout(() => {
        const fsEl = document.getElementById('statsFullscreen');
        if (fsEl) {
          fsEl.style.display = 'flex';
          void fsEl.offsetWidth;
          fsEl.classList.add('active');
        }
        initStatsFullscreen();
        renderStatsFullscreen();
      }, 420);
    }

    function closeStatsFullscreen() {
      if (!isStatsFullscreenOpen) return;
      isStatsFullscreenOpen = false;

      playStatsWarpSound('exit');

      const fsEl = document.getElementById('statsFullscreen');
      if (fsEl) {
        fsEl.classList.remove('active');
      }

      const appShell = document.querySelector('.app-shell');
      if (appShell) {
        appShell.classList.remove('app-shell-warp-out');
        appShell.classList.add('app-shell-warp-in');
        setTimeout(() => appShell.classList.remove('app-shell-warp-in'), 600);
      }

      setTimeout(() => {
        if (fsEl && !isStatsFullscreenOpen) {
          fsEl.style.display = 'none';
        }
        if (statsBgAnimFrame) {
          cancelAnimationFrame(statsBgAnimFrame);
          statsBgAnimFrame = null;
        }
      }, 400);
    }

    function initStatsFullscreen() {
      const bgCanvas = document.getElementById('statsBgCanvas');
      if (!bgCanvas) return;

      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      bgCanvas.width = Math.floor(w * dpr);
      bgCanvas.height = Math.floor(h * dpr);

      if (statsBgStars.length === 0) {
        const count = 150;
        const colors = ['#06b6d4', '#10b981', '#38bdf8', '#ffffff', '#a7f3d0', '#67e8f9'];
        for (let i = 0; i < count; i++) {
          statsBgStars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.6 + 0.4,
            baseAlpha: Math.random() * 0.6 + 0.2,
            twinkleSpeed: Math.random() * 0.003 + 0.001,
            phase: Math.random() * Math.PI * 2,
            color: colors[i % colors.length]
          });
        }
      }

      if (!statsEventsBound) {
        statsEventsBound = true;
        window.addEventListener('resize', () => {
          if (isStatsFullscreenOpen && bgCanvas) {
            const curDpr = window.devicePixelRatio || 1;
            bgCanvas.width = Math.floor(window.innerWidth * curDpr);
            bgCanvas.height = Math.floor(window.innerHeight * curDpr);
          }
        });
      }

      if (!statsBgAnimFrame) {
        statsBgAnimFrame = requestAnimationFrame(runStatsBgLoop);
      }
    }

    function runStatsBgLoop(timestamp) {
      if (!isStatsFullscreenOpen) {
        statsBgAnimFrame = null;
        return;
      }

      const canvas = document.getElementById('statsBgCanvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const dpr = window.devicePixelRatio || 1;

        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;

        // 1. Ambient High-Tech Cyan-Emerald Nebula
        const grad = ctx.createRadialGradient(cx, cy * 0.35, 0, cx, cy * 0.35, Math.max(w, h) * 0.65);
        grad.addColorStop(0, 'rgba(14, 165, 233, 0.08)');
        grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.04)');
        grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 2. Telemetric Grid
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.035)';
        ctx.lineWidth = 1 * dpr;
        const step = 64 * dpr;
        ctx.beginPath();
        for (let x = 0; x < w; x += step) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
        }
        for (let y = 0; y < h; y += step) {
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
        }
        ctx.stroke();

        // 3. Oscilloscope Waveform at lower screen
        const waveY = h - 65 * dpr;
        ctx.beginPath();
        for (let x = 0; x < w; x += 4 * dpr) {
          const normX = x / w;
          const s1 = Math.sin(normX * 16 + timestamp * 0.0022);
          const s2 = Math.sin(normX * 32 - timestamp * 0.0031) * 0.45;
          const y = waveY + (s1 + s2) * 12 * dpr;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.32)';
        ctx.lineWidth = 1.5 * dpr;
        ctx.stroke();

        // 4. Data Starfield
        statsBgStars.forEach(s => {
          const alpha = s.baseAlpha + Math.sin(timestamp * s.twinkleSpeed + s.phase) * 0.25;
          ctx.beginPath();
          ctx.arc(s.x * dpr, s.y * dpr, s.r * dpr, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = Math.max(0.1, alpha);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;
      }

      statsBgAnimFrame = requestAnimationFrame(runStatsBgLoop);
    }

    function switchStatsFsFilter(catId, btnEl) {
      document.querySelectorAll('.stats-cat-tab-btn').forEach(b => b.classList.remove('active'));
      if (btnEl) btnEl.classList.add('active');
      const panels = document.querySelectorAll('.stats-telemetry-panel');
      panels.forEach(p => {
        if (catId === 'all' || p.dataset.cat === catId) {
          p.style.display = 'flex';
        } else {
          p.style.display = 'none';
        }
      });
    }

    function copyTelemetryReport() {
      const cps = formatNumber(getCPS());
      const energy = formatNumber(state.energy);
      const clicks = (state.totalClicks || 0).toLocaleString('ro-RO');
      const crits = (state.totalCrits || 0).toLocaleString('ro-RO');
      const critRate = state.totalClicks > 0 ? ((state.totalCrits / state.totalClicks) * 100).toFixed(1) + '%' : '0.0%';
      const dm = (state.darkMatter || 0).toLocaleString('ro-RO');
      const prestige = state.prestigeCount || 0;
      const ach = (state.unlockedAchievements || []).length;
      const time = formatTime(state.playTimeSeconds || 0);
      const cloud = (cloudSession && (cloudSession.access_token || cloudSession.refresh_token)) ? 'Conectat' : 'Local';

      const report = [
        `=== QUANTUM NEXUS // RAPORT TELEMETRIE CUANTICĂ ===`,
        `Versiune: v${APP_VERSION} (Build ${APP_BUILD})`,
        `Timp Simulare: ${time} | Status Cloud: ${cloud}`,
        `--------------------------------------------------`,
        `⚡ Sold Curent: ${energy} ⚡ | CPS: ${cps} ⚡/s`,
        `🎯 Click-uri Totale: ${clicks} | Critice: ${crits} (${critRate})`,
        `🔮 Singularități: #${prestige} | Materie Întunecată: ${dm} 🔮`,
        `🏆 Realizări Deblocate: ${ach} / 330`,
        `==================================================`
      ].join('\n');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(report).then(() => {
          showToast('📋 Raportul telemetric a fost copiat în clipboard!');
        }).catch(() => {
          showToast('📋 Raport telemetric generat!');
        });
      } else {
        showToast('📋 Raport telemetric generat!');
      }
    }

    function renderStatsFullscreen() {
      if (!isStatsFullscreenOpen) return;

      const totalGenCount = typeof getTotalGenerators === 'function' ? getTotalGenerators() : 0;
      const activeGenTypes = GENERATORS_DATA.filter(g => (state.generators && state.generators[g.id]) > 0).length;
      const highestGen = GENERATORS_DATA.slice().reverse().find(g => (state.generators && state.generators[g.id]) > 0)?.name || 'Niciunul';
      const totalClicks = state.totalClicks || 0;
      const totalCrits = state.totalCrits || 0;
      const critRate = totalClicks > 0 ? ((totalCrits / totalClicks) * 100).toFixed(1) + '%' : '0.0%';
      const anomaliesCaught = state.anomaliesCaught || 0;
      const anomaliesMissed = state.anomaliesMissed || 0;
      const anomalyAccuracy = (anomaliesCaught + anomaliesMissed) > 0 ? ((anomaliesCaught / (anomaliesCaught + anomaliesMissed)) * 100).toFixed(1) + '%' : '100.0%';
      const constellationNodesUnlocked = Object.values(state.prestigeUpgrades || {}).filter(lvl => lvl > 0).length;
      const constellationTotalLevels = Object.values(state.prestigeUpgrades || {}).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
      const mythicAchCount = (state.unlockedAchievements || []).filter(id => ACHIEVEMENTS_DATA.find(a => a.id === id)?.rarity === 'mythic').length;
      const totalMythicAch = ACHIEVEMENTS_DATA.filter(a => a.rarity === 'mythic').length;
      const rareAchCount = (state.unlockedAchievements || []).filter(id => ACHIEVEMENTS_DATA.find(a => a.id === id)?.rarity === 'rare').length;
      const totalRareAch = ACHIEVEMENTS_DATA.filter(a => a.rarity === 'rare').length;
      const achPct = (((state.unlockedAchievements || []).length / ACHIEVEMENTS_DATA.length) * 100).toFixed(1);

      const offlineLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_offline']) || 0;
      const offlineEffPct = Math.round(Math.min(0.80, 0.40 + offlineLvl * 0.08) * 100);
      const twinAnomPct = ((state.prestigeUpgrades && state.prestigeUpgrades['p_twin_anomaly']) || 0) * 18;
      const anomFreqPct = ((state.prestigeUpgrades && state.prestigeUpgrades['p_anom_frequency']) || 0) * 25;
      const magnetPct = ((state.prestigeUpgrades && state.prestigeUpgrades['p_celestial_magnet']) || 0) * 25;

      const cpsStr = formatNumber(getCPS()) + ' ⚡/s';
      const curEnergyStr = formatNumber(state.energy) + ' ⚡';
      const clickValStr = formatNumber(getClickValue()) + ' ⚡/click';
      const globalMultStr = 'x' + formatNumber(getGlobalMultiplier());
      const lifetimeEnergyStr = formatNumber(state.lifetimeEnergy) + ' ⚡';
      const currentRunEnergyStr = formatNumber(state.totalEnergyEarned || state.energy) + ' ⚡';

      const dmStr = `${(state.darkMatter || 0).toLocaleString('ro-RO')} 🔮`;
      const lifetimeDmStr = `${(state.totalDarkMatterEarned || 0).toLocaleString('ro-RO')} 🔮`;
      const presCountStr = (state.prestigeCount || 0).toString();
      const presBonusStr = `+${(state.prestigeCount || 0) * 10}%`;

      const playTimeStr = formatTime(state.playTimeSeconds || 0);
      const currentRunTimeStr = formatTime(state.currentRunTimeSeconds || 0);
      const dailyStreakStr = `${state.dailyStreak || 1} zile`;
      const lastSavedStr = state.lastSaved ? new Date(state.lastSaved).toLocaleTimeString('ro-RO') : 'Niciodată';
      const cloudSyncStr = (cloudSession && (cloudSession.access_token || cloudSession.refresh_token)) ? '🟢 Conectat & Sincronizat' : '⚪ Nelogat (Doar Salvare Locală)';

      // Radar time calculation
      let radarTimeStr = '--:--';
      const now = Date.now();
      if (activeCosmicStorm) {
        const secLeft = Math.max(0, Math.ceil((activeCosmicStorm.endAt - now) / 1000));
        radarTimeStr = `${secLeft}s (ACTIVA)`;
      } else if (stormWarningData && stormWarningData.storm) {
        const secLeft = Math.max(0, Math.ceil((stormWarningData.endWarningAt - now) / 1000));
        radarTimeStr = `${secLeft}s (ALERTĂ)`;
      } else {
        const diffMs = Math.max(0, nextStormTimestamp - now);
        const mins = Math.floor(diffMs / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        radarTimeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }

      // 1. Header Badges
      const hCps = document.getElementById('statFsH_cps');
      if (hCps) hCps.textContent = cpsStr;
      const hClick = document.getElementById('statFsH_click');
      if (hClick) hClick.textContent = formatNumber(getClickValue()) + ' ⚡';
      const hDm = document.getElementById('statFsH_dm');
      if (hDm) hDm.textContent = dmStr;
      const hTime = document.getElementById('statFsH_time');
      if (hTime) hTime.textContent = playTimeStr;

      // 2. Hero Cards
      const heroCps = document.getElementById('statFsHero_cps');
      if (heroCps) heroCps.textContent = cpsStr;
      const heroEnergy = document.getElementById('statFsHero_energy');
      if (heroEnergy) heroEnergy.textContent = `Sold: ${curEnergyStr}`;

      const heroDm = document.getElementById('statFsHero_dm');
      if (heroDm) heroDm.textContent = dmStr;
      const heroPresCount = document.getElementById('statFsHero_presCount');
      if (heroPresCount) heroPresCount.textContent = `#${presCountStr} Rebirth-uri (${presBonusStr})`;

      const heroCrit = document.getElementById('statFsHero_critRate');
      if (heroCrit) heroCrit.textContent = `${critRate} Crit`;
      const heroClicks = document.getElementById('statFsHero_clicks');
      if (heroClicks) heroClicks.textContent = `${totalClicks.toLocaleString('ro-RO')} Click-uri`;

      const heroAchPct = document.getElementById('statFsHero_achPct');
      if (heroAchPct) heroAchPct.textContent = `${achPct}%`;
      const heroAchCount = document.getElementById('statFsHero_achCount');
      if (heroAchCount) heroAchCount.textContent = `${(state.unlockedAchievements || []).length} / ${ACHIEVEMENTS_DATA.length} Trofee`;

      // 3. Panel 1: Energie
      const valCurEnergy = document.getElementById('statFsVal_curEnergy');
      if (valCurEnergy) valCurEnergy.textContent = curEnergyStr;
      const valCps = document.getElementById('statFsVal_cps');
      if (valCps) valCps.textContent = cpsStr;
      const valClickVal = document.getElementById('statFsVal_clickVal');
      if (valClickVal) valClickVal.textContent = clickValStr;
      const valGlobalMult = document.getElementById('statFsVal_globalMult');
      if (valGlobalMult) valGlobalMult.textContent = globalMultStr;
      const valLifetimeEnergy = document.getElementById('statFsVal_lifetimeEnergy');
      if (valLifetimeEnergy) valLifetimeEnergy.textContent = lifetimeEnergyStr;
      const valCurrentRunEnergy = document.getElementById('statFsVal_currentRunEnergy');
      if (valCurrentRunEnergy) valCurrentRunEnergy.textContent = currentRunEnergyStr;

      // Panel 2: Combat
      const valTotalClicks = document.getElementById('statFsVal_totalClicks');
      if (valTotalClicks) valTotalClicks.textContent = totalClicks.toLocaleString('ro-RO');
      const valTotalCrits = document.getElementById('statFsVal_totalCrits');
      if (valTotalCrits) valTotalCrits.textContent = totalCrits.toLocaleString('ro-RO');
      const valCritRate = document.getElementById('statFsVal_critRate');
      if (valCritRate) valCritRate.textContent = critRate;
      const valBaseCrit = document.getElementById('statFsVal_baseCrit');
      if (valBaseCrit) valBaseCrit.textContent = Math.round(getCritChance() * 100) + '%';
      const valCritMult = document.getElementById('statFsVal_critMult');
      if (valCritMult) valCritMult.textContent = 'x' + getCritMultiplier().toFixed(2);
      const valCombo = document.getElementById('statFsVal_combo');
      if (valCombo) valCombo.textContent = `${state.comboCount || 0} lovituri (x${(1 + (state.comboCount || 0) * 0.05).toFixed(2)})`;

      // Panel 3: Flotă
      const valTotalGens = document.getElementById('statFsVal_totalGens');
      if (valTotalGens) valTotalGens.textContent = totalGenCount.toLocaleString('ro-RO');
      const valGenTypes = document.getElementById('statFsVal_genTypes');
      if (valGenTypes) valGenTypes.textContent = `${activeGenTypes} / ${GENERATORS_DATA.length}`;
      const valHighestGen = document.getElementById('statFsVal_highestGen');
      if (valHighestGen) valHighestGen.textContent = highestGen;
      const valGenDiscount = document.getElementById('statFsVal_genDiscount');
      if (valGenDiscount) valGenDiscount.textContent = `${((1 - getGeneratorDiscount()) * 100).toFixed(1)}%`;
      const valOfflineEff = document.getElementById('statFsVal_offlineEff');
      if (valOfflineEff) valOfflineEff.textContent = `${offlineEffPct}%`;
      const valGenMilestones = document.getElementById('statFsVal_genMilestones');
      if (valGenMilestones) valGenMilestones.textContent = `${Math.floor(totalGenCount / 25)} praguri`;

      // Panel 4: Anomalii
      const valAnomCaught = document.getElementById('statFsVal_anomaliesCaught');
      if (valAnomCaught) valAnomCaught.textContent = anomaliesCaught.toLocaleString('ro-RO');
      const valAnomMissed = document.getElementById('statFsVal_anomaliesMissed');
      if (valAnomMissed) valAnomMissed.textContent = anomaliesMissed.toLocaleString('ro-RO');
      const valAnomAcc = document.getElementById('statFsVal_anomalyAccuracy');
      if (valAnomAcc) valAnomAcc.textContent = anomalyAccuracy;
      const valMagnet = document.getElementById('statFsVal_celestialMagnet');
      if (valMagnet) valMagnet.textContent = magnetPct > 0 ? `${magnetPct}% șansă prindere automată` : 'Nedeblocat (0%)';
      const valTwin = document.getElementById('statFsVal_twinAnomaly');
      if (valTwin) valTwin.textContent = `${twinAnomPct}%`;
      const valAnomFreq = document.getElementById('statFsVal_anomalyFreq');
      if (valAnomFreq) valAnomFreq.textContent = anomFreqPct > 0 ? `+${anomFreqPct}% mai des` : 'Standard';

      // Panel 5: Singularitate
      const valPresCount = document.getElementById('statFsVal_prestigeCount');
      if (valPresCount) valPresCount.textContent = presCountStr;
      const valDm = document.getElementById('statFsVal_darkMatter');
      if (valDm) valDm.textContent = dmStr;
      const valLifetimeDm = document.getElementById('statFsVal_lifetimeDm');
      if (valLifetimeDm) valLifetimeDm.textContent = lifetimeDmStr;
      const valConstNodes = document.getElementById('statFsVal_constellationNodes');
      if (valConstNodes) valConstNodes.textContent = `${constellationNodesUnlocked} / ${ALL_SKILL_TREE_NODES.length}`;
      const valConstLvls = document.getElementById('statFsVal_constellationLevels');
      if (valConstLvls) valConstLvls.textContent = `${constellationTotalLevels} nivele`;
      const valPresBonus = document.getElementById('statFsVal_prestigeBonus');
      if (valPresBonus) valPresBonus.textContent = presBonusStr;

      // Panel 6: Realizări
      const valAchUnlocked = document.getElementById('statFsVal_achUnlocked');
      if (valAchUnlocked) valAchUnlocked.textContent = `${(state.unlockedAchievements || []).length} / ${ACHIEVEMENTS_DATA.length} (${achPct}%)`;
      const valMythicAch = document.getElementById('statFsVal_mythicAch');
      if (valMythicAch) valMythicAch.textContent = `${mythicAchCount} / ${totalMythicAch}`;
      const valRareAch = document.getElementById('statFsVal_rareAch');
      if (valRareAch) valRareAch.textContent = `${rareAchCount} / ${totalRareAch}`;
      const valAchBonus = document.getElementById('statFsVal_achBonus');
      if (valAchBonus) valAchBonus.textContent = `+${(state.unlockedAchievements || []).length}%`;

      // Panel 7: Vreme Cosmică
      const valStorms = document.getElementById('statFsVal_stormsExperienced');
      if (valStorms) valStorms.textContent = (state.totalStormsExperienced || 0).toLocaleString('ro-RO');
      const valMeteors = document.getElementById('statFsVal_meteorsCaught');
      if (valMeteors) valMeteors.textContent = (state.meteorsCaught || 0).toLocaleString('ro-RO');
      const valWeatherState = document.getElementById('statFsVal_weatherState');
      if (valWeatherState) valWeatherState.textContent = activeCosmicStorm ? `${activeCosmicStorm.icon} ${activeCosmicStorm.name}` : '🌌 Calm Relativ';
      const valWeatherCountdown = document.getElementById('statFsVal_weatherCountdown');
      if (valWeatherCountdown) valWeatherCountdown.textContent = radarTimeStr;
      const valStormQual = document.getElementById('statFsVal_stormQuality');
      if (valStormQual) valStormQual.textContent = (state.stormQuality || 'auto').toUpperCase();

      // Panel 8: Sistem
      const valPlayTime = document.getElementById('statFsVal_playTime');
      if (valPlayTime) valPlayTime.textContent = playTimeStr;
      const valRunTime = document.getElementById('statFsVal_currentRunTime');
      if (valRunTime) valRunTime.textContent = currentRunTimeStr;
      const valStreak = document.getElementById('statFsVal_dailyStreak');
      if (valStreak) valStreak.textContent = dailyStreakStr;
      const valLastSaved = document.getElementById('statFsVal_lastSaved');
      if (valLastSaved) valLastSaved.textContent = lastSavedStr;
      const valCloud = document.getElementById('statFsVal_cloudSync');
      if (valCloud) valCloud.textContent = cloudSyncStr;
      const valVer = document.getElementById('statFsVal_appVersion');
      if (valVer) valVer.textContent = `v${APP_VERSION} (Build ${APP_BUILD})`;
    }

