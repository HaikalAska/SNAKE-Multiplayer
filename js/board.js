/* ==========================================================================
   Board Engine - Dynamic Grid Generator & SVG Snake/Ladder Renderer
   ========================================================================== */

class BoardEngine {
    constructor() {
        this.boardGridEl  = document.getElementById('board-grid');
        this.svgOverlayEl = document.getElementById('snakes-ladders-svg');

        // Base clean layouts - 13 strategic snakes for thrilling drops & ~55% win rate feel!
        this.baseSnakes  = { 
            99:54, 96:76, 92:53, 88:36, 84:63, 74:32, 
            62:18, 57:38, 48:26, 43:17, 34:6, 27:7, 14:3 
        };
        this.baseLadders = { 
            4:16, 12:31, 21:42, 35:56, 50:69, 71:91, 78:97 
        };

        // 🐍 "WABAH ULAR" event (16 snakes layout)
        this.outbreakSnakes = {
            99:10, 98:38, 95:65, 91:52, 87:23, 82:45, 76:34, 70:48,
            64:19, 58:27, 51:15, 43:12, 35:8, 29:6, 24:3, 16:2
        };

        // 🪵 "HUJAN TANGGA" event (10 ladders layout)
        this.rainLadders = {
            4:21, 11:32, 18:42, 28:51, 33:60, 46:74, 55:79, 61:85, 72:89, 80:96
        };

        this.snakes  = { ...this.baseSnakes };
        this.ladders = { ...this.baseLadders };

        // Event sets
        this.questionTiles  = new Set();
        this.challengeTiles = new Set();
        this.romanticTiles  = new Set();
        this.bonusTiles     = new Set();
        this.penaltyTiles   = new Set();
        this.wildcardTiles  = new Set();

        this.randomizeEventTiles();
    }

    setSnakeOutbreak(active) {
        if (active) {
            this.snakes = { ...this.outbreakSnakes };
        } else {
            this.snakes = { ...this.baseSnakes };
        }
        this.randomizeEventTiles();
        this.renderGridTiles();
        this.renderSnakesAndLaddersSVG();
    }

    setLadderRain(active) {
        if (active) {
            this.ladders = { ...this.rainLadders };
        } else {
            this.ladders = { ...this.baseLadders };
        }
        this.randomizeEventTiles();
        this.renderGridTiles();
        this.renderSnakesAndLaddersSVG();
    }

    resetBoardMode() {
        this.snakes  = { ...this.baseSnakes };
        this.ladders = { ...this.baseLadders };
        this.randomizeEventTiles();
        this.renderGridTiles();
        this.renderSnakesAndLaddersSVG();
    }

    /**
     * Randomize event tile positions per row
     * Guarantees only 2 or 3 empty tiles per row (7 or 8 filled tiles per row)
     * Extra heavy on questions and challenges!
     */
    randomizeEventTiles() {
        this.questionTiles.clear();
        this.challengeTiles.clear();
        this.romanticTiles.clear();
        this.bonusTiles.clear();
        this.penaltyTiles.clear();
        this.wildcardTiles.clear();

        const snakeHeads    = new Set(Object.keys(this.snakes).map(Number));
        const ladderBottoms = new Set(Object.keys(this.ladders).map(Number));
        const reserved      = new Set([1, 100, ...snakeHeads, ...ladderBottoms]);

        // Weighted event type pool: Extra heavy on Wildcards, Questions & Challenges!
        const eventPool = [
            'wildcard', 'wildcard', 'wildcard', 'wildcard', 'wildcard',
            'question', 'question', 'question', 'question',
            'challenge', 'challenge', 'challenge', 'challenge',
            'romantic',
            'bonus',
            'penalty', 'penalty'
        ];

        // Process row by row (10 rows of 10 tiles each)
        for (let row = 0; row < 10; row++) {
            const startTile = row * 10 + 1;
            const endTile   = row * 10 + 10;

            const rowReserved  = [];
            const rowAvailable = [];

            for (let t = startTile; t <= endTile; t++) {
                if (reserved.has(t)) {
                    rowReserved.push(t);
                } else {
                    rowAvailable.push(t);
                }
            }

            // Target filled tiles per row: 7 or 8 (leaving only 2 or 3 empty tiles per row)
            const targetFilled = (Math.random() < 0.5) ? 7 : 8;
            const eventsToAdd  = Math.min(rowAvailable.length, Math.max(0, targetFilled - rowReserved.length));

            // Fisher-Yates shuffle available tiles in this row
            for (let i = rowAvailable.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [rowAvailable[i], rowAvailable[j]] = [rowAvailable[j], rowAvailable[i]];
            }

            // Assign events to chosen tiles in this row
            for (let i = 0; i < eventsToAdd; i++) {
                const tileNum = rowAvailable[i];
                const type    = eventPool[Math.floor(Math.random() * eventPool.length)];

                if (type === 'question')       this.questionTiles.add(tileNum);
                else if (type === 'challenge') this.challengeTiles.add(tileNum);
                else if (type === 'wildcard')  this.wildcardTiles.add(tileNum);
                else if (type === 'romantic')  this.romanticTiles.add(tileNum);
                else if (type === 'bonus')     this.bonusTiles.add(tileNum);
                else if (type === 'penalty')   this.penaltyTiles.add(tileNum);
            }
        }
    }

