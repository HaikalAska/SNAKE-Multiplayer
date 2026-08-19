# 🐍 Snakes & Ladders: Couples & LDR Edition

A modern, interactive web-based Snakes & Ladders board game built for couples and friends — especially designed for long-distance relationships (LDR). Play together on a single screen or connect seamlessly across different networks using instant room links.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![WebSocket](https://img.shields.io/badge/Realtime-WebSocket%20WSS-010101?style=flat)

---

## 🎮 Key Features

- **🌐 Realtime Online Multiplayer (LDR Mode):**
  - Instant room creation with 6-character room codes or shareable direct links (`?room=UT-XXXX`).
  - Powered by Cloud WebSockets (WSS) — connects instantly across different ISPs, mobile data, and Wi-Fi networks without firewall/NAT issues.
  - Spectator-safe card view: only the active player can interact with their event card while the partner watches in real time.

- **🎲 1-Device Offline Mode:**
  - Pass-and-play on the same phone, tablet, or laptop.

- **🎴 Dynamic Event Tiles & Fate Cards:**
  - **❓ Romantic & Deep Questions:** Conversation starters to get to know each other better.
  - **⚡ Fun & Spicy Challenges:** Playful tasks and dares.
  - **🎴 Wildcard (Kartu Risiko):** 3D flipping fate cards that trigger unexpected twists (position swaps, runaway horse crashes back to START, extra dice rolls, etc.).
  - **✨ Tile Metamorphism:** Event tiles change into new random event types after being stepped on.

- **🌪️ Global Board Disaster Events:**
  - **🐍 Snake Outbreak:** 16 giant snakes suddenly take over the board for a few rounds!
  - **🪜 Ladder Rain:** Giant ladders drop down across the board.
  - **💨 Windstorm:** Fierce gusts blow players backwards by 2 steps every roll.

- **🤖 Cute Customization & Responsive Board:**
  - Customizable names and robot avatar presets.
  - Dynamic SVG-rendered snakes and ladders that adapt to any screen size.
  - Crisp sound effects and smooth pawn movement animations.

---

## 🕹️ How to Play

1. Open the game in your browser.
2. Choose **Offline Mode (1 Device)** or **Main Online (LDR Mode)**.
3. If playing online:
   - **Host:** Click *Buat Room* ➔ click **Salin Link** ➔ send the link to your partner.
   - **Guest:** Simply open the link (the room code auto-fills) and click *Gabung & Main*.
4. Take turns rolling the dice, answer questions, survive the snakes, and race to tile **100**!

---

## 🛠️ Tech Stack

- **Frontend:** Pure Vanilla JavaScript (ES6+), Semantic HTML5, CSS3 (Flexbox & Grid, CSS variables, keyframe animations).
- **Graphics & Assets:** Dynamic SVG overlay rendering for snakes & ladders, DiceBear Bottts neutral avatars, FontAwesome icons.
- **Networking:** Secure WebSockets over MQTT (`wss://`) on port 443 for zero-latency bidirectional state sync.

---

## 📂 Project Structure

```text
├── index.html          # Main HTML markup & modal structures
├── css/
│   └── style.css       # Game layout, board styles, animations, responsive design
├── js/
│   ├── app.js          # App initialization, modal logic, URL parsing, sound toggles
│   ├── board.js        # Board grid generation, tile math, dynamic SVG snake/ladder rendering
│   ├── game.js         # Turn state machine, pawn animations, event cards, state sync
│   ├── dice.js         # 3D dice physics & roll animations
│   ├── questions.js    # Bank of questions, challenges, romantic cards & wildcards
│   ├── network.js      # WebSocket realtime synchronization engine
│   └── sound.js        # Web Audio API sound synthesizer
└── README.md           # Documentation
```

---

## 🚀 Local Development Setup

No complex build tools, `npm install`, or bundlers required.

1. Clone this repository:
   ```bash
   git clone https://github.com/HaikalAska/SNAKE-Multiplayer.git
   cd SNAKE-Multiplayer
   ```
2. Serve the folder using any static web server:
   - Using Python:
     ```bash
     python -m http.server 8080
     ```
   - Using PHP:
     ```bash
     php -S localhost:8080
     ```
   - Or open `index.html` directly with VS Code **Live Server**.
3. Open `http://localhost:8080` in your browser.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
