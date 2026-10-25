    /********************************************************************
     * 9. SISTEM DE PRESTIGIU SECVENȚIAL + ANIMAȚIE EXPLOZIE ÎN BUCĂȚI & RECONSTRUCȚIE
     ********************************************************************/
    let isRebirthAnimating = false;

    function playRebirthCinematicExplosion(onStabilizeCallback) {
      if (isRebirthAnimating) return;
      isRebirthAnimating = true;

      // Dacă suntem pe telefon și panoul Nucleului este ascuns, comutăm pe Nucleu să se vadă explozia!
      const leftZone = document.getElementById('zone-left');
      if (leftZone && window.getComputedStyle(leftZone).display === 'none') {
        const firstMobBtn = document.querySelector('.mobile-nav-btn');
        if (typeof switchMobileZone === 'function') {
          switchMobileZone('left', firstMobBtn);
        }
      }

      const wrap = document.getElementById('coreEcosystemWrap');
      if (!wrap || !coreBtn) {
        isRebirthAnimating = false;
        onStabilizeCallback();
        return;
      }

      // Faza 1 (0 - 700ms): Supraîncălzire critică, vibrație violentă și implozie a Nucleului
      wrap.classList.remove('core-prestige-reborn');
      wrap.classList.add('core-prestige-imploding');
      playTone(180, 'sawtooth', 0.65, 0.14);
      setTimeout(() => playTone(120, 'sawtooth', 0.45, 0.15), 300);

      // Faza 2 (700ms): BUBUIE NUCLEUL ÎN 32 DE BUCĂȚI CRISTALINE!
      setTimeout(() => {
        wrap.classList.remove('core-prestige-imploding');
        coreBtn.style.opacity = '0';
        coreBtn.style.transform = 'scale(0.05)';

        // Flash cosmic pe tot ecranul
        const flash = document.createElement('div');
        flash.className = 'prestige-screen-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 2200);

        playTone(95, 'square', 0.55, 0.16);
        setTimeout(() => playTone(520, 'triangle', 0.4, 0.12), 140);

        const rect = wrap.getBoundingClientRect();
        const cx = rect.width > 0 ? rect.left + rect.width / 2 : window.innerWidth / 2;
        const cy = rect.height > 0 ? rect.top + rect.height / 2 : window.innerHeight / 2;

        spawnFloatingText(cx, cy - 30, '💥 COLAPS CUANTIC: NUCLEU SPULBERAT!', true);

        const shardColors = [
          'linear-gradient(135deg, #ffffff, #38bdf8, #0284c7)',
          'linear-gradient(135deg, #fde047, #f59e0b, #ea580c)',
          'linear-gradient(135deg, #f0abfc, #a855f7, #6366f1)',
          'linear-gradient(135deg, #fbcfe8, #ec4899, #be185d)'
        ];

        const shards = [];
        const shardCount = 32;
        for (let i = 0; i < shardCount; i++) {
          const shard = document.createElement('div');
          shard.className = 'prestige-shard';
          const size = 14 + Math.random() * 22;
          shard.style.width = `${size}px`;
          shard.style.height = `${size}px`;
          shard.style.background = shardColors[i % shardColors.length];
          shard.style.left = `${cx}px`;
          shard.style.top = `${cy}px`;
          document.body.appendChild(shard);

          const angle = (Math.PI * 2 * i) / shardCount + (Math.random() - 0.5) * 0.25;
          const dist = 110 + Math.random() * 190;
          const tx = Math.cos(angle) * dist;
          const ty = Math.sin(angle) * dist;
          const rot = (Math.random() - 0.5) * 720;

          // Explozie în afară + înghețare scurtă în aer + reconstrucție magnetică înapoi în centru!
          shard.animate([
            { transform: 'translate(-50%, -50%) translate(0px, 0px) rotate(0deg) scale(0.4)', opacity: 1, offset: 0 },
            { transform: `translate(-50%, -50%) translate(${tx * 0.85}px, ${ty * 0.85}px) rotate(${rot * 0.7}deg) scale(1.25)`, opacity: 1, offset: 0.38 },
            { transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(1.1)`, opacity: 0.95, offset: 0.58 },
            { transform: 'translate(-50%, -50%) translate(0px, 0px) rotate(0deg) scale(0.15)', opacity: 1, offset: 1 }
          ], {
            duration: 1950,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
          }).onfinish = () => shard.remove();

          shards.push(shard);
        }

        // Sunet de absorbție magnetică la jumătatea zborului când bucățile se întorc
        setTimeout(() => {
          playTone(340, 'sine', 0.4, 0.11);
          setTimeout(() => playTone(680, 'triangle', 0.45, 0.13), 260);
        }, 1100);

        // Faza 3 (2650ms): Bucățile s-au unit la loc -> Nucleul se stabilizează într-o nouă Singularitate!
        setTimeout(() => {
          coreBtn.style.opacity = '';
          coreBtn.style.transform = '';
          wrap.classList.add('core-prestige-reborn');
          spawnCoreShockwave('em-wave');
          spawnCoreShockwave('crit');
          for (let k = 0; k < 6; k++) spawnCoreLightningArc(true);
          spawnParticles(cx, cy, 30, '#fde047');
          spawnParticles(cx, cy, 24, '#38bdf8');
          playTone(880, 'triangle', 0.45, 0.14);

          onStabilizeCallback();

          setTimeout(() => {
            wrap.classList.remove('core-prestige-reborn');
            isRebirthAnimating = false;
          }, 950);
        }, 1950);
      }, 700);
    }

    function triggerPrestige() {
      if (!isRebirthReady() || isRebirthAnimating) return;
      const catalystLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_dm_catalyst']) || 0;
      let baseDmReward = getCurrentRebirthDarkMatterReward() + catalystLvl;
      const isVoidSingularity = typeof activeCosmicStorm !== 'undefined' && activeCosmicStorm && activeCosmicStorm.id === 'void_singularity';
      const voidBonus = isVoidSingularity ? Math.max(1, Math.round(baseDmReward * 0.25)) : 0;
      const dmReward = baseDmReward + voidBonus;
      const nextRebirthNum = (state.prestigeCount || 0) + 1;

      if (!confirm(`Ești sigur că vrei să declanșezi Rebirth #${nextRebirthNum}?\n\n• Nucleul actual va colapsa și se va reconstrui în Singularitatea #${nextRebirthNum} (+15% producție permanentă)\n• Vei primi +${dmReward} 🔮 Materie Întunecată (+${dmReward * 10}% producție permanentă)${catalystLvl > 0 ? ` (include +${catalystLvl} 🔮 din Catalizator)` : ''}${voidBonus > 0 ? ` (include +${voidBonus} 🔮 din Alinierea Singularităților Vidului!)` : ''}\n• Soldul actual de ${formatNumber(state.energy || 0)} ⚡ și generatoarele se vor consuma pentru noul ciclu.`)) {
        return;
      }

      playRebirthCinematicExplosion(() => {
        state.darkMatter += dmReward;
        state.prestigeCount = nextRebirthNum;

        // Energia de start din upgrade-ul Memorie Ancestrală (+1000 per nivel)
        const starterLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_starter']) || 0;
        const startEnergy = starterLvl * 1000;

        state.energy = startEnergy;
        state.totalEnergyThisRun = startEnergy;
        comboMeter = 0;

        CORES_DATA.forEach(c => {
          if (state.cores && state.cores[c.id]) {
            CLICK_UPGRADES_DATA.forEach(u => state.cores[c.id].clickUpgrades[u.id] = 0);
            GENERATORS_DATA.forEach(g => state.cores[c.id].generators[g.id] = 0);
          }
        });

        showToast(`🌌 Singularitatea #${nextRebirthNum} Stabilizată! Ai primit +${dmReward} 🔮 Materie Întunecată!`);

        if (nextRebirthNum === 10) {
          setTimeout(() => {
            showToast(`☀️ OMNIVERS EXTINS: Ai deblocat Nucleul de Plasmă Solară! Comută pe el pentru farming paralel!`);
            playTone(660, 'triangle', 0.4, 0.15);
          }, 1200);
        } else if (nextRebirthNum === 25) {
          setTimeout(() => {
            showToast(`🧊 OMNIVERS EXTINS: Ai deblocat Tesseractul 4D Hiper-Cibernetic!`);
            playTone(720, 'triangle', 0.4, 0.15);
          }, 1200);
        } else if (nextRebirthNum === 50) {
          setTimeout(() => {
            showToast(`🩸 OMNIVERS EXTINS: Ai deblocat Singularitatea Abisală Void!`);
            playTone(330, 'sawtooth', 0.4, 0.15);
          }, 1200);
        } else if (nextRebirthNum === 100) {
          setTimeout(() => {
            showToast(`✨ OMNIVERS SUPREM: Ai deblocat Gaura Albă Superluminoasă!`);
            playTone(990, 'triangle', 0.5, 0.2);
          }, 1200);
        }

        updateDailyQuestProgress('prestige', 1);
        checkAchievements();
        renderAll();
        saveGame();
        if (cloudSession && (cloudSession.access_token || cloudSession.refresh_token)) {
          cloudPushSave(false);
        }
      });
    }

