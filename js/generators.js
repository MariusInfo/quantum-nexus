    /********************************************************************
     * 7. ACHIZIȚII UPGRADE-URI, GENERATOARE ȘI ABILITĂȚI ACTIVE
     ********************************************************************/
    function buyClickUpgrade(id) {
      const upg = CLICK_UPGRADES_DATA.find(u => u.id === id);
      if (!upg) return;
      const lvl = state.clickUpgrades[id] || 0;
      if (lvl >= upg.maxLevel) return;
      const info = getClickUpgradeBuyInfo(upg, clickBuyMultiplier);
      if (state.energy >= info.cost && info.count > 0) {
        const cardEl = document.getElementById(`u_card_${id}`);
        spawnActivationOrbToCore(cardEl, '#a855f7');
        state.energy -= info.cost;
        state.clickUpgrades[id] = lvl + info.count;
        updateDailyQuestProgress('buy_upgrades', info.count);
        playTone(540, 'triangle', 0.1, 0.09);
        if (id === 'c_flat1') spawnPhotonMegaBeam();
        syncCoreVisualEcosystem(true);
        if (state.clickUpgrades[id] >= upg.maxLevel) {
          renderClickUpgrades();
        } else {
          const lvlEl = document.getElementById(`u_lvl_${id}`);
          if (lvlEl) lvlEl.textContent = `Niv. ${state.clickUpgrades[id]}/${upg.maxLevel}`;
          const costEl = document.getElementById(`u_cost_${id}`);
          const nextInfo = getClickUpgradeBuyInfo(upg, clickBuyMultiplier);
          const isMax = state.clickUpgrades[id] >= upg.maxLevel;
          const costDisplay = isMax ? 'MAXIM' : (clickBuyMultiplier === 1 ? `${formatNumber(nextInfo.cost)} ⚡` : `+${nextInfo.count}x: ${formatNumber(nextInfo.cost)} ⚡`);
          if (costEl) costEl.textContent = costDisplay;
          const barEl = cardEl ? cardEl.querySelector('.tech-progress-fill') : null;
          if (barEl) barEl.style.width = `${Math.min(100, Math.round((state.clickUpgrades[id] / upg.maxLevel) * 100))}%`;
        }
        const activeCardEl = document.getElementById(`u_card_${id}`);
        if (activeCardEl) {
          activeCardEl.classList.remove('card-activated-flash');
          void activeCardEl.offsetWidth;
          activeCardEl.classList.add('card-activated-flash');
        }
        updateUI();
        saveGame();
      }
    }

    function buyGenerator(id) {
      const gen = GENERATORS_DATA.find(g => g.id === id);
      if (!gen) return;
      const info = getGeneratorBuyInfo(gen, buyMultiplier);
      if (state.energy >= info.cost) {
        const cardEl = document.getElementById(`g_card_${id}`);
        spawnActivationOrbToCore(cardEl, '#38bdf8');
        const curCount = state.generators[id] || 0;
        const oldTier = getAutomationTier(curCount);
        state.energy -= info.cost;
        state.generators[id] = curCount + info.count;
        const newCount = state.generators[id];
        const newTier = getAutomationTier(newCount);

        if (newTier > oldTier) {
          playTierUpSound(newTier);
          const tierMeta = AUTOMATION_TIERS_META[newTier] || { name: `Tier ${newTier}`, roman: 'IV', color: '#fde047' };
          showToast(`✨ ${gen.name} a EVOLUAT la TIER ${tierMeta.roman} (${tierMeta.name})! Animațiile au avansat!`);
          spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2 - 50, `👑 ${gen.name.toUpperCase()} TIER ${tierMeta.roman}!`, true);
          spawnCoreShockwave(newTier >= 3 ? 'crit' : 'em-wave');
          spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 28, tierMeta.color);
          renderGenerators();
        } else {
          // Actualizare directă în DOM (Fără distrugere/recreere a cardului: zero salturi vizuale și zero click-uri ratate)
          const cntEl = document.getElementById(`g_cnt_${id}`);
          if (cntEl) cntEl.textContent = newCount;
          const costEl = document.getElementById(`g_cost_${id}`);
          const nextInfo = getGeneratorBuyInfo(gen, buyMultiplier);
          if (costEl) costEl.textContent = `+${nextInfo.count}x: ${formatNumber(nextInfo.cost)} ⚡`;
          const nextThreshold = newCount < 25 ? 25 : (newCount < 50 ? 50 : (newCount < 100 ? 100 : null));
          const fillEl = cardEl ? cardEl.querySelector('.gen-milestone-fill') : null;
          if (fillEl) fillEl.style.width = `${getNextMilestoneProgress(newCount)}%`;
          const nextTierEl = cardEl ? cardEl.querySelector('.gen-next-tier') : null;
          if (nextTierEl) {
            nextTierEl.textContent = nextThreshold ? `Tier următor: ${newCount}/${nextThreshold}` : `👑 MAX TIER`;
          }
        }

        updateDailyQuestProgress('buy_generators', info.count);
        playTone(460, 'sine', 0.09, 0.08);
        spawnCoreShockwave('normal');
        syncCoreVisualEcosystem(true);
        if (id === 'g1') setTimeout(() => triggerRobotLaserBarrage(), 350);
        if (id === 'g3') setTimeout(() => triggerTachyonCapacitorBurst(), 350);
        if (id === 'g6') setTimeout(() => triggerBlackHoleDevourEvent(), 420);
        if (id === 'g9') setTimeout(() => triggerSyntheticUniverseGenesis(), 420);
        const activeCardEl = document.getElementById(`g_card_${id}`);
        if (activeCardEl) {
          activeCardEl.classList.remove('card-activated-flash');
          void activeCardEl.offsetWidth;
          activeCardEl.classList.add('card-activated-flash');
        }
        updateUI();
        saveGame();
      }
    }

    function buyPrestigeUpgrade(id) {
      const upg = PRESTIGE_UPGRADES_DATA.find(p => p.id === id);
      if (!upg) return;
      const lvl = state.prestigeUpgrades[id] || 0;
      if (lvl >= upg.maxLevel) return;
      const cost = getPrestigeUpgradeCost(upg, lvl);
      if (state.darkMatter >= cost) {
        spawnActivationOrbToCore(null, '#fde047');
        state.darkMatter -= cost;
        state.prestigeUpgrades[id] = lvl + 1;
        playTone(760, 'triangle', 0.14, 0.12);
        renderPrestigeUpgrades();
        updateUI();
        saveGame();
      }
    }

    function setBuyMultiplier(mode, btn) {
      setRightZoneMultiplier(mode, btn);
    }

    function setClickUpgradeBuyMultiplier(mode, btn) {
      setRightZoneMultiplier(mode, btn);
    }

    function activateSkill(skillNum) {
      const now = Date.now();
      if (now < (skillCooldowns[skillNum] || 0)) return;
      state.skillsUsed = (state.skillsUsed || 0) + 1;
      updateDailyQuestProgress('skills', 1);
      if (comboMeter >= 85) updateDailyQuestProgress('fever_skills', 1);

      const cdFactor = getSkillCooldownFactor();
      const skillBonusMult = getAnomalyAndSkillBonusMult();
      const btnEl = document.getElementById(`skill${skillNum}`);

      if (skillNum === 1) {
        // Impuls EM: +12x CPS instant (amplificat de Găurile Negre g6) + 3 unde de șoc electromagnetice
        const gain = Math.max(25, getCPS() * 12 * skillBonusMult);
        addEnergy(gain);
        skillCooldowns[1] = now + Math.round(90000 * cdFactor);
        spawnActivationOrbToCore(btnEl, '#22d3ee');
        spawnCoreShockwave('em-wave');
        setTimeout(() => spawnCoreShockwave('em-wave'), 180);
        setTimeout(() => spawnCoreShockwave('em-wave'), 360);
        for (let k = 0; k < 4; k++) spawnCoreLightningArc(true);
        showToast(`⚡ Impuls EM activat! Ai primit +${formatNumber(gain)} Energie!`);
        playTone(880, 'sawtooth', 0.18, 0.1);
      } else if (skillNum === 2) {
        // Hiper-Critică: +40% Crit timp de 12s + Vizor Lunetist pe Nucleu
        activeBuffs.hyperCritEnd = now + 12000;
        skillCooldowns[2] = now + Math.round(120000 * cdFactor);
        spawnActivationOrbToCore(btnEl, '#f43f5e');
        spawnCoreShockwave('crit');
        showToast('🎯 Fuziune Hiper-Critică: +40% Șansă Critică pentru 12s!');
        playTone(740, 'triangle', 0.18, 0.1);
      } else if (skillNum === 3) {
        // Distorsiune Temporală: 1.5x producție timp de 20s + Aură Temporală
        activeBuffs.timeWarpEnd = now + 20000;
        skillCooldowns[3] = now + Math.round(180000 * cdFactor);
        spawnActivationOrbToCore(btnEl, '#a855f7');
        spawnCoreShockwave('em-wave');
        showToast('⏳ Distorsiune Temporală: Producție x1.5 pentru 20s!');
        playTone(620, 'sine', 0.2, 0.1);
      }

      // Salvăm IMEDIAT în localStorage ca refresh-ul să nu reseteze niciodată cooldown-ul!
      state.skillCooldowns = skillCooldowns;
      state.activeBuffs = activeBuffs;
      saveGame();
      checkAchievements();
      updateUI();
    }

