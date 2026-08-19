/* ==========================================================================
   Network Engine - Cloud WebSocket Realtime Multiplayer via MQTT (WSS)
   ========================================================================== */

class NetworkEngine {
    constructor() {
        this.client = null;
        this.mode = 'LOCAL'; // 'LOCAL' | 'HOST' | 'GUEST'
        this.myRoomId = null;
        this.isConnected = false;
        this.myPlayerIndex = 0; // 0 for Host (Player 1), 1 for Guest (Player 2)

        // Callbacks
        this.onConnectedCallback = null;
        this.onDisconnectedCallback = null;
    }

    /**
     * Inisialisasi Cloud WebSocket Client (WSS EMQX Global Server)
     */
    initClient(onReady, onError) {
        if (this.client && this.client.connected) {
            if (onReady) onReady();
            return;
        }

        if (this.client) {
            try { this.client.end(true); } catch(e) {}
            this.client = null;
        }

        // Fast Global Public WSS Broker (HTTPS 443 compatible)
        const brokerUrl = 'wss://broker.emqx.io:8084/mqtt';
        const clientId = 'UT_' + Math.random().toString(36).substring(2, 10);

        try {
            this.client = mqtt.connect(brokerUrl, {
                clientId: clientId,
                clean: true,
                connectTimeout: 8000,
                keepalive: 30,
                reconnectPeriod: 2000
            });

            let isFirstConnect = true;

            this.client.on('connect', () => {
                console.log('Connected to Global Cloud WebSocket Server!');
                if (isFirstConnect) {
                    isFirstConnect = false;
                    if (onReady) onReady();
                }
            });

            this.client.on('message', (topic, message) => {
                try {
                    const payload = JSON.parse(message.toString());
                    this.handleIncomingData(payload);
                } catch (e) {
                    console.error('Failed to parse payload:', e);
                }
            });

            this.client.on('error', (err) => {
                console.error('MQTT Error:', err);
                if (isFirstConnect && onError) {
                    isFirstConnect = false;
                    onError(err);
                }
            });

            this.client.on('offline', () => {
                console.warn('MQTT Client Offline, attempting reconnect...');
            });
        } catch(err) {
            console.error('MQTT Setup Exception:', err);
            if (onError) onError(err);
        }
    }

    /**
     * Pemain 1: Buat Room sebagai Host
     */
    createRoom(hostProfile, onRoomCreated) {
        this.mode = 'HOST';
        this.myPlayerIndex = 0;
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.myRoomId = `UT-${randomCode}`;

        this.initClient(() => {
            const hostTopic = `ulartangga/${this.myRoomId}/host`;
            this.client.subscribe(hostTopic, { qos: 1 }, (err) => {
                if (!err) {
                    console.log('Host listening on topic:', hostTopic);
                    if (onRoomCreated) onRoomCreated(this.myRoomId);
                }
            });
        });
    }

    /**
     * Pemain 2: Gabung ke Room Host
     */
    joinRoom(targetRoomId, guestProfile, onConnecting, onConnected, onError) {
        this.mode = 'GUEST';
        this.myPlayerIndex = 1;
        this.myRoomId = targetRoomId.trim().toUpperCase();

        this.initClient(() => {
            if (onConnecting) onConnecting();

            const guestTopic = `ulartangga/${this.myRoomId}/guest`;

            this.client.subscribe(guestTopic, { qos: 1 }, (err) => {
                if (!err) {
                    console.log('Guest listening on topic:', guestTopic);
                    this.isConnected = true;

                    // Publish GUEST_JOINED event to Host
                    this.send({
                        type: 'GUEST_JOINED',
                        profile: guestProfile
                    });

                    if (onConnected) onConnected();
                    if (this.onConnectedCallback) this.onConnectedCallback();
                    gameEngine.updateOnlineStatusBadge();
                    gameEngine.updateOnlineTurnUI();
                } else {
                    if (onError) onError(err);
                }
            });
        }, onError);
    }

    send(payload) {
        if (!this.client || !this.client.connected || !this.myRoomId) return;

        // Host sends to guest topic, Guest sends to host topic
        const targetTopic = (this.mode === 'HOST') 
            ? `ulartangga/${this.myRoomId}/guest` 
            : `ulartangga/${this.myRoomId}/host`;

        this.client.publish(targetTopic, JSON.stringify(payload), { qos: 1 });
    }

    handleIncomingData(data) {
        if (!data || !data.type) return;

        switch (data.type) {
            case 'GUEST_JOINED':
                if (this.mode === 'HOST') {
                    this.isConnected = true;
                    gameEngine.players[1].name   = data.profile.name;
                    gameEngine.players[1].avatar = data.profile.avatar;
                    gameEngine.players[1].color  = data.profile.color;

                    this.send({
                        type: 'GAME_SYNC_INIT',
                        hostProfile: {
                            name:   gameEngine.players[0].name,
                            avatar: gameEngine.players[0].avatar,
                            color:  gameEngine.players[0].color
                        },
                        tileLayout: boardEngine.exportTileLayout()
                    });

                    gameEngine.startOnlineGame(true);
                    gameEngine.updateOnlineStatusBadge();
                    gameEngine.updateOnlineTurnUI();
                }
                break;

            case 'GAME_SYNC_INIT':
                if (this.mode === 'GUEST') {
                    this.isConnected = true;
                    gameEngine.players[0].name   = data.hostProfile.name;
                    gameEngine.players[0].avatar = data.hostProfile.avatar;
                    gameEngine.players[0].color  = data.hostProfile.color;

                    if (data.tileLayout) {
                        boardEngine.importTileLayout(data.tileLayout);
                    }

                    gameEngine.startOnlineGame(false);
                    gameEngine.updateOnlineStatusBadge();
                    gameEngine.updateOnlineTurnUI();
                }
                break;

            case 'DICE_ROLL':
                diceEngine.triggerRemoteRoll(data.value, () => {
                    gameEngine.handleDiceRollResult(data.value, true);
                });
                break;

            case 'CARD_EVENT_SYNC':
                gameEngine.handleRemoteCardEvent(data);
                break;

            case 'CLOSE_EVENT_CARD':
                gameEngine.closeEventCard(true);
                break;

            case 'TILE_MORPH_SYNC':
                boardEngine.setTileType(data.tileNum, data.newType);
                break;

            case 'STATE_SYNC':
                gameEngine.applyStateSync(data);
                break;

            case 'RESTART_GAME':
                if (data.tileLayout) boardEngine.importTileLayout(data.tileLayout);
                gameEngine.restartGame(true);
                break;
        }
    }

    handleDisconnect() {
        this.isConnected = false;
        alert('Koneksi dengan pasangan terputus!');
        this.resetToLocal();
        if (this.onDisconnectedCallback) this.onDisconnectedCallback();
    }

    resetToLocal() {
        this.mode = 'LOCAL';
        this.isConnected = false;
        this.myRoomId = null;
        if (this.client) {
            try { this.client.end(true); } catch(e) {}
            this.client = null;
        }
        gameEngine.updateOnlineStatusBadge();
        gameEngine.updateOnlineTurnUI();
    }

    isMyTurn() {
        if (this.mode === 'LOCAL') return true;
        if (!this.isConnected) return false;
        return gameEngine.activePlayerIndex === this.myPlayerIndex;
    }
}

const networkEngine = new NetworkEngine();