    exportTileLayout() {
        return {
            questionTiles:  Array.from(this.questionTiles),
            challengeTiles: Array.from(this.challengeTiles),
            romanticTiles:  Array.from(this.romanticTiles),
            bonusTiles:     Array.from(this.bonusTiles),
            penaltyTiles:   Array.from(this.penaltyTiles),
            wildcardTiles:  Array.from(this.wildcardTiles)
        };
    }

    importTileLayout(layout) {
        if (!layout) return;
        this.questionTiles  = new Set(layout.questionTiles || []);
        this.challengeTiles = new Set(layout.challengeTiles || []);
        this.romanticTiles  = new Set(layout.romanticTiles || []);
        this.bonusTiles     = new Set(layout.bonusTiles || []);
        this.penaltyTiles   = new Set(layout.penaltyTiles || []);
        this.wildcardTiles  = new Set(layout.wildcardTiles || []);
        this.renderGridTiles();
    }

    setTileType(tileNum, newType) {
        if ([1, 100].includes(tileNum) || this.snakes[tileNum] || this.ladders[tileNum]) return;

        this.questionTiles.delete(tileNum);
        this.challengeTiles.delete(tileNum);
        this.romanticTiles.delete(tileNum);
        this.bonusTiles.delete(tileNum);
        this.penaltyTiles.delete(tileNum);
        this.wildcardTiles.delete(tileNum);

        if (newType === 'question')  this.questionTiles.add(tileNum);
        if (newType === 'challenge') this.challengeTiles.add(tileNum);
        if (newType === 'romantic')  this.romanticTiles.add(tileNum);
        if (newType === 'bonus')     this.bonusTiles.add(tileNum);
        if (newType === 'penalty')   this.penaltyTiles.add(tileNum);
        if (newType === 'wildcard')  this.wildcardTiles.add(tileNum);

        this.updateSingleTileDOM(tileNum);
    }

    /**
     * Morph an event tile to a new random event type after it has been landed on
     */
    morphTileType(tileNum) {
        if ([1, 100].includes(tileNum) || this.snakes[tileNum] || this.ladders[tileNum]) return null;

        const eventPool = [
            'wildcard', 'wildcard', 'wildcard', 'wildcard', 'wildcard',
            'question', 'question', 'question', 'question',
            'challenge', 'challenge', 'challenge', 'challenge',
            'romantic',
            'bonus',
            'penalty', 'penalty'
        ];
        const newType = eventPool[Math.floor(Math.random() * eventPool.length)];
        this.setTileType(tileNum, newType);
        return newType;
    }

    getTileType(n) {
        if (n === 1)                          return 'start';
        if (n === 100)                        return 'finish';
        if (this.snakes[n]  !== undefined)    return 'snake';
        if (this.ladders[n] !== undefined)    return 'ladder';
        if (this.wildcardTiles.has(n))        return 'wildcard';
        if (this.questionTiles.has(n))        return 'question';
        if (this.challengeTiles.has(n))       return 'challenge';
        if (this.romanticTiles.has(n))        return 'romantic';
        if (this.bonusTiles.has(n))           return 'bonus';
        if (this.penaltyTiles.has(n))         return 'penalty';
        return 'plain';
    }

    init() {
        this.renderGridTiles();
        requestAnimationFrame(() => requestAnimationFrame(() => this.renderSnakesAndLaddersSVG()));
        window.addEventListener('resize', () => this.renderSnakesAndLaddersSVG());
    }

    getTileCoords(n) {
        const z = n - 1;
        const rb = Math.floor(z / 10);
        const ci = z % 10;
        return {
            row: 9 - rb,
            col: (rb % 2 === 0) ? (9 - ci) : ci
        };
    }

    getTileCenterPixels(n) {
        const { col, row } = this.getTileCoords(n);
        const w = this.boardGridEl.offsetWidth, h = this.boardGridEl.offsetHeight;
        return { x: (col + 0.5) * w / 10, y: (row + 0.5) * h / 10 };
    }

