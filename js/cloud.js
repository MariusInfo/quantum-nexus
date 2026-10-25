    /********************************************************************
     * 11.5. MOTOR CLOUD SAVE (GOOGLE FIREBASE - 100% GRATUIT)
     *       + AUTO-SYNC SILENȚIOS OFFLINE -> ONLINE + AUTO-UPDATE LIVE
     *       + NAVIGARE MOBIL & INSTALARE PWA (MACBOOK / PC / ANDROID / iOS)
     ********************************************************************/
    const APP_VERSION = '3.9.6';
    const APP_BUILD = 396;
    // URL-ul oficial de pe GitHub Pages pentru verificarea automată de Update (și în aplicațiile .exe / .dmg):
    const REMOTE_UPDATE_BASE_URL = 'https://mariusinfo.github.io/quantum-nexus';

    // Configurația oficială Google Firebase (Proiect: quantum-nexus-ac596)
    const DEFAULT_FIREBASE_CONFIG = {
      apiKey: "AIzaSyB2UK9uP3s2pk3c0BrqX6fnnm5oiRNh47c",
      authDomain: "quantum-nexus-ac596.firebaseapp.com",
      databaseURL: "https://quantum-nexus-ac596-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "quantum-nexus-ac596",
      storageBucket: "quantum-nexus-ac596.firebasestorage.app",
      messagingSenderId: "831458696131",
      appId: "1:831458696131:web:c4998dfd45cf55662ebb76"
    };
    const DEFAULT_FIREBASE_API_KEY = DEFAULT_FIREBASE_CONFIG.apiKey;
    const DEFAULT_FIREBASE_DB_URL = DEFAULT_FIREBASE_CONFIG.databaseURL;

    const CLOUD_CFG_KEY = 'QUANTUM_NEXUS_FIREBASE_CFG';
    const CLOUD_SESSION_KEY = 'QUANTUM_NEXUS_FIREBASE_SESSION';
    const PENDING_SYNC_KEY = 'QUANTUM_NEXUS_PENDING_SYNC';
    const INSTALLED_FLAG_KEY = 'QUANTUM_NEXUS_INSTALLED';

    let firebaseConfig = {
      apiKey: DEFAULT_FIREBASE_API_KEY,
      databaseURL: DEFAULT_FIREBASE_DB_URL
    };
    let cloudSession = null;
    let pendingCloudSync = localStorage.getItem(PENDING_SYNC_KEY) === 'true';
    let isSyncingNow = false;
    let deferredInstallPrompt = null;
    let swRegistration = null;
    let updateCountdownTimer = null;

    function persistCloudSession(sess) {
      cloudSession = sess;
      try {
        if (sess) {
          const raw = JSON.stringify(sess);
          localStorage.setItem(CLOUD_SESSION_KEY, raw);
          document.cookie = `${CLOUD_SESSION_KEY}=${encodeURIComponent(raw)}; max-age=31536000; path=/; SameSite=Lax`;
        } else {
          localStorage.removeItem(CLOUD_SESSION_KEY);
          document.cookie = `${CLOUD_SESSION_KEY}=; max-age=0; path=/`;
        }
      } catch (e) {}
    }

    function readPersistedCloudSession() {
      try {
        // 1. Verifică bridge-ul din window.name (pentru tranziția .exe file:// -> https:// la auto-update)
        if (window.name && window.name.startsWith('{')) {
          try {
            const bridge = JSON.parse(window.name);
            if (bridge && bridge.qn_bridge) {
              if (bridge.installed) {
                localStorage.setItem(INSTALLED_FLAG_KEY, 'true');
              }
              if (bridge.session && !localStorage.getItem(CLOUD_SESSION_KEY)) {
                localStorage.setItem(CLOUD_SESSION_KEY, JSON.stringify(bridge.session));
              }
              if (bridge.save) {
                const curRaw = localStorage.getItem(SAVE_KEY);
                const curObj = curRaw ? JSON.parse(curRaw) : null;
                if (!curObj || (bridge.save.lifetimeEnergy || 0) > (curObj.lifetimeEnergy || 0)) {
                  localStorage.setItem(SAVE_KEY, JSON.stringify(bridge.save));
                  loadGame();
                  renderAll();
                }
              }
              window.name = bridge.installed ? 'qn_desktop_installed' : '';
            }
          } catch (e) {}
        }

        // 2. Verifică localStorage
        const savedSess = localStorage.getItem(CLOUD_SESSION_KEY);
        if (savedSess) {
          return JSON.parse(savedSess);
        }

        // 3. Fallback cookie
        const match = document.cookie.match(new RegExp('(?:^|; )' + CLOUD_SESSION_KEY + '=([^;]*)'));
        if (match && match[1]) {
          const parsed = JSON.parse(decodeURIComponent(match[1]));
          localStorage.setItem(CLOUD_SESSION_KEY, JSON.stringify(parsed));
          return parsed;
        }
      } catch (e) {}
      return null;
    }

    function setPendingCloudSync(val) {
      pendingCloudSync = Boolean(val);
      if (pendingCloudSync) {
        localStorage.setItem(PENDING_SYNC_KEY, 'true');
      } else {
        localStorage.removeItem(PENDING_SYNC_KEY);
      }
      updateCloudUI();
    }

    async function initCloudSystem() {
      try {
        const savedSess = readPersistedCloudSession();
        if (savedSess && (savedSess.access_token || savedSess.refresh_token)) {
          cloudSession = savedSess;
          updateCloudUI();
          if (navigator.onLine) {
            // Reînnoim automat și silențios token-ul Firebase la pornire ca să nu expire niciodată sesiunea
            await refreshCloudTokenIfNeeded();
            updateCloudUI();
            if (pendingCloudSync) {
              await syncOfflineProgressToServer();
            } else {
              await cloudPullSave(false);
            }
          }
        } else {
          updateCloudUI();
        }
      } catch (e) {
        console.warn('Firebase Cloud init warning:', e);
      }
    }

    function isFirebaseConfigured() {
      return Boolean(
        firebaseConfig.apiKey &&
        firebaseConfig.databaseURL &&
        firebaseConfig.databaseURL.startsWith('http')
      );
    }

    function openSettingsModal() {
      syncMusicUI();
      syncCosmicBgUI();
      syncStormQualityUI();
      syncFpsCounterUI();
      if (document.getElementById('btnSound')) {
        document.getElementById('btnSound').innerText = state.soundEnabled ? '🔊 Sunet: ON' : '🔇 Sunet: OFF';
      }
      const setVer = document.getElementById('settingsVersionText');
      if (setVer) setVer.innerText = `v${APP_VERSION}`;
      updateCloudUI();
      const modal = document.getElementById('settingsModal');
      if (modal) modal.classList.add('open');
    }

    function closeSettingsModal() {
      const modal = document.getElementById('settingsModal');
      if (modal) modal.classList.remove('open');
    }

    // =========================================================================
    // V3.2.0: SISTEM SOCIAL & PREZENȚĂ GALACTICĂ ÎN TIMP REAL (FIREBASE)
    // =========================================================================
    let liveCommandersList = [];
    let currentSocialSubnav = 'live';
    const SOCIAL_AVATARS = ['⚛️', '🚀', '🔮', '👑', '🛡️', '🌌', '⚡', '🤖'];
    let selectedSocialAvatar = '⚛️';

    function initSocialSystem() {
      if (!state.social) {
        state.social = {
          avatar: '⚛️',
          title: 'Novice Cuantic',
          statusMsg: 'Cercetez Vidul Cuantic',
          friends: []
        };
      }
      renderSocialHero();
      renderSocialAvatarPicker();
      renderSocialTitleOptions();
    }

    function renderSocialHero() {
      const s = state.social || { avatar: '⚛️', title: 'Novice Cuantic', statusMsg: 'Cercetez Vidul Cuantic' };
      const avEl = document.getElementById('socialHeroAvatar');
      const nameEl = document.getElementById('socialHeroName');
      const titleEl = document.getElementById('socialHeroTitle');
      const msgEl = document.getElementById('socialHeroStatusMsg');
      const cloudStatusEl = document.getElementById('socialHeroCloudStatus');

      if (avEl) avEl.innerText = s.avatar || '⚛️';
      if (nameEl) nameEl.innerText = getCommanderDisplayName();
      if (titleEl) titleEl.innerText = s.title || 'Novice Cuantic';
      if (msgEl) msgEl.innerText = s.statusMsg || 'Cercetez Vidul Cuantic';

      if (cloudStatusEl) {
        const loggedIn = Boolean(cloudSession && cloudSession.access_token && cloudSession.user);
        if (loggedIn) {
          cloudStatusEl.innerText = '🟢 Sincronizat Live cu Google Firebase';
          cloudStatusEl.style.color = '#6ee7b7';
        } else {
          cloudStatusEl.innerText = '⚠️ Mod Local (Conectează-te la Cloud pentru a fi văzut online)';
          cloudStatusEl.style.color = '#fde047';
        }
      }
    }

    function openSocialModal() {
      initSocialSystem();
      fetchLiveCommanders(false);
      switchSocialSubnav(currentSocialSubnav || 'live');
      const modal = document.getElementById('socialModal');
      if (modal) modal.classList.add('open');
      playTone(720, 'sine', 0.1, 0.08);
    }

    function closeSocialModal() {
      const modal = document.getElementById('socialModal');
      if (modal) modal.classList.remove('open');
    }

    function switchSocialSubnav(tab) {
      currentSocialSubnav = tab;
      const btnLive = document.getElementById('btnSocialSubnavLive');
      const btnFriends = document.getElementById('btnSocialSubnavFriends');
      const btnProfile = document.getElementById('btnSocialSubnavProfile');
      const paneLive = document.getElementById('paneSocialLive');
      const paneFriends = document.getElementById('paneSocialFriends');
      const paneProfile = document.getElementById('paneSocialProfile');

      if (btnLive) btnLive.classList.toggle('active', tab === 'live');
      if (btnFriends) btnFriends.classList.toggle('active', tab === 'friends');
      if (btnProfile) btnProfile.classList.toggle('active', tab === 'profile');

      if (paneLive) paneLive.style.display = tab === 'live' ? 'block' : 'none';
      if (paneFriends) paneFriends.style.display = tab === 'friends' ? 'block' : 'none';
      if (paneProfile) paneProfile.style.display = tab === 'profile' ? 'block' : 'none';

      if (tab === 'live') {
        renderOnlineCommandersList();
      } else if (tab === 'friends') {
        renderFriendsList();
      } else if (tab === 'profile') {
        populateSocialProfileForm();
      }
    }

    async function updatePresence(online = true) {
      if (!isFirebaseConfigured() || !cloudSession || !cloudSession.access_token || !cloudSession.user) return;
      try {
        const uid = encodeURIComponent(cloudSession.user.id);
        const now = Date.now();
        const payload = {
          uid: cloudSession.user.id,
          name: getCommanderDisplayName(),
          online: Boolean(online),
          last_seen: now,
          avatar: (state.social && state.social.avatar) || '⚛️',
          title: (state.social && state.social.title) || 'Novice Cuantic',
          status_msg: (state.social && state.social.statusMsg) || 'Cercetez Vidul Cuantic',
          rebirth: state.prestigeCount || 0,
          dark_matter: state.darkMatter || 0,
          cps: Math.round(getCPS()),
          lifetime_energy: state.lifetimeEnergy || 0,
          achievements_count: (state.unlockedAchievements || []).length,
          updated_at: new Date().toISOString()
        };

        await fetch(`${firebaseConfig.databaseURL}/presence/${uid}.json?auth=${encodeURIComponent(cloudSession.access_token)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(() => {});
      } catch (e) {}
    }

    let currentSocialFilter = 'online'; // 'online' sau 'all'

    function setSocialListFilter(filter) {
      currentSocialFilter = filter;
      const btnOnline = document.getElementById('btnFilterOnlineOnly');
      const btnAll = document.getElementById('btnFilterAllReal');
      if (btnOnline) btnOnline.classList.toggle('active', filter === 'online');
      if (btnAll) btnAll.classList.toggle('active', filter === 'all');
      renderOnlineCommandersList();
    }

    function formatLastSeen(timestamp) {
      if (!timestamp || isNaN(timestamp) || timestamp <= 0) {
        return 'Nicio conectare înregistrată';
      }
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));
      if (diffSec < 45) return 'Chiar acum (Online)';
      if (diffSec < 90) return `Acum ${diffSec} secunde`;
      if (diffSec < 3600) {
        const m = Math.floor(diffSec / 60);
        return `Acum ${m} ${m === 1 ? 'minut' : 'minute'}`;
      }
      if (diffSec < 86400) {
        const h = Math.floor(diffSec / 3600);
        return `Acum ${h} ${h === 1 ? 'oră' : 'ore'}`;
      }
      if (diffSec < 86400 * 7) {
        const d = Math.floor(diffSec / 86400);
        return `Acum ${d} ${d === 1 ? 'zi' : 'zile'}`;
      }
      const dt = new Date(timestamp);
      const dayStr = dt.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const timeStr = dt.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
      return `${dayStr} la ${timeStr}`;
    }

    async function fetchLiveCommanders(force = false) {
      const listEl = document.getElementById('socialLiveCommandersList');
      if (listEl && force) {
        listEl.innerHTML = '<div style="text-align:center; padding:24px; color:var(--text-muted); font-size:12px;">🛰️ Se scanează jucătorii reali conectați la Google Firebase...</div>';
      }

      let fetched = [];
      const now = Date.now();

      if (isFirebaseConfigured() && cloudSession && cloudSession.access_token) {
        try {
          let res = await fetch(`${firebaseConfig.databaseURL}/presence.json?auth=${encodeURIComponent(cloudSession.access_token)}`);
          if (res.status === 401) {
            const refreshed = await refreshCloudTokenIfNeeded();
            if (refreshed) {
              res = await fetch(`${firebaseConfig.databaseURL}/presence.json?auth=${encodeURIComponent(cloudSession.access_token)}`);
            }
          }
          if (res.ok) {
            const data = await res.json();
            if (data && typeof data === 'object') {
              fetched = Object.values(data);
            }
          }
        } catch (e) {}
      }

      const localUid = (cloudSession && cloudSession.user && cloudSession.user.id) || 'local_player';
      const localPlayerObj = {
        uid: localUid,
        name: getCommanderDisplayName(),
        online: true,
        last_seen: now,
        avatar: (state.social && state.social.avatar) || '⚛️',
        title: (state.social && state.social.title) || 'Novice Cuantic',
        status_msg: (state.social && state.social.statusMsg) || 'Cercetez Vidul Cuantic',
        rebirth: state.prestigeCount || 0,
        dark_matter: state.darkMatter || 0,
        cps: Math.round(getCPS()),
        lifetime_energy: state.lifetimeEnergy || 0,
        isSelf: true
      };

      const map = new Map();
      map.set(localUid, localPlayerObj);

      // Doar persoane reale: din prezența live (/presence.json)
      fetched.forEach(item => {
        if (item && item.uid && !item.uid.startsWith('bot_')) {
          map.set(item.uid, item);
        }
      });

      // Scanare jucători reali din Clasament (/leaderboard.json) pentru a determina ultima conectare
      if (isFirebaseConfigured() && cloudSession && cloudSession.access_token) {
        try {
          const resLb = await fetch(`${firebaseConfig.databaseURL}/leaderboard.json?auth=${encodeURIComponent(cloudSession.access_token)}`);
          if (resLb.ok) {
            const lbData = await resLb.json();
            if (lbData && typeof lbData === 'object') {
              Object.values(lbData).forEach(lbItem => {
                if (lbItem && lbItem.user_id && !lbItem.user_id.startsWith('bot_')) {
                  const uid = lbItem.user_id;
                  const lbLastSeen = lbItem.updated_at ? new Date(lbItem.updated_at).getTime() : 0;
                  if (map.has(uid)) {
                    const existing = map.get(uid);
                    if (!existing.last_seen && lbLastSeen) {
                      existing.last_seen = lbLastSeen;
                    }
                  } else {
                    map.set(uid, {
                      uid: uid,
                      name: lbItem.commander_name || 'Comandant Reclutat',
                      online: false,
                      last_seen: lbLastSeen,
                      avatar: '⚛️',
                      title: 'Explorator Cosmic',
                      status_msg: 'Înregistrat în Rețeaua Galactică',
                      rebirth: lbItem.prestige_count || 0,
                      dark_matter: lbItem.dark_matter || 0,
                      cps: lbItem.max_cps || 0,
                      lifetime_energy: lbItem.lifetime_energy || 0
                    });
                  }
                }
              });
            }
          }
        } catch (e) {}
      }

      // DOAR PERSOANE REALE (fără roboți/exploratori sintetici)
      liveCommandersList = Array.from(map.values());

      liveCommandersList.sort((a, b) => {
        if (a.isSelf) return -1;
        if (b.isSelf) return 1;
        const aOnline = (now - (a.last_seen || 0)) < 90000;
        const bOnline = (now - (b.last_seen || 0)) < 90000;
        if (aOnline && !bOnline) return -1;
        if (!aOnline && bOnline) return 1;
        return (b.last_seen || 0) - (a.last_seen || 0);
      });

      const onlineCount = liveCommandersList.filter(c => (now - (c.last_seen || 0)) < 90000).length;
      const badgePill = document.getElementById('socialHeaderOnlineCount');
      const modalBadge = document.getElementById('socialLiveBadge');
      if (badgePill) badgePill.innerText = `🟢 ${onlineCount}`;
      if (modalBadge) modalBadge.innerText = `${onlineCount} Online`;

      renderOnlineCommandersList();
      renderFriendsList();
    }

    function renderOnlineCommandersList() {
      const container = document.getElementById('socialLiveCommandersList');
      if (!container) return;
      container.innerHTML = '';

      const now = Date.now();
      const filteredList = liveCommandersList.filter(cmd => {
        if (!cmd) return false;
        if (currentSocialFilter === 'online') {
          if (cmd.isSelf) return true;
          const diffSec = Math.floor((now - (cmd.last_seen || 0)) / 1000);
          return Boolean(cmd.online !== false && diffSec < 90);
        }
        return true;
      });

      if (filteredList.length === 0) {
        if (currentSocialFilter === 'online') {
          container.innerHTML = `
            <div style="text-align:center; padding:28px 14px; color:var(--text-muted); font-size:12px; background:rgba(15,23,42,0.4); border-radius:12px; border:1px dashed var(--border-subtle);">
              🛸 Niciun alt jucător real nu este activ pe joc în acest moment exact.<br/>
              <button class="social-filter-btn" onclick="setSocialListFilter('all')" style="margin-top:10px; color:#38bdf8;">
                👥 Afișează Toți Jucătorii Reali & Când au fost conectați
              </button>
            </div>
          `;
        } else {
          container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:12px;">Niciun jucător real detectat încă în baza de date. Conectează-te la Cloud pentru a fi primul!</div>';
        }
        return;
      }

      filteredList.forEach(cmd => {
        const diffSec = Math.max(0, Math.floor((now - (cmd.last_seen || 0)) / 1000));
        const isOnline = Boolean(cmd.online !== false && diffSec < 90);
        const isAway = !isOnline && diffSec < 360;

        let statusText = '🟢 Online Acum';
        let statusDotClass = 'status-online';
        let lastSeenBadge = '<span style="color:#6ee7b7; font-weight:700;">🟢 Activ pe joc acum</span>';

        if (isAway) {
          statusText = `🟡 Inactiv (acum ${Math.floor(diffSec / 60)}m)`;
          statusDotClass = 'status-away';
          lastSeenBadge = `<span style="color:#fde047;">🟡 Ultima dată online: <strong>acum ${Math.floor(diffSec / 60)} minute</strong></span>`;
        } else if (!isOnline) {
          statusText = `⚪ Offline (${formatTimeAgo(diffSec)})`;
          statusDotClass = 'status-offline';
          lastSeenBadge = `<span style="color:#94a3b8;">🕒 Ultima dată online: <strong style="color:#38bdf8;">${formatLastSeen(cmd.last_seen)}</strong></span>`;
        }

        const isFriend = Array.isArray(state.social && state.social.friends) && state.social.friends.includes(cmd.uid);
        const cleanName = (cmd.name || 'Comandant').replace(/[<>&"']/g, '');
        const cleanTitle = (cmd.title || 'Explorator').replace(/[<>&"']/g, '');
        const cleanStatus = (cmd.status_msg || 'Activ în Simulare').replace(/[<>&"']/g, '');

        const card = document.createElement('div');
        card.className = 'commander-card';
        card.innerHTML = `
          <div style="display:flex; align-items:center; gap:12px; min-width:0;">
            <div class="social-avatar-badge" style="width:44px; height:44px; font-size:22px;">${cmd.avatar || '⚛️'}</div>
            <div style="min-width:0;">
              <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                <span class="status-dot ${statusDotClass}" title="${statusText}"></span>
                <strong style="color:#ffffff; font-size:13.5px;">${cleanName}</strong>
                ${cmd.isSelf ? '<span class="social-online-pill" style="border-color:#38bdf8; color:#38bdf8;">TU</span>' : ''}
                <span style="font-size:11px; color:var(--text-dim);">• ${cleanTitle}</span>
              </div>
              <div style="font-size:11.5px; color:var(--text-muted); margin-top:3px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; max-width:280px;">${cleanStatus}</div>
              <div style="font-size:11px; margin-top:2px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                ${lastSeenBadge}
                <span style="color:var(--text-dim);">• Rebirth #${cmd.rebirth || 0}</span>
                <span style="color:var(--text-dim);">• ${formatNumber(cmd.cps || 0)} ⚡/s</span>
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
            ${!cmd.isSelf ? `
              <button class="btn-social-action ${isFriend ? 'active-friend' : ''}" onclick="toggleFriend('${cmd.uid}', '${cleanName}')">
                ${isFriend ? '★ Prieten' : '⭐ Adaugă'}
              </button>
              <button class="btn-social-action" onclick="sendQuantumGreeting('${cleanName}')" title="Trimite un salut și activează rezonanța cosmică (+30s boost)">
                👋 Salut
              </button>
            ` : '<span style="font-size:11px; color:#34d399; font-weight:700;">🟢 Tu ești activ</span>'}
          </div>
        `;
        container.appendChild(card);
      });
    }

    function renderFriendsList() {
      const container = document.getElementById('socialFriendsList');
      const badge = document.getElementById('socialFriendsBadge');
      if (!container) return;
      container.innerHTML = '';

      const friendsList = (state.social && state.social.friends) || [];
      if (badge) {
        badge.style.display = friendsList.length > 0 ? 'inline-block' : 'none';
        badge.innerText = `${friendsList.length}`;
      }

      const searchInput = document.getElementById('socialFriendSearchInput');
      const query = (searchInput ? searchInput.value.trim().toLowerCase() : '');

      const matchedCommanders = liveCommandersList.filter(cmd => {
        const isFriend = friendsList.includes(cmd.uid);
        if (!isFriend && !query) return false;
        if (query) {
          return cmd.name.toLowerCase().includes(query) || (cmd.uid && cmd.uid.toLowerCase().includes(query));
        }
        return isFriend;
      });

      if (matchedCommanders.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding:28px 14px; color:var(--text-muted); font-size:12px;">
            ${query ? 'Niciun comandant găsit conform căutării.' : 'Nu ai încă prieteni adăugați! Deschide tab-ul <strong>Comandanți Online</strong> și apasă pe butonul <strong>⭐ Adaugă</strong>.'}
          </div>
        `;
        return;
      }

      const now = Date.now();
      matchedCommanders.forEach(cmd => {
        const diffSec = Math.max(0, Math.floor((now - (cmd.last_seen || 0)) / 1000));
        const isOnline = Boolean(cmd.online !== false && diffSec < 90);
        const isAway = !isOnline && diffSec < 360;

        let statusText = '🟢 Online Acum';
        let statusDotClass = 'status-online';
        let lastSeenBadge = '<span style="color:#6ee7b7; font-weight:700;">🟢 Activ pe joc acum</span>';
        if (isAway) {
          statusText = `🟡 Inactiv (acum ${Math.floor(diffSec / 60)}m)`;
          statusDotClass = 'status-away';
          lastSeenBadge = `<span style="color:#fde047;">🟡 Ultima dată online: <strong>acum ${Math.floor(diffSec / 60)} minute</strong></span>`;
        } else if (!isOnline) {
          statusText = `⚪ Offline (${formatTimeAgo(diffSec)})`;
          statusDotClass = 'status-offline';
          lastSeenBadge = `<span style="color:#94a3b8;">🕒 Ultima dată online: <strong style="color:#38bdf8;">${formatLastSeen(cmd.last_seen)}</strong></span>`;
        }

        const isFriend = friendsList.includes(cmd.uid);
        const cleanName = (cmd.name || 'Comandant').replace(/[<>&"']/g, '');
        const cleanTitle = (cmd.title || 'Comandant').replace(/[<>&"']/g, '');
        const cleanStatus = (cmd.status_msg || 'Activ în Simulare').replace(/[<>&"']/g, '');

        const card = document.createElement('div');
        card.className = 'commander-card';
        card.innerHTML = `
          <div style="display:flex; align-items:center; gap:12px; min-width:0;">
            <div class="social-avatar-badge" style="width:44px; height:44px; font-size:22px;">${cmd.avatar || '⚛️'}</div>
            <div style="min-width:0;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span class="status-dot ${statusDotClass}"></span>
                <strong style="color:#ffffff; font-size:13.5px;">${cleanName}</strong>
                <span style="font-size:11px; color:var(--text-dim);">• ${cleanTitle}</span>
              </div>
              <div style="font-size:11.5px; color:var(--text-muted); margin-top:3px;">${cleanStatus}</div>
              <div style="font-size:11px; margin-top:2px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                ${lastSeenBadge}
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
            <button class="btn-social-action ${isFriend ? 'active-friend' : ''}" onclick="toggleFriend('${cmd.uid}', '${cleanName}')">
              ${isFriend ? '★ În Prieteni' : '⭐ Adaugă'}
            </button>
            <button class="btn-social-action" onclick="sendQuantumGreeting('${cleanName}')">
              👋 Salut
            </button>
          </div>
        `;
        container.appendChild(card);
      });
    }

    function toggleFriend(uid, name) {
      if (!state.social) state.social = { avatar: '⚛️', title: 'Novice Cuantic', statusMsg: '', friends: [] };
      if (!Array.isArray(state.social.friends)) state.social.friends = [];

      const idx = state.social.friends.indexOf(uid);
      if (idx >= 0) {
        state.social.friends.splice(idx, 1);
        showToast(`❌ L-ai eliminat pe ${name} din lista de prieteni.`);
      } else {
        state.social.friends.push(uid);
        showToast(`⭐ L-ai adăugat pe ${name} la prieteni! Vei vedea când e online.`);
        playXboxAchievementChime('standard');
      }

      saveGame();
      renderOnlineCommandersList();
      renderFriendsList();
      if (cloudSession && (cloudSession.access_token || cloudSession.refresh_token)) {
        cloudPushSave(false);
      }
    }

    function sendQuantumGreeting(name) {
      const bonusGain = Math.round(Math.max(100, getCPS() * 30));
      addEnergy(bonusGain);
      spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 25, '#34d399');
      playTone(840, 'triangle', 0.16, 0.12);
      showToast(`👋 I-ai trimis un Salut Cuantic lui ${name}! Rezonanță energetică: +${formatNumber(bonusGain)} ⚡ (30s CPS)!`);
    }

    function renderSocialAvatarPicker() {
      const container = document.getElementById('socialAvatarSelector');
      if (!container) return;
      container.innerHTML = '';
      const current = (state.social && state.social.avatar) || '⚛️';
      selectedSocialAvatar = current;

      SOCIAL_AVATARS.forEach(av => {
        const opt = document.createElement('div');
        opt.className = `social-avatar-opt ${av === selectedSocialAvatar ? 'selected' : ''}`;
        opt.innerText = av;
        opt.onclick = () => {
          selectedSocialAvatar = av;
          container.querySelectorAll('.social-avatar-opt').forEach(el => el.classList.remove('selected'));
          opt.classList.add('selected');
        };
        container.appendChild(opt);
      });
    }

    function renderSocialTitleOptions() {
      const select = document.getElementById('socialProfileTitleSelect');
      if (!select) return;
      select.innerHTML = '';

      const titles = [
        { title: 'Novice Cuantic', unlocked: true },
        { title: 'Pionier al Energiei', unlocked: (state.lifetimeEnergy || 0) >= 1000000 },
        { title: 'Vânător de Anomalii', unlocked: (state.anomaliesCaught || 0) >= 10 },
        { title: 'Arhitect al Singularității', unlocked: (state.prestigeCount || 0) >= 1 },
        { title: 'Lord al Vidului', unlocked: (state.prestigeCount || 0) >= 5 },
        { title: 'Stăpânul Multiversului', unlocked: (state.unlockedAchievements || []).length >= 50 }
      ];

      const current = (state.social && state.social.title) || 'Novice Cuantic';
      titles.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.title;
        opt.innerText = t.unlocked ? t.title : `🔒 ${t.title} (Blocat)`;
        opt.disabled = !t.unlocked;
        if (t.title === current) opt.selected = true;
        select.appendChild(opt);
      });
    }

    function populateSocialProfileForm() {
      const nameInput = document.getElementById('socialProfileNameInput');
      const statusInput = document.getElementById('socialProfileStatusInput');
      if (nameInput) nameInput.value = state.commanderName || getCommanderDisplayName();
      if (statusInput) statusInput.value = (state.social && state.social.statusMsg) || '';
      renderSocialAvatarPicker();
      renderSocialTitleOptions();
    }

    function saveSocialProfileFromUI() {
      const nameInput = document.getElementById('socialProfileNameInput');
      const statusInput = document.getElementById('socialProfileStatusInput');
      const titleSelect = document.getElementById('socialProfileTitleSelect');

      if (!state.social) state.social = { avatar: '⚛️', title: 'Novice Cuantic', statusMsg: '', friends: [] };

      if (nameInput && nameInput.value.trim()) {
        state.commanderName = nameInput.value.trim().slice(0, 22);
      }
      if (statusInput) {
        state.social.statusMsg = statusInput.value.trim().slice(0, 45);
      }
      if (titleSelect && titleSelect.value) {
        state.social.title = titleSelect.value;
      }
      state.social.avatar = selectedSocialAvatar || '⚛️';

      renderSocialHero();
      saveGame();
      updatePresence(true);
      if (cloudSession && (cloudSession.access_token || cloudSession.refresh_token)) {
        cloudPushSave(false);
      }
      const nameDisp = document.getElementById('lbCommanderNameDisplay');
      if (nameDisp) nameDisp.innerText = getCommanderDisplayName();
      const avDisp = document.getElementById('lbCommanderAvatarDisplay');
      if (avDisp) avDisp.innerText = (state.social && state.social.avatar) || '👨‍🚀';
      if (document.getElementById('tab-leaderboard') && document.getElementById('tab-leaderboard').classList.contains('active')) {
        refreshLeaderboard(false);
      }
      showToast('💾 Profilul social a fost salvat cu succes!');
      switchSocialSubnav('live');
    }

    function formatTimeAgo(sec) {
      if (sec < 60) return `${sec}s`;
      if (sec < 3600) return `${Math.floor(sec / 60)}m`;
      if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
      return `${Math.floor(sec / 86400)}z`;
    }

    function openCloudModal() {
      updateCloudUI();
      document.getElementById('cloudModal').classList.add('open');
    }

    function closeCloudModal() {
      document.getElementById('cloudModal').classList.remove('open');
    }

    function updateCloudUI() {
      const loggedIn = Boolean(cloudSession && (cloudSession.access_token || cloudSession.refresh_token) && cloudSession.user);
      document.getElementById('cloudLoggedInView').style.display = loggedIn ? 'block' : 'none';
      document.getElementById('cloudAuthView').style.display = loggedIn ? 'none' : 'block';

      const btnText = document.getElementById('cloudBtnText');
      const saveText = document.getElementById('saveText');
      const saveDot = document.getElementById('saveDot');
      const online = navigator.onLine;

      const topCloudBtn = document.getElementById('btnTopCloudAuth');
      if (topCloudBtn) {
        if (loggedIn) {
          topCloudBtn.className = 'btn-header cloud-header-btn logged-in';
          topCloudBtn.innerHTML = `☁️ <span>Salvat în Cloud</span>`;
          topCloudBtn.title = 'Cont conectat: ' + ((cloudSession.user && cloudSession.user.email) || '');
        } else {
          topCloudBtn.className = 'btn-header cloud-header-btn not-logged-in';
          topCloudBtn.innerHTML = `☁️ <span>Conectare / Salvează</span>`;
          topCloudBtn.title = 'Apasă pentru a te conecta și a-ți salva progresul în Cloud!';
        }
      }

      if (saveDot) {
        saveDot.classList.remove('pending', 'syncing');
        if (!online || pendingCloudSync) {
          saveDot.classList.add('pending');
        } else if (isSyncingNow) {
          saveDot.classList.add('syncing');
        }
      }

      if (loggedIn) {
        document.getElementById('cloudUserEmailText').innerText = cloudSession.user.email || 'Comandant Autentificat';
        if (!online) {
          if (btnText) btnText.innerText = 'Cloud (Offline)';
          if (saveText) saveText.innerText = 'Offline (Auto-Sync)';
        } else if (pendingCloudSync) {
          if (btnText) btnText.innerText = 'Cloud ON';
          if (saveText) saveText.innerText = 'Sincronizare...';
        } else {
          if (btnText) btnText.innerText = 'Cloud ON';
          if (saveText) saveText.innerText = 'Firebase & Local';
        }
      } else {
        if (btnText) btnText.innerText = 'Cloud Save';
        if (saveText) saveText.innerText = online ? 'Salvat local' : 'Mod Offline';
      }
    }

    // Reînnoire automată token Google Firebase după sesiuni lungi sau repornirea aplicației
    async function refreshCloudTokenIfNeeded() {
      if (!isFirebaseConfigured() || !cloudSession || !cloudSession.refresh_token) return false;
      try {
        const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(firebaseConfig.apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(cloudSession.refresh_token)}`
        });
        if (!res.ok) return false;
        const data = await res.json();
        if (data && data.id_token) {
          cloudSession.access_token = data.id_token;
          if (data.refresh_token) cloudSession.refresh_token = data.refresh_token;
          persistCloudSession(cloudSession);
          return true;
        }
      } catch (e) {}
      return false;
    }

    function formatFirebaseAuthError(errCode) {
      const map = {
        'EMAIL_EXISTS': 'Acest email este deja înregistrat! Folosește butonul Autentificare.',
        'INVALID_EMAIL': 'Adresa de email nu este validă.',
        'WEAK_PASSWORD : Password should be at least 6 characters': 'Parola trebuie să aibă minim 6 caractere.',
        'EMAIL_NOT_FOUND': 'Nu există niciun cont cu acest email. Apasă pe Creează Cont Nou!',
        'INVALID_PASSWORD': 'Parola introdusă este incorectă.',
        'INVALID_LOGIN_CREDENTIALS': 'Email sau parolă incorectă.',
        'OPERATION_NOT_ALLOWED': 'Activează Email/Password în Firebase Console -> Authentication -> Sign-in method!'
      };
      return map[errCode] || errCode || 'Eroare de comunicare cu Google Firebase';
    }

    async function cloudRegister() {
      if (!isFirebaseConfigured()) return;
      const email = document.getElementById('cloudEmailInput').value.trim();
      const password = document.getElementById('cloudPassInput').value;
      if (!email || password.length < 6) {
        showToast('⚠️ Introdu o adresă de email și o parolă de minim 6 caractere!');
        return;
      }
      try {
        const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(firebaseConfig.apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, returnSecureToken: true })
        });
        const data = await res.json();
        if (!res.ok) {
          const msg = data.error && data.error.message ? formatFirebaseAuthError(data.error.message) : 'Eroare la înregistrare';
          throw new Error(msg);
        }

        const nameInput = document.getElementById('cloudNameInput');
        const chosenName = nameInput ? nameInput.value.trim().slice(0, 22) : '';
        if (chosenName) {
          state.commanderName = chosenName;
          if (!state.social) state.social = { avatar: '⚛️', title: 'Novice Cuantic', statusMsg: '', friends: [] };
          state.social.name = chosenName;
          saveGame();
        }

        persistCloudSession({
          access_token: data.idToken,
          refresh_token: data.refreshToken,
          user: { id: data.localId, email: data.email }
        });
        updateCloudUI();
        showToast('🎉 Cont Google Firebase creat și conectat!');
        await cloudPushSave(false);
        if (document.getElementById('tab-leaderboard').classList.contains('active')) {
          renderLeaderboardTab();
        }
      } catch (err) {
        showToast(`❌ Firebase: ${err.message}`);
      }
    }

    async function cloudLogin() {
      if (!isFirebaseConfigured()) return;
      const email = document.getElementById('cloudEmailInput').value.trim();
      const password = document.getElementById('cloudPassInput').value;
      if (!email || !password) {
        showToast('⚠️ Introdu email-ul și parola!');
        return;
      }
      try {
        const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(firebaseConfig.apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, returnSecureToken: true })
        });
        const data = await res.json();
        if (!res.ok) {
          const msg = data.error && data.error.message ? formatFirebaseAuthError(data.error.message) : 'Date incorecte';
          throw new Error(msg);
        }

        const nameInput = document.getElementById('cloudNameInput');
        const chosenName = nameInput ? nameInput.value.trim().slice(0, 22) : '';
        if (chosenName) {
          state.commanderName = chosenName;
          if (!state.social) state.social = { avatar: '⚛️', title: 'Novice Cuantic', statusMsg: '', friends: [] };
          state.social.name = chosenName;
          saveGame();
        }

        persistCloudSession({
          access_token: data.idToken,
          refresh_token: data.refreshToken,
          user: { id: data.localId, email: data.email }
        });
        updateCloudUI();
        showToast('🔥 Autentificat în Cloud! Sincronizare automată activă.');
        // Sincronizare silențioasă inteligentă (dacă local e mai avansat urcă automat, dacă Cloud e mai avansat descarcă automat)
        await cloudPullSave(false);
        if (document.getElementById('tab-leaderboard').classList.contains('active')) {
          renderLeaderboardTab();
        }
      } catch (err) {
        showToast(`❌ Autentificare eșuată: ${err.message}`);
      }
    }

    function cloudLogout() {
      persistCloudSession(null);
      setPendingCloudSync(false);
      updateCloudUI();
      if (document.getElementById('tab-leaderboard').classList.contains('active')) {
        renderLeaderboardTab();
      }
      showToast('👋 Deconectat din Cloud. Jocul continuă să salveze local.');
    }

    function getCommanderDisplayName() {
      if (state.commanderName && state.commanderName.trim().length > 0) {
        return state.commanderName.trim().slice(0, 22);
      }
      if (cloudSession && cloudSession.user && cloudSession.user.email) {
        return cloudSession.user.email.split('@')[0].slice(0, 22);
      }
      return 'Comandant';
    }

    async function cloudPushSave(manualToast = false) {
      if (!isFirebaseConfigured() || !cloudSession || !cloudSession.access_token) return false;
      saveGame();

      // Dacă jucătorul este Offline, punem salvarea în coada de așteptare (Pending Sync) fără să-l deranjăm
      if (!navigator.onLine) {
        setPendingCloudSync(true);
        return false;
      }

      if (isSyncingNow) return false;
      isSyncingNow = true;
      updateCloudUI();

      try {
        const uid = encodeURIComponent(cloudSession.user.id);
        const nowIso = new Date().toISOString();
        const payload = {
          user_id: cloudSession.user.id,
          save_data: state,
          lifetime_energy: state.lifetimeEnergy || 0,
          updated_at: nowIso
        };

        let res = await fetch(`${firebaseConfig.databaseURL}/users/${uid}/save.json?auth=${encodeURIComponent(cloudSession.access_token)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        // Dacă token-ul a expirat cât timp omul a jucat offline, îl reînnoim automat și reîncercăm
        if (res.status === 401) {
          const refreshed = await refreshCloudTokenIfNeeded();
          if (refreshed) {
            res = await fetch(`${firebaseConfig.databaseURL}/users/${uid}/save.json?auth=${encodeURIComponent(cloudSession.access_token)}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          }
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }

        // Actualizăm simultan și scorurile din Clasamentul Global (Leaderboard) pentru acest cont conectat!
        const lbPayload = {
          user_id: cloudSession.user.id,
          commander_name: getCommanderDisplayName(),
          lifetime_energy: state.lifetimeEnergy || 0,
          dark_matter: state.darkMatter || 0,
          prestige_count: state.prestigeCount || 0,
          max_cps: Math.max(state.maxCps || 0, getCPS()),
          total_clicks: Math.floor(state.totalClicks || 0),
          anomalies_caught: Math.floor(state.anomaliesCaught || 0),
          achievements_count: (state.unlockedAchievements || []).length,
          updated_at: nowIso
        };

        await fetch(`${firebaseConfig.databaseURL}/leaderboard/${uid}.json?auth=${encodeURIComponent(cloudSession.access_token)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lbPayload)
        }).catch(() => {});

        isSyncingNow = false;
        setPendingCloudSync(false);

        const syncEl = document.getElementById('cloudLastSyncText');
        if (syncEl) {
          syncEl.innerText = `Ultima sincronizare în Firebase & Top: ${new Date().toLocaleTimeString('ro-RO')}`;
        }
        if (manualToast) {
          showToast('🔥 Progresul și Scorurile din Clasament au fost salvate în Google Firebase!');
        }
        return true;
      } catch (err) {
        isSyncingNow = false;
        // Orice eroare de rețea păstrează flag-ul activ pentru retrimitere automată silențioasă
        setPendingCloudSync(true);
        return false;
      }
    }

    async function cloudWipeRemoteData() {
      if (!isFirebaseConfigured() || !cloudSession) return false;
      try {
        if (!cloudSession.access_token && cloudSession.refresh_token) {
          await refreshCloudTokenIfNeeded();
        }
        let token = cloudSession.access_token;
        if (!token) return false;
        const uid = encodeURIComponent(cloudSession.user.id);

        // 1. Ștergere completă a salvării din Cloud (/users/{uid}/save.json)
        let resDel = await fetch(`${firebaseConfig.databaseURL}/users/${uid}/save.json?auth=${encodeURIComponent(token)}`, {
          method: 'DELETE'
        });

        if (resDel.status === 401) {
          const refreshed = await refreshCloudTokenIfNeeded();
          if (refreshed) {
            token = cloudSession.access_token;
            await fetch(`${firebaseConfig.databaseURL}/users/${uid}/save.json?auth=${encodeURIComponent(token)}`, {
              method: 'DELETE'
            }).catch(() => {});
          }
        }

        // 2. Ștergere completă a intrării din Clasamentul Global (/leaderboard/{uid}.json)
        await fetch(`${firebaseConfig.databaseURL}/leaderboard/${uid}.json?auth=${encodeURIComponent(token)}`, {
          method: 'DELETE'
        }).catch(() => {});

        localStorage.removeItem('qn_pending_cloud_wipe');
        setPendingCloudSync(false);

        // 3. Suprascriem cu noua stare curată în Cloud (0 energie, 0 Rebirth-uri)
        await cloudPushSave(false);

        const syncEl = document.getElementById('cloudLastSyncText');
        if (syncEl) {
          syncEl.innerText = `Salvare ștearsă complet din Cloud: ${new Date().toLocaleTimeString('ro-RO')}`;
        }
        return true;
      } catch (err) {
        console.warn('Eroare la ștergerea datelor din Cloud:', err);
        return false;
      }
    }

    // Funcție apelată automat și 100% silențios când omul trece din Offline -> Online
    async function syncOfflineProgressToServer() {
      if (!navigator.onLine || !isFirebaseConfigured() || !cloudSession) return;
      if (localStorage.getItem('qn_pending_cloud_wipe') === 'true') {
        await cloudWipeRemoteData();
        return;
      }
      if (!cloudSession.access_token && cloudSession.refresh_token) {
        await refreshCloudTokenIfNeeded();
      }
      if (!cloudSession.access_token) return;
      saveGame();
      await cloudPushSave(false);
    }

    async function cloudPullSave(manual = false) {
      if (!isFirebaseConfigured() || !cloudSession) return;
      if (localStorage.getItem('qn_pending_cloud_wipe') === 'true') {
        await cloudWipeRemoteData();
        if (manual) {
          showToast('🗑️ Salvarea din Cloud a fost ștearsă conform cererii de resetare.');
        }
        return;
      }
      if (!navigator.onLine) {
        return;
      }
      try {
        if (!cloudSession.access_token && cloudSession.refresh_token) {
          await refreshCloudTokenIfNeeded();
        }
        const uid = encodeURIComponent(cloudSession.user.id);
        let res = await fetch(`${firebaseConfig.databaseURL}/users/${uid}/save.json?auth=${encodeURIComponent(cloudSession.access_token)}`);

        if (res.status === 401) {
          const refreshed = await refreshCloudTokenIfNeeded();
          if (refreshed) {
            res = await fetch(`${firebaseConfig.databaseURL}/users/${uid}/save.json?auth=${encodeURIComponent(cloudSession.access_token)}`);
          }
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const row = await res.json();

        if (!row || !row.save_data) {
          // Nu există încă salvare în Cloud pe acest cont -> urcăm salvarea locală automat și silențios
          await cloudPushSave(false);
          if (manual) {
            showToast('☁️ Nicio salvare anterioară în Cloud. Starea actuală a fost sincronizată!');
          }
          return;
        }

        const cloudState = row.save_data;
        const cloudLifetime = Number(cloudState.lifetimeEnergy || 0);
        const localLifetime = Number(state.lifetimeEnergy || 0);
        const cloudPres = Number(cloudState.prestigeCount || 0);
        const localPres = Number(state.prestigeCount || 0);

        const cloudIsAhead = (cloudPres > localPres) || (cloudPres === localPres && cloudLifetime > localLifetime * 1.01);

        if (cloudIsAhead) {
          localStorage.setItem(SAVE_KEY, JSON.stringify(cloudState));
          loadGame();
          renderAll();
          renderStats();
          setPendingCloudSync(false);
          if (manual) {
            showToast('☁️⬇️ Progresul din Cloud a fost încărcat!');
          }
        } else {
          // Progresul local (ex: jucat offline) e mai avansat -> îl urcăm automat în Cloud fără să întrebăm nimic!
          await cloudPushSave(false);
          if (manual) {
            showToast('☁️⬆️ Progresul tău actual este deja la zi și a fost sincronizat în Cloud!');
          }
        }
      } catch (err) {
        if (manual) {
          showToast(`⚠️ Eroare sincronizare Cloud: ${err.message}`);
        }
      }
    }

    // Detectare instantanee și silențioasă Offline / Online (fără ferestre sau mesaje deranjante)
    window.addEventListener('offline', () => {
      if (cloudSession && (cloudSession.access_token || cloudSession.refresh_token)) {
        setPendingCloudSync(true);
      } else {
        updateCloudUI();
      }
    });

    window.addEventListener('online', () => {
      updateCloudUI();
      if (cloudSession && (cloudSession.access_token || cloudSession.refresh_token)) {
        syncOfflineProgressToServer();
      }
      // Verificăm imediat și dacă a apărut un Update de joc cât timp a fost offline
      checkForGameUpdate(false);
    });

    /********************************************************************
     * 11.8. SISTEM AUTO-UPDATE LIVE (PENTRU TOȚI JUCĂTORII ONLINE)
     ********************************************************************/
    async function checkForGameUpdate(manual = false) {
      // 1. În varianta locală de pe PC (file:///), nu facem buclă și nu redirecționăm
      if (location.protocol === 'file:') {
        if (manual) showToast(`💻 Rulezi versiunea locală pentru PC (v${APP_VERSION} - Build ${APP_BUILD}).`);
        return;
      }

      if (!navigator.onLine) {
        if (manual) showToast('📴 Ești Offline! Verificarea de update necesită conexiune la internet.');
        return;
      }

      // Verificăm dacă utilizatorul a închis deja notificarea de update în această sesiune
      try {
        if (sessionStorage.getItem('qn_dismissed_update') === 'true' && !manual) return;
      } catch (e) {}

      try {
        // Verificăm și Service Worker-ul dacă există
        if (swRegistration && typeof swRegistration.update === 'function') {
          swRegistration.update().catch(() => {});
        }

        const baseUrl = REMOTE_UPDATE_BASE_URL ? REMOTE_UPDATE_BASE_URL.replace(/\/+$/, '') : '.';
        const res = await fetch(`${baseUrl}/version.json?t=${Date.now()}`, {
          cache: 'no-store'
        });

        if (!res.ok) {
          if (manual) showToast(`✅ Rulezi deja cea mai nouă versiune (v${APP_VERSION})!`);
          return;
        }

        const remoteVer = await res.json();
        if (!remoteVer || remoteVer.offline) {
          if (manual) showToast(`✅ Versiunea actuală v${APP_VERSION} este la zi.`);
          return;
        }

        const remoteBuild = Number(remoteVer.build) || 0;
        const isNewerBuild = remoteBuild > APP_BUILD;
        const isDifferentVer = Boolean(remoteVer.version && remoteVer.version !== APP_VERSION && !remoteBuild);

        if (isNewerBuild || isDifferentVer) {
          // Prevenim buclele dacă s-a aplicat deja acest update în sesiunea curentă
          try {
            const lastApplied = sessionStorage.getItem('qn_last_applied_build');
            if (lastApplied && Number(lastApplied) === remoteBuild && !manual) {
              return;
            }
          } catch (e) {}

          await triggerUpdateFlow(remoteVer);
        } else if (manual) {
          showToast(`✅ Jocul este la zi! Rulezi ultima versiune (v${APP_VERSION} - Build ${APP_BUILD}).`);
        }
      } catch (e) {
        if (manual) showToast(`✅ Rulezi versiunea v${APP_VERSION}.`);
      }
    }

    async function triggerUpdateFlow(remoteVer) {
      const modal = document.getElementById('updateModal');
      if (!modal || modal.classList.contains('open')) return;

      // 1. Salvăm garantat tot progresul local și în Cloud înainte de update!
      saveGame();
      if (cloudSession && cloudSession.access_token && navigator.onLine) {
        await cloudPushSave(false);
      }

      const newVerEl = document.getElementById('updateNewVerText');
      if (newVerEl) newVerEl.innerText = `v${remoteVer.version || 'Nou'}`;
      const chLogEl = document.getElementById('updateChangelogText');
      if (chLogEl) chLogEl.innerText = remoteVer.changelog || 'Actualizare de conținut, optimizări și îmbunătățiri.';
      modal.classList.add('open');
      playTone(880, 'triangle', 0.2, 0.12);

      let secondsLeft = 5;
      const cdEl = document.getElementById('updateCountdownText');
      if (cdEl) cdEl.innerText = `${secondsLeft}s`;

      if (updateCountdownTimer) clearInterval(updateCountdownTimer);
      updateCountdownTimer = setInterval(() => {
        secondsLeft--;
        if (cdEl) cdEl.innerText = `${Math.max(0, secondsLeft)}s`;
        if (secondsLeft <= 0) {
          clearInterval(updateCountdownTimer);
          updateCountdownTimer = null;
          applyGameUpdateNow(remoteVer ? remoteVer.build : null);
        }
      }, 1000);
    }

    function dismissUpdateModal() {
      if (updateCountdownTimer) {
        clearInterval(updateCountdownTimer);
        updateCountdownTimer = null;
      }
      const modal = document.getElementById('updateModal');
      if (modal) modal.classList.remove('open');
      try {
        sessionStorage.setItem('qn_dismissed_update', 'true');
      } catch (e) {}
    }

    async function applyGameUpdateNow(targetBuild) {
      if (updateCountdownTimer) {
        clearInterval(updateCountdownTimer);
        updateCountdownTimer = null;
      }
      saveGame();
      if (cloudSession && cloudSession.access_token && navigator.onLine) {
        await cloudPushSave(false);
      }

      // Dacă suntem pe PC (fișier local file://), nu încercăm să redirectăm către internet
      if (location.protocol === 'file:') {
        dismissUpdateModal();
        showToast('💻 Versiunea locală de PC este salvată.');
        return;
      }

      try {
        if (targetBuild) {
          sessionStorage.setItem('qn_last_applied_build', String(targetBuild));
        }
      } catch (e) {}

      try {
        // Păstrăm sesiunea Cloud și salvarea în window.name pentru a nu pierde niciodată login-ul la update
        window.name = JSON.stringify({
          qn_bridge: true,
          installed: isAppAlreadyInstalled(),
          session: cloudSession,
          save: state
        });
      } catch (e) {}

      try {
        // Șterge cache-ul vechi din Service Worker ca noul cod să fie încărcat 100% proaspăt
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE_AND_UPDATE' });
        }
      } catch (e) {}

      // Verificăm dacă nu cumva suntem într-o buclă repetitivă de reload
      try {
        const reloadCount = parseInt(sessionStorage.getItem('qn_reload_loop_guard') || '0', 10);
        if (reloadCount >= 2) {
          dismissUpdateModal();
          showToast('✅ Jocul a fost actualizat. Dacă dorești, apasă Ctrl+F5.');
          sessionStorage.removeItem('qn_reload_loop_guard');
          return;
        }
        sessionStorage.setItem('qn_reload_loop_guard', String(reloadCount + 1));
      } catch (e) {}

      window.location.reload();
    }

    // Navigare Mobil (Bottom Bar)
    function switchMobileZone(zone, btnEl) {
      document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
      if (btnEl) btnEl.classList.add('active');

      document.getElementById('zone-left').classList.remove('mobile-active');
      document.getElementById('zone-center').classList.remove('mobile-active');
      document.getElementById('zone-right').classList.remove('mobile-active');

      document.getElementById(`zone-${zone}`).classList.add('mobile-active');
    }

    function isAppAlreadyInstalled() {
      try {
        if (location.protocol === 'file:') return true;
        if (/electron/i.test(navigator.userAgent || '')) return true;
        if (window.matchMedia('(display-mode: standalone)').matches) return true;
        if (window.matchMedia('(display-mode: window-controls-overlay)').matches) return true;
        if (window.matchMedia('(display-mode: fullscreen)').matches) return true;
        if (window.matchMedia('(display-mode: minimal-ui)').matches) return true;
        if (window.navigator.standalone === true) return true;
        if (localStorage.getItem(INSTALLED_FLAG_KEY) === 'true') return true;
        if (location.search.includes('mode=desktop')) return true;
        if (window.name === 'qn_desktop_installed') return true;
      } catch (e) {}
      return false;
    }

    function hideInstallButtonsIfInstalled() {
      if (isAppAlreadyInstalled()) {
        try { localStorage.setItem(INSTALLED_FLAG_KEY, 'true'); } catch (e) {}
        const b1 = document.getElementById('btnInstallApp');
        if (b1) b1.style.display = 'none';
        const b2 = document.getElementById('btnInstallAppStats');
        if (b2) b2.style.display = 'none';
      }
    }

    // Instalare PWA (MacBook, Windows, Android, iOS)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
    });

    window.addEventListener('appinstalled', () => {
      try { localStorage.setItem(INSTALLED_FLAG_KEY, 'true'); } catch (e) {}
      hideInstallButtonsIfInstalled();
    });

    function triggerInstallApp() {
      if (isAppAlreadyInstalled()) {
        hideInstallButtonsIfInstalled();
        return;
      }
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then((choice) => {
          if (choice.outcome === 'accepted') {
            try { localStorage.setItem(INSTALLED_FLAG_KEY, 'true'); } catch (e) {}
            hideInstallButtonsIfInstalled();
            showToast('🎉 Quantum Nexus a fost instalat ca aplicație!');
          }
          deferredInstallPrompt = null;
        });
      } else {
        document.getElementById('installModal').classList.add('open');
      }
    }

    function closeInstallModal() {
      document.getElementById('installModal').classList.remove('open');
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const achModal = document.getElementById('achInspectModal');
        if (achModal && achModal.style.display !== 'none') {
          closeAchInspectModal();
          return;
        }
        if (isStatsFullscreenOpen) {
          closeStatsFullscreen();
          return;
        }
        if (isLeaderboardFullscreenOpen) {
          closeLeaderboardFullscreen();
          return;
        }
        if (isOmniverseFullscreenOpen) {
          closeOmniverseFullscreen();
          return;
        }
        if (isPrestigeFullscreenOpen) {
          closePrestigeFullscreen();
          return;
        }
        if (isAchievementsFullscreenOpen) {
          closeAchievementsFullscreen();
          return;
        }
        if (isConstellationFullscreenOpen) {
          closeConstellationFullscreen();
          return;
        }
        closeSettingsModal();
        closeCloudModal();
        closeInstallModal();
        closeOfflineModal();
        closeCoreSkinsModal();
        if (typeof closeFpsModal === 'function') closeFpsModal();
      }
    });

