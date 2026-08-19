/* ==========================================================================
   Game State Engine & Pawn Movement Manager
   ========================================================================== */

const AVATAR_PRESETS = [
    { id:'avatar1', name:'Robot Pink',   color:'#e91e63', url:'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Aneka&backgroundColor=fce4ec' },
    { id:'avatar2', name:'Robot Biru',   color:'#1e88e5', url:'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Blaze&backgroundColor=e3f2fd' },
    { id:'avatar3', name:'Robot Hijau',  color:'#43a047', url:'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Coco&backgroundColor=e8f5e9' },
    { id:'avatar4', name:'Robot Ungu',   color:'#8e24aa', url:'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Dino&backgroundColor=f3e5f5' },
    { id:'avatar5', name:'Robot Kuning', color:'#f9a825', url:'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Elio&backgroundColor=fffde7' }
];

const START_POSITION = 0;

// Visual config per event type for the Event Card overlay
const EVENT_CARD_CONFIG = {
    question:  { title:'❓ Pertanyaan Romantis', gradient:'linear-gradient(135deg,#8B6914,#DAA520)', accent:'#ffd43b', btnLabel:'Sudah Dijawab ✓',     penaltyLabel:'Tidak Mau Jawab (Mundur 10)', hasPenalty:true  },
    challenge: { title:'⚡ Tantangan!',           gradient:'linear-gradient(135deg,#7B2000,#E67E22)', accent:'#ff922b', btnLabel:'Tantangan Selesai! ✓', penaltyLabel:'Lewati (Mundur 5 Kotak)',       hasPenalty:true  },
    romantic:  { title:'💕 Momen Romantis!',      gradient:'linear-gradient(135deg,#880E4F,#E91E63)', accent:'#f783ac', btnLabel:'Yay! Maju 3 Kotak 💫', hasPenalty:false },
    bonus:     { title:'🎁 Bonus!',               gradient:'linear-gradient(135deg,#155724,#28a745)', accent:'#51cf66', btnLabel:'Lempar Dadu Lagi! 🎲',  hasPenalty:false },
    penalty:   { title:'💀 Hukuman!',             gradient:'linear-gradient(135deg,#3A0070,#7B1FA2)', accent:'#cc5de8', btnLabel:'Terima Hukuman 😔',     hasPenalty:false },
    wildcard:  { title:'',                        gradient:'',                                        accent:'',        btnLabel:'Terima Takdir!',         hasPenalty:false }
};

// Gradients per wildcard kind
const WILDCARD_CFG = {
    bad:  { gradient:'linear-gradient(135deg,#1a0505,#8B0000)', accent:'#ff6b6b', titlePrefix:'💔 NASIB BURUK' },
    good: { gradient:'linear-gradient(135deg,#0a3300,#1B5E20)', accent:'#69db7c', titlePrefix:'🌟 NASIB BAIK' }
};

class GameEngine {
    constructor() {
        this.players = [
            { id:1, name:'Pemain 1 (Him)', avatar:AVATAR_PRESETS[0].url, color:AVATAR_PRESETS[0].color, position:START_POSITION },
            { id:2, name:'Pemain 2 (Her)', avatar:AVATAR_PRESETS[1].url, color:AVATAR_PRESETS[1].color, position:START_POSITION }
        ];
        this.activePlayerIndex  = 0;
        this.isAnimating        = false;
        this.isAwaitingQuestion = false;
        this.skipNextTurn       = {};
        this.pendingExtraRoll   = false;
        this.activeGlobalEvent  = null; // { type, turnsLeft, title, desc }

        // DOM refs
        this.pawnsLayerEl     = document.getElementById('pawns-layer');
        this.playersListEl    = document.getElementById('players-list');
        this.activeNameEl     = document.getElementById('active-player-name');
        this.activeAvatarEl   = document.getElementById('active-player-avatar');
        this.winnerModalEl    = document.getElementById('winner-modal');
        this.winnerTextEl     = document.getElementById('winner-text');
        this.winnerAvatarEl   = document.getElementById('winner-avatar-display');
        this.rollBtnEl        = document.getElementById('roll-btn');
        this.gameStatusEl     = document.getElementById('game-status-msg');
        this.onlineStatusBadge = document.getElementById('online-status-badge');

        // Event card overlay refs
        this.eventCardOverlay  = document.getElementById('event-card-overlay');
        this.eventCardTitle    = document.getElementById('event-card-title');
        this.eventCardBody     = document.getElementById('event-card-body');
        this.eventCardInstr    = document.getElementById('event-card-instruction');
        this.eventCardMainBtn  = document.getElementById('event-card-main-btn');
        this.eventCardPenalBtn = document.getElementById('event-card-penalty-btn');

        // Wildcard flip card refs
        this.wildcardFlipOuter = document.getElementById('wildcard-flip-outer');
        this.wildcardFlipFront = document.getElementById('wildcard-flip-front');
        this.wildcardFlipBack  = document.getElementById('wildcard-flip-back');
        this.wildcardBackIcon  = document.getElementById('wildcard-back-icon');
        this.wildcardBackTitle = document.getElementById('wildcard-back-title');
        this.wildcardBackDesc  = document.getElementById('wildcard-back-desc');

        // Active Event Card refs
        this.activeEventCardEl  = document.getElementById('active-event-card');
        this.activeEventTitleEl = document.getElementById('active-event-title');
        this.activeEventTimerEl = document.getElementById('active-event-timer');
        this.activeEventDescEl  = document.getElementById('active-event-desc');
    }

