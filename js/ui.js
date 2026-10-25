    /********************************************************************
     * 10. RANDARE ELEMENTE UI ȘI ACTUALIZARE ÎN TIMP REAL
     ********************************************************************/
    /********************************************************************
     * 10. RANDARE ELEMENTE UI ȘI ACTUALIZARE ÎN TIMP REAL
     ********************************************************************/
    function switchRightZoneTab(tab) {
      activeRightTab = tab;
      const btnTech = document.getElementById('rightTabBtnTech');
      const btnGens = document.getElementById('rightTabBtnGens');
      const gensList = document.getElementById('generatorsList');
      const techList = document.getElementById('rightTechUpgradesList');
      const subTitle = document.getElementById('rightSubTitle');
      const subDesc = document.getElementById('rightSubDesc');
      const coreBadge = document.getElementById('rightSubCoreBadge');

      const curCore = CORES_DATA.find(c => c.id === (state.activeCoreId || 'quantum')) || CORES_DATA[0];

      if (tab === 'tech') {
        if (btnTech) btnTech.classList.add('active');
        if (btnGens) btnGens.classList.remove('active');
        if (gensList) gensList.style.display = 'none';
        if (techList) techList.style.display = 'flex';
        if (subTitle) subTitle.innerText = `⚡ Tehnologii & Click: ${curCore.shortName}`;
        if (subDesc) subDesc.innerText = `Amplifică puterea fiecărui click și sinergia pe acest nucleu`;
        renderRightClickUpgrades();
      } else {
        if (btnGens) btnGens.classList.add('active');
        if (btnTech) btnTech.classList.remove('active');
        if (techList) techList.style.display = 'none';
        if (gensList) gensList.style.display = 'flex';
        if (subTitle) subTitle.innerText = `🤖 Automatizări Pasive: ${curCore.shortName}`;
        if (subDesc) subDesc.innerText = `La 25, 50, 100, 200, 350, 500 bucăți: +35% producție!`;
        renderGenerators();
      }

      // Sincronizare buton multiplicator activ
      const curMult = (tab === 'tech') ? clickBuyMultiplier : buyMultiplier;
      document.querySelectorAll('#rightBuyMultGroup .mult-btn').forEach(b => {
        const txt = b.innerText.trim();
        b.classList.toggle('active', txt === String(curMult) || (curMult === 'MAX' && txt === 'MAX'));
      });

      if (coreBadge) {
        coreBadge.innerText = `${curCore.icon} ${curCore.shortName}`;
        coreBadge.style.color = curCore.color;
        coreBadge.style.borderColor = `${curCore.color}55`;
      }
    }

    function setRightZoneMultiplier(mode, btn) {
      if (btn && btn.parentElement) {
        btn.parentElement.querySelectorAll('.mult-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
      if (activeRightTab === 'tech') {
        clickBuyMultiplier = mode;
        renderRightClickUpgrades();
      } else {
        buyMultiplier = mode;
        renderGenerators();
      }
    }

    function renderRightClickUpgrades() {
      const container = document.getElementById('rightTechUpgradesList') || document.getElementById('clickUpgradesGrid');
      if (!container) return;
      container.innerHTML = '';

      const curCore = CORES_DATA.find(c => c.id === (state.activeCoreId || 'quantum')) || CORES_DATA[0];
      const curUps = state.clickUpgrades || {};

      CLICK_UPGRADES_DATA.forEach(upg => {
        const lvl = curUps[upg.id] || 0;
        const isMax = lvl >= upg.maxLevel;
        const info = getClickUpgradeBuyInfo(upg, clickBuyMultiplier);
        const canAfford = !isMax && state.energy >= info.cost && info.count > 0;
        const progress = Math.min(100, Math.round((lvl / upg.maxLevel) * 100));

        const card = document.createElement('div');
        card.className = 'tech-row-card' + (canAfford ? '' : ' locked');
        card.id = `u_card_${upg.id}`;
        card.onclick = () => buyClickUpgrade(upg.id);

        const costDisplay = isMax ? 'MAXIM' : (clickBuyMultiplier === 1 ? `${formatNumber(info.cost)} ⚡` : `+${info.count}x: ${formatNumber(info.cost)} ⚡`);

        card.innerHTML = `
          <div class="tech-icon-box" style="border-color:${curCore.color}55">${upg.icon}</div>
          <div class="tech-body-box">
            <div class="tech-title-row">
              <div class="tech-name-wrap">
                <span class="tech-name">${upg.name}</span>
                <span class="tech-core-tag" style="color:${curCore.color}">${curCore.shortName}</span>
              </div>
              <span class="tech-lvl-badge" id="u_lvl_${upg.id}">Niv. ${lvl}/${upg.maxLevel}</span>
            </div>
            <div class="tech-meta-row">
              <span class="tech-desc">${upg.desc}</span>
              <span class="tech-cost-tag" id="u_cost_${upg.id}">${costDisplay}</span>
            </div>
            ${upg.specialBadge ? `<div class="special-mechanic-badge ${upg.badgeColor || ''}">${upg.specialBadge}</div>` : ''}
            <div class="tech-progress-bar" title="Nivel ${lvl}/${upg.maxLevel}">
              <div class="tech-progress-fill" style="width:${progress}%; background: linear-gradient(90deg, ${curCore.color}, #38bdf8);"></div>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    }

    function renderClickUpgrades() {
      renderRightClickUpgrades();
    }

    function renderRightZone() {
      switchRightZoneTab(activeRightTab);
    }

    function renderGenerators() {
      const container = document.getElementById('generatorsList');
      if (!container) return;
      container.innerHTML = '';

      const curCore = CORES_DATA.find(c => c.id === (state.activeCoreId || 'quantum')) || CORES_DATA[0];

      GENERATORS_DATA.forEach(gen => {
        const count = state.generators[gen.id] || 0;
        const info = getGeneratorBuyInfo(gen, buyMultiplier);
        const canAfford = state.energy >= info.cost;
        const unitProd = gen.baseCps * getGeneratorMilestoneMultiplier(count) * getGlobalSharedMultiplier() * (curCore.cpsMult || 1.0);
        const progress = getNextMilestoneProgress(count);
        const tier = getAutomationTier(count);
        const tierMeta = AUTOMATION_TIERS_META[tier] || AUTOMATION_TIERS_META[1];
        const nextThreshold = count < 25 ? 25 : (count < 50 ? 50 : (count < 100 ? 100 : null));
        const tierBadgeHtml = tier > 0 
          ? `<span class="gen-tier-pill tier-${tier}" title="Tier ${tierMeta.roman}: ${tierMeta.name}">T-${tierMeta.roman}</span>` 
          : '';
        const milestoneTooltip = count >= 100 
          ? `👑 MAX TIER (${tierMeta.name})` 
          : `Următorul prag (+35%): ${count}/${nextThreshold} (${tierMeta.name})`;

        const card = document.createElement('div');
        card.className = `gen-card gen-tier-${tier}` + (canAfford ? '' : ' locked');
        card.id = `g_card_${gen.id}`;
        card.onclick = () => buyGenerator(gen.id);

        card.innerHTML = `
          <div class="gen-icon tier-${tier}">${getGeneratorTierIcon(gen.id, tier)}</div>
          <div class="gen-body">
            <div class="gen-title-row">
              <div class="gen-name-wrap">
                <span class="gen-name">${gen.name}</span>
                ${tierBadgeHtml}
              </div>
              <span class="gen-count" id="g_cnt_${gen.id}">${count}</span>
            </div>
            <div class="gen-meta">
              <span class="gen-prod" id="g_prod_${gen.id}">+${formatNumber(unitProd)}/s</span>
              <span class="gen-cost" id="g_cost_${gen.id}">+${info.count}x: ${formatNumber(info.cost)} ⚡</span>
            </div>
            ${gen.roleBadge ? `<div class="special-mechanic-badge ${gen.badgeColor || ''}" id="g_spec_${gen.id}">${count > 0 && gen.specialSummary ? gen.specialSummary(count) : gen.roleBadge}</div>` : ''}
            <div class="gen-milestone-bar tier-${tier}" title="${milestoneTooltip}">
              <div class="gen-milestone-fill" style="width:${progress}%"></div>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    }

    let isOmniShiftAnimating = false;
    let omniBannerTimeout = null;

    function playOmniverseDimensionalSound(core) {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;

        // 1. Deep Sub-Bass Dimensional Leap Sweep (160Hz -> 36Hz)
        const subOsc = audioCtx.createOscillator();
        const subGain = audioCtx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(160, now);
        subOsc.frequency.exponentialRampToValueAtTime(36, now + 0.58);
        subGain.gain.setValueAtTime(0.001, now);
        subGain.gain.linearRampToValueAtTime(0.3, now + 0.12);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.72);
        subOsc.connect(subGain);
        subGain.connect(audioCtx.destination);
        subOsc.start(now);
        subOsc.stop(now + 0.72);

        // 2. Harmonic chords per Core Type
        let freqs = [392, 523.25, 659.25, 783.99]; // Quantum default
        let waveType = 'sine';
        if (core.id === 'solar') {
          freqs = [220, 277.18, 329.63, 440, 554.37];
          waveType = 'triangle';
        } else if (core.id === 'tesseract') {
          freqs = [293.66, 440, 587.33, 880, 1174.66];
          waveType = 'sawtooth';
        } else if (core.id === 'void') {
          freqs = [110, 130.81, 164.81, 196, 261.63];
          waveType = 'sawtooth';
        } else if (core.id === 'whitehole') {
          freqs = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
          waveType = 'triangle';
        }

        freqs.forEach((f, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const st = now + 0.1 + idx * 0.04;
          osc.type = waveType;
          osc.frequency.setValueAtTime(f, st);
          osc.frequency.exponentialRampToValueAtTime(f * 1.025, st + 0.45);
          gain.gain.setValueAtTime(0.001, st);
          gain.gain.linearRampToValueAtTime(0.07, st + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.55);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(st);
          osc.stop(st + 0.55);
        });
      } catch (e) {}
    }

    function runOmniverseDimensionalWarp(core, onMidpoint, onComplete) {
      const canvas = document.getElementById('omniShiftCanvas');
      if (!canvas) {
        if (onMidpoint) onMidpoint();
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

      let cx = w / 2;
      let cy = h / 2;
      const coreBtn = document.getElementById('coreBtn');
      if (coreBtn) {
        const rect = coreBtn.getBoundingClientRect();
        if (rect.width > 0 && rect.top > -200 && rect.top < h + 200) {
          cx = rect.left + rect.width / 2;
          cy = rect.top + rect.height / 2;
        }
      }

      const particleCount = 260;
      const particles = [];
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * Math.max(w, h) * 0.8 + 60;
        particles.push({
          angle,
          dist,
          initialDist: dist,
          speed: Math.random() * 9 + 4,
          size: Math.random() * 2.8 + 1,
          color: Math.random() < 0.65 ? core.color : (Math.random() < 0.85 ? '#ffffff' : core.glowColor || '#38bdf8')
        });
      }

      const duration = 720;
      const midpointTime = 300;
      let midpointFired = false;
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);

        if (elapsed >= midpointTime && !midpointFired) {
          midpointFired = true;
          if (onMidpoint) onMidpoint();
        }

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, w, h);

        const phase = progress < 0.42 ? 'implode' : 'explode';

        if (phase === 'implode') {
          const impP = progress / 0.42;
          const gridR = Math.max(w, h) * 0.7 * (1 - impP * 0.75);

          ctx.strokeStyle = core.color;
          ctx.globalAlpha = (1 - impP) * 0.35;
          ctx.lineWidth = 1.5;
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a) * gridR, cy + Math.sin(a) * gridR);
            ctx.stroke();
          }

          particles.forEach(p => {
            const currentDist = p.initialDist * (1 - impP * 0.95);
            const curAngle = p.angle + impP * 4;
            const px = cx + Math.cos(curAngle) * currentDist;
            const py = cy + Math.sin(curAngle) * currentDist;
            ctx.beginPath();
            ctx.arc(px, py, p.size * (1 - impP * 0.4), 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0.2, (1 - impP * 0.5));
            ctx.fill();
          });
        } else {
          const expP = (progress - 0.42) / 0.58;
          const easeExp = Math.sin(expP * Math.PI * 0.5);

          for (let ring = 1; ring <= 3; ring++) {
            const rRadius = easeExp * Math.max(w, h) * (0.4 + ring * 0.25);
            const rAlpha = Math.max(0, (1 - expP) * (0.6 / ring));
            ctx.beginPath();
            ctx.arc(cx, cy, rRadius, 0, Math.PI * 2);
            ctx.strokeStyle = ring === 1 ? '#ffffff' : core.color;
            ctx.lineWidth = (16 - ring * 4) * (1 - expP * 0.7);
            ctx.globalAlpha = rAlpha;
            ctx.stroke();
          }

          particles.forEach(p => {
            const currentDist = 30 + easeExp * Math.max(w, h) * 0.95;
            const curAngle = p.angle + easeExp * 0.8;
            const px = cx + Math.cos(curAngle) * currentDist;
            const py = cy + Math.sin(curAngle) * currentDist;

            ctx.beginPath();
            ctx.arc(px, py, p.size * (1 + easeExp * 0.5), 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, (1 - expP));
            ctx.fill();
          });

          if (expP < 0.35) {
            const flashAlpha = (1 - expP / 0.35) * 0.65;
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.45);
            grad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
            grad.addColorStop(0.3, `${core.color}${Math.floor(flashAlpha * 255).toString(16).padStart(2, '0')}`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.globalAlpha = 1.0;
            ctx.fillRect(0, 0, w, h);
          }
        }

        ctx.restore();

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          canvas.style.display = 'none';
          if (onComplete) onComplete();
        }
      }

      requestAnimationFrame(step);
    }

    function showOmniDimensionBanner(core) {
      const banner = document.getElementById('omniDimensionBanner');
      if (!banner) return;

      banner.style.setProperty('--banner-theme', core.color);
      banner.style.setProperty('--banner-glow', `${core.color}66`);

      const iconEl = document.getElementById('omniBannerIcon');
      if (iconEl) iconEl.innerText = core.icon;
      const titleEl = document.getElementById('omniBannerTitle');
      if (titleEl) titleEl.innerText = core.name;
      const perkEl = document.getElementById('omniBannerPerk');
      if (perkEl) perkEl.innerText = core.perk;

      banner.classList.add('show');
      if (omniBannerTimeout) clearTimeout(omniBannerTimeout);
      omniBannerTimeout = setTimeout(() => {
        banner.classList.remove('show');
      }, 2500);
    }

    function switchActiveCore(coreId) {
      if (isOmniShiftAnimating) return;
      const core = CORES_DATA.find(c => c.id === coreId);
      if (!core) return;
      if (!isCoreUnlocked(coreId)) {
        showToast(`🔒 Nucleul ${core.name} se deblochează la Rebirth #${core.reqRebirth}!`);
        playTone(220, 'sawtooth', 0.15, 0.08);
        return;
      }

      if (state.activeCoreId === coreId) {
        showToast(`🟢 Nucleul ${core.name} este deja activ!`);
        return;
      }

      isOmniShiftAnimating = true;

      if (isOmniverseFullscreenOpen) {
        // =========================================================================
        // CINEMATIC TRANSITION: Exit Fullscreen via Hyperspace Warp -> Jump to Main Stage!
        // =========================================================================
        playOmniverseWarpSound('exit');

        const stageHolo = document.getElementById('omniStageHologram');
        if (stageHolo) {
          stageHolo.style.transform = 'scale(1.25) rotate(15deg)';
          stageHolo.style.filter = `drop-shadow(0 0 30px ${core.color})`;
        }

        // Run exit warp with target core's dimensional signature
        runOmniverseFullscreenWarp(620, () => {}, core.color);

        // At midpoint: hide fullscreen, reveal main page, and trigger reactor leap!
        setTimeout(() => {
          const fsEl = document.getElementById('omniverseFullscreen');
          if (fsEl) {
            fsEl.classList.remove('active');
            fsEl.style.display = 'none';
          }
          isOmniverseFullscreenOpen = false;
          if (omniBgAnimFrame) {
            cancelAnimationFrame(omniBgAnimFrame);
            omniBgAnimFrame = null;
          }

          const appShell = document.querySelector('.app-shell');
          if (appShell) {
            appShell.classList.remove('app-shell-warp-out');
          }

          // Switch active core data
          state.activeCoreId = coreId;
          state.equippedCoreSkin = coreId;

          renderCoreButtonSkin(coreId);
          syncCoreVisualEcosystem(true);
          renderRightZone();
          updateUI(true);

          // Once back on main stage, trigger grand reactor dimensional leap!
          setTimeout(() => {
            const ecoWrap = document.getElementById('coreEcosystemWrap');
            if (ecoWrap) {
              ecoWrap.style.setProperty('--leap-color', core.color);
              ecoWrap.classList.remove('dimensional-leap');
              void ecoWrap.offsetWidth;
              ecoWrap.classList.add('dimensional-leap');
            }

            playOmniverseDimensionalSound(core);

            runOmniverseDimensionalWarp(core, () => {
              const coreBtn = document.getElementById('coreBtn');
              if (coreBtn) {
                const rect = coreBtn.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                spawnCoreShockwave('em-wave');
                spawnCoreShockwave('crit');
                for (let k = 0; k < 10; k++) spawnCoreLightningArc(true);
                spawnParticles(cx, cy, 45, core.color);
                spawnParticles(cx, cy, 30, '#ffffff');
              }

              showOmniDimensionBanner(core);
              showToast(`🌀 Salt Dimensional Reușit! Conectat la Nucleul ${core.name}!`);
              saveGame();
            }, () => {
              if (ecoWrap) ecoWrap.classList.remove('dimensional-leap');
              isOmniShiftAnimating = false;
            });
          }, 60);
        }, 320);

      } else {
        // Direct switch if already on normal page
        playOmniverseDimensionalSound(core);

        const ecoWrap = document.getElementById('coreEcosystemWrap');
        if (ecoWrap) {
          ecoWrap.style.setProperty('--leap-color', core.color);
          ecoWrap.classList.remove('dimensional-leap');
          void ecoWrap.offsetWidth;
          ecoWrap.classList.add('dimensional-leap');
        }

        runOmniverseDimensionalWarp(core, () => {
          state.activeCoreId = coreId;
          state.equippedCoreSkin = coreId;

          renderCoreButtonSkin(coreId);
          syncCoreVisualEcosystem(true);
          renderRightZone();
          updateUI(true);

          const coreBtn = document.getElementById('coreBtn');
          if (coreBtn) {
            const rect = coreBtn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            spawnCoreShockwave('em-wave');
            spawnCoreShockwave('crit');
            for (let k = 0; k < 10; k++) spawnCoreLightningArc(true);
            spawnParticles(cx, cy, 45, core.color);
            spawnParticles(cx, cy, 30, '#ffffff');
          }

          showOmniDimensionBanner(core);
          showToast(`🌀 Conectat cu succes la Nucleul ${core.name}!`);
          saveGame();
        }, () => {
          if (ecoWrap) ecoWrap.classList.remove('dimensional-leap');
          isOmniShiftAnimating = false;
        });
      }
    }

    function renderMultiCoreSelector() {
      // Comutarea între nuclee se face direct din tab-ul Omnivers conform cerinței
    }

    function renderMultiCoresTab() {
      const container = document.getElementById('omniverseCoresGrid');
      if (!container) return;
      container.innerHTML = '';

      const activeId = state.activeCoreId || 'quantum';
      const totalCps = getCPS();
      let unlockedCount = 0;

      CORES_DATA.forEach(core => {
        const unlocked = isCoreUnlocked(core.id);
        if (unlocked) unlockedCount++;
        const isActive = activeId === core.id;
        const coreCps = getCoreCPS(core.id);
        const coreData = (state.cores && state.cores[core.id]) || { generators: {}, clickUpgrades: {} };
        const totalGens = Object.values(coreData.generators || {}).reduce((a, b) => a + (Number(b) || 0), 0);
        const totalTech = Object.values(coreData.clickUpgrades || {}).reduce((a, b) => a + (Number(b) || 0), 0);

        const card = document.createElement('div');
        card.className = `omniverse-core-card ${isActive ? 'active' : ''} ${unlocked ? 'unlocked' : 'locked'}`;
        card.style.setProperty('--card-theme', core.color);

        let actionBtnHtml = '';
        if (isActive) {
          actionBtnHtml = `<button class="btn-omni-switch is-active" disabled>✅ Nucleu Activ În Prezent</button>`;
        } else if (unlocked) {
          actionBtnHtml = `<button class="btn-omni-switch can-switch" onclick="switchActiveCore('${core.id}')">⚡ Comută pe Acest Nucleu</button>`;
        } else {
          actionBtnHtml = `<button class="btn-omni-switch is-locked" disabled>🔒 Deblocat la Rebirth #${core.reqRebirth}</button>`;
        }

        card.innerHTML = `
          <div class="omni-card-header">
            <div class="omni-card-icon" style="color:${core.color}; border-color:${core.color}50">${core.icon}</div>
            <div class="omni-card-title-box">
              <div class="omni-card-title" style="color:${core.color}">${core.name}</div>
              <div class="omni-card-sub">${unlocked ? (isActive ? '🟢 Nucleu Activ' : '⚡ Online în Paralel') : `🔒 Necesită Rebirth #${core.reqRebirth}`}</div>
            </div>
          </div>
          <p style="font-size:11.5px; color:var(--text-muted); line-height:1.35;">${core.desc}</p>
          <div class="special-mechanic-badge gold" style="font-size:10.5px;">${core.perk}</div>
          <div class="omni-card-metrics">
            <div class="omni-metric-row">
              <span class="omni-metric-label">Producție Pasivă:</span>
              <span class="omni-metric-val" style="color:var(--accent-emerald);">+${formatNumber(coreCps)}/s</span>
            </div>
            <div class="omni-metric-row">
              <span class="omni-metric-label">Multiplicator Pasiv Nativ:</span>
              <span class="omni-metric-val">${core.cpsMult}x Producție</span>
            </div>
            <div class="omni-metric-row">
              <span class="omni-metric-label">Generatoare Construite:</span>
              <span class="omni-metric-val">${totalGens} buc.</span>
            </div>
            <div class="omni-metric-row">
              <span class="omni-metric-label">Tehnologii Cercetate:</span>
              <span class="omni-metric-val">${totalTech} nivele</span>
            </div>
          </div>
          ${actionBtnHtml}
        `;
        container.appendChild(card);
      });

      const totalCpsEl = document.getElementById('omniTotalCpsVal');
      if (totalCpsEl) totalCpsEl.innerText = `${formatNumber(totalCps)} ⚡/s`;
      const coresUnlockedEl = document.getElementById('omniCoresUnlockedVal');
      if (coresUnlockedEl) coresUnlockedEl.innerText = `${unlockedCount} / ${CORES_DATA.length}`;
      const activeCoreEl = document.getElementById('omniActiveCoreVal');
      const curCore = CORES_DATA.find(c => c.id === activeId) || CORES_DATA[0];
      if (activeCoreEl) {
        activeCoreEl.innerText = `${curCore.icon} ${curCore.shortName}`;
        activeCoreEl.style.color = curCore.color;
      }
      const badgeEl = document.getElementById('coresUnlockedBadge');
      if (badgeEl) badgeEl.innerText = `${unlockedCount}/${CORES_DATA.length}`;
    }

    // =========================================================================
    // V3.9.3: OMNIVERSUL CUANTIC (FULLSCREEN MULTIVERSE & DIMENSIONAL WARP)
    // =========================================================================
    let isOmniverseFullscreenOpen = false;
    let omniBgAnimFrame = null;
    let omniWarpAnimFrameId = null;
    let omniFocusedCoreId = 'quantum';
    let omniBgParticles = [];
    let omniFsEventsBound = false;

    function playOmniverseWarpSound(direction = 'enter') {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;

        if (direction === 'enter') {
          // Sub-bass dimensional swell (sine 75Hz -> 180Hz)
          const subOsc = audioCtx.createOscillator();
          const subGain = audioCtx.createGain();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(75, now);
          subOsc.frequency.exponentialRampToValueAtTime(180, now + 0.45);
          subGain.gain.setValueAtTime(0.001, now);
          subGain.gain.linearRampToValueAtTime(0.24, now + 0.15);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
          subOsc.connect(subGain);
          subGain.connect(audioCtx.destination);
          subOsc.start(now);
          subOsc.stop(now + 0.65);

          // Multiverse Chords (C4, E4, G4, B4, D5)
          const freqs = [261.63, 329.63, 392.00, 493.88, 587.33];
          freqs.forEach((f, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const st = now + 0.08 + idx * 0.04;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, st);
            osc.frequency.exponentialRampToValueAtTime(f * 1.02, st + 0.4);
            gain.gain.setValueAtTime(0.001, st);
            gain.gain.linearRampToValueAtTime(0.08, st + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.55);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(st);
            osc.stop(st + 0.55);
          });
        } else {
          // Exit warp
          const subOsc = audioCtx.createOscillator();
          const subGain = audioCtx.createGain();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(160, now);
          subOsc.frequency.exponentialRampToValueAtTime(55, now + 0.35);
          subGain.gain.setValueAtTime(0.16, now);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
          subOsc.connect(subGain);
          subGain.connect(audioCtx.destination);
          subOsc.start(now);
          subOsc.stop(now + 0.38);
        }
      } catch (e) {}
    }

    function runOmniverseFullscreenWarp(duration = 700, onComplete, themeColor = null) {
      const canvas = document.getElementById('omniverseWarpCanvas');
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

      const particleCount = 380;
      const particles = [];
      const colors = themeColor
        ? [themeColor, '#ffffff', themeColor, '#ffffff', '#e0f2fe', '#f8fafc']
        : ['#38bdf8', '#f59e0b', '#06b6d4', '#e11d48', '#ffffff', '#a855f7'];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: (Math.random() - 0.5) * w * 2.2,
          y: (Math.random() - 0.5) * h * 2.2,
          z: Math.random() * 1500 + 100,
          pz: 1600,
          color: colors[i % colors.length],
          size: Math.random() * 2.2 + 0.8
        });
      }

      const startTime = performance.now();

      function stepWarp(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.fillStyle = 'rgba(2, 2, 10, 0.28)';
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
          ctx.fillStyle = themeColor || 'rgba(56, 189, 248, 0.4)';
          ctx.globalAlpha = flashAlpha * 0.45;
          ctx.fillRect(0, 0, w, h);
          ctx.globalAlpha = 1.0;
        }

        ctx.restore();

        if (progress < 1) {
          omniWarpAnimFrameId = requestAnimationFrame(stepWarp);
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

      omniWarpAnimFrameId = requestAnimationFrame(stepWarp);
    }

    function openOmniverseFullscreen() {
      if (isOmniverseFullscreenOpen) return;
      isOmniverseFullscreenOpen = true;

      playOmniverseWarpSound('enter');

      const appShell = document.querySelector('.app-shell');
      if (appShell) appShell.classList.add('app-shell-warp-out');

      runOmniverseFullscreenWarp(700, () => {});

      setTimeout(() => {
        const fsEl = document.getElementById('omniverseFullscreen');
        if (fsEl) {
          fsEl.style.display = 'flex';
          void fsEl.offsetWidth;
          fsEl.classList.add('active');
        }
        omniFocusedCoreId = state.activeCoreId || 'quantum';
        initOmniverseFullscreen();
        updateOmniverseFullscreen();
      }, 420);
    }

    function closeOmniverseFullscreen() {
      if (!isOmniverseFullscreenOpen) return;
      isOmniverseFullscreenOpen = false;

      playOmniverseWarpSound('exit');

      const fsEl = document.getElementById('omniverseFullscreen');
      if (fsEl) {
        fsEl.classList.remove('active');
      }

      const appShell = document.querySelector('.app-shell');
      if (appShell) {
        appShell.classList.remove('app-shell-warp-out');
      }

      setTimeout(() => {
        if (fsEl && !isOmniverseFullscreenOpen) {
          fsEl.style.display = 'none';
        }
        if (omniBgAnimFrame) {
          cancelAnimationFrame(omniBgAnimFrame);
          omniBgAnimFrame = null;
        }
      }, 380);
    }

    function initOmniverseFullscreen() {
      const bgCanvas = document.getElementById('omniverseBgCanvas');
      if (!bgCanvas) return;

      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      bgCanvas.width = Math.floor(w * dpr);
      bgCanvas.height = Math.floor(h * dpr);

      if (omniBgParticles.length === 0) {
        const pCount = 180;
        const colors = ['#38bdf8', '#f59e0b', '#06b6d4', '#e11d48', '#ffffff', '#a855f7'];
        for (let i = 0; i < pCount; i++) {
          omniBgParticles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.8 + 0.4,
            baseAlpha: Math.random() * 0.6 + 0.2,
            twinkleSpeed: Math.random() * 0.003 + 0.001,
            phase: Math.random() * Math.PI * 2,
            color: colors[i % colors.length]
          });
        }
      }

      if (!omniFsEventsBound) {
        omniFsEventsBound = true;
        window.addEventListener('resize', () => {
          if (isOmniverseFullscreenOpen && bgCanvas) {
            const curDpr = window.devicePixelRatio || 1;
            bgCanvas.width = Math.floor(window.innerWidth * curDpr);
            bgCanvas.height = Math.floor(window.innerHeight * curDpr);
          }
        });
      }

      if (!omniBgAnimFrame) {
        omniBgAnimFrame = requestAnimationFrame(runOmniverseBgLoop);
      }
    }

    function runOmniverseBgLoop(timestamp) {
      if (!isOmniverseFullscreenOpen) {
        omniBgAnimFrame = null;
        return;
      }

      const canvas = document.getElementById('omniverseBgCanvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const dpr = window.devicePixelRatio || 1;

        ctx.fillStyle = '#02020a';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;

        // 1. Ambient Cosmic Stars
        omniBgParticles.forEach(s => {
          const alpha = s.baseAlpha + Math.sin(timestamp * s.twinkleSpeed + s.phase) * 0.25;
          ctx.beginPath();
          ctx.arc(s.x * dpr, s.y * dpr, s.r * dpr, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = Math.max(0.1, alpha);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // 2. 5 Multiverse Reality Sectors in 3D Perspective Orbit
        const orbitRadius = Math.min(w, h) * 0.38;
        const activeCoreIndex = CORES_DATA.findIndex(c => c.id === (state.activeCoreId || 'quantum'));
        const activeNodeAngle = (activeCoreIndex * (Math.PI * 2 / 5)) + timestamp * 0.0003;
        const activeNodeX = cx + Math.cos(activeNodeAngle) * orbitRadius;
        const activeNodeY = cy + Math.sin(activeNodeAngle) * (orbitRadius * 0.65);

        CORES_DATA.forEach((core, idx) => {
          const angle = (idx * (Math.PI * 2 / 5)) + timestamp * 0.0003;
          const nodeX = cx + Math.cos(angle) * orbitRadius;
          const nodeY = cy + Math.sin(angle) * (orbitRadius * 0.65);

          // Energy Conduit Beams from active node to other nodes
          if (idx !== activeCoreIndex) {
            ctx.beginPath();
            ctx.moveTo(activeNodeX, activeNodeY);
            const midX = (activeNodeX + nodeX) / 2;
            const midY = (activeNodeY + nodeY) / 2 + Math.sin(timestamp * 0.002 + idx) * 20 * dpr;
            ctx.quadraticCurveTo(midX, midY, nodeX, nodeY);
            ctx.strokeStyle = core.color;
            ctx.lineWidth = (isCoreUnlocked(core.id) ? 2.5 : 1) * dpr;
            ctx.globalAlpha = isCoreUnlocked(core.id) ? 0.35 + Math.sin(timestamp * 0.003 + idx) * 0.15 : 0.08;
            ctx.stroke();

            const pulseT = ((timestamp * 0.001 + idx * 0.25) % 1);
            const px = (1 - pulseT) * (1 - pulseT) * activeNodeX + 2 * (1 - pulseT) * pulseT * midX + pulseT * pulseT * nodeX;
            const py = (1 - pulseT) * (1 - pulseT) * activeNodeY + 2 * (1 - pulseT) * pulseT * midY + pulseT * pulseT * nodeY;
            ctx.beginPath();
            ctx.arc(px, py, 4 * dpr, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = isCoreUnlocked(core.id) ? 0.8 : 0.2;
            ctx.fill();
          }

          // Node Aura
          const isAct = state.activeCoreId === core.id;
          const nodeR = (isAct ? 32 : 22) * dpr;
          const grad = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, nodeR * 2);
          grad.addColorStop(0, core.color);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.globalAlpha = isCoreUnlocked(core.id) ? (isAct ? 0.6 : 0.3) : 0.1;
          ctx.beginPath();
          ctx.arc(nodeX, nodeY, nodeR * 2, 0, Math.PI * 2);
          ctx.fill();

          // Node Circle
          ctx.beginPath();
          ctx.arc(nodeX, nodeY, nodeR, 0, Math.PI * 2);
          ctx.fillStyle = isAct ? core.color : 'rgba(15, 23, 42, 0.9)';
          ctx.globalAlpha = isCoreUnlocked(core.id) ? 1.0 : 0.4;
          ctx.fill();
          ctx.strokeStyle = core.color;
          ctx.lineWidth = (isAct ? 3 : 1.5) * dpr;
          ctx.stroke();
        });

        ctx.globalAlpha = 1.0;
      }

      omniBgAnimFrame = requestAnimationFrame(runOmniverseBgLoop);
    }

    function focusOmniverseCore(coreId) {
      const core = CORES_DATA.find(c => c.id === coreId);
      if (!core) return;
      omniFocusedCoreId = coreId;

      const stage = document.getElementById('omniShowcaseStage');
      if (stage) {
        stage.style.setProperty('--stage-theme', core.color);
      }

      const orb = document.getElementById('omniStageCoreOrb');
      if (orb) {
        orb.innerText = core.icon;
        orb.style.background = `radial-gradient(circle at 35% 35%, #ffffff 0%, ${core.color} 50%, #050716 100%)`;
      }

      const title = document.getElementById('omniStageTitle');
      if (title) title.innerText = core.name;

      const perk = document.getElementById('omniStagePerk');
      if (perk) perk.innerText = core.perk;

      const desc = document.getElementById('omniStageDesc');
      if (desc) desc.innerText = core.desc;

      const coreCps = typeof getCoreCPS === 'function' ? getCoreCPS(core.id) : 0;
      const coreData = (state.cores && state.cores[core.id]) || { generators: {}, clickUpgrades: {} };
      const totalGens = Object.values(coreData.generators || {}).reduce((a, b) => a + (Number(b) || 0), 0);
      const totalTech = Object.values(coreData.clickUpgrades || {}).reduce((a, b) => a + (Number(b) || 0), 0);

      const cpsEl = document.getElementById('omniStageCps');
      if (cpsEl) cpsEl.innerText = `+${formatNumber(coreCps)}/s`;

      const multEl = document.getElementById('omniStageMult');
      if (multEl) multEl.innerText = `${core.cpsMult}x Producție`;

      const gensEl = document.getElementById('omniStageGens');
      if (gensEl) gensEl.innerText = `${totalGens} buc.`;

      const techEl = document.getElementById('omniStageTech');
      if (techEl) techEl.innerText = `${totalTech} nivele`;

      const actionBtn = document.getElementById('btnOmniStageAction');
      const actionText = document.getElementById('omniStageActionText');
      const isUnlocked = isCoreUnlocked(core.id);
      const isActive = (state.activeCoreId || 'quantum') === core.id;

      if (actionBtn && actionText) {
        actionBtn.className = 'omni-stage-action-btn';
        if (isActive) {
          actionBtn.classList.add('is-active');
          actionBtn.disabled = true;
          actionText.innerText = '🟢 NUCLEU ACTIV ÎN PREZENT';
        } else if (isUnlocked) {
          actionBtn.classList.add('can-switch');
          actionBtn.disabled = false;
          actionText.innerText = `⚡ ACTIVEAZĂ ${core.name.toUpperCase()} (SALT DIMENSIONAL) ➔`;
        } else {
          actionBtn.classList.add('is-locked');
          actionBtn.disabled = true;
          actionText.innerText = `🔒 DEBLOCARE LA REBIRTH #${core.reqRebirth}`;
        }
      }

      // Sync Shelf highlight
      const shelfCards = document.querySelectorAll('.omni-shelf-card');
      shelfCards.forEach(c => {
        const cId = c.getAttribute('data-core-id');
        c.classList.toggle('focused', cId === coreId);
        c.classList.toggle('active-core', cId === state.activeCoreId);
      });
    }

    function triggerOmniStageAction() {
      if (!omniFocusedCoreId) return;
      switchActiveCore(omniFocusedCoreId);
    }

    function renderOmniverseShelf() {
      const shelf = document.getElementById('omniFsShelf');
      if (!shelf) return;
      if (shelf.children.length === CORES_DATA.length) return;
      shelf.innerHTML = '';
      CORES_DATA.forEach(core => {
        const card = document.createElement('div');
        card.className = 'omni-shelf-card';
        card.setAttribute('data-core-id', core.id);
        card.style.setProperty('--card-theme', core.color);
        card.onclick = () => focusOmniverseCore(core.id);
        card.ondblclick = () => {
          if (isCoreUnlocked(core.id) && state.activeCoreId !== core.id) {
            switchActiveCore(core.id);
          }
        };

        card.innerHTML = `
          <div class="omni-shelf-icon" style="color:${core.color}; border-color:${core.color}55;">${core.icon}</div>
          <div class="omni-shelf-title">${core.shortName}</div>
          <span class="omni-shelf-status" id="omniShelfStatus_${core.id}"></span>
        `;
        shelf.appendChild(card);
      });
    }

    function updateOmniverseFullscreen() {
      renderOmniverseShelf();
      const activeId = state.activeCoreId || 'quantum';
      const curCore = CORES_DATA.find(c => c.id === activeId) || CORES_DATA[0];
      const totalCps = getCPS();
      let unlockedCount = 0;
      CORES_DATA.forEach(c => { if (isCoreUnlocked(c.id)) unlockedCount++; });

      const totalCpsEl = document.getElementById('omniFsTotalCps');
      if (totalCpsEl) totalCpsEl.innerText = `${formatNumber(totalCps)} ⚡/s`;

      const unlCountEl = document.getElementById('omniFsUnlockedCount');
      if (unlCountEl) unlCountEl.innerText = `${unlockedCount} / ${CORES_DATA.length}`;

      const activeNameEl = document.getElementById('omniFsActiveName');
      if (activeNameEl) {
        activeNameEl.innerText = `${curCore.icon} ${curCore.shortName}`;
        activeNameEl.style.color = curCore.color;
      }

      // Update shelf cards state without recreating DOM
      const shelfCards = document.querySelectorAll('.omni-shelf-card');
      shelfCards.forEach(c => {
        const cId = c.getAttribute('data-core-id');
        const core = CORES_DATA.find(item => item.id === cId);
        if (!core) return;
        const isAct = activeId === cId;
        const isFoc = (omniFocusedCoreId || activeId) === cId;
        const isUnl = isCoreUnlocked(cId);

        c.classList.toggle('focused', isFoc);
        c.classList.toggle('active-core', isAct);

        const stBadge = document.getElementById(`omniShelfStatus_${cId}`);
        if (stBadge) {
          const statusClass = isAct ? 'active' : (isUnl ? 'ready' : 'locked');
          const statusText = isAct ? 'ACTIV' : (isUnl ? 'DISPONIBIL' : `Rebirth #${core.reqRebirth}`);
          if (stBadge.innerText !== statusText) {
            stBadge.className = `omni-shelf-status ${statusClass}`;
            stBadge.innerText = statusText;
          }
        }
      });

      // Update focused core metrics
      const focId = omniFocusedCoreId || activeId;
      const focCore = CORES_DATA.find(c => c.id === focId);
      if (focCore) {
        const coreCps = typeof getCoreCPS === 'function' ? getCoreCPS(focCore.id) : 0;
        const coreData = (state.cores && state.cores[focCore.id]) || { generators: {}, clickUpgrades: {} };
        const totalGens = Object.values(coreData.generators || {}).reduce((a, b) => a + (Number(b) || 0), 0);
        const totalTech = Object.values(coreData.clickUpgrades || {}).reduce((a, b) => a + (Number(b) || 0), 0);

        const cpsEl = document.getElementById('omniStageCps');
        const newCpsText = `+${formatNumber(coreCps)}/s`;
        if (cpsEl && cpsEl.innerText !== newCpsText) cpsEl.innerText = newCpsText;

        const gensEl = document.getElementById('omniStageGens');
        const newGensText = `${totalGens} buc.`;
        if (gensEl && gensEl.innerText !== newGensText) gensEl.innerText = newGensText;

        const techEl = document.getElementById('omniStageTech');
        const newTechText = `${totalTech} nivele`;
        if (techEl && techEl.innerText !== newTechText) techEl.innerText = newTechText;
      }
    }

    // =========================================================================
    // V3.7.0: ARBORE DE TALENTE RAMIFICAT & CONSTELAȚIE CUANTICĂ (FULLSCREEN & WARP)
    // =========================================================================
    let isConstellationFullscreenOpen = false;
    let selectedConstellationNodeId = 'p_starter';
    let currentSkillTreeView = 'constellation';
    let constellationAnimFrame = null;
    let constellationCanvasInitialized = false;

    // Camera & Canvas State for Fullscreen Constellation
    const GALAXY_BASE_W = 1400;
    const GALAXY_BASE_H = 960;
    let cCamX = 700;
    let cCamY = 480;
    let cCamZoom = 1.0;
    let cTargetCamX = 700;
    let cTargetCamY = 480;
    let cTargetCamZoom = 1.0;
    let cIsDragging = false;
    let cDragStartX = 0;
    let cDragStartY = 0;
    let cCamStartX = 700;
    let cCamStartY = 480;
    let cDragDistance = 0;
    let cTouchStartDist = 0;
    let cTouchStartZoom = 1.0;

    let cBgAnimFrame = null;
    let cMainAnimFrame = null;
    let cBurstParticles = [];
    let cShockwaves = [];
    let cBgStars = [];
    let cShootingStars = [];
    let cNextShootingStarTime = 0;

    // Constellation Branch Names & Metas
    const CONSTELLATION_BRANCH_META = {
      universal: {
        codeName: 'URSA SINGULARIS',
        subName: 'Rădăcina Primordială a Creației',
        color: '#a855f7',
        center: { x: 700, y: 260, zoom: 1.35 }
      },
      manual: {
        codeName: 'CORONA FOTONICA',
        subName: 'Calea Manuală a Impulsului & Crit',
        color: '#f43f5e',
        center: { x: 260, y: 540, zoom: 1.35 }
      },
      passive: {
        codeName: 'CYGNUS AUTOMATA',
        subName: 'Flota Autonomă & Sinteză Pasivă AFK',
        color: '#06b6d4',
        center: { x: 700, y: 720, zoom: 1.35 }
      },
      anomaly: {
        codeName: 'PHOENIX ANOMALIS',
        subName: 'Vânătorul de Anomalii Astrale',
        color: '#f59e0b',
        center: { x: 1140, y: 540, zoom: 1.35 }
      }
    };

    function playCosmicWarpSound(direction = 'enter') {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;

        if (direction === 'enter') {
          // 1. Sub-bass warp sweep
          const subOsc = audioCtx.createOscillator();
          const subGain = audioCtx.createGain();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(45, now);
          subOsc.frequency.exponentialRampToValueAtTime(190, now + 0.5);
          subGain.gain.setValueAtTime(0.001, now);
          subGain.gain.linearRampToValueAtTime(0.24, now + 0.15);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
          subOsc.connect(subGain);
          subGain.connect(audioCtx.destination);
          subOsc.start(now);
          subOsc.stop(now + 0.65);

          // 2. High celestial warp arpeggio (C5, G5, B5, E6)
          const freqs = [523.25, 783.99, 987.77, 1318.51];
          freqs.forEach((f, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const startT = now + 0.12 + idx * 0.055;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, startT);
            osc.frequency.exponentialRampToValueAtTime(f * 1.45, startT + 0.4);
            gain.gain.setValueAtTime(0.001, startT);
            gain.gain.linearRampToValueAtTime(0.08, startT + 0.12);
            gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.55);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(startT);
            osc.stop(startT + 0.55);
          });
        } else {
          // Exit warp: descending soft sub-bass + starry resolution
          const subOsc = audioCtx.createOscillator();
          const subGain = audioCtx.createGain();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(170, now);
          subOsc.frequency.exponentialRampToValueAtTime(50, now + 0.38);
          subGain.gain.setValueAtTime(0.16, now);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
          subOsc.connect(subGain);
          subGain.connect(audioCtx.destination);
          subOsc.start(now);
          subOsc.stop(now + 0.42);

          const chimeOsc = audioCtx.createOscillator();
          const chimeGain = audioCtx.createGain();
          chimeOsc.type = 'sine';
          chimeOsc.frequency.setValueAtTime(659.25, now);
          chimeGain.gain.setValueAtTime(0.1, now);
          chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          chimeOsc.connect(chimeGain);
          chimeGain.connect(audioCtx.destination);
          chimeOsc.start(now);
          chimeOsc.stop(now + 0.35);
        }
      } catch (e) {}
    }

    function playConstellationStarBurstSound(isKeystone = false) {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;

        const chord = isKeystone 
          ? [523.25, 659.25, 783.99, 1046.50, 1318.51] 
          : [587.33, 739.99, 880.00, 1174.66];

        chord.forEach((f, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const st = now + idx * 0.04;
          osc.type = isKeystone ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(f, st);
          osc.frequency.exponentialRampToValueAtTime(f * 1.02, st + 0.3);
          gain.gain.setValueAtTime(0.001, st);
          gain.gain.linearRampToValueAtTime(isKeystone ? 0.09 : 0.07, st + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.4);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(st);
          osc.stop(st + 0.4);
        });

        if (isKeystone) {
          const sub = audioCtx.createOscillator();
          const sGain = audioCtx.createGain();
          sub.type = 'sine';
          sub.frequency.setValueAtTime(70, now);
          sub.frequency.exponentialRampToValueAtTime(35, now + 0.5);
          sGain.gain.setValueAtTime(0.2, now);
          sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          sub.connect(sGain);
          sGain.connect(audioCtx.destination);
          sub.start(now);
          sub.stop(now + 0.5);
        }
      } catch (e) {}
    }

    // =========================================================================
    // HYPERSPACE WARP TRANSITION ANIMATION
    // =========================================================================
    let warpAnimFrameId = null;

    function runWarpTransition(duration = 750, onComplete) {
      const canvas = document.getElementById('constellationWarpCanvas');
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

      const starCount = 420;
      const stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: (Math.random() - 0.5) * w * 2.2,
          y: (Math.random() - 0.5) * h * 2.2,
          z: Math.random() * 1600 + 100,
          pz: 1700,
          color: Math.random() < 0.25 ? '#38bdf8' : Math.random() < 0.5 ? '#c084fc' : Math.random() < 0.75 ? '#fde047' : '#ffffff',
          size: Math.random() * 1.8 + 0.8
        });
      }

      const startTime = performance.now();

      function stepWarp(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);

        ctx.fillStyle = 'rgba(2, 4, 10, 0.28)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Speed curve: ramps up fast to peak warp, then decelerates
        let speed = 25;
        if (progress < 0.45) {
          speed = 25 + Math.sin(progress / 0.45 * Math.PI * 0.5) * 115;
        } else {
          speed = 140 * (1 - (progress - 0.45) / 0.55);
        }
        speed = Math.max(10, speed);

        const fov = 340 * dpr;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        for (let i = 0; i < starCount; i++) {
          const s = stars[i];
          s.pz = s.z;
          s.z -= speed;

          if (s.z <= 20) {
            s.z = 1600;
            s.pz = 1600;
            s.x = (Math.random() - 0.5) * w * 2.2;
            s.y = (Math.random() - 0.5) * h * 2.2;
          }

          const sx = (s.x / s.z) * fov + cx;
          const sy = (s.y / s.z) * fov + cy;
          const px = (s.x / s.pz) * fov + cx;
          const py = (s.y / s.pz) * fov + cy;

          if (sx >= 0 && sx <= canvas.width && sy >= 0 && sy <= canvas.height) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(sx, sy);
            ctx.strokeStyle = s.color;
            ctx.lineWidth = Math.min(4.5 * dpr, (1 - s.z / 1600) * 3.8 * dpr + 0.5);
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 8 * dpr;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }

        // Singularity Event Horizon Ring Expanding
        if (progress > 0.15) {
          const ringNorm = (progress - 0.15) / 0.85;
          const maxR = Math.hypot(canvas.width, canvas.height) * 0.65;
          const curR = ringNorm * maxR;

          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, curR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(168, 85, 247, ${Math.max(0, 1 - ringNorm)})`;
          ctx.lineWidth = (1 - ringNorm) * 10 * dpr + 1;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 20 * dpr;
          ctx.stroke();
          ctx.restore();
        }

        if (progress < 1) {
          warpAnimFrameId = requestAnimationFrame(stepWarp);
        } else {
          cancelAnimationFrame(warpAnimFrameId);
          warpAnimFrameId = null;
          if (onComplete) onComplete();
        }
      }

      warpAnimFrameId = requestAnimationFrame(stepWarp);
    }

    // =========================================================================
    // FULLSCREEN CONSTELLATION CONTROLLER
    // =========================================================================
    function computeFitZoom() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w < 768) {
        return Math.max(0.48, Math.min(w / 1100, (h - 260) / 960));
      }
      const fit = Math.min((w - 120) / GALAXY_BASE_W, (h - 220) / GALAXY_BASE_H);
      return Math.min(1.25, Math.max(0.6, fit));
    }

    function openConstellationFullscreen() {
      if (isConstellationFullscreenOpen) return;
      isConstellationFullscreenOpen = true;

      // 1. Audio
      playCosmicWarpSound('enter');

      // 2. Hide & blur app shell
      const appShell = document.querySelector('.app-shell');
      if (appShell) appShell.classList.add('app-shell-warp-out');

      // 3. Launch Warp Transition
      const warpCanvas = document.getElementById('constellationWarpCanvas');
      if (warpCanvas) {
        warpCanvas.style.display = 'block';
        warpCanvas.style.opacity = '1';
        runWarpTransition(750, () => {
          if (warpCanvas) {
            warpCanvas.style.transition = 'opacity 0.25s ease';
            warpCanvas.style.opacity = '0';
            setTimeout(() => {
              warpCanvas.style.display = 'none';
              warpCanvas.style.transition = '';
            }, 250);
          }
        });
      }

      // 4. Reveal Fullscreen Menu at Midpoint
      setTimeout(() => {
        const fsEl = document.getElementById('constellationFullscreen');
        if (fsEl) {
          fsEl.style.display = 'flex';
          void fsEl.offsetWidth;
          fsEl.classList.add('active');
        }
        initConstellationFullscreen();
        focusConstellationBranch('all');
        selectInspectorNode(selectedConstellationNodeId || 'p_starter');
      }, 420);
    }

    function closeConstellationFullscreen() {
      if (!isConstellationFullscreenOpen) return;
      isConstellationFullscreenOpen = false;

      playCosmicWarpSound('exit');

      const fsEl = document.getElementById('constellationFullscreen');
      if (fsEl) {
        fsEl.classList.remove('active');
      }

      const appShell = document.querySelector('.app-shell');
      if (appShell) {
        appShell.classList.remove('app-shell-warp-out');
      }

      setTimeout(() => {
        if (fsEl) fsEl.style.display = 'none';
        if (cBgAnimFrame) {
          cancelAnimationFrame(cBgAnimFrame);
          cBgAnimFrame = null;
        }
        if (cMainAnimFrame) {
          cancelAnimationFrame(cMainAnimFrame);
          cMainAnimFrame = null;
        }
        updateUI();
      }, 380);
    }

    function focusConstellationBranch(branch = 'all', btnEl = null) {
      document.querySelectorAll('.c-branch-btn').forEach(b => b.classList.remove('active'));
      if (btnEl) {
        btnEl.classList.add('active');
      } else {
        const targetBtn = document.querySelector(`.c-branch-btn[data-branch="${branch}"]`);
        if (targetBtn) targetBtn.classList.add('active');
      }

      if (branch === 'all') {
        cTargetCamX = 700;
        cTargetCamY = 480;
        cTargetCamZoom = computeFitZoom();
      } else if (CONSTELLATION_BRANCH_META[branch]) {
        const meta = CONSTELLATION_BRANCH_META[branch].center;
        cTargetCamX = meta.x;
        cTargetCamY = meta.y;
        cTargetCamZoom = meta.zoom;
      }
    }

    function constellationZoomIn() {
      cTargetCamZoom = Math.min(2.5, cTargetCamZoom * 1.3);
    }

    function constellationZoomOut() {
      cTargetCamZoom = Math.max(0.45, cTargetCamZoom / 1.3);
    }

    function constellationResetView() {
      focusConstellationBranch('all');
    }

    // =========================================================================
    // FULLSCREEN CONSTELLATION CANVAS INITIALIZATION & LOOPS
    // =========================================================================
    let constellationFsEventsBound = false;

    function initConstellationFullscreen() {
      const bgCanvas = document.getElementById('constellationBgCanvas');
      const mainCanvas = document.getElementById('constellationMainCanvas');
      if (!bgCanvas || !mainCanvas) return;

      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      bgCanvas.width = Math.floor(w * dpr);
      bgCanvas.height = Math.floor(h * dpr);
      mainCanvas.width = Math.floor(w * dpr);
      mainCanvas.height = Math.floor(h * dpr);

      // Generate Background Stars if empty
      if (cBgStars.length === 0) {
        for (let i = 0; i < 220; i++) {
          cBgStars.push({
            x: Math.random(),
            y: Math.random(),
            r: Math.random() * 1.5 + 0.5,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.002 + 0.001,
            color: Math.random() < 0.2 ? '#c084fc' : Math.random() < 0.4 ? '#38bdf8' : Math.random() < 0.6 ? '#fde047' : '#ffffff'
          });
        }
      }

      if (!constellationFsEventsBound) {
        constellationFsEventsBound = true;

        // Mouse Drag / Pan
        mainCanvas.addEventListener('mousedown', (e) => {
          if (e.button !== 0) return;
          cIsDragging = true;
          cDragStartX = e.clientX;
          cDragStartY = e.clientY;
          cCamStartX = cTargetCamX;
          cCamStartY = cTargetCamY;
          cDragDistance = 0;
        });

        window.addEventListener('mousemove', (e) => {
          if (cIsDragging) {
            const dx = e.clientX - cDragStartX;
            const dy = e.clientY - cDragStartY;
            cDragDistance += Math.hypot(dx, dy);
            cTargetCamX = cCamStartX - dx / cCamZoom;
            cTargetCamY = cCamStartY - dy / cCamZoom;
          } else if (isConstellationFullscreenOpen) {
            const rect = mainCanvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const w = mainCanvas.width / (window.devicePixelRatio || 1);
            const h = mainCanvas.height / (window.devicePixelRatio || 1);
            const worldX = (mouseX - w / 2) / cCamZoom + cCamX;
            const worldY = (mouseY - h / 2) / cCamZoom + cCamY;

            let isHover = false;
            ALL_SKILL_TREE_NODES.forEach(node => {
              const nx = node.cx * GALAXY_BASE_W;
              const ny = node.cy * GALAXY_BASE_H;
              if (Math.hypot(worldX - nx, worldY - ny) < 28) {
                isHover = true;
              }
            });
            mainCanvas.style.cursor = isHover ? 'pointer' : 'grab';
          }
        });

        window.addEventListener('mouseup', () => {
          cIsDragging = false;
        });

        // Click selection
        mainCanvas.addEventListener('click', (e) => {
          if (cDragDistance > 10) return; // Ignore drag clicks
          const rect = mainCanvas.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          const w = mainCanvas.width / (window.devicePixelRatio || 1);
          const h = mainCanvas.height / (window.devicePixelRatio || 1);
          const worldX = (mouseX - w / 2) / cCamZoom + cCamX;
          const worldY = (mouseY - h / 2) / cCamZoom + cCamY;

          let closest = null;
          let minDist = 42;
          ALL_SKILL_TREE_NODES.forEach(node => {
            const nx = node.cx * GALAXY_BASE_W;
            const ny = node.cy * GALAXY_BASE_H;
            const d = Math.hypot(worldX - nx, worldY - ny);
            if (d < minDist) {
              minDist = d;
              closest = node;
            }
          });

          if (closest) {
            selectInspectorNode(closest.id);
            spawnConstellationClickShockwave(closest);
            playTone(660, 'sine', 0.08, 0.08);
          }
        });

        // Wheel Zoom
        mainCanvas.addEventListener('wheel', (e) => {
          if (!isConstellationFullscreenOpen) return;
          e.preventDefault();
          const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
          cTargetCamZoom = Math.min(2.5, Math.max(0.45, cTargetCamZoom * zoomFactor));
        }, { passive: false });

        // Touch Drag & Pinch Zoom
        mainCanvas.addEventListener('touchstart', (e) => {
          if (e.touches.length === 1) {
            cIsDragging = true;
            cDragStartX = e.touches[0].clientX;
            cDragStartY = e.touches[0].clientY;
            cCamStartX = cTargetCamX;
            cCamStartY = cTargetCamY;
            cDragDistance = 0;
          } else if (e.touches.length === 2) {
            cIsDragging = false;
            cTouchStartDist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
            cTouchStartZoom = cTargetCamZoom;
          }
        }, { passive: true });

        mainCanvas.addEventListener('touchmove', (e) => {
          if (e.touches.length === 1 && cIsDragging) {
            const dx = e.touches[0].clientX - cDragStartX;
            const dy = e.touches[0].clientY - cDragStartY;
            cDragDistance += Math.hypot(dx, dy);
            cTargetCamX = cCamStartX - dx / cCamZoom;
            cTargetCamY = cCamStartY - dy / cCamZoom;
          } else if (e.touches.length === 2) {
            const curDist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
            if (cTouchStartDist > 0) {
              const ratio = curDist / cTouchStartDist;
              cTargetCamZoom = Math.min(2.5, Math.max(0.45, cTouchStartZoom * ratio));
            }
          }
        }, { passive: true });

        mainCanvas.addEventListener('touchend', (e) => {
          cIsDragging = false;
          if (e.touches.length === 0 && cDragDistance < 8) {
            // Touch tap handled
          }
        });

        // Window resize
        window.addEventListener('resize', () => {
          if (isConstellationFullscreenOpen) {
            const dpr = window.devicePixelRatio || 1;
            const w = window.innerWidth;
            const h = window.innerHeight;
            bgCanvas.width = Math.floor(w * dpr);
            bgCanvas.height = Math.floor(h * dpr);
            mainCanvas.width = Math.floor(w * dpr);
            mainCanvas.height = Math.floor(h * dpr);
          }
        });

        // Keydown Escape
        window.addEventListener('keydown', (e) => {
          if (isConstellationFullscreenOpen && e.key === 'Escape') {
            closeConstellationFullscreen();
          }
        });
      }

      // Start Loops
      if (!cBgAnimFrame) {
        cBgAnimFrame = requestAnimationFrame(runConstellationBgLoop);
      }
      if (!cMainAnimFrame) {
        cMainAnimFrame = requestAnimationFrame(runConstellationMainLoop);
      }
    }

    function spawnConstellationClickShockwave(node) {
      cShockwaves.push({
        x: node.cx * GALAXY_BASE_W,
        y: node.cy * GALAXY_BASE_H,
        radius: 10,
        maxRadius: 65,
        alpha: 1.0,
        color: node.branch === 'manual' ? '#f43f5e' : node.branch === 'passive' ? '#06b6d4' : node.branch === 'anomaly' ? '#f59e0b' : '#a855f7'
      });
    }

    function spawnConstellationStarBurst(node) {
      const wx = node.cx * GALAXY_BASE_W;
      const wy = node.cy * GALAXY_BASE_H;
      const color = node.branch === 'manual' ? '#f43f5e' : node.branch === 'passive' ? '#06b6d4' : node.branch === 'anomaly' ? '#f59e0b' : '#a855f7';

      cShockwaves.push({
        x: wx,
        y: wy,
        radius: 12,
        maxRadius: node.keystone ? 120 : 80,
        alpha: 1.0,
        color: color
      });

      const count = node.keystone ? 45 : 28;
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = Math.random() * 4.5 + 1.2;
        cBurstParticles.push({
          x: wx,
          y: wy,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 1.0,
          decay: Math.random() * 0.02 + 0.015,
          size: Math.random() * 3 + 1.5,
          color: Math.random() < 0.3 ? '#ffffff' : color
        });
      }
    }

    // Background Canvas Loop
    function runConstellationBgLoop(timestamp) {
      if (!isConstellationFullscreenOpen) {
        cBgAnimFrame = null;
        return;
      }

      const canvas = document.getElementById('constellationBgCanvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const dpr = window.devicePixelRatio || 1;
        const now = timestamp || performance.now();

        ctx.fillStyle = '#02040a';
        ctx.fillRect(0, 0, w, h);

        // 4 Nebula Clouds
        const parallaxX = (cCamX - 700) * 0.03 * dpr;
        const parallaxY = (cCamY - 480) * 0.03 * dpr;

        // Universal (Purple)
        drawNebula(ctx, w * 0.5 - parallaxX, h * 0.25 - parallaxY, Math.min(w, h) * 0.45, 'rgba(168, 85, 247, 0.16)', now * 0.0004);
        // Manual (Crimson)
        drawNebula(ctx, w * 0.2 - parallaxX, h * 0.55 - parallaxY, Math.min(w, h) * 0.4, 'rgba(244, 63, 94, 0.14)', now * 0.0003 + 1);
        // Passive (Cyan)
        drawNebula(ctx, w * 0.5 - parallaxX, h * 0.75 - parallaxY, Math.min(w, h) * 0.45, 'rgba(6, 182, 212, 0.16)', now * 0.0004 + 2);
        // Anomaly (Amber)
        drawNebula(ctx, w * 0.8 - parallaxX, h * 0.55 - parallaxY, Math.min(w, h) * 0.4, 'rgba(245, 158, 11, 0.14)', now * 0.0003 + 3);

        // Twinkling Background Stars
        for (let i = 0; i < cBgStars.length; i++) {
          const s = cBgStars[i];
          const sx = (s.x * w - parallaxX * 0.5) % w;
          const sy = (s.y * h - parallaxY * 0.5) % h;
          const alpha = 0.35 + 0.55 * Math.sin(now * s.speed + s.phase);

          ctx.beginPath();
          ctx.arc(sx < 0 ? sx + w : sx, sy < 0 ? sy + h : sy, s.r * dpr, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = Math.max(0.1, alpha);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // Shooting Stars
        if (now > cNextShootingStarTime) {
          cNextShootingStarTime = now + Math.random() * 4500 + 3500;
          cShootingStars.push({
            x: Math.random() * w * 0.8,
            y: Math.random() * h * 0.4,
            len: Math.random() * 120 + 80,
            speed: Math.random() * 8 + 6,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
            life: 1.0,
            decay: 0.02
          });
        }

        for (let i = cShootingStars.length - 1; i >= 0; i--) {
          const ss = cShootingStars[i];
          const tailX = ss.x - Math.cos(ss.angle) * ss.len;
          const tailY = ss.y - Math.sin(ss.angle) * ss.len;

          const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
          grad.addColorStop(0, `rgba(255, 255, 255, ${ss.life})`);
          grad.addColorStop(0.3, `rgba(56, 189, 248, ${ss.life * 0.8})`);
          grad.addColorStop(1, 'rgba(168, 85, 247, 0)');

          ctx.beginPath();
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2 * dpr;
          ctx.stroke();

          ss.x += Math.cos(ss.angle) * ss.speed;
          ss.y += Math.sin(ss.angle) * ss.speed;
          ss.life -= ss.decay;
          if (ss.life <= 0) cShootingStars.splice(i, 1);
        }
      }

      cBgAnimFrame = requestAnimationFrame(runConstellationBgLoop);
    }

    function drawNebula(ctx, x, y, radius, color, time) {
      ctx.save();
      const driftX = Math.sin(time) * 20;
      const driftY = Math.cos(time * 0.8) * 20;
      const grad = ctx.createRadialGradient(x + driftX, y + driftY, radius * 0.05, x + driftX, y + driftY, radius);
      grad.addColorStop(0, color);
      grad.addColorStop(0.5, color.replace(/[\d\.]+\)$/, '0.08)'));
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x + driftX, y + driftY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Main Galaxy Canvas Loop
    function runConstellationMainLoop(timestamp) {
      if (!isConstellationFullscreenOpen) {
        cMainAnimFrame = null;
        return;
      }

      const canvas = document.getElementById('constellationMainCanvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const dpr = window.devicePixelRatio || 1;
        const now = timestamp || performance.now();

        // Smooth camera easing
        cCamX += (cTargetCamX - cCamX) * 0.12;
        cCamY += (cTargetCamY - cCamY) * 0.12;
        cCamZoom += (cTargetCamZoom - cCamZoom) * 0.12;

        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;

        function toScreenX(worldX) {
          return (worldX - cCamX) * cCamZoom * dpr + cx;
        }
        function toScreenY(worldY) {
          return (worldY - cCamY) * cCamZoom * dpr + cy;
        }

        // 1. Draw Constellation Titles & Badges
        drawConstellationBranchTitles(ctx, toScreenX, toScreenY, dpr);

        // 2. Draw Connection Lines & Energy Photons
        ALL_SKILL_TREE_NODES.forEach((node, idx) => {
          if (!node.req) return;
          const parent = ALL_SKILL_TREE_NODES.find(n => n.id === node.req);
          if (!parent) return;

          const x1 = toScreenX(parent.cx * GALAXY_BASE_W);
          const y1 = toScreenY(parent.cy * GALAXY_BASE_H);
          const x2 = toScreenX(node.cx * GALAXY_BASE_W);
          const y2 = toScreenY(node.cy * GALAXY_BASE_H);

          const isChildUnlocked = isSkillNodeUnlocked(node);
          const childLvl = (state.prestigeUpgrades && state.prestigeUpgrades[node.id]) || 0;
          const branchColor = node.branch === 'manual' ? '#f43f5e' : node.branch === 'passive' ? '#06b6d4' : node.branch === 'anomaly' ? '#f59e0b' : '#a855f7';

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);

          if (childLvl > 0) {
            // Unlocked Beam
            ctx.strokeStyle = branchColor;
            ctx.lineWidth = 4 * dpr;
            ctx.shadowColor = branchColor;
            ctx.shadowBlur = 16 * dpr;
            ctx.stroke();

            // Inner white line
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.6 * dpr;
            ctx.shadowBlur = 6 * dpr;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Animated Traveling Photons (2 packets)
            for (let p = 0; p < 2; p++) {
              const t = ((now * 0.0005) + (idx * 0.14) + (p * 0.5)) % 1;
              const px = x1 + (x2 - x1) * t;
              const py = y1 + (y2 - y1) * t;

              ctx.beginPath();
              ctx.arc(px, py, 3.8 * dpr, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = branchColor;
              ctx.shadowBlur = 14 * dpr;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          } else if (isChildUnlocked) {
            // Available: glowing dashed line
            ctx.strokeStyle = branchColor;
            ctx.lineWidth = 2.2 * dpr;
            ctx.shadowColor = branchColor;
            ctx.shadowBlur = 8 * dpr;
            ctx.setLineDash([8 * dpr, 6 * dpr]);
            ctx.lineDashOffset = (-now * 0.015) % 14;
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.shadowBlur = 0;
          } else {
            // Locked: faint stardust line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 1.2 * dpr;
            ctx.setLineDash([4 * dpr, 6 * dpr]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });

        // 3. Draw Shockwaves
        for (let i = cShockwaves.length - 1; i >= 0; i--) {
          const sw = cShockwaves[i];
          const sx = toScreenX(sw.x);
          const sy = toScreenY(sw.y);

          ctx.beginPath();
          ctx.arc(sx, sy, sw.radius * dpr * cCamZoom, 0, Math.PI * 2);
          ctx.strokeStyle = sw.color;
          ctx.globalAlpha = sw.alpha;
          ctx.lineWidth = 3 * dpr;
          ctx.shadowColor = sw.color;
          ctx.shadowBlur = 16 * dpr;
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1.0;

          sw.radius += 3.2;
          sw.alpha -= 0.038;
          if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
            cShockwaves.splice(i, 1);
          }
        }

        // 4. Draw Burst Particles
        for (let i = cBurstParticles.length - 1; i >= 0; i--) {
          const bp = cBurstParticles[i];
          const sx = toScreenX(bp.x);
          const sy = toScreenY(bp.y);

          ctx.beginPath();
          ctx.arc(sx, sy, bp.size * dpr, 0, Math.PI * 2);
          ctx.fillStyle = bp.color;
          ctx.globalAlpha = bp.life;
          ctx.shadowColor = bp.color;
          ctx.shadowBlur = 10 * dpr;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1.0;

          bp.x += bp.vx;
          bp.y += bp.vy;
          bp.life -= bp.decay;
          if (bp.life <= 0) cBurstParticles.splice(i, 1);
        }

        // 5. Draw Star Nodes
        ALL_SKILL_TREE_NODES.forEach(node => {
          const sx = toScreenX(node.cx * GALAXY_BASE_W);
          const sy = toScreenY(node.cy * GALAXY_BASE_H);

          // Cull if offscreen with margin
          if (sx < -80 || sx > w + 80 || sy < -80 || sy > h + 80) return;

          const lvl = (state.prestigeUpgrades && state.prestigeUpgrades[node.id]) || 0;
          const isMax = lvl >= node.maxLevel;
          const isUnlocked = isSkillNodeUnlocked(node);
          const isSelected = selectedConstellationNodeId === node.id;
          const cost = getPrestigeUpgradeCost(node, lvl);
          const canAfford = isUnlocked && !isMax && (state.darkMatter || 0) >= cost;

          const baseR = (node.keystone ? 26 : 18) * dpr * Math.min(1.4, Math.max(0.7, cCamZoom));
          const branchColor = node.branch === 'manual' ? '#f43f5e' : node.branch === 'passive' ? '#06b6d4' : node.branch === 'anomaly' ? '#f59e0b' : '#a855f7';

          // Selection Targeting Reticle
          if (isSelected) {
            const rot = now * 0.0012;
            const reticleR = baseR + 10 * dpr;
            ctx.save();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2 * dpr;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 16 * dpr;

            // 4 corner arcs
            for (let a = 0; a < 4; a++) {
              const startA = rot + a * (Math.PI / 2) + 0.15;
              const endA = startA + (Math.PI / 2) - 0.3;
              ctx.beginPath();
              ctx.arc(sx, sy, reticleR, startA, endA);
              ctx.stroke();
            }

            // Radial pulse halo
            const pulseR = reticleR + (3 + Math.sin(now * 0.005) * 3) * dpr;
            ctx.beginPath();
            ctx.arc(sx, sy, pulseR, 0, Math.PI * 2);
            ctx.strokeStyle = branchColor;
            ctx.lineWidth = 1 * dpr;
            ctx.stroke();
            ctx.restore();
          }

          // Keystone Node Special: 4-Point Cross Diffraction Flare & Orbiting Rings
          if (node.keystone) {
            ctx.save();
            // 4-point cross diffraction flare
            const flareLen = (lvl > 0 ? 55 : 35) * dpr;
            const gradH = ctx.createLinearGradient(sx - flareLen, sy, sx + flareLen, sy);
            gradH.addColorStop(0, 'transparent');
            gradH.addColorStop(0.5, '#ffffff');
            gradH.addColorStop(1, 'transparent');
            ctx.fillStyle = gradH;
            ctx.fillRect(sx - flareLen, sy - 1 * dpr, flareLen * 2, 2 * dpr);

            const gradV = ctx.createLinearGradient(sx, sy - flareLen, sx, sy + flareLen);
            gradV.addColorStop(0, 'transparent');
            gradV.addColorStop(0.5, '#ffffff');
            gradV.addColorStop(1, 'transparent');
            ctx.fillStyle = gradV;
            ctx.fillRect(sx - 1 * dpr, sy - flareLen, 2 * dpr, flareLen * 2);

            // Orbiting Ring
            const ringR = baseR + 7 * dpr;
            ctx.beginPath();
            ctx.ellipse(sx, sy, ringR, ringR * 0.45, now * 0.0008, 0, Math.PI * 2);
            ctx.strokeStyle = isMax ? '#fde047' : branchColor;
            ctx.lineWidth = 1.5 * dpr;
            ctx.shadowColor = isMax ? '#fde047' : branchColor;
            ctx.shadowBlur = 12 * dpr;
            ctx.stroke();
            ctx.restore();
          }

          // Buyable Pulse Beacon
          if (canAfford) {
            const beaconR = baseR + (4 + Math.sin(now * 0.006) * 4) * dpr;
            ctx.beginPath();
            ctx.arc(sx, sy, beaconR, 0, Math.PI * 2);
            ctx.strokeStyle = '#fde047';
            ctx.lineWidth = 2 * dpr;
            ctx.shadowColor = '#fde047';
            ctx.shadowBlur = 12 * dpr;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }

          // Star Core Disc
          ctx.beginPath();
          ctx.arc(sx, sy, baseR, 0, Math.PI * 2);

          if (lvl > 0) {
            const grad = ctx.createRadialGradient(sx, sy, 2 * dpr, sx, sy, baseR);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.35, branchColor);
            grad.addColorStop(1, '#090d16');
            ctx.fillStyle = grad;
            ctx.shadowColor = branchColor;
            ctx.shadowBlur = (isMax ? 24 : 16) * dpr;
          } else if (canAfford) {
            const grad = ctx.createRadialGradient(sx, sy, 2 * dpr, sx, sy, baseR);
            grad.addColorStop(0, '#fef08a');
            grad.addColorStop(0.5, '#475569');
            grad.addColorStop(1, '#0f172a');
            ctx.fillStyle = grad;
            ctx.shadowColor = '#fde047';
            ctx.shadowBlur = 12 * dpr;
          } else if (isUnlocked) {
            ctx.fillStyle = '#1e293b';
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
            ctx.shadowBlur = 0;
          }
          ctx.fill();

          ctx.lineWidth = 2 * dpr;
          ctx.strokeStyle = lvl > 0 ? (isMax ? '#fde047' : branchColor) : isUnlocked ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.12)';
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Emoji Icon
          ctx.font = `${Math.round((node.keystone ? 17 : 14) * dpr * Math.min(1.3, Math.max(0.8, cCamZoom)))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.icon, sx, sy);

          // Level Badge Text below
          ctx.font = `bold ${Math.round(10 * dpr)}px 'JetBrains Mono', monospace`;
          ctx.fillStyle = isMax ? '#fde047' : lvl > 0 ? '#ffffff' : isUnlocked ? '#94a3b8' : '#64748b';
          const lvlText = isMax ? '👑 MAX' : isUnlocked ? `${lvl}/${node.maxLevel}` : '🔒';
          ctx.fillText(lvlText, sx, sy + baseR + 12 * dpr);
        });
      }

      cMainAnimFrame = requestAnimationFrame(runConstellationMainLoop);
    }

    function drawConstellationBranchTitles(ctx, toScreenX, toScreenY, dpr) {
      // Universal
      drawBranchTitleCard(ctx, toScreenX(700), toScreenY(50), CONSTELLATION_BRANCH_META.universal, dpr);
      // Manual
      drawBranchTitleCard(ctx, toScreenX(200), toScreenY(170), CONSTELLATION_BRANCH_META.manual, dpr);
      // Passive
      drawBranchTitleCard(ctx, toScreenX(700), toScreenY(1005), CONSTELLATION_BRANCH_META.passive, dpr);
      // Anomaly
      drawBranchTitleCard(ctx, toScreenX(1200), toScreenY(170), CONSTELLATION_BRANCH_META.anomaly, dpr);
    }

    function drawBranchTitleCard(ctx, sx, sy, meta, dpr) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.font = `900 ${Math.round(13 * dpr * Math.min(1.3, Math.max(0.8, cCamZoom)))}px sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = meta.color;
      ctx.shadowBlur = 10 * dpr;
      ctx.fillText(`✦ ${meta.codeName} ✦`, sx, sy);

      ctx.font = `700 ${Math.round(9.5 * dpr * Math.min(1.3, Math.max(0.8, cCamZoom)))}px sans-serif`;
      ctx.fillStyle = meta.color;
      ctx.shadowBlur = 6 * dpr;
      ctx.fillText(meta.subName, sx, sy + 14 * dpr);
      ctx.restore();
    }

    // =========================================================================
    // INSPECTOR & TALENT ACTIONS
    // =========================================================================
    function isSkillNodeUnlocked(node) {
      if (!node.req) return true;
      const parentLvl = (state.prestigeUpgrades && state.prestigeUpgrades[node.req]) || 0;
      return parentLvl >= (node.reqLvl || 1);
    }

    function calculateTotalSpentDarkMatter() {
      let total = 0;
      ALL_SKILL_TREE_NODES.forEach(node => {
        const curLvl = (state.prestigeUpgrades && state.prestigeUpgrades[node.id]) || 0;
        for (let l = 0; l < curLvl; l++) {
          total += getPrestigeUpgradeCost(node, l);
        }
      });
      return total;
    }

    function confirmRespecSkillTree() {
      const spent = calculateTotalSpentDarkMatter();
      if (spent <= 0) {
        showToast('ℹ️ Nu ai Materie Întunecată cheltuită în talente.');
        return;
      }
      if (confirm(`🔄 Ești sigur că vrei să resetezi toate talentele din Constelație?\n\nÎți va fi restituită 100% Materia Întunecată investită (+${spent} 🔮)!`)) {
        respecSkillTree();
      }
    }

    function respecSkillTree() {
      const spent = calculateTotalSpentDarkMatter();
      if (spent <= 0) {
        showToast('ℹ️ Nu ai puncte de Materie Întunecată cheltuite în talente.');
        return;
      }
      state.darkMatter = (state.darkMatter || 0) + spent;
      ALL_SKILL_TREE_NODES.forEach(node => {
        state.prestigeUpgrades[node.id] = 0;
      });
      playTone(520, 'sine', 0.2, 0.15);
      showToast(`🔄 Talente resetate complet! Ți-au fost restituite +${spent} 🔮 Materie Întunecată.`);

      renderSkillTree();
      updateUI();
      saveGame();
      if (cloudSession && (cloudSession.access_token || cloudSession.refresh_token)) {
        cloudPushSave(false);
      }
    }

    function buySkillTreeNode(id) {
      const node = ALL_SKILL_TREE_NODES.find(n => n.id === id);
      if (!node) return;
      if (!isSkillNodeUnlocked(node)) {
        const parentNode = ALL_SKILL_TREE_NODES.find(n => n.id === node.req);
        const parentName = parentNode ? parentNode.name : node.req;
        showToast(`🔒 Necesar mai întâi: ${parentName} (Nivel ${node.reqLvl}+)`);
        playTone(280, 'sawtooth', 0.1, 0.08);
        return;
      }
      const lvl = (state.prestigeUpgrades && state.prestigeUpgrades[id]) || 0;
      if (lvl >= node.maxLevel) {
        showToast('👑 Acest talent a atins deja nivelul MAXIM!');
        return;
      }
      const cost = getPrestigeUpgradeCost(node, lvl);
      if (state.darkMatter < cost) {
        showToast(`⚠️ Ai nevoie de ${cost} 🔮 Materie Întunecată!`);
        playTone(260, 'sine', 0.1, 0.08);
        return;
      }

      state.darkMatter -= cost;
      state.prestigeUpgrades[id] = lvl + 1;
      const branchColor = node.branch === 'manual' ? '#f43f5e' : node.branch === 'passive' ? '#06b6d4' : node.branch === 'anomaly' ? '#f59e0b' : '#a855f7';

      if (isConstellationFullscreenOpen) {
        spawnConstellationStarBurst(node);
        playConstellationStarBurstSound(node.keystone);
      } else {
        spawnActivationOrbToCore(null, branchColor);
        playTone(node.keystone ? 880 : 720, 'triangle', 0.16, 0.12);
        spawnParticles(window.innerWidth / 2, window.innerHeight / 2, node.keystone ? 32 : 16, branchColor);
      }

      showToast(`✨ Talent deblocat: ${node.name} (Nivel ${lvl + 1}/${node.maxLevel})!`);

      selectInspectorNode(id);
      renderSkillTree();
      updateUI();
      saveGame();
      checkAchievements();
      if (cloudSession && (cloudSession.access_token || cloudSession.refresh_token)) {
        cloudPushSave(false);
      }
    }

    function buyPrestigeUpgrade(id) {
      buySkillTreeNode(id);
    }

    function selectInspectorNode(id) {
      selectedConstellationNodeId = id;
      const node = ALL_SKILL_TREE_NODES.find(n => n.id === id);
      if (!node) return;

      const lvl = (state.prestigeUpgrades && state.prestigeUpgrades[node.id]) || 0;
      const isMax = lvl >= node.maxLevel;
      const isUnlocked = isSkillNodeUnlocked(node);
      const cost = getPrestigeUpgradeCost(node, lvl);
      const canAfford = isUnlocked && !isMax && (state.darkMatter || 0) >= cost;
      const bColor = node.branch === 'manual' ? '#f43f5e' : node.branch === 'passive' ? '#06b6d4' : node.branch === 'anomaly' ? '#f59e0b' : '#a855f7';

      // 1. Update Fullscreen Inspector Elements
      const cAvatarIcon = document.getElementById('cNodeAvatarIcon');
      const cAvatarHalo = document.getElementById('cNodeAvatarHalo');
      const cName = document.getElementById('cNodeName');
      const cBranchTag = document.getElementById('cNodeBranchTag');
      const cTierTag = document.getElementById('cNodeTierTag');
      const cLevelPill = document.getElementById('cNodeLevelPill');
      const cDesc = document.getElementById('cNodeDesc');
      const cReq = document.getElementById('cNodeReq');
      const cBuyBtn = document.getElementById('cNodeBuyBtn');
      const cCard = document.getElementById('cInspectorCard');

      if (cAvatarIcon) cAvatarIcon.innerText = node.icon;
      if (cAvatarHalo) {
        cAvatarHalo.style.borderColor = bColor;
        cAvatarHalo.style.boxShadow = `0 0 16px ${bColor}`;
      }
      if (cName) cName.innerText = node.name;
      if (cBranchTag) {
        cBranchTag.innerText = node.branchName;
        cBranchTag.style.borderColor = bColor;
        cBranchTag.style.color = bColor;
        cBranchTag.style.background = `${bColor}26`;
      }
      if (cTierTag) cTierTag.innerText = `Tier ${node.tier}${node.keystone ? ' (Keystone)' : ''}`;
      if (cLevelPill) {
        cLevelPill.innerText = isMax ? '👑 MAX' : `Niv. ${lvl}/${node.maxLevel}`;
        cLevelPill.style.color = isMax ? '#fde047' : '#38bdf8';
      }
      if (cDesc) cDesc.innerText = node.desc;
      if (cCard) cCard.style.borderColor = `${bColor}70`;

      if (cReq) {
        if (!isUnlocked && node.req) {
          const parentNode = ALL_SKILL_TREE_NODES.find(n => n.id === node.req);
          cReq.style.display = 'block';
          cReq.innerText = `🔒 Necesar: ${parentNode ? parentNode.name : node.req} (Nivel ${node.reqLvl}+)`;
        } else {
          cReq.style.display = 'none';
        }
      }

      if (cBuyBtn) {
        cBuyBtn.className = 'c-buy-btn ' + (isMax ? 'maxed-btn' : canAfford ? 'can-buy' : 'cannot-buy');
        cBuyBtn.disabled = isMax || !canAfford;
        cBuyBtn.innerText = isMax ? '👑 Talent Maximizat' : !isUnlocked ? '🔒 Blocat de Cerințe' : canAfford ? `✨ Cumpără (${cost} 🔮)` : `⚠️ Necesită ${cost} 🔮`;
      }

      // 2. Sync Legacy Inline Elements (for backwards compatibility)
      const iconEl = document.getElementById('inspectorIcon');
      const titleEl = document.getElementById('inspectorTitle');
      const branchBadgeEl = document.getElementById('inspectorBranchBadge');
      const lvlEl = document.getElementById('inspectorLvl');
      const descEl = document.getElementById('inspectorDesc');
      const reqEl = document.getElementById('inspectorReq');
      const buyBtn = document.getElementById('inspectorBuyBtn');

      if (iconEl) iconEl.innerText = node.icon;
      if (titleEl) titleEl.innerText = node.name;
      if (branchBadgeEl) {
        branchBadgeEl.innerText = node.branchName;
        branchBadgeEl.style.borderColor = bColor;
        branchBadgeEl.style.color = bColor;
      }
      if (lvlEl) lvlEl.innerText = isMax ? 'NIVEL MAXIM' : `Niv. ${lvl}/${node.maxLevel}`;
      if (descEl) descEl.innerText = node.desc;
      if (reqEl) {
        if (!isUnlocked && node.req) {
          const parentNode = ALL_SKILL_TREE_NODES.find(n => n.id === node.req);
          reqEl.style.display = 'block';
          reqEl.innerText = `🔒 Necesar: ${parentNode ? parentNode.name : node.req} (Nivel ${node.reqLvl}+)`;
        } else {
          reqEl.style.display = 'none';
        }
      }
      if (buyBtn) {
        buyBtn.className = 'skill-node-btn ' + (isMax ? 'maxed-btn' : canAfford ? 'can-buy' : 'cannot-buy');
        buyBtn.disabled = isMax || !canAfford;
        buyBtn.innerText = isMax ? '👑 Talent Complet' : !isUnlocked ? '🔒 Blocat de Cerințe' : canAfford ? `✨ Cumpără (${cost} 🔮)` : `⚠️ Necesită ${cost} 🔮`;
      }
    }

    function buySelectedInspectorNode() {
      if (selectedConstellationNodeId) {
        buySkillTreeNode(selectedConstellationNodeId);
      }
    }

    function renderConstellationSkillTree() {
      const dmBadge = document.getElementById('skillTreeDmBadge');
      if (dmBadge) {
        dmBadge.innerText = `🔮 Materie Disponibilă: ${state.darkMatter || 0}`;
      }

      // Sync Fullscreen Counters
      const cDmVal = document.getElementById('cDmValue');
      if (cDmVal) cDmVal.innerText = formatNumber(state.darkMatter || 0, 0);

      const cProgVal = document.getElementById('cStarsProgressVal');
      let unlockedCount = 0;
      ALL_SKILL_TREE_NODES.forEach(n => {
        if ((state.prestigeUpgrades && state.prestigeUpgrades[n.id]) > 0) unlockedCount++;
      });
      if (cProgVal) cProgVal.innerText = `${unlockedCount} / ${ALL_SKILL_TREE_NODES.length}`;

      // Sync Tab Portal Stats
      const portalDm = document.getElementById('portalDmVal');
      if (portalDm) portalDm.innerText = formatNumber(state.darkMatter || 0, 0);
      const portalStars = document.getElementById('portalStarsVal');
      if (portalStars) portalStars.innerText = `${unlockedCount} / ${ALL_SKILL_TREE_NODES.length}`;
      const portalMult = document.getElementById('portalMultVal');
      if (portalMult) {
        const bonus = Math.round(unlockedCount * 3.5);
        portalMult.innerText = `+${bonus}%`;
      }

      if (selectedConstellationNodeId) {
        selectInspectorNode(selectedConstellationNodeId);
      }
    }

    function renderSkillTree() {
      renderConstellationSkillTree();
    }

    function renderPrestigeUpgrades() {
      const nextRebirthNum = (state.prestigeCount || 0) + 1;
      const reqEnergy = getRebirthEnergyRequirement();
      const ready = isRebirthReady();
      const catalystLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_dm_catalyst']) || 0;
      const baseDm = getCurrentRebirthDarkMatterReward() + catalystLvl;
      const isVoid = typeof activeCosmicStorm !== 'undefined' && activeCosmicStorm && activeCosmicStorm.id === 'void_singularity';
      const voidBonus = isVoid ? Math.max(1, Math.round(baseDm * 0.25)) : 0;
      const dmReward = baseDm + voidBonus;
      const curEnergy = state.energy || 0;
      const pct = Math.min(100, (curEnergy / reqEnergy) * 100);

      const dmCurrentVal = document.getElementById('dmCurrentVal');
      if (dmCurrentVal) dmCurrentVal.innerText = `${state.prestigeCount || 0} 🌌 | ${formatNumber(state.darkMatter, 0)} 🔮`;
      const pendingLbl = document.getElementById('dmPendingLabel');
      if (pendingLbl) pendingLbl.innerText = `Recompensă Rebirth #${nextRebirthNum}`;
      const dmPendingVal = document.getElementById('dmPendingVal');
      if (dmPendingVal) dmPendingVal.innerText = ready ? `+1 🌌 & +${dmReward} 🔮` : `Blocat (+${dmReward} 🔮)`;

      const dmNextReq = document.getElementById('dmNextReq');
      if (dmNextReq) dmNextReq.innerText = `${formatNumber(reqEnergy)} ⚡`;

      const progPctEl = document.getElementById('rebirthProgressPct');
      if (progPctEl) progPctEl.innerText = `${pct.toFixed(1)}% (${formatNumber(curEnergy)} / ${formatNumber(reqEnergy)} ⚡)`;
      const progFillEl = document.getElementById('rebirthProgressFill');
      if (progFillEl) progFillEl.style.width = `${pct}%`;

      const satBanner = document.getElementById('rebirthSaturationBanner');
      if (satBanner) satBanner.style.display = ready ? 'block' : 'none';

      const btnPres = document.getElementById('btnTriggerPrestige');
      if (btnPres) {
        btnPres.disabled = !ready;
        btnPres.innerText = ready
          ? `🌌 Declanșează Rebirth #${nextRebirthNum} (+1 🌌 & +${dmReward} 🔮)`
          : `🔒 Rebirth #${nextRebirthNum} Blocat (${pct.toFixed(1)}%)`;
      }

      // Sync Tab Portal Stat Cards
      const portalCount = document.getElementById('portalPresCountVal');
      if (portalCount) portalCount.innerText = `#${state.prestigeCount || 0}`;
      const portalDm = document.getElementById('portalPresDmVal');
      if (portalDm) portalDm.innerText = `${formatNumber(state.darkMatter || 0, 0)} 🔮`;
      const portalMult = document.getElementById('portalPresMultVal');
      if (portalMult) {
        const totalMultPct = ((state.prestigeCount || 0) * 15) + ((state.darkMatter || 0) * 10);
        portalMult.innerText = `+${totalMultPct}%`;
      }

      if (isPrestigeFullscreenOpen) {
        updatePrestigeFullscreen();
      }

      if (isOmniverseFullscreenOpen) {
        updateOmniverseFullscreen();
      }
    }

    // =========================================================================
    // V3.9.0: CAMERA SINGULARITĂȚII CUANTICE (FULLSCREEN PRESTIGE & VORTEX WARP)
    // =========================================================================
    let isPrestigeFullscreenOpen = false;
    let presBgAnimFrame = null;
    let presBgStars = [];
    let presInfallingMatter = [];
    let presWarpAnimFrameId = null;
    let presFsEventsBound = false;

    function playSingularityWarpSound(direction = 'enter') {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;

        if (direction === 'enter') {
          // 1. Deep sub-bass gravitational collapse sweep (sine 130Hz -> 36Hz)
          const subOsc = audioCtx.createOscillator();
          const subGain = audioCtx.createGain();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(130, now);
          subOsc.frequency.exponentialRampToValueAtTime(36, now + 0.6);
          subGain.gain.setValueAtTime(0.001, now);
          subGain.gain.linearRampToValueAtTime(0.28, now + 0.18);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
          subOsc.connect(subGain);
          subGain.connect(audioCtx.destination);
          subOsc.start(now);
          subOsc.stop(now + 0.75);

          // 2. Cosmic shimmer / ethereal chords
          const chords = [196.00, 293.66, 392.00, 493.88, 587.33];
          chords.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const st = now + 0.12 + idx * 0.04;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, st);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.02, st + 0.45);
            gain.gain.setValueAtTime(0.001, st);
            gain.gain.linearRampToValueAtTime(0.06, st + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.6);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(st);
            osc.stop(st + 0.6);
          });
        } else {
          // Exit warp: ascending release
          const subOsc = audioCtx.createOscillator();
          const subGain = audioCtx.createGain();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(45, now);
          subOsc.frequency.exponentialRampToValueAtTime(120, now + 0.35);
          subGain.gain.setValueAtTime(0.18, now);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          subOsc.connect(subGain);
          subGain.connect(audioCtx.destination);
          subOsc.start(now);
          subOsc.stop(now + 0.4);
        }
      } catch (e) {}
    }

    function runPrestigeWarpTransition(duration = 750, onComplete) {
      const canvas = document.getElementById('prestigeWarpCanvas');
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

      const particleCount = 420;
      const particles = [];
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * Math.max(w, h) * 1.2 + 80;
        particles.push({
          angle,
          dist,
          speed: Math.random() * 8 + 4,
          spiralSpeed: (Math.random() - 0.5) * 0.07,
          size: Math.random() * 2.2 + 1,
          color: Math.random() < 0.4 ? '#c084fc' : Math.random() < 0.7 ? '#a855f7' : Math.random() < 0.85 ? '#38bdf8' : '#ec4899'
        });
      }

      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.fillStyle = 'rgba(2, 2, 8, 0.28)';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        particles.forEach(p => {
          p.dist -= p.speed * (1 + ease * 12);
          p.angle += p.spiralSpeed * (1 + ease * 4);
          if (p.dist < 5) p.dist = Math.max(w, h) * 0.9;

          const px = cx + Math.cos(p.angle) * p.dist;
          const py = cy + Math.sin(p.angle) * p.dist;
          const prevX = cx + Math.cos(p.angle - p.spiralSpeed * 3) * (p.dist + p.speed * 3.5);
          const prevY = cy + Math.sin(p.angle - p.spiralSpeed * 3) * (p.dist + p.speed * 3.5);

          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(px, py);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.lineCap = 'round';
          ctx.stroke();
        });

        if (progress > 0.35 && progress < 0.75) {
          const flashAlpha = Math.sin(((progress - 0.35) / 0.4) * Math.PI) * 0.75;
          const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6);
          radGrad.addColorStop(0, `rgba(216, 180, 254, ${flashAlpha})`);
          radGrad.addColorStop(0.3, `rgba(168, 85, 247, ${flashAlpha * 0.6})`);
          radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = radGrad;
          ctx.fillRect(0, 0, w, h);
        }

        ctx.restore();

        if (progress < 1) {
          presWarpAnimFrameId = requestAnimationFrame(step);
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

      presWarpAnimFrameId = requestAnimationFrame(step);
    }

    function openPrestigeFullscreen() {
      if (isPrestigeFullscreenOpen) return;
      isPrestigeFullscreenOpen = true;

      playSingularityWarpSound('enter');

      const appShell = document.querySelector('.app-shell');
      if (appShell) appShell.classList.add('app-shell-warp-out');

      runPrestigeWarpTransition(700, () => {});

      setTimeout(() => {
        const fsEl = document.getElementById('prestigeFullscreen');
        if (fsEl) {
          fsEl.style.display = 'flex';
          void fsEl.offsetWidth;
          fsEl.classList.add('active');
        }
        initPrestigeFullscreen();
        updatePrestigeFullscreen();
      }, 420);
    }

    function closePrestigeFullscreen() {
      if (!isPrestigeFullscreenOpen) return;
      isPrestigeFullscreenOpen = false;

      playSingularityWarpSound('exit');

      const fsEl = document.getElementById('prestigeFullscreen');
      if (fsEl) {
        fsEl.classList.remove('active');
      }

      const appShell = document.querySelector('.app-shell');
      if (appShell) {
        appShell.classList.remove('app-shell-warp-out');
      }

      setTimeout(() => {
        if (fsEl && !isPrestigeFullscreenOpen) {
          fsEl.style.display = 'none';
        }
        if (presBgAnimFrame) {
          cancelAnimationFrame(presBgAnimFrame);
          presBgAnimFrame = null;
        }
      }, 380);
    }

    function initPrestigeFullscreen() {
      const bgCanvas = document.getElementById('prestigeBgCanvas');
      if (!bgCanvas) return;

      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      bgCanvas.width = Math.floor(w * dpr);
      bgCanvas.height = Math.floor(h * dpr);

      if (presBgStars.length === 0) {
        const starCount = 180;
        for (let i = 0; i < starCount; i++) {
          presBgStars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.5 + 0.4,
            baseAlpha: Math.random() * 0.6 + 0.2,
            twinkleSpeed: Math.random() * 0.003 + 0.001,
            phase: Math.random() * Math.PI * 2,
            color: Math.random() < 0.4 ? '#c084fc' : Math.random() < 0.7 ? '#38bdf8' : '#ffffff'
          });
        }
      }

      if (presInfallingMatter.length === 0) {
        const matterCount = 130;
        for (let i = 0; i < matterCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * Math.min(w, h) * 0.45 + 50;
          presInfallingMatter.push({
            angle,
            radius,
            angularSpeed: (0.015 + Math.random() * 0.02) * (radius < 120 ? 1.8 : 1),
            infallSpeed: 0.18 + Math.random() * 0.35,
            size: Math.random() * 2.2 + 0.8,
            color: Math.random() < 0.5 ? '#d8b4fe' : Math.random() < 0.8 ? '#38bdf8' : '#f472b6',
            alpha: Math.random() * 0.7 + 0.3
          });
        }
      }

      if (!presFsEventsBound) {
        presFsEventsBound = true;
        window.addEventListener('resize', () => {
          if (isPrestigeFullscreenOpen && bgCanvas) {
            const curDpr = window.devicePixelRatio || 1;
            bgCanvas.width = Math.floor(window.innerWidth * curDpr);
            bgCanvas.height = Math.floor(window.innerHeight * curDpr);
          }
        });
      }

      if (!presBgAnimFrame) {
        presBgAnimFrame = requestAnimationFrame(runPrestigeBgLoop);
      }
    }

    function runPrestigeBgLoop(timestamp) {
      if (!isPrestigeFullscreenOpen) {
        presBgAnimFrame = null;
        return;
      }

      const canvas = document.getElementById('prestigeBgCanvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const dpr = window.devicePixelRatio || 1;

        ctx.fillStyle = '#020208';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const baseRadius = Math.min(w, h) * 0.12;

        // 1. Ambient Background Stars
        presBgStars.forEach(s => {
          const alpha = s.baseAlpha + Math.sin(timestamp * s.twinkleSpeed + s.phase) * 0.25;
          ctx.beginPath();
          ctx.arc(s.x * dpr, s.y * dpr, s.r * dpr, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = Math.max(0.1, alpha);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // 2. Relativistic Polar Plasma Jets
        const jetLength = Math.max(w, h) * 0.75;
        const jetWidth = 35 * dpr;
        const pulse = Math.sin(timestamp * 0.004) * 0.15 + 0.85;

        // Top Jet
        const topGrad = ctx.createLinearGradient(cx, cy, cx, cy - jetLength);
        topGrad.addColorStop(0, 'rgba(168, 85, 247, 0.7)');
        topGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.45)');
        topGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = topGrad;
        ctx.beginPath();
        ctx.moveTo(cx - jetWidth * pulse, cy - baseRadius * 0.3);
        ctx.lineTo(cx + jetWidth * pulse, cy - baseRadius * 0.3);
        ctx.lineTo(cx + jetWidth * 3.5, cy - jetLength);
        ctx.lineTo(cx - jetWidth * 3.5, cy - jetLength);
        ctx.closePath();
        ctx.fill();

        // Bottom Jet
        const botGrad = ctx.createLinearGradient(cx, cy, cx, cy + jetLength);
        botGrad.addColorStop(0, 'rgba(168, 85, 247, 0.7)');
        botGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.45)');
        botGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = botGrad;
        ctx.beginPath();
        ctx.moveTo(cx - jetWidth * pulse, cy + baseRadius * 0.3);
        ctx.lineTo(cx + jetWidth * pulse, cy + baseRadius * 0.3);
        ctx.lineTo(cx + jetWidth * 3.5, cy + jetLength);
        ctx.lineTo(cx - jetWidth * 3.5, cy + jetLength);
        ctx.closePath();
        ctx.fill();

        // 3. Accretion Disk (Luminous Tilted Ellipses with Doppler Beaming)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.35); // Disk tilt
        const diskRx = baseRadius * 2.8;
        const diskRy = baseRadius * 0.75;

        for (let rMult = 1.1; rMult <= 3.2; rMult += 0.35) {
          ctx.beginPath();
          ctx.ellipse(0, 0, diskRx * (rMult / 2.2), diskRy * (rMult / 2.2), 0, 0, Math.PI * 2);
          const diskAlpha = (0.28 / rMult) * (Math.sin(timestamp * 0.003 + rMult) * 0.15 + 0.85);
          ctx.strokeStyle = rMult < 1.8 ? `rgba(236, 72, 153, ${diskAlpha})` : `rgba(168, 85, 247, ${diskAlpha})`;
          ctx.lineWidth = 14 * dpr * (1.8 / rMult);
          ctx.stroke();
        }
        ctx.restore();

        // 4. Infalling Dark Matter Particles
        presInfallingMatter.forEach(p => {
          p.angle += p.angularSpeed;
          p.radius -= p.infallSpeed;
          if (p.radius < baseRadius * 0.7) {
            p.radius = Math.min(w, h) * 0.42 + Math.random() * 30;
            p.angle = Math.random() * Math.PI * 2;
          }

          // Tilt coordinate to match accretion disk
          const cosA = Math.cos(p.angle);
          const sinA = Math.sin(p.angle);
          const rx = p.radius * cosA * dpr;
          const ry = (p.radius * sinA * 0.35) * dpr;
          const tilt = -0.35;
          const rotX = rx * Math.cos(tilt) - ry * Math.sin(tilt);
          const rotY = rx * Math.sin(tilt) + ry * Math.cos(tilt);

          const px = cx + rotX;
          const py = cy + rotY;

          const doppler = rotX < 0 ? 1.4 : 0.65;
          const finalAlpha = Math.min(1, p.alpha * doppler);

          ctx.beginPath();
          ctx.arc(px, py, p.size * dpr, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = finalAlpha;
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // 5. Gravitational Lensing Photon Ring
        const ringGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.82, cx, cy, baseRadius * 1.35);
        ringGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        ringGrad.addColorStop(0.3, 'rgba(192, 132, 252, 0.8)');
        ringGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.4)');
        ringGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = ringGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius * 1.35, 0, Math.PI * 2);
        ctx.fill();

        // 6. Kerr Black Hole Event Horizon Shadow (Singularity)
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius * 0.88, 0, Math.PI * 2);
        ctx.fillStyle = '#010103';
        ctx.fill();
        ctx.lineWidth = 2 * dpr;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.stroke();
      }

      presBgAnimFrame = requestAnimationFrame(runPrestigeBgLoop);
    }

    function updatePrestigeFullscreen() {
      const nextRebirthNum = (state.prestigeCount || 0) + 1;
      const reqEnergy = getRebirthEnergyRequirement();
      const ready = isRebirthReady();
      const catalystLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_dm_catalyst']) || 0;
      const baseDm = getCurrentRebirthDarkMatterReward() + catalystLvl;
      const isVoid = typeof activeCosmicStorm !== 'undefined' && activeCosmicStorm && activeCosmicStorm.id === 'void_singularity';
      const voidBonus = isVoid ? Math.max(1, Math.round(baseDm * 0.25)) : 0;
      const dmReward = baseDm + voidBonus;
      const curEnergy = state.energy || 0;
      const pct = Math.min(100, (curEnergy / reqEnergy) * 100);

      const totalPresMult = 1 + ((state.prestigeCount || 0) * 0.15) + ((state.darkMatter || 0) * 0.10);
      const totalPresBonusPct = ((state.prestigeCount || 0) * 15) + ((state.darkMatter || 0) * 10);

      // Header Badges
      const countEl = document.getElementById('presFsRebirthCount');
      if (countEl) countEl.innerText = `#${state.prestigeCount || 0}`;
      const dmEl = document.getElementById('presFsTotalDm');
      if (dmEl) dmEl.innerText = `${formatNumber(state.darkMatter || 0, 0)} 🔮`;
      const multEl = document.getElementById('presFsTotalMult');
      if (multEl) multEl.innerText = `${totalPresMult.toFixed(2)}x (+${totalPresBonusPct}%)`;

      // Central Stage Title & Gauge
      const titleEl = document.getElementById('presCoreTitle');
      if (titleEl) titleEl.innerText = `SINGULARITATEA CUANTICĂ #${nextRebirthNum}`;

      const statusEl = document.getElementById('presGaugeStatus');
      if (statusEl) {
        statusEl.innerText = ready 
          ? `💥 REZONANȚĂ CRITICĂ ATINSĂ (100%)` 
          : `⚡ Încărcare Gravitațională: ${pct.toFixed(1)}% (${formatNumber(curEnergy)} / ${formatNumber(reqEnergy)} ⚡)`;
        statusEl.style.color = ready ? '#4ade80' : '#38bdf8';
      }

      const gaugeFill = document.getElementById('presGaugeFill');
      if (gaugeFill) gaugeFill.style.width = `${pct}%`;

      const rewDm = document.getElementById('presRewardDmPending');
      if (rewDm) rewDm.innerText = `+${dmReward} 🔮 Materie Întunecată` + (ready ? ' (Gata de Recoltat)' : '');

      const rewMult = document.getElementById('presRewardMultPending');
      if (rewMult) rewMult.innerText = `+${15 + (dmReward * 10)}% Producție Nouă (+15% Singularitate & +${dmReward * 10}% DM)`;

      // Big CTA Button
      const ctaBtn = document.getElementById('btnPrestigeFullscreenCta');
      const ctaText = document.getElementById('presCtaBtnText');
      if (ctaBtn) {
        ctaBtn.disabled = !ready;
      }
      if (ctaText) {
        ctaText.innerText = ready 
          ? `DECLANȘEAZĂ SINGULARITATEA #${nextRebirthNum} (+1 🌌 & +${dmReward} 🔮)` 
          : `SINGULARITATEA #${nextRebirthNum} ÎN FORMARE (${pct.toFixed(1)}%)`;
      }

      // Sub modules
      const modCat = document.getElementById('presModCatalyst');
      if (modCat) {
        modCat.innerText = catalystLvl > 0 ? `+${catalystLvl} 🔮 DM (Nivel ${catalystLvl})` : 'Inactiv (Arbore Constelații)';
      }
      const modVoid = document.getElementById('presModVoidStorm');
      if (modVoid) {
        modVoid.innerText = isVoid ? `+${voidBonus} 🔮 (Furtună Singularitate Vid +25%)` : 'Niciun bonus de furtună';
      }
      const modReq = document.getElementById('presModReqEnergy');
      if (modReq) {
        modReq.innerText = `${formatNumber(reqEnergy)} ⚡`;
      }
    }

    function triggerPrestigeFromFullscreen() {
      if (!isRebirthReady() || isRebirthAnimating) return;
      triggerPrestige();
      if (isRebirthAnimating) {
        closePrestigeFullscreen();
      }
    }

    // =========================================================================
    // V3.8.0: PANTEONUL REALIZĂRILOR CUANTICE (FULLSCREEN & GOLDEN WARP)
    // =========================================================================
    let isAchievementsFullscreenOpen = false;
    let achFsSearchQuery = '';
    let achFsPresetFilter = 'all';
    let achFsCategoryFilter = 'all';
    let inspectedAchId = null;
    let achBgAnimFrame = null;
    let achBgStars = [];
    let achWarpAnimFrameId = null;

    function playAchievementsWarpSound(direction = 'enter') {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;

        if (direction === 'enter') {
          // 1. Sub-bass swell
          const subOsc = audioCtx.createOscillator();
          const subGain = audioCtx.createGain();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(55, now);
          subOsc.frequency.exponentialRampToValueAtTime(175, now + 0.48);
          subGain.gain.setValueAtTime(0.001, now);
          subGain.gain.linearRampToValueAtTime(0.22, now + 0.15);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
          subOsc.connect(subGain);
          subGain.connect(audioCtx.destination);
          subOsc.start(now);
          subOsc.stop(now + 0.65);

          // 2. Triumphant Golden Fanfare Chord (D4, F#4, A4, D5, F#5, A5)
          const freqs = [293.66, 369.99, 440.00, 587.33, 739.99, 880.00];
          freqs.forEach((f, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const st = now + 0.10 + idx * 0.05;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, st);
            osc.frequency.exponentialRampToValueAtTime(f * 1.015, st + 0.4);
            gain.gain.setValueAtTime(0.001, st);
            gain.gain.linearRampToValueAtTime(0.08, st + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.55);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(st);
            osc.stop(st + 0.55);
          });
        } else {
          // Exit warp: descending soft sub-bass + gentle chime
          const subOsc = audioCtx.createOscillator();
          const subGain = audioCtx.createGain();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(160, now);
          subOsc.frequency.exponentialRampToValueAtTime(50, now + 0.35);
          subGain.gain.setValueAtTime(0.14, now);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
          subOsc.connect(subGain);
          subGain.connect(audioCtx.destination);
          subOsc.start(now);
          subOsc.stop(now + 0.38);

          const chimeOsc = audioCtx.createOscillator();
          const chimeGain = audioCtx.createGain();
          chimeOsc.type = 'sine';
          chimeOsc.frequency.setValueAtTime(587.33, now);
          chimeGain.gain.setValueAtTime(0.08, now);
          chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          chimeOsc.connect(chimeGain);
          chimeGain.connect(audioCtx.destination);
          chimeOsc.start(now);
          chimeOsc.stop(now + 0.3);
        }
      } catch (e) {}
    }

    function replayInspectAchievementSound() {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        playSyntheticChimeTone(660, now, 0.14, 0.18, 'sine');
        playSyntheticChimeTone(880, now + 0.16, 0.22, 0.22, 'sine');
      } catch (e) {}
    }

    function runAchievementsWarpTransition(duration = 750, onComplete) {
      const canvas = document.getElementById('achievementsWarpCanvas');
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

      const starCount = 420;
      const stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: (Math.random() - 0.5) * w * 2.2,
          y: (Math.random() - 0.5) * h * 2.2,
          z: Math.random() * 1600 + 100,
          pz: 1700,
          color: Math.random() < 0.35 ? '#fde047' : Math.random() < 0.6 ? '#f59e0b' : Math.random() < 0.8 ? '#38bdf8' : '#ffffff',
          size: Math.random() * 1.8 + 0.8
        });
      }

      const startTime = performance.now();

      function stepWarp(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);

        ctx.fillStyle = 'rgba(2, 4, 10, 0.28)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let speed = 25;
        if (progress < 0.45) {
          speed = 25 + Math.sin(progress / 0.45 * Math.PI * 0.5) * 120;
        } else {
          speed = 145 * (1 - (progress - 0.45) / 0.55);
        }
        speed = Math.max(10, speed);

        const fov = 340 * dpr;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        for (let i = 0; i < starCount; i++) {
          const s = stars[i];
          s.pz = s.z;
          s.z -= speed;

          if (s.z <= 20) {
            s.z = 1600;
            s.pz = 1600;
            s.x = (Math.random() - 0.5) * w * 2.2;
            s.y = (Math.random() - 0.5) * h * 2.2;
          }

          const sx = (s.x / s.z) * fov + cx;
          const sy = (s.y / s.z) * fov + cy;
          const px = (s.x / s.pz) * fov + cx;
          const py = (s.y / s.pz) * fov + cy;

          if (sx >= 0 && sx <= canvas.width && sy >= 0 && sy <= canvas.height) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(sx, sy);
            ctx.strokeStyle = s.color;
            ctx.lineWidth = Math.min(4.5 * dpr, (1 - s.z / 1600) * 3.8 * dpr + 0.5);
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 8 * dpr;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }

        // Golden Trophy Portal Ring Expanding
        if (progress > 0.15) {
          const ringNorm = (progress - 0.15) / 0.85;
          const maxR = Math.hypot(canvas.width, canvas.height) * 0.65;
          const curR = ringNorm * maxR;

          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, curR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(253, 224, 71, ${Math.max(0, 1 - ringNorm)})`;
          ctx.lineWidth = (1 - ringNorm) * 10 * dpr + 1;
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 22 * dpr;
          ctx.stroke();
          ctx.restore();
        }

        if (progress < 1) {
          achWarpAnimFrameId = requestAnimationFrame(stepWarp);
        } else {
          cancelAnimationFrame(achWarpAnimFrameId);
          achWarpAnimFrameId = null;
          if (onComplete) onComplete();
        }
      }

      achWarpAnimFrameId = requestAnimationFrame(stepWarp);
    }

    function openAchievementsFullscreen() {
      if (isAchievementsFullscreenOpen) return;
      isAchievementsFullscreenOpen = true;

      // 1. Audio
      playAchievementsWarpSound('enter');

      // 2. Hide & blur app shell
      const appShell = document.querySelector('.app-shell');
      if (appShell) appShell.classList.add('app-shell-warp-out');

      // 3. Launch Golden Warp
      const warpCanvas = document.getElementById('achievementsWarpCanvas');
      if (warpCanvas) {
        warpCanvas.style.display = 'block';
        warpCanvas.style.opacity = '1';
        runAchievementsWarpTransition(750, () => {
          if (warpCanvas) {
            warpCanvas.style.transition = 'opacity 0.25s ease';
            warpCanvas.style.opacity = '0';
            setTimeout(() => {
              warpCanvas.style.display = 'none';
              warpCanvas.style.transition = '';
            }, 250);
          }
        });
      }

      // 4. Reveal Fullscreen Vault at Midpoint
      setTimeout(() => {
        const fsEl = document.getElementById('achievementsFullscreen');
        if (fsEl) {
          fsEl.style.display = 'flex';
          void fsEl.offsetWidth;
          fsEl.classList.add('active');
        }
        initAchievementsFullscreen();
        renderAchievementsFullscreen();
      }, 420);
    }

    function closeAchievementsFullscreen() {
      if (!isAchievementsFullscreenOpen) return;
      isAchievementsFullscreenOpen = false;

      playAchievementsWarpSound('exit');

      const fsEl = document.getElementById('achievementsFullscreen');
      if (fsEl) {
        fsEl.classList.remove('active');
      }

      const appShell = document.querySelector('.app-shell');
      if (appShell) {
        appShell.classList.remove('app-shell-warp-out');
      }

      setTimeout(() => {
        if (fsEl) fsEl.style.display = 'none';
        if (achBgAnimFrame) {
          cancelAnimationFrame(achBgAnimFrame);
          achBgAnimFrame = null;
        }
        updateUI();
      }, 380);
    }

    function setAchFsPresetFilter(preset = 'all', btnEl = null) {
      achFsPresetFilter = preset;
      document.querySelectorAll('#achRarityFilterGroup .ach-quick-btn').forEach(b => b.classList.remove('active'));
      if (btnEl) {
        btnEl.classList.add('active');
      } else {
        const el = document.querySelector(`#achRarityFilterGroup .ach-quick-btn[data-filter="${preset}"]`);
        if (el) el.classList.add('active');
      }
      playTone(720, 'sine', 0.04, 0.04);
      renderAchievementsFullscreen();
    }

    function setAchFsCategory(cat = 'all', btnEl = null) {
      achFsCategoryFilter = cat;
      document.querySelectorAll('#achCategoryRow .ach-cat-pill').forEach(b => b.classList.remove('active'));
      if (btnEl) {
        btnEl.classList.add('active');
      } else {
        const el = document.querySelector(`#achCategoryRow .ach-cat-pill[data-cat="${cat}"]`);
        if (el) el.classList.add('active');
      }
      playTone(660, 'sine', 0.04, 0.04);
      renderAchievementsFullscreen();
    }

    function onAchievementSearchInput(val) {
      achFsSearchQuery = (val || '').trim().toLowerCase();
      renderAchievementsFullscreen();
    }

    let achFsEventsBound = false;

    function initAchievementsFullscreen() {
      const bgCanvas = document.getElementById('achievementsBgCanvas');
      if (!bgCanvas) return;

      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      bgCanvas.width = Math.floor(w * dpr);
      bgCanvas.height = Math.floor(h * dpr);

      // Generate Background Stars if empty
      if (achBgStars.length === 0) {
        for (let i = 0; i < 200; i++) {
          achBgStars.push({
            x: Math.random(),
            y: Math.random(),
            r: Math.random() * 1.5 + 0.5,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.002 + 0.001,
            color: Math.random() < 0.35 ? '#fde047' : Math.random() < 0.6 ? '#f59e0b' : Math.random() < 0.8 ? '#38bdf8' : '#ffffff'
          });
        }
      }

      if (!achFsEventsBound) {
        achFsEventsBound = true;

        window.addEventListener('resize', () => {
          if (isAchievementsFullscreenOpen) {
            const dpr = window.devicePixelRatio || 1;
            const w = window.innerWidth;
            const h = window.innerHeight;
            bgCanvas.width = Math.floor(w * dpr);
            bgCanvas.height = Math.floor(h * dpr);
          }
        });

        window.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            const modal = document.getElementById('achInspectModal');
            if (modal && modal.style.display !== 'none') {
              closeAchInspectModal();
              return;
            }
            if (isAchievementsFullscreenOpen) {
              closeAchievementsFullscreen();
            }
          }
        });
      }

      if (!achBgAnimFrame) {
        achBgAnimFrame = requestAnimationFrame(runAchievementsBgLoop);
      }
    }

    function runAchievementsBgLoop(timestamp) {
      if (!isAchievementsFullscreenOpen) {
        achBgAnimFrame = null;
        return;
      }

      const canvas = document.getElementById('achievementsBgCanvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const dpr = window.devicePixelRatio || 1;
        const now = timestamp || performance.now();

        ctx.fillStyle = '#020409';
        ctx.fillRect(0, 0, w, h);

        // Ambient Golden & Violet Nebula Clouds
        drawNebula(ctx, w * 0.5, h * 0.3, Math.min(w, h) * 0.5, 'rgba(245, 158, 11, 0.12)', now * 0.0003);
        drawNebula(ctx, w * 0.25, h * 0.7, Math.min(w, h) * 0.45, 'rgba(168, 85, 247, 0.11)', now * 0.00025 + 1);
        drawNebula(ctx, w * 0.8, h * 0.65, Math.min(w, h) * 0.45, 'rgba(56, 189, 248, 0.11)', now * 0.00025 + 2);

        // Twinkling Starlight
        for (let i = 0; i < achBgStars.length; i++) {
          const s = achBgStars[i];
          const sx = s.x * w;
          const sy = s.y * h;
          const alpha = 0.3 + 0.6 * Math.sin(now * s.speed + s.phase);

          ctx.beginPath();
          ctx.arc(sx, sy, s.r * dpr, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = Math.max(0.1, alpha);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      }

      achBgAnimFrame = requestAnimationFrame(runAchievementsBgLoop);
    }

    function updateAchievementsFullscreenHeader() {
      const totalCount = ACHIEVEMENTS_DATA.length;
      let unlockedCount = 0;
      let mythicCount = 0;
      let mythicUnlocked = 0;
      let rareCount = 0;
      let rareUnlocked = 0;
      let standardCount = 0;
      let standardUnlocked = 0;

      const catCounts = {
        click: { total: 0, unl: 0 },
        energy: { total: 0, unl: 0 },
        fleet: { total: 0, unl: 0 },
        prestige: { total: 0, unl: 0 },
        tech: { total: 0, unl: 0 },
        anom: { total: 0, unl: 0 },
        secret: { total: 0, unl: 0 }
      };

      // Compute Stats across all achievements
      ACHIEVEMENTS_DATA.forEach(ach => {
        const isUnl = state.unlockedAchievements.includes(ach.id);
        if (isUnl) unlockedCount++;

        if (ach.rarity === 'mythic') {
          mythicCount++;
          if (isUnl) mythicUnlocked++;
        } else if (ach.rarity === 'rare') {
          rareCount++;
          if (isUnl) rareUnlocked++;
        } else {
          standardCount++;
          if (isUnl) standardUnlocked++;
        }

        if (catCounts[ach.cat]) {
          catCounts[ach.cat].total++;
          if (isUnl) catCounts[ach.cat].unl++;
        }
      });

      // Update Header Badges
      const countEl = document.getElementById('achFsUnlockedCount');
      if (countEl) countEl.innerText = unlockedCount;
      const pct = totalCount > 0 ? ((unlockedCount / totalCount) * 100).toFixed(1) : '0.0';
      const pctEl = document.getElementById('achFsPctText');
      if (pctEl) pctEl.innerText = `(${pct}%)`;
      const bonusEl = document.getElementById('achFsBonusVal');
      if (bonusEl) bonusEl.innerText = `+${unlockedCount}%`;
      const fillEl = document.getElementById('achFsProgressFill');
      if (fillEl) fillEl.style.width = `${pct}%`;

      // Update Category Pill Counters
      const catKeys = ['click', 'energy', 'fleet', 'prestige', 'tech', 'anom', 'secret'];
      catKeys.forEach(k => {
        const pillEl = document.getElementById(`achCatCnt${k.charAt(0).toUpperCase() + k.slice(1)}`);
        if (pillEl && catCounts[k]) {
          pillEl.innerText = `${catCounts[k].unl}/${catCounts[k].total}`;
        }
      });
      const allPill = document.getElementById('achCatCntAll');
      if (allPill) allPill.innerText = `${unlockedCount}/${totalCount}`;

      // Update Quick Rarity Preset Counters
      const elUnl = document.getElementById('achRarityCountUnlocked');
      if (elUnl) elUnl.innerText = unlockedCount;
      const elLck = document.getElementById('achRarityCountLocked');
      if (elLck) elLck.innerText = totalCount - unlockedCount;
      const elMyth = document.getElementById('achRarityCountMythic');
      if (elMyth) elMyth.innerText = `${mythicUnlocked}/${mythicCount}`;
      const elRare = document.getElementById('achRarityCountRare');
      if (elRare) elRare.innerText = `${rareUnlocked}/${rareCount}`;
      const elStd = document.getElementById('achRarityCountStandard');
      if (elStd) elStd.innerText = `${standardUnlocked}/${standardCount}`;
    }

    function renderAchievementsFullscreen() {
      updateAchievementsFullscreenHeader();

      const grid = document.getElementById('achFsGrid');
      if (!grid) return;
      grid.innerHTML = '';

      // Filter for Grid Display
      const filtered = ACHIEVEMENTS_DATA.filter(ach => {
        const isUnl = state.unlockedAchievements.includes(ach.id);

        // Search Query
        if (achFsSearchQuery) {
          const matchName = ach.name.toLowerCase().includes(achFsSearchQuery);
          const matchDesc = ach.desc.toLowerCase().includes(achFsSearchQuery);
          if (!matchName && !matchDesc) return false;
        }

        // Preset Status / Rarity Filter
        if (achFsPresetFilter === 'unlocked' && !isUnl) return false;
        if (achFsPresetFilter === 'locked' && isUnl) return false;
        if (achFsPresetFilter === 'rarity_mythic' && ach.rarity !== 'mythic') return false;
        if (achFsPresetFilter === 'rarity_rare' && ach.rarity !== 'rare') return false;
        if (achFsPresetFilter === 'rarity_standard' && ach.rarity !== 'standard') return false;

        // Category Filter
        if (achFsCategoryFilter !== 'all' && ach.cat !== achFsCategoryFilter) return false;

        return true;
      });

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div style="grid-column:1/-1; text-align:center; padding:50px 20px; color:var(--text-muted);">
            <div style="font-size:36px; margin-bottom:10px;">🔍</div>
            <div style="font-size:15px; font-weight:800; color:#ffffff; margin-bottom:4px;">Niciun trofeu găsit</div>
            <div style="font-size:12px;">Modifică termenul de căutare sau alege o altă categorie din bara de sus.</div>
          </div>
        `;
        return;
      }

      // Render Cards
      filtered.forEach(ach => {
        const unlocked = state.unlockedAchievements.includes(ach.id);
        const rarity = ach.rarity || 'standard';

        let pillClass = 'pill-standard';
        let pillLabel = `🥉 Standard (${ach.rarityPct || '80%'})`;
        if (rarity === 'rare') {
          pillClass = 'pill-rare';
          pillLabel = `💎 Rară (${ach.rarityPct || '12%'})`;
        } else if (rarity === 'mythic') {
          pillClass = 'pill-mythic';
          pillLabel = `👑 Mitică (${ach.rarityPct || '0.5%'})`;
        }

        const card = document.createElement('div');
        card.className = `ach-trophy-card rarity-${rarity}` + (unlocked ? ' unlocked' : ' locked');
        card.onclick = () => openAchInspectModal(ach.id);

        card.innerHTML = `
          <div class="ach-pedestal-avatar">
            <span>${unlocked ? ach.icon : '🔒'}</span>
          </div>
          <div class="ach-pedestal-content">
            <div class="ach-pedestal-top">
              <span class="ach-pedestal-title" title="${ach.name}">${ach.name}</span>
              <span class="ach-rarity-pill ${pillClass}">${pillLabel}</span>
            </div>
            <div class="ach-pedestal-desc">${ach.desc}</div>
            <div class="ach-pedestal-footer">
              <span style="color:var(--text-dim)">+1% Global Permanent</span>
              <span class="ach-status-pill ${unlocked ? 'unlocked' : 'locked'}">
                ${unlocked ? '✅ DEBLOCAT' : '🔒 BLOCAT'}
              </span>
            </div>
          </div>
        `;
        grid.appendChild(card);
      });
    }

    function openAchInspectModal(achId) {
      const ach = ACHIEVEMENTS_DATA.find(a => a.id === achId);
      if (!ach) return;
      inspectedAchId = achId;

      const isUnl = state.unlockedAchievements.includes(ach.id);
      const rarity = ach.rarity || 'standard';

      const orb = document.getElementById('achInspectOrb');
      const title = document.getElementById('achInspectTitle');
      const rPill = document.getElementById('achInspectRarityPill');
      const cPill = document.getElementById('achInspectCatPill');
      const desc = document.getElementById('achInspectDesc');
      const reward = document.getElementById('achInspectReward');
      const modal = document.getElementById('achInspectModal');

      if (orb) orb.innerText = isUnl ? ach.icon : '🔒';
      if (title) title.innerText = ach.name;

      let pillClass = 'pill-standard';
      let pillLabel = `🥉 Standard (${ach.rarityPct || '80%'})`;
      if (rarity === 'rare') {
        pillClass = 'pill-rare';
        pillLabel = `💎 Rară (${ach.rarityPct || '12%'})`;
      } else if (rarity === 'mythic') {
        pillClass = 'pill-mythic';
        pillLabel = `👑 Mitică (${ach.rarityPct || '0.5%'})`;
      }

      if (rPill) {
        rPill.className = `ach-rarity-pill ${pillClass}`;
        rPill.innerText = pillLabel;
      }

      const catNames = {
        click: '👆 Click & Crit',
        energy: '⚡ Energie & CPS',
        fleet: '🤖 Flotă & Roboți',
        prestige: '🌀 Prestigiu & Materie',
        tech: '🔬 Tehnologie & Abilități',
        anom: '☄️ Anomalii & Astral',
        secret: '⌚ Timp & Secrete'
      };

      if (cPill) {
        cPill.innerText = catNames[ach.cat] || 'Cosmic';
      }

      if (desc) desc.innerText = ach.desc;
      if (reward) {
        reward.innerText = isUnl 
          ? `⭐ Recompensă: +1% Multiplicator Global Permanent (Activ pe cont)` 
          : `🔒 Cerință încă neîndeplinită. Când o finalizezi, primești garantat +1% Multiplicator permanent!`;
        reward.style.color = isUnl ? '#38bdf8' : '#94a3b8';
      }

      if (modal) {
        modal.style.display = 'flex';
        playTone(720, 'triangle', 0.08, 0.08);
      }
    }

    function closeAchInspectModal() {
      const modal = document.getElementById('achInspectModal');
      if (modal) modal.style.display = 'none';
      inspectedAchId = null;
    }

    function setAchievementFilter(filterMode, btnEl) {
      currentAchFilter = filterMode;
      if (btnEl && btnEl.parentElement) {
        btnEl.parentElement.querySelectorAll('.lb-cat-btn').forEach(b => b.classList.remove('active'));
        btnEl.classList.add('active');
      }
      renderAchievements();
    }

    function renderAchievements() {
      const container = document.getElementById('achievementsGrid');
      if (container) {
        container.innerHTML = '';
        const filtered = ACHIEVEMENTS_DATA.filter(ach => {
          const isUnl = state.unlockedAchievements.includes(ach.id);
          if (currentAchFilter === 'unlocked') return isUnl;
          if (currentAchFilter === 'locked') return !isUnl;
          if (currentAchFilter === 'rarity_standard') return ach.rarity === 'standard';
          if (currentAchFilter === 'rarity_rare') return ach.rarity === 'rare';
          if (currentAchFilter === 'rarity_mythic') return ach.rarity === 'mythic';
          if (currentAchFilter !== 'all') return ach.cat === currentAchFilter;
          return true;
        });

        if (filtered.length === 0) {
          container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:24px; color:var(--text-muted); font-size:13px;">Nicio realizare în acest filtru momentan.</div>`;
        } else {
          filtered.forEach(ach => {
            const unlocked = state.unlockedAchievements.includes(ach.id);
            const rarity = ach.rarity || 'standard';
            const card = document.createElement('div');
            card.className = `ach-card rarity-${rarity}` + (unlocked ? ' unlocked' : '');

            let pillClass = 'pill-standard';
            let pillLabel = `🥉 Standard (${ach.rarityPct || '80%'})`;
            if (rarity === 'rare') {
              pillClass = 'pill-rare';
              pillLabel = `💎 Rară (${ach.rarityPct || '12%'})`;
            } else if (rarity === 'mythic') {
              pillClass = 'pill-mythic';
              pillLabel = `👑 Mitică (${ach.rarityPct || '0.5%'})`;
            }

            card.innerHTML = `
              <div class="ach-icon">${unlocked ? ach.icon : '🔒'}</div>
              <div class="ach-info">
                <div class="ach-top-row">
                  <span class="ach-title">${ach.name}</span>
                  <span class="ach-rarity-pill ${pillClass}">${pillLabel}</span>
                </div>
                <div class="ach-desc">${ach.desc}</div>
              </div>
            `;
            container.appendChild(card);
          });
        }
      }

      const unlockedCount = state.unlockedAchievements.length;
      const totalCount = ACHIEVEMENTS_DATA.length;
      const achBadge = document.getElementById('achCountBadge');
      if (achBadge) achBadge.innerText = `${unlockedCount}/${totalCount}`;
      const headerProg = document.getElementById('achHeaderProgress');
      if (headerProg) headerProg.innerText = `${unlockedCount} / ${totalCount}`;
      const bonusText = document.getElementById('achBonusText');
      if (bonusText) bonusText.innerText = `+${unlockedCount}%`;

      // Sync Tab Portal Stats
      const portalAchCount = document.getElementById('portalAchCountVal');
      if (portalAchCount) portalAchCount.innerText = `${unlockedCount} / ${totalCount}`;
      const portalAchBonus = document.getElementById('portalAchBonusVal');
      if (portalAchBonus) portalAchBonus.innerText = `+${unlockedCount}%`;
      const portalAchMythic = document.getElementById('portalAchMythicVal');
      if (portalAchMythic) {
        const mythicUnlocked = ACHIEVEMENTS_DATA.filter(a => a.rarity === 'mythic' && state.unlockedAchievements.includes(a.id)).length;
        const mythicTotal = ACHIEVEMENTS_DATA.filter(a => a.rarity === 'mythic').length;
        portalAchMythic.innerText = `${mythicUnlocked} / ${mythicTotal}`;
      }

      // Sync Leaderboard Tab Portal Stats
      const portalLbName = document.getElementById('portalLbNameVal');
      if (portalLbName) portalLbName.innerText = getCommanderDisplayName();
      const portalLbCloud = document.getElementById('portalLbCloudVal');
      if (portalLbCloud) {
        const isCloudLog = Boolean(isFirebaseConfigured() && cloudSession && (cloudSession.access_token || cloudSession.refresh_token) && cloudSession.user);
        if (isCloudLog) {
          portalLbCloud.innerText = 'Conectat';
          portalLbCloud.style.color = 'var(--accent-emerald)';
        } else {
          portalLbCloud.innerText = 'Cont Local';
          portalLbCloud.style.color = '#fde047';
        }
      }

      if (isAchievementsFullscreenOpen) {
        updateAchievementsFullscreenHeader();
      }

      if (isPrestigeFullscreenOpen) {
        updatePrestigeFullscreen();
      }

      if (isOmniverseFullscreenOpen) {
        updateOmniverseFullscreen();
      }
    }

    function renderStats() {
      const pCps = document.getElementById('portalStatsCpsVal');
      if (pCps) pCps.textContent = formatNumber(getCPS()) + ' ⚡/s';
      const pClicks = document.getElementById('portalStatsClicksVal');
      if (pClicks) pClicks.textContent = (state.totalClicks || 0).toLocaleString('ro-RO');
      const pTime = document.getElementById('portalStatsTimeVal');
      if (pTime) pTime.textContent = formatTime(state.playTimeSeconds || 0);

      const container = document.getElementById('statsSectionsContainer');
      if (!container) return;

      const totalGenCount = typeof getTotalGenerators === 'function' ? getTotalGenerators() : 0;
      const activeGenTypes = GENERATORS_DATA.filter(g => (state.generators && state.generators[g.id]) > 0).length;
      const highestGen = GENERATORS_DATA.slice().reverse().find(g => (state.generators && state.generators[g.id]) > 0)?.name || 'Niciunul';
      const totalClicks = state.totalClicks || 0;
      const totalCrits = state.totalCrits || 0;
      const critRate = totalClicks > 0 ? ((totalCrits / totalClicks) * 100).toFixed(1) + '%' : '0.0%';
      const anomaliesCaught = state.anomaliesCaught || 0;
      const anomaliesMissed = state.anomaliesMissed || 0;
      const anomalyAccuracy = (anomaliesCaught + anomaliesMissed) > 0 ? ((anomaliesCaught / (anomaliesCaught + anomaliesMissed)) * 100).toFixed(1) + '%' : '100%';
      const constellationNodesUnlocked = Object.values(state.prestigeUpgrades || {}).filter(lvl => lvl > 0).length;
      const constellationTotalLevels = Object.values(state.prestigeUpgrades || {}).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
      const mythicAchCount = (state.unlockedAchievements || []).filter(id => ACHIEVEMENTS_DATA.find(a => a.id === id)?.rarity === 'mythic').length;
      const totalMythicAch = ACHIEVEMENTS_DATA.filter(a => a.rarity === 'mythic').length;
      const rareAchCount = (state.unlockedAchievements || []).filter(id => ACHIEVEMENTS_DATA.find(a => a.id === id)?.rarity === 'rare').length;
      const totalRareAch = ACHIEVEMENTS_DATA.filter(a => a.rarity === 'rare').length;

      const offlineLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_offline']) || 0;
      const offlineEffPct = Math.round(Math.min(0.80, 0.40 + offlineLvl * 0.08) * 100);
      const twinAnomPct = ((state.prestigeUpgrades && state.prestigeUpgrades['p_twin_anomaly']) || 0) * 18;
      const anomFreqPct = ((state.prestigeUpgrades && state.prestigeUpgrades['p_anom_frequency']) || 0) * 25;
      const magnetPct = ((state.prestigeUpgrades && state.prestigeUpgrades['p_celestial_magnet']) || 0) * 25;

      const categories = [
        {
          icon: '⚡',
          title: '1. Energie & Producție Cuantică',
          items: [
            { label: 'Energie Actuală în Sold', val: formatNumber(state.energy) + ' ⚡' },
            { label: 'Producție Pasivă (CPS)', val: formatNumber(getCPS()) + ' ⚡/s' },
            { label: 'Putere Click Manual', val: formatNumber(getClickValue()) + ' ⚡/click' },
            { label: 'Multiplicator Global Efectiv', val: 'x' + formatNumber(getGlobalMultiplier()) },
            { label: 'Energie Totală (Toate Timpurile)', val: formatNumber(state.lifetimeEnergy) + ' ⚡' },
            { label: 'Energie Produsă în Rularea Curentă', val: formatNumber(state.totalEnergyEarned || state.energy) + ' ⚡' }
          ]
        },
        {
          icon: '🎯',
          title: '2. Luptă Manuală & Dinamică Critică',
          items: [
            { label: 'Click-uri Manuale Totale', val: totalClicks.toLocaleString('ro-RO') },
            { label: 'Lovituri Critice Reușite', val: totalCrits.toLocaleString('ro-RO') },
            { label: 'Rată Reală a Criticelor', val: critRate },
            { label: 'Șansă Critică de Bază', val: Math.round(getCritChance() * 100) + '%' },
            { label: 'Multiplicator Critic Efectiv', val: 'x' + getCritMultiplier().toFixed(2) },
            { label: 'Stivă Combo Curent', val: `${state.comboCount || 0} lovituri (x${(1 + (state.comboCount || 0) * 0.05).toFixed(2)})` }
          ]
        },
        {
          icon: '🤖',
          title: '3. Flotă Spațială & Eficiență Generatoare',
          items: [
            { label: 'Total Generatoare Active', val: totalGenCount.toLocaleString('ro-RO') },
            { label: 'Tipuri Generatoare Deblocate', val: `${activeGenTypes} / ${GENERATORS_DATA.length}` },
            { label: 'Cel Mai Avansat Generator', val: highestGen },
            { label: 'Reducere Cost Flotă', val: `${((1 - getGeneratorDiscount()) * 100).toFixed(1)}%` },
            { label: 'Eficiență Producție Offline', val: `${offlineEffPct}%` },
            { label: 'Bonusuri Prag Generator Atinse', val: `${Math.floor(totalGenCount / 25)} praguri` }
          ]
        },
        {
          icon: '🌌',
          title: '4. Vânătoare de Anomalii Cuantice',
          items: [
            { label: 'Sfere Cuantice Capturate', val: anomaliesCaught.toLocaleString('ro-RO') },
            { label: 'Sfere Pierdute în Hiperspațiu', val: anomaliesMissed.toLocaleString('ro-RO') },
            { label: 'Acuratețe Vânătoare Astrală', val: anomalyAccuracy },
            { label: 'Magnet Ceresc de Salvare', val: magnetPct > 0 ? `${magnetPct}% șansă prindere automată` : 'Nedeblocat (0%)' },
            { label: 'Șansă Apariție Anomalie Dublă', val: `${twinAnomPct}%` },
            { label: 'Frecvență Rătăcire Anomalii', val: anomFreqPct > 0 ? `+${anomFreqPct}% mai des` : 'Standard' }
          ]
        },
        {
          icon: '🔮',
          title: '5. Singularitate, Rebirth & Arbore Constelație',
          items: [
            { label: 'Singularități (Rebirth-uri)', val: (state.prestigeCount || 0).toString() },
            { label: 'Materie Întunecată Deținută', val: `${(state.darkMatter || 0).toLocaleString('ro-RO')} 🔮` },
            { label: 'Materie Întunecată Istorică Totală', val: `${(state.totalDarkMatterEarned || 0).toLocaleString('ro-RO')} 🔮` },
            { label: 'Noduri Deblocate în Constelație', val: `${constellationNodesUnlocked} / ${ALL_SKILL_TREE_NODES.length}` },
            { label: 'Niveluri Totale Investite', val: `${constellationTotalLevels} nivele` },
            { label: 'Bonus Singularitate Producție', val: `+${(state.prestigeCount || 0) * 10}%` }
          ]
        },
        {
          icon: '🏆',
          title: '6. Realizări & Trofee Galactice',
          items: [
            { label: 'Realizări Deblocate', val: `${(state.unlockedAchievements || []).length} / ${ACHIEVEMENTS_DATA.length} (${(((state.unlockedAchievements || []).length / ACHIEVEMENTS_DATA.length) * 100).toFixed(1)}%)` },
            { label: 'Trofee Mitice Galactice', val: `${mythicAchCount} / ${totalMythicAch}` },
            { label: 'Trofee Rare de Diamant', val: `${rareAchCount} / ${totalRareAch}` },
            { label: 'Bonus Producție Realizări', val: `+${(state.unlockedAchievements || []).length}%` }
          ]
        },
        {
          icon: '⏱️',
          title: '7. Timp Simulare & Telemetrie Sistem',
          items: [
            { label: 'Timp Total Simulare Activă', val: formatTime(state.playTimeSeconds || 0) },
            { label: 'Timp Scurs în Rularea Curentă', val: formatTime(state.currentRunTimeSeconds || 0) },
            { label: 'Seria Zilelor Consecutice', val: `${state.dailyStreak || 1} zile` },
            { label: 'Ultima Salvare Locală', val: state.lastSaved ? new Date(state.lastSaved).toLocaleTimeString('ro-RO') : 'Niciodată' },
            { label: 'Sincronizare Cloud Firebase', val: (cloudSession && (cloudSession.access_token || cloudSession.refresh_token)) ? '🟢 Conectat & Sincronizat' : '⚪ Nelogat (Doar Salvare Locală)' },
            { label: 'Versiune Simulare Cuantică', val: `v${APP_VERSION} (Build ${APP_BUILD})` }
          ]
        },
        {
          icon: '🌪️',
          title: '8. Vreme Cosmică & Evenimente Dinamice',
          items: [
            { label: 'Furtuni Stelare Înfruntate', val: (state.totalStormsExperienced || 0).toLocaleString('ro-RO') },
            { label: 'Meteoriți Cuantici Pulverizați', val: (state.meteorsCaught || 0).toLocaleString('ro-RO') },
            { label: 'Stare Atmosferă Curentă', val: activeCosmicStorm ? `${activeCosmicStorm.icon} ${activeCosmicStorm.name}` : '🌌 Calm Relativ' },
            { label: 'Calitate Grafică Efecte', val: (state.stormQuality || 'auto').toUpperCase() }
          ]
        }
      ];

      container.innerHTML = categories.map(cat => `
        <div class="stats-category-group">
          <div class="stats-category-title">
            <span>${cat.icon}</span>
            <span>${cat.title}</span>
          </div>
          <div class="stats-grid">
            ${cat.items.map(item => `
              <div class="stat-box">
                <div class="stat-box-label">${item.label}</div>
                <div class="stat-box-val">${item.val}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
    }

    /********************************************************************
     * 7.5. SISTEM NOTIFICĂRI REALIZĂRI TIP XBOX (XBOX ACHIEVEMENTS QUEUE)
     *      - Coadă automată: maxim 3 realizări afișate simultan pe ecran
     *      - Design premium trofeu, inel holografic rotativ, flare sweep
     *      - Sunet melodic cristalin celebrativ (chime de realizare)
     ********************************************************************/
    const achievementUnlockQueue = [];
    let activeAchievementBannerCount = 0;
    const MAX_CONCURRENT_ACHIEVEMENTS = 3;

    function playXboxAchievementChime(rarity = 'standard') {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        const now = audioCtx.currentTime;

        if (rarity === 'mythic') {
          // CHIME MITIC (Cosmic God Tier Fanfare): Sub-bass impact + 8 note arpeggio ascendent triumfal + Shimmer triplu
          playSyntheticChimeTone(130.81, now, 0.55, 0.16, 'sine'); // C3 Sub-bass

          const mythicNotes = [
            [523.25, 0.04, 0.35, 0.10], // C5
            [659.25, 0.09, 0.38, 0.11], // E5
            [783.99, 0.14, 0.40, 0.12], // G5
            [987.77, 0.19, 0.42, 0.12], // B5
            [1046.50, 0.24, 0.46, 0.13], // C6
            [1318.51, 0.29, 0.52, 0.14], // E6
            [1567.98, 0.34, 0.60, 0.15], // G6
            [2093.00, 0.40, 1.45, 0.18]  // C7 (triumf susținut)
          ];
          mythicNotes.forEach(([f, delay, dur, vol]) => {
            playSyntheticChimeTone(f, now + delay, dur, vol, 'triangle');
          });

          // Acord armonic angelic susținut
          playSyntheticChimeTone(1318.51, now + 0.42, 1.30, 0.08, 'sine');
          playSyntheticChimeTone(1567.98, now + 0.42, 1.35, 0.08, 'sine');

        } else if (rarity === 'rare') {
          // CHIME RAR (Diamond Rare Xbox): Arpegiu Cizelat de Cristal (5 note D5->G5->B5->D6->G6 + Bell Chime G7)
          const rareNotes = [
            [587.33, 0.00, 0.42, 0.10], // D5
            [783.99, 0.07, 0.45, 0.11], // G5
            [987.77, 0.14, 0.48, 0.12], // B5
            [1174.66, 0.21, 0.55, 0.14], // D6
            [1567.98, 0.28, 0.95, 0.16]  // G6 (rezonanță de diamant)
          ];
          rareNotes.forEach(([f, delay, dur, vol]) => {
            playSyntheticChimeTone(f, now + delay, dur, vol, 'triangle');
          });
          // Clopoțel de diamant înalt
          playSyntheticChimeTone(3135.96, now + 0.32, 0.75, 0.07, 'sine'); // G7

        } else {
          // CHIME STANDARD: Acord Dual Clasic Xbox Crystal Shimmer (F5/A5 -> C6/F6)
          playSyntheticChimeTone(698.46, now, 0.36, 0.09, 'triangle');
          playSyntheticChimeTone(880.00, now, 0.38, 0.10, 'triangle');

          playSyntheticChimeTone(1046.50, now + 0.085, 0.55, 0.13, 'triangle');
          playSyntheticChimeTone(1396.91, now + 0.095, 0.60, 0.11, 'triangle');
        }
      } catch (e) {}
    }

    function playSyntheticChimeTone(freq, startTime, duration, vol, waveType = 'triangle') {
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = waveType;
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.015, startTime + duration);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      } catch (e) {}
    }

    function triggerXboxAchievementUnlock(ach) {
      achievementUnlockQueue.push(ach);
      processXboxAchievementQueue();
    }

    function processXboxAchievementQueue() {
      while (activeAchievementBannerCount < MAX_CONCURRENT_ACHIEVEMENTS && achievementUnlockQueue.length > 0) {
        const nextAch = achievementUnlockQueue.shift();
        spawnXboxAchievementCard(nextAch);
      }
    }

    function spawnXboxAchievementCard(ach) {
      activeAchievementBannerCount++;

      let container = document.getElementById('xboxAchievementContainer');
      if (!container) {
        container = document.createElement('div');
        container.className = 'xbox-achievement-container';
        container.id = 'xboxAchievementContainer';
        document.body.appendChild(container);
      }

      const rarity = ach.rarity || 'standard';
      const card = document.createElement('div');
      card.className = `xbox-ach-card rarity-${rarity}`;
      card.setAttribute('role', 'alert');
      card.setAttribute('title', 'Apasă pentru a închide notificarea');

      const iconChar = ach.icon || '🏆';

      // Ring-uri orbitale specifice rarității (1 pentru standard, 2 pentru rare, 3 pentru mythic)
      const ringHtml = `
        <div class="xbox-ach-badge-ring ring-outer"></div>
        ${rarity !== 'standard' ? '<div class="xbox-ach-badge-ring ring-inner"></div>' : ''}
        ${rarity === 'mythic' ? '<div class="xbox-ach-badge-ring ring-core"></div>' : ''}
      `;

      card.innerHTML = `
        <div class="xbox-ach-badge">
          ${ringHtml}
          <span class="xbox-ach-badge-icon">${iconChar}</span>
        </div>
        <div class="xbox-ach-content">
          <div class="xbox-ach-header">
            <span class="xbox-ach-tag">${ach.rarityDisplay || '🏆 REALIZARE DEBLOCATĂ'}</span>
            <span class="xbox-ach-score">${ach.rarityScore || '⭐ +1% PROD'}</span>
          </div>
          <div class="xbox-ach-title">${ach.name}</div>
          <div class="xbox-ach-desc">${ach.desc}</div>
        </div>
        <div class="xbox-ach-flare"></div>
      `;

      container.appendChild(card);
      playXboxAchievementChime(rarity);

      let dismissed = false;
      const dismissCard = () => {
        if (dismissed) return;
        dismissed = true;
        card.classList.add('dismissing');
        setTimeout(() => {
          card.remove();
          activeAchievementBannerCount = Math.max(0, activeAchievementBannerCount - 1);
          processXboxAchievementQueue();
        }, 380);
      };

      // Click pe card pentru închidere imediată
      card.addEventListener('click', dismissCard);

      // Timp de afișare scalat cu raritatea (Mitică rămâne mai mult pe ecran să fie admirată)
      const displayDuration = rarity === 'mythic' ? 7000 : (rarity === 'rare' ? 5400 : 4200);
      setTimeout(dismissCard, displayDuration);
    }

    function checkAchievements() {
      let newlyUnlocked = false;
      for (const ach of ACHIEVEMENTS_DATA) {
        if (!state.unlockedAchievements.includes(ach.id) && ach.check(state)) {
          state.unlockedAchievements.push(ach.id);
          newlyUnlocked = true;
          triggerXboxAchievementUnlock(ach);
        }
      }
      if (newlyUnlocked) {
        renderAchievements();
        if (isAchievementsFullscreenOpen) {
          renderAchievementsFullscreen();
        }
      }
    }

    let lastHeavyUIUpdateTime = 0;
    let cachedEnergyStr = '';
    let cachedCpsStr = '';
    let cachedVpcStr = '';
    let cachedComboPct = -1;
    let cachedComboMultStr = '';
    let cachedFeverState = null;
    let elEnergyAmount = null;
    let elCpsAmount = null;
    let elVpcAmount = null;
    let elComboPct = null;
    let elComboFill = null;
    let elComboMult = null;
    let elComboBoxCard = null;

    function updateUI(forceHeavy = false) {
      if (!elEnergyAmount) {
        elEnergyAmount = document.getElementById('energyAmount');
        elCpsAmount = document.getElementById('cpsAmount');
        elVpcAmount = document.getElementById('vpcAmount');
        elComboPct = document.getElementById('comboPctText');
        elComboFill = document.getElementById('comboBarFill');
        elComboMult = document.getElementById('comboMultText');
        elComboBoxCard = document.getElementById('comboBoxCard');
      }

      // Contoare principale (optimizat: scriere în DOM doar dacă valoarea s-a schimbat, zero reflows cu textContent)
      const curEnergyStr = formatNumber(state.energy);
      if (curEnergyStr !== cachedEnergyStr) {
        if (elEnergyAmount) elEnergyAmount.textContent = curEnergyStr;
        cachedEnergyStr = curEnergyStr;
      }
      const curCpsStr = formatNumber(getCPSCached(performance.now()));
      if (curCpsStr !== cachedCpsStr) {
        if (elCpsAmount) elCpsAmount.textContent = curCpsStr;
        cachedCpsStr = curCpsStr;
      }
      const curVpcStr = formatNumber(getClickValue());
      if (curVpcStr !== cachedVpcStr) {
        if (elVpcAmount) elVpcAmount.textContent = curVpcStr;
        cachedVpcStr = curVpcStr;
      }

      // Combo Bar (Overclock)
      const roundedCombo = Math.round(comboMeter);
      if (roundedCombo !== cachedComboPct) {
        cachedComboPct = roundedCombo;
        if (elComboPct) elComboPct.textContent = `${roundedCombo}%`;
        if (elComboFill) elComboFill.style.width = `${Math.min(100, Math.max(0, roundedCombo))}%`;
      }
      const comboMult = getComboMultiplier();
      const comboMultStr = `x${comboMult.toFixed(2)}`;
      if (comboMultStr !== cachedComboMultStr) {
        cachedComboMultStr = comboMultStr;
        if (elComboMult) elComboMult.textContent = comboMultStr;
      }
      const isFever = comboMeter >= 85;
      if (isFever !== cachedFeverState) {
        cachedFeverState = isFever;
        if (elComboMult) elComboMult.classList.toggle('fever-text', isFever);
        if (coreBtn) coreBtn.classList.toggle('fever', isFever);
        if (elComboBoxCard) elComboBoxCard.classList.toggle('fever-box', isFever);
      }

      // Throttling inteligent pentru parcurgerea zecilor de carduri de magazin (120ms = 60+ FPS fluid pe orice telefon)
      const nowPerf = performance.now();
      if (!forceHeavy && nowPerf - lastHeavyUIUpdateTime < 120) {
        return;
      }
      lastHeavyUIUpdateTime = nowPerf;

      updateCoreSkinButtonPill();

      // Actualizare Countdown Resetare Zilnică & Badge Recompense
      const remSec = getSecondsUntilMidnight();
      const remH = Math.floor(remSec / 3600);
      const remM = Math.floor((remSec % 3600) / 60);
      const remS = remSec % 60;
      const cdEl = document.getElementById('dailyResetCountdown');
      if (cdEl) {
        cdEl.innerText = `${String(remH).padStart(2, '0')}h ${String(remM).padStart(2, '0')}m ${String(remS).padStart(2, '0')}s`;
      }
      updateDailyBadge();

      // Bara mini Prestigiu
      const totalPresBonusPct = Math.round(((state.darkMatter || 0) * 10) + ((state.prestigeCount || 0) * 15));
      const dmEl = document.getElementById('darkMatterMini');
      if (dmEl) dmEl.innerText = `${formatNumber(state.darkMatter || 0, 0)} 🔮`;
      const rbEl = document.getElementById('rebirthCountMini');
      if (rbEl) rbEl.innerText = `🌀 Rebirth #${state.prestigeCount || 0}`;
      const presEl = document.getElementById('prestigeMultMini');
      if (presEl) presEl.innerText = `⭐ +${formatNumber(totalPresBonusPct, 0)}% Bonus`;

      const curCore = CORES_DATA.find(c => c.id === (state.activeCoreId || 'quantum')) || CORES_DATA[0];

      // Actualizare dinamică a listei vizibile în panoul din dreapta (Tehnologii sau Generatoare)
      if (activeRightTab === 'tech') {
        CLICK_UPGRADES_DATA.forEach(upg => {
          const card = document.getElementById(`u_card_${upg.id}`);
          if (!card) return;
          const lvl = (state.clickUpgrades && state.clickUpgrades[upg.id]) || 0;
          const isMax = lvl >= upg.maxLevel;
          const info = getClickUpgradeBuyInfo(upg, clickBuyMultiplier);
          if (!isMax && state.energy >= info.cost && info.count > 0) {
            card.classList.remove('locked');
          } else {
            card.classList.add('locked');
          }
          const uCostEl = document.getElementById(`u_cost_${upg.id}`);
          if (uCostEl) {
            uCostEl.innerText = isMax ? 'MAXIM' : (clickBuyMultiplier === 1 ? `${formatNumber(info.cost)} ⚡` : `+${info.count}x: ${formatNumber(info.cost)} ⚡`);
          }
          const uLvlEl = document.getElementById(`u_lvl_${upg.id}`);
          if (uLvlEl) {
            uLvlEl.innerText = `Niv. ${lvl}/${upg.maxLevel}`;
          }
        });
      } else {
        GENERATORS_DATA.forEach(gen => {
          const card = document.getElementById(`g_card_${gen.id}`);
          if (!card) return;
          const count = (state.generators && state.generators[gen.id]) || 0;
          const info = getGeneratorBuyInfo(gen, buyMultiplier);
          const canAfford = state.energy >= info.cost;
          if (canAfford) {
            card.classList.remove('locked');
          } else {
            card.classList.add('locked');
          }
          const costEl = document.getElementById(`g_cost_${gen.id}`);
          if (costEl) costEl.innerText = `+${info.count}x: ${formatNumber(info.cost)} ⚡`;
          const prodEl = document.getElementById(`g_prod_${gen.id}`);
          const unitProd = gen.baseCps * getGeneratorMilestoneMultiplier(count) * getGlobalSharedMultiplier() * (curCore.cpsMult || 1.0);
          if (prodEl) prodEl.innerText = `+${formatNumber(unitProd)}/s`;
          const specEl = document.getElementById(`g_spec_${gen.id}`);
          if (specEl && gen.specialSummary) {
            specEl.innerText = count > 0 ? gen.specialSummary(count) : gen.roleBadge;
          }
        });
      }

      // Actualizare badge producție nucleu curent în Left Zone
      const activeCpsBadgeEl = document.getElementById('activeCoreCpsBadge');
      if (activeCpsBadgeEl) {
        activeCpsBadgeEl.innerText = `Producție: +${formatNumber(getCoreCPS(curCore.id))}/s`;
      }

      // Dacă tab-ul Omnivers este activ, actualizăm metricile live
      const omniTotalEl = document.getElementById('omniTotalCpsVal');
      if (omniTotalEl) {
        omniTotalEl.innerText = `${formatNumber(getCPS())} ⚡/s`;
      }

      // Actualizare secțiune Prestigiu Secvențial (Câte un Rebirth pe rând bazat pe soldul curent)
      const nextRebirthNum = (state.prestigeCount || 0) + 1;
      const reqEnergy = getRebirthEnergyRequirement();
      const ready = isRebirthReady();
      const dmReward = getCurrentRebirthDarkMatterReward();
      const curEnergy = state.energy || 0;
      const pct = Math.min(100, (curEnergy / reqEnergy) * 100);

      document.getElementById('dmCurrentVal').innerText = `${state.prestigeCount || 0} 🌌 | ${formatNumber(state.darkMatter, 0)} 🔮`;
      const pendingLbl = document.getElementById('dmPendingLabel');
      if (pendingLbl) pendingLbl.innerText = `Recompensă Rebirth #${nextRebirthNum}`;
      document.getElementById('dmPendingVal').innerText = ready ? `+1 🌌 & +${dmReward} 🔮` : `Blocat (+${dmReward} 🔮)`;

      const nextReqLbl = document.getElementById('dmNextReqLabel');
      if (nextReqLbl) nextReqLbl.innerText = `Prag Energie Rebirth #${nextRebirthNum}`;
      document.getElementById('dmNextReq').innerText = `${formatNumber(reqEnergy)} ⚡`;

      const progPctEl = document.getElementById('rebirthProgressPct');
      if (progPctEl) progPctEl.innerText = `${pct.toFixed(1)}% (${formatNumber(curEnergy)} / ${formatNumber(reqEnergy)} ⚡)`;
      const progFillEl = document.getElementById('rebirthProgressFill');
      if (progFillEl) progFillEl.style.width = `${pct}%`;

      const satBanner = document.getElementById('rebirthSaturationBanner');
      if (satBanner) satBanner.style.display = ready ? 'block' : 'none';

      const btnPres = document.getElementById('btnTriggerPrestige');
      btnPres.disabled = !ready;
      btnPres.innerText = ready
        ? `🌌 Declanșează Rebirth #${nextRebirthNum} (+1 🌌 & +${dmReward} 🔮)`
        : `🔒 Rebirth #${nextRebirthNum} Blocat (${pct.toFixed(1)}%)`;

      const presBadge = document.getElementById('prestigeTabBadge');
      if (presBadge) presBadge.style.display = ready ? 'inline-block' : 'none';

      const constBadge = document.getElementById('constellationTabBadge');
      if (constBadge) {
        constBadge.style.display = (state.darkMatter || 0) > 0 ? 'inline-block' : 'none';
        constBadge.innerText = `${state.darkMatter || 0}`;
      }

      const constTab = document.getElementById('tab-constellation');
      if (constTab && constTab.classList.contains('active')) {
        const dmBadge = document.getElementById('skillTreeDmBadge');
        if (dmBadge) dmBadge.innerText = `🔮 Materie Disponibilă: ${state.darkMatter || 0}`;
        if (selectedConstellationNodeId) selectInspectorNode(selectedConstellationNodeId);
      }

      if (isConstellationFullscreenOpen) {
        const cDmVal = document.getElementById('cDmValue');
        if (cDmVal) cDmVal.innerText = formatNumber(state.darkMatter || 0, 0);
        if (selectedConstellationNodeId) selectInspectorNode(selectedConstellationNodeId);
      }

      if (isAchievementsFullscreenOpen) {
        updateAchievementsFullscreenHeader();
      }

      if (isPrestigeFullscreenOpen) {
        updatePrestigeFullscreen();
      }

      if (isOmniverseFullscreenOpen) {
        updateOmniverseFullscreen();
      }

      // Actualizare Cooldown-uri Abilități Active
      const now = Date.now();
      for (let i = 1; i <= 3; i++) {
        const cdOverlay = document.getElementById(`cdSkill${i}`);
        const skillBtn = document.getElementById(`skill${i}`);
        const rem = Math.ceil((skillCooldowns[i] - now) / 1000);
        if (rem > 0) {
          cdOverlay.style.display = 'flex';
          cdOverlay.innerText = `${rem}s`;
          skillBtn.disabled = true;
        } else {
          cdOverlay.style.display = 'none';
          skillBtn.disabled = false;
        }
      }

      // Afișare Buff-uri Active în bara de sus (inclusiv cele 8 tipuri de Sfere Cuantice!)
      const buffsContainer = document.getElementById('activeBuffsContainer');
      const pills = [];
      if (now < (activeBuffs.frenzyEnd || 0)) {
        pills.push(`<div class="buff-pill">🌟 Frenezie x2.5 (${Math.ceil((activeBuffs.frenzyEnd - now) / 1000)}s)</div>`);
      }
      if (now < (activeBuffs.clickStormEnd || 0)) {
        pills.push(`<div class="buff-pill" style="border-color:#38bdf8;color:#bae6fd">⚡ Click Storm x4 (${Math.ceil((activeBuffs.clickStormEnd - now) / 1000)}s)</div>`);
      }
      if (now < (activeBuffs.crimsonCritEnd || 0)) {
        pills.push(`<div class="buff-pill" style="border-color:#f43f5e;color:#fecdd3;background:rgba(244,63,94,0.18)">🎯 100% Crit (${Math.ceil((activeBuffs.crimsonCritEnd - now) / 1000)}s)</div>`);
      }
      if (now < (activeBuffs.discountOrbEnd || 0)) {
        pills.push(`<div class="buff-pill" style="border-color:#10b981;color:#a7f3d0;background:rgba(16,185,129,0.18)">🍀 -35% Costuri (${Math.ceil((activeBuffs.discountOrbEnd - now) / 1000)}s)</div>`);
      }
      if (now < (activeBuffs.overdriveOrbEnd || 0)) {
        pills.push(`<div class="buff-pill" style="border-color:#a855f7;color:#f3e8ff;background:rgba(168,85,247,0.2)">🤖 Turbo Flotă (${Math.ceil((activeBuffs.overdriveOrbEnd - now) / 1000)}s)</div>`);
      }
      if (now < (activeBuffs.cryoCooldownEnd || 0)) {
        pills.push(`<div class="buff-pill" style="border-color:#7dd3fc;color:#e0f2fe;background:rgba(56,189,248,0.18)">❄️ -35% Cooldown (${Math.ceil((activeBuffs.cryoCooldownEnd - now) / 1000)}s)</div>`);
      }
      if (now < (activeBuffs.hyperCritEnd || 0)) {
        pills.push(`<div class="buff-pill">🎯 +40% Crit (${Math.ceil((activeBuffs.hyperCritEnd - now) / 1000)}s)</div>`);
      }
      if (now < (activeBuffs.timeWarpEnd || 0)) {
        pills.push(`<div class="buff-pill">⏳ Distorsiune x1.5 (${Math.ceil((activeBuffs.timeWarpEnd - now) / 1000)}s)</div>`);
      }
      if (ready) {
        pills.push(`<div class="buff-pill" style="border-color:#c084fc; color:#e9d5ff; background:rgba(168,85,247,0.2);">🌌 Rebirth #${nextRebirthNum} Gata! (Saturație ${Math.round(getSaturationFactor()*100)}%)</div>`);
      }

      // Furtuni Stelare & Vreme Cosmică în bara de buff-uri
      if (typeof activeCosmicStorm !== 'undefined' && activeCosmicStorm) {
        const stormSecLeft = Math.max(0, Math.ceil((activeCosmicStorm.endAt - now) / 1000));
        pills.unshift(`<div class="buff-pill" style="border-color:${activeCosmicStorm.themeColor}; color:#ffffff; background:${activeCosmicStorm.glowColor}; box-shadow:0 0 10px ${activeCosmicStorm.glowColor}; animation:weatherBtnGlow 1.5s infinite;">${activeCosmicStorm.icon} ${activeCosmicStorm.buffPill} (${stormSecLeft}s)</div>`);
      }

      buffsContainer.innerHTML = pills.join('');

      // Actualizare Buton Radar Meteo în Header
      const wBtn = document.getElementById('btnWeatherHeader');
      const wDot = document.getElementById('weatherActiveDot');
      const wLbl = document.getElementById('topWeatherLabel');
      const wIcn = document.getElementById('topWeatherIcon');
      if (wBtn && wDot && wLbl && wIcn) {
        if (typeof activeCosmicStorm !== 'undefined' && activeCosmicStorm) {
          const sec = Math.max(0, Math.ceil((activeCosmicStorm.endAt - now) / 1000));
          wBtn.classList.add('storm-active');
          wBtn.style.setProperty('--storm-color', activeCosmicStorm.themeColor);
          wBtn.style.setProperty('--storm-glow', activeCosmicStorm.glowColor);
          wIcn.innerText = activeCosmicStorm.icon;
          wLbl.innerText = `${sec}s`;
          wDot.style.display = 'inline-block';
        } else {
          wBtn.classList.remove('storm-active');
          wIcn.innerText = '🛰️';
          wLbl.innerText = 'Radar';
          wDot.style.display = 'none';
        }
      }

      // Suprapuneri vizuale pe Nucleu pentru Abilități Active
      const reticleEl = document.getElementById('coreSniperReticle');
      if (reticleEl) reticleEl.classList.toggle('active', now < (activeBuffs.hyperCritEnd || 0) || now < (activeBuffs.crimsonCritEnd || 0));
      const chronoEl = document.getElementById('coreChronoAura');
      if (chronoEl) chronoEl.classList.toggle('active', now < (activeBuffs.timeWarpEnd || 0) || now < (activeBuffs.cryoCooldownEnd || 0));
    }

    function switchTab(tabName, btnEl) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      if (btnEl) btnEl.classList.add('active');

      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      const targetPane = document.getElementById(`tab-${tabName}`);
      if (targetPane) targetPane.classList.add('active');

      if (tabName === 'multicores' || tabName === 'upgrades') renderMultiCoresTab();
      if (tabName === 'stats') renderStats();
      if (tabName === 'prestige') renderPrestigeUpgrades();
      if (tabName === 'constellation') renderConstellationSkillTree();
      if (tabName === 'achievements') renderAchievements();
      if (tabName === 'leaderboard') renderLeaderboardTab();
    }

    function showToast(msg) {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerText = msg;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3200);
    }

    function renderAll() {
      renderMultiCoreSelector();
      renderRightZone();
      renderMultiCoresTab();
      renderPrestigeUpgrades();
      renderAchievements();
      syncCoreVisualEcosystem(true);
      renderCoreButtonSkin(state.activeCoreId || state.equippedCoreSkin || 'quantum');
      updateDailyBadge();
      updateUI(true);
    }