    getTileTopLeftPixels(n) {
        const { col, row } = this.getTileCoords(n);
        const w = this.boardGridEl.offsetWidth, h = this.boardGridEl.offsetHeight;
        const tw = w / 10, th = h / 10;
        return { x: col * tw, y: row * th, tileWidth: tw, tileHeight: th };
    }

    updateSingleTileDOM(n) {
        const tileEl = document.getElementById(`tile-${n}`);
        if (!tileEl) return;

        const type = this.getTileType(n);
        tileEl.className = `board-tile tile-type-${type}`;
        const { row, col } = this.getTileCoords(n);
        if (type === 'plain' && (row + col) % 2 === 1) tileEl.classList.add('tile-alt');

        tileEl.innerHTML = '';

        const num = document.createElement('span');
        num.className = 'tile-number';
        num.textContent = n;
        tileEl.appendChild(num);

        const EVENT_ICONS = {
            question:  { char: '?',  cls: 'tile-q-badge' },
            challenge: { char: '⚡', cls: 'tile-event-badge tile-challenge-badge' },
            romantic:  { char: '💕', cls: 'tile-event-badge tile-romantic-badge' },
            bonus:     { char: '🎁', cls: 'tile-event-badge tile-bonus-badge' },
            penalty:   { char: '💀', cls: 'tile-event-badge tile-penalty-badge' },
            wildcard:  { char: '🎴', cls: 'tile-event-badge tile-wildcard-badge' }
        };

        if (EVENT_ICONS[type]) {
            const wrap = document.createElement('div');
            wrap.className = 'tile-event-icon-wrapper';
            const icon = document.createElement('div');
            icon.className = EVENT_ICONS[type].cls;
            icon.textContent = EVENT_ICONS[type].char;
            wrap.appendChild(icon);
            tileEl.appendChild(wrap);
        }
    }

    renderGridTiles() {
        this.boardGridEl.innerHTML = '';

        const EVENT_ICONS = {
            question:  { char: '?',  cls: 'tile-q-badge' },
            challenge: { char: '⚡', cls: 'tile-event-badge tile-challenge-badge' },
            romantic:  { char: '💕', cls: 'tile-event-badge tile-romantic-badge' },
            bonus:     { char: '🎁', cls: 'tile-event-badge tile-bonus-badge' },
            penalty:   { char: '💀', cls: 'tile-event-badge tile-penalty-badge' },
            wildcard:  { char: '🎴', cls: 'tile-event-badge tile-wildcard-badge' }
        };

        for (let row = 0; row < 10; row++) {
            const rb = 9 - row;
            for (let col = 0; col < 10; col++) {
                const ci     = (rb % 2 === 0) ? (9 - col) : col;
                const n      = rb * 10 + ci + 1;
                const type   = this.getTileType(n);

                const tile = document.createElement('div');
                tile.className = `board-tile tile-type-${type}`;
                if (type === 'plain' && (row + col) % 2 === 1) tile.classList.add('tile-alt');
                tile.id = `tile-${n}`;

                const num = document.createElement('span');
                num.className = 'tile-number';
                num.textContent = n;
                tile.appendChild(num);

                if (EVENT_ICONS[type]) {
                    const wrap = document.createElement('div');
                    wrap.className = 'tile-event-icon-wrapper';
                    const icon = document.createElement('div');
                    icon.className = EVENT_ICONS[type].cls;
                    icon.textContent = EVENT_ICONS[type].char;
                    wrap.appendChild(icon);
                    tile.appendChild(wrap);
                } else if (type === 'start') {
                    const b = document.createElement('div');
                    b.className = 'start-badge'; b.textContent = 'START';
                    tile.appendChild(b);
                } else if (type === 'finish') {
                    const b = document.createElement('div');
                    b.className = 'finish-badge'; b.textContent = '🚩 FINISH';
                    tile.appendChild(b);
                }

                this.boardGridEl.appendChild(tile);
            }
        }
    }

    renderSnakesAndLaddersSVG() {
        this.svgOverlayEl.innerHTML = '';
        const w = this.boardGridEl.offsetWidth, h = this.boardGridEl.offsetHeight;
        if (!w || !h) { requestAnimationFrame(() => this.renderSnakesAndLaddersSVG()); return; }
        this.svgOverlayEl.setAttribute('viewBox', `0 0 ${w} ${h}`);

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `<filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="1" dy="3" stdDeviation="2" flood-opacity="0.5"/></filter>`;
        this.svgOverlayEl.appendChild(defs);

        Object.entries(this.ladders).forEach(([b,t]) => this._drawLadder(+b,+t));
        const SC = ['#2e7d32','#d84315','#1565c0','#6a1b9a','#f57f17','#37474f','#880e4f','#00695c'];
        const SB = ['#a5d6a7','#ffccbc','#bbdefb','#e1bee7','#fff9c4','#cfd8dc','#fce4ec','#b2dfdb'];
        let i = 0;
        Object.entries(this.snakes).forEach(([h,t]) => { this._drawSnake(+h,+t,SC[i%8],SB[i%8]); i++; });
    }