    init() {
        this.renderPlayersList();
        this.renderPawnAvatars();
        this.updateActivePlayerUI();
        this.updateOnlineStatusBadge();
        this.updateOnlineTurnUI();
        this.updateActiveEventUI();

        window.addEventListener('resize', () => {
            clearTimeout(this._resizeTimer);
            this._resizeTimer = setTimeout(() => {
                this.updatePawnPositions();
                boardEngine.renderSnakesAndLaddersSVG();
            }, 150);
        });
    }

    // ── Global Active Event System ───────────────────────────────────────────

    triggerGlobalEvent(eventType, turns = 5) {
        let title = '', desc = '';
        if (eventType === 'event_snakeOutbreak') {
            title = '🐍 WABAH ULAR!';
            desc  = 'Bencana melanda! Papan dipenuhi 16 ular raksasa selama 5 ronde!';
            boardEngine.setSnakeOutbreak(true);
        } else if (eventType === 'event_ladderRain') {
            title = '🪜 HUJAN TANGGA!';
            desc  = 'Berkah semesta! Tangga-tangga raksasa bermunculan di papan selama 5 ronde!';
            boardEngine.setLadderRain(true);
        } else if (eventType === 'event_windStorm') {
            title = '💨 BADAI ANGIN!';
            desc  = 'Angin bertiup kencang! Pemain tersapu mundur 2 langkah tiap lemparan selama 4 ronde!';
        }

        this.activeGlobalEvent = { type: eventType, turnsLeft: turns, title, desc };
        this.updateActiveEventUI();
    }

    updateActiveEventUI() {
        if (!this.activeEventCardEl) return;
        if (this.activeGlobalEvent && this.activeGlobalEvent.turnsLeft > 0) {
            this.activeEventTitleEl.textContent = this.activeGlobalEvent.title;
            this.activeEventTimerEl.innerHTML   = `<i class="fa-solid fa-hourglass-half"></i> Sisa ${this.activeGlobalEvent.turnsLeft} Turn`;
            this.activeEventDescEl.textContent  = this.activeGlobalEvent.desc;
            this.activeEventCardEl.classList.remove('hidden');
        } else {
            this.activeEventCardEl.classList.add('hidden');
        }
    }

    // ── Player Management ────────────────────────────────────────────────────

    setPlayers(newPlayers) {
        this.players            = newPlayers;
        this.activePlayerIndex  = 0;
        this.isAnimating        = false;
        this.isAwaitingQuestion = false;
        this.skipNextTurn       = {};
        this.pendingExtraRoll   = false;
        this.activeGlobalEvent  = null;
        this.closeEventCard(true);
        boardEngine.resetBoardMode();
        this.renderPlayersList();
        this.renderPawnAvatars();
        this.updateActivePlayerUI();
        this.updateOnlineTurnUI();
        this.updateActiveEventUI();
    }

    startOnlineGame(isHost = false) {
        this.players.forEach(p => p.position = START_POSITION);
        this.activePlayerIndex  = 0;
        this.isAnimating        = false;
        this.isAwaitingQuestion = false;
        this.skipNextTurn       = {};
        this.pendingExtraRoll   = false;
        this.activeGlobalEvent  = null;
        this.closeEventCard(true);
        boardEngine.resetBoardMode();
        this.renderPlayersList();
        this.renderPawnAvatars();
        this.updateActivePlayerUI();
        this.updateOnlineStatusBadge();
        this.updateOnlineTurnUI();
        this.updateActiveEventUI();
    }

