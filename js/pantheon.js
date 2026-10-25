    /********************************************************************
     * 11.7. CLASAMENT GLOBAL MULTI-CATEGORIE (DOAR CONT CONECTAT FIREBASE)
     ********************************************************************/
    const LEADERBOARD_CATEGORIES = {
      lifetime_energy: {
        label: '⚡ Energie Totală',
        unit: ' ⚡',
        format: (v) => formatNumber(v) + ' ⚡',
        localVal: () => state.lifetimeEnergy || 0
      },
      dark_matter: {
        label: '🔮 Materie Întunecată',
        unit: ' 🔮',
        format: (v) => formatNumber(v, 0) + ' 🔮',
        localVal: () => state.darkMatter || 0
      },
      prestige_count: {
        label: '🌌 Singularități (Rebirth)',
        unit: ' 🌌',
        format: (v) => Math.floor(v).toLocaleString('ro-RO') + ' Rebirth-uri',
        localVal: () => state.prestigeCount || 0
      },
      max_cps: {
        label: '🚀 Record CPS (/sec)',
        unit: '/s',
        format: (v) => formatNumber(v) + '/sec',
        localVal: () => Math.max(state.maxCps || 0, getCPS())
      },
      total_clicks: {
        label: '👆 Click-uri Manuale',
        unit: ' 👆',
        format: (v) => Math.floor(v).toLocaleString('ro-RO') + ' click-uri',
        localVal: () => state.totalClicks || 0
      },
      anomalies_caught: {
        label: '☄️ Anomalii Aurii',
        unit: ' ☄️',
        format: (v) => Math.floor(v).toLocaleString('ro-RO') + ' anomalii',
        localVal: () => state.anomaliesCaught || 0
      },
      achievements_count: {
        label: '🏆 Realizări Deblocate',
        unit: ' 🏆',
        format: (v) => `${Math.floor(v)} / ${ACHIEVEMENTS_DATA.length} 🏆`,
        localVal: () => (state.unlockedAchievements || []).length
      }
    };

    let currentLbCategory = 'lifetime_energy';

    // =========================================================================
    // V3.9.4: PANTEONUL INTERSTELAR (FULLSCREEN LEADERBOARD & COSMIC WARP)
    // =========================================================================
    let isLeaderboardFullscreenOpen = false;
    let lbBgAnimFrame = null;
    let lbWarpAnimFrameId = null;
    const lbBgStars = [];
    let cachedLeaderboardRows = null;
    let lbEventsBound = false;

    function renderLeaderboardTab() {
      const nameEl = document.getElementById('portalLbNameVal');
      if (nameEl) nameEl.innerText = getCommanderDisplayName();

      const cloudEl = document.getElementById('portalLbCloudVal');
      const loggedIn = Boolean(isFirebaseConfigured() && cloudSession && (cloudSession.access_token || cloudSession.refresh_token) && cloudSession.user);
      if (cloudEl) {
        if (loggedIn) {
          cloudEl.innerText = 'Conectat';
          cloudEl.style.color = 'var(--accent-emerald)';
        } else {
          cloudEl.innerText = 'Cont Local';
          cloudEl.style.color = '#fde047';
        }
      }
    }

    function openSocialProfileEditor() {
      openSocialModal();
      switchSocialSubnav('profile');
    }

    function playLeaderboardWarpSound(direction = 'enter') {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;

        if (direction === 'enter') {
          // Glorious interstellar swell & chord (F3, A3, C4, E4)
          const freqs = [174.61, 220.00, 261.63, 329.63, 523.25];
          freqs.forEach((f, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = idx === 0 ? 'sine' : 'triangle';
            const st = now + idx * 0.04;
            osc.frequency.setValueAtTime(f * 0.8, st);
            osc.frequency.exponentialRampToValueAtTime(f, st + 0.35);
            gain.gain.setValueAtTime(0.001, st);
            gain.gain.linearRampToValueAtTime(0.08 / freqs.length, st + 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, st + 0.6);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(st);
            osc.stop(st + 0.6);
          });
        } else {
          // Exit whoosh
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(280, now);
          osc.frequency.exponentialRampToValueAtTime(60, now + 0.32);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.34);
        }
      } catch (e) {}
    }

    function playLeaderboardCategorySound() {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.18);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } catch (e) {}
    }

    function runLeaderboardFullscreenWarp(duration = 700, onComplete) {
      const canvas = document.getElementById('leaderboardWarpCanvas');
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

      const particleCount = 360;
      const particles = [];
      const colors = ['#f59e0b', '#fde047', '#38bdf8', '#ffffff', '#e0f2fe', '#d97706'];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: (Math.random() - 0.5) * w * 2.2,
          y: (Math.random() - 0.5) * h * 2.2,
          z: Math.random() * 1500 + 100,
          pz: 1600,
          color: colors[i % colors.length],
          size: Math.random() * 2.4 + 0.8
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
          ctx.fillStyle = '#f59e0b';
          ctx.globalAlpha = flashAlpha * 0.4;
          ctx.fillRect(0, 0, w, h);
          ctx.globalAlpha = 1.0;
        }

        ctx.restore();

        if (progress < 1) {
          lbWarpAnimFrameId = requestAnimationFrame(stepWarp);
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

      lbWarpAnimFrameId = requestAnimationFrame(stepWarp);
    }

    function openLeaderboardFullscreen() {
      if (isLeaderboardFullscreenOpen) return;
      isLeaderboardFullscreenOpen = true;

      playLeaderboardWarpSound('enter');

      const appShell = document.querySelector('.app-shell');
      if (appShell) appShell.classList.add('app-shell-warp-out');

      runLeaderboardFullscreenWarp(700, () => {});

      setTimeout(() => {
        const fsEl = document.getElementById('leaderboardFullscreen');
        if (fsEl) {
          fsEl.style.display = 'flex';
          void fsEl.offsetWidth;
          fsEl.classList.add('active');
        }
        initLeaderboardFullscreen();
        refreshLeaderboard(false);
      }, 420);
    }

    function closeLeaderboardFullscreen() {
      if (!isLeaderboardFullscreenOpen) return;
      isLeaderboardFullscreenOpen = false;

      playLeaderboardWarpSound('exit');

      const fsEl = document.getElementById('leaderboardFullscreen');
      if (fsEl) {
        fsEl.classList.remove('active');
      }

      const appShell = document.querySelector('.app-shell');
      if (appShell) {
        appShell.classList.remove('app-shell-warp-out');
      }

      setTimeout(() => {
        if (fsEl && !isLeaderboardFullscreenOpen) {
          fsEl.style.display = 'none';
        }
        if (lbBgAnimFrame) {
          cancelAnimationFrame(lbBgAnimFrame);
          lbBgAnimFrame = null;
        }
      }, 380);
    }

    function initLeaderboardFullscreen() {
      const bgCanvas = document.getElementById('leaderboardBgCanvas');
      if (!bgCanvas) return;

      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      bgCanvas.width = Math.floor(w * dpr);
      bgCanvas.height = Math.floor(h * dpr);

      if (lbBgStars.length === 0) {
        const count = 160;
        const colors = ['#f59e0b', '#fde047', '#38bdf8', '#ffffff', '#e0f2fe', '#cbd5e1'];
        for (let i = 0; i < count; i++) {
          lbBgStars.push({
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

      if (!lbEventsBound) {
        lbEventsBound = true;
        window.addEventListener('resize', () => {
          if (isLeaderboardFullscreenOpen && bgCanvas) {
            const curDpr = window.devicePixelRatio || 1;
            bgCanvas.width = Math.floor(window.innerWidth * curDpr);
            bgCanvas.height = Math.floor(window.innerHeight * curDpr);
          }
        });
      }

      if (!lbBgAnimFrame) {
        lbBgAnimFrame = requestAnimationFrame(runLeaderboardBgLoop);
      }
    }

    function runLeaderboardBgLoop(timestamp) {
      if (!isLeaderboardFullscreenOpen) {
        lbBgAnimFrame = null;
        return;
      }

      const canvas = document.getElementById('leaderboardBgCanvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const dpr = window.devicePixelRatio || 1;

        ctx.fillStyle = '#02020a';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;

        // 1. Ambient Golden-Cyan Cosmic Nebula
        const grad = ctx.createRadialGradient(cx, cy * 0.4, 0, cx, cy * 0.4, Math.max(w, h) * 0.6);
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.08)');
        grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.04)');
        grad.addColorStop(1, 'rgba(2, 2, 10, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 2. Stars
        lbBgStars.forEach(s => {
          const alpha = s.baseAlpha + Math.sin(timestamp * s.twinkleSpeed + s.phase) * 0.25;
          ctx.beginPath();
          ctx.arc(s.x * dpr, s.y * dpr, s.r * dpr, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = Math.max(0.1, alpha);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;
      }

      lbBgAnimFrame = requestAnimationFrame(runLeaderboardBgLoop);
    }

    function renderLeaderboardFullscreen(allRows = null) {
      if (!isLeaderboardFullscreenOpen) return;

      const loggedIn = Boolean(isFirebaseConfigured() && cloudSession && (cloudSession.access_token || cloudSession.refresh_token) && cloudSession.user);
      const cat = LEADERBOARD_CATEGORIES[currentLbCategory] || LEADERBOARD_CATEGORIES.lifetime_energy;

      // 1. Update Header Badges
      const catBadge = document.getElementById('lbFsCurCategoryName');
      if (catBadge) catBadge.innerText = cat.label;

      const cmdName = document.getElementById('lbFsCommanderName');
      if (cmdName) cmdName.innerText = getCommanderDisplayName();

      const cmdAvatar = document.getElementById('lbFsCommanderAvatar');
      if (cmdAvatar) cmdAvatar.innerText = (state.social && state.social.avatar) || '👨‍🚀';

      const totalCountEl = document.getElementById('lbFsTotalPlayersCount');
      if (totalCountEl) totalCountEl.innerText = allRows ? `${allRows.length} Comandanți` : 'Top 50';

      // 2. Render Categories Navigation Bar
      const catNav = document.getElementById('lbFsCategoryNav');
      if (catNav) {
        catNav.innerHTML = Object.entries(LEADERBOARD_CATEGORIES).map(([k, c]) => {
          const isActive = k === currentLbCategory;
          return `
            <button class="lb-fs-cat-btn ${isActive ? 'active' : ''}" onclick="selectLeaderboardCategory('${k}')">
              <span>${c.label}</span>
            </button>
          `;
        }).join('');
      }

      // 3. Render Personal Commander Status Card
      const myCard = document.getElementById('lbFsMyStatusCard');
      if (myCard) {
        const myUid = loggedIn ? cloudSession.user.id : null;
        let myRank = null;
        let myScoreFormatted = cat.format(cat.localVal());

        if (loggedIn && allRows) {
          const myFullIndex = allRows.findIndex(r => r.user_id === myUid);
          myRank = myFullIndex >= 0 ? myFullIndex + 1 : null;
          if (myRank) {
            const rowScore = Number(allRows[myFullIndex][currentLbCategory] || 0);
            myScoreFormatted = cat.format(rowScore);
          }
        }

        if (loggedIn) {
          myCard.innerHTML = `
            <div class="lb-my-hud-left">
              <div class="lb-my-hud-avatar">${(state.social && state.social.avatar) || '👨‍🚀'}</div>
              <div>
                <div class="lb-my-hud-tag">STATUS COMANDANT CONECTAT // QUANTUM CLOUD</div>
                <div class="lb-my-hud-title">${getCommanderDisplayName()} <span class="lb-you-badge">TU</span></div>
              </div>
            </div>
            <div class="lb-my-hud-center">
              <div class="lb-my-hud-rank-label">POZIȚIA TA ÎN GALAXIE</div>
              <div class="lb-my-hud-rank-val">${myRank ? 'Locul #' + myRank : 'În afara Top 50'}</div>
            </div>
            <div class="lb-my-hud-right">
              <div class="lb-my-hud-score-label">SCORUL TĂU ÎNREGISTRAT</div>
              <div class="lb-my-hud-score-val">${myScoreFormatted}</div>
            </div>
          `;
        } else {
          myCard.innerHTML = `
            <div class="lb-my-hud-left">
              <div class="lb-my-hud-avatar">🔒</div>
              <div>
                <div class="lb-my-hud-title" style="color:#fde047;">Mod Vizitator Local (Scorurile tale nu sunt în Top)</div>
                <div style="font-size:11.5px; color:var(--text-muted); line-height:1.4; margin-top:2px;">
                  Conectează-te gratuit la Quantum Cloud pentru a-ți publica recordurile în Panteonul Interstelar și a concura cu toți comandanții!
                </div>
              </div>
            </div>
            <div class="lb-my-hud-right">
              <button class="btn-lb-connect-cloud" onclick="openCloudModal()">
                <span>☁️ Conectează-te Gratuit</span>
              </button>
            </div>
          `;
        }
      }

      // If no data rows yet
      const podiumWrap = document.getElementById('lbFsPodiumWrap');
      const rosterList = document.getElementById('lbFsRosterList');

      if (!allRows || allRows.length === 0) {
        if (podiumWrap) {
          podiumWrap.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding:30px; color:var(--text-muted); font-size:13px;">
              ⏳ Se sincronizează datele din satelit pentru categoria <strong>${cat.label}</strong>...
            </div>
          `;
        }
        if (rosterList) {
          rosterList.innerHTML = `
            <div style="text-align:center; padding:24px; color:var(--text-muted); font-size:12.5px;">
              Așteaptă un moment...
            </div>
          `;
        }
        return;
      }

      // 4. Render 3D Champions Podium (#2 Left, #1 Center Elevated, #3 Right)
      if (podiumWrap) {
        const top1 = allRows[0] || null;
        const top2 = allRows[1] || null;
        const top3 = allRows[2] || null;
        const myUid = loggedIn ? cloudSession.user.id : null;

        function renderPodiumCard(row, rank, rankClass, title, defaultIcon) {
          if (!row) {
            return `
              <div class="lb-podium-card ${rankClass}">
                <div class="lb-podium-avatar" style="opacity:0.4;">${defaultIcon}</div>
                <div class="lb-podium-rank-badge">#${rank}</div>
                <div class="lb-podium-name" style="color:var(--text-muted);">Loc Vacant</div>
                <div class="lb-podium-score" style="color:var(--text-dim);">-</div>
              </div>
            `;
          }

          const isMe = myUid && row.user_id === myUid;
          const safeName = (row.commander_name || 'Comandant').replace(/[<>&"']/g, '');
          const scoreVal = Number(row[currentLbCategory] || 0);
          const avatar = (row.social && row.social.avatar) || (rank === 1 ? '👑' : (rank === 2 ? '🥈' : '🥉'));

          return `
            <div class="lb-podium-card ${rankClass} ${isMe ? 'is-me' : ''}">
              ${rank === 1 ? '<div class="lb-podium-crown">👑</div>' : ''}
              <div class="lb-podium-avatar">${avatar}</div>
              <div class="lb-podium-rank-badge">#${rank} ${title}</div>
              <div class="lb-podium-name">${safeName} ${isMe ? '<span class="lb-you-badge">TU</span>' : ''}</div>
              <div class="lb-podium-score">${cat.format(scoreVal)}</div>
            </div>
          `;
        }

        podiumWrap.innerHTML = `
          ${renderPodiumCard(top2, 2, 'podium-rank-2', 'TITAN STELAR', '🥈')}
          ${renderPodiumCard(top1, 1, 'podium-rank-1', 'CAMPION SUPREM', '👑')}
          ${renderPodiumCard(top3, 3, 'podium-rank-3', 'PIONIER CUANTIC', '🥉')}
        `;
      }

      // 5. Render Roster Table (#4 to #50)
      if (rosterList) {
        const rosterRows = allRows.slice(3, 50);
        const myUid = loggedIn ? cloudSession.user.id : null;
        const top1Score = Number(allRows[0][currentLbCategory] || 1);

        if (rosterRows.length === 0) {
          rosterList.innerHTML = `
            <div style="text-align:center; padding:24px; color:var(--text-muted); font-size:12.5px;">
              Toți comandanții din această categorie sunt afișați pe podiumul de onoare!
            </div>
          `;
        } else {
          rosterList.innerHTML = rosterRows.map((row, idx) => {
            const rank = idx + 4;
            const isMe = myUid && row.user_id === myUid;
            const safeName = (row.commander_name || 'Comandant').replace(/[<>&"']/g, '');
            const scoreVal = Number(row[currentLbCategory] || 0);
            const avatar = (row.social && row.social.avatar) || '👨‍🚀';
            const barPct = top1Score > 0 ? Math.min(100, Math.max(3, (scoreVal / top1Score) * 100)) : 10;

            return `
              <div class="lb-roster-row ${isMe ? 'is-me' : ''}">
                <div class="lb-col-rank">#${rank}</div>
                <div class="lb-col-player">
                  <span style="font-size:16px;">${avatar}</span>
                  <span>${safeName}</span>
                  ${isMe ? '<span class="lb-you-badge">TU</span>' : ''}
                </div>
                <div class="lb-col-bar">
                  <div class="lb-roster-bar-track">
                    <div class="lb-roster-bar-fill" style="width:${barPct.toFixed(1)}%;"></div>
                  </div>
                </div>
                <div class="lb-col-score">${cat.format(scoreVal)}</div>
              </div>
            `;
          }).join('');
        }
      }
    }

    function selectLeaderboardCategory(catKey, btnEl) {
      if (!LEADERBOARD_CATEGORIES[catKey]) return;
      currentLbCategory = catKey;
      playLeaderboardCategorySound();

      if (cachedLeaderboardRows && cachedLeaderboardRows.length > 0) {
        cachedLeaderboardRows.sort((a, b) => Number(b[currentLbCategory] || 0) - Number(a[currentLbCategory] || 0));
        renderLeaderboardFullscreen(cachedLeaderboardRows);
      }

      refreshLeaderboard(false);
    }

    async function saveCommanderNameAndSync() {
      const input = document.getElementById('lbCommanderNameInput');
      const cleanName = (input.value || '').trim().slice(0, 22);
      if (cleanName.length < 2) {
        showToast('⚠️ Numele de Comandant trebuie să aibă cel puțin 2 caractere!');
        return;
      }
      state.commanderName = cleanName;
      saveGame();
      const ok = await cloudPushSave(false);
      if (ok) {
        showToast(`👨‍🚀 Numele "${cleanName}" și scorurile tale au fost actualizate în Clasament!`);
        refreshLeaderboard(false);
      } else {
        showToast(`💾 Numele "${cleanName}" a fost salvat!`);
      }
    }

    async function refreshLeaderboard(manualToast = false) {
      const loggedIn = Boolean(isFirebaseConfigured() && cloudSession && (cloudSession.access_token || cloudSession.refresh_token) && cloudSession.user);
      const cat = LEADERBOARD_CATEGORIES[currentLbCategory] || LEADERBOARD_CATEGORIES.lifetime_energy;

      const refreshBtn = document.getElementById('btnLbFsRefresh');
      if (refreshBtn) refreshBtn.classList.add('refreshing');

      if (!loggedIn) {
        renderLeaderboardTab();
        renderLeaderboardFullscreen(null);
        if (refreshBtn) refreshBtn.classList.remove('refreshing');
        return;
      }

      const listEl = document.getElementById('leaderboardListContainer');
      const myRankEl = document.getElementById('lbMyRankText');
      const myScoreEl = document.getElementById('lbMyScoreText');

      if (!navigator.onLine) {
        if (listEl) listEl.innerHTML = `<div style="text-align:center; padding:24px; color:var(--accent-gold); font-size:13px;">📴 Ești în Mod Offline. Clasamentul se va încărca automat imediat ce pornești internetul!</div>`;
        if (refreshBtn) refreshBtn.classList.remove('refreshing');
        renderLeaderboardFullscreen(null);
        return;
      }

      try {
        await cloudPushSave(false);

        let res = await fetch(`${firebaseConfig.databaseURL}/leaderboard.json?auth=${encodeURIComponent(cloudSession.access_token)}`);
        if (res.status === 401) {
          const refreshed = await refreshCloudTokenIfNeeded();
          if (refreshed) {
            res = await fetch(`${firebaseConfig.databaseURL}/leaderboard.json?auth=${encodeURIComponent(cloudSession.access_token)}`);
          }
        }

        if (!res.ok) {
          throw new Error(`Serviciul de clasament se sincronizează...`);
        }

        const rawObj = await res.json();
        const allRows = rawObj ? Object.values(rawObj).filter(r => r && typeof r === 'object') : [];

        // Sort descrescător după categoria selectată
        allRows.sort((a, b) => Number(b[currentLbCategory] || 0) - Number(a[currentLbCategory] || 0));
        cachedLeaderboardRows = allRows;

        const myUid = cloudSession.user.id;
        const myFullIndex = allRows.findIndex(r => r.user_id === myUid);
        const myRank = myFullIndex >= 0 ? myFullIndex + 1 : null;
        const topRows = allRows.slice(0, 50);

        if (listEl) {
          listEl.innerHTML = topRows.map((row, idx) => {
            const rank = idx + 1;
            const isMe = row.user_id === myUid;
            const topClass = rank === 1 ? ' top-1' : rank === 2 ? ' top-2' : rank === 3 ? ' top-3' : '';
            const meClass = isMe ? ' me' : '';
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            const safeName = (row.commander_name || 'Comandant').replace(/[<>&"']/g, '');
            const scoreVal = Number(row[currentLbCategory] || 0);

            return `
              <div class="lb-row${topClass}${meClass}">
                <div class="lb-left">
                  <div class="lb-rank">${medal}</div>
                  <div class="lb-name">
                    ${safeName}
                    ${isMe ? '<span class="lb-you-tag">TU</span>' : ''}
                  </div>
                </div>
                <div class="lb-score">${cat.format(scoreVal)}</div>
              </div>
            `;
          }).join('');
        }

        if (myRankEl) {
          myRankEl.innerHTML = myRank
            ? `Poziția ta în <strong>${cat.label}</strong>: <strong style="color:var(--accent-gold)">Locul #${myRank}</strong> (din ${allRows.length} Comandanți)`
            : `Scorul tău în <strong>${cat.label}</strong>:`;
        }
        if (myScoreEl) {
          myScoreEl.innerText = cat.format(cat.localVal());
        }

        // Render in Fullscreen Pantheon
        renderLeaderboardFullscreen(allRows);

        if (manualToast) {
          showToast(`🏅 Clasamentul (${cat.label}) a fost actualizat!`);
        }
      } catch (err) {
        if (listEl) listEl.innerHTML = `<div style="text-align:center; padding:20px; color:#fcd34d; font-size:12.5px;">⚠️ ${err.message}</div>`;
      } finally {
        if (refreshBtn) refreshBtn.classList.remove('refreshing');
      }
    }

