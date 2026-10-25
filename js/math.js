    /********************************************************************
     * 4. CALCULE MATEMATICE PENTRU PRODUCȚIE (CPS, CLICK, PRESTIGIU)
     ********************************************************************/
    function getTotalGenerators() {
      return Object.values(state.generators).reduce((a, b) => a + b, 0);
    }

    // Multiplicator echilibrat de praguri pentru generatoare (+35% la 25, 50, 100, 200, 350, 500)
    function getGeneratorMilestoneMultiplier(count) {
      const thresholds = [25, 50, 100, 200, 350, 500];
      let mult = 1;
      for (const t of thresholds) {
        if (count >= t) mult *= 1.35;
      }
      return mult;
    }

    function getNextMilestoneProgress(count) {
      const thresholds = [25, 50, 100, 200, 350, 500];
      let prev = 0;
      for (const t of thresholds) {
        if (count < t) {
          return ((count - prev) / (t - prev)) * 100;
        }
        prev = t;
      }
      return 100;
    }

    // =========================================================================
    // SISTEM EVOLUTIV TIERS PENTRU AUTOMATIZĂRI PASIVE (NIVELE 1, 25, 50, 100+)
    // =========================================================================
    const AUTOMATION_TIERS_META = {
      0: { name: 'Inactiv', roman: '0', color: '#64748b', badgeClass: 'tier-0' },
      1: { name: 'Standard Cuantic', roman: 'I', color: '#38bdf8', badgeClass: 'tier-1' },
      2: { name: 'Cyber-Gold Overclocked', roman: 'II', color: '#f59e0b', badgeClass: 'tier-2' },
      3: { name: 'Hiper-Void Plasma', roman: 'III', color: '#a855f7', badgeClass: 'tier-3' },
      4: { name: 'Transcendental Suprem', roman: 'IV', color: '#ffffff', badgeClass: 'tier-4' }
    };

    function getAutomationTier(count) {
      if (!count || count <= 0) return 0;
      if (count >= 100) return 4;
      if (count >= 50) return 3;
      if (count >= 25) return 2;
      return 1;
    }

    function getGeneratorTierIcon(genId, tier) {
      const tierMap = {
        'g0': ['🖱️', '🖱️', '⚡', '🔮', '👑'],
        'g1': ['🤖', '🤖', '🛸', '🚀', '👑'],
        'g2': ['💻', '💻', '⚡', '🧠', '🌐'],
        'g3': ['🔋', '🔋', '⚡', '💥', '💠'],
        'g4': ['🛰️', '🛰️', '🛸', '🌟', '☀️'],
        'g5': ['⚛️', '⚛️', '💠', '🔥', '🌟'],
        'g6': ['🕳️', '🕳️', '🌀', '🔮', '🌌'],
        'g7': ['☀️', '☀️', '🪐', '🌟', '👑'],
        'g8': ['⏳', '⏳', '⏱️', '🌀', '👑'],
        'g9': ['🌌', '🌌', '✨', '🔮', '👑']
      };
      const icons = tierMap[genId] || ['⚙️', '⚙️', '⚡', '🔮', '👑'];
      return icons[Math.min(tier, 4)] || icons[0];
    }

    function playTierUpSound(tier = 2) {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        const freqs = tier >= 4 
          ? [523.25, 659.25, 783.99, 1046.50, 1318.51] 
          : (tier === 3 ? [440.00, 554.37, 659.25, 880.00] : [392.00, 493.88, 587.33, 783.99]);
        freqs.forEach((f, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = tier >= 4 ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(f, now + idx * 0.08);
          gain.gain.setValueAtTime(0.09, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.28);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.3);
        });
      } catch (e) {}
    }

    // Pragul de Energie necesar pentru URMĂTORUL Rebirth (Secvențial, Câte Unul)
    function getRebirthEnergyRequirement() {
      return 1e7 * Math.pow(7.5, state.prestigeCount || 0);
    }

    function isRebirthReady() {
      return (state.energy || 0) >= getRebirthEnergyRequirement();
    }

    // Costul fiecărui upgrade de Prestigiu (scalare liniară/aritmetică adaptată la Rebirth secvențial)
    function getPrestigeUpgradeCost(upg, lvl) {
      return upg.baseCost + lvl * (upg.costStep || 1);
    }

    // Recompensa de Materie Întunecată pentru Rebirth-ul curent (scalare progresivă echitabilă cu efortul fiecărui Rebirth)
    function getCurrentRebirthDarkMatterReward() {
      const nextRebirth = (state.prestigeCount || 0) + 1;
      return Math.max(1, Math.round(nextRebirth + Math.pow(nextRebirth, 1.35) * 0.4));
    }

    function getPendingDarkMatter() {
      return isRebirthReady() ? getCurrentRebirthDarkMatterReward() : 0;
    }

    // Producție constantă și stabilă: fără degradare artificială a energiei
    function getSaturationFactor() {
      return 1.0;
    }

    function getGlobalSharedMultiplier() {
      let mult = 1;

      // 1. Realizări (+1% fiecare, sau +1.5% cu Transcendință Cosmică)
      const transLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_transcendence']) || 0;
      const achMult = transLvl > 0 ? 0.015 : 0.010;
      mult *= 1 + (state.unlockedAchievements ? state.unlockedAchievements.length : 0) * achMult;

      // 2. Materie Întunecată deținută (+10% fiecare) + Rebirth-uri efectuate (+15% fiecare, sau mai mult cu Rezonanță Cuantică)
      const cosmicResLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_cosmic_resonance']) || 0;
      const rebirthPctBonus = 0.15 + cosmicResLvl * 0.03;
      mult *= 1 + (state.darkMatter || 0) * 0.10 + (state.prestigeCount || 0) * rebirthPctBonus;

      // 3. Upgrade Prestigiu Rezonanță Întunecată (+25% per nivel)
      const pProdLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_prod']) || 0;
      mult *= 1 + pProdLvl * 0.25;

      // 4. Keystone Pasiv: Motorul Perpetuu al Vidului (+50% multiplicat per nivel)
      const voidLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_perpetual_void']) || 0;
      if (voidLvl > 0) mult *= (1 + voidLvl * 0.50);

      // 5. Sinergie Flotă: Rețea Neurală de Flotă (+2% per tip unic de generator activ)
      const fleetSynLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_fleet_synergy']) || 0;
      if (fleetSynLvl > 0) {
        let uniqueGens = 0;
        for (const gen of GENERATORS_DATA) {
          if ((state.generators && state.generators[gen.id]) > 0) uniqueGens++;
        }
        mult *= (1 + fleetSynLvl * uniqueGens * 0.02);
      }

      // 6. Buff-uri temporare active
      const now = Date.now();
      if (now < (activeBuffs.frenzyEnd || 0)) mult *= 2.5;
      if (now < (activeBuffs.timeWarpEnd || 0)) mult *= 1.5;
      if (now < (activeBuffs.overdriveOrbEnd || 0)) mult *= 1.4;

      // 6.5. Furtuni Stelare & Vreme Cosmică Activă
      if (typeof activeCosmicStorm !== 'undefined' && activeCosmicStorm) {
        if (activeCosmicStorm.id === 'solar_flare') mult *= 2.5; // +150% Global (Sateliții & Reactoarele au și bonus dedicat x5)
        else if (activeCosmicStorm.id === 'chronos_rift') mult *= 3.0; // Dilatare Temporală x3.0
        else if (activeCosmicStorm.id === 'void_singularity') mult *= 2.8; // Aliniere Singularități Vid x2.8
      }

      // 7. Saturație dacă nu ai dat Rebirth după atingerea pragului
      mult *= getSaturationFactor();

      return mult;
    }

    // Păstrăm getGlobalMultiplier pentru compatibilitate apeluri existente
    function getGlobalMultiplier() {
      const gLvl = (state.clickUpgrades && state.clickUpgrades['c_global1']) || 0;
      return getGlobalSharedMultiplier() * (1 + gLvl * 0.08);
    }

    let secondsSinceLastManualClick = 0;

    function getCoreBaseCPS(coreId) {
      const coreDef = CORES_DATA.find(c => c.id === coreId);
      if (!coreDef) return 0;
      const coreData = (state.cores && state.cores[coreId]) || { generators: {}, clickUpgrades: {} };
      const gens = coreData.generators || {};
      const ups = coreData.clickUpgrades || {};

      const qOverdriveLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_quantum_overdrive']) || 0;
      let baseTotal = 0;

      for (let i = 0; i < GENERATORS_DATA.length; i++) {
        const gen = GENERATORS_DATA[i];
        const count = gens[gen.id] || 0;
        if (count > 0) {
          const milestoneMult = getGeneratorMilestoneMultiplier(count);
          let genOutput = count * gen.baseCps * milestoneMult;
          if (i >= 4 && qOverdriveLvl > 0) {
            genOutput *= (1 + qOverdriveLvl * 0.30);
          }
          baseTotal += genOutput;
        }
      }

      // Multiplicator nativ specific acestui nucleu!
      baseTotal *= (coreDef.cpsMult || 1.0);

      // Sinergii locale construite pe acest nucleu: Matrice Dyson (g7) & Motor Univers (g9)
      const dysonCount = gens['g7'] || 0;
      const uniCount = gens['g9'] || 0;
      baseTotal *= (1 + dysonCount * 0.04) * (1 + uniCount * 0.10);

      // Sinergie Eveniment Furtună Solară: Sateliții Solari (g4) & Reactoarele de Fuziune (g5) produc x5.0 Energie/s!
      if (typeof activeCosmicStorm !== 'undefined' && activeCosmicStorm && activeCosmicStorm.id === 'solar_flare') {
        const satCount = gens['g4'] || 0;
        const fusionCount = gens['g5'] || 0;
        if (satCount > 0) baseTotal += satCount * (GENERATORS_DATA[4].baseCps * 4.0);
        if (fusionCount > 0) baseTotal += fusionCount * (GENERATORS_DATA[5].baseCps * 4.0);
      }

      // Tehnologie Rețea Superconductoare (c_global1) dezvoltată pe acest nucleu (+8%/lvl)
      const gLvl = ups['c_global1'] || 0;
      baseTotal *= (1 + gLvl * 0.08);

      // Sinteză Autonomă AFK (+15%/niv max, crește treptat după 15s)
      const afkSynLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_automated_synergy']) || 0;
      if (afkSynLvl > 0 && secondsSinceLastManualClick >= 15) {
        const maxAfkPct = afkSynLvl * 0.15;
        const progressRatio = Math.min(1.0, secondsSinceLastManualClick / 120);
        baseTotal *= (1 + maxAfkPct * progressRatio);
      }

      return baseTotal;
    }

    function getCoreCPS(coreId) {
      if (!isCoreUnlocked(coreId)) return 0;
      return getCoreBaseCPS(coreId) * getGlobalSharedMultiplier();
    }

    function getBasePassiveCPS() {
      let sum = 0;
      CORES_DATA.forEach(c => {
        if (isCoreUnlocked(c.id)) {
          sum += getCoreBaseCPS(c.id);
        }
      });
      return sum;
    }

    // Producție TOTALĂ CUMULATIVĂ a tuturor nucleelor deblocate în paralel (Farming Excesiv!)
    function getCPS() {
      let total = 0;
      CORES_DATA.forEach(c => {
        if (isCoreUnlocked(c.id)) {
          total += getCoreCPS(c.id);
        }
      });
      return total;
    }

    function getComboMultiplier() {
      const aiCount = (state.generators && state.generators['g2']) || 0;
      const comboLockLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_combo_lock']) || 0;
      const maxBonus = (1.0 + comboLockLvl * 0.30) * (1 + aiCount * 0.03);
      return 1 + (comboMeter / 100) * maxBonus;
    }

    function getClickValue() {
      const curCore = CORES_DATA.find(c => c.id === (state.activeCoreId || 'quantum')) || CORES_DATA[0];
      const flatLvl = (state.clickUpgrades && state.clickUpgrades['c_flat1']) || 0;
      const multLvl = (state.clickUpgrades && state.clickUpgrades['c_mult1']) || 0;
      const synLvl = (state.clickUpgrades && state.clickUpgrades['c_synergy']) || 0;
      const pClickLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_click']) || 0;
      const satCount = (state.generators && state.generators['g4']) || 0;

      let base = 1 + flatLvl * 1;
      base *= 1 + multLvl * 0.15;
      base *= 1 + pClickLvl * 0.25;
      base *= 1 + satCount * 0.05;

      // Multiplicator nativ de Click al Nucleului Activ!
      base *= (curCore.clickMult || 1.0);

      let val = base * getGlobalSharedMultiplier() * getComboMultiplier();

      // Sinergie din producția proprie a nucleului curent (+0.25% din CPS per nivel)
      if (synLvl > 0) {
        val += getCoreCPS(curCore.id) * (synLvl * 0.0025);
      }

      // Buff Furtună de Click-uri (x4)
      if (Date.now() < (activeBuffs.clickStormEnd || 0)) {
        val *= 4;
      }

      // Buff Furtună de Tahioni Superconductivă (+350% Click Power = x4.5)
      if (typeof activeCosmicStorm !== 'undefined' && activeCosmicStorm && activeCosmicStorm.id === 'tachyon_storm') {
        val *= 4.5;
      }

      return Math.max(1, Math.round(val));
    }

    function getCritChance() {
      if (Date.now() < (activeBuffs.crimsonCritEnd || 0)) return 1.0;
      if (typeof activeCosmicStorm !== 'undefined' && activeCosmicStorm && activeCosmicStorm.id === 'tachyon_storm') return 0.95; // Furtună Tahionică: Crituri garantate!
      const curCore = CORES_DATA.find(c => c.id === (state.activeCoreId || 'quantum')) || CORES_DATA[0];
      const cLvl = (state.clickUpgrades && state.clickUpgrades['c_critChance']) || 0;
      const pCritDev = (state.prestigeUpgrades && state.prestigeUpgrades['p_crit_devastator']) || 0;
      const fusionCount = (state.generators && state.generators['g5']) || 0;
      const fusionBonus = Math.min(0.12, fusionCount * 0.004);
      const comboBonus = comboMeter >= 85 ? 0.10 : 0;
      const skillBonus = Date.now() < (activeBuffs.hyperCritEnd || 0) ? 0.40 : 0;

      // Bonus nativ critică în funcție de nucleul activ
      let coreCritBonus = 0;
      if (curCore.id === 'solar') coreCritBonus = 0.08;
      else if (curCore.id === 'void') coreCritBonus = 0.15;
      else if (curCore.id === 'whitehole') coreCritBonus = 0.25;

      return Math.min(0.95, 0.05 + cLvl * 0.02 + fusionBonus + comboBonus + skillBonus + pCritDev * 0.04 + coreCritBonus);
    }

    function getCritMultiplier() {
      const curCore = CORES_DATA.find(c => c.id === (state.activeCoreId || 'quantum')) || CORES_DATA[0];
      const mLvl = (state.clickUpgrades && state.clickUpgrades['c_critMult']) || 0;
      const pCritDev = (state.prestigeUpgrades && state.prestigeUpgrades['p_crit_devastator']) || 0;
      const droneCount = (state.generators && state.generators['g1']) || 0;
      const crimsonMult = Date.now() < (activeBuffs.crimsonCritEnd || 0) ? 1.8 : 1.0;

      let coreCritMultBonus = 0;
      if (curCore.id === 'solar') coreCritMultBonus = 0.5;
      else if (curCore.id === 'void') coreCritMultBonus = 1.5;
      else if (curCore.id === 'whitehole') coreCritMultBonus = 3.0;

      return (2.0 + mLvl * 0.25 + droneCount * 0.04 + pCritDev * 0.50 + coreCritMultBonus) * crimsonMult;
    }

    function getSkillCooldownFactor() {
      const accelCount = (state.generators && state.generators['g8']) || 0; // Accelerator Temporal: -2% CD per unitate (max 45%)
      const ocMasteryLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_overclock_mastery']) || 0;
      const cryoMult = Date.now() < (activeBuffs.cryoCooldownEnd || 0) ? 0.65 : 1.0;
      const masteryMult = 1 - ocMasteryLvl * 0.15;
      return (1 - Math.min(0.45, accelCount * 0.02)) * cryoMult * masteryMult;
    }

    function getAnomalyAndSkillBonusMult() {
      const pAnom = (state.prestigeUpgrades && state.prestigeUpgrades['p_anom']) || 0;
      const bhCount = (state.generators && state.generators['g6']) || 0; // Micro-Gaură Neagră: +6% fiecare
      return (1 + pAnom * 0.25) * (1 + bhCount * 0.06);
    }

    // Costuri Generatoare și Amplificatoare cu reducere din Prestigiu (-4% per nivel) și Sfera Smarald (-35%)
    function getGeneratorDiscount() {
      const discLvl = state.prestigeUpgrades['p_discount'] || 0;
      const orbDisc = Date.now() < (activeBuffs.discountOrbEnd || 0) ? 0.65 : 1.0;
      return Math.pow(0.96, discLvl) * orbDisc;
    }

    function getClickUpgradeCost(upg, lvl) {
      const orbDisc = Date.now() < (activeBuffs.discountOrbEnd || 0) ? 0.65 : 1.0;
      return upg.baseCost * Math.pow(upg.costMult, lvl) * orbDisc;
    }

    function getClickUpgradeBuyInfo(upg, mode) {
      const lvl = state.clickUpgrades[upg.id] || 0;
      const remLevels = Math.max(0, upg.maxLevel - lvl);
      if (remLevels <= 0) {
        return { count: 0, cost: 0, isMax: true };
      }

      const r = upg.costMult;
      const baseCostNext = getClickUpgradeCost(upg, lvl);

      if (mode === 'MAX') {
        if (state.energy < baseCostNext) {
          return { count: 1, cost: baseCostNext, isMax: false };
        }
        if (r === 1) {
          const count = Math.min(remLevels, Math.max(1, Math.floor(state.energy / baseCostNext)));
          return { count, cost: count * baseCostNext, isMax: false };
        }
        const maxN = Math.floor(Math.log((state.energy * (r - 1)) / baseCostNext + 1) / Math.log(r));
        let count = Math.min(remLevels, Math.max(1, maxN));
        let cost = count === 1 ? baseCostNext : baseCostNext * ((Math.pow(r, count) - 1) / (r - 1));
        while (count > 1 && cost > state.energy) {
          count--;
          cost = count === 1 ? baseCostNext : baseCostNext * ((Math.pow(r, count) - 1) / (r - 1));
        }
        return { count, cost, isMax: false };
      } else {
        const desiredCount = Number(mode) || 1;
        const count = Math.min(remLevels, desiredCount);
        if (r === 1) {
          return { count, cost: count * baseCostNext, isMax: false };
        }
        const cost = count === 1 ? baseCostNext : baseCostNext * ((Math.pow(r, count) - 1) / (r - 1));
        return { count, cost, isMax: false };
      }
    }

    function getGeneratorBuyInfo(gen, mode) {
      const owned = state.generators[gen.id] || 0;
      const r = 1.18;
      const base = gen.baseCost * getGeneratorDiscount() * Math.pow(r, owned);

      if (mode === 'MAX') {
        if (state.energy < base) {
          return { count: 1, cost: base };
        }
        const maxN = Math.floor(Math.log((state.energy * (r - 1)) / base + 1) / Math.log(r));
        const count = Math.max(1, maxN);
        const cost = base * ((Math.pow(r, count) - 1) / (r - 1));
        return { count, cost };
      } else {
        const count = Number(mode);
        const cost = base * ((Math.pow(r, count) - 1) / (r - 1));
        return { count, cost };
      }
    }

