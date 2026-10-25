    /********************************************************************
     * 5.8. SISTEM DE PERSONALIZARE & SKIN-URI PENTRU NUCLEUL CENTRAL
     *      - 5 Skin-uri Deblocabile: Cuantic, Solar, Tesseract 4D, Void/Demon, Gaură Albă
     *      - Evoluție Vizuală Click pe Nivele (Tier 1: Lvl 1, Tier 2: Lvl 25, Tier 3: Lvl 50, Tier 4: Lvl 100)
     ********************************************************************/
    const CORE_SKINS_DATA = [
      {
        id: 'quantum',
        name: 'Nucleu Cuantic Original',
        icon: '⚛️',
        rarity: 'standard',
        rarityLabel: 'Standard',
        color: '#38bdf8',
        glowColor: 'rgba(56, 189, 248, 0.45)',
        desc: 'Aspectul clasic de fuziune temporală. Generează unde de șoc albastre și particule azurii.',
        clickFxDesc: 'Unde albastre cuantic neon',
        unlockDesc: 'Deblocat din start',
        isUnlocked: () => true,
        getProgress: () => ({ current: 1, target: 1, text: 'Deblocat' })
      },
      {
        id: 'solar',
        name: 'Nucleu de Plasmă Solară',
        icon: '☀️',
        rarity: 'rare',
        rarityLabel: 'Solară Rară',
        color: '#f59e0b',
        glowColor: 'rgba(245, 158, 11, 0.65)',
        desc: 'Fuziune de stea supergigantă cu coroană de flăcări aurii și protuberanțe magmatice incandescente.',
        clickFxDesc: 'Flăcări solare & unde aurii de șoc',
        unlockDesc: 'Rebirth #10',
        isUnlocked: () => isCoreUnlocked('solar'),
        getProgress: () => {
          const p = state.prestigeCount || 0;
          if (p >= 10) return { current: 1, target: 1, text: 'Deblocat' };
          return { current: p, target: 10, text: `Rebirth ${p}/10` };
        }
      },
      {
        id: 'tesseract',
        name: 'Tesseract 4D Hiper-Cibernetic',
        icon: '🧊',
        rarity: 'epic',
        rarityLabel: 'Cibernetică Epică',
        color: '#06b6d4',
        glowColor: 'rgba(168, 85, 247, 0.6)',
        desc: 'Hipercub cvadridimensional transparent cu wireframe cibernetic și reflexii neon violet/cyan.',
        clickFxDesc: 'Unde matriciale rombice & scântei holografice',
        unlockDesc: 'Rebirth #25',
        isUnlocked: () => isCoreUnlocked('tesseract'),
        getProgress: () => {
          const p = state.prestigeCount || 0;
          if (p >= 25) return { current: 1, target: 1, text: 'Deblocat' };
          return { current: p, target: 25, text: `Rebirth ${p}/25` };
        }
      },
      {
        id: 'void',
        name: 'Singularitate Abisală Void',
        icon: '🩸',
        rarity: 'mythic',
        rarityLabel: 'Abisală Mitică',
        color: '#e11d48',
        glowColor: 'rgba(225, 29, 72, 0.7)',
        desc: 'Singularitate demonică întunecată ce devorează materia și multiplică exponențial energia.',
        clickFxDesc: 'Fulgere negre/crimson & erupție demonică',
        unlockDesc: 'Rebirth #50',
        isUnlocked: () => isCoreUnlocked('void'),
        getProgress: () => {
          const p = state.prestigeCount || 0;
          if (p >= 50) return { current: 1, target: 1, text: 'Deblocat' };
          return { current: p, target: 50, text: `Rebirth ${p}/50` };
        }
      },
      {
        id: 'whitehole',
        name: 'Gaură Albă Superluminoasă',
        icon: '✨',
        rarity: 'cosmic',
        rarityLabel: 'Superluminoasă Cosmică',
        color: '#ffffff',
        glowColor: 'rgba(255, 255, 255, 0.85)',
        desc: 'Lumină pură superluminică cu 8 raze prismatice curcubeu și lentilă gravitațională inversată.',
        clickFxDesc: 'Explozii de fotoni albi & inele prismatice curcubeu',
        unlockDesc: 'Rebirth #100',
        isUnlocked: () => isCoreUnlocked('whitehole'),
        getProgress: () => {
          const p = state.prestigeCount || 0;
          if (p >= 100) return { current: 1, target: 1, text: 'Deblocat' };
          return { current: p, target: 100, text: `Rebirth ${p}/100` };
        }
      }
    ];

    function getClickPowerLevel() {
      return (state.clickUpgrades && state.clickUpgrades['c_flat1']) || 0;
    }

    function getClickTierInfo() {
      const lvl = getClickPowerLevel();
      if (lvl >= 100) {
        return {
          tier: 4,
          name: 'Singularitate Supremă Master',
          badge: 'Lvl 100 (Tier IV - MAX)',
          desc: 'Undă de șoc cvadruplă hiper-dimensională, 36 particule stelare radiale și flash stroboscopic.',
          color: '#ffffff'
        };
      } else if (lvl >= 50) {
        return {
          tier: 3,
          name: 'Fuziune Cuantică Avansată',
          badge: `Lvl ${lvl} (Tier III)`,
          desc: 'Undă triplă concentrică cu arc energetic și 24 particule tematice cu trail luminescent.',
          color: '#f59e0b'
        };
      } else if (lvl >= 25) {
        return {
          tier: 2,
          name: 'Rezonanță Focalizată',
          badge: `Lvl ${lvl} (Tier II)`,
          desc: 'Inel dublu concentric de șoc și 16 particule cu viteză mărită.',
          color: '#38bdf8'
        };
      } else {
        return {
          tier: 1,
          name: 'Foton Cuantic Standard',
          badge: `Lvl ${lvl} (Tier I)`,
          desc: 'Inel simplu de șoc și 8 particule azurii.',
          color: '#94a3b8'
        };
      }
    }

    function isCoreSkinUnlocked(skinId) {
      const skin = CORE_SKINS_DATA.find(s => s.id === skinId);
      return skin ? skin.isUnlocked() : false;
    }

    function getCoreSkinSVG(skinId) {
      if (skinId === 'solar') {
        return `
          <svg class="core-svg core-svg-solar" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="gradSolarCore" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="25%" stop-color="#fef08a" />
                <stop offset="55%" stop-color="#f59e0b" />
                <stop offset="85%" stop-color="#ea580c" />
                <stop offset="100%" stop-color="#7c2d12" stop-opacity="0" />
              </radialGradient>
              <radialGradient id="gradSolarCorona" cx="50%" cy="50%" r="50%">
                <stop offset="40%" stop-color="#f59e0b" stop-opacity="0.8" />
                <stop offset="75%" stop-color="#ea580c" stop-opacity="0.3" />
                <stop offset="100%" stop-color="#b45309" stop-opacity="0" />
              </radialGradient>
            </defs>
            <g class="solar-corona-spin">
              <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(245, 158, 11, 0.4)" stroke-width="3" stroke-dasharray="8 6 16 8" />
              <path d="M 100,5 Q 106,18 100,28 Q 94,18 100,5 Z" fill="#fde047" opacity="0.9" />
              <path d="M 195,100 Q 182,106 172,100 Q 182,94 195,100 Z" fill="#fde047" opacity="0.9" />
              <path d="M 100,195 Q 94,182 100,172 Q 106,182 100,195 Z" fill="#fde047" opacity="0.9" />
              <path d="M 5,100 Q 18,94 28,100 Q 18,106 5,100 Z" fill="#fde047" opacity="0.9" />
              <path d="M 167,33 Q 155,43 148,39 Q 157,29 167,33 Z" fill="#ea580c" opacity="0.85" />
              <path d="M 167,167 Q 157,157 148,161 Q 155,171 167,167 Z" fill="#ea580c" opacity="0.85" />
              <path d="M 33,167 Q 43,155 39,148 Q 29,157 33,167 Z" fill="#ea580c" opacity="0.85" />
              <path d="M 33,33 Q 29,43 39,52 Q 43,40 33,33 Z" fill="#ea580c" opacity="0.85" />
            </g>
            <g class="ring-spin-slow">
              <circle cx="100" cy="100" r="76" fill="none" stroke="rgba(253, 224, 71, 0.65)" stroke-width="2.5" stroke-dasharray="24 12" />
              <circle cx="100" cy="24" r="5" fill="#fde047" />
              <circle cx="100" cy="176" r="5" fill="#fde047" />
            </g>
            <g class="ring-spin-rev">
              <circle cx="100" cy="100" r="58" fill="none" stroke="#ea580c" stroke-width="3" stroke-dasharray="14 18" />
            </g>
            <circle cx="100" cy="100" r="50" fill="url(#gradSolarCorona)" />
            <circle cx="100" cy="100" r="44" fill="url(#gradSolarCore)" />
            <circle cx="100" cy="100" r="22" fill="#ffffff" opacity="0.95" />
          </svg>
        `;
      }
      if (skinId === 'tesseract') {
        return `
          <svg class="core-svg core-svg-tesseract" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="gradTesseractGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="35%" stop-color="#06b6d4" />
                <stop offset="70%" stop-color="#a855f7" />
                <stop offset="100%" stop-color="#3b0764" stop-opacity="0" />
              </radialGradient>
            </defs>
            <g class="ring-spin-slow">
              <polygon points="100,10 180,55 180,145 100,190 20,145 20,55" fill="none" stroke="rgba(6, 182, 212, 0.45)" stroke-width="2" stroke-dasharray="8 6" />
              <circle cx="100" cy="10" r="4" fill="#06b6d4" />
              <circle cx="180" cy="55" r="4" fill="#a855f7" />
              <circle cx="180" cy="145" r="4" fill="#06b6d4" />
              <circle cx="100" cy="190" r="4" fill="#a855f7" />
              <circle cx="20" cy="145" r="4" fill="#06b6d4" />
              <circle cx="20" cy="55" r="4" fill="#a855f7" />
            </g>
            <g class="tesseract-outer-spin">
              <rect x="52" y="52" width="96" height="96" rx="8" fill="rgba(168, 85, 247, 0.12)" stroke="#c084fc" stroke-width="2.5" />
            </g>
            <g class="tesseract-edges">
              <line x1="62" y1="62" x2="78" y2="78" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 2" />
              <line x1="138" y1="62" x2="122" y2="78" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 2" />
              <line x1="138" y1="138" x2="122" y2="122" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 2" />
              <line x1="62" y1="138" x2="78" y2="122" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 2" />
            </g>
            <g class="tesseract-inner-spin">
              <rect x="74" y="74" width="52" height="52" rx="4" fill="rgba(6, 182, 212, 0.25)" stroke="#38bdf8" stroke-width="2" />
              <circle cx="100" cy="100" r="16" fill="url(#gradTesseractGlow)" />
              <circle cx="100" cy="100" r="7" fill="#ffffff" />
            </g>
          </svg>
        `;
      }
      if (skinId === 'void') {
        return `
          <svg class="core-svg core-svg-void" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="gradVoidEye" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fb7185" />
                <stop offset="45%" stop-color="#e11d48" />
                <stop offset="80%" stop-color="#4c0519" />
                <stop offset="100%" stop-color="#000000" />
              </radialGradient>
            </defs>
            <g class="void-spikes-spin">
              <polygon points="100,6 109,24 135,14 135,35 162,35 152,56 177,66 160,82 182,100 160,118 177,134 152,144 162,165 135,165 135,186 109,176 100,194 91,176 65,186 65,165 38,165 48,144 23,134 40,118 18,100 40,82 23,66 48,56 38,35 65,35 65,14 91,24" fill="none" stroke="#e11d48" stroke-width="2" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="#881337" stroke-width="2.5" stroke-dasharray="14 10" />
            </g>
            <g class="ring-spin-rev">
              <circle cx="100" cy="100" r="64" fill="none" stroke="#be123c" stroke-width="3" stroke-dasharray="28 14" />
              <circle cx="36" cy="100" r="4.5" fill="#e11d48" />
              <circle cx="164" cy="100" r="4.5" fill="#e11d48" />
            </g>
            <circle cx="100" cy="100" r="50" fill="#090104" stroke="#e11d48" stroke-width="2" />
            <circle cx="100" cy="100" r="42" fill="url(#gradVoidEye)" />
            <g class="void-eye-pupil">
              <ellipse cx="100" cy="100" rx="6" ry="26" fill="#000000" />
              <circle cx="100" cy="100" r="3" fill="#ffffff" opacity="0.9" />
            </g>
          </svg>
        `;
      }
      if (skinId === 'whitehole') {
        return `
          <svg class="core-svg core-svg-whitehole" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="gradWhiteHole" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="35%" stop-color="#ffffff" />
                <stop offset="60%" stop-color="#fef08a" />
                <stop offset="85%" stop-color="#38bdf8" />
                <stop offset="100%" stop-color="#ec4899" stop-opacity="0" />
              </radialGradient>
            </defs>
            <g class="whitehole-beams-spin">
              <line x1="100" y1="0" x2="100" y2="200" stroke="rgba(255, 255, 255, 0.85)" stroke-width="3" />
              <line x1="0" y1="100" x2="200" y2="100" stroke="rgba(255, 255, 255, 0.85)" stroke-width="3" />
              <line x1="29" y1="29" x2="171" y2="171" stroke="rgba(253, 224, 71, 0.75)" stroke-width="2.5" />
              <line x1="171" y1="29" x2="29" y2="171" stroke="rgba(56, 189, 248, 0.75)" stroke-width="2.5" />
              <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255, 255, 255, 0.4)" stroke-width="1.5" stroke-dasharray="4 6" />
            </g>
            <g class="ring-spin-rev">
              <circle cx="100" cy="100" r="76" fill="none" stroke="#fef08a" stroke-width="2" stroke-dasharray="16 10" />
              <circle cx="100" cy="100" r="58" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="24 16" />
            </g>
            <circle cx="100" cy="100" r="48" fill="url(#gradWhiteHole)" />
            <circle cx="100" cy="100" r="28" fill="#ffffff" />
            <circle cx="100" cy="100" r="14" fill="#ffffff" />
          </svg>
        `;
      }
      return `
        <svg class="core-svg core-svg-quantum" viewBox="0 0 200 200">
          <defs>
            <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="35%" stop-color="#38bdf8" />
              <stop offset="75%" stop-color="#6366f1" />
              <stop offset="100%" stop-color="#a855f7" stop-opacity="0" />
            </radialGradient>
          </defs>
          <g class="ring-spin-slow">
            <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(56, 189, 248, 0.3)" stroke-width="2" stroke-dasharray="14 8" />
            <circle cx="100" cy="12" r="4" fill="#38bdf8" />
            <circle cx="100" cy="188" r="4" fill="#38bdf8" />
          </g>
          <g class="ring-spin-rev">
            <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(168, 85, 247, 0.45)" stroke-width="3" stroke-dasharray="28 14" />
            <circle cx="28" cy="100" r="4.5" fill="#c084fc" />
            <circle cx="172" cy="100" r="4.5" fill="#c084fc" />
          </g>
          <g class="ring-spin-fast">
            <circle cx="100" cy="100" r="54" fill="none" stroke="rgba(236, 72, 153, 0.5)" stroke-width="2.5" stroke-dasharray="18 22" />
          </g>
          <circle cx="100" cy="100" r="44" fill="url(#coreGrad)" />
          <circle cx="100" cy="100" r="24" fill="#ffffff" opacity="0.9" />
        </svg>
      `;
    }

    function renderCoreButtonSkin(skinId) {
      const btn = document.getElementById('coreBtn');
      if (!btn) return;
      const currentId = skinId || state.equippedCoreSkin || 'quantum';
      btn.dataset.skin = currentId;
      btn.innerHTML = `
        <div class="core-glow"></div>
        ${getCoreSkinSVG(currentId)}
      `;
      updateCoreSkinButtonPill();
    }

    function updateCoreSkinButtonPill() {
      const pill = document.getElementById('coreSkinActivePill');
      const badge = document.getElementById('clickTierBadge');
      if (!pill) return;
      const currentId = state.equippedCoreSkin || 'quantum';
      const skin = CORE_SKINS_DATA.find(s => s.id === currentId) || CORE_SKINS_DATA[0];
      pill.textContent = skin.name.split(' ')[0] + ' ' + (skin.name.split(' ')[1] || '');
      pill.style.color = skin.color;

      if (badge) {
        const tierInfo = getClickTierInfo();
        badge.textContent = `Lvl ${getClickPowerLevel()} (T${tierInfo.tier})`;
        badge.style.color = tierInfo.color;
        badge.style.borderColor = tierInfo.color;
      }
    }

    function applyCoreSkin(skinId, save = true) {
      if (!isCoreSkinUnlocked(skinId)) return;
      state.equippedCoreSkin = skinId;
      renderCoreButtonSkin(skinId);
      updateCoreSkinButtonPill();
      if (save) {
        saveGame();
        renderCoreSkinsModal();
        const skin = CORE_SKINS_DATA.find(s => s.id === skinId) || CORE_SKINS_DATA[0];
        showToast(`🎨 Ai echipat: ${skin.name}!`);
        playTone(780, 'triangle', 0.15, 0.1);
      }
    }

    function equipCoreSkin(skinId) {
      applyCoreSkin(skinId, true);
    }

    function openCoreSkinsModal() {
      renderCoreSkinsModal();
      const m = document.getElementById('coreSkinsModal');
      if (m) m.classList.add('open');
      playTone(660, 'sine', 0.1, 0.08);
    }

    function closeCoreSkinsModal() {
      const m = document.getElementById('coreSkinsModal');
      if (m) m.classList.remove('open');
    }

    function renderCoreSkinsModal() {
      const grid = document.getElementById('coreSkinsGrid');
      const banner = document.getElementById('clickEvolutionBanner');
      if (!grid || !banner) return;

      const currentLvl = getClickPowerLevel();
      const tierInfo = getClickTierInfo();

      banner.innerHTML = `
        <div class="evolution-banner-header">
          <div class="evolution-title">
            <span>⚡ Nivel Animație Click:</span>
            <strong style="color:${tierInfo.color};">${tierInfo.badge} — ${tierInfo.name}</strong>
          </div>
          <span style="font-size:11px; font-family:var(--font-mono); color:#94a3b8;">
            Upgrade Fotonic: Lvl ${currentLvl} / 100
          </span>
        </div>
        <div style="font-size:11.5px; color:var(--text-muted); line-height:1.35;">
          ${tierInfo.desc}
        </div>
        <div class="evolution-tiers-row">
          <div class="evolution-tier-step ${tierInfo.tier >= 1 ? 'active' : ''}">
            <span class="evolution-step-lvl">TIER I (Lvl 1)</span>
            <span class="evolution-step-name">Inel Simplu</span>
          </div>
          <div class="evolution-tier-step ${tierInfo.tier >= 2 ? 'active' : ''}">
            <span class="evolution-step-lvl">TIER II (Lvl 25)</span>
            <span class="evolution-step-name">Inel Dublu</span>
          </div>
          <div class="evolution-tier-step ${tierInfo.tier >= 3 ? 'active' : ''}">
            <span class="evolution-step-lvl">TIER III (Lvl 50)</span>
            <span class="evolution-step-name">Undă Triplă & Trail</span>
          </div>
          <div class="evolution-tier-step ${tierInfo.tier >= 4 ? 'active' : ''}">
            <span class="evolution-step-lvl">TIER IV (Lvl 100)</span>
            <span class="evolution-step-name">Explozie Master</span>
          </div>
        </div>
      `;

      grid.innerHTML = '';
      CORE_SKINS_DATA.forEach(skin => {
        const unlocked = skin.isUnlocked();
        const isEquipped = (state.equippedCoreSkin || 'quantum') === skin.id;
        const prog = skin.getProgress();

        const card = document.createElement('div');
        card.className = `skin-card ${isEquipped ? 'active-equipped' : ''} ${!unlocked ? 'locked' : ''}`;

        let rarityBorderColor = '#38bdf8';
        if (skin.rarity === 'rare') rarityBorderColor = '#f59e0b';
        else if (skin.rarity === 'epic') rarityBorderColor = '#a855f7';
        else if (skin.rarity === 'mythic') rarityBorderColor = '#e11d48';
        else if (skin.rarity === 'cosmic') rarityBorderColor = '#ffffff';

        card.innerHTML = `
          <div class="skin-card-header">
            <div class="skin-preview-mini" style="border-color:${rarityBorderColor};">
              <div style="transform: scale(0.38); transform-origin: center center; width: 200px; height: 200px; display: flex; align-items: center; justify-content: center;">
                ${getCoreSkinSVG(skin.id)}
              </div>
            </div>
            <div class="skin-card-info">
              <div class="skin-card-title">
                <span>${skin.icon}</span>
                <span>${skin.name}</span>
              </div>
              <span class="skin-rarity-pill" style="color:${skin.color}; background: rgba(255,255,255,0.06); border: 1px solid ${skin.color};">
                ${skin.rarityLabel}
              </span>
            </div>
          </div>
          <div class="skin-card-desc">${skin.desc}</div>
          <div class="skin-card-fx">✨ Efect Click: ${skin.clickFxDesc}</div>
          ${
            !unlocked
              ? `
                <div class="skin-unlock-req">
                  <div style="display:flex; justify-content:space-between; font-weight:800;">
                    <span>🔒 Cerință Deblocare:</span>
                    <span>${prog.text}</span>
                  </div>
                  <div class="skin-progress-bar-wrap">
                    <div class="skin-progress-bar-fill" style="width: ${Math.round(Math.min(1, prog.current / prog.target) * 100)}%;"></div>
                  </div>
                </div>
                <button class="btn-equip-skin" disabled>🔒 Blocat</button>
              `
              : `
                <button class="btn-equip-skin ${isEquipped ? 'equipped' : ''}" onclick="equipCoreSkin('${skin.id}')">
                  ${isEquipped ? '🌟 ECHIPAT' : '✅ Echipează Skin'}
                </button>
              `
          }
        `;

        grid.appendChild(card);
      });
    }

    /********************************************************************
     * 6. INTERACȚIUNEA LA CLICK PE NUCLEUL CENTRAL & EFECTE VIZUALE
     *    - Unde de șoc adaptate tematic la skin-ul curent
     *    - Evoluție a efectelor de click în funcție de nivel (Lvl 25, 50, 100)
     ********************************************************************/
    const coreBtn = document.getElementById('coreBtn');

    coreBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      handleCoreClick(e.clientX, e.clientY, false);
    });

    coreBtn.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleCoreClick(null, null, false);
      }
    });

    let cachedCoreRect = null;
    let lastCoreRectTime = 0;

    function getCoreCenter() {
      const now = performance.now();
      if (!cachedCoreRect || (now - lastCoreRectTime > 2000)) {
        if (coreBtn) {
          cachedCoreRect = coreBtn.getBoundingClientRect();
          lastCoreRectTime = now;
        }
      }
      if (!cachedCoreRect || cachedCoreRect.width <= 0) {
        return {
          x: window.innerWidth * 0.22,
          y: window.innerHeight * 0.5,
          width: 220,
          height: 220,
          left: window.innerWidth * 0.22 - 110,
          top: window.innerHeight * 0.5 - 110
        };
      }
      return {
        x: cachedCoreRect.left + cachedCoreRect.width / 2,
        y: cachedCoreRect.top + cachedCoreRect.height / 2,
        width: cachedCoreRect.width,
        height: cachedCoreRect.height,
        left: cachedCoreRect.left,
        top: cachedCoreRect.top
      };
    }

    window.addEventListener('resize', () => { cachedCoreRect = null; }, { passive: true });
    window.addEventListener('scroll', () => { cachedCoreRect = null; }, { passive: true });

    let lastAutoFloatTime = 0;
    let lastAutoParticleTime = 0;

    function handleCoreClick(clientX, clientY, isAutoCursor = false) {
      if (!clientX || !clientY) {
        const center = getCoreCenter();
        clientX = center.x;
        clientY = center.y;
      }

      // Crește garantat bara de Supraîncărcare (Combo) și scalează cu numărul de Nano-Cursoare (g0)
      const lensLvl = (state.clickUpgrades && state.clickUpgrades['c_mult1']) || 0;
      const g0Count = (state.generators && state.generators['g0']) || 0;
      const comboGain = isAutoCursor
        ? (3.5 + Math.min(18, g0Count * 0.45))
        : (9.5 + lensLvl * 0.3);
      lastComboClickTime = performance.now();
      comboMeter = Math.min(100, comboMeter + comboGain);

      let amount = getClickValue();
      const isCrit = Math.random() < getCritChance();
      if (isCrit) {
        amount *= getCritMultiplier();
        state.totalCrits++;
        if (!isAutoCursor) playTone(680, 'triangle', 0.11, 0.1);
        updateDailyQuestProgress('crits', 1);

        // Talent Nou: Descărcare în Lanț (p_chain_lightning)
        const chainLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_chain_lightning']) || 0;
        if (chainLvl > 0 && Math.random() < (0.35 + chainLvl * 0.10)) {
          const chainBonus = Math.round(amount * (8 + (chainLvl - 1) * 4));
          amount += chainBonus;
          spawnCoreLightningArc(true);
          spawnFloatingText(clientX, clientY - 45, `⚡ LANȚ CUANTIC! +${formatNumber(chainBonus)}`, true);
        }

        // Keystone Manual: Hiper-Supernovă Instantanee (Burst CPS)
        const burstLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_supernova_burst']) || 0;
        if (burstLvl > 0 && Math.random() < 0.12) {
          const burstSec = 45 + (burstLvl - 1) * 20;
          const burstGain = Math.round(getCPS() * burstSec);
          if (burstGain > 0) {
            amount += burstGain;
            spawnCoreShockwave('crit');
            spawnFloatingText(clientX, clientY - 30, `💥 SUPERNOVĂ +${formatNumber(burstGain)} ⚡!`, true);
            playXboxAchievementChime('mythic');
            spawnParticles(clientX, clientY, 20, '#fde047');
          }
        }
      } else if (!isAutoCursor) {
        playTone(320 + comboMeter * 2, 'sine', 0.06, 0.06);
      }

      // Talent Nou: Rezonanță Frenetică (p_overdrive_combo)
      const odComboLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_overdrive_combo']) || 0;
      if (odComboLvl > 0 && comboMeter >= 98) {
        const odGain = Math.round(getCPS() * (0.12 + (odComboLvl - 1) * 0.10));
        if (odGain > 0) amount += odGain;
      }

      if (!isAutoCursor) {
        state.totalClicks++;
        secondsSinceLastManualClick = 0;
        updateDailyQuestProgress('clicks', 1);
      }

      // Efect Special Amplificator Fotonic (c_flat1): La fiecare al 10-lea click manual trage o Rază Mega-Fotonică (x3 Energie)!
      const photonLvl = (state.clickUpgrades && state.clickUpgrades['c_flat1']) || 0;
      let isPhotonMega = false;
      if (!isAutoCursor && photonLvl > 0 && state.totalClicks % 10 === 0) {
        amount *= 3;
        isPhotonMega = true;
        spawnPhotonMegaBeam();
        playTone(960, 'sawtooth', 0.14, 0.11);
      }

      // Efect Supernova când bara de Supraîncărcare ajunge la 100%
      if (comboMeter >= 100 && Date.now() - lastSupernovaBurstTime > 3800) {
        lastSupernovaBurstTime = Date.now();
        updateDailyQuestProgress('overclock_100', 1);
        const novaBonus = amount * 3.5 + getCPS() * 1.5;
        amount += novaBonus;
        spawnCoreShockwave('em-wave');
        spawnCoreShockwave('crit');
        const center = getCoreCenter();
        triggerCosmicCorePulse(center.x, center.y, true, true);
        for (let k = 0; k < 3; k++) spawnCoreLightningArc(true);
        spawnFloatingText(center.x, center.top + 10, `🔥 OVERCLOCK SUPERNOVA! +${formatNumber(novaBonus)}`, true);
        setTimeout(() => {
          if (comboMeter >= 95) comboMeter = 22;
        }, 350);
      }

      addEnergy(amount);

      // Animație buton fizic doar la click-uri manuale (previne compresia layout-ului la 75ms)
      if (!isAutoCursor) {
        coreBtn.classList.add('clicked');
        setTimeout(() => coreBtn.classList.remove('clicked'), 80);
      }

      // Efecte vizuale pe Nucleu (exclusive click-urilor manuale pentru 60-144 FPS fluid pe PC/Mobil)
      if (!isAutoCursor) {
        spawnCoreShockwave(isCrit ? 'crit' : isPhotonMega ? 'em-wave' : 'normal');
        triggerCosmicCorePulse(clientX, clientY, isCrit, true);

        if (isCrit) {
          spawnCoreLightningArc(true);
          // Efect Calibrare Cuantică (c_critChance): Vizor Lock-On pe locul loviturii critice
          if (((state.clickUpgrades && state.clickUpgrades['c_critChance']) || 0) > 0) {
            spawnCritLockCrosshair(clientX, clientY);
          }
          // Efect Descărcare de Plasmă (c_critMult): Scuturare de plasmă a nucleului
          if (((state.clickUpgrades && state.clickUpgrades['c_critMult']) || 0) > 0) {
            const wrap = document.getElementById('coreEcosystemWrap');
            if (wrap) {
              wrap.classList.remove('core-plasma-shake');
              requestAnimationFrame(() => wrap.classList.add('core-plasma-shake'));
            }
          }
        } else if (((state.clickUpgrades && state.clickUpgrades['c_synergy']) || 0) > 0 || comboMeter >= 55) {
          spawnCoreLightningArc(false);
        }
      }

      // Text plutitor + particule cu skin & tier adaptiv (optimizat & limitat)
      const skinId = state.equippedCoreSkin || 'quantum';
      const tierInfo = getClickTierInfo();
      let pCount = isCrit ? 14 : 7;
      if (tierInfo.tier === 2) pCount += 4;
      if (tierInfo.tier === 3) pCount += 7;
      if (tierInfo.tier === 4) pCount += 10;

      let pColor = isCrit ? '#fde047' : isPhotonMega ? '#22d3ee' : '#38bdf8';
      if (skinId === 'solar') pColor = isCrit ? '#fef08a' : isPhotonMega ? '#fde047' : '#f59e0b';
      else if (skinId === 'tesseract') pColor = isCrit ? '#c084fc' : isPhotonMega ? '#38bdf8' : '#06b6d4';
      else if (skinId === 'void') pColor = isCrit ? '#fb7185' : isPhotonMega ? '#e11d48' : '#be123c';
      else if (skinId === 'whitehole') pColor = isCrit ? '#ffffff' : isPhotonMega ? '#fef08a' : '#f8fafc';

      const labelPrefix = isPhotonMega ? '🔦 MEGA x3 ' : (isAutoCursor ? '🖱️ ' : '');
      const canFloat = !isAutoCursor || (performance.now() - lastAutoFloatTime > 450);
      if (canFloat) {
        if (isAutoCursor) lastAutoFloatTime = performance.now();
        spawnFloatingText(clientX, clientY, `${labelPrefix}+${formatNumber(amount)}`, isCrit || isPhotonMega);
      }

      const canParticle = !isAutoCursor || (performance.now() - lastAutoParticleTime > 450);
      if (canParticle) {
        if (isAutoCursor) lastAutoParticleTime = performance.now();
        spawnParticles(clientX, clientY, isAutoCursor ? Math.min(3, pCount) : pCount, pColor);
      }

      if (!isAutoCursor) {
        updateUI();
      }
    }

    // =========================================================================
    // MOTORUL DE ANIMAȚII VIZUALE LA NUCLEU (CURSOARE ORBITALE, DRONE, TESLA)
    // =========================================================================
    let lastEcosystemSignature = '';

    function spawnCoreShockwave(type = 'normal') {
      const fxLayer = document.getElementById('coreFxLayer');
      if (!fxLayer) return;
      if (fxLayer.children.length >= 3) {
        fxLayer.firstElementChild.remove();
      }
      const currentSkin = state.equippedCoreSkin || 'quantum';
      const tierInfo = getClickTierInfo();

      const ring = document.createElement('div');
      ring.className = `core-shockwave-ring skin-${currentSkin} tier-${tierInfo.tier}` +
        (type === 'crit' ? ' crit' : type === 'em-wave' ? ' em-wave' : '');
      fxLayer.appendChild(ring);

      if (tierInfo.tier >= 2 && fxLayer.children.length < 3) {
        setTimeout(() => {
          if (!fxLayer.isConnected || fxLayer.children.length >= 3) return;
          const r2 = document.createElement('div');
          r2.className = `core-shockwave-ring skin-${currentSkin} tier-${tierInfo.tier} echo-ring` +
            (type === 'crit' ? ' crit' : '');
          fxLayer.appendChild(r2);
          setTimeout(() => r2.remove(), 420);
        }, 65);
      }

      if (tierInfo.tier >= 3 && fxLayer.children.length < 3) {
        setTimeout(() => {
          if (!fxLayer.isConnected || fxLayer.children.length >= 3) return;
          const r3 = document.createElement('div');
          r3.className = `core-shockwave-ring skin-${currentSkin} tier-${tierInfo.tier} hyper-ring` +
            (type === 'crit' ? ' crit' : '');
          fxLayer.appendChild(r3);
          setTimeout(() => r3.remove(), 480);
        }, 130);
      }

      setTimeout(() => ring.remove(), type === 'em-wave' ? 880 : 580);
    }

    function spawnCoreLightningArc(isCrit = false) {
      const svg = document.getElementById('coreTeslaSvg');
      if (!svg) return;
      if (svg.children.length >= 3) {
        svg.firstElementChild.remove();
      }
      const cx = 150, cy = 150;
      const angle = Math.random() * Math.PI * 2;
      const outerR = isCrit ? 124 : 98 + Math.random() * 22;
      const endX = cx + Math.cos(angle) * outerR;
      const endY = cy + Math.sin(angle) * outerR;

      const points = [`${cx},${cy}`];
      const segments = 5;
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const bx = cx + (endX - cx) * t + (Math.random() - 0.5) * 26;
        const by = cy + (endY - cy) * t + (Math.random() - 0.5) * 26;
        points.push(`${bx.toFixed(1)},${by.toFixed(1)}`);
      }
      points.push(`${endX.toFixed(1)},${endY.toFixed(1)}`);

      let normalColor = '#38bdf8';
      let critColor = '#fde047';
      const skin = state.equippedCoreSkin || 'quantum';
      if (skin === 'solar') { normalColor = '#f59e0b'; critColor = '#fef08a'; }
      else if (skin === 'tesseract') { normalColor = '#06b6d4'; critColor = '#c084fc'; }
      else if (skin === 'void') { normalColor = '#e11d48'; critColor = '#fb7185'; }
      else if (skin === 'whitehole') { normalColor = '#ffffff'; critColor = '#fde047'; }

      const strokeCol = isCrit ? critColor : normalColor;
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      poly.setAttribute('points', points.join(' '));
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke', strokeCol);
      poly.setAttribute('stroke-width', isCrit ? '3' : '2');
      poly.setAttribute('stroke-linecap', 'round');
      poly.setAttribute('stroke-linejoin', 'round');
      poly.setAttribute('opacity', isCrit ? '1' : '0.85');
      poly.style.animation = 'teslaFlash 0.22s ease-out forwards';
      svg.appendChild(poly);

      setTimeout(() => poly.remove(), 220);
    }

    function spawnPhotonMegaBeam() {
      const fxLayer = document.getElementById('coreFxLayer');
      if (!fxLayer) return;
      for (let i = 0; i < 3; i++) {
        const beam = document.createElement('div');
        beam.className = 'photon-mega-beam';
        const angle = -35 + i * 35;
        beam.style.transform = `rotate(${angle}deg)`;
        fxLayer.appendChild(beam);
        setTimeout(() => beam.remove(), 400);
      }
    }

    function spawnCritLockCrosshair(x, y) {
      const el = document.createElement('div');
      el.className = 'crit-lock-crosshair';
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 460);
    }

    // Lansează o Sferă de Energie (Proiectil Holografic) de la butonul/cardul apăsat direct în Nucleul Cuantic!
    function spawnActivationOrbToCore(sourceEl, color = '#38bdf8') {
      try {
        if (sourceEl) {
          sourceEl.classList.remove('card-activated-flash');
          requestAnimationFrame(() => {
            if (sourceEl) sourceEl.classList.add('card-activated-flash');
          });
        }
        const center = getCoreCenter();
        if (center.width === 0) return;
        const targetX = center.x;
        const targetY = center.y;

        let startX = window.innerWidth / 2;
        let startY = window.innerHeight / 2;
        if (sourceEl) {
          const sRect = sourceEl.getBoundingClientRect();
          if (sRect.width > 0) {
            startX = sRect.left + sRect.width / 2;
            startY = sRect.top + sRect.height / 2;
          }
        }

        spawnParticles(startX, startY, 6, color);

        const orb = document.createElement('div');
        orb.className = 'flying-energy-orb';
        orb.style.color = color;
        orb.style.background = color;
        orb.style.left = `${startX}px`;
        orb.style.top = `${startY}px`;
        document.body.appendChild(orb);

        const ctrlX = (startX + targetX) / 2 + (Math.random() - 0.5) * 120;
        const ctrlY = Math.min(startY, targetY) - 50 - Math.random() * 50;

        orb.animate([
          { left: `${startX}px`, top: `${startY}px`, transform: 'translate3d(-50%, -50%, 0) scale(1.2)', opacity: 1 },
          { left: `${ctrlX}px`, top: `${ctrlY}px`, transform: 'translate3d(-50%, -50%, 0) scale(1.4)', opacity: 1, offset: 0.5 },
          { left: `${targetX}px`, top: `${targetY}px`, transform: 'translate3d(-50%, -50%, 0) scale(0.4)', opacity: 0.9 }
        ], {
          duration: 440,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
        }).onfinish = () => {
          orb.remove();
          spawnCoreShockwave('em-wave');
          spawnCoreLightningArc(true);
          spawnParticles(targetX, targetY, 8, color);
        };
      } catch (e) {}
    }

    let cachedCursorBobs = [];
    function updateCachedCursorBobs() {
      const cursorsLayer = document.getElementById('orbitCursorsLayer');
      cachedCursorBobs = cursorsLayer ? Array.from(cursorsLayer.querySelectorAll('.orbit-cursor-bob')) : [];
    }

    // Actualizează în timp real cursoarele care se învârt și apasă pe nucleu, dronele cu laser, sateliții, rețeaua neurală, sfera Dyson și efectele Amplificatoarelor
    function syncCoreVisualEcosystem(force = false) {
      const g0 = (state.generators && state.generators['g0']) || 0; // Nano-Cursor Autonom
      const g1 = (state.generators && state.generators['g1']) || 0; // Dronă de Extracție
      const g2 = (state.generators && state.generators['g2']) || 0; // Script Neural AI
      const g3 = (state.generators && state.generators['g3']) || 0; // Condensator Tahionic
      const g4 = (state.generators && state.generators['g4']) || 0; // Satelit Solar Orbital
      const g5 = (state.generators && state.generators['g5']) || 0; // Reactor de Fuziune Rece
      const g6 = (state.generators && state.generators['g6']) || 0; // Micro-Gaură Neagră
      const g7 = (state.generators && state.generators['g7']) || 0; // Matrice Dyson
      const g8 = (state.generators && state.generators['g8']) || 0; // Accelerator Temporal
      const g9 = (state.generators && state.generators['g9']) || 0; // Motor de Univers Sintetic

      const t0 = getAutomationTier(g0);
      const t1 = getAutomationTier(g1);
      const t2 = getAutomationTier(g2);
      const t3 = getAutomationTier(g3);
      const t4 = getAutomationTier(g4);
      const t5 = getAutomationTier(g5);
      const t6 = getAutomationTier(g6);
      const t7 = getAutomationTier(g7);
      const t8 = getAutomationTier(g8);
      const t9 = getAutomationTier(g9);

      const cMultLvl = (state.clickUpgrades && state.clickUpgrades['c_mult1']) || 0;
      const cGlobalLvl = (state.clickUpgrades && state.clickUpgrades['c_global1']) || 0;

      const visibleCursors = g0 <= 0 ? 0 : Math.min(16, g0 <= 8 ? g0 : 8 + Math.floor(Math.log2(g0 - 6) * 2.5));
      const visibleDrones = g1 <= 0 ? 0 : Math.min(8, g1 <= 4 ? g1 : 4 + Math.floor(Math.log2(g1 - 2) * 1.5));
      const visibleSats = (g4 + g5) <= 0 ? 0 : Math.min(6, Math.ceil((g4 + g5) / 3));
      const hasDyson = (g5 + g7) > 0;
      const hasVortex = (g6 + g8 + g9) > 0;

      // Efecte vizuale din Amplificatoare pe Reactor
      const prismEl = document.getElementById('corePrismAura');
      if (prismEl) prismEl.classList.toggle('active', cMultLvl > 0);
      const leftZoneEl = document.getElementById('zone-left');
      if (leftZoneEl) leftZoneEl.classList.toggle('cyber-grid-active', cGlobalLvl > 0);

      const sig = `${visibleCursors}_${visibleDrones}_${visibleSats}_${hasDyson}_${hasVortex}_${g0}_${g1}_${g2}_${g3}_${g4}_${g5}_${g6}_${g7}_${g8}_${g9}_${t0}_${t1}_${t2}_${t3}_${t4}_${t5}_${t6}_${t7}_${t8}_${t9}_${cMultLvl}_${cGlobalLvl}`;
      if (!force && sig === lastEcosystemSignature) return;
      lastEcosystemSignature = sig;

      // 1. Randare Cursoare Orbitale care se rotesc și apasă fizic pe nucleu (Evoluție Tier 1 -> 4)
      const cursorsLayer = document.getElementById('orbitCursorsLayer');
      if (cursorsLayer) {
        cursorsLayer.innerHTML = '';
        cursorsLayer.className = `orbit-ring-layer cursor-ring-spin tier-${t0}`;
        for (let i = 0; i < visibleCursors; i++) {
          const angleDeg = (360 / visibleCursors) * i;
          const delaySec = ((1.2 / visibleCursors) * i).toFixed(3);
          const slot = document.createElement('div');
          slot.className = 'orbit-slot';
          slot.style.transform = `rotate(${angleDeg}deg)`;

          let svgHtml = '';
          if (t0 <= 1) {
            svgHtml = `
              <svg viewBox="0 0 28 28" fill="none">
                <path d="M14 2.5 L5.5 19.5 L11.5 17 L11.5 25.5 L16.5 25.5 L16.5 17 L22.5 19.5 L14 2.5 Z" fill="#38bdf8" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/>
                <circle cx="14" cy="11" r="2.2" fill="#e0f2fe" stroke="#38bdf8" stroke-width="0.8"/>
              </svg>
            `;
          } else if (t0 === 2) {
            svgHtml = `
              <svg viewBox="0 0 28 28" fill="none">
                <defs>
                  <linearGradient id="cGold_${i}" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#fef08a"/>
                    <stop offset="50%" stop-color="#f59e0b"/>
                    <stop offset="100%" stop-color="#b45309"/>
                  </linearGradient>
                </defs>
                <path d="M14 1 L3 18 L8 18 L11 26 L17 26 L20 18 L25 18 Z" fill="url(#cGold_${i})" stroke="#fef08a" stroke-width="1.6" stroke-linejoin="round"/>
                <path d="M14 4 L14 23" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
                <polygon points="14,8 10,15 14,19 18,15" fill="#fde047" stroke="#ffffff" stroke-width="0.6"/>
              </svg>
            `;
          } else if (t0 === 3) {
            svgHtml = `
              <svg viewBox="0 0 28 28" fill="none">
                <defs>
                  <linearGradient id="cVoid_${i}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ec4899"/>
                    <stop offset="50%" stop-color="#a855f7"/>
                    <stop offset="100%" stop-color="#4c1d95"/>
                  </linearGradient>
                </defs>
                <path d="M14 1 L4 21 L10 18 L12 27 L16 27 L18 18 L24 21 Z" fill="url(#cVoid_${i})" stroke="#f472b6" stroke-width="1.8" stroke-linejoin="round"/>
                <path d="M14 2 L8 16 L14 13 L20 16 Z" fill="#38bdf8" opacity="0.9"/>
                <circle cx="14" cy="9" r="2.5" fill="#ffffff" stroke="#c084fc" stroke-width="0.8"/>
              </svg>
            `;
          } else {
            svgHtml = `
              <svg viewBox="0 0 28 28" fill="none">
                <defs>
                  <linearGradient id="cPrism_${i}" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="25%" stop-color="#38bdf8"/>
                    <stop offset="50%" stop-color="#a855f7"/>
                    <stop offset="75%" stop-color="#ec4899"/>
                    <stop offset="100%" stop-color="#fde047"/>
                  </linearGradient>
                </defs>
                <path d="M14 0.5 L2 20 L8 17 L10 27.5 L18 27.5 L20 17 L26 20 Z" fill="url(#cPrism_${i})" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
                <polygon points="14,3 7,14 14,21 21,14" fill="#ffffff" opacity="0.95"/>
                <polygon points="14,6 10,14 14,18 18,14" fill="#38bdf8"/>
              </svg>
            `;
          }

          slot.innerHTML = `
            <div class="orbit-cursor-bob cursor-tier-${t0}" data-cursor-idx="${i}" style="animation-delay: -${delaySec}s">
              ${svgHtml}
              <div class="cursor-tip-spark spark-tier-${t0}" style="animation-delay: -${delaySec}s"></div>
            </div>
          `;
          cursorsLayer.appendChild(slot);
        }
        updateCachedCursorBobs();
      }

      // 2. Randare Drone de Extracție cu raze Laser orientate spre nucleu (Evoluție Tier 1 -> 4)
      const dronesLayer = document.getElementById('orbitDronesLayer');
      if (dronesLayer) {
        dronesLayer.innerHTML = '';
        dronesLayer.className = `orbit-ring-layer drone-ring-spin tier-${t1}`;
        for (let i = 0; i < visibleDrones; i++) {
          const angleDeg = (360 / visibleDrones) * i + 22;
          const delaySec = (i * 0.25).toFixed(2);
          const slot = document.createElement('div');
          slot.className = 'orbit-slot';
          slot.style.transform = `rotate(${angleDeg}deg)`;

          let iconHtml = '<span class="drone-unit-icon">🤖</span>';
          if (t1 === 2) {
            iconHtml = '<span class="drone-unit-icon">🛸</span><span class="drone-shield-ring"></span>';
          } else if (t1 === 3) {
            iconHtml = '<span class="drone-unit-icon">🚀</span><span class="drone-thruster-trail"></span>';
          } else if (t1 >= 4) {
            iconHtml = '<span class="drone-unit-icon">👑🛸</span><span class="drone-halo-aura"></span>';
          }

          slot.innerHTML = `
            <div class="orbit-drone-bob tier-${t1}" style="animation-delay: -${delaySec}s">
              ${iconHtml}
              <div class="drone-laser-beam laser-tier-${t1}" style="animation-delay: -${delaySec}s"></div>
            </div>
          `;
          dronesLayer.appendChild(slot);
        }
      }

      // 3. Randare Sateliți Solari pe orbita exterioară (Evoluție Tier 1 -> 4)
      const satsLayer = document.getElementById('orbitSatellitesLayer');
      if (satsLayer) {
        satsLayer.innerHTML = '';
        const satTier = Math.max(t4, t5);
        satsLayer.className = `orbit-ring-layer sat-ring-spin tier-${satTier}`;
        const satIcons = ['🛰️', '🛰️', '🛸', '🌟', '☀️'];
        const chosenIcon = satIcons[Math.min(satTier, 4)] || '🛰️';

        for (let i = 0; i < visibleSats; i++) {
          const angleDeg = (360 / visibleSats) * i;
          const slot = document.createElement('div');
          slot.className = 'orbit-slot';
          slot.style.transform = `rotate(${angleDeg}deg)`;
          slot.innerHTML = `<div class="orbit-sat-bob tier-${satTier}">${chosenIcon}</div>`;
          satsLayer.appendChild(slot);
        }
      }

      // 4. Randare Rețea Sinaptică Neural AI (g2)
      const neuralLayer = document.getElementById('orbitNeuralLayer');
      if (neuralLayer) {
        neuralLayer.innerHTML = '';
        if (g2 > 0) {
          const nodeCount = t2 >= 4 ? 12 : (t2 === 3 ? 9 : (t2 === 2 ? 6 : 4));
          for (let i = 0; i < nodeCount; i++) {
            const angleDeg = (360 / nodeCount) * i;
            const delaySec = (i * 0.2).toFixed(2);
            const slot = document.createElement('div');
            slot.className = 'orbit-slot';
            slot.style.transform = `rotate(${angleDeg}deg)`;
            const innerContent = t2 >= 4 ? (i % 2 === 0 ? '0' : '1') : '';
            slot.innerHTML = `<div class="neural-node tier-${t2}" style="animation-delay: -${delaySec}s">${innerContent}</div>`;
            neuralLayer.appendChild(slot);
          }
        }
      }

      // 5. Activare Sferă Dyson & Vortex Cosmic cu grafică scalată pe Tier
      const dysonEl = document.getElementById('coreDysonSvg');
      if (dysonEl) {
        dysonEl.classList.toggle('active', hasDyson);
        if (hasDyson) {
          if (t7 <= 1) {
            dysonEl.innerHTML = `
              <g class="dyson-cage-spin">
                <polygon points="150,32 252,209 48,209" fill="none" stroke="rgba(245, 158, 11, 0.35)" stroke-width="1.5" />
                <polygon points="150,268 252,91 48,91" fill="none" stroke="rgba(253, 224, 71, 0.28)" stroke-width="1.2" />
                <circle cx="150" cy="150" r="134" fill="none" stroke="rgba(56, 189, 248, 0.22)" stroke-width="1" stroke-dasharray="4 8" />
              </g>
            `;
          } else if (t7 === 2) {
            dysonEl.innerHTML = `
              <g class="dyson-cage-spin">
                <polygon points="150,32 252,209 48,209" fill="none" stroke="rgba(245, 158, 11, 0.55)" stroke-width="2" />
                <polygon points="150,268 252,91 48,91" fill="none" stroke="rgba(253, 224, 71, 0.45)" stroke-width="1.8" />
                <circle cx="150" cy="150" r="134" fill="none" stroke="rgba(245, 158, 11, 0.4)" stroke-width="1.5" stroke-dasharray="6 6" />
                <circle cx="150" cy="32" r="5" fill="#fde047" />
                <circle cx="252" cy="209" r="5" fill="#fde047" />
                <circle cx="48" cy="209" r="5" fill="#fde047" />
              </g>
              <g class="ring-spin-fast" style="transform-origin: 150px 150px;">
                <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1.5" stroke-dasharray="16 12" />
                <circle cx="150" cy="30" r="4" fill="#38bdf8" />
                <circle cx="150" cy="270" r="4" fill="#38bdf8" />
              </g>
            `;
          } else if (t7 === 3) {
            dysonEl.innerHTML = `
              <g class="dyson-cage-spin">
                <polygon points="150,26 257,212 43,212" fill="rgba(245, 158, 11, 0.12)" stroke="#f59e0b" stroke-width="2.2" />
                <polygon points="150,274 257,88 43,88" fill="rgba(236, 72, 153, 0.1)" stroke="#ec4899" stroke-width="2.2" />
                <circle cx="150" cy="150" r="136" fill="none" stroke="#fde047" stroke-width="2" stroke-dasharray="8 6" />
              </g>
              <g class="ring-spin-rev" style="transform-origin: 150px 150px;">
                <circle cx="150" cy="150" r="118" fill="none" stroke="rgba(168, 85, 247, 0.6)" stroke-width="2" stroke-dasharray="14 10" />
                <polygon points="150,55 232,198 68,198" fill="none" stroke="#a855f7" stroke-width="1.4" />
              </g>
            `;
          } else {
            dysonEl.innerHTML = `
              <g class="dyson-cage-spin">
                <ellipse cx="150" cy="150" rx="142" ry="48" fill="none" stroke="#ffffff" stroke-width="2" transform="rotate(-30 150 150)" />
                <ellipse cx="150" cy="150" rx="142" ry="48" fill="none" stroke="#38bdf8" stroke-width="2" transform="rotate(30 150 150)" />
                <ellipse cx="150" cy="150" rx="142" ry="48" fill="none" stroke="#fde047" stroke-width="2" transform="rotate(90 150 150)" />
                <circle cx="150" cy="150" r="138" fill="none" stroke="#ec4899" stroke-width="2.5" stroke-dasharray="12 8" />
              </g>
              <g class="ring-spin-fast" style="transform-origin: 150px 150px;">
                <polygon points="150,20 262,215 38,215" fill="rgba(253, 224, 71, 0.15)" stroke="#ffffff" stroke-width="2.5" />
                <polygon points="150,280 262,85 38,85" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" stroke-width="2.5" />
              </g>
            `;
          }
        }
      }

      const vortexEl = document.getElementById('coreCosmicVortex');
      if (vortexEl) {
        vortexEl.classList.toggle('active', hasVortex);
        vortexEl.className = `core-cosmic-vortex${hasVortex ? ' active' : ''} vortex-tier-${t8}`;
      }
    }

    // Puls pasiv vizual: cursoarele și dronele lovesc vizibil nucleul și generează scântei de energie
    function triggerPassiveVisualPulse() {
      const cps = getCPS();
      if (cps <= 0) return;

      coreBtn.classList.remove('passive-pulse');
      requestAnimationFrame(() => {
        if (coreBtn) coreBtn.classList.add('passive-pulse');
      });

      if (((state.generators && state.generators['g2']) || 0) > 0 || ((state.generators && state.generators['g3']) || 0) > 0) {
        spawnCoreLightningArc(false);
      }

      // Dacă panoul stâng este vizibil, arătăm o scânteie pasivă pe marginea nucleului unde apasă cursoarele
      const leftZone = document.getElementById('zone-left');
      if (leftZone && leftZone.offsetParent !== null) {
        const center = getCoreCenter();
        const angle = Math.random() * Math.PI * 2;
        const r = center.width * 0.38;
        const sx = center.x + Math.cos(angle) * r;
        const sy = center.y + Math.sin(angle) * r;
        spawnParticles(sx, sy, 2, '#38bdf8');
      }
    }

    // Mecanică Unică Nano-Cursor (g0): Efectuează un Auto-Click fizic pe Nucleu perfect sincronizat cu cursorul activ
    let autoCursorStrikeStep = 0;

    function triggerAutoCursorStrike() {
      const g0 = (state.generators && state.generators['g0']) || 0;
      if (g0 <= 0) return;
      const center = getCoreCenter();
      const t0 = getAutomationTier(g0);
      if (cachedCursorBobs.length === 0) {
        updateCachedCursorBobs();
      }

      let strikeX, strikeY;

      if (cachedCursorBobs.length > 0) {
        autoCursorStrikeStep = (autoCursorStrikeStep + 1) % cachedCursorBobs.length;
        // Poziție calculată direct din centrul nucleului și pasul orbital (zero reflows pe DOM)
        const angle = (autoCursorStrikeStep / cachedCursorBobs.length) * Math.PI * 2;
        const r = center.width * 0.38;
        strikeX = center.x + Math.cos(angle) * r;
        strikeY = center.y + Math.sin(angle) * r;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const r = center.width * 0.36;
        strikeX = center.x + Math.cos(angle) * r;
        strikeY = center.y + Math.sin(angle) * r;
      }

      handleCoreClick(strikeX, strikeY, true);
    }

    // Mecanică Vizuală Roboți / Drone de Extracție (g1): Salvă Laser Sincronizată asupra Nucleului!
    function triggerRobotLaserBarrage() {
      const g1 = (state.generators && state.generators['g1']) || 0;
      if (g1 <= 0) return;
      const leftZone = document.getElementById('zone-left');
      if (!leftZone || leftZone.offsetParent === null) return;
      const center = getCoreCenter();
      if (center.width <= 0) return;

      const t1 = getAutomationTier(g1);
      const cx = center.x;
      const cy = center.y;

      if (t1 <= 1) {
        spawnCoreShockwave('normal');
        triggerCosmicCorePulse(cx, cy, false, false);
        spawnCoreLightningArc(false);
        for (let i = 0; i < 4; i++) {
          const ang = (Math.PI / 2) * i + Math.random() * 0.5;
          const px = cx + Math.cos(ang) * (center.width * 0.36);
          const py = cy + Math.sin(ang) * (center.height * 0.36);
          spawnParticles(px, py, 4, '#ec4899');
        }
      } else if (t1 === 2) {
        // TIER 2: Salvă Cyber-Gold
        spawnCoreShockwave('normal');
        spawnCoreShockwave('em-wave');
        triggerCosmicCorePulse(cx, cy, false, false);
        spawnCoreLightningArc(false);
        playTone(580, 'sawtooth', 0.18, 0.1);
        for (let i = 0; i < 6; i++) {
          const ang = (Math.PI / 3) * i + Math.random() * 0.4;
          const px = cx + Math.cos(ang) * (center.width * 0.38);
          const py = cy + Math.sin(ang) * (center.height * 0.38);
          spawnParticles(px, py, 4, i % 2 === 0 ? '#f59e0b' : '#38bdf8');
        }
      } else if (t1 === 3) {
        // TIER 3: Bombardament Void-Plasma
        spawnCoreShockwave('crit');
        spawnCoreShockwave('em-wave');
        triggerCosmicCorePulse(cx, cy, true, false);
        for (let k = 0; k < 2; k++) spawnCoreLightningArc(true);
        playTone(320, 'sawtooth', 0.28, 0.12);
        for (let i = 0; i < 8; i++) {
          const ang = (Math.PI / 4) * i + Math.random() * 0.3;
          const px = cx + Math.cos(ang) * (center.width * 0.4);
          const py = cy + Math.sin(ang) * (center.height * 0.4);
          spawnParticles(px, py, 5, i % 2 === 0 ? '#a855f7' : '#f43f5e');
        }
      } else {
        // TIER 4: Mega-Bombardament Orbital Celest Suprem
        spawnCoreShockwave('crit');
        spawnCoreShockwave('em-wave');
        triggerCosmicCorePulse(cx, cy, true, true);
        for (let k = 0; k < 3; k++) spawnCoreLightningArc(true);
        playTone(220, 'sawtooth', 0.4, 0.14);
        setTimeout(() => playTone(880, 'triangle', 0.3, 0.12), 120);
        for (let i = 0; i < 10; i++) {
          const ang = (Math.PI / 5) * i + Math.random() * 0.25;
          const px = cx + Math.cos(ang) * (center.width * 0.42);
          const py = cy + Math.sin(ang) * (center.height * 0.42);
          const colors = ['#ffffff', '#38bdf8', '#ec4899', '#fde047'];
          spawnParticles(px, py, 6, colors[i % colors.length]);
        }
      }
    }

    // Mecanică Unică Condensator Tahionic (g3): Explozie Tahionică (Burst) la fiecare 5 secunde!
    function triggerTachyonCapacitorBurst() {
      const g3 = (state.generators && state.generators['g3']) || 0;
      if (g3 <= 0) return;
      const t3 = getAutomationTier(g3);
      const burstAmount = g3 * 420 * getGeneratorMilestoneMultiplier(g3) * getGlobalMultiplier();
      addEnergy(burstAmount);

      const center = getCoreCenter();
      const cx = center.x;
      const cy = center.y;

      if (t3 <= 1) {
        spawnCoreShockwave('em-wave');
        spawnCoreLightningArc(true);
        playTone(720, 'sine', 0.15, 0.1);
        spawnFloatingText(cx, cy - 25, `🔋 ȘOC TAHIONIC +${formatNumber(burstAmount)}`, true);
        spawnParticles(cx, cy, 8, '#fde047');
      } else if (t3 === 2) {
        // TIER 2: Șoc Dublu Tahionic Cyber-Gold
        spawnCoreShockwave('normal');
        spawnCoreShockwave('em-wave');
        spawnCoreLightningArc(true);
        playTone(540, 'triangle', 0.18, 0.11);
        setTimeout(() => playTone(820, 'sine', 0.2, 0.1), 80);
        spawnFloatingText(cx, cy - 28, `⚡ ȘOC TAHIONIC AURIU +${formatNumber(burstAmount)}`, true);
        spawnParticles(cx, cy, 10, '#f59e0b');
        spawnParticles(cx, cy, 8, '#fde047');
      } else if (t3 === 3) {
        // TIER 3: Furtună Tahionică Triplă Void-Plasma
        spawnCoreShockwave('crit');
        spawnCoreShockwave('em-wave');
        for (let k = 0; k < 3; k++) spawnCoreLightningArc(true);
        playTone(420, 'sawtooth', 0.22, 0.12);
        setTimeout(() => playTone(960, 'triangle', 0.25, 0.11), 100);
        spawnFloatingText(cx, cy - 32, `🔮 FURTUNĂ TAHIONICĂ VOID +${formatNumber(burstAmount)}`, true);
        spawnParticles(cx, cy, 14, '#a855f7');
        spawnParticles(cx, cy, 10, '#ec4899');
      } else {
        // TIER 4: Super-Detonație Tahionică Transcendentală
        spawnCoreShockwave('crit');
        spawnCoreShockwave('em-wave');
        for (let k = 0; k < 4; k++) spawnCoreLightningArc(true);
        playTone(280, 'sawtooth', 0.35, 0.14);
        setTimeout(() => playTone(680, 'sine', 0.25, 0.12), 100);
        setTimeout(() => playTone(1240, 'triangle', 0.35, 0.12), 200);
        spawnFloatingText(cx, cy - 36, `👑 SUPER-DETONAȚIE TAHIONICĂ +${formatNumber(burstAmount)}`, true);
        const prismColors = ['#ffffff', '#38bdf8', '#fde047', '#a855f7', '#ec4899'];
        prismColors.forEach(col => spawnParticles(cx, cy, 6, col));
      }
    }

    // Eveniment Cinematic Micro-Gaură Neagră (g6): Înghite Nucleul Cuantic pentru 3.4 secunde și apoi îl scuipă cu o Erupție Hawking!
    let isBlackHoleDevouring = false;
    function triggerBlackHoleDevourEvent() {
      const g6 = (state.generators && state.generators['g6']) || 0;
      if (g6 <= 0 || isBlackHoleDevouring) return;
      const bhOverlay = document.getElementById('coreBlackHoleOverlay');
      if (!bhOverlay || !coreBtn) return;

      const t6 = getAutomationTier(g6);
      isBlackHoleDevouring = true;
      bhOverlay.className = `blackhole-singularity-overlay bh-tier-${t6}`;
      coreBtn.classList.remove('core-devoured-by-bh');
      bhOverlay.classList.remove('devouring');
      requestAnimationFrame(() => {
        bhOverlay.classList.add('devouring');
        coreBtn.classList.add('core-devoured-by-bh');
      });

      const pitch = t6 >= 4 ? 90 : (t6 === 3 ? 115 : (t6 === 2 ? 130 : 145));
      playTone(pitch, 'sawtooth', 0.55, 0.14);

      const center = getCoreCenter();
      const cx = center.x;
      const cy = center.y;

      const title = t6 >= 4 ? '👑 SINGULARITATE COSMICĂ DE VID' : (t6 === 3 ? '🔮 GAURA NEAGRĂ GARGANTUA' : (t6 === 2 ? '⚡ GAURĂ NEAGRĂ SUPERMASIVĂ' : '🕳️ GAURA NEAGRĂ'));
      if (center.width > 0) {
        spawnFloatingText(cx, cy - 42, `${title} ABSOARBE NUCLEUL!`, true);
        const dotCount = t6 >= 4 ? 14 : (t6 === 3 ? 12 : (t6 === 2 ? 10 : 8));
        for (let w = 0; w < 3; w++) {
          setTimeout(() => {
            const cNow = getCoreCenter();
            if (cNow.width <= 0) return;
            const centerX = cNow.x;
            const centerY = cNow.y;
            for (let i = 0; i < dotCount; i++) {
              const dot = document.createElement('div');
              dot.className = 'particle-dot';
              const size = t6 >= 4 ? 6 : 5;
              dot.style.width = `${size}px`;
              dot.style.height = `${size}px`;
              const colors = t6 >= 4 ? ['#ffffff', '#38bdf8', '#fde047', '#a855f7'] : (t6 === 3 ? ['#a855f7', '#ec4899', '#f43f5e'] : ['#a855f7', '#f43f5e']);
              dot.style.background = colors[i % colors.length];
              const ang = (Math.PI * 2 * i) / dotCount + w * 0.4;
              const dist = 110 + Math.random() * (t6 >= 4 ? 50 : 30);
              const sx = centerX + Math.cos(ang) * dist;
              const sy = centerY + Math.sin(ang) * dist;
              dot.style.left = `${sx}px`;
              dot.style.top = `${sy}px`;
              document.body.appendChild(dot);
              dot.animate([
                { transform: 'translate3d(-50%, -50%, 0) scale(1.3)', opacity: 1 },
                { transform: `translate3d(${centerX - sx - 50}px, ${centerY - sy - 50}px, 0) scale(0.1)`, opacity: 0 }
              ], {
                duration: t6 >= 4 ? 600 : 700,
                easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)'
              }).onfinish = () => dot.remove();
            }
          }, w * 650);
        }
      }

      // La 2.75s explozie de radiație Hawking scalată pe Tier
      setTimeout(() => {
        const tierHawkingMult = t6 >= 4 ? 6.0 : (t6 === 3 ? 4.8 : (t6 === 2 ? 4.0 : 3.5));
        const hawkingBonus = Math.max(500, getCPS() * tierHawkingMult);
        addEnergy(hawkingBonus);
        spawnCoreShockwave('em-wave');
        if (t6 >= 2) spawnCoreShockwave('crit');
        if (t6 >= 3) spawnCoreShockwave('em-wave');
        const arcsCount = t6 >= 4 ? 5 : (t6 === 3 ? 4 : 3);
        for (let k = 0; k < arcsCount; k++) spawnCoreLightningArc(true);
        playTone(t6 >= 4 ? 820 : 620, 'triangle', 0.35, 0.14);
        const cEnd = getCoreCenter();
        if (cEnd.width > 0) {
          const eruptionTitle = t6 >= 4 ? '👑 SUPER-NOVA HAWKING TRANSCENDENTALĂ' : (t6 === 3 ? '🔮 ERUPȚIE HAWKING HIPER-DENSĂ' : '💥 ERUPȚIE HAWKING');
          spawnFloatingText(cEnd.x, cEnd.y - 20, `${eruptionTitle} +${formatNumber(hawkingBonus)}`, true);
          const pCount = t6 >= 4 ? 28 : (t6 === 3 ? 22 : 16);
          spawnParticles(cEnd.x, cEnd.y, pCount, t6 >= 3 ? '#ec4899' : '#a855f7');
        }
      }, 2750);

      setTimeout(() => {
        bhOverlay.classList.remove('devouring');
        coreBtn.classList.remove('core-devoured-by-bh');
        isBlackHoleDevouring = false;
      }, 3450);
    }

    // Eveniment Cinematic Motor de Univers Sintetic (g9): Portal Big Bang Multi-Dimensional!
    let isUniverseGenesisActive = false;
    function triggerSyntheticUniverseGenesis() {
      const g9 = (state.generators && state.generators['g9']) || 0;
      if (g9 <= 0 || isUniverseGenesisActive) return;
      const portalEl = document.getElementById('coreUniversePortal');
      if (!portalEl || !coreBtn) return;

      const t9 = getAutomationTier(g9);
      isUniverseGenesisActive = true;
      portalEl.className = `universe-genesis-portal portal-tier-${t9}`;
      portalEl.classList.remove('active-genesis');
      requestAnimationFrame(() => portalEl.classList.add('active-genesis'));

      const tierGenesisMult = t9 >= 4 ? 9.0 : (t9 === 3 ? 7.0 : (t9 === 2 ? 5.5 : 4.5));
      const genesisBonus = Math.max(2500, getCPS() * tierGenesisMult);
      addEnergy(genesisBonus);

      playTone(520, 'sine', 0.35, 0.11);
      setTimeout(() => playTone(780, 'triangle', 0.35, 0.12), 220);
      if (t9 >= 3) setTimeout(() => playTone(1040, 'sine', 0.4, 0.12), 440);
      if (t9 >= 4) setTimeout(() => playTone(1560, 'sawtooth', 0.45, 0.14), 660);

      spawnCoreShockwave('em-wave');
      setTimeout(() => spawnCoreShockwave('crit'), 250);
      if (t9 >= 3) setTimeout(() => spawnCoreShockwave('em-wave'), 450);

      const arcsCount = t9 >= 4 ? 6 : (t9 === 3 ? 5 : 4);
      for (let k = 0; k < arcsCount; k++) spawnCoreLightningArc(true);

      const center = getCoreCenter();
      if (center.width > 0) {
        const cx = center.x;
        const cy = center.y;
        const title = t9 >= 4 ? '👑 GENEZĂ OMNIVERSALĂ BIG BANG!' : (t9 === 3 ? '🔮 GENEZĂ MULTIVERS CUANTIC!' : '🌌 GENEZĂ UNIVERS SINTETIC!');
        spawnFloatingText(cx, cy - 48, `${title} +${formatNumber(genesisBonus)}`, true);
        const pCount = t9 >= 4 ? 22 : (t9 === 3 ? 18 : 14);
        spawnParticles(cx, cy, pCount, '#38bdf8');
        spawnParticles(cx, cy, pCount, '#fde047');
      }

      setTimeout(() => {
        portalEl.classList.remove('active-genesis');
        isUniverseGenesisActive = false;
      }, 3650);
    }

    let activeFloatingEls = [];
    function spawnFloatingText(x, y, text, isCrit = false) {
      if (activeFloatingEls.length >= 4) {
        const old = activeFloatingEls.shift();
        if (old && old.parentNode) old.remove();
      }
      const el = document.createElement('div');
      el.className = 'floating-text' + (isCrit ? ' crit' : '');
      el.textContent = isCrit ? `💥 ${text}!` : text;
      const offsetX = (Math.random() - 0.5) * 40;
      const offsetY = (Math.random() - 0.5) * 20;
      el.style.left = `${x + offsetX}px`;
      el.style.top = `${y - 15 + offsetY}px`;
      document.body.appendChild(el);
      activeFloatingEls.push(el);
      setTimeout(() => {
        const idx = activeFloatingEls.indexOf(el);
        if (idx !== -1) activeFloatingEls.splice(idx, 1);
        if (el.parentNode) el.remove();
      }, 750);
    }

    let activeParticlesCount = 0;
    const MAX_PARTICLES_ON_SCREEN = 24;

    function spawnParticles(x, y, count, color) {
      if (activeParticlesCount >= MAX_PARTICLES_ON_SCREEN) return;
      const spawnLimit = Math.min(count, MAX_PARTICLES_ON_SCREEN - activeParticlesCount);

      for (let i = 0; i < spawnLimit; i++) {
        activeParticlesCount++;
        const dot = document.createElement('div');
        dot.className = 'particle-dot';
        const size = 3 + Math.random() * 4;
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.background = color;
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
        document.body.appendChild(dot);

        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 55;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;

        dot.animate([
          { transform: 'translate3d(-50%, -50%, 0) scale(1)', opacity: 1 },
          { transform: `translate3d(calc(-50% + ${tx}px), calc(-50% + ${ty}px), 0) scale(0)`, opacity: 0 }
        ], {
          duration: 380 + Math.random() * 180,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }).onfinish = () => {
          activeParticlesCount = Math.max(0, activeParticlesCount - 1);
          dot.remove();
        };
      }
    }

    function addEnergy(amount) {
      state.energy += amount;
      state.totalEnergyThisRun += amount;
      state.lifetimeEnergy += amount;
    }