    _drawLadder(b, t) {
        const s = this.getTileCenterPixels(b), e = this.getTileCenterPixels(t);
        const g = document.createElementNS('http://www.w3.org/2000/svg','g');
        g.setAttribute('filter','url(#shadow)');
        const dx=e.x-s.x, dy=e.y-s.y, len=Math.sqrt(dx*dx+dy*dy);
        const ang=Math.atan2(dy,dx), O=9;
        const px=-Math.sin(ang)*O, py=Math.cos(ang)*O;
        [1,-1].forEach(side => {
            const l = document.createElementNS('http://www.w3.org/2000/svg','line');
            l.setAttribute('x1',s.x+side*px); l.setAttribute('y1',s.y+side*py);
            l.setAttribute('x2',e.x+side*px); l.setAttribute('y2',e.y+side*py);
            l.setAttribute('stroke','#795548'); l.setAttribute('stroke-width','4.5');
            l.setAttribute('stroke-linecap','round'); g.appendChild(l);
        });
        const rc = Math.max(2, Math.floor(len/20));
        for (let i=1; i<=rc; i++) {
            const ti=i/(rc+1), rx=s.x+dx*ti, ry=s.y+dy*ti;
            const r = document.createElementNS('http://www.w3.org/2000/svg','line');
            r.setAttribute('x1',rx+px); r.setAttribute('y1',ry+py);
            r.setAttribute('x2',rx-px); r.setAttribute('y2',ry-py);
            r.setAttribute('stroke','#a1887f'); r.setAttribute('stroke-width','3');
            r.setAttribute('stroke-linecap','round'); g.appendChild(r);
        }
        this.svgOverlayEl.appendChild(g);
    }

    _drawSnake(hTile, tTile, bodyClr, bellyClr) {
        const h = this.getTileCenterPixels(hTile);
        const t = this.getTileCenterPixels(tTile);
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('filter', 'url(#shadow)');

        const dx = t.x - h.x, dy = t.y - h.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return;

        // Vector tegak lurus
        const nx = -dy / dist;
        const ny = dx / dist;

        // Kontrol lekukan snake (max 18px offset agar tidak melebar acak-acakan)
        const wiggle = Math.min(18, dist * 0.14);

        const cp1x = h.x + dx * 0.33 + nx * wiggle;
        const cp1y = h.y + dy * 0.33 + ny * wiggle;
        const cp2x = h.x + dx * 0.66 - nx * wiggle;
        const cp2y = h.y + dy * 0.66 - ny * wiggle;

        const d = `M ${h.x} ${h.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${t.x} ${t.y}`;

        const mkPath = (stroke, sw) => {
            const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            p.setAttribute('d', d); p.setAttribute('stroke', stroke);
            p.setAttribute('stroke-width', sw); p.setAttribute('stroke-linecap', 'round');
            p.setAttribute('fill', 'none'); return p;
        };
        g.appendChild(mkPath(bodyClr, '13')); g.appendChild(mkPath(bellyClr, '5'));

        const hc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        hc.setAttribute('cx', h.x); hc.setAttribute('cy', h.y);
        hc.setAttribute('r', '11'); hc.setAttribute('fill', bodyClr); g.appendChild(hc);

        const ha = Math.atan2(cp1y - h.y, cp1x - h.x);
        [-1, 1].forEach(s => {
            const ex = h.x + Math.cos(ha + s * Math.PI/2) * 4, ey = h.y + Math.sin(ha + s * Math.PI/2) * 4;
            const eye = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            eye.setAttribute('cx', ex); eye.setAttribute('cy', ey);
            eye.setAttribute('r', '2.8'); eye.setAttribute('fill', '#fff'); g.appendChild(eye);
            const pupil = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            pupil.setAttribute('cx', ex + Math.cos(ha) * 0.8); pupil.setAttribute('cy', ey + Math.sin(ha) * 0.8);
            pupil.setAttribute('r', '1.4'); pupil.setAttribute('fill', '#111'); g.appendChild(pupil);
        });

        const tc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        tc.setAttribute('cx', t.x); tc.setAttribute('cy', t.y);
        tc.setAttribute('r', '5'); tc.setAttribute('fill', bodyClr); g.appendChild(tc);

        this.svgOverlayEl.appendChild(g);
    }
}

const boardEngine = new BoardEngine();