    updateOnlineStatusBadge() {
        if (!this.onlineStatusBadge) return;
        if (networkEngine.mode === 'LOCAL') {
            this.onlineStatusBadge.className = 'status-badge badge-local';
            this.onlineStatusBadge.innerHTML = '<i class="fa-solid fa-laptop"></i> Offline (1 Layar)';
        } else if (networkEngine.isConnected) {
            this.onlineStatusBadge.className = 'status-badge badge-online';
            this.onlineStatusBadge.innerHTML = `<i class="fa-solid fa-wifi"></i> Online (Room: <strong>${networkEngine.myRoomId}</strong>)`;
        } else {
            this.onlineStatusBadge.className = 'status-badge badge-waiting';
            this.onlineStatusBadge.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menunggu... (${networkEngine.myRoomId})`;
        }
    }

    updateOnlineTurnUI() {
        const p = this.players[this.activePlayerIndex];
        if (!p) return;
        if (networkEngine.mode === 'LOCAL') {
            const extra = this.pendingExtraRoll ? ' 🎲 Lempar lagi!' : ' — Lempar dadu!';
            this.setStatusMessage(`Giliran <strong style="color:${p.color}">${p.name}</strong>${extra}`);
            this._lockRollBtn(this.isAnimating || this.isAwaitingQuestion);
        } else {
            const isMyTurn = networkEngine.isMyTurn();
            if (isMyTurn) {
                this.setStatusMessage(`🎲 <strong>Giliran Kamu (${p.name})!</strong>`);
                this._lockRollBtn(this.isAnimating || this.isAwaitingQuestion);
            } else {
                this.setStatusMessage(`⏳ Menunggu <strong>${p.name}</strong>...`);
                this._lockRollBtn(true);
            }
        }
    }

    setStatusMessage(html) { if (this.gameStatusEl) this.gameStatusEl.innerHTML = html; }

    // ── Render ───────────────────────────────────────────────────────────────

    renderPlayersList() {
        this.playersListEl.innerHTML = '';
        this.players.forEach((player, idx) => {
            const isCurrent = idx === this.activePlayerIndex;
            const isMe      = networkEngine.mode !== 'LOCAL' && idx === networkEngine.myPlayerIndex;
            const willSkip  = !!this.skipNextTurn[idx];

            const el = document.createElement('div');
            el.className = `player-item ${isCurrent ? 'active' : ''}`;
            el.innerHTML = `
                <div class="player-avatar-wrapper" style="border-color:${player.color};${isCurrent ? `box-shadow:0 0 14px ${player.color}88` : ''}">
                    <img src="${player.avatar}" class="player-avatar-img" alt="">
                    ${willSkip ? '<div class="skip-badge">💤</div>' : ''}
                </div>
                <div class="player-info-col">
                    <span class="player-name-tag" style="${isCurrent?`color:${player.color}`:''}">
                        ${player.name}${isMe ? ' <em style="font-size:9px;opacity:0.7">(Kamu)</em>' : ''}
                    </span>
                    <span class="player-pos-tag">📍 Kotak ${player.position === 0 ? 'START' : player.position}</span>
                    ${willSkip ? '<span class="skip-label">💤 Skip ronde ini</span>' : ''}
                </div>
                ${isCurrent ? `<i class="fa-solid fa-caret-right player-pointer" style="color:${player.color}"></i>` : ''}
            `;
            this.playersListEl.appendChild(el);
        });
    }

    renderPawnAvatars() {
        this.pawnsLayerEl.innerHTML = '';
        this.players.forEach(player => {
            const pawn = document.createElement('div');
            pawn.className = 'pawn-avatar';
            pawn.id = `pawn-${player.id}`;
            pawn.style.backgroundImage = `url('${player.avatar}')`;
            pawn.style.borderColor     = player.color;
            pawn.style.boxShadow       = `0 0 10px ${player.color}88, 0 4px 8px rgba(0,0,0,0.5)`;
            this.pawnsLayerEl.appendChild(pawn);
        });
        requestAnimationFrame(() => this.updatePawnPositions());
    }

    updatePawnPositions() {
        const PS = Math.max(20, Math.min(38, boardEngine.boardGridEl.offsetWidth / 10 * 0.72));
        const ST = PS * 0.55;
        const tg = {};
        this.players.forEach((p, i) => { if (!tg[p.position]) tg[p.position]=[]; tg[p.position].push(i); });

        this.players.forEach((player, idx) => {
            const el = document.getElementById(`pawn-${player.id}`);
            if (!el) return;
            if (player.position === START_POSITION) {
                el.style.cssText += ';left:-100px;top:-100px;opacity:0;transform:scale(0)';
                return;
            }
            el.style.opacity = '1'; el.style.transform = 'scale(1)';
            const { x, y, tileWidth:tw, tileHeight:th } = boardEngine.getTileTopLeftPixels(player.position);
            const grp = tg[player.position], gi = grp.indexOf(idx), gl = grp.length;
            const ox = (gi - (gl-1)/2) * ST;
            const oy = gl > 1 ? (gi % 2 === 0 ? -ST*0.3 : ST*0.3) : 0;
            el.style.left   = `${x + tw/2 + ox - PS/2}px`;
            el.style.top    = `${y + th/2 + oy - PS/2}px`;
            el.style.width  = `${PS}px`;
            el.style.height = `${PS}px`;
        });
    }

    updateActivePlayerUI() {
        const p = this.players[this.activePlayerIndex];
        if (!p) return;
        this.activeNameEl.textContent = p.name;
        this.activeAvatarEl.src = p.avatar;
        this.activeAvatarEl.style.borderColor = p.color;
        this.renderPlayersList();
    }

    // ── Event Card Overlay ───────────────────────────────────────────────────

    showEventCard(type, contentHtml, instrHtml, onMain, onPenalty=null, isReadOnly=false) {
        const cfg = EVENT_CARD_CONFIG[type];
        if (!cfg || !this.eventCardOverlay) return;

        const card = this.eventCardOverlay.querySelector('.event-card');
        if (card) { card.style.background = cfg.gradient; }

        const activePlayer = this.players[this.activePlayerIndex];
        const activeName   = activePlayer ? activePlayer.name : 'Pasangan';

        this.eventCardTitle.textContent = isReadOnly ? `${cfg.title} (${activeName})` : cfg.title;
        this.eventCardTitle.style.color = cfg.accent;
        this.eventCardBody.innerHTML    = contentHtml;

        if (this.wildcardFlipOuter) this.wildcardFlipOuter.classList.add('hidden');

        if (isReadOnly) {
            this.eventCardInstr.innerHTML = `<p class="event-hint" style="color:#ffd43b;font-weight:bold;"><i class="fa-solid fa-spinner fa-spin"></i> Menunggu ${activeName} merespons...</p>`;
            this.eventCardMainBtn.textContent = `⏳ Menunggu ${activeName}...`;
            this.eventCardMainBtn.style.background = '#444';
            this.eventCardMainBtn.style.color = '#aaa';
            this.eventCardMainBtn.style.cursor = 'not-allowed';
            this.eventCardMainBtn.style.pointerEvents = 'none';
            this.eventCardMainBtn.disabled = true;
            this.eventCardPenalBtn.classList.add('hidden');
        } else {
            this.eventCardInstr.innerHTML = instrHtml || '';
            this.eventCardMainBtn.textContent = cfg.btnLabel;
            this.eventCardMainBtn.style.background = cfg.accent;
            this.eventCardMainBtn.style.color = '#111';
            this.eventCardMainBtn.style.cursor = 'pointer';
            this.eventCardMainBtn.style.pointerEvents = 'auto';
            this.eventCardMainBtn.disabled = false;
            this.eventCardMainBtn.onclick = () => { this.closeEventCard(); if (onMain) onMain(); };

            if (cfg.hasPenalty && onPenalty) {
                this.eventCardPenalBtn.textContent = cfg.penaltyLabel;
                this.eventCardPenalBtn.classList.remove('hidden');
                this.eventCardPenalBtn.onclick = () => { this.closeEventCard(); if (onPenalty) onPenalty(); };
            } else {
                this.eventCardPenalBtn.classList.add('hidden');
            }
        }

        this._highlightTile(true);
        this.eventCardOverlay.classList.remove('hidden');
        requestAnimationFrame(() => this.eventCardOverlay.classList.add('visible'));
    }

    showWildcardCard(wc, onDone, isReadOnly=false) {
        if (!this.eventCardOverlay) return;

        const wcCfg = WILDCARD_CFG[wc.kind];
        const card  = this.eventCardOverlay.querySelector('.event-card');
        const activePlayer = this.players[this.activePlayerIndex];
        const activeName   = activePlayer ? activePlayer.name : 'Pasangan';

        if (card) card.style.background = 'linear-gradient(135deg,#1a0030,#3d0060)';

        this.eventCardTitle.textContent = isReadOnly ? `🎴 KARTU RISIKO (${activeName})` : '🎴 KARTU RISIKO';
        this.eventCardTitle.style.color = '#ce93d8';
        this.eventCardBody.innerHTML    = '';
        this.eventCardMainBtn.classList.add('hidden');
        this.eventCardPenalBtn.classList.add('hidden');

        if (this.wildcardFlipOuter) {
            this.wildcardFlipOuter.classList.remove('hidden');
            this.wildcardFlipOuter.classList.remove('flipped');
            this.wildcardBackIcon.textContent  = '🎴';
            this.wildcardBackTitle.textContent = '???';
            this.wildcardBackDesc.textContent  = '';
        }

        this._highlightTile(true);
        this.eventCardOverlay.classList.remove('hidden');
        requestAnimationFrame(() => this.eventCardOverlay.classList.add('visible'));

        if (isReadOnly) {
            this.eventCardInstr.innerHTML = `<p class="event-hint" style="color:#ce93d8;font-weight:bold;"><i class="fa-solid fa-spinner fa-spin"></i> Menunggu ${activeName} membuka takdir...</p>`;
            setTimeout(() => {
                if (this.wildcardFlipOuter) this.wildcardFlipOuter.classList.add('flipped');
                setTimeout(() => {
                    this.wildcardBackIcon.textContent  = wc.icon;
                    this.wildcardBackTitle.textContent = wc.title;
                    this.wildcardBackDesc.textContent  = wc.desc;
                    if (card) card.style.background = wcCfg.gradient;
                    this.eventCardTitle.style.color = wcCfg.accent;
                    this.eventCardTitle.textContent = `${wcCfg.titlePrefix} (${activeName})!`;
                    this.eventCardInstr.innerHTML   = `<p class="event-hint" style="color:${wcCfg.accent};font-weight:bold;"><i class="fa-solid fa-spinner fa-spin"></i> Menunggu ${activeName} menerima takdir...</p>`;
                    
                    this.eventCardMainBtn.textContent = `⏳ Menunggu ${activeName}...`;
                    this.eventCardMainBtn.style.background = '#444';
                    this.eventCardMainBtn.style.color = '#aaa';
                    this.eventCardMainBtn.style.cursor = 'not-allowed';
                    this.eventCardMainBtn.style.pointerEvents = 'none';
                    this.eventCardMainBtn.disabled = true;
                    this.eventCardMainBtn.classList.remove('hidden');
                    this.eventCardMainBtn.onclick = null;
                }, 350);
            }, 600);
            return;
        }

        this.eventCardInstr.innerHTML = '<p class="event-hint">Klik kartu untuk membuka takdir!</p>';
        const doFlip = () => {
            if (!this.wildcardFlipOuter) { this._revealWildcard(wc, wcCfg, card, onDone); return; }
            this.wildcardFlipOuter.classList.add('flipped');

            setTimeout(() => {
                this.wildcardBackIcon.textContent  = wc.icon;
                this.wildcardBackTitle.textContent = wc.title;
                this.wildcardBackDesc.textContent  = wc.desc;

                if (card) card.style.background = wcCfg.gradient;
                this.eventCardTitle.style.color  = wcCfg.accent;
                this.eventCardTitle.textContent  = `${wcCfg.titlePrefix}!`;
                this.eventCardInstr.innerHTML    = '';

                this.eventCardMainBtn.textContent = 'Terima Takdir!';
                this.eventCardMainBtn.style.background = wcCfg.accent;
                this.eventCardMainBtn.style.color = '#111';
                this.eventCardMainBtn.style.cursor = 'pointer';
                this.eventCardMainBtn.style.pointerEvents = 'auto';
                this.eventCardMainBtn.disabled = false;
                this.eventCardMainBtn.classList.remove('hidden');
                this.eventCardMainBtn.onclick = () => { this.closeEventCard(); if (onDone) onDone(); };

                soundEngine.playQuestionPopup();
            }, 350);
        };

        const overlay = this.eventCardOverlay;
        const flipHandler = () => {
            overlay.removeEventListener('click', flipHandler);
            doFlip();
        };
        setTimeout(() => overlay.addEventListener('click', flipHandler), 300);
    }

    _revealWildcard(wc, wcCfg, card, onDone) {
        if (card) card.style.background = wcCfg.gradient;
        this.eventCardTitle.style.color = wcCfg.accent;
        this.eventCardTitle.textContent = `${wcCfg.titlePrefix}: ${wc.icon} ${wc.title}`;
        this.eventCardBody.innerHTML    = `<p class="event-question-text">${wc.desc}</p>`;
        this.eventCardInstr.innerHTML   = '';
        this.eventCardMainBtn.textContent = 'Terima Takdir!';
        this.eventCardMainBtn.style.background = wcCfg.accent;
        this.eventCardMainBtn.classList.remove('hidden');
        this.eventCardMainBtn.onclick = () => { this.closeEventCard(); if (onDone) onDone(); };
    }

    closeEventCard(isRemote = false) {
        this.isAwaitingQuestion = false;
        if (!this.eventCardOverlay) return;
        this.eventCardOverlay.classList.remove('visible');
        setTimeout(() => this.eventCardOverlay.classList.add('hidden'), 350);
        this._highlightTile(false);

        this.updateOnlineTurnUI();

        if (!isRemote && networkEngine && networkEngine.mode !== 'LOCAL' && networkEngine.isConnected) {
            networkEngine.send({ type: 'CLOSE_EVENT_CARD' });
        }
    }

    _highlightTile(on) {
        const p = this.players[this.activePlayerIndex];
        if (!p || p.position === START_POSITION) return;
        const el = document.getElementById(`tile-${p.position}`);
        if (el) el.classList[on ? 'add' : 'remove']('tile-landing-highlight');
    }

    // ── Core Game Logic ───────────────────────────────────────────────────────

    handleDiceRollResult(diceValue, isRemote=false) {
        if (this.isAnimating) return;

        const player = this.players[this.activePlayerIndex];
        const from   = player.position;
        const raw    = from + diceValue;

        let path = [];
        if (raw <= 100) {
            const s = from === START_POSITION ? 1 : from + 1;
            for (let p = s; p <= raw; p++) path.push(p);
        } else {
            for (let p = from + 1; p <= 100; p++) path.push(p);
            const ov = raw - 100;
            for (let p = 99; p >= Math.max(1, 100 - ov); p--) path.push(p);
        }

        if (from === START_POSITION) {
            const el = document.getElementById(`pawn-${player.id}`);
            if (el) { el.style.opacity='1'; el.style.transform='scale(1)'; }
        }

        this.pendingExtraRoll = false;
        this.setStatusMessage(`🎲 ${player.name} dapat angka <strong>${diceValue}</strong>!`);

        this.animatePawnSteps(player, path, () => {
            // Check windstorm active global event
            if (this.activeGlobalEvent && this.activeGlobalEvent.type === 'event_windStorm' && player.position > START_POSITION && player.position < 100) {
                const dest = Math.max(1, player.position - 2);
                const backPath = []; for (let p = player.position - 1; p >= dest; p--) backPath.push(p);
                setTimeout(() => {
                    this.setStatusMessage(`💨 Badai angin berhembus! ${player.name} tersapu mundur 2 langkah!`);
                    this.animatePawnSteps(player, backPath, () => this.evaluateLandTile(player, isRemote));
                }, 300);
                return;
            }
            this.evaluateLandTile(player, isRemote);
        });
    }

    animatePawnSteps(player, steps, onComplete) {
        if (!steps.length) { onComplete(); return; }
        this.isAnimating = true;
        this._lockRollBtn(true);
        let idx = 0;
        const delay = steps.length > 10 ? 110 : 190;
        const tick = () => {
            player.position = steps[idx];
            this.updatePawnPositions();
            soundEngine.playPawnStep();
            idx++;
            if (idx < steps.length) setTimeout(tick, delay);
            else setTimeout(() => { this.isAnimating = false; onComplete(); }, 280);
        };
        tick();
    }

    evaluateLandTile(player, isRemote = false) {
        const pos  = player.position;
        const type = boardEngine.getTileType(pos);

        if (pos === 100) { this._lockRollBtn(true); soundEngine.playVictory(); setTimeout(() => this.showVictoryModal(player), 600); return; }

        if (type === 'ladder') {
            const dest = boardEngine.ladders[pos];
            soundEngine.playLadderClimb();
            this.setStatusMessage(`🪜 ${player.name} naik tangga! <strong>${pos}</strong> → <strong>${dest}</strong>`);
            setTimeout(() => { player.position = dest; this.updatePawnPositions(); setTimeout(() => this._afterSpecial(player, isRemote), 350); }, 500);
            return;
        }

        if (type === 'snake') {
            const dest = boardEngine.snakes[pos];
            soundEngine.playSnakeSlide();
            this.setStatusMessage(`🐍 Kena ular! ${player.name} turun dari <strong>${pos}</strong> ke <strong>${dest}</strong>`);
            setTimeout(() => { player.position = dest; this.updatePawnPositions(); setTimeout(() => this._afterSpecial(player, isRemote), 350); }, 500);
            return;
        }

        if (['question','challenge','romantic','bonus','penalty','wildcard'].includes(type)) {
            if (!isRemote) {
                this.isAwaitingQuestion = true;
                this._lockRollBtn(true);
                this._triggerEvent(player, type);
            } else {
                this.updateOnlineTurnUI();
            }
            return;
        }

        // Only local active player advances turn
        if (!isRemote) {
            this.nextTurn();
        } else {
            this.updateOnlineTurnUI();
        }
    }

    _afterSpecial(player, isRemote = false) {
        const type = boardEngine.getTileType(player.position);
        if (player.position === 100) { this._lockRollBtn(true); soundEngine.playVictory(); setTimeout(() => this.showVictoryModal(player), 600); return; }
        if (['question','challenge','romantic','bonus','penalty','wildcard'].includes(type)) {
            if (!isRemote) {
                this.isAwaitingQuestion = true; 
                this._lockRollBtn(true); 
                this._triggerEvent(player, type);
            } else {
                this.updateOnlineTurnUI();
            }
        } else { 
            if (!isRemote) {
                this.nextTurn(); 
            } else {
                this.updateOnlineTurnUI();
            }
        }
    }

    _triggerEvent(player, type) {
        soundEngine.playQuestionPopup();
        const eventTilePos = player.position;
        const newType = boardEngine.morphTileType(eventTilePos);
        if (networkEngine && networkEngine.mode !== 'LOCAL' && networkEngine.isConnected && newType) {
            networkEngine.send({
                type: 'TILE_MORPH_SYNC',
                tileNum: eventTilePos,
                newType: newType
            });
        }

        let cardPayload = { type: 'CARD_EVENT_SYNC', cardType: type };

        if (type === 'question') {
            const q = questionBank.getQuestion();
            cardPayload.text = `"${q}"`;
            cardPayload.instr = '<p class="event-hint">Jawab pertanyaan di atas dengan jujur!</p>';
            cardPayload.hasPenalty = true;
            this.showEventCard('question', cardPayload.text, cardPayload.instr,
                () => this._endEvent(),
                () => this._penaltyBack(player, 10));
        }
        else if (type === 'challenge') {
            const ch = questionBank.getChallenge();
            cardPayload.text = `"${ch.text}"`;
            cardPayload.instr = ch.instruction ? `<p class="event-hint">💡 ${ch.instruction}</p>` : '';
            cardPayload.hasPenalty = true;
            this.showEventCard('challenge', cardPayload.text, cardPayload.instr,
                () => this._endEvent(),
                () => this._penaltyBack(player, 5));
        }
        else if (type === 'romantic') {
            const rm = questionBank.getRomantic();
            cardPayload.text = rm.text;
            cardPayload.instr = `<p class="event-hint">✨ Kamu maju <strong>+${rm.bonus} kotak</strong> bonus!</p>`;
            cardPayload.bonus = rm.bonus;
            this.showEventCard('romantic', cardPayload.text, cardPayload.instr,
                () => { 
                    const dest = Math.min(100, player.position + rm.bonus); 
                    const path = []; for (let p = player.position+1; p <= dest; p++) path.push(p); 
                    this.isAwaitingQuestion=false; 
                    this.animatePawnSteps(player, path, () => this.evaluateLandTile(player)); 
                });
        }
        else if (type === 'bonus') {
            const b = questionBank.getBonus();
            cardPayload.text = b;
            this.showEventCard('bonus', cardPayload.text, '',
                () => { 
                    this.isAwaitingQuestion=false; 
                    this.pendingExtraRoll=true; 
                    this._lockRollBtn(false); 
                    this.setStatusMessage(`🎁 ${player.name} dapat giliran ekstra! Lempar dadu lagi!`); 
                });
        }
        else if (type === 'penalty') {
            const pen = questionBank.getPenalty();
            cardPayload.text = pen;
            this.showEventCard('penalty', cardPayload.text, '<p class="event-hint">Giliran berikutmu dilewati.</p>',
                () => { this.skipNextTurn[this.activePlayerIndex] = true; this._endEvent(); });
        }
        else if (type === 'wildcard') {
            const wc = questionBank.getWildcard();
            cardPayload.cardData = wc;
            this.showWildcardCard(wc, () => {
                this._applyWildcardEffect(player, wc);
            });
        }

        if (networkEngine && networkEngine.mode !== 'LOCAL' && networkEngine.isConnected) {
            networkEngine.send(cardPayload);
        }
    }

    _applyWildcardEffect(player, wc) {
        const eff = wc.effect;
        this.isAwaitingQuestion = false;

        if (eff.startsWith('event_')) {
            const turns = (eff === 'event_windStorm') ? 4 : 5;
            this.triggerGlobalEvent(eff, turns);
            this.nextTurn();
        }
        else if (eff === 'toStart') {
            const path = [];
            for (let p = player.position - 1; p >= 1; p--) path.push(p);
            this.setStatusMessage(`🐴 ${player.name} ditabrak kuda, balik ke START!`);
            this.animatePawnSteps(player, path, () => {
                player.position = START_POSITION; this.updatePawnPositions(); this.nextTurn();
            });
        }
        else if (eff === 'skipTurn') {
            this.skipNextTurn[this.activePlayerIndex] = true;
            this._endEvent();
        }
        else if (eff === 'extraRoll') {
            this.pendingExtraRoll = true;
            this._lockRollBtn(false);
            this.setStatusMessage(`🎲 ${player.name} lempar dadu 2 kali!`);
        }
        else if (eff === 'swapPosition') {
            if (this.players.length >= 2) {
                const other = this.players.find((_, i) => i !== this.activePlayerIndex);
                if (other) {
                    this.setStatusMessage(`🔄 Posisi ${player.name} & ${other.name} ditukar!`);
                    [player.position, other.position] = [other.position, player.position];
                    this.updatePawnPositions();
                    setTimeout(() => this.nextTurn(), 700);
                } else { this.nextTurn(); }
            } else { this.nextTurn(); }
        }
        else {
            const [action, rawVal] = eff.split('_');
            const val = parseInt(rawVal) || 0;

            if (action === 'forward') {
                const dest = Math.min(100, player.position + val);
                const path = []; for (let p = player.position+1; p <= dest; p++) path.push(p);
                this.animatePawnSteps(player, path, () => this.evaluateLandTile(player));
            }
            else if (action === 'back') {
                const dest = Math.max(1, player.position - val);
                const path = []; for (let p = player.position-1; p >= dest; p--) path.push(p);
                this.setStatusMessage(`⬅️ ${player.name} mundur ${val} kotak!`);
                this.animatePawnSteps(player, path, () => this.nextTurn());
            }
            else if (action === 'toTile') {
                const dest = Math.min(100, Math.max(1, val));
                if (dest > player.position) {
                    const path = []; for (let p = player.position+1; p <= dest; p++) path.push(p);
                    this.animatePawnSteps(player, path, () => this.evaluateLandTile(player));
                } else if (dest < player.position) {
                    const path = []; for (let p = player.position-1; p >= dest; p--) path.push(p);
                    this.animatePawnSteps(player, path, () => this.nextTurn());
                } else { this.nextTurn(); }
            }
            else if (action === 'opponentBack') {
                const other = this.players.find((_,i) => i !== this.activePlayerIndex);
                if (other && other.position > START_POSITION) {
                    const dest = Math.max(1, other.position - val);
                    const path = []; for (let p = other.position-1; p >= dest; p--) path.push(p);
                    this.setStatusMessage(`😈 ${other.name} harus mundur ${val} kotak!`);
                    this.animatePawnSteps(other, path, () => this.nextTurn());
                } else { this.nextTurn(); }
            }
            else if (action === 'opponentForward') {
                const other = this.players.find((_,i) => i !== this.activePlayerIndex);
                if (other && other.position > START_POSITION) {
                    const dest = Math.min(100, other.position + val);
                    const path = []; for (let p = other.position+1; p <= dest; p++) path.push(p);
                    this.setStatusMessage(`😄 ${other.name} maju ${val} kotak karena kamu lucu!`);
                    this.animatePawnSteps(other, path, () => this.nextTurn());
                } else { this.nextTurn(); }
            }
            else { this.nextTurn(); }
        }
    }

    _penaltyBack(player, n) {
        this.isAwaitingQuestion = false;
        const dest = Math.max(1, player.position - n);
        const path = []; for (let p = player.position-1; p >= dest; p--) path.push(p);
        this.setStatusMessage(`⚠️ ${player.name} mundur ${n} kotak ke <strong>${dest}</strong>!`);
        this.animatePawnSteps(player, path, () => this.nextTurn());
    }

    _endEvent() {
        this.isAwaitingQuestion = false;
        this.nextTurn();
    }

    nextTurn() {
        // Countdown active global event
        if (this.activeGlobalEvent) {
            this.activeGlobalEvent.turnsLeft--;
            if (this.activeGlobalEvent.turnsLeft <= 0) {
                const endedType = this.activeGlobalEvent.type;
                this.activeGlobalEvent = null;
                if (endedType === 'event_snakeOutbreak' || endedType === 'event_ladderRain') {
                    boardEngine.resetBoardMode();
                }
                this.setStatusMessage(`✨ Event bencana telah berakhir! Papan kembali normal.`);
            }
            this.updateActiveEventUI();
        }

        this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
        if (this.skipNextTurn[this.activePlayerIndex]) {
            delete this.skipNextTurn[this.activePlayerIndex];
            const skipped = this.players[this.activePlayerIndex];
            this.setStatusMessage(`💤 ${skipped.name} skip gilirannya.`);
            this.updateActivePlayerUI();
            setTimeout(() => {
                this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
                this.updateActivePlayerUI();
                this.updateOnlineTurnUI();
                this.broadcastStateSync();
            }, 1200);
            return;
        }
        this.updateActivePlayerUI();
        this.updateOnlineTurnUI();
        this.broadcastStateSync();
    }

    broadcastStateSync() {
        if (networkEngine && networkEngine.mode !== 'LOCAL' && networkEngine.isConnected) {
            networkEngine.send({
                type: 'STATE_SYNC',
                players: this.players.map(p => ({ id: p.id, position: p.position })),
                activePlayerIndex: this.activePlayerIndex,
                skipNextTurn: this.skipNextTurn,
                activeGlobalEvent: this.activeGlobalEvent
            });
        }
    }

    applyStateSync(data) {
        if (!data) return;
        if (data.players) {
            data.players.forEach(sp => {
                const p = this.players.find(x => x.id === sp.id);
                if (p) p.position = sp.position;
            });
            this.updatePawnPositions();
        }
        if (typeof data.activePlayerIndex === 'number') {
            this.activePlayerIndex = data.activePlayerIndex;
        }
        if (data.skipNextTurn) {
            this.skipNextTurn = data.skipNextTurn;
        }
        if (data.activeGlobalEvent !== undefined) {
            this.activeGlobalEvent = data.activeGlobalEvent;
            if (this.activeGlobalEvent && this.activeGlobalEvent.type === 'event_snakeOutbreak') {
                boardEngine.setSnakeOutbreak(true);
            } else if (this.activeGlobalEvent && this.activeGlobalEvent.type === 'event_ladderRain') {
                boardEngine.setLadderRain(true);
            } else if (!this.activeGlobalEvent) {
                boardEngine.resetBoardMode();
            }
            this.updateActiveEventUI();
        }
        this.updateActivePlayerUI();
        this.updateOnlineTurnUI();
    }

    handleRemoteCardEvent(data) {
        if (!data) return;
        soundEngine.playQuestionPopup();
        this.isAwaitingQuestion = true;
        this._lockRollBtn(true);

        if (data.cardType === 'wildcard' && data.cardData) {
            this.showWildcardCard(data.cardData, null, true);
        } else if (data.cardType && EVENT_CARD_CONFIG[data.cardType]) {
            this.showEventCard(
                data.cardType,
                `<p class="event-question-text">${data.text || ''}</p>`,
                data.instr || '',
                null,
                null,
                true // isReadOnly = true for watching player!
            );
        }
    }

    _lockRollBtn(locked) { if (this.rollBtnEl) this.rollBtnEl.disabled = locked; }

    showVictoryModal(player) {
        this.winnerTextEl.textContent = `🎉 ${player.name} adalah pemenangnya!`;
        this.winnerAvatarEl.innerHTML = `<img src="${player.avatar}" style="width:90px;height:90px;border-radius:50%;border:4px solid ${player.color};box-shadow:0 6px 20px rgba(0,0,0,0.3);">`;
        this.winnerModalEl.classList.remove('hidden');
    }

    restartGame(isRemote=false) {
        this.winnerModalEl.classList.add('hidden');
        this.players.forEach(p => p.position = START_POSITION);
        this.activePlayerIndex  = 0;
        this.isAnimating        = false;
        this.isAwaitingQuestion = false;
        this.skipNextTurn       = {};
        this.pendingExtraRoll   = false;
        this.activeGlobalEvent  = null;
        this.closeEventCard(true);
        questionBank.reset();
        boardEngine.resetBoardMode();
        this._lockRollBtn(false);
        this.updatePawnPositions();
        this.updateActivePlayerUI();
        this.updateOnlineTurnUI();
        this.updateActiveEventUI();
        if (networkEngine.mode !== 'LOCAL' && networkEngine.isConnected && !isRemote) {
            networkEngine.send({
                type: 'RESTART_GAME',
                tileLayout: boardEngine.exportTileLayout()
            });
        }
    }

    executePenaltyMove(playerIndex, penaltyPos) {
        const player = this.players[playerIndex];
        const path = []; for (let p = player.position-1; p >= penaltyPos; p--) path.push(p);
        this.animatePawnSteps(player, path, () => this.nextTurn());
    }
}

const gameEngine = new GameEngine();
