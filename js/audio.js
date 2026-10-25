    /********************************************************************
     * 3. MOTOR AUDIO SINTETIC (WEB AUDIO API - FĂRĂ FIȘIERE EXTERNE)
     ********************************************************************/
    let audioCtx = null;

    function playTone(freq, type = 'sine', duration = 0.08, vol = 0.08) {
      if (!state.soundEnabled) return;
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.35, audioCtx.currentTime + duration);

        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (e) {}
    }

    function toggleSound() {
      state.soundEnabled = !state.soundEnabled;
      document.getElementById('btnSound').innerText = state.soundEnabled ? '🔊 Sunet: ON' : '🔇 Sunet: OFF';
      if (state.soundEnabled) playTone(520, 'triangle', 0.1, 0.1);
      saveGame();
    }

    // ==========================================
    // MELODIA OFICIALĂ QUANTUM NEXUS (background.mp3)
    // ==========================================
    let bgMusicAudio = null;
    let audioUnlockListenersBound = false;

    function initBackgroundMusic() {
      if (!bgMusicAudio) {
        bgMusicAudio = new Audio('./background.mp3');
        bgMusicAudio.loop = true;
        bgMusicAudio.volume = 0.45;
        bgMusicAudio.preload = 'auto';
      }
    }

    // Pre-inițializăm resursa Audio pentru decodare rapidă din cache
    try {
      initBackgroundMusic();
    } catch (e) {}

    function setupAudioUnlockListeners() {
      if (audioUnlockListenersBound) return;
      audioUnlockListenersBound = true;

      const unlockHandler = () => {
        if (state && state.musicEnabled && bgMusicAudio && bgMusicAudio.paused) {
          bgMusicAudio.play().then(() => {
            removeAudioUnlockListeners();
            const hint = document.getElementById('loadingAudioHint');
            if (hint) hint.style.display = 'none';
          }).catch(() => {});
        }
        if (typeof audioCtx !== 'undefined' && audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }
      };

      const events = ['pointerdown', 'mousedown', 'touchstart', 'touchend', 'keydown', 'pointermove', 'mousemove', 'wheel', 'scroll'];
      events.forEach(evt => {
        window.addEventListener(evt, unlockHandler, { passive: true, capture: true });
        document.addEventListener(evt, unlockHandler, { passive: true, capture: true });
      });

      window._removeAudioUnlockListeners = () => {
        events.forEach(evt => {
          window.removeEventListener(evt, unlockHandler, { capture: true });
          document.removeEventListener(evt, unlockHandler, { capture: true });
        });
        audioUnlockListenersBound = false;
      };
    }

    function removeAudioUnlockListeners() {
      if (typeof window._removeAudioUnlockListeners === 'function') {
        window._removeAudioUnlockListeners();
      }
    }

    function startCosmicMusic() {
      if (!state.musicEnabled) return;
      try {
        initBackgroundMusic();
        const playPromise = bgMusicAudio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            // Autoplay a pornit fără nicio blocare!
            removeAudioUnlockListeners();
            const hint = document.getElementById('loadingAudioHint');
            if (hint) hint.style.display = 'none';
          }).catch((err) => {
            // Autoplay amânat de politica browserului: ascultăm orice interacțiune
            setupAudioUnlockListeners();
            const hint = document.getElementById('loadingAudioHint');
            if (hint) hint.style.display = 'inline-flex';
          });
        }
      } catch (e) {
        console.warn('Eroare pornire muzică:', e);
      }
    }

    function stopCosmicMusic() {
      removeAudioUnlockListeners();
      const hint = document.getElementById('loadingAudioHint');
      if (hint) hint.style.display = 'none';
      if (bgMusicAudio) {
        try {
          bgMusicAudio.pause();
        } catch (e) {}
      }
    }

    function toggleMusic() {
      state.musicEnabled = !state.musicEnabled;
      localStorage.setItem('qn_music_user_choice', 'true');
      syncMusicUI();
      if (state.musicEnabled) {
        startCosmicMusic();
        showToast('🎵 Muzica de fundal a pornit!');
      } else {
        stopCosmicMusic();
        showToast('🔇 Muzica a fost oprită.');
      }
      saveGame();
    }

    function syncMusicUI() {
      const btn = document.getElementById('btnMusic');
      if (btn) {
        btn.innerText = state.musicEnabled ? '🎵 Muzică: ON' : '🎵 Muzică: OFF';
        btn.style.borderColor = state.musicEnabled ? 'var(--accent-purple)' : '';
        btn.style.color = state.musicEnabled ? '#e9d5ff' : '';
      }
    }

