/* ==========================================================================
   Main Application Entry Point & DOM Event Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // =======================================================================
    // 1. Init Engines
    // =======================================================================
    boardEngine.init();
    gameEngine.init();

    diceEngine.init((diceResult) => {
        gameEngine.handleDiceRollResult(diceResult);
    });

    // =======================================================================
    // 2. Sound Toggle
    // =======================================================================
    const btnSoundToggle = document.getElementById('btn-sound-toggle');
    const soundTextEl    = document.getElementById('sound-text');

    btnSoundToggle.addEventListener('click', () => {
        soundEngine.enabled = !soundEngine.enabled;
        soundTextEl.textContent = soundEngine.enabled ? 'Suara: ON' : 'Suara: OFF';
        btnSoundToggle.querySelector('i').className = soundEngine.enabled
            ? 'fa-solid fa-volume-high'
            : 'fa-solid fa-volume-xmark';
    });

    // =======================================================================
    // 3. Restart Game
    // =======================================================================
    document.getElementById('btn-restart-game').addEventListener('click', () => {
        gameEngine.restartGame();
    });

    // =======================================================================
    // 4. Offline Player Setup Modal
    // =======================================================================
    const setupModal            = document.getElementById('setup-modal');
    const btnSetupGame          = document.getElementById('btn-setup-game');
    const closeModalBtn         = document.getElementById('close-modal-btn');
    const playerCountSelect     = document.getElementById('player-count-select');
    const playerInputsContainer = document.getElementById('player-inputs-container');
    const saveSetupBtn          = document.getElementById('save-setup-btn');

    btnSetupGame.addEventListener('click', () => {
        playerCountSelect.value = String(gameEngine.players.length);
        renderModalRows(gameEngine.players.length);
        setupModal.classList.remove('hidden');
    });
    closeModalBtn.addEventListener('click', () => setupModal.classList.add('hidden'));
    setupModal.addEventListener('click', (e) => {
        if (e.target === setupModal) setupModal.classList.add('hidden');
    });
    playerCountSelect.addEventListener('change', (e) => renderModalRows(parseInt(e.target.value)));

    function renderModalRows(count) {
        playerInputsContainer.innerHTML = '';
        const current = gameEngine.players;

        for (let i = 0; i < count; i++) {
            const existing      = current[i];
            const defaultName   = existing ? existing.name   : `Pemain ${i + 1}`;
            const selectedAvatar = existing ? existing.avatar : AVATAR_PRESETS[i % AVATAR_PRESETS.length].url;

            const row = document.createElement('div');
            row.className = 'player-config-row';
            row.innerHTML = `
                <label class="player-config-label">Pemain ${i + 1}</label>
                <input type="text" class="form-control player-name-input" value="${defaultName}" placeholder="Nama Pemain" maxlength="20">
                <div class="avatar-select-group">
                    ${AVATAR_PRESETS.map(p => `
                        <img src="${p.url}"
                             class="avatar-preview-option ${p.url === selectedAvatar ? 'selected' : ''}"
                             data-url="${p.url}" data-color="${p.color}" title="${p.name}"
                             style="border-color: ${p.url === selectedAvatar ? p.color : 'rgba(255,255,255,0.2)'}">
                    `).join('')}
                </div>
            `;
            playerInputsContainer.appendChild(row);
        }

        playerInputsContainer.querySelectorAll('.avatar-preview-option').forEach(img => {
            img.addEventListener('click', (e) => {
                const grp = e.currentTarget.closest('.avatar-select-group');
                grp.querySelectorAll('.avatar-preview-option').forEach(el => {
                    el.classList.remove('selected');
                    el.style.borderColor = 'rgba(255,255,255,0.2)';
                });
                e.currentTarget.classList.add('selected');
                e.currentTarget.style.borderColor = e.currentTarget.dataset.color;
            });
        });
    }

    saveSetupBtn.addEventListener('click', () => {
        const rows      = playerInputsContainer.querySelectorAll('.player-config-row');
        const newPlayers = [];

        rows.forEach((row, idx) => {
            const nameInput   = row.querySelector('.player-name-input');
            const selectedImg = row.querySelector('.avatar-preview-option.selected');
            newPlayers.push({
                id:       idx + 1,
                name:     nameInput.value.trim() || `Pemain ${idx + 1}`,
                avatar:   selectedImg ? selectedImg.dataset.url   : AVATAR_PRESETS[idx % AVATAR_PRESETS.length].url,
                color:    selectedImg ? selectedImg.dataset.color  : AVATAR_PRESETS[idx % AVATAR_PRESETS.length].color,
                position: 0
            });
        });

        networkEngine.resetToLocal();
        gameEngine.setPlayers(newPlayers);
        setupModal.classList.add('hidden');
    });

    // =======================================================================
    // 5. Online Multiplayer (LDR Mode) Modal
    // =======================================================================
    const onlineModal           = document.getElementById('online-modal');
    const btnOpenOnlineModal    = document.getElementById('btn-open-online-modal');
    const closeOnlineModalBtn   = document.getElementById('close-online-modal-btn');
    const tabHostBtn            = document.getElementById('tab-host-btn');
    const tabGuestBtn           = document.getElementById('tab-guest-btn');
    const tabHostContent        = document.getElementById('tab-host-content');
    const tabGuestContent       = document.getElementById('tab-guest-content');
    const hostNameInput         = document.getElementById('host-name-input');
    const hostAvatarGroup       = document.getElementById('host-avatar-group');
    const btnCreateRoom         = document.getElementById('btn-create-room');
    const hostRoomInfo          = document.getElementById('host-room-info');
    const displayRoomCode       = document.getElementById('display-room-code');
    const btnCopyCode           = document.getElementById('btn-copy-code');
    const guestRoomCodeInput    = document.getElementById('guest-room-code-input');
    const guestNameInput        = document.getElementById('guest-name-input');
    const guestAvatarGroup      = document.getElementById('guest-avatar-group');
    const btnJoinRoom           = document.getElementById('btn-join-room');
    const guestConnectingMsg    = document.getElementById('guest-connecting-msg');
    const btnSwitchToLocal      = document.getElementById('btn-switch-to-local');

    function renderAvatarPicker(containerEl, defaultIdx = 0) {
        containerEl.innerHTML = AVATAR_PRESETS.map((p, i) => `
            <img src="${p.url}"
                 class="avatar-preview-option ${i === defaultIdx ? 'selected' : ''}"
                 data-url="${p.url}" data-color="${p.color}" title="${p.name}"
                 style="border-color: ${i === defaultIdx ? p.color : 'rgba(255,255,255,0.2)'}">
        `).join('');

        containerEl.querySelectorAll('.avatar-preview-option').forEach(img => {
            img.addEventListener('click', (e) => {
                containerEl.querySelectorAll('.avatar-preview-option').forEach(el => {
                    el.classList.remove('selected');
                    el.style.borderColor = 'rgba(255,255,255,0.2)';
                });
                e.currentTarget.classList.add('selected');
                e.currentTarget.style.borderColor = e.currentTarget.dataset.color;
            });
        });
    }

    renderAvatarPicker(hostAvatarGroup, 0);
    renderAvatarPicker(guestAvatarGroup, 1);

    btnOpenOnlineModal.addEventListener('click', () => onlineModal.classList.remove('hidden'));
    closeOnlineModalBtn.addEventListener('click', () => onlineModal.classList.add('hidden'));
    onlineModal.addEventListener('click', (e) => {
        if (e.target === onlineModal) onlineModal.classList.add('hidden');
    });

    tabHostBtn.addEventListener('click', () => {
        tabHostBtn.classList.add('active'); tabGuestBtn.classList.remove('active');
        tabHostContent.classList.remove('hidden'); tabGuestContent.classList.add('hidden');
    });
    tabGuestBtn.addEventListener('click', () => {
        tabGuestBtn.classList.add('active'); tabHostBtn.classList.remove('active');
        tabGuestContent.classList.remove('hidden'); tabHostContent.classList.add('hidden');
    });

    const displayRoomLink = document.getElementById('display-room-link');
    const btnCopyLink     = document.getElementById('btn-copy-link');

    // Helper to extract room code from pure code or full URL
    function extractRoomCode(raw) {
        if (!raw) return '';
        raw = raw.trim();
        const match = raw.match(/room=([A-Za-z0-9_-]+)/i);
        if (match) return match[1].toUpperCase();
        return raw.toUpperCase();
    }

    if (guestRoomCodeInput) {
        guestRoomCodeInput.addEventListener('input', (e) => {
            const raw = e.target.value;
            if (raw.includes('room=')) {
                e.target.value = extractRoomCode(raw);
            }
        });
    }

    // Buat Room (Host)
    btnCreateRoom.addEventListener('click', () => {
        const hostName  = hostNameInput.value.trim() || 'Pemain 1 (Him)';
        const selImg    = hostAvatarGroup.querySelector('.avatar-preview-option.selected');
        const hostAvatar = selImg ? selImg.dataset.url   : AVATAR_PRESETS[0].url;
        const hostColor  = selImg ? selImg.dataset.color  : AVATAR_PRESETS[0].color;

        gameEngine.players[0].name   = hostName;
        gameEngine.players[0].avatar = hostAvatar;
        gameEngine.players[0].color  = hostColor;

        btnCreateRoom.disabled = true;
        btnCreateRoom.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menghubungkan...';

        networkEngine.createRoom({ name: hostName, avatar: hostAvatar, color: hostColor }, (roomId) => {
            btnCreateRoom.classList.add('hidden');
            hostRoomInfo.classList.remove('hidden');
            displayRoomCode.textContent = roomId;
            const inviteLink = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
            if (displayRoomLink) displayRoomLink.value = inviteLink;
            gameEngine.updateOnlineStatusBadge();
        });
    });

    if (btnCopyLink) {
        btnCopyLink.addEventListener('click', () => {
            const link = displayRoomLink ? displayRoomLink.value : `${window.location.origin}${window.location.pathname}?room=${displayRoomCode.textContent}`;
            navigator.clipboard.writeText(link).then(() => {
                btnCopyLink.innerHTML = '<i class="fa-solid fa-check"></i> Link Tersalin!';
                setTimeout(() => { btnCopyLink.innerHTML = '<i class="fa-solid fa-copy"></i> Salin Link'; }, 2000);
            });
        });
    }

    if (displayRoomLink) {
        displayRoomLink.addEventListener('click', () => displayRoomLink.select());
    }

    btnCopyCode.addEventListener('click', () => {
        const code = displayRoomCode.textContent;
        navigator.clipboard.writeText(code).then(() => {
            btnCopyCode.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
            setTimeout(() => { btnCopyCode.innerHTML = '<i class="fa-solid fa-copy"></i> Salin Kode Saja'; }, 2000);
        });
    });

    // Auto-detect ?room=... parameter in URL for instant joining
    const urlParams = new URLSearchParams(window.location.search);
    const autoRoomCode = urlParams.get('room');
    if (autoRoomCode) {
        setTimeout(() => {
            onlineModal.classList.remove('hidden');
            tabGuestBtn.click();
            guestRoomCodeInput.value = extractRoomCode(autoRoomCode);
            guestConnectingMsg.classList.remove('hidden');
            guestConnectingMsg.innerHTML = '✨ <strong>Link Room terdeteksi!</strong> Tinggal klik <em>Gabung &amp; Main Sekarang</em>!';
        }, 500);
    }

    // Gabung Room (Guest)
    btnJoinRoom.addEventListener('click', () => {
        const rawInput    = guestRoomCodeInput.value;
        const targetCode  = extractRoomCode(rawInput);
        if (!targetCode) { alert('Silakan masukkan Kode atau Link Room!'); return; }

        const guestName   = guestNameInput.value.trim() || 'Pemain 2 (Her)';
        const selImg      = guestAvatarGroup.querySelector('.avatar-preview-option.selected');
        const guestAvatar = selImg ? selImg.dataset.url   : AVATAR_PRESETS[1].url;
        const guestColor  = selImg ? selImg.dataset.color  : AVATAR_PRESETS[1].color;

        gameEngine.players[1].name   = guestName;
        gameEngine.players[1].avatar = guestAvatar;
        gameEngine.players[1].color  = guestColor;

        btnJoinRoom.disabled = true;
        guestConnectingMsg.classList.remove('hidden');
        guestConnectingMsg.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menghubungkan ke ${targetCode}...`;

        networkEngine.joinRoom(
            targetCode,
            { name: guestName, avatar: guestAvatar, color: guestColor },
            () => {
                guestConnectingMsg.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menghubungkan ke ${targetCode}...`;
            },
            () => {
                guestConnectingMsg.innerHTML = '<i class="fa-solid fa-circle-check" style="color:#51cf66;"></i> Berhasil Tersambung!';
                setTimeout(() => {
                    onlineModal.classList.add('hidden');
                    btnJoinRoom.disabled = false;
                    guestConnectingMsg.classList.add('hidden');
                }, 800);
            },
            (err) => {
                btnJoinRoom.disabled = false;
                guestConnectingMsg.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color:#ff6b6b"></i> Gagal konek! Pastikan Kode Room benar.';
            }
        );
    });

    networkEngine.onConnectedCallback = () => {
        onlineModal.classList.add('hidden');
        gameEngine.updateOnlineStatusBadge();
        gameEngine.updateOnlineTurnUI();
    };

    btnSwitchToLocal.addEventListener('click', () => {
        networkEngine.resetToLocal();
        onlineModal.classList.add('hidden');
    });

    // =======================================================================
    // 6. Init default modal rows
    // =======================================================================
    setTimeout(() => {
        playerCountSelect.value = '2';
        renderModalRows(2);
    }, 0);
});
