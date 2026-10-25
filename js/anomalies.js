    /********************************************************************
     * 8. EVENIMENTE ALEATORII: SISTEM CINEMATIC DE COMETE & ANOMALII CELESTE
     *    - Traiectorii balistice diagonale reale (din colț în colț)
     *    - Corp aerodinamic cu orientare fizică unghiulară (arc de șoc, cap incandescent, coadă dublă)
     *    - Dâră de particule stelare emise dinamic pe ecran (stardust trail)
     *    - Detonație cosmică la click cu inel de șoc și fragmente radiale
     ********************************************************************/
    function getAnomalyBuffDuration(baseSec) {
      const stormLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_prismatic_storm']) || 0;
      return baseSec * (stormLvl > 0 ? 2.0 : 1.0) * 1000;
    }

    /********************************************************************
     * SINTETIZATOARE AUDIO DEDICATE (WEB AUDIO API) PENTRU CELESTE
     * Fiecare dintre cele 8 anomalii are propriul său timbru acustic unic!
     ********************************************************************/
    function playMechanicalClankSound(hitsLeft) {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(hitsLeft === 2 ? 340 : 480, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(hitsLeft === 2 ? 1200 : 1600, now);
        filter.Q.setValueAtTime(4, now);
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
        playSyntheticChimeTone(hitsLeft === 2 ? 880 : 1320, now + 0.02, 0.09, 0.12, 'square');
      } catch (e) {}
    }

    function playRobotExplosionSound() {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        playSyntheticChimeTone(90, now, 0.45, 0.28, 'sawtooth');
        playSyntheticChimeTone(65, now + 0.05, 0.55, 0.32, 'sine');
        playSyntheticChimeTone(1760, now + 0.04, 0.12, 0.15, 'square');
        playSyntheticChimeTone(1174, now + 0.09, 0.15, 0.16, 'sawtooth');
        playSyntheticChimeTone(2349, now + 0.14, 0.22, 0.14, 'square');
        playSyntheticChimeTone(880, now + 0.20, 0.35, 0.18, 'triangle');
      } catch (e) {}
    }

    function playIceShatterSound() {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        const crackFrequencies = [2093, 2793, 3520, 4186, 5587];
        crackFrequencies.forEach((freq, idx) => {
          const delay = idx * 0.012;
          const dur = 0.18 + Math.random() * 0.15;
          const vol = 0.12 - idx * 0.018;
          playSyntheticChimeTone(freq, now + delay, dur, vol, 'sine');
          playSyntheticChimeTone(freq * 0.75, now + delay + 0.005, dur * 0.8, vol * 0.7, 'triangle');
        });
        playSyntheticChimeTone(1046.5, now + 0.06, 0.55, 0.15, 'sine');
        playSyntheticChimeTone(1318.5, now + 0.10, 0.60, 0.12, 'sine');
      } catch (e) {}
    }

    function playFireCometSound() {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        playSyntheticChimeTone(85, now, 0.50, 0.35, 'sine');
        playSyntheticChimeTone(130, now + 0.03, 0.40, 0.25, 'sawtooth');
        playSyntheticChimeTone(440, now + 0.05, 0.25, 0.15, 'triangle');
        playSyntheticChimeTone(660, now + 0.10, 0.35, 0.18, 'triangle');
        playSyntheticChimeTone(990, now + 0.16, 0.45, 0.16, 'sine');
      } catch (e) {}
    }

    function playThunderSparkSound() {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1450, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.22);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
        playSyntheticChimeTone(110, now + 0.08, 0.45, 0.25, 'sine');
        playSyntheticChimeTone(880, now + 0.02, 0.12, 0.15, 'square');
      } catch (e) {}
    }

    function playSniperLaserSound() {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2600, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.18);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.21);
        playSyntheticChimeTone(1760, now + 0.05, 0.15, 0.14, 'square');
        playSyntheticChimeTone(3520, now + 0.10, 0.25, 0.12, 'sine');
      } catch (e) {}
    }

    function playEmeraldChimeSound() {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        const emeraldPitches = [587.33, 739.99, 880.00, 1174.66, 1479.98];
        emeraldPitches.forEach((pitch, i) => {
          playSyntheticChimeTone(pitch, now + i * 0.045, 0.55 + i * 0.08, 0.16, 'triangle');
          playSyntheticChimeTone(pitch * 2, now + i * 0.045 + 0.01, 0.40, 0.06, 'sine');
        });
      } catch (e) {}
    }

    function playVoidImplosionSound() {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.28);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.33);
        playSyntheticChimeTone(55, now + 0.25, 0.65, 0.38, 'sine');
        playSyntheticChimeTone(1320, now + 0.27, 0.35, 0.12, 'sawtooth');
      } catch (e) {}
    }

    function playPrismaticFanfareSound() {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        const fanfare = [
          { f: 523.25, d: 0.00 },
          { f: 659.25, d: 0.04 },
          { f: 783.99, d: 0.08 },
          { f: 1046.5, d: 0.12 },
          { f: 1318.5, d: 0.16 },
          { f: 1567.9, d: 0.20 },
          { f: 2093.0, d: 0.25 }
        ];
        fanfare.forEach(note => {
          playSyntheticChimeTone(note.f, now + note.d, 0.50, 0.14, 'triangle');
          playSyntheticChimeTone(note.f * 1.5, now + note.d + 0.02, 0.35, 0.05, 'sine');
        });
        playSyntheticChimeTone(130.81, now, 0.6, 0.25, 'sine');
      } catch (e) {}
    }

    const ANOMALY_ORB_TYPES = [
      {
        id: 'solar',
        model: 'comet',
        cssClass: 'anomaly-fire-comet',
        icon: '☀️',
        tag: 'FRENEZIE x2.5',
        color: '#f59e0b',
        tailColor: '#ea580c',
        ionColor: '#fde047',
        glowColor: 'rgba(245, 158, 11, 0.85)',
        shockColor: '#fef08a',
        name: '☀️ Cometa Solară de Foc',
        soundFn: playFireCometSound,
        hitsRequired: 1,
        applyBuff: (cx, cy, mult) => {
          activeBuffs.frenzyEnd = Date.now() + getAnomalyBuffDuration(22);
          showToast('☀️ COMETĂ SOLARĂ CAPTURATĂ! Producție x2.5 activată!');
          spawnFloatingText(cx, cy, '☀️ x2.5 FRENEZIE SOLARĂ', true);
        }
      },
      {
        id: 'storm',
        model: 'storm',
        cssClass: 'anomaly-tachyon-storm',
        icon: '⚡',
        tag: 'CLICK x4',
        color: '#38bdf8',
        tailColor: '#0284c7',
        ionColor: '#7dd3fc',
        glowColor: 'rgba(56, 189, 248, 0.85)',
        shockColor: '#bae6fd',
        name: '⚡ Furtuna de Tahioni',
        soundFn: playThunderSparkSound,
        hitsRequired: 1,
        applyBuff: (cx, cy, mult) => {
          activeBuffs.clickStormEnd = Date.now() + getAnomalyBuffDuration(16);
          showToast('⚡ FURTUNĂ DE TAHIONI! Putere Click x4 activată!');
          spawnFloatingText(cx, cy, '⚡ x4 TACHYON STORM', true);
        }
      },
      {
        id: 'crimson',
        model: 'sniper',
        cssClass: 'anomaly-sniper-drone',
        icon: '🎯',
        tag: '100% CRIT',
        color: '#f43f5e',
        tailColor: '#e11d48',
        ionColor: '#fb7185',
        glowColor: 'rgba(244, 63, 94, 0.85)',
        shockColor: '#fda4af',
        name: '🎯 Satelitul Sniper Crimson',
        soundFn: playSniperLaserSound,
        hitsRequired: 1,
        applyBuff: (cx, cy, mult) => {
          activeBuffs.crimsonCritEnd = Date.now() + getAnomalyBuffDuration(14);
          showToast('🎯 SATELIT SNIPER! 100% Șansă Critică + Daune Critice x1.8!');
          spawnFloatingText(cx, cy, '🎯 100% CRIT + DMG', true);
        }
      },
      {
        id: 'emerald',
        model: 'emerald',
        cssClass: 'anomaly-emerald-crystal',
        icon: '🍀',
        tag: '-35% COSTURI',
        color: '#10b981',
        tailColor: '#059669',
        ionColor: '#34d399',
        glowColor: 'rgba(16, 185, 129, 0.85)',
        shockColor: '#a7f3d0',
        name: '🍀 Geoda de Smarald Astral',
        soundFn: playEmeraldChimeSound,
        hitsRequired: 1,
        applyBuff: (cx, cy, mult) => {
          activeBuffs.discountOrbEnd = Date.now() + getAnomalyBuffDuration(25);
          renderClickUpgrades();
          renderGenerators();
          showToast('🍀 GEODĂ DE SMARALD! Toate Generatoarele & Tehnologiile au -35% Cost!');
          spawnFloatingText(cx, cy, '🍀 -35% COSTURI FLOTĂ', true);
        }
      },
      {
        id: 'mecha',
        model: 'mecha',
        cssClass: 'anomaly-mecha-drone',
        icon: '🤖',
        tag: 'TURBO FLOTĂ',
        color: '#a855f7',
        tailColor: '#9333ea',
        ionColor: '#c084fc',
        glowColor: 'rgba(168, 85, 247, 0.85)',
        shockColor: '#e9d5ff',
        name: '🤖 Drona Mecha de Vid',
        soundFn: playRobotExplosionSound,
        hitsRequired: 3,
        applyBuff: (cx, cy, mult) => {
          activeBuffs.overdriveOrbEnd = Date.now() + getAnomalyBuffDuration(18);
          comboMeter = 100;
          lastComboClickTime = performance.now();
          showToast('🤖 DRONĂ MECHA DISTRUSĂ! Auto-Cursoare x3.5 viteză, Overclock 100% & +40% Producție!');
          spawnFloatingText(cx, cy, '🤖 TURBO FLOTĂ & 100% OVERCLOCK', true);
        }
      },
      {
        id: 'cryo',
        model: 'snowflake',
        cssClass: 'anomaly-ice-snowflake',
        icon: '❄️',
        tag: 'RESET ABILITĂȚI',
        color: '#7dd3fc',
        tailColor: '#0284c7',
        ionColor: '#bae6fd',
        glowColor: 'rgba(125, 211, 252, 0.85)',
        shockColor: '#e0f2fe',
        name: '❄️ Fulgul Cuantic Glaciar Sub-Zero',
        soundFn: playIceShatterSound,
        hitsRequired: 1,
        applyBuff: (cx, cy, mult) => {
          skillCooldowns[1] = 0;
          skillCooldowns[2] = 0;
          skillCooldowns[3] = 0;
          activeBuffs.cryoCooldownEnd = Date.now() + getAnomalyBuffDuration(20);
          showToast('❄️ FULG GLACIAR SPART! Toate cele 3 Abilități Active au fost reîncărcate INSTANT!');
          spawnFloatingText(cx, cy, '❄️ ABILITĂȚI REÎNCĂRCATE INSTANT!', true);
        }
      },
      {
        id: 'antimatter',
        model: 'vortex',
        cssClass: 'anomaly-void-vortex',
        icon: '🌌',
        tag: 'PLOAIE METEORIȚI',
        color: '#ec4899',
        tailColor: '#be185d',
        ionColor: '#f472b6',
        glowColor: 'rgba(236, 72, 153, 0.9)',
        shockColor: '#38bdf8',
        name: '🌌 Gaura Neagră de Antimaterie',
        soundFn: playVoidImplosionSound,
        hitsRequired: 1,
        applyBuff: (cx, cy, mult) => {
          showToast('🌌 GAURĂ NEAGRĂ ACTIVATĂ! 12 Meteoriți Cuantici bombardează Nucleul!');
          spawnFloatingText(cx, cy, '🌌 BOMBARDAMENT ANTIMATERIE!', true);
          for (let m = 0; m < 12; m++) {
            setTimeout(() => {
              const hitVal = Math.max(25, (getCPS() * 2.2 + getClickValue() * 2) * mult);
              addEnergy(hitVal);
              spawnActivationOrbToCore(null, m % 2 === 0 ? '#ec4899' : '#38bdf8');
              const center = getCoreCenter();
              if (center.width > 0) {
                spawnFloatingText(
                  center.x + (Math.random() - 0.5) * 70,
                  center.y + (Math.random() - 0.5) * 50,
                  `☄️ +${formatNumber(hitVal)}`,
                  true
                );
              }
            }, m * 280);
          }
        }
      },
      {
        id: 'prismatic',
        model: 'prismatic',
        cssClass: 'anomaly-prismatic-star',
        icon: '💎',
        tag: 'MEGA JACKPOT',
        color: '#fde047',
        tailColor: '#a855f7',
        ionColor: '#38bdf8',
        glowColor: 'rgba(253, 224, 71, 0.9)',
        shockColor: '#ffffff',
        name: '💎 Steaua Prismatică Astrală',
        soundFn: playPrismaticFanfareSound,
        hitsRequired: 1,
        applyBuff: (cx, cy, mult) => {
          const jackpot = Math.max(200, (getCPS() * 28 + getClickValue() * 18) * mult);
          addEnergy(jackpot);
          activeBuffs.frenzyEnd = Math.max(activeBuffs.frenzyEnd || 0, Date.now() + 12000);
          comboMeter = 100;
          lastComboClickTime = performance.now();
          showToast(`💎 JACKPOT PRISMATIC! +${formatNumber(jackpot)} ⚡ + Frenezie & Overclock 100%!`);
          spawnFloatingText(cx, cy, `💎 +${formatNumber(jackpot)} ⚡`, true);
        }
      }
    ];

    function playCometCaptureSound(color) {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        playSyntheticChimeTone(110, now, 0.38, 0.22, 'sine');
        playSyntheticChimeTone(659.25, now + 0.04, 0.45, 0.12, 'triangle');
        playSyntheticChimeTone(880.00, now + 0.09, 0.55, 0.14, 'triangle');
        playSyntheticChimeTone(1318.51, now + 0.14, 0.65, 0.15, 'sine');
        playSyntheticChimeTone(1760.00, now + 0.20, 0.90, 0.16, 'triangle');
      } catch (e) {}
    }

    function spawnCometTrailSpark(x, y, orbType, angleRad) {
      const spark = document.createElement('div');
      spark.className = 'comet-trail-spark';
      const size = 2 + Math.random() * 4.5;
      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      const colors = ['#ffffff', orbType.color, orbType.ionColor, orbType.tailColor];
      const col = colors[Math.floor(Math.random() * colors.length)];
      spark.style.background = col;
      spark.style.boxShadow = `0 0 10px ${col}`;
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      document.body.appendChild(spark);

      // Particulele sunt proiectate în spate, opus unghiului de zbor
      const driftAngle = angleRad + Math.PI + (Math.random() - 0.5) * 0.45;
      const dist = 26 + Math.random() * 60;
      const tx = Math.cos(driftAngle) * dist;
      const ty = Math.sin(driftAngle) * dist;

      spark.animate([
        { transform: 'translate(-50%, -50%) scale(1.3)', opacity: 0.95 },
        { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.15)`, opacity: 0 }
      ], {
        duration: 450 + Math.random() * 280,
        easing: 'ease-out'
      }).onfinish = () => spark.remove();
    }

    function spawnMechaSpark(x, y) {
      for (let i = 0; i < 9; i++) {
        const sp = document.createElement('div');
        sp.className = 'comet-trail-spark';
        const sz = 3 + Math.random() * 3.5;
        sp.style.width = `${sz}px`;
        sp.style.height = `${sz}px`;
        const col = Math.random() < 0.6 ? '#c084fc' : (Math.random() < 0.5 ? '#38bdf8' : '#ffffff');
        sp.style.background = col;
        sp.style.boxShadow = `0 0 10px ${col}`;
        sp.style.left = `${x}px`;
        sp.style.top = `${y}px`;
        document.body.appendChild(sp);

        const ang = Math.random() * Math.PI * 2;
        const d = 18 + Math.random() * 42;
        sp.animate([
          { transform: 'translate(-50%, -50%) scale(1.4)', opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(ang) * d}px), calc(-50% + ${Math.sin(ang) * d}px)) scale(0.1)`, opacity: 0 }
        ], {
          duration: 250 + Math.random() * 150,
          easing: 'ease-out'
        }).onfinish = () => sp.remove();
      }
    }

    function explodeAnomaly(x, y, orbType) {
      // 1. Inel de șoc masiv cu expansiune radială
      const shock = document.createElement('div');
      shock.className = 'comet-shockwave-ring';
      shock.style.left = `${x}px`;
      shock.style.top = `${y}px`;
      shock.style.width = '36px';
      shock.style.height = '36px';
      shock.style.borderColor = orbType.shockColor || '#ffffff';
      shock.style.boxShadow = `0 0 42px ${orbType.color}`;
      document.body.appendChild(shock);

      shock.animate([
        { width: '36px', height: '36px', opacity: 1, borderWidth: '4px' },
        { width: '420px', height: '420px', opacity: 0, borderWidth: '0.5px' }
      ], {
        duration: 540,
        easing: 'cubic-bezier(0.12, 0.9, 0.25, 1)'
      }).onfinish = () => shock.remove();

      // 2. Particule specifice dedicate fiecărui model (gheață spartă, scântei cibernetice, curcubeu etc.)
      const sparkCount = orbType.model === 'snowflake' ? 44 : 36;
      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div');
        spark.className = 'comet-trail-spark';
        const size = 3 + Math.random() * 6.5;
        spark.style.width = `${size}px`;
        spark.style.height = `${size}px`;

        let col = orbType.color;
        if (orbType.model === 'snowflake') {
          const iceCols = ['#ffffff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8'];
          col = iceCols[Math.floor(Math.random() * iceCols.length)];
          spark.style.borderRadius = Math.random() < 0.65 ? '1px' : '50%'; // Așchii ascuțite de cristal
        } else if (orbType.model === 'mecha') {
          const mechaCols = ['#ffffff', '#a855f7', '#c084fc', '#38bdf8', '#f43f5e'];
          col = mechaCols[Math.floor(Math.random() * mechaCols.length)];
        } else if (orbType.model === 'prismatic') {
          const rainbow = ['#f43f5e', '#f59e0b', '#fde047', '#10b981', '#38bdf8', '#a855f7', '#ffffff'];
          col = rainbow[Math.floor(Math.random() * rainbow.length)];
        } else {
          col = Math.random() < 0.4 ? '#ffffff' : orbType.color;
        }

        spark.style.background = col;
        spark.style.boxShadow = `0 0 14px ${col}`;
        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;
        document.body.appendChild(spark);

        const angle = Math.random() * Math.PI * 2;
        const dist = 50 + Math.random() * 140;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;

        spark.animate([
          { transform: 'translate(-50%, -50%) scale(1.6)', opacity: 1 },
          { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
        ], {
          duration: 420 + Math.random() * 320,
          easing: 'cubic-bezier(0.15, 0.9, 0.3, 1)'
        }).onfinish = () => spark.remove();
      }

      // 3. Declanșare sunet dedicat sintetizat
      if (typeof orbType.soundFn === 'function') {
        orbType.soundFn();
      } else {
        playCometCaptureSound(orbType.color);
      }
    }

    function explodeComet(x, y, orbType) {
      explodeAnomaly(x, y, orbType);
    }

    function renderAnomalyModelHTML(orbType, angleDeg) {
      let modelHTML = '';
      if (orbType.model === 'mecha') {
        modelHTML = `
          <div class="anomaly-mecha-drone" id="anomalyMechaRoot">
            <div class="mecha-hp-bar">
              <div class="mecha-hp-fill" id="mechaHpFill" style="width: 100%;"></div>
              <span class="mecha-hp-text" id="mechaHpText">3 / 3 LOVITURI</span>
            </div>
            <div class="mecha-antennae">
              <div class="mecha-ant"></div>
              <div class="mecha-ant"></div>
            </div>
            <div class="mecha-chassis">
              <div class="mecha-visor">
                <div class="mecha-scanline"></div>
              </div>
              <div class="mecha-core-reactor"></div>
            </div>
            <div class="mecha-thrusters">
              <div class="thruster-plume"></div>
              <div class="thruster-plume"></div>
            </div>
          </div>
        `;
      } else if (orbType.model === 'snowflake') {
        modelHTML = `
          <div class="anomaly-ice-snowflake">
            <div class="snowflake-frost-aura"></div>
            <div class="snowflake-branch branch-0"></div>
            <div class="snowflake-branch branch-1"></div>
            <div class="snowflake-branch branch-2"></div>
            <div class="snowflake-sub-crystal"></div>
            <div class="snowflake-sub-crystal sub-outer"></div>
          </div>
        `;
      } else if (orbType.model === 'storm') {
        modelHTML = `
          <div class="anomaly-tachyon-storm">
            <div class="tachyon-core-orb"></div>
            <div class="tachyon-lightning arc-1"></div>
            <div class="tachyon-lightning arc-2"></div>
            <div class="tachyon-lightning arc-3"></div>
          </div>
        `;
      } else if (orbType.model === 'sniper') {
        modelHTML = `
          <div class="anomaly-sniper-drone">
            <div class="sniper-reticle-ring"></div>
            <div class="sniper-laser-line"></div>
            <div class="sniper-chassis"></div>
          </div>
        `;
      } else if (orbType.model === 'emerald') {
        modelHTML = `
          <div class="anomaly-emerald-crystal">
            <div class="crystal-ring-orbit"></div>
            <div class="crystal-gem-shape"></div>
          </div>
        `;
      } else if (orbType.model === 'vortex') {
        modelHTML = `
          <div class="anomaly-void-vortex">
            <div class="vortex-accretion-disk"></div>
            <div class="vortex-event-horizon"></div>
          </div>
        `;
      } else if (orbType.model === 'prismatic') {
        modelHTML = `
          <div class="anomaly-prismatic-star">
            <div class="prismatic-beam-h"></div>
            <div class="prismatic-beam-v"></div>
            <div class="prismatic-diamond-core"></div>
          </div>
        `;
      } else {
        // Comet (☀️ Cometa Solară de Foc sau default cu zbor balistic orientat)
        modelHTML = `
          <div class="anomaly-fire-comet" style="transform: rotate(${angleDeg.toFixed(1)}deg);">
            <div class="comet-bow-wave"></div>
            <div class="comet-coma-halo"></div>
            <div class="comet-tail-main"></div>
            <div class="comet-tail-ion"></div>
            <div class="comet-head-nucleus">
              <div class="comet-head-hotspot"></div>
            </div>
          </div>
        `;
      }

      return `
        ${modelHTML}
        <div class="anomaly-hud-label">
          <span class="anomaly-hud-dot" style="background:${orbType.color}; box-shadow:0 0 8px ${orbType.color};"></span>
          <span>${orbType.name}</span>
          <span class="anomaly-hud-tag">${orbType.tag}</span>
        </div>
      `;
    }

    function spawnQuantumAnomaly(manual = false) {
      if (document.querySelector('.quantum-anomaly')) return;

      const orbType = ANOMALY_ORB_TYPES[Math.floor(Math.random() * ANOMALY_ORB_TYPES.length)];

      const w = window.innerWidth;
      const h = window.innerHeight;
      const trajectoryMode = Math.floor(Math.random() * 4);
      let startX, startY, endX, endY;

      if (trajectoryMode === 0) {
        // Colț Stânga-Sus -> Colț Dreapta-Jos
        startX = -150;
        startY = -60 + Math.random() * (h * 0.25);
        endX = w + 160;
        endY = h * 0.70 + Math.random() * (h * 0.30);
      } else if (trajectoryMode === 1) {
        // Colț Dreapta-Sus -> Colț Stânga-Jos
        startX = w + 150;
        startY = -60 + Math.random() * (h * 0.25);
        endX = -160;
        endY = h * 0.70 + Math.random() * (h * 0.30);
      } else if (trajectoryMode === 2) {
        // Parcurs Diagonal Înalt Stânga -> Dreapta
        startX = -150;
        startY = h * 0.12 + Math.random() * (h * 0.25);
        endX = w + 160;
        endY = h * 0.65 + Math.random() * (h * 0.30);
      } else {
        // Parcurs Diagonal Înalt Dreapta -> Stânga
        startX = w + 150;
        startY = h * 0.12 + Math.random() * (h * 0.25);
        endX = -160;
        endY = h * 0.65 + Math.random() * (h * 0.30);
      }

      const dx = endX - startX;
      const dy = endY - startY;
      const angleRad = Math.atan2(dy, dx);
      const angleDeg = angleRad * (180 / Math.PI);

      const temporalLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_temporal_orbit']) || 0;
      const sizeMult = 1 + temporalLvl * 0.25;

      const el = document.createElement('div');
      el.className = 'quantum-anomaly';
      el.title = `${orbType.name} — Interceptează anomalia (${orbType.tag})!`;
      el.style.transform = `scale(${sizeMult.toFixed(2)})`;

      el.innerHTML = renderAnomalyModelHTML(orbType, angleDeg);

      el.style.left = `${startX}px`;
      el.style.top = `${startY}px`;
      document.body.appendChild(el);

      if (!manual) {
        showToast(`☄️ ${orbType.name} [${orbType.tag}] a apărut! Intercepteaz-o!`);
      }
      playTone(920, 'sine', 0.15, 0.08);

      const animDuration = Math.round(11500 * (1 + temporalLvl * 0.40));
      const anim = el.animate([
        { left: `${startX}px`, top: `${startY}px` },
        { left: `${endX}px`, top: `${endY}px` }
      ], {
        duration: animDuration,
        easing: 'linear'
      });

      // Dâră luminoasă continuă de particule stelare emise din nucleul anomaliei
      const trailTimer = setInterval(() => {
        if (!el.isConnected) {
          clearInterval(trailTimer);
          return;
        }
        const rect = el.getBoundingClientRect();
        const coreX = orbType.model === 'comet' ? rect.left + 225 : (rect.left + rect.width / 2);
        const coreY = orbType.model === 'comet' ? rect.top + 40 : (rect.top + rect.height / 2);
        if (coreX > -80 && coreX < window.innerWidth + 80 && coreY > -80 && coreY < window.innerHeight + 80) {
          spawnCometTrailSpark(coreX, coreY, orbType, angleRad);
        }
      }, 45);

      let hitsRemaining = orbType.hitsRequired || 1;

      el.addEventListener('pointerdown', (e) => {
        e.stopPropagation();

        // Mecanică interactivă multi-hit pentru Robotul Mecha Spațial
        if (hitsRemaining > 1) {
          hitsRemaining--;
          const hpPercent = Math.round((hitsRemaining / orbType.hitsRequired) * 100);
          const hpFill = el.querySelector('#mechaHpFill');
          const hpText = el.querySelector('#mechaHpText');
          const mechaRoot = el.querySelector('#anomalyMechaRoot');

          if (hpFill) hpFill.style.width = `${hpPercent}%`;
          if (hpText) hpText.textContent = `${hitsRemaining} / ${orbType.hitsRequired} LOVITURI`;

          if (mechaRoot) {
            mechaRoot.classList.remove('mecha-recoil');
            requestAnimationFrame(() => {
              if (mechaRoot) mechaRoot.classList.add('mecha-recoil');
            });
          }

          playMechanicalClankSound(hitsRemaining);
          spawnMechaSpark(e.clientX, e.clientY);
          spawnFloatingText(e.clientX, e.clientY - 20, `🤖 LOVITURĂ! (${hitsRemaining} RĂMASE)`, true);
          return;
        }

        // Lovitură finală sau interceptare instantanee (pentru restul de 7 anomalii)
        clearInterval(trailTimer);
        state.anomaliesCaught++;
        updateDailyQuestProgress('spheres', 1);

        explodeAnomaly(e.clientX, e.clientY, orbType);
        spawnActivationOrbToCore(null, orbType.color);

        const anomBonusMult = getAnomalyAndSkillBonusMult();
        orbType.applyBuff(e.clientX, e.clientY, anomBonusMult);

        // Keystone Anomalii: Furtună Prismatică Astrală (Șansă de +1 🔮 Materie Întunecată)
        const stormLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_prismatic_storm']) || 0;
        if (stormLvl > 0 && Math.random() < 0.25) {
          state.darkMatter = (state.darkMatter || 0) + 1;
          spawnFloatingText(e.clientX, e.clientY - 42, '🔮 +1 MATERIE ÎNTUNECATĂ RARĂ!', true);
          playXboxAchievementChime('mythic');
        }

        // Talent: Extractor de Tahioni (p_anomaly_extractor)
        const extLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_anomaly_extractor']) || 0;
        if (extLvl > 0) {
          const bonusSec = 45 + (extLvl - 1) * 25;
          const extGain = Math.round(getCPS() * bonusSec);
          if (extGain > 0) {
            addEnergy(extGain);
            spawnFloatingText(e.clientX, e.clientY - 26, `💎 TAHIONI +${formatNumber(extGain)}`, true);
          }
        }

        // Talent: Dublură Cuantică (p_twin_anomaly)
        const twinLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_twin_anomaly']) || 0;
        if (twinLvl > 0 && Math.random() < twinLvl * 0.18) {
          setTimeout(() => spawnQuantumAnomaly(true), 650);
          showToast('✨ O a doua anomalie a apărut pe cer!');
        }

        state.skillCooldowns = skillCooldowns;
        state.activeBuffs = activeBuffs;
        saveGame();

        anim.cancel();
        el.remove();
        checkAchievements();
        updateUI();
      });

      anim.onfinish = () => {
        clearInterval(trailTimer);
        // Talent: Magnet Ceresc Automat (p_celestial_magnet)
        const magLvl = (state.prestigeUpgrades && state.prestigeUpgrades['p_celestial_magnet']) || 0;
        if (magLvl > 0 && Math.random() < (magLvl * 0.25)) {
          state.anomaliesCaught++;
          updateDailyQuestProgress('spheres', 1);
          const anomBonusMult = getAnomalyAndSkillBonusMult();
          orbType.applyBuff(window.innerWidth / 2, window.innerHeight / 2, anomBonusMult);
          showToast(`🛰️ Magnet Ceresc: ${orbType.name} a fost interceptată și colectată automat!`);
          spawnCoreShockwave('em-wave');
          playTone(880, 'sine', 0.15, 0.08);
        }
        if (el.parentNode) el.remove();
      };
    }

