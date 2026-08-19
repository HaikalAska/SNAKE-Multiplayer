/* ==========================================================================
   Dice Roll Engine & 3D Physics Animation
   ========================================================================== */

class DiceEngine {
    constructor() {
        this.diceCubeEl    = document.getElementById('dice-cube');
        this.rollBtnEl     = document.getElementById('roll-btn');
        this.diceContainerEl = document.getElementById('dice-container');
        this.isRolling     = false;
        this.currentValue  = 1;
        this.onRollComplete = null;

        // Kumulatif rotasi agar dice tidak "snap" balik ke 0
        this._cumX = 0;
        this._cumY = 0;
    }

    init(onRollCompleteCallback) {
        this.onRollComplete = onRollCompleteCallback;

        this.rollBtnEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.roll();
        });

        this.diceContainerEl.addEventListener('click', () => {
            this.roll();
        });
    }

    roll() {
        // Guard: tidak bisa roll lagi saat masih rolling atau game engine sedang proses
        if (this.isRolling) return;
        if (gameEngine.isAnimating || gameEngine.isAwaitingQuestion) return;
        if (this.rollBtnEl.disabled) return;

        // Cek apakah giliran kita (jika mode Online)
        if (networkEngine && !networkEngine.isMyTurn()) {
            return;
        }

        // Angka dadu acak 1–6
        const result = Math.floor(Math.random() * 6) + 1;

        // Jika Online, kirim hasil dadu ke pasangan
        if (networkEngine && networkEngine.mode !== 'LOCAL' && networkEngine.isConnected) {
            networkEngine.send({
                type: 'DICE_ROLL',
                value: result
            });
        }

        this._animateRoll(result, () => {
            if (this.onRollComplete) {
                this.onRollComplete(result);
            }
        });
    }

    /**
     * Dipanggil saat menerima lemparan dadu dari pasangan (Online)
     */
    triggerRemoteRoll(result, onComplete) {
        this._animateRoll(result, onComplete);
    }

    _animateRoll(result, callback) {
        this.isRolling = true;
        this.rollBtnEl.disabled = true;
        this.currentValue = result;

        soundEngine.playDiceRoll();

        // Putaran ekstra agar terlihat seperti benar-benar dikocok
        const extraX = (Math.floor(Math.random() * 3) + 3) * 360;
        const extraY = (Math.floor(Math.random() * 3) + 3) * 360;

        this._cumX += extraX;
        this._cumY += extraY;

        const faceOffsets = {
            1: { x: 0,   y: 0 },
            2: { x: 0,   y: 90 },
            3: { x: 0,   y: -180 },
            4: { x: 0,   y: -90 },
            5: { x: -90, y: 0 },
            6: { x: 90,  y: 0 }
        };

        const finalX = this._cumX + faceOffsets[result].x;
        const finalY = this._cumY + faceOffsets[result].y;

        this.diceCubeEl.style.transition = 'transform 0.9s cubic-bezier(0.25, 0.8, 0.35, 1.15)';
        this.diceCubeEl.style.transform  = `rotateX(${finalX}deg) rotateY(${finalY}deg)`;

        setTimeout(() => {
            this.isRolling = false;
            if (callback) callback();
        }, 950);
    }
}

const diceEngine = new DiceEngine();
