    /********************************************************************
     * 2. STAREA JOCULUI (GAME STATE)
     ********************************************************************/
    const SAVE_KEY = 'QUANTUM_NEXUS_SAVE_V2';

    /********************************************************************
     * 2.1. OMNIVERSUL MULTI-NUCLEE PARALELE (PARALLEL MULTI-CORE SYSTEM)
     ********************************************************************/
    const CORES_DATA = [
      {
        id: 'quantum',
        name: 'Nucleu Cuantic Alfa',
        shortName: 'Cuantic Alfa',
        icon: '⚛️',
        color: '#38bdf8',
        glowColor: 'rgba(56, 189, 248, 0.45)',
        reqRebirth: 0,
        cpsMult: 1.0,
        clickMult: 1.0,
        desc: 'Aspectul clasic de fuziune temporală. Baza rețelei cuantice cu producție stabilă.',
        perk: '⚡ Producție Echilibrată Cuantică'
      },
      {
        id: 'solar',
        name: 'Nucleu de Plasmă Solară',
        shortName: 'Plasmă Solară',
        icon: '☀️',
        color: '#f59e0b',
        glowColor: 'rgba(245, 158, 11, 0.65)',
        reqRebirth: 10, // Deblocat la Rebirth 10 exact conform cerinței utilizatorului
        cpsMult: 2.0,
        clickMult: 1.5,
        desc: 'Fuziune de stea supergigantă cu coroană de flăcări aurii și protuberanțe magmatice incandescente.',
        perk: '🔥 2.0x Producție Pasivă & 1.5x Click'
      },
      {
        id: 'tesseract',
        name: 'Tesseract 4D Hiper-Cibernetic',
        shortName: 'Tesseract 4D',
        icon: '🧊',
        color: '#06b6d4',
        glowColor: 'rgba(6, 182, 212, 0.6)',
        reqRebirth: 25,
        cpsMult: 4.0,
        clickMult: 2.5,
        desc: 'Hipercub cvadridimensional transparent ce pliază spațiul pentru producție cvadruplă.',
        perk: '🌀 4.0x Producție Pasivă & 2.5x Click'
      },
      {
        id: 'void',
        name: 'Singularitate Abisală Void',
        shortName: 'Abisal Void',
        icon: '🩸',
        color: '#e11d48',
        glowColor: 'rgba(225, 29, 72, 0.7)',
        reqRebirth: 50,
        cpsMult: 10.0,
        clickMult: 5.0,
        desc: 'Singularitate demonică întunecată ce devorează materia și multiplică exponențial energia.',
        perk: '🩸 10.0x Producție Pasivă & 5.0x Click'
      },
      {
        id: 'whitehole',
        name: 'Gaură Albă Superluminoasă',
        shortName: 'Gaură Albă',
        icon: '✨',
        color: '#ffffff',
        glowColor: 'rgba(255, 255, 255, 0.85)',
        reqRebirth: 100,
        cpsMult: 25.0,
        clickMult: 12.0,
        desc: 'Lumină pură superluminică cu 8 raze prismatice. Punctul culminant al Omniversului.',
        perk: '✨ 25.0x Producție Pasivă & 12.0x Click'
      }
    ];

    function createEmptyCoreData() {
      const clickLvls = {};
      CLICK_UPGRADES_DATA.forEach(u => clickLvls[u.id] = 0);
      const genCounts = {};
      GENERATORS_DATA.forEach(g => genCounts[g.id] = 0);
      return {
        clickUpgrades: clickLvls,
        generators: genCounts
      };
    }

    function isCoreUnlocked(coreId) {
      const core = CORES_DATA.find(c => c.id === coreId);
      if (!core) return false;
      return (state.prestigeCount || 0) >= core.reqRebirth;
    }

    function ensureStateCoreBindings(s) {
      if (!s) return s;
      if (!s.cores || typeof s.cores !== 'object') {
        s.cores = {};
      }
      if (!s.activeCoreId) s.activeCoreId = 'quantum';

      const rawOldGens = s.generators && typeof s.generators === 'object' && !Array.isArray(s.generators) ? s.generators : null;
      const rawOldUps = s.clickUpgrades && typeof s.clickUpgrades === 'object' && !Array.isArray(s.clickUpgrades) ? s.clickUpgrades : null;

      CORES_DATA.forEach(c => {
        if (!s.cores[c.id]) s.cores[c.id] = createEmptyCoreData();
        if (!s.cores[c.id].generators) s.cores[c.id].generators = {};
        if (!s.cores[c.id].clickUpgrades) s.cores[c.id].clickUpgrades = {};

        GENERATORS_DATA.forEach(g => {
          if (s.cores[c.id].generators[g.id] === undefined) s.cores[c.id].generators[g.id] = 0;
        });
        CLICK_UPGRADES_DATA.forEach(u => {
          if (s.cores[c.id].clickUpgrades[u.id] === undefined) s.cores[c.id].clickUpgrades[u.id] = 0;
        });
      });

      // Migrare date vechi din salvare în nucleul Quantum dacă acesta era gol
      if (rawOldGens) {
        const sumQ = Object.values(s.cores.quantum.generators).reduce((a, b) => a + (Number(b) || 0), 0);
        if (sumQ === 0) {
          s.cores.quantum.generators = { ...s.cores.quantum.generators, ...rawOldGens };
        }
      }
      if (rawOldUps) {
        const sumU = Object.values(s.cores.quantum.clickUpgrades).reduce((a, b) => a + (Number(b) || 0), 0);
        if (sumU === 0) {
          s.cores.quantum.clickUpgrades = { ...s.cores.quantum.clickUpgrades, ...rawOldUps };
        }
      }

      try {
        delete s.generators;
        delete s.clickUpgrades;
      } catch (e) {}

      Object.defineProperty(s, 'generators', {
        get() {
          const cid = this.activeCoreId || 'quantum';
          if (!this.cores[cid]) this.cores[cid] = createEmptyCoreData();
          return this.cores[cid].generators;
        },
        set(val) {
          const cid = this.activeCoreId || 'quantum';
          if (!this.cores[cid]) this.cores[cid] = createEmptyCoreData();
          this.cores[cid].generators = val;
        },
        configurable: true,
        enumerable: true
      });

      Object.defineProperty(s, 'clickUpgrades', {
        get() {
          const cid = this.activeCoreId || 'quantum';
          if (!this.cores[cid]) this.cores[cid] = createEmptyCoreData();
          return this.cores[cid].clickUpgrades;
        },
        set(val) {
          const cid = this.activeCoreId || 'quantum';
          if (!this.cores[cid]) this.cores[cid] = createEmptyCoreData();
          this.cores[cid].clickUpgrades = val;
        },
        configurable: true,
        enumerable: true
      });

      return s;
    }

    function getDefaultState() {
      const presLvls = {};
      PRESTIGE_UPGRADES_DATA.forEach(p => presLvls[p.id] = 0);

      const defaultCores = {};
      CORES_DATA.forEach(c => {
        defaultCores[c.id] = createEmptyCoreData();
      });

      const baseState = {
        energy: 0,
        totalEnergyThisRun: 0,
        lifetimeEnergy: 0,
        maxCps: 0,
        commanderName: '',
        totalClicks: 0,
        totalCrits: 0,
        skillsUsed: 0,
        feverSeconds: 0,
        anomaliesCaught: 0,
        prestigeCount: 0,
        darkMatter: 0,
        equippedCoreSkin: 'quantum',
        activeCoreId: 'quantum',
        cores: defaultCores,
        prestigeUpgrades: presLvls,
        unlockedAchievements: [],
        skillCooldowns: { 1: 0, 2: 0, 3: 0 },
        activeBuffs: {
          frenzyEnd: 0,
          clickStormEnd: 0,
          hyperCritEnd: 0,
          timeWarpEnd: 0,
          crimsonCritEnd: 0,
          discountOrbEnd: 0,
          overdriveOrbEnd: 0,
          cryoCooldownEnd: 0
        },
        dailyLogin: {
          lastClaimDate: '',
          claimedDay: 0,
          currentDay: 1,
          totalStreak: 0,
          cycle: 1
        },
        dailyQuests: {
          date: '',
          allClaimed: false,
          quests: []
        },
        social: {
          avatar: '⚛️',
          title: 'Novice Cuantic',
          statusMsg: 'Cercetez Vidul Cuantic',
          friends: []
        },
        soundEnabled: true,
        musicEnabled: true,
        cosmicBgEnabled: true,
        fpsCounterEnabled: true,
        stormQuality: 'auto',
        totalStormsExperienced: 0,
        meteorsCaught: 0,
        playTimeSeconds: 0,
        nextStormTimestamp: null,
        lastSaved: Date.now()
      };

      return ensureStateCoreBindings(baseState);
    }

    let state = getDefaultState();
    let buyMultiplier = 1; // 1, 10, 100, or 'MAX'
    let clickBuyMultiplier = 1; // 1, 10, or 'MAX'
    let activeRightTab = 'gens'; // 'gens' sau 'tech'

    // Variabile runtime (combo, buff-uri active și cooldown-uri sincronizate cu state)
    let comboMeter = 0; // 0 -> 100
    let lastComboClickTime = 0;
    let lastSupernovaBurstTime = 0;
    let activeBuffs = state.activeBuffs;
    let skillCooldowns = state.skillCooldowns;

    /********************************************************************
     * 2.5. SISTEM RECOMPENSE ZILNICE & MISIUNI ZILNICE (DAILY LOGIN & QUESTS)
     *      - Calendar 7 Zile cu Streak Consecutiv & Marele Premiu Ziua 7 (+5 🔮)
     *      - 3 Misiuni Zilnice Regenerate la 24h (Ușoară, Medie, Avansată)
     *      - Pachetul Suprem de Misiuni (All-Clear Chest)
     ********************************************************************/
    const DAILY_LOGIN_REWARDS_DATA = [
      {
        day: 1,
        title: "+1h Producție Instant",
        desc: "Producția generată în 1 oră cuantică",
        icon: "⚡",
        type: "prod_time",
        hours: 1
      },
      {
        day: 2,
        title: "Frenezie x2.5 (5 min)",
        desc: "Toată producția multiplicată x2.5 timp de 5 minute",
        icon: "🌟",
        type: "buff",
        buff: "frenzyEnd",
        sec: 300
      },
      {
        day: 3,
        title: "+3h Producție & +1 🔮",
        desc: "+3 ore de energie și +1 Materie Întunecată",
        icon: "🔮",
        type: "prod_and_dm",
        hours: 3,
        dm: 1
      },
      {
        day: 4,
        title: "Click Storm x4 (5 min)",
        desc: "Puterea fiecărui click cvadruplată (x4) timp de 5 minute",
        icon: "🖱️",
        type: "buff",
        buff: "clickStormEnd",
        sec: 300
      },
      {
        day: 5,
        title: "+5h Producție & -35% Costuri",
        desc: "+5 ore de producție și -35% costuri timp de 5 minute",
        icon: "🍀",
        type: "prod_and_buff",
        hours: 5,
        buff: "discountOrbEnd",
        sec: 300
      },
      {
        day: 6,
        title: "+8h Producție & +2 🔮",
        desc: "+8 ore de energie și +2 Materie Întunecată",
        icon: "🌌",
        type: "prod_and_dm",
        hours: 8,
        dm: 2
      },
      {
        day: 7,
        title: "👑 MARELE PREMIU: +5 🔮 & +24h PRODUCȚIE!",
        desc: "+5 🔮 Materie Întunecată garantată, +24h producție și 100% Hiper-Critică (5m)!",
        icon: "👑",
        type: "grand_jackpot",
        hours: 24,
        dm: 5,
        buff: "hyperCritEnd",
        sec: 300
      }
    ];

    const DAILY_QUESTS_POOL = {
      easy: [
        {
          id: 'q_click_250',
          type: 'clicks',
          target: 250,
          title: 'Realizează 250 de click-uri manuale',
          desc: 'Apasă pe Nucleul Cuantic de cel puțin 250 de ori.',
          icon: '👆',
          tier: 'easy',
          tierName: 'Ușoară',
          rewardText: '+45m Producție Instant',
          rewardHours: 0.75,
          dm: 0
        },
        {
          id: 'q_crit_50',
          type: 'crits',
          target: 50,
          title: 'Reușește 50 de Lovituri Critice',
          desc: 'Loviți critic nucleul cuantic de 50 de ori.',
          icon: '🎯',
          tier: 'easy',
          tierName: 'Ușoară',
          rewardText: '+1h Producție Instant',
          rewardHours: 1,
          dm: 0
        },
        {
          id: 'q_upgrades_10',
          type: 'buy_upgrades',
          target: 10,
          title: 'Cumpără 10 Tehnologii de Click',
          desc: 'Achiziționează 10 niveluri de Amplificatoare de Click.',
          icon: '🔬',
          tier: 'easy',
          tierName: 'Ușoară',
          rewardText: '+45m Producție Instant',
          rewardHours: 0.75,
          dm: 0
        }
      ],
      medium: [
        {
          id: 'q_overclock_100',
          type: 'overclock_100',
          target: 1,
          title: 'Activează Supraîncărcarea la 100%',
          desc: 'Atinge 100% în bara de Combo pentru a intra în Supernova Fever.',
          icon: '🔥',
          tier: 'medium',
          tierName: 'Medie',
          rewardText: '+2h Producție & Turbo 3m',
          rewardHours: 2,
          buff: 'overdriveOrbEnd',
          buffSec: 180,
          dm: 0
        },
        {
          id: 'q_skills_6',
          type: 'skills',
          target: 6,
          title: 'Activează 6 Abilități Tactice',
          desc: 'Folosește Impuls EM, Hiper-Critică sau Distorsiune de 6 ori.',
          icon: '⚡',
          tier: 'medium',
          tierName: 'Medie',
          rewardText: '+2h Producție & +1 🔮 Materie',
          rewardHours: 2,
          dm: 1
        },
        {
          id: 'q_generators_30',
          type: 'buy_generators',
          target: 30,
          title: 'Cumpără 30 de Generatoare Pasive',
          desc: 'Construiește sau extinde 30 de generatoare automatizate.',
          icon: '🤖',
          tier: 'medium',
          tierName: 'Medie',
          rewardText: '+2h Producție & Frenezie 3m',
          rewardHours: 2,
          buff: 'frenzyEnd',
          buffSec: 180,
          dm: 0
        }
      ],
      hard: [
        {
          id: 'q_spheres_4',
          type: 'spheres',
          target: 4,
          title: 'Prinde 4 Sfere Cuantice Zburătoare',
          desc: 'Capturează 4 anomalii zburătoare care traversează ecranul.',
          icon: '☄️',
          tier: 'hard',
          tierName: 'Avansată',
          rewardText: '+2 🔮 Materie & +4h Producție',
          rewardHours: 4,
          dm: 2
        },
        {
          id: 'q_prestige_1',
          type: 'prestige',
          target: 1,
          title: 'Declanșează 1 Rebirth (Singularitate)',
          desc: 'Stabilizează un nou nivel de Rebirth pentru salt cosmic.',
          icon: '🌌',
          tier: 'hard',
          tierName: 'Avansată',
          rewardText: '+3 🔮 Materie & +6h Producție',
          rewardHours: 6,
          dm: 3
        },
        {
          id: 'q_fever_skills_3',
          type: 'fever_skills',
          target: 3,
          title: 'Activează 3 Abilități în mod Fever',
          desc: 'Folosește 3 abilități speciale în timp ce ești la 100% Combo.',
          icon: '👑',
          tier: 'hard',
          tierName: 'Avansată',
          rewardText: '+2 🔮 Materie & +5h Producție',
          rewardHours: 5,
          dm: 2
        }
      ]
    };

    function getTodayDateString() {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }

    function getDaysDifference(dStr1, dStr2) {
      if (!dStr1 || !dStr2) return 999;
      const dt1 = new Date(dStr1 + 'T00:00:00');
      const dt2 = new Date(dStr2 + 'T00:00:00');
      const diffTime = dt2.getTime() - dt1.getTime();
      return Math.round(diffTime / (1000 * 60 * 60 * 24));
    }

    function getSecondsUntilMidnight() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
    }

    function isDailyLoginReady() {
      if (!state.dailyLogin) return true;
      const today = getTodayDateString();
      return state.dailyLogin.lastClaimDate !== today;
    }

    function addInstantProduction(hours) {
      const currentCps = getCPS();
      const baseCps = Math.max(10, currentCps);
      const cycle = (state.dailyLogin && state.dailyLogin.cycle) || 1;
      const streakBonus = 1 + (cycle - 1) * 0.10;
      const gain = Math.round(baseCps * hours * 3600 * streakBonus);
      addEnergy(gain);
      return gain;
    }

    function generateDailyQuestsForDate(dateStr) {
      // Dacă este prima inițializare din zi, garantăm cele 3 misiuni cerute de utilizator
      const easyChoice = { ...DAILY_QUESTS_POOL.easy[0], progress: 0, claimed: false };
      const mediumChoice = { ...DAILY_QUESTS_POOL.medium[0], progress: 0, claimed: false };
      const hardChoice = { ...DAILY_QUESTS_POOL.hard[0], progress: 0, claimed: false };

      // Variație pseudorandom pentru zilele următoare bazată pe valoarea numerică a datei
      if (dateStr) {
        const hash = dateStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const eIdx = hash % DAILY_QUESTS_POOL.easy.length;
        const mIdx = (hash + 1) % DAILY_QUESTS_POOL.medium.length;
        const hIdx = (hash + 2) % DAILY_QUESTS_POOL.hard.length;
        return [
          { ...DAILY_QUESTS_POOL.easy[eIdx], progress: 0, claimed: false },
          { ...DAILY_QUESTS_POOL.medium[mIdx], progress: 0, claimed: false },
          { ...DAILY_QUESTS_POOL.hard[hIdx], progress: 0, claimed: false }
        ];
      }

      return [easyChoice, mediumChoice, hardChoice];
    }

    let dailyPopupShownThisSession = false;

    function initDailySystem() {
      const today = getTodayDateString();

      if (!state.dailyLogin) {
        state.dailyLogin = { lastClaimDate: '', claimedDay: 0, currentDay: 1, totalStreak: 0, cycle: 1 };
      }

      // Migrare automată pentru salvările anterioare
      if (state.dailyLogin.claimedDay === undefined) {
        if (state.dailyLogin.lastClaimDate === today) {
          // Utilizatorul a revendicat cadoul de astăzi (în versiunea anterioară currentDay era incrementat imediat)
          const oldDay = state.dailyLogin.currentDay || 2;
          state.dailyLogin.claimedDay = Math.max(1, Math.min(7, oldDay - 1));
        } else {
          // Utilizatorul nu a revendicat astăzi
          const oldDay = state.dailyLogin.currentDay || 1;
          state.dailyLogin.claimedDay = Math.max(0, Math.min(6, oldDay - 1));
        }
      }

      // Sincronizare currentDay (ziua următoare / țintă în ciclu)
      state.dailyLogin.currentDay = ((state.dailyLogin.claimedDay || 0) % 7) + 1;

      // Verificare dacă seria (Streak) s-a rupt (dacă s-a sărit mai mult de 1 zi)
      if (state.dailyLogin.lastClaimDate) {
        const diff = getDaysDifference(state.dailyLogin.lastClaimDate, today);
        if (diff > 1) {
          // A sărit o zi sau mai multe -> seria revine la 0 și Ziua 1
          state.dailyLogin.totalStreak = 0;
          state.dailyLogin.claimedDay = 0;
          state.dailyLogin.currentDay = 1;
        } else if (diff === 1) {
          // O nouă zi consecutivă! Dacă ieri a finalizat Ziua 7 (Marele Premiu), începe noul ciclu
          if (state.dailyLogin.claimedDay >= 7) {
            state.dailyLogin.claimedDay = 0;
            state.dailyLogin.currentDay = 1;
            state.dailyLogin.cycle = (state.dailyLogin.cycle || 1) + 1;
          }
        }
      }

      // Verificare dacă misiunile zilnice trebuie regenerate pentru noua zi
      if (!state.dailyQuests || state.dailyQuests.date !== today || !Array.isArray(state.dailyQuests.quests) || state.dailyQuests.quests.length === 0) {
        state.dailyQuests = {
          date: today,
          allClaimed: false,
          quests: generateDailyQuestsForDate(today)
        };
      }

      updateDailyBadge();
    }

    function checkDailyAutoPopup() {
      if (dailyPopupShownThisSession) return;
      if (isDailyLoginReady()) {
        dailyPopupShownThisSession = true;
        setTimeout(() => {
          openDailyModal();
        }, 1200);
      }
    }

    function openDailyModal() {
      initDailySystem();
      renderDailyModal();
      const modal = document.getElementById('dailyModal');
      if (modal) modal.classList.add('open');
      playTone(660, 'sine', 0.1, 0.08);
    }

    function closeDailyModal() {
      const modal = document.getElementById('dailyModal');
      if (modal) modal.classList.remove('open');
    }

    let currentDailySubnav = 'login';

    function switchDailySubnav(tab) {
      currentDailySubnav = tab;
      const btnLogin = document.getElementById('btnDailySubnavLogin');
      const btnQuests = document.getElementById('btnDailySubnavQuests');
      const paneLogin = document.getElementById('paneDailyLogin');
      const paneQuests = document.getElementById('paneDailyQuests');

      if (tab === 'login') {
        if (btnLogin) btnLogin.classList.add('active');
        if (btnQuests) btnQuests.classList.remove('active');
        if (paneLogin) paneLogin.style.display = 'block';
        if (paneQuests) paneQuests.style.display = 'none';
        renderDailyLogin();
      } else {
        if (btnLogin) btnLogin.classList.remove('active');
        if (btnQuests) btnQuests.classList.add('active');
        if (paneLogin) paneLogin.style.display = 'none';
        if (paneQuests) paneQuests.style.display = 'block';
        renderDailyQuests();
      }
    }

    function updateDailyBadge() {
      const badgeEl = document.getElementById('dailyBadgeDot');
      const subnavLoginBadge = document.getElementById('dailyLoginReadyBadge');
      const subnavQuestsBadge = document.getElementById('dailyQuestsClaimableBadge');

      const loginReady = isDailyLoginReady();
      let claimableQuests = 0;
      if (state.dailyQuests && Array.isArray(state.dailyQuests.quests)) {
        claimableQuests = state.dailyQuests.quests.filter(q => !q.claimed && (q.progress || 0) >= q.target).length;
        if (!state.dailyQuests.allClaimed && state.dailyQuests.quests.every(q => q.claimed)) {
          claimableQuests++;
        }
      }

      const totalNotifs = (loginReady ? 1 : 0) + claimableQuests;
      if (badgeEl) {
        if (totalNotifs > 0) {
          badgeEl.style.display = 'flex';
          badgeEl.innerText = totalNotifs > 9 ? '!' : String(totalNotifs);
        } else {
          badgeEl.style.display = 'none';
        }
      }

      if (subnavLoginBadge) {
        subnavLoginBadge.style.display = loginReady ? 'inline-block' : 'none';
      }
      if (subnavQuestsBadge) {
        if (claimableQuests > 0) {
          subnavQuestsBadge.style.display = 'inline-block';
          subnavQuestsBadge.innerText = `${claimableQuests} GATA`;
        } else {
          subnavQuestsBadge.style.display = 'none';
        }
      }
    }

    function renderDailyModal() {
      initDailySystem();

      const dl = state.dailyLogin || { lastClaimDate: '', claimedDay: 0, currentDay: 1, totalStreak: 0, cycle: 1 };
      const loginReady = isDailyLoginReady();
      const claimedDay = dl.claimedDay || 0;
      const targetDay = (claimedDay % 7) + 1;

      const streakDaysEl = document.getElementById('dailyStreakDaysText');
      const streakTotalEl = document.getElementById('dailyStreakTotalText');
      const streakMultEl = document.getElementById('dailyStreakMultBadge');

      if (streakDaysEl) {
        const s = dl.totalStreak || 0;
        streakDaysEl.innerText = `${s} ${s === 1 ? 'Zi' : 'Zile'} Consecutiv`;
      }
      if (streakTotalEl) {
        if (loginReady) {
          streakTotalEl.innerText = `(Disponibil: Ziua ${targetDay}/7)`;
        } else {
          streakTotalEl.innerText = `(Ziua ${claimedDay || 1}/7 Revendicată)`;
        }
      }
      if (streakMultEl) {
        const bonusPct = ((dl.cycle || 1) - 1) * 10;
        streakMultEl.innerText = `⭐ Ciclu #${dl.cycle || 1} (+${bonusPct}% Bonus Streak)`;
      }

      renderDailyLogin();
      renderDailyQuests();
      updateDailyBadge();
    }

    function renderDailyLogin() {
      const grid = document.getElementById('dailyCalendarGrid');
      if (!grid) return;
      grid.innerHTML = '';

      const dl = state.dailyLogin || { lastClaimDate: '', claimedDay: 0, currentDay: 1, totalStreak: 0, cycle: 1 };
      const loginReady = isDailyLoginReady();
      const claimedDay = dl.claimedDay || 0;
      const targetDay = (claimedDay % 7) + 1;

      DAILY_LOGIN_REWARDS_DATA.forEach(item => {
        const card = document.createElement('div');
        const isGrand = item.day === 7;

        let statusClass = 'locked';
        let btnText = `🔒 Ziua ${item.day}`;
        let btnClass = 'btn-locked';
        let btnDisabled = true;

        if (item.day <= claimedDay) {
          // Această zi a fost deja revendicată în ciclul curent
          if (item.day === claimedDay && !loginReady) {
            statusClass = 'claimed claimed-today';
            btnText = '✅ Revendicat Azi';
          } else {
            statusClass = 'claimed';
            btnText = '✅ Revendicat';
          }
          btnClass = 'btn-claimed';
          btnDisabled = true;
        } else if (item.day === targetDay) {
          // Aceasta este următoarea zi în succesiune
          if (loginReady) {
            statusClass = 'ready';
            btnText = isGrand ? '👑 REVENDICĂ MARELE PREMIU!' : '✨ Revendică Cadoul';
            btnClass = 'btn-ready';
            btnDisabled = false;
          } else {
            statusClass = 'locked';
            btnText = '⏰ Deblocare Mâine';
            btnClass = 'btn-locked';
            btnDisabled = true;
          }
        } else {
          // Zile viitoare din ciclu
          statusClass = 'locked';
          btnText = `🔒 Ziua ${item.day}`;
          btnClass = 'btn-locked';
          btnDisabled = true;
        }

        card.className = `daily-day-card ${statusClass} ${isGrand ? 'grand-jackpot' : ''}`;

        if (isGrand) {
          card.innerHTML = `
            <div style="display:flex; align-items:center; gap:14px; text-align:left;">
              <div class="daily-day-icon">${item.icon}</div>
              <div>
                <div class="daily-day-num" style="color:#fde047; font-weight:850">ZIUA 7 • MARELE PREMIU CUANTIC</div>
                <div class="daily-day-title" style="color:#fef08a">${item.title}</div>
                <div class="daily-day-desc" style="max-width:380px;">${item.desc}</div>
              </div>
            </div>
            <button class="daily-claim-btn ${btnClass}" ${btnDisabled ? 'disabled' : ''} onclick="claimDailyLoginReward()" style="max-width:210px; flex-shrink:0;">
              ${btnText}
            </button>
          `;
        } else {
          card.innerHTML = `
            <div class="daily-day-num">ZIUA ${item.day}</div>
            <div class="daily-day-icon">${item.icon}</div>
            <div class="daily-day-title">${item.title}</div>
            <div class="daily-day-desc">${item.desc}</div>
            <button class="daily-claim-btn ${btnClass}" ${btnDisabled ? 'disabled' : ''} onclick="claimDailyLoginReward()">
              ${btnText}
            </button>
          `;
        }

        grid.appendChild(card);
      });
    }

    function claimDailyLoginReward() {
      if (!isDailyLoginReady()) {
        showToast('⏳ Ai revendicat deja cadoul de azi! Următorul se deblochează la miezul nopții.');
        return;
      }

      const dl = state.dailyLogin || { lastClaimDate: '', claimedDay: 0, currentDay: 1, totalStreak: 0, cycle: 1 };
      const claimedDay = dl.claimedDay || 0;
      const targetDay = (claimedDay % 7) + 1;
      const reward = DAILY_LOGIN_REWARDS_DATA[targetDay - 1];
      if (!reward) return;

      const now = Date.now();
      let rewardSummary = reward.title;

      if (reward.hours) {
        const gain = addInstantProduction(reward.hours);
        rewardSummary += ` (+${formatNumber(gain)} ⚡)`;
      }
      if (reward.dm) {
        state.darkMatter = (state.darkMatter || 0) + reward.dm;
      }
      if (reward.buff && reward.sec) {
        activeBuffs[reward.buff] = Math.max(now, activeBuffs[reward.buff] || 0) + (reward.sec * 1000);
      }

      // Actualizare Streak & Zile
      const today = getTodayDateString();
      dl.lastClaimDate = today;
      dl.claimedDay = targetDay;
      dl.currentDay = Math.min(7, targetDay + 1);
      dl.totalStreak = (dl.totalStreak || 0) + 1;

      if (targetDay >= 7) {
        playXboxAchievementChime('mythic');
        spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2 - 40, '👑 MARELE PREMIU ZIUA 7 REVENDICAT!', true);
        showToast(`👑 Felicitări! Ai revendicat Marele Premiu Ziua 7: +5 🔮 Materie Întunecată, producție masivă și ai completat Ciclul #${dl.cycle || 1}!`);
      } else {
        playXboxAchievementChime('rare');
        spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2 - 40, `🎁 ZIUA ${targetDay} REVENDICATĂ!`, true);
        showToast(`🎁 Recompensa Zilei ${targetDay} a fost revendicată: ${rewardSummary}!`);
      }

      spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 35, '#fde047');

      renderDailyModal();
      updateUI();
      saveGame();
      checkAchievements();
      if (cloudSession && (cloudSession.access_token || cloudSession.refresh_token)) {
        cloudPushSave(false);
      }
    }

    function renderDailyQuests() {
      const container = document.getElementById('dailyQuestsList');
      if (!container) return;
      container.innerHTML = '';

      if (!state.dailyQuests || !Array.isArray(state.dailyQuests.quests)) {
        initDailySystem();
      }

      const quests = state.dailyQuests.quests || [];
      let allClaimedCount = 0;

      quests.forEach((q, idx) => {
        const isDone = (q.progress || 0) >= q.target;
        if (q.claimed) allClaimedCount++;

        const pct = Math.min(100, Math.floor(((q.progress || 0) / q.target) * 100));
        const card = document.createElement('div');

        let cardStatusClass = '';
        let btnText = `${q.progress || 0}/${q.target}`;
        let btnClass = 'btn-locked';
        let btnDisabled = true;

        if (q.claimed) {
          cardStatusClass = 'claimed';
          btnText = '✅ Revendicat';
          btnClass = 'btn-claimed';
        } else if (isDone) {
          cardStatusClass = 'ready';
          btnText = '✨ Revendică';
          btnClass = 'btn-ready';
          btnDisabled = false;
        } else {
          btnText = `🔒 ${q.progress || 0}/${q.target}`;
          btnClass = 'btn-locked';
        }

        const tierClass = q.tier === 'easy' ? 'tier-easy' : (q.tier === 'medium' ? 'tier-medium' : 'tier-hard');
        card.className = `daily-quest-card ${cardStatusClass}`;

        card.innerHTML = `
          <div class="daily-quest-icon">${q.icon}</div>
          <div class="daily-quest-body">
            <div class="daily-quest-header-row">
              <span class="daily-quest-title">${q.title}</span>
              <span class="daily-quest-tier-tag ${tierClass}">${q.tierName || q.tier}</span>
            </div>
            <div class="daily-quest-desc">${q.desc}</div>
            <div class="daily-quest-track">
              <div class="daily-quest-fill" style="width: ${pct}%"></div>
            </div>
            <div class="daily-quest-meta-row">
              <span>Progres: <strong>${Math.min(q.target, q.progress || 0)}</strong> / ${q.target} (${pct}%)</span>
              <span class="daily-quest-reward">Recompensă: ${q.rewardText}</span>
            </div>
          </div>
          <button class="daily-claim-btn ${btnClass}" ${btnDisabled ? 'disabled' : ''} onclick="claimDailyQuestReward(${idx})" style="width:auto; min-width:115px; flex-shrink:0;">
            ${btnText}
          </button>
        `;

        container.appendChild(card);
      });

      // Actualizare Card Pachet Suprem de Misiuni (All-Clear)
      const progTextEl = document.getElementById('dailyAllClearProgressText');
      const allClearBtn = document.getElementById('btnClaimDailyAllClear');

      if (progTextEl) progTextEl.innerText = `${allClaimedCount}/3`;

      if (allClearBtn) {
        if (state.dailyQuests.allClaimed) {
          allClearBtn.className = 'daily-claim-btn btn-claimed';
          allClearBtn.innerText = '✅ Pachet Revendicat';
          allClearBtn.disabled = true;
        } else if (allClaimedCount >= 3) {
          allClearBtn.className = 'daily-claim-btn btn-ready';
          allClearBtn.innerText = '👑 REVENDICĂ SUPREM!';
          allClearBtn.disabled = false;
        } else {
          allClearBtn.className = 'daily-claim-btn btn-locked';
          allClearBtn.innerText = `🔒 Blocat (${allClaimedCount}/3)`;
          allClearBtn.disabled = true;
        }
      }
    }

    function claimDailyQuestReward(questIdx) {
      if (!state.dailyQuests || !Array.isArray(state.dailyQuests.quests)) return;
      const q = state.dailyQuests.quests[questIdx];
      if (!q || q.claimed || (q.progress || 0) < q.target) return;

      q.claimed = true;
      const now = Date.now();
      let summary = q.rewardText;

      if (q.rewardHours) {
        const gain = addInstantProduction(q.rewardHours);
        summary += ` (+${formatNumber(gain)} ⚡)`;
      }
      if (q.dm) {
        state.darkMatter = (state.darkMatter || 0) + q.dm;
      }
      if (q.buff && q.buffSec) {
        activeBuffs[q.buff] = Math.max(now, activeBuffs[q.buff] || 0) + (q.buffSec * 1000);
      }

      playXboxAchievementChime(q.tier === 'hard' ? 'mythic' : 'rare');
      spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 26, '#38bdf8');
      showToast(`🎯 Misiune Revendicată: „${q.title}”! Ai primit ${summary}.`);

      renderDailyModal();
      updateUI();
      saveGame();
      checkAchievements();
    }

    function claimDailyAllClearReward() {
      if (!state.dailyQuests || !Array.isArray(state.dailyQuests.quests)) return;
      const allClaimed = state.dailyQuests.quests.every(q => q.claimed);
      if (!allClaimed || state.dailyQuests.allClaimed) return;

      state.dailyQuests.allClaimed = true;
      state.darkMatter = (state.darkMatter || 0) + 3;
      const gain = addInstantProduction(8);

      playXboxAchievementChime('mythic');
      spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 45, '#ec4899');
      spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2 - 50, '👑 PACHETUL SUPREM REVENDICAT!', true);
      showToast(`👑 Felicitări! Ai revendicat Pachetul Suprem de Misiuni: +3 🔮 Materie Întunecată și +${formatNumber(gain)} ⚡ Energie (8h)!`);

      renderDailyModal();
      updateUI();
      saveGame();
      checkAchievements();
    }

    function updateDailyQuestProgress(type, amount = 1) {
      if (!state.dailyQuests || !Array.isArray(state.dailyQuests.quests)) return;
      let changed = false;

      state.dailyQuests.quests.forEach(q => {
        if (q.type === type && !q.claimed) {
          const old = q.progress || 0;
          q.progress = Math.min(q.target, old + amount);
          if (q.progress !== old) changed = true;
          if (old < q.target && q.progress >= q.target) {
            showToast(`🎯 Misiune Finalizată: „${q.title}”! Deschide meniul Zilnic pentru recompensă!`);
            playTone(940, 'triangle', 0.25, 0.12);
          }
        }
      });

      if (changed) {
        updateDailyBadge();
        const modal = document.getElementById('dailyModal');
        if (modal && modal.classList.contains('open')) {
          renderDailyQuests();
        }
      }
    }

