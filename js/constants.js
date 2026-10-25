    /********************************************************************
     * 0. FORMATARE NUMERE MARI (1.25K, 3.40M, 12.8B, T, Qa, Qi...)
     ********************************************************************/
    const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UDc', 'DDc'];

    function formatNumber(num, decimals = 2) {
      if (!isFinite(num) || isNaN(num)) return '0';
      if (num < 1000) {
        return num < 10 && num % 1 !== 0 ? num.toFixed(1) : Math.floor(num).toString();
      }
      const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
      if (tier === 0) return Math.floor(num).toString();
      const suffix = SUFFIXES[tier] || `e${tier * 3}`;
      const scale = Math.pow(10, tier * 3);
      const scaled = num / scale;
      return scaled.toFixed(decimals) + suffix;
    }

    function formatTime(sec) {
      sec = Math.floor(sec);
      if (sec < 60) return `${sec}s`;
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      if (m < 60) return `${m}m ${s}s`;
      const h = Math.floor(m / 60);
      const rm = m % 60;
      return `${h}h ${rm}m`;
    }

    /********************************************************************
     * 1. CONFIGURARE DATE JOC (UPGRADE-URI, GENERATOARE, 135 REALIZĂRI)
     ********************************************************************/
    const CLICK_UPGRADES_DATA = [
      {
        id: 'c_flat1',
        name: 'Amplificator Fotonic',
        icon: '🔦',
        desc: '+1 Energie de bază la click. La fiecare al 10-lea click trage o Rază Mega-Fotonică (x3 Energie)!',
        specialBadge: '⚡ RAZĂ MEGA-FOTONICĂ (10 CLICK)',
        badgeColor: 'gold',
        baseCost: 20,
        costMult: 1.65,
        maxLevel: 100
      },
      {
        id: 'c_mult1',
        name: 'Lentilă de Focalizare',
        icon: '🔍',
        desc: '+15% putere de click per nivel și încarcă bara de Overclock mai rapid.',
        specialBadge: '🌈 PRISMĂ HOLOGRAFICĂ & +OVERCLOCK',
        badgeColor: 'purple',
        baseCost: 150,
        costMult: 1.95,
        maxLevel: 50
      },
      {
        id: 'c_synergy',
        name: 'Conector Neuro-Sinergic',
        icon: '🧠',
        desc: 'Fiecare click descarcă Fulgere Sinaptice cu +0.25% din producția pasivă per nivel.',
        specialBadge: '🧬 ARCURI SINAPTICE LA CLICK',
        badgeColor: 'pink',
        baseCost: 600,
        costMult: 2.35,
        maxLevel: 20
      },
      {
        id: 'c_critChance',
        name: 'Calibrare Cuantică (Crit %)',
        icon: '🎯',
        desc: '+2% șansă de lovitură critică la click (Bază: 5%) cu Vizor Lock-On pe țintă.',
        specialBadge: '🎯 VIZOR LOCK-ON LA CRITICĂ',
        badgeColor: 'gold',
        baseCost: 800,
        costMult: 2.4,
        maxLevel: 25
      },
      {
        id: 'c_critMult',
        name: 'Descărcare de Plasmă (Crit Dmg)',
        icon: '💥',
        desc: '+25% daune la loviturile critice per nivel (Bază: x2.0) + Cutremur de Plasmă.',
        specialBadge: '🌋 EXPLOZIE & SHAKE PLASMĂ',
        badgeColor: 'pink',
        baseCost: 1800,
        costMult: 2.5,
        maxLevel: 20
      },
      {
        id: 'c_global1',
        name: 'Rețea Superconductoare',
        icon: '🌐',
        desc: '+8% producție globală per nivel și activează Matricea Cibernetică 3D pe reactor.',
        specialBadge: '🌐 MATRICE CIBERNETICĂ 3D',
        badgeColor: 'emerald',
        baseCost: 3500,
        costMult: 2.35,
        maxLevel: 50
      }
    ];

    const GENERATORS_DATA = [
      {
        id: 'g0',
        name: 'Nano-Cursor Autonom',
        icon: '🖱️',
        baseCost: 15,
        baseCps: 0.25,
        roleBadge: '👆 AUTO-CLICK RAPID & OVERCLOCK 100%',
        badgeColor: 'gold',
        specialSummary: (cnt) => {
          const vis = cnt <= 0 ? 0 : Math.min(16, cnt <= 8 ? cnt : 8 + Math.floor(Math.log2(cnt - 6) * 2.5));
          const rate = (1.20 / Math.max(1, vis)).toFixed(2);
          return `Apasă pe nucleu la fiecare ${rate}s (${vis} cursoare pe orbită) și urcă Overclock-ul până la 100%!`;
        }
      },
      {
        id: 'g1',
        name: 'Dronă de Extracție',
        icon: '🤖',
        baseCost: 180,
        baseCps: 2.0,
        roleBadge: '💥 SALVĂ LASER & +4% CRIT DMG',
        badgeColor: 'pink',
        specialSummary: (cnt) => `Baleiaj laser + Salvă la 7.5s (+${cnt * 4}% Daune Critice)`
      },
      {
        id: 'g2',
        name: 'Script Neural AI',
        icon: '💻',
        baseCost: 2400,
        baseCps: 15,
        roleBadge: '🔥 +3% PUTERE OVERCLOCK / AI',
        badgeColor: 'purple',
        specialSummary: (cnt) => `Stabilizează Overclock-ul și îi crește multiplicatorul cu +${cnt * 3}%`
      },
      {
        id: 'g3',
        name: 'Condensator Tahionic',
        icon: '🔋',
        baseCost: 35000,
        baseCps: 85,
        roleBadge: '⚡ EXPLOZIE BURST LA FIECARE 5 SEC',
        badgeColor: 'gold',
        specialSummary: (cnt) => `Descarcă un Șoc Tahionic de +${formatNumber(cnt * 420 * getGlobalMultiplier())} ⚡ la fiecare 5s!`
      },
      {
        id: 'g4',
        name: 'Satelit Solar Orbital',
        icon: '🛰️',
        baseCost: 550000,
        baseCps: 900,
        roleBadge: '🔦 +5% PUTERE CLICK MANUAL / SATELIT',
        badgeColor: 'emerald',
        specialSummary: (cnt) => `Focalizează raze solare: +${cnt * 5}% Putere Click Manual`
      },
      {
        id: 'g5',
        name: 'Reactor de Fuziune Rece',
        icon: '⚛️',
        baseCost: 9500000,
        baseCps: 8000,
        roleBadge: '🎯 +0.4% ȘANSĂ CRITICĂ / REACTOR',
        badgeColor: 'pink',
        specialSummary: (cnt) => `Injecție plasmă: +${Math.min(12, cnt * 0.4).toFixed(1)}% Șansă de Critică`
      },
      {
        id: 'g6',
        name: 'Micro-Gaură Neagră',
        icon: '🕳️',
        baseCost: 180000000,
        baseCps: 75000,
        roleBadge: '🕳️ ÎNGHITE NUCLEUL (18s) & +6% ABILITĂȚI',
        badgeColor: 'purple',
        specialSummary: (cnt) => `Înghite nucleul la 18s (Erupție Hawking) + ${cnt * 6}% Abilități`
      },
      {
        id: 'g7',
        name: 'Matrice Dyson Parțială',
        icon: '☀️',
        baseCost: 3800000000,
        baseCps: 800000,
        roleBadge: '☀️ +4% EFICIENȚĂ TOATĂ FLOTA',
        badgeColor: 'gold',
        specialSummary: (cnt) => `Sferă Dyson: amplifică toate modulele cu +${cnt * 4}%`
      },
      {
        id: 'g8',
        name: 'Accelerator Temporal',
        icon: '⏳',
        baseCost: 85000000000,
        baseCps: 9500000,
        roleBadge: '⏳ REÎNCĂRCARE RAPIDĂ ABILITĂȚI',
        badgeColor: 'emerald',
        specialSummary: (cnt) => `Accelerează timpul: -${Math.min(45, cnt * 2)}% timp de reîncărcare Abilități`
      },
      {
        id: 'g9',
        name: 'Motor de Univers Sintetic',
        icon: '🌌',
        baseCost: 2200000000000,
        baseCps: 120000000,
        roleBadge: '🌌 BIG BANG PORTAL (22s) & +10% GLOBAL',
        badgeColor: 'purple',
        specialSummary: (cnt) => `Portal Big Bang la 22s + ${cnt * 10}% Multiplicator Global Suprem`
      }
    ];

    const ALL_SKILL_TREE_NODES = [
      // ==========================================
      // RAMURA 0: RĂDĂCINA SINGULARITĂȚII (Universal)
      // ==========================================
      {
        id: 'p_starter',
        branch: 'universal',
        branchName: 'Universal',
        tier: 1,
        name: 'Memorie Ancestrală',
        icon: '🌱',
        desc: 'Începi fiecare Rebirth cu +1.000 Energie de start per nivel.',
        baseCost: 1,
        costStep: 1,
        maxLevel: 10,
        req: null,
        reqLvl: 0,
        cx: 0.50, cy: 0.10
      },
      {
        id: 'p_dm_catalyst',
        branch: 'universal',
        branchName: 'Universal',
        tier: 2,
        name: 'Catalizator de Materie',
        icon: '🌌',
        desc: 'Fiecare Rebirth acordă +1 🔮 Materie Întunecată bonus per nivel.',
        baseCost: 3,
        costStep: 3,
        maxLevel: 5,
        req: 'p_starter',
        reqLvl: 2,
        cx: 0.50, cy: 0.20
      },
      {
        id: 'p_cosmic_resonance',
        branch: 'universal',
        branchName: 'Universal',
        tier: 3,
        name: 'Rezonanță Cuantică',
        icon: '✨',
        desc: 'Mărește bonusul de producție permanent al fiecărui Rebirth de la +15% la +18% (+3%/niv per Rebirth efectuat).',
        baseCost: 4,
        costStep: 4,
        maxLevel: 5,
        req: 'p_dm_catalyst',
        reqLvl: 2,
        cx: 0.42, cy: 0.30
      },
      {
        id: 'p_overclock_mastery',
        branch: 'universal',
        branchName: 'Universal',
        tier: 3,
        name: 'Supratensiune Tahionică',
        icon: '⚡',
        desc: 'Reduce timpul de reîncărcare al abilităților active cu 15%/niv.',
        baseCost: 4,
        costStep: 4,
        maxLevel: 3,
        req: 'p_dm_catalyst',
        reqLvl: 2,
        cx: 0.58, cy: 0.30
      },
      {
        id: 'p_transcendence',
        branch: 'universal',
        branchName: 'Universal',
        tier: 4,
        keystone: true,
        name: 'Transcendință Cosmică',
        icon: '👑',
        desc: 'Fiecare realizare deblocată oferă +1.5% Multiplicator Global (în loc de +1.0%).',
        baseCost: 15,
        costStep: 0,
        maxLevel: 1,
        req: 'p_cosmic_resonance',
        reqLvl: 2,
        cx: 0.50, cy: 0.42
      },

      // ==========================================
      // RAMURA 1: CALEA MANUALĂ (Clicker & Burst)
      // ==========================================
      {
        id: 'p_click',
        branch: 'manual',
        branchName: 'Calea Manuală',
        tier: 1,
        name: 'Impuls Gravitațional',
        icon: '⚡',
        desc: '+25% putere de click manuală per nivel.',
        baseCost: 1,
        costStep: 1,
        maxLevel: 20,
        req: null,
        reqLvl: 0,
        cx: 0.22, cy: 0.24
      },
      {
        id: 'p_combo_lock',
        branch: 'manual',
        branchName: 'Calea Manuală',
        tier: 2,
        name: 'Sincronizare Tahionică',
        icon: '⏱️',
        desc: 'Combo-ul de click nu mai scade timp de 4.8s și limita maximă crește la x4.0 (+0.3x/niv).',
        baseCost: 2,
        costStep: 2,
        maxLevel: 5,
        req: 'p_click',
        reqLvl: 3,
        cx: 0.15, cy: 0.38
      },
      {
        id: 'p_crit_devastator',
        branch: 'manual',
        branchName: 'Calea Manuală',
        tier: 3,
        name: 'Fisură Cuantică',
        icon: '🎯',
        desc: '+4% Șansă de Lovitură Critică și +50% Daune Critice per nivel.',
        baseCost: 3,
        costStep: 3,
        maxLevel: 5,
        req: 'p_combo_lock',
        reqLvl: 2,
        cx: 0.23, cy: 0.52
      },
      {
        id: 'p_chain_lightning',
        branch: 'manual',
        branchName: 'Calea Manuală',
        tier: 3,
        name: 'Descărcare în Lanț',
        icon: '🌩️',
        desc: 'Loviturile critice au 35% șansă să elibereze un arc de fulgere ce acordă instant 8x (+4x/niv) din click!',
        baseCost: 3,
        costStep: 3,
        maxLevel: 4,
        req: 'p_combo_lock',
        reqLvl: 2,
        cx: 0.08, cy: 0.52
      },
      {
        id: 'p_autoclick_spectral',
        branch: 'manual',
        branchName: 'Calea Manuală',
        tier: 4,
        name: 'Pulsar Spectral',
        icon: '🖱️',
        desc: 'Generează automat 4 click-uri/secundă (+4/niv) pe nucleu cu toate bonusurile de click.',
        baseCost: 4,
        costStep: 4,
        maxLevel: 5,
        req: 'p_crit_devastator',
        reqLvl: 2,
        cx: 0.16, cy: 0.67
      },
      {
        id: 'p_overdrive_combo',
        branch: 'manual',
        branchName: 'Calea Manuală',
        tier: 4,
        name: 'Rezonanță Frenetică',
        icon: '🔥',
        desc: 'Când combo-ul este la maxim (100%), fiecare click adaugă instant +12% (+10%/niv) din CPS-ul tău!',
        baseCost: 5,
        costStep: 4,
        maxLevel: 4,
        req: 'p_chain_lightning',
        reqLvl: 2,
        cx: 0.28, cy: 0.70
      },
      {
        id: 'p_supernova_burst',
        branch: 'manual',
        branchName: 'Calea Manuală',
        tier: 5,
        keystone: true,
        name: 'Hiper-Supernovă Instant',
        icon: '💥',
        desc: 'Loviturile critice au 12% șansă să declanșeze o Supernovă ce acordă instant 45s (+20s/niv) de CPS!',
        baseCost: 12,
        costStep: 6,
        maxLevel: 3,
        req: 'p_autoclick_spectral',
        reqLvl: 1,
        cx: 0.20, cy: 0.88
      },

      // ==========================================
      // RAMURA 2: CALEA PASIVĂ (Flotă & Eficiență AFK)
      // ==========================================
      {
        id: 'p_prod',
        branch: 'passive',
        branchName: 'Calea Pasivă',
        tier: 1,
        name: 'Rezonanță Întunecată',
        icon: '🔮',
        desc: '+25% la toată producția de Energie per nivel.',
        baseCost: 1,
        costStep: 1,
        maxLevel: 25,
        req: null,
        reqLvl: 0,
        cx: 0.50, cy: 0.56
      },
      {
        id: 'p_discount',
        branch: 'passive',
        branchName: 'Calea Pasivă',
        tier: 2,
        name: 'Arhitectură Sub-Spațială',
        icon: '📐',
        desc: 'Reduce costul tuturor generatoarelor și amplificatoarelor cu 4% per nivel.',
        baseCost: 2,
        costStep: 2,
        maxLevel: 10,
        req: 'p_prod',
        reqLvl: 3,
        cx: 0.42, cy: 0.67
      },
      {
        id: 'p_offline',
        branch: 'passive',
        branchName: 'Calea Pasivă',
        tier: 3,
        name: 'Cronos Cuantic',
        icon: '⌚',
        desc: '+10% eficiență la câștigul Offline per nivel (Bază: 40%) și mărește limita la 48h.',
        baseCost: 2,
        costStep: 3,
        maxLevel: 5,
        req: 'p_discount',
        reqLvl: 2,
        cx: 0.58, cy: 0.67
      },
      {
        id: 'p_quantum_overdrive',
        branch: 'passive',
        branchName: 'Calea Pasivă',
        tier: 3,
        name: 'Supraconductori de Flotă',
        icon: '🔋',
        desc: 'Generatoarele mari (de la Reactor Antimaterie în sus) produc cu +30% mai mult per nivel.',
        baseCost: 3,
        costStep: 3,
        maxLevel: 5,
        req: 'p_discount',
        reqLvl: 2,
        cx: 0.36, cy: 0.78
      },
      {
        id: 'p_fleet_synergy',
        branch: 'passive',
        branchName: 'Calea Pasivă',
        tier: 4,
        name: 'Rețea Neurală de Flotă',
        icon: '🤖',
        desc: 'Fiecare tip unic de generator deținut sporește producția globală cu +2% per nivel.',
        baseCost: 4,
        costStep: 3,
        maxLevel: 5,
        req: 'p_offline',
        reqLvl: 2,
        cx: 0.62, cy: 0.78
      },
      {
        id: 'p_automated_synergy',
        branch: 'passive',
        branchName: 'Calea Pasivă',
        tier: 4,
        name: 'Sinteză Autonomă AFK',
        icon: '🌌',
        desc: 'Pentru fiecare 15s fără click manual, producția pasivă crește treptat cu până la +15%/niv (max +60%)!',
        baseCost: 5,
        costStep: 4,
        maxLevel: 4,
        req: 'p_fleet_synergy',
        reqLvl: 2,
        cx: 0.50, cy: 0.81
      },
      {
        id: 'p_perpetual_void',
        branch: 'passive',
        branchName: 'Calea Pasivă',
        tier: 5,
        keystone: true,
        name: 'Motorul Perpetuu al Vidului',
        icon: '🌀',
        desc: '+50% producție pasivă multiplicată per nivel (x1.5, x2.0, x2.5)!',
        baseCost: 12,
        costStep: 6,
        maxLevel: 3,
        req: 'p_automated_synergy',
        reqLvl: 1,
        cx: 0.50, cy: 0.94
      },

      // ==========================================
      // RAMURA 3: CALEA ANOMALIILOR (Vânător Astral)
      // ==========================================
      {
        id: 'p_anom',
        branch: 'anomaly',
        branchName: 'Calea Anomaliilor',
        tier: 1,
        name: 'Atracție Astrală',
        icon: '☄️',
        desc: '+25% recompensă de energie și durată din Anomaliile Cuantice per nivel.',
        baseCost: 2,
        costStep: 1,
        maxLevel: 10,
        req: null,
        reqLvl: 0,
        cx: 0.78, cy: 0.24
      },
      {
        id: 'p_anom_frequency',
        branch: 'anomaly',
        branchName: 'Calea Anomaliilor',
        tier: 2,
        name: 'Busolă de Anomalii',
        icon: '🧭',
        desc: 'Sferele Cuantice apar pe ecran cu 25% mai frecvent per nivel.',
        baseCost: 2,
        costStep: 2,
        maxLevel: 5,
        req: 'p_anom',
        reqLvl: 3,
        cx: 0.85, cy: 0.38
      },
      {
        id: 'p_temporal_orbit',
        branch: 'anomaly',
        branchName: 'Calea Anomaliilor',
        tier: 3,
        name: 'Câmp Gravitațional Liniar',
        icon: '🧲',
        desc: 'Sferele plutesc cu 40% mai încet pe ecran și au o arie de prindere cu +35% mai mare per nivel.',
        baseCost: 3,
        costStep: 3,
        maxLevel: 3,
        req: 'p_anom_frequency',
        reqLvl: 2,
        cx: 0.76, cy: 0.52
      },
      {
        id: 'p_anomaly_extractor',
        branch: 'anomaly',
        branchName: 'Calea Anomaliilor',
        tier: 3,
        name: 'Extractor de Tahioni',
        icon: '💎',
        desc: 'La prinderea oricărei sfere, primești instant 45 secunde (+25s/niv) de CPS ca energie garantată!',
        baseCost: 3,
        costStep: 3,
        maxLevel: 4,
        req: 'p_anom_frequency',
        reqLvl: 2,
        cx: 0.92, cy: 0.52
      },
      {
        id: 'p_twin_anomaly',
        branch: 'anomaly',
        branchName: 'Calea Anomaliilor',
        tier: 4,
        name: 'Dublură Cuantică',
        icon: '✨',
        desc: '18% șansă per nivel ca la prinderea unei sfere să apară imediat încă o sferă rară bonus!',
        baseCost: 4,
        costStep: 4,
        maxLevel: 4,
        req: 'p_temporal_orbit',
        reqLvl: 1,
        cx: 0.84, cy: 0.67
      },
      {
        id: 'p_celestial_magnet',
        branch: 'anomaly',
        branchName: 'Calea Anomaliilor',
        tier: 4,
        name: 'Magnet Ceresc Automat',
        icon: '🛰️',
        desc: 'Dacă o sferă cuantică iese din ecran neprinsă, are 25% șansă per nivel să fie colectată automat de sistem!',
        baseCost: 5,
        costStep: 4,
        maxLevel: 4,
        req: 'p_anomaly_extractor',
        reqLvl: 2,
        cx: 0.72, cy: 0.70
      },
      {
        id: 'p_prismatic_storm',
        branch: 'anomaly',
        branchName: 'Calea Anomaliilor',
        tier: 5,
        keystone: true,
        name: 'Furtună Prismatică Astrală',
        icon: '🌈',
        desc: 'Toate buff-urile din sfere durează dublu (+100%) și 25% șansă la +1 🔮 Materie Întunecată la prindere!',
        baseCost: 12,
        costStep: 6,
        maxLevel: 3,
        req: 'p_twin_anomaly',
        reqLvl: 1,
        cx: 0.80, cy: 0.88
      }
    ];

    const PRESTIGE_UPGRADES_DATA = ALL_SKILL_TREE_NODES;

    // Construim 330 de Realizări Unice în 16 Colecții (6 Categorii de Filtrare)
    function buildAchievementsCatalog() {
      const list = [];

      // 1. Click-uri Manuale (25 realizări - cat: 'click')
      const clickTiers = [
        [1, 'Inițiere în Sistem', '👆'],
        [10, 'Contact Tactil', '👆'],
        [25, 'Degete Încălzite', '👆'],
        [50, 'Impuls Constant', '👆'],
        [100, 'Operator de Consolă', '⌨️'],
        [250, 'Degete de Titan', '⚡'],
        [500, 'Puls Mecanic', '🔨'],
        [1000, 'Ritm Cibernetic', '🎵'],
        [2000, 'Cadran Supersonic', '💨'],
        [3500, 'Viteza Sunetului', '💨'],
        [5000, 'Furtună Sinaptică', '🌩️'],
        [7500, 'Torent Manual', '🌊'],
        [10000, 'Viteza Luminii', '🔥'],
        [17500, 'Frecvență Laser', '⚡'],
        [25000, 'Rezonanță Tactilă', '🖐️'],
        [50000, 'Maestru al Impulsului', '💠'],
        [75000, 'Fuziune prin Atingere', '☀️'],
        [100000, 'Arhitectul Click-ului', '⚡'],
        [175000, 'Voință de Neclintit', '🛡️'],
        [250000, 'Reflexe Sub-Cuantice', '🌀'],
        [500000, 'Suprasarcină Neuronală', '🧠'],
        [1000000, 'Zeul Click-urilor (1M)', '👑'],
        [2500000, 'Puls Intergalactic (2.5M)', '🌌'],
        [5000000, 'Atingerea Eternității (5M)', '✨'],
        [10000000, 'Omnipotență Tactilă (10M)', '🏆']
      ];
      clickTiers.forEach(([val, name, icon], i) => {
        list.push({
          id: `a_click_${i + 1}`,
          cat: 'click',
          name,
          desc: `Efectuează ${val.toLocaleString('ro-RO')} click-uri manuale.`,
          icon,
          check: s => (s.totalClicks || 0) >= val
        });
      });

      // 2. Lovituri Critice (20 realizări - cat: 'click')
      const critTiers = [
        [1, 'Scânteie Critică', '🎯'],
        [5, 'Acuratețe Inițială', '🎯'],
        [15, 'Țintă Fixată', '🎯'],
        [35, 'Ochi de Șoim Cuantic', '🦅'],
        [75, 'Precizie Chirurgicală', '🎯'],
        [150, 'Laser Focalizat', '💥'],
        [300, 'Breză în Nucleu', '💥'],
        [600, 'Suprasarcină Critică', '💥'],
        [1000, 'Maestru al Punctului Slab', '⚡'],
        [2000, 'Rază Penetrantă', '🔦'],
        [4000, 'Detonare în Lanț', '🧨'],
        [7500, 'Fuziune Instabilă', '☄️'],
        [12500, 'Impact Devastator', '🌋'],
        [20000, 'Colaps Fotonic', '🌟'],
        [35000, 'Lunetist Astral', '🎯'],
        [50000, 'Infailibil (50K Critice)', '👑'],
        [100000, 'Arhitectul Criticei (100K)', '💎'],
        [200000, 'Supernovă la Click (200K)', '☀️'],
        [350000, 'Ruptură Dimensională (350K)', '🌀'],
        [500000, 'Zeul Loviturilor Critice (500K)', '🏆']
      ];
      critTiers.forEach(([val, name, icon], i) => {
        list.push({
          id: `a_crit_${i + 1}`,
          cat: 'click',
          name,
          desc: `Obține ${val.toLocaleString('ro-RO')} lovituri critice.`,
          icon,
          check: s => (s.totalCrits || 0) >= val
        });
      });

      // 3. Supraîncărcare / Overclock Fever >= 85% (10 realizări - cat: 'click')
      const feverTiers = [
        [1, 'Primul Overclock', '🔥'],
        [10, 'Nucleu Încins (10s)', '🔥'],
        [30, 'Fuziune la Roșu (30s)', '🌡️'],
        [60, 'Un Minut de Foc (60s)', '⚡'],
        [180, 'Reactor Supraîncărcat (3m)', '☄️'],
        [360, 'Plasmă Nestăvilită (6m)', '☀️'],
        [600, 'Frenezie Termică (10m)', '🌋'],
        [1200, 'Stăpânul Supraîncărcării (20m)', '💥'],
        [2400, 'Inimă de Supernovă (40m)', '🌟'],
        [3600, 'Oră în Overclock Pur (1h)', '👑']
      ];
      feverTiers.forEach(([val, name, icon], i) => {
        list.push({
          id: `a_fever_${i + 1}`,
          cat: 'click',
          name,
          desc: `Menține bara de Supraîncărcare peste 85% timp de ${val} secunde în total.`,
          icon,
          check: s => (s.feverSeconds || 0) >= val
        });
      });

      // 4. Energie Totală Produsă (30 realizări - cat: 'energy')
      const energyTiers = [
        [50, 'Micro-Scânteie', '🔋'],
        [250, 'Scânteie Inițială', '🔋'],
        [1000, 'Condensator Încărcat (1K)', '🔋'],
        [5000, 'Kilowatt Cuantic (5K)', '💡'],
        [25000, 'Generator Local (25K)', '💡'],
        [100000, 'Rețea Urbană (100K)', '🔌'],
        [500000, 'Centrală Orbitală (500K)', '⚡'],
        [2e6, 'Megawatt Digital (2M)', '🌟'],
        [10e6, 'Fuziune Stabilizată (10M)', '🌟'],
        [50e6, 'Nori de Plasmă (50M)', '☀️'],
        [250e6, 'Putere Planetară (250M)', '🌍'],
        [1e9, 'Gigawatt Cosmic (1B)', '🪐'],
        [5e9, 'Soare Artificial (5B)', '☀️'],
        [25e9, 'Nebuloasă Energetică (25B)', '✨'],
        [100e9, 'Câmp de Forță Galactic (100B)', '🛸'],
        [500e9, 'Nuclee Gemene (500B)', '⚛️'],
        [2.5e12, 'Terawatt Interstelar (2.5T)', '🪐'],
        [15e12, 'Pulsar Capturat (15T)', '💫'],
        [100e12, 'Quasar Domolit (100T)', '🌠'],
        [1e15, 'Stăpânul Galaxiei (1Qa)', '🌌'],
        [25e15, 'Cluster Galactic (25Qa)', '🌌'],
        [500e15, 'Super-Roi Cosmic (500Qa)', '✨'],
        [10e18, 'Energia Big Bang-ului (10Qi)', '👑'],
        [250e18, 'Orizont Multiversal (250Qi)', '🌀'],
        [5e21, 'Putere Sextilionară (5Sx)', '💎'],
        [100e21, 'Matrice Absolută (100Sx)', '🔮'],
        [5e24, 'Imperiu Septilionar (5Sp)', '🛸'],
        [5e27, 'Dincolo de Octilion (5Oc)', '🌟'],
        [5e30, 'Voința Nonilionului (5No)', '⚡'],
        [1e33, 'Arhitectul Decilionului (1Dc)', '🏆']
      ];
      energyTiers.forEach(([val, name, icon], i) => {
        list.push({
          id: `a_energy_${i + 1}`,
          cat: 'energy',
          name,
          desc: `Adună ${formatNumber(val)} Energie totală (toate timpurile).`,
          icon,
          check: s => (s.lifetimeEnergy || 0) >= val
        });
      });

      // 5. Viteză Pasivă CPS (25 realizări - cat: 'energy')
      const cpsTiers = [
        [0.4, 'Primul Flux Pasiv', '⚙️'],
        [2, 'Flux Continuu', '⚙️'],
        [10, 'Micro-Curent', '🔌'],
        [35, 'Turbină Automată', '🌀'],
        [100, 'Reactor Activ (100/s)', '⚛️'],
        [400, 'Injecție de Plasmă (400/s)', '🔥'],
        [1500, 'Torent Fotonic (1.5K/s)', '⚡'],
        [6000, 'Uzina Orbitală (6K/s)', '🛰️'],
        [25000, 'Râu de Quanta (25K/s)', '🌊'],
        [100000, 'Cascadă Tahionică (100K/s)', '💠'],
        [400000, 'Reactor Hiper-Dens (400K/s)', '🔋'],
        [1.5e6, 'Frecvență Megawatt (1.5M/s)', '🚀'],
        [7.5e6, 'Hiper-Producție (7.5M/s)', '🌟'],
        [35e6, 'Colector Stelar (35M/s)', '☀️'],
        [150e6, 'Coroană Solară (150M/s)', '☀️'],
        [1e9, 'Viteză Gigawatt (1B/s)', '🪐'],
        [10e9, 'Matrice în Plină Forță (10B/s)', '🌌'],
        [100e9, 'Omnipotență Energetică (100B/s)', '👑'],
        [1e12, 'Flux Terawatt (1T/s)', '💫'],
        [25e12, 'Pulsul Quasarului (25T/s)', '🌠'],
        [500e12, 'Furtună Galactică (500T/s)', '🌀'],
        [10e15, 'Motorul Quadrilionului (10Qa/s)', '🔮'],
        [500e15, 'Singularitate Activă (500Qa/s)', '🕳️'],
        [25e18, 'Torent Quintilionar (25Qi/s)', '💎'],
        [1e21, 'Viteză Cosmică Absolută (1Sx/s)', '🏆']
      ];
      cpsTiers.forEach(([val, name, icon], i) => {
        list.push({
          id: `a_cps_${i + 1}`,
          cat: 'energy',
          name,
          desc: `Atinge o producție pasivă de ${formatNumber(val)}/sec.`,
          icon,
          check: s => Math.max(s.maxCps || 0, getCPS()) >= val
        });
      });

      // 6. Flotă Totală de Generatoare (20 realizări - cat: 'fleet')
      const fleetTiers = [
        [1, 'Primul Automat', '🤖'],
        [3, 'Trio Cibernetic', '🤖'],
        [5, 'Echipă de Roboți', '🤖'],
        [10, 'Grup de Lucru', '🔧'],
        [20, 'Atelier Cibernetic', '🔧'],
        [35, 'Linie de Asamblare', '🏭'],
        [50, 'Fabrică Autonomă', '🏭'],
        [75, 'Complex Industrial', '🏗️'],
        [100, 'Metropolă Mecanizată', '🏙️'],
        [150, 'Rețea Continentală', '🌐'],
        [200, 'Armată Automată', '🤖'],
        [300, 'Imperiu Cibernetic', '🛸'],
        [450, 'Planetă-Mașină', '🪐'],
        [600, 'Roiul lui Dyson', '☀️'],
        [800, 'Flotă Interstelară', '🚀'],
        [1000, 'Civilizație Tip III (1.000)', '👑'],
        [1500, 'Legiunea de Oțel (1.500)', '⚙️'],
        [2000, 'Arhiva Galactică (2.000)', '🌌'],
        [3000, 'Mecanism Universal (3.000)', '💠'],
        [5000, 'Stăpânul Suprem al Flotei (5.000)', '🏆']
      ];
      fleetTiers.forEach(([val, name, icon], i) => {
        list.push({
          id: `a_fleet_${i + 1}`,
          cat: 'fleet',
          name,
          desc: `Deține ${val.toLocaleString('ro-RO')} generatoare în total.`,
          icon,
          check: () => getTotalGenerators() >= val
        });
      });

      // 7. Maeștri pe Fiecare Tip de Generator (10 generatoare x 8 praguri = 80 realizări - cat: 'fleet')
      const genMilestones = [
        [1, 'Prototip'],
        [5, 'Patrulă'],
        [10, 'Escadrilă'],
        [25, 'Batalion'],
        [50, 'Divizie'],
        [100, 'Supremație'],
        [150, 'Armadă'],
        [250, 'Hegemonie']
      ];
      GENERATORS_DATA.forEach((gen) => {
        genMilestones.forEach(([cnt, prefix]) => {
          list.push({
            id: `a_${gen.id}_${cnt}`,
            cat: 'fleet',
            name: `${prefix}: ${gen.name}`,
            desc: `Deține ${cnt}x ${gen.name}.`,
            icon: gen.icon,
            check: s => Boolean(s.generators && (s.generators[gen.id] || 0) >= cnt)
          });
        });
      });

      // 8. Singularități / Rebirth-uri (20 realizări - cat: 'prestige')
      const presTiers = [
        [1, 'Dincolo de Orizont (#1)', '🕳️'],
        [2, 'A Doua Renaștere (#2)', '🌌'],
        [3, 'Călător prin Singularitate (#3)', '🌀'],
        [4, 'Patru Dimensiuni (#4)', '🔮'],
        [5, 'Arhitectul Timpului (#5)', '⏳'],
        [7, 'Ciclul Etern (#7)', '🔮'],
        [10, 'Maestru al Renașterii (#10)', '🌟'],
        [12, 'Apostolul Vidului (#12)', '🌑'],
        [15, 'Transcendență Cuantică (#15)', '🛸'],
        [18, 'Păzitorul Pragului (#18)', '⚡'],
        [22, 'Conștiință Cosmică (#22)', '👁️'],
        [26, 'Voință Astrală (#26)', '✨'],
        [30, 'Creator de Universuri (#30)', '🌌'],
        [35, 'Domnitorul Ciclurilor (#35)', '🪐'],
        [40, 'Nemuritor Cuantic (#40)', '💎'],
        [50, 'Eternitatea Absolută (#50)', '👑'],
        [60, 'Suveran Multiversal (#60)', '🌌'],
        [75, 'Ascensiune Divină (#75)', '☀️'],
        [90, 'Originea Tuturor (#90)', '🌠'],
        [100, 'Rebirth Centenar (#100)', '🏆']
      ];
      presTiers.forEach(([val, name, icon], i) => {
        list.push({
          id: `a_pres_${i + 1}`,
          cat: 'prestige',
          name,
          desc: `Efectuează ${val} Rebirth-uri (Singularități) pas-cu-pas.`,
          icon,
          check: s => (s.prestigeCount || 0) >= val
        });
      });

      // 9. Materie Întunecată Deținută (15 realizări - cat: 'prestige')
      const dmTiers = [
        [1, 'Primul Cristal Întunecat', '🔮'],
        [3, 'Esentă din Abis', '🔮'],
        [6, 'Rezervor de Antimaterie', '🔮'],
        [12, 'Colecționar din Vid', '🔮'],
        [20, 'Nucleu de Materie Neagră', '🌑'],
        [35, 'Fântâna Întunecată', '🌑'],
        [50, 'Trezorerie Intergalactică', '💎'],
        [75, 'Sceptrul Singularității', '🔮'],
        [110, 'Suveranul Materiei Întunecate', '👑'],
        [160, 'Abisul Strălucitor', '✨'],
        [250, 'Banca Multiversului (250)', '💎'],
        [400, 'Oracolul Antimateriei (400)', '👁️'],
        [750, 'Ocean de Materie Neagră (750)', '🌌'],
        [1250, 'Împăratul Vidului (1.250)', '👑'],
        [2500, 'Tezaurul Cosmic Absolut (2.500)', '🏆']
      ];
      dmTiers.forEach(([val, name, icon], i) => {
        list.push({
          id: `a_dm_${i + 1}`,
          cat: 'prestige',
          name,
          desc: `Deține simultan ${val.toLocaleString('ro-RO')} 🔮 Materie Întunecată.`,
          icon,
          check: s => (s.darkMatter || 0) >= val
        });
      });

      // 10. Arborele de Singularitate - Nivele Prestigiu (10 realizări - cat: 'prestige')
      const presTreeTiers = [
        [1, 'Inițiat în Singularitate', '🔮'],
        [3, 'Atingerea Vidului', '🔮'],
        [6, 'Arhitect Sub-Spațial', '📐'],
        [10, 'Rezonanță Permanentă', '🌌'],
        [15, 'Evoluție Transcendentă', '✨'],
        [22, 'Codul Eternității', '🧬'],
        [30, 'Maestru al Arborelui Astral', '🌳'],
        [45, 'Dominație în Singularitate', '💎'],
        [60, 'Aproape de Omnisciență', '👁️'],
        [80, 'Arborele de Singularitate Complet (80/80)', '🏆']
      ];
      presTreeTiers.forEach(([val, name, icon], i) => {
        list.push({
          id: `a_ptree_${i + 1}`,
          cat: 'prestige',
          name,
          desc: `Deblochează în total ${val} nivele în Arborele de Singularitate.`,
          icon,
          check: s => Object.values(s.prestigeUpgrades || {}).reduce((a, b) => a + b, 0) >= val
        });
      });

      // 11. Cercetare Tehnologică - Nivele totale Click & Tech (15 realizări - cat: 'tech')
      const techTiers = [
        [1, 'Primul Upgrade', '🔬'],
        [5, 'Ucenic Cercetător', '🔬'],
        [12, 'Laborator Experimental', '🧪'],
        [20, 'Inginer Cuantic', '🛠️'],
        [30, 'Laborator Avansat', '🧪'],
        [45, 'Institutul Cuantic', '🏛️'],
        [60, 'Academia de Științe', '🎓'],
        [80, 'Tehnologie Supremă', '🧠'],
        [100, 'Centenar Tehnologic', '⚡'],
        [125, 'Rețea Neurală Completă', '🌐'],
        [150, 'Savant Interstelar', '🚀'],
        [180, 'Cercetare de Vârf', '💠'],
        [210, 'Arhitectul Viitorului', '🌟'],
        [240, 'Aproape de Perfecțiune', '👑'],
        [265, 'Tehnologie Maximă Absolută (265/265)', '🏆']
      ];
      techTiers.forEach(([val, name, icon], i) => {
        list.push({
          id: `a_tech_${i + 1}`,
          cat: 'tech',
          name,
          desc: `Cumpără în total ${val} nivele de Tehnologii & Click într-un run.`,
          icon,
          check: s => Object.values(s.clickUpgrades || {}).reduce((a, b) => a + b, 0) >= val
        });
      });

      // 12. Specialiști pe Fiecare Tehnologie (6 tehnologii x 3 praguri = 18 realizări - cat: 'tech')
      CLICK_UPGRADES_DATA.forEach((upg) => {
        const midLvl = Math.max(5, Math.floor(upg.maxLevel * 0.4));
        const tiers = [
          [5, 'Inițiat'],
          [midLvl, 'Specialist'],
          [upg.maxLevel, 'Maxim']
        ];
        tiers.forEach(([lvlReq, label], idx) => {
          list.push({
            id: `a_upg_${upg.id}_${idx + 1}`,
            cat: 'tech',
            name: `${label}: ${upg.name}`,
            desc: `Atinge Nivelul ${lvlReq} la tehnologia "${upg.name}".`,
            icon: upg.icon,
            check: s => Boolean(s.clickUpgrades && (s.clickUpgrades[upg.id] || 0) >= lvlReq)
          });
        });
      });

      // 13. Comandant Tactic - Abilități Active Folosite (10 realizări - cat: 'tech')
      const skillTiers = [
        [1, 'Primul Impuls Tactic', '⚡'],
        [3, 'Operator de Abilități', '🎯'],
        [7, 'Manevră Temporală', '⏳'],
        [15, 'Tactician Orbital', '🛰️'],
        [30, 'Maestru al Cooldown-ului', '⚡'],
        [60, 'Comandant de Asalt', '💥'],
        [100, 'Strateg Cuantic (100)', '🧠'],
        [200, 'Arhitectul Distorsiunii (200)', '🌀'],
        [350, 'Voința Comandantului (350)', '👑'],
        [500, 'Legenda Abilităților Active (500)', '🏆']
      ];
      skillTiers.forEach(([val, name, icon], i) => {
        list.push({
          id: `a_skill_${i + 1}`,
          cat: 'tech',
          name,
          desc: `Activează abilitățile speciale (Impuls EM, Hiper-Critică, Distorsiune) de ${val} ori.`,
          icon,
          check: s => (s.skillsUsed || 0) >= val
        });
      });

      // 14. Anomalii Cuantice Aurii (12 realizări - cat: 'secret')
      const anomTiers = [
        [1, 'Vânător de Anomalii', '☄️'],
        [3, 'Observator Astral', '🔭'],
        [5, 'Captură Orbitală', '☄️'],
        [10, 'Colecționar Astral', '🌠'],
        [20, 'Îmblânzitor de Comete', '🌠'],
        [35, 'Radar Sub-Spațial', '📡'],
        [60, 'Maestru al Fluctuațiilor', '✨'],
        [100, 'Vânător Interdimensional', '🌌'],
        [175, 'Arhiva de Aur', '🏆'],
        [250, 'Păzitorul Cometelor (250)', '💫'],
        [350, 'Stăpânul Anomaliilor (350)', '👑'],
        [500, 'Zeul Anomaliilor Aurii (500)', '🏆']
      ];
      anomTiers.forEach(([val, name, icon], i) => {
        list.push({
          id: `a_anom_${i + 1}`,
          cat: 'secret',
          name,
          desc: `Capturează ${val.toLocaleString('ro-RO')} Anomalii Cuantice Aurii.`,
          icon,
          check: s => (s.anomaliesCaught || 0) >= val
        });
      });

      // 15. Veterani în Timp (10 realizări - cat: 'secret')
      const timeTiers = [
        [60, '1 Minut în Orbită', '⏱️', 'Petrece 1 minut activ în simulare.'],
        [300, '5 Minute de Fuziune', '⏱️', 'Petrece 5 minute active în simulare.'],
        [600, '10 Minute în Orbită', '⏱️', 'Petrece 10 minute active în simulare.'],
        [1800, 'Jumătate de Oră Cuantică', '⌚', 'Petrece 30 minute active în simulare.'],
        [3600, 'Comandant de Gardă (1h)', '⌚', 'Petrece 1 oră activă în simulare.'],
        [7200, 'Explorator Deep-Space (2h)', '🛰️', 'Petrece 2 ore active în simulare.'],
        [18000, 'Veteranul Nexusului (5h)', '🎖️', 'Petrece 5 ore active în simulare.'],
        [36000, 'Amiralul Timpului (10h)', '🌟', 'Petrece 10 ore active în simulare.'],
        [86400, 'Gardianul Etern (24h)', '👑', 'Petrece 24 ore active în simulare.'],
        [180000, 'Nemuritorul din Quantum Nexus (50h)', '🏆', 'Petrece 50 ore active în simulare.']
      ];
      timeTiers.forEach(([val, name, icon, desc], i) => {
        list.push({
          id: `a_time_${i + 1}`,
          cat: 'secret',
          name,
          desc,
          icon,
          check: s => (s.playTimeSeconds || 0) >= val
        });
      });

      // 16. Colecționarul Cosmic & Sinergii Complete (10 realizări - cat: 'secret')
      const fullSetCounts = [
        [1, 'Arhitectul Tuturor Sistemelor (1x Tot)', '🌐'],
        [5, 'Armonie Tehnologică (5x Tot)', '🎼'],
        [10, 'Sinergie Galactică (10x Tot)', '🌌'],
        [25, 'Matricea Completă (25x Tot)', '💠'],
        [50, 'Imperiul celor 10 Motoare (50x Tot)', '👑'],
        [100, 'Perfecțiunea Absolută (100x Tot)', '🏆']
      ];
      fullSetCounts.forEach(([minEach, name, icon], i) => {
        list.push({
          id: `a_synergy_all_${i + 1}`,
          cat: 'secret',
          name,
          desc: `Deține simultan cel puțin ${minEach}x din FIECARE dintre cele 10 tipuri de generatoare.`,
          icon,
          check: s => GENERATORS_DATA.every(g => (s.generators && (s.generators[g.id] || 0) >= minEach))
        });
      });

      const metaAchTiers = [
        [25, 'Colecționar de Trofee (25)', '🥉'],
        [75, 'Vânător de Glorie (75)', '🥈'],
        [150, 'Maestru Enciclopedic (150)', '🥇'],
        [250, 'Legenda Supremă Nexus (250)', '👑']
      ];
      metaAchTiers.forEach(([reqAch, name, icon], i) => {
        list.push({
          id: `a_meta_${i + 1}`,
          cat: 'secret',
          name,
          desc: `Deblochează cel puțin ${reqAch} de realizări în Quantum Nexus.`,
          icon,
          check: s => (s.unlockedAchievements || []).length >= reqAch
        });
      });

      // 18. Furtuni Stelare & Vreme Cosmică (cat: 'special')
      const stormAchievements = [
        { id: 'a_storm_1', name: 'Vânător de Furtuni', desc: 'Experimentează prima ta Furtună Cosmică.', icon: '🌪️', check: s => (s.totalStormsExperienced || 0) >= 1 },
        { id: 'a_storm_2', name: 'Meteorolog Interstelar', desc: 'Supraviețuiește la 5 Furtuni Cosmice.', icon: '⚡', check: s => (s.totalStormsExperienced || 0) >= 5 },
        { id: 'a_storm_3', name: 'Navigator de Vid', desc: 'Supraviețuiește la 20 de Furtuni Cosmice.', icon: '🌌', check: s => (s.totalStormsExperienced || 0) >= 20 },
        { id: 'a_meteor_1', name: 'Impact Cuantic', desc: 'Pulverizează primul tău meteorit cuantic în cădere.', icon: '☄️', check: s => (s.meteorsCaught || 0) >= 1 },
        { id: 'a_meteor_2', name: 'Ploaie de Diamante', desc: 'Pulverizează 15 meteoriți cuantici.', icon: '💎', check: s => (s.meteorsCaught || 0) >= 15 },
        { id: 'a_meteor_3', name: 'Distrugător de Comete', desc: 'Pulverizează 50 de meteoriți cuantici.', icon: '🌠', check: s => (s.meteorsCaught || 0) >= 50 }
      ];
      stormAchievements.forEach(a => {
        list.push({ ...a, cat: 'special' });
      });

      // Clasificare automată în 3 Trepte de Raritate inspirate de sistemul Xbox Gamerscore (Standard, Rară, Mitică)
      const groups = {};
      list.forEach(ach => {
        const groupKey = ach.id.replace(/_\d+$/, '');
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(ach);
      });

      Object.values(groups).forEach(groupList => {
        const total = groupList.length;
        groupList.forEach((ach, idx) => {
          let ratio;
          if (total === 1) {
            ratio = 0.5;
          } else if (total === 3) {
            // Pentru triplete (ex: Inițiat, Specialist, Maxim)
            ratio = idx === 0 ? 0.2 : (idx === 1 ? 0.65 : 0.95);
          } else {
            ratio = idx / (total - 1);
          }

          if (ratio < 0.52) {
            // 1. STANDARD (~55% din realizări - etape timpurii și de mijloc)
            ach.rarity = 'standard';
            ach.rarityLabel = 'REALIZARE STANDARD';
            ach.rarityTag = '🥉 STANDARD';
            ach.rarityScore = '⭐ +1% PROD';
            const pctVal = Math.round(86 - ratio * 48); // 86% coborând spre 61%
            ach.rarityPct = `${pctVal}%`;
            ach.rarityDisplay = `🥉 Realizare Standard • ${ach.rarityPct}`;
          } else if (ratio < 0.84) {
            // 2. RARĂ (~30% din realizări - etape grele, late-game / Diamond Rare ca la Xbox)
            ach.rarity = 'rare';
            ach.rarityLabel = 'REALIZARE RARĂ';
            ach.rarityTag = '💎 RARĂ';
            ach.rarityScore = '💎 +1% PROD';
            const progressInRare = (ratio - 0.52) / (0.84 - 0.52);
            const pctVal = Math.max(3.5, +(16.5 - progressInRare * 12.0).toFixed(1)); // 16.5% -> 4.5%
            ach.rarityPct = `${pctVal}%`;
            ach.rarityDisplay = `💎 Realizare Rară • Doar ${ach.rarityPct}`;
          } else {
            // 3. MITICĂ (~15% din realizări - etape supreme, endgame extrem de rar / Cosmic God Tier)
            ach.rarity = 'mythic';
            ach.rarityLabel = 'REALIZARE MITICĂ';
            ach.rarityTag = '👑 MITICĂ';
            ach.rarityScore = '👑 +1% PROD';
            const progressInMythic = (ratio - 0.84) / (1.0 - 0.84);
            const pctVal = Math.max(0.1, +(1.2 - progressInMythic * 1.05).toFixed(1)); // 1.2% -> 0.15%
            ach.rarityPct = `${pctVal}%`;
            ach.rarityDisplay = `👑 Realizare Mitică • Top ${ach.rarityPct}`;
          }
        });
      });

      return list;
    }

    const ACHIEVEMENTS_DATA = buildAchievementsCatalog();
    let currentAchFilter = 'all';

