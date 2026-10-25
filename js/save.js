    /********************************************************************
     * 11. SALVARE AUTOMATĂ (LOCALSTORAGE) ȘI CALCUL PROGRES OFFLINE
     ********************************************************************/
    function saveGame() {
      state.lastSaved = Date.now();
      state.skillCooldowns = skillCooldowns;
      state.activeBuffs = activeBuffs;
      state.nextStormTimestamp = nextStormTimestamp;
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        if (!navigator.onLine && cloudSession && cloudSession.access_token) {
          setPendingCloudSync(true);
        }
        const dot = document.getElementById('saveDot');
        if (dot) {
          dot.style.transform = 'scale(1.5)';
          setTimeout(() => dot.style.transform = 'scale(1)', 300);
        }
      } catch (e) {}
    }

    function manualSave() {
      saveGame();
      if (cloudSession && cloudSession.access_token) {
        cloudPushSave(true);
      } else {
        showToast('💾 Progresul a fost salvat local!');
      }
    }

    function loadGame() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const def = getDefaultState();

        state = {
          ...def,
          ...parsed,
          cores: parsed.cores ? { ...def.cores, ...parsed.cores } : def.cores,
          prestigeUpgrades: { ...def.prestigeUpgrades, ...(parsed.prestigeUpgrades || {}) },
          dailyLogin: { ...def.dailyLogin, ...(parsed.dailyLogin || {}) },
          dailyQuests: { ...def.dailyQuests, ...(parsed.dailyQuests || {}) },
          social: { ...def.social, ...(parsed.social || {}) },
          skillCooldowns: { ...def.skillCooldowns, ...(parsed.skillCooldowns || {}) },
          activeBuffs: { ...def.activeBuffs, ...(parsed.activeBuffs || {}) }
        };
        state = ensureStateCoreBindings(state);
        ALL_SKILL_TREE_NODES.forEach(n => {
          if (state.prestigeUpgrades[n.id] === undefined) {
            state.prestigeUpgrades[n.id] = 0;
          }
        });
        skillCooldowns = state.skillCooldowns;
        activeBuffs = state.activeBuffs;
        state.equippedCoreSkin = state.activeCoreId || state.equippedCoreSkin || 'quantum';

        if (typeof state.nextStormTimestamp === 'number' && state.nextStormTimestamp > Date.now() + 15000) {
          nextStormTimestamp = state.nextStormTimestamp;
        } else {
          scheduleNextStorm();
        }

        // Curățăm ID-urile vechi de realizări și sincronizăm silențios realizările deja îndeplinite din cele 330
        const validAchIds = new Set(ACHIEVEMENTS_DATA.map(a => a.id));
        state.unlockedAchievements = Array.isArray(state.unlockedAchievements)
          ? state.unlockedAchievements.filter(id => validAchIds.has(id))
          : [];
        for (const ach of ACHIEVEMENTS_DATA) {
          if (!state.unlockedAchievements.includes(ach.id) && ach.check(state)) {
            state.unlockedAchievements.push(ach.id);
          }
        }

        document.getElementById('btnSound').innerText = state.soundEnabled ? '🔊 Sunet: ON' : '🔇 Sunet: OFF';
        // Dacă utilizatorul nu a oprit explicit muzica, o activăm implicit
        if (parsed.musicEnabled === undefined || localStorage.getItem('qn_music_user_choice') !== 'true') {
          state.musicEnabled = true;
        }
        syncMusicUI();
        syncCosmicBgUI();
        if (state.musicEnabled) {
          startCosmicMusic();
          setupAudioUnlockListeners();
        }

        // Rebalansare retroactivă echitabilă a Materiei Întunecate pentru Rebirth-urile deja efectuate
        if (!localStorage.getItem('qn_dm_rebalance_v294')) {
          localStorage.setItem('qn_dm_rebalance_v294', 'true');
          const pCount = state.prestigeCount || 0;
          if (pCount > 0) {
            let targetDmTotal = 0;
            for (let r = 1; r <= pCount; r++) {
              targetDmTotal += Math.max(1, Math.round(r + Math.pow(r, 1.35) * 0.4));
            }
            let oldDmTotal = 0;
            for (let r = 1; r <= pCount; r++) {
              oldDmTotal += 1 + Math.floor((r - 1) / 2);
            }
            const missingDm = Math.max(0, targetDmTotal - oldDmTotal);
            if (missingDm > 0) {
              state.darkMatter = (state.darkMatter || 0) + missingDm;
              setTimeout(() => {
                showToast(`🔮 Rebalansare Rebirth: Ai primit +${missingDm} Materie Întunecată retroactiv pentru cele ${pCount} Singularități stabilizate!`);
              }, 5500);
            }
          }
        }

        // Calcul Progres Offline (plafonat la pragul Rebirth-ului curent ca să nu sară peste Rebirth-uri)
        const now = Date.now();
        const elapsedSec = (now - (state.lastSaved || now)) / 1000;
        const currentCps = getCPS();
        if (elapsedSec > 8 && currentCps > 0) {
          const cappedSec = Math.min(elapsedSec, 86400 * 2); // Maxim 48h offline
          const effLvl = state.prestigeUpgrades['p_offline'] || 0;
          const efficiency = Math.min(0.80, 0.40 + effLvl * 0.08);
          const rawOffline = currentCps * cappedSec * efficiency;
          const maxRunCap = Math.max(0, getRebirthEnergyRequirement() * 1.25 - (state.energy || 0));
          const offlineEarned = Math.min(rawOffline, Math.max(currentCps * 60, maxRunCap));

          if (offlineEarned >= 1) {
            addEnergy(offlineEarned);
            document.getElementById('offlineTimeText').innerText = formatTime(cappedSec);
            document.getElementById('offlineEffText').innerText = `${Math.round(efficiency * 100)}%`;
            document.getElementById('offlineRewardText').innerText = `+${formatNumber(offlineEarned)} ⚡`;
            document.getElementById('offlineModal').classList.add('open');
          }
        }
        initDailySystem();
      } catch (e) {
        console.error('Eroare la încărcarea salvării:', e);
      }
    }

    function closeOfflineModal() {
      document.getElementById('offlineModal').classList.remove('open');
      playTone(640, 'triangle', 0.14, 0.1);
      updateUI();
    }

    async function confirmReset() {
      if (!confirm('⚠️ Ești sigur că vrei să ștergi definitiv tot progresul (atât Local, cât și din Cloud și Clasament)?\n\nAceastă acțiune va reseta jocul complet la zero și este ireversibilă!')) {
        return;
      }

      showToast('⏳ Se resetează progresul local și din Cloud...');

      // 1. Curățăm localStorage și setăm flag-ul de resetare
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(PENDING_SYNC_KEY);
      localStorage.setItem('qn_pending_cloud_wipe', 'true');

      // 2. Resetăm starea jocului la valorile implicite de pornire
      state = getDefaultState();
      skillCooldowns = state.skillCooldowns;
      activeBuffs = state.activeBuffs;
      comboMeter = 0;
      saveGame();

      // 3. Ștergem datele din Google Firebase dacă există sesiune activă
      if (typeof cloudWipeRemoteData === 'function' && isFirebaseConfigured() && cloudSession) {
        if (navigator.onLine) {
          await cloudWipeRemoteData();
        } else {
          showToast('⚠️ Resetat local! Salvarea din Cloud va fi ștearsă automat la reconectare.');
        }
      }

      initDailySystem();
      renderAll();
      renderStats();
      if (typeof renderLeaderboardTab === 'function') {
        renderLeaderboardTab();
      }
      showToast('🗑️ Tot progresul a fost șters definitiv (Local & Cloud)!');
    }

