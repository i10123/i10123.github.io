# PROJECT CONTEXT REPORT
**Date:** 2026-02-03 20:47:53 
**Files:** 13 | **Lines:** 3406

> **Note for AI:** This document contains the source code. Interpret the code blocks below according to their file paths.

---
### Project Structure
```text
├── assets (empty)
├── css
│ └── style.css
├── index.html
├── js
│ ├── auth.js
│ ├── config.js
│ ├── database.js
│ ├── economyController.js
│ ├── game.js
│ ├── main.js
│ ├── onboarding.js
│ ├── services.js
│ ├── state.js
│ └── ui.js
└── main.py
```
---
## Оглавление
1. [css/style.css](#file-1)
2. [index.html](#file-2)
3. [js/auth.js](#file-3)
4. [js/config.js](#file-4)
5. [js/database.js](#file-5)
6. [js/economyController.js](#file-6)
7. [js/game.js](#file-7)
8. [js/main.js](#file-8)
9. [js/onboarding.js](#file-9)
10. [js/services.js](#file-10)
11. [js/state.js](#file-11)
12. [js/ui.js](#file-12)
13. [main.py](#file-13)

---

<div id='file-1'></div>

## 1. css/style.css
> Lines: 163

```css
   1 | @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&display=swap');
   2 | 
   3 | * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
   4 | :root {
   5 |     --neon-cyan: #00ffff;
   6 |     --neon-pink: #ff00ff;
   7 |     --neon-blue: #0080ff;
   8 |     --dark-bg: #0a0a14;
   9 |     --glass-bg: rgba(15, 15, 30, 0.85);
  10 |     --glass-border: rgba(0, 255, 255, 0.2);
  11 | }
  12 | body { font-family: 'Rajdhani', sans-serif; background: var(--dark-bg); color: #fff; overflow-x: hidden; }
  13 | .orbitron { font-family: 'Orbitron', sans-serif; }
  14 | 
  15 | /* Ocean BG */
  16 | .ocean-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; background: linear-gradient(180deg, #0a0a14 0%, #001a33 50%, #000d1a 100%); }
  17 | .wave { position: absolute; width: 200%; height: 100%; background: radial-gradient(ellipse at center, rgba(0, 128, 255, 0.15) 0%, transparent 70%); animation: wave-animation 15s infinite linear; }
  18 | .wave:nth-child(2) { animation-duration: 20s; animation-delay: -5s; opacity: 0.7; }
  19 | @keyframes wave-animation { 0% { transform: translateX(0) translateY(0); } 50% { transform: translateX(-25%) translateY(-10px); } 100% { transform: translateX(0) translateY(0); } }
  20 | 
  21 | /* UI Elements */
  22 | .glass { background: var(--glass-bg); backdrop-filter: blur(12px); border: 1px solid var(--glass-border); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); }
  23 | .neon-text { text-shadow: 0 0 10px currentColor; }
  24 | .btn-primary { background: linear-gradient(135deg, var(--neon-cyan), var(--neon-blue)); transition: all 0.2s; position: relative; overflow: hidden; color: #000; }
  25 | .btn-primary:active { transform: scale(0.96); }
  26 | .btn-secondary { background: rgba(255, 0, 255, 0.15); border: 1px solid var(--neon-pink); color: #fff; transition: all 0.2s; }
  27 | .btn-secondary:active { transform: scale(0.96); background: rgba(255, 0, 255, 0.3); }
  28 | 
  29 | /* Screens */
  30 | .screen { display: none; animation: fadeIn 0.4s ease-out; width: 100%; }
  31 | .screen.active { display: block; }
  32 | @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  33 | 
  34 | /* GRID SYSTEM — адаптивность: aspect-ratio, max-width 90vw */
  35 | .ship-grid {
  36 |     display: grid;
  37 |     grid-template-columns: repeat(10, 1fr);
  38 |     gap: 2px;
  39 |     max-width: min(340px, 90vw);
  40 |     margin: 0 auto;
  41 |     aspect-ratio: 1;
  42 | }
  43 | .cell { background: rgba(0, 128, 255, 0.1); border: 1px solid rgba(0, 255, 255, 0.2); cursor: pointer; position: relative; }
  44 | .cell.ship { background: rgba(0, 255, 255, 0.5); box-shadow: inset 0 0 10px var(--neon-cyan); }
  45 | .cell.hit { background: radial-gradient(circle, #ff4444, #880000); animation: explosion 0.4s ease-out; }
  46 | .cell.miss { background: rgba(255, 255, 255, 0.1); }
  47 | .cell.miss::after { content: '•'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: rgba(255,255,255,0.5); }
  48 | .cell.sunk { background: #ff0000; border-color: #ffaa00; box-shadow: 0 0 15px #ff4400; animation: sink 0.5s ease-out; }
  49 | .cell.fog { filter: brightness(0.4); }
  50 | @keyframes pop { 0% { transform: scale(0.8); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
  51 | @keyframes explosion {
  52 |     0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.8); }
  53 |     50% { transform: scale(1.15); box-shadow: 0 0 20px 8px rgba(255, 0, 0, 0.6); }
  54 |     100% { transform: scale(1); box-shadow: 0 0 15px #ff4400; }
  55 | }
  56 | @keyframes sink {
  57 |     0% { opacity: 1; filter: brightness(1); }
  58 |     100% { opacity: 1; filter: brightness(1.2); box-shadow: 0 0 20px #ff4400; }
  59 | }
  60 | 
  61 | /* Fog of war — затемнение неоткрытых клеток врага */
  62 | .ship-grid.fog-of-war .cell:not(.hit):not(.miss) { filter: brightness(0.35); }
  63 | .ship-grid.fog-of-war .cell.hit,
  64 | .ship-grid.fog-of-war .cell.miss { filter: none; }
  65 | 
  66 | /* Modal */
  67 | .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 999; display: none; align-items: center; justify-content: center; }
  68 | .modal.active { display: flex; }
  69 | 
  70 | /* Shake Animation */
  71 | .shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
  72 | @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
  73 | 
  74 | /* Hover effects */
  75 | .btn-primary:hover {
  76 |     filter: brightness(1.2);
  77 |     box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
  78 |     transform: translateY(-2px);
  79 | }
  80 | .btn-secondary:hover {
  81 |     background: rgba(255, 0, 255, 0.3);
  82 |     border-color: var(--neon-pink);
  83 |     box-shadow: 0 0 15px rgba(255, 0, 255, 0.4);
  84 |     transform: translateY(-2px);
  85 | }
  86 | .glass:hover {
  87 |     background: rgba(20, 20, 45, 0.95);
  88 |     border-color: rgba(0, 255, 255, 0.5);
  89 |     transform: scale(1.02);
  90 | }
  91 | button, .glass, input {
  92 |     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  93 | }
  94 | 
  95 | /* Кнопка «Назад» на каждом экране — удобный тап и видимость */
  96 | .btn-back {
  97 |     min-height: 44px;
  98 |     min-width: 44px;
  99 |     padding: 8px 12px;
 100 |     display: inline-flex;
 101 |     align-items: center;
 102 |     cursor: pointer;
 103 |     border: none;
 104 |     background: transparent;
 105 |     -webkit-tap-highlight-color: transparent;
 106 | }
 107 | .btn-back:hover { opacity: 0.9; }
 108 | .btn-back:active { opacity: 0.8; }
 109 | .btn-back:focus { outline: none; }
 110 | .btn-back:focus-visible { outline: 2px solid var(--neon-cyan); outline-offset: 2px; }
 111 | 
 112 | /* Toast Notifications */
 113 | #toast-container {
 114 |     max-width: 400px;
 115 |     margin: 0 auto;
 116 | }
 117 | .toast {
 118 |     background: var(--glass-bg);
 119 |     backdrop-filter: blur(12px);
 120 |     border: 1px solid var(--glass-border);
 121 |     border-radius: 12px;
 122 |     padding: 12px 16px;
 123 |     color: #fff;
 124 |     font-size: 14px;
 125 |     box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
 126 |     pointer-events: auto;
 127 |     animation: toastSlideIn 0.3s ease-out;
 128 |     display: flex;
 129 |     align-items: center;
 130 |     gap: 12px;
 131 |     min-height: 48px;
 132 | }
 133 | .toast.toast-success { border-color: var(--neon-cyan); }
 134 | .toast.toast-error { border-color: #ff4444; }
 135 | .toast.toast-info { border-color: var(--neon-blue); }
 136 | @keyframes toastSlideIn {
 137 |     from {
 138 |         opacity: 0;
 139 |         transform: translateY(20px);
 140 |     }
 141 |     to {
 142 |         opacity: 1;
 143 |         transform: translateY(0);
 144 |     }
 145 | }
 146 | .toast.toast-exit {
 147 |     animation: toastSlideOut 0.3s ease-in forwards;
 148 | }
 149 | @keyframes toastSlideOut {
 150 |     from {
 151 |         opacity: 1;
 152 |         transform: translateY(0);
 153 |     }
 154 |     to {
 155 |         opacity: 0;
 156 |         transform: translateY(-20px);
 157 |     }
 158 | }
 159 | 
 160 | /* Onboarding */
 161 | .onboarding-slide {
 162 |     animation: fadeIn 0.4s ease-out;
 163 | }
```
---

<div id='file-2'></div>

## 2. index.html
> Lines: 411

```html
   1 | <!DOCTYPE html>
   2 | <html lang="en">
   3 | <head>
   4 |     <meta charset="UTF-8">
   5 |     <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
   6 |     <title>Naval Warfare 2077</title>
   7 |     <link rel="stylesheet" href="css/style.css">
   8 |     <script src="https://cdn.tailwindcss.com"></script>
   9 |     <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
  10 |     <script src="https://telegram.org/js/telegram-web-app.js"></script>
  11 |     <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
  12 |     <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
  13 |     <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
  14 | </head>
  15 | <body>
  16 |     <div class="ocean-bg"><div class="wave"></div><div class="wave"></div></div>
  17 |     
  18 |     <!-- Toast Container -->
  19 |     <div id="toast-container" class="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"></div>
  20 | 
  21 |     <!-- 0. ONBOARDING SCREEN -->
  22 |     <div id="screen-onboarding" class="screen">
  23 |         <div class="flex flex-col items-center justify-center min-h-screen p-6">
  24 |             <div class="w-full max-w-md space-y-6">
  25 |                 <!-- Slide 1: Fleet Placement -->
  26 |                 <div id="onboarding-slide-1" class="onboarding-slide">
  27 |                     <div class="glass rounded-2xl p-8 text-center">
  28 |                         <div class="text-6xl mb-4">🚢</div>
  29 |                         <h2 class="text-2xl font-bold mb-4 text-cyan-400" data-key="onboarding_slide1_title">FLEET PLACEMENT</h2>
  30 |                         <p class="text-sm opacity-90 mb-6" data-key="onboarding_slide1_text">Place your ships on the board...</p>
  31 |                     </div>
  32 |                 </div>
  33 |                 
  34 |                 <!-- Slide 2: Abilities -->
  35 |                 <div id="onboarding-slide-2" class="onboarding-slide hidden">
  36 |                     <div class="glass rounded-2xl p-8 text-center">
  37 |                         <div class="text-6xl mb-4">⚡</div>
  38 |                         <h2 class="text-2xl font-bold mb-4 text-cyan-400" data-key="onboarding_slide2_title">TACTICAL ABILITIES</h2>
  39 |                         <p class="text-sm opacity-90 mb-6" data-key="onboarding_slide2_text">Buy abilities in the shop...</p>
  40 |                     </div>
  41 |                 </div>
  42 |                 
  43 |                 <!-- Slide 3: Rating -->
  44 |                 <div id="onboarding-slide-3" class="onboarding-slide hidden">
  45 |                     <div class="glass rounded-2xl p-8 text-center">
  46 |                         <div class="text-6xl mb-4">🏆</div>
  47 |                         <h2 class="text-2xl font-bold mb-4 text-cyan-400" data-key="onboarding_slide3_title">RATING & ECONOMY</h2>
  48 |                         <p class="text-sm opacity-90 mb-6" data-key="onboarding_slide3_text">Win matches to increase rating...</p>
  49 |                     </div>
  50 |                 </div>
  51 |                 
  52 |                 <!-- Navigation -->
  53 |                 <div class="flex gap-2">
  54 |                     <button id="onboarding-skip" class="flex-1 btn-secondary p-3 rounded text-sm" data-key="onboarding_skip">SKIP</button>
  55 |                     <button id="onboarding-next" class="flex-1 btn-primary p-3 rounded text-sm" data-key="onboarding_next">NEXT</button>
  56 |                     <button id="onboarding-start" class="flex-1 btn-primary p-3 rounded text-sm hidden" data-key="onboarding_start">START</button>
  57 |                 </div>
  58 |                 
  59 |                 <!-- Dots indicator -->
  60 |                 <div class="flex justify-center gap-2">
  61 |                     <div id="onboarding-dot-1" class="w-2 h-2 rounded-full bg-cyan-400"></div>
  62 |                     <div id="onboarding-dot-2" class="w-2 h-2 rounded-full bg-white/30"></div>
  63 |                     <div id="onboarding-dot-3" class="w-2 h-2 rounded-full bg-white/30"></div>
  64 |                 </div>
  65 |             </div>
  66 |         </div>
  67 |     </div>
  68 | 
  69 |     <!-- 1. LANGUAGE SCREEN -->
  70 |     <div id="screen-language" class="screen active">
  71 |         <div class="flex flex-col items-center justify-center min-h-screen p-6">
  72 |             <h1 class="text-5xl font-black orbitron text-cyan-400 mb-8 text-center neon-text" data-key="app_title">NAVAL<br>WARFARE</h1>
  73 |             <div class="w-full max-w-sm space-y-4">
  74 |                 <button onclick="setLanguage('en')" class="w-full glass rounded-2xl p-6 flex items-center gap-4 active:scale-95 transition">
  75 |                     <span class="text-4xl">🇬🇧</span> <span class="text-2xl font-bold" data-key="lang_en">English</span>
  76 |                 </button>
  77 |                 <button onclick="setLanguage('ru')" class="w-full glass rounded-2xl p-6 flex items-center gap-4 active:scale-95 transition">
  78 |                     <span class="text-4xl">🇷🇺</span> <span class="text-2xl font-bold" data-key="lang_ru">Русский</span>
  79 |                 </button>
  80 |             </div>
  81 |         </div>
  82 |     </div>
  83 | 
  84 |     <!-- 2. REGISTER SCREEN -->
  85 |     <div id="screen-register" class="screen">
  86 |         <div class="flex flex-col items-center justify-center min-h-screen p-6">
  87 |             <button type="button" onclick="showScreen('screen-language')" class="btn-back self-start mb-4 text-cyan-400 text-sm font-medium">← <span data-key="back">Back</span></button>
  88 |             <div class="glass rounded-3xl p-8 w-full max-w-md">
  89 |                 <h2 class="text-2xl font-bold orbitron text-cyan-400 mb-2" data-key="welcome">Welcome</h2>
  90 |                 <label for="input-nickname"></label>
  91 |                 <input id="input-nickname" type="text" data-key="nick_placeholder" placeholder="Nickname..." class="w-full bg-black/50 border border-cyan-400/50 rounded-xl px-4 py-3 text-white mb-4 outline-none focus:border-cyan-400">
  92 |                 <button id="btn-register" class="w-full btn-primary rounded-xl py-4 font-bold text-lg orbitron" data-key="deploy">DEPLOY</button>
  93 |             </div>
  94 |         </div>
  95 |     </div>
  96 | 
  97 |     <!-- 3. LOBBY / DASHBOARD -->
  98 |     <div id="screen-dashboard" class="screen">
  99 |         <div class="p-4 pb-24 min-h-screen">
 100 |             <div class="flex items-center gap-2 mb-4">
 101 |                 <button type="button" onclick="showScreen('screen-language')" class="btn-back text-cyan-400 text-sm font-medium flex items-center gap-1">
 102 |                     <span aria-hidden="true">←</span> <span data-key="back">Back</span>
 103 |                 </button>
 104 |             </div>
 105 |             <div class="flex justify-between items-center mb-6 pt-2">
 106 |                 <div>
 107 |                     <h1 class="text-2xl font-bold orbitron text-cyan-400" data-key="dashboard_command">COMMAND</h1>
 108 |                     <p id="user-display-name" class="text-sm opacity-70">Cadet</p>
 109 |                 </div>
 110 |                 <button onclick="showScreen('screen-settings')" class="glass p-2 rounded-lg text-cyan-400"><iconify-icon icon="lucide:settings" width="24"></iconify-icon></button>
 111 |             </div>
 112 | 
 113 |             <div class="glass rounded-2xl p-4 mb-6 flex justify-around text-center">
 114 |                 <div><div class="text-2xl font-bold text-yellow-400" id="dash-coins">0</div><div class="text-xs opacity-60" data-key="stats_coins">Coins</div></div>
 115 |                 <div><div class="text-2xl font-bold text-green-400" id="dash-wins">0</div><div class="text-xs opacity-60" data-key="stats_wins">Wins</div></div>
 116 |                 <div><div class="text-2xl font-bold text-pink-400" id="dash-winrate">0%</div><div class="text-xs opacity-60" data-key="stats_winrate">WinRate</div></div>
 117 |             </div>
 118 | 
 119 |             <div class="space-y-3">
 120 |                 <button onclick="queueRandom()" class="w-full btn-primary rounded-2xl py-5 font-bold text-lg flex items-center justify-center gap-3">
 121 |                     <iconify-icon icon="lucide:radar" width="24"></iconify-icon> <span data-key="play_random">PLAY RANDOM</span>
 122 |                 </button>
 123 |                 <button onclick="createBattle()" class="w-full btn-secondary rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-3">
 124 |                     <iconify-icon icon="lucide:swords" width="20"></iconify-icon> <span data-key="create_battle">CREATE BATTLE</span>
 125 |                 </button>
 126 |                 <div id="game-link-area" class="hidden glass p-4 rounded-xl text-center">
 127 |                     <p class="text-xs mb-2 text-cyan-400" data-key="share_link_label">Send this link to friend:</p>
 128 |                     <label for="share-link-input"></label>
 129 |                     <input id="share-link-input" readonly class="w-full bg-black/50 text-xs p-2 rounded mb-2 border border-cyan-500/30">
 130 |                     <button onclick="copyGameLink()" class="btn-secondary px-4 py-1 rounded text-xs" data-key="share_link_copy">COPY</button>
 131 |                 </div>
 132 | 
 133 |                 <div class="grid grid-cols-2 gap-2">
 134 |                     <button onclick="showScreen('screen-shop')" class="w-full btn-secondary rounded-2xl py-4 font-bold flex items-center justify-center gap-3">
 135 |                         <iconify-icon icon="lucide:shopping-bag" width="18"></iconify-icon> <span data-key="shop">SHOP</span>
 136 |                     </button>
 137 |                     <button onclick="openLeaderboards()" class="w-full btn-secondary rounded-2xl py-4 font-bold flex items-center justify-center gap-3">
 138 |                         <iconify-icon icon="lucide:trophy" width="18"></iconify-icon> <span data-key="lb_title">LEADERBOARDS</span>
 139 |                     </button>
 140 |                 </div>
 141 |             </div>
 142 | 
 143 |             <button id="admin-btn" onclick="showScreen('screen-admin')" class="hidden w-full mt-4 border border-red-500/50 text-red-400 py-2 rounded-xl text-xs" data-key="admin_panel_button">ADMIN PANEL</button>
 144 |         </div>
 145 |     </div>
 146 | 
 147 |     <!-- 3.5 MATCHMAKING SCREEN -->
 148 |     <div id="screen-matchmaking" class="screen">
 149 |         <div class="flex flex-col items-center justify-center min-h-screen p-6">
 150 |             <div class="glass rounded-3xl p-8 w-full max-w-md text-center space-y-4">
 151 |                 <h2 class="text-2xl font-bold text-cyan-400" data-key="matchmaking_search_title">Searching for opponent...</h2>
 152 |                 <p class="text-xs text-gray-300" data-key="matchmaking_search_sub">We will find a fair enemy or start a bot battle.</p>
 153 |                 <div class="text-5xl font-black text-white" id="matchmaking-timer">10</div>
 154 |                 <button onclick="cancelMatchmaking()" class="w-full btn-secondary rounded-xl py-3 text-sm font-bold" data-key="matchmaking_cancel">CANCEL</button>
 155 |             </div>
 156 |         </div>
 157 |     </div>
 158 | 
 159 |     <!-- 4. PLACEMENT SCREEN -->
 160 |     <div id="screen-placement" class="screen">
 161 |         <div class="p-4 min-h-screen flex flex-col">
 162 |             <button type="button" onclick="showScreen('screen-dashboard')" class="btn-back self-start mb-4 text-cyan-400 text-sm font-medium">← <span data-key="back">Back</span></button>
 163 |             <div class="flex justify-between items-center mb-4">
 164 |                 <h2 class="text-xl font-bold text-cyan-400" data-key="deploy_fleet">Deploy Fleet</h2>
 165 |                 <button onclick="rotateShip()" class="glass p-2 rounded text-cyan-400"><iconify-icon icon="lucide:rotate-cw"></iconify-icon></button>
 166 |             </div>
 167 | 
 168 |             <div class="glass rounded-2xl p-2 mb-4">
 169 |                 <div id="placement-grid" class="ship-grid"></div>
 170 |             </div>
 171 | 
 172 |             <div class="glass rounded-xl p-4 mb-4">
 173 |                 <p class="text-sm mb-2" data-key="select_ship">Select Ship:</p>
 174 |                 <div class="flex gap-2 justify-center" id="ship-selector"></div>
 175 |             </div>
 176 | 
 177 |             <button id="btn-ready" disabled onclick="confirmPlacement()" class="mt-auto w-full btn-primary rounded-xl py-4 font-bold text-black opacity-50 transition" data-key="ready">READY</button>
 178 |         </div>
 179 |     </div>
 180 | 
 181 |     <!-- 5. BATTLE SCREEN -->
 182 |     <div id="screen-battle" class="screen">
 183 |         <div class="p-4 min-h-screen flex flex-col">
 184 |             <button type="button" onclick="showScreen('screen-dashboard')" class="btn-back self-start mb-4 text-cyan-400 text-sm font-medium">← <span data-key="back">Back</span></button>
 185 |             <div class="flex justify-between items-center mb-4 glass p-2 rounded-xl">
 186 |                 <div class="text-center w-1/3">
 187 |                     <div class="text-xs text-gray-400" data-key="battle_you">YOU</div>
 188 |                     <div class="font-bold text-cyan-400" id="my-status" data-key="battle_alive">ALIVE</div>
 189 |                 </div>
 190 |                 <div class="text-center w-1/3 text-2xl font-bold text-white" id="battle-timer">10</div>
 191 |                 <div class="text-center w-1/3">
 192 |                     <div class="text-xs text-gray-400" data-key="battle_enemy">ENEMY</div>
 193 |                     <div class="font-bold text-pink-400" id="enemy-status" data-key="battle_alive">ALIVE</div>
 194 |                 </div>
 195 |             </div>
 196 | 
 197 |             <div class="text-center mb-2 text-sm font-bold" id="turn-indicator" data-key="battle_waiting">WAITING...</div>
 198 | 
 199 |             <div class="glass rounded-2xl p-2 mb-4 relative">
 200 |                 <div class="absolute -top-3 left-2 text-xs bg-black px-2 text-pink-500" data-key="battle_enemy_waters">ENEMY WATERS</div>
 201 |                 <div id="enemy-grid" class="ship-grid"></div>
 202 |             </div>
 203 | 
 204 |             <div class="glass rounded-2xl p-2 mt-auto relative opacity-80 scale-90">
 205 |                 <div class="absolute -top-3 left-2 text-xs bg-black px-2 text-cyan-500" data-key="battle_your_fleet">YOUR FLEET</div>
 206 |                 <div id="my-grid" class="ship-grid"></div>
 207 |             </div>
 208 |         </div>
 209 |     </div>
 210 | 
 211 |     <!-- 6. ADMIN SCREEN -->
 212 |     <div id="screen-admin" class="screen">
 213 |         <div class="p-4">
 214 |             <button type="button" onclick="showScreen('screen-dashboard')" class="btn-back mb-4 text-cyan-400 text-sm font-medium">← <span data-key="back">Back</span></button>
 215 |             <div class="flex justify-between items-center mb-6">
 216 |                 <h2 class="text-xl font-bold text-red-400" data-key="admin_title">ADMIN</h2>
 217 |             </div>
 218 |             <div class="space-y-4">
 219 |                 <div class="flex gap-2 mb-2">
 220 |                     <button id="admin-tab-overview" class="flex-1 glass p-2 rounded text-xs" data-key="admin_tab_overview">Overview</button>
 221 |                     <button id="admin-tab-matches" class="flex-1 glass p-2 rounded text-xs" data-key="admin_tab_matches">Matches</button>
 222 |                     <button id="admin-tab-bans" class="flex-1 glass p-2 rounded text-xs" data-key="admin_tab_bans">Bans</button>
 223 |                     <button id="admin-tab-logs" class="flex-1 glass p-2 rounded text-xs" data-key="admin_tab_logs">Logs</button>
 224 |                 </div>
 225 | 
 226 |                 <!-- Overview -->
 227 |                 <div id="admin-panel-overview" class="space-y-3">
 228 |                     <div class="glass p-4 rounded-xl">
 229 |                         <p><span data-key="admin_active_games">Active Games</span>: <span id="admin-active-games" class="font-bold">0</span></p>
 230 |                         <p><span data-key="admin_total_games">Total Games</span>: <span id="admin-total-games" class="font-bold">0</span></p>
 231 |                         <p><span data-key="admin_human_wins">Human Wins</span>: <span id="admin-human-wins" class="font-bold">0</span></p>
 232 |                         <p><span data-key="admin_bot_wins">Bot Wins</span>: <span id="admin-bot-wins" class="font-bold">0</span></p>
 233 |                     </div>
 234 |                     <div class="glass p-4 rounded-xl">
 235 |                         <h3 class="font-bold mb-2 text-sm" data-key="admin_activity_title">Activity (last 24h)</h3>
 236 |                         <ul id="admin-activity-list" class="text-xs space-y-1 max-h-40 overflow-y-auto"></ul>
 237 |                     </div>
 238 |                     <div class="glass p-4 rounded-xl">
 239 |                         <label for="admin-user-id"></label>
 240 |                         <input id="admin-user-id" data-key="admin_user_id_placeholder" placeholder="User ID" class="bg-black/50 border border-white/20 p-2 rounded w-full mb-2">
 241 |                         <label for="admin-amount"></label>
 242 |                         <input id="admin-amount" type="number" data-key="admin_amount_placeholder" placeholder="Amount" class="bg-black/50 border border-white/20 p-2 rounded w-full mb-2">
 243 |                         <div class="flex gap-2 mb-2">
 244 |                             <button onclick="adminAddCurrency('coins')" class="flex-1 btn-secondary p-2 rounded" data-key="admin_add_coins">Add Coins</button>
 245 |                             <button onclick="adminAddCurrency('gems')" class="flex-1 btn-secondary p-2 rounded" data-key="admin_add_gems">Add Gems</button>
 246 |                         </div>
 247 |                         <button onclick="adminViewProfile()" class="w-full btn-primary p-2 rounded text-xs" data-key="admin_view_profile">View Profile</button>
 248 |                     </div>
 249 |                     <div id="admin-user-profile" class="glass p-4 rounded-xl text-xs space-y-2 max-h-64 overflow-y-auto hidden"></div>
 250 |                 </div>
 251 | 
 252 |                 <!-- Matches -->
 253 |                 <div id="admin-panel-matches" class="hidden space-y-3">
 254 |                     <div class="glass p-4 rounded-xl">
 255 |                         <h3 class="font-bold mb-2 text-sm" data-key="admin_recent_matches">Recent Matches</h3>
 256 |                         <ul id="admin-matches-list" class="text-xs space-y-1 max-h-64 overflow-y-auto"></ul>
 257 |                     </div>
 258 |                 </div>
 259 | 
 260 |                 <!-- Bans -->
 261 |                 <div id="admin-panel-bans" class="hidden space-y-3">
 262 |                     <div class="glass p-4 rounded-xl">
 263 |                         <h3 class="font-bold mb-2 text-sm" data-key="admin_tab_bans">Bans</h3>
 264 |                         <ul id="admin-bans-list" class="text-xs space-y-2 max-h-64 overflow-y-auto"></ul>
 265 |                     </div>
 266 |                     <div class="glass p-4 rounded-xl">
 267 |                         <label for="admin-ban-uid"></label>
 268 |                         <input id="admin-ban-uid" data-key="admin_user_id_placeholder" placeholder="User ID" class="bg-black/50 border border-white/20 p-2 rounded w-full mb-2">
 269 |                         <label for="admin-ban-reason"></label>
 270 |                         <input id="admin-ban-reason" data-key="admin_ban_reason" placeholder="Reason" class="bg-black/50 border border-white/20 p-2 rounded w-full mb-2">
 271 |                         <button onclick="adminBanUser()" class="w-full btn-secondary p-2 rounded text-xs" data-key="admin_ban">BAN</button>
 272 |                     </div>
 273 |                 </div>
 274 | 
 275 |                 <!-- Logs -->
 276 |                 <div id="admin-panel-logs" class="hidden space-y-3">
 277 |                     <div class="glass p-4 rounded-xl">
 278 |                         <h3 class="font-bold mb-2 text-sm" data-key="admin_logs_title">Admin Logs</h3>
 279 |                         <ul id="admin-logs-list" class="text-xs space-y-1 max-h-64 overflow-y-auto"></ul>
 280 |                     </div>
 281 |                 </div>
 282 |             </div>
 283 |         </div>
 284 |     </div>
 285 | 
 286 |     <!-- 7. SHOP & SETTINGS -->
 287 |     <div id="screen-shop" class="screen">
 288 |         <div class="p-4">
 289 |             <button type="button" onclick="showScreen('screen-dashboard')" class="btn-back mb-4 text-cyan-400 text-sm font-medium">← <span data-key="back">Back</span></button>
 290 |             <h1 class="text-2xl font-bold mb-4 text-yellow-400" data-key="shop_title">TACTICAL ABILITIES</h1>
 291 | 
 292 |             <div class="space-y-3">
 293 |                 <div class="glass p-4 rounded-xl flex items-center justify-between">
 294 |                     <div>
 295 |                         <div class="font-bold text-cyan-300 text-sm" data-key="ability_scout_title">SCOUT</div>
 296 |                         <div class="text-xs text-gray-300" data-key="ability_scout_desc">Open 1 cell</div>
 297 |                     </div>
 298 |                     <button onclick="buyAbility('scout')" class="btn-primary px-3 py-2 rounded text-xs" data-key="ability_scout_price">40 coins</button>
 299 |                 </div>
 300 | 
 301 |                 <div class="glass p-4 rounded-xl flex items-center justify-between">
 302 |                     <div>
 303 |                         <div class="font-bold text-cyan-300 text-sm" data-key="ability_sonar_title">SONAR</div>
 304 |                         <div class="text-xs text-gray-300" data-key="ability_sonar_desc">Scan 3x3 area</div>
 305 |                     </div>
 306 |                     <button onclick="buyAbility('sonar')" class="btn-primary px-3 py-2 rounded text-xs" data-key="ability_sonar_price">60 coins</button>
 307 |                 </div>
 308 | 
 309 |                 <div class="glass p-4 rounded-xl flex items-center justify-between">
 310 |                     <div>
 311 |                         <div class="font-bold text-cyan-300 text-sm" data-key="ability_doubleShot_title">DOUBLE SHOT</div>
 312 |                         <div class="text-xs text-gray-300" data-key="ability_doubleShot_desc">Two shots in a row</div>
 313 |                     </div>
 314 |                     <button onclick="buyAbility('doubleShot')" class="btn-primary px-3 py-2 rounded text-xs" data-key="ability_doubleShot_price">75 coins</button>
 315 |                 </div>
 316 | 
 317 |                 <div class="glass p-4 rounded-xl flex items-center justify-between">
 318 |                     <div>
 319 |                         <div class="font-bold text-cyan-300 text-sm" data-key="ability_decoy_title">DECOY</div>
 320 |                         <div class="text-xs text-gray-300" data-key="ability_decoy_desc">Next enemy shot misses</div>
 321 |                     </div>
 322 |                     <button onclick="buyAbility('decoy')" class="btn-primary px-3 py-2 rounded text-xs" data-key="ability_decoy_price">50 coins</button>
 323 |                 </div>
 324 | 
 325 |                 <div class="glass p-4 rounded-xl flex items-center justify-between">
 326 |                     <div>
 327 |                         <div class="font-bold text-cyan-300 text-sm" data-key="ability_radar_title">RADAR</div>
 328 |                         <div class="text-xs text-gray-300" data-key="ability_radar_desc">Block repeated cells</div>
 329 |                     </div>
 330 |                     <button onclick="buyAbility('radar')" class="btn-primary px-3 py-2 rounded text-xs" data-key="ability_radar_price">70 coins</button>
 331 |                 </div>
 332 | 
 333 |                 <div class="glass p-4 rounded-xl flex items-center justify-between">
 334 |                     <div>
 335 |                         <div class="font-bold text-cyan-300 text-sm" data-key="ability_overheat_title">OVERHEAT</div>
 336 |                         <div class="text-xs text-gray-300" data-key="ability_overheat_desc">Enemy skips a turn</div>
 337 |                     </div>
 338 |                     <button onclick="buyAbility('overheat')" class="btn-primary px-3 py-2 rounded text-xs" data-key="ability_overheat_price">120 coins</button>
 339 |                 </div>
 340 | 
 341 |                 <div class="glass p-4 rounded-xl flex items-center justify-between">
 342 |                     <div>
 343 |                         <div class="font-bold text-cyan-300 text-sm" data-key="ability_fog_title">FOG</div>
 344 |                         <div class="text-xs text-gray-300" data-key="ability_fog_desc">Hide part of field</div>
 345 |                     </div>
 346 |                     <button onclick="buyAbility('fog')" class="btn-primary px-3 py-2 rounded text-xs" data-key="ability_fog_price">80 coins</button>
 347 |                 </div>
 348 | 
 349 |                 <div class="glass p-4 rounded-xl flex items-center justify-between">
 350 |                     <div>
 351 |                         <div class="font-bold text-cyan-300 text-sm" data-key="ability_counterStrike_title">COUNTER STRIKE</div>
 352 |                         <div class="text-xs text-gray-300" data-key="ability_counterStrike_desc">Return shot on hit</div>
 353 |                     </div>
 354 |                     <button onclick="buyAbility('counterStrike')" class="btn-primary px-3 py-2 rounded text-xs" data-key="ability_counterStrike_price">95 coins</button>
 355 |                 </div>
 356 |             </div>
 357 |         </div>
 358 |     </div>
 359 | 
 360 |     <!-- 8. LEADERBOARDS -->
 361 |     <div id="screen-leaderboards" class="screen">
 362 |         <div class="p-4">
 363 |             <button type="button" onclick="showScreen('screen-dashboard')" class="btn-back mb-4 text-cyan-400 text-sm font-medium">← <span data-key="back">Back</span></button>
 364 |             <h1 class="text-2xl font-bold mb-4 text-yellow-400" data-key="lb_title">LEADERBOARDS</h1>
 365 |             <div class="flex gap-2 mb-3">
 366 |                 <button id="lb-tab-rating" class="flex-1 glass p-2 rounded text-xs">Rating</button>
 367 |                 <button id="lb-tab-winrate" class="flex-1 glass p-2 rounded text-xs">Winrate 30+</button>
 368 |                 <button id="lb-tab-games" class="flex-1 glass p-2 rounded text-xs">Games</button>
 369 |             </div>
 370 |             <div id="lb-panel-rating" class="glass p-3 rounded-xl mb-3 max-h-80 overflow-y-auto text-xs">
 371 |                 <ul id="lb-rating-list" class="space-y-1"></ul>
 372 |             </div>
 373 |             <div id="lb-panel-winrate" class="glass p-3 rounded-xl mb-3 max-h-80 overflow-y-auto text-xs hidden">
 374 |                 <ul id="lb-winrate-list" class="space-y-1"></ul>
 375 |             </div>
 376 |             <div id="lb-panel-games" class="glass p-3 rounded-xl mb-3 max-h-80 overflow-y-auto text-xs hidden">
 377 |                 <ul id="lb-games-list" class="space-y-1"></ul>
 378 |             </div>
 379 |         </div>
 380 |     </div>
 381 |     <div id="screen-settings" class="screen">
 382 |         <div class="p-4">
 383 |             <button type="button" onclick="showScreen('screen-dashboard')" class="btn-back mb-4 text-cyan-400 text-sm font-medium">← <span data-key="back">Back</span></button>
 384 |             <h1 class="text-2xl font-bold mb-6" data-key="settings_title">SETTINGS</h1>
 385 |             <button onclick="setLanguage('en')" class="w-full glass p-4 mb-2 text-left">🇬🇧 <span data-key="settings_lang_en">English</span></button>
 386 |             <button onclick="setLanguage('ru')" class="w-full glass p-4 mb-2 text-left">🇷🇺 <span data-key="settings_lang_ru">Русский</span></button>
 387 |         </div>
 388 |     </div>
 389 | 
 390 |     <script type="module" src="js/main.js"></script>
 391 |     <script>
 392 |         (function() {
 393 |             setTimeout(function() {
 394 |                 if (typeof window.showScreen !== 'function') {
 395 |                     window.showScreen = function(id) {
 396 |                         document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
 397 |                         var el = document.getElementById(id && id.indexOf('screen-') === 0 ? id : 'screen-' + id);
 398 |                         if (el) el.classList.add('active');
 399 |                     };
 400 |                 }
 401 |                 if (typeof window.createBattle !== 'function') {
 402 |                     window.createBattle = function() { alert('App is loading... Reload the page.'); };
 403 |                 }
 404 |                 if (typeof window.setLanguage !== 'function') {
 405 |                     window.setLanguage = function() { alert('App is loading... Reload the page.'); };
 406 |                 }
 407 |             }, 2000);
 408 |         })();
 409 |     </script>
 410 | </body>
 411 | </html>
```
---

<div id='file-3'></div>

## 3. js/auth.js
> Lines: 141

```javascript
   1 | /**
   2 |  * Регистрация и проверка пользователя.
   3 |  * Используем Firebase Anonymous Auth + Telegram ID как внешнюю идентификацию.
   4 |  */
   5 | 
   6 | import { state } from './state.js';
   7 | import { ADMIN_IDS, ECONOMY, TEXTS } from './config.js';
   8 | import { getUser, setUser, createUser, initFirebase } from './database.js';
   9 | import { showScreen, updateDash, showToast } from './ui.js';
  10 | 
  11 | let tg = null;
  12 | 
  13 | export function getTg() {
  14 |     if (!tg) tg = window.Telegram?.WebApp;
  15 |     return tg;
  16 | }
  17 | 
  18 | async function ensureAnonAuth() {
  19 |     initFirebase();
  20 |     const auth = firebase.auth();
  21 |     if (!auth.currentUser) {
  22 |         await auth.signInAnonymously();
  23 |     }
  24 |     return auth.currentUser;
  25 | }
  26 | 
  27 | function applyUserToState(userData, uid) {
  28 |     state.user = {
  29 |         uid,
  30 |         telegramId: userData.telegramId || null,
  31 |         nickname: userData.nickname || 'Player',
  32 |         rating: userData.rating ?? ECONOMY.START_RATING,
  33 |         coins: userData.coins ?? ECONOMY.START_COINS,
  34 |         wins: userData.wins ?? 0,
  35 |         losses: userData.losses ?? 0,
  36 |         games: userData.games ?? 0,
  37 |         banned: !!userData.banned,
  38 |         abilities: userData.abilities || {},
  39 |         language: userData.language || state.lang
  40 |     };
  41 |     if (userData.language) state.lang = userData.language;
  42 | 
  43 |     const tgid = state.user.telegramId;
  44 |     if (tgid && ADMIN_IDS.includes(Number(tgid))) {
  45 |         const el = document.getElementById('admin-btn');
  46 |         if (el) el.classList.remove('hidden');
  47 |     }
  48 | 
  49 |     localStorage.setItem('uid', String(uid));
  50 |     updateDash();
  51 |     showScreen('screen-dashboard');
  52 | }
  53 | 
  54 | /**
  55 |  * При загрузке: анонимный Firebase Auth, затем поиск пользователя по uid.
  56 |  */
  57 | export async function tryAutoLogin() {
  58 |     tg = getTg();
  59 |     if (tg) {
  60 |         tg.ready();
  61 |         tg.expand();
  62 |         tg.setHeaderColor('#0a0a14');
  63 |     }
  64 | 
  65 |     const authUser = await ensureAnonAuth();
  66 |     const uid = authUser.uid;
  67 | 
  68 |     try {
  69 |         const userData = await getUser(uid);
  70 |         if (userData && userData.nickname) {
  71 |             applyUserToState(userData, uid);
  72 |             return true;
  73 |         }
  74 |     } catch (e) {
  75 |         console.warn('Auto-login failed:', e);
  76 |     }
  77 | 
  78 |     return false;
  79 | }
  80 | 
  81 | /**
  82 |  * Регистрация/обновление пользователя по нику и переход в лобби или в игру по ссылке.
  83 |  */
  84 | export async function registerUser() {
  85 |     const nicknameInput = document.getElementById('input-nickname');
  86 |     const nickname = (nicknameInput && nicknameInput.value.trim()) || 'Player';
  87 |     tg = getTg();
  88 |     const telegramId = tg?.initDataUnsafe?.user?.id ?? null;
  89 | 
  90 |     const authUser = await ensureAnonAuth();
  91 |     const uid = authUser.uid;
  92 | 
  93 |     const baseUser = {
  94 |         telegramId,
  95 |         nickname,
  96 |         language: state.lang
  97 |     };
  98 | 
  99 |     try {
 100 |         const existing = await getUser(uid);
 101 |         if (existing) {
 102 |             await setUser(uid, { ...baseUser, lastActive: Date.now() });
 103 |             applyUserToState({ ...existing, ...baseUser }, uid);
 104 |         } else {
 105 |             await createUser(uid, baseUser);
 106 |             applyUserToState(
 107 |                 {
 108 |                     ...baseUser,
 109 |                     rating: ECONOMY.START_RATING,
 110 |                     coins: ECONOMY.START_COINS,
 111 |                     wins: 0,
 112 |                     losses: 0,
 113 |                     games: 0,
 114 |                     banned: false,
 115 |                     abilities: {},
 116 |                     achievements: {}
 117 |                 },
 118 |                 uid
 119 |             );
 120 |         }
 121 |     } catch (e) {
 122 |         console.error('Failed to save user:', e);
 123 |         const msg = TEXTS[state.lang]?.error_save_user || TEXTS.en.error_save_user;
 124 |         showToast(msg, 'error');
 125 |         return;
 126 |     }
 127 | 
 128 |     const urlParams = new URLSearchParams(window.location.search);
 129 |     const joinGameId = urlParams.get('startapp');
 130 |     if (joinGameId) {
 131 |         const { joinGame } = await import('./game.js');
 132 |         await joinGame(joinGameId);
 133 |     } else {
 134 |         showScreen('screen-dashboard');
 135 |     }
 136 | }
 137 | 
 138 | export function bindRegisterButton() {
 139 |     const btn = document.getElementById('btn-register');
 140 |     if (btn) btn.addEventListener('click', () => registerUser());
 141 | }
```
---

<div id='file-4'></div>

## 4. js/config.js
> Lines: 272

```javascript
   1 | /**
   2 |  * Конфигурация Firebase и константы приложения.
   3 |  * Здесь описывается экономика, способности, погода и локализация.
   4 |  */
   5 | 
   6 | // В продакшене ADMIN_IDS лучше прокидывать из back-end / env,
   7 | // но для Mini App читаем их статически. Значения должны совпадать с Telegram ID.
   8 | export const ADMIN_IDS = [6250975346];
   9 | 
  10 | export const FIREBASE_CONFIG = {
  11 |     apiKey: "AIzaSyBzu_EqbYoHR9AGRjNTjlCX2f4seIMgpwk",
  12 |     authDomain: "test-game-bf099.firebaseapp.com",
  13 |     databaseURL: "https://test-game-bf099-default-rtdb.europe-west1.firebasedatabase.app",
  14 |     projectId: "test-game-bf099",
  15 |     storageBucket: "test-game-bf099.firebasestorage.app",
  16 |     messagingSenderId: "624705252854",
  17 |     appId: "1:624705252854:web:f24eb7255da54c47902bd7",
  18 |     measurementId: "G-TVDRXT9CHV"
  19 | };
  20 | 
  21 | // Игровое поле
  22 | export const GRID_SIZE = 10;
  23 | export const SHIP_SIZES = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
  24 | 
  25 | // Экономика и рейтинг
  26 | export const ECONOMY = {
  27 |     START_RATING: 1000,
  28 |     START_COINS: 50,
  29 |     RANKED_WIN_RATING_DELTA: 25,
  30 |     RANKED_LOSS_RATING_DELTA: -25,
  31 |     MIN_RATING_FOR_RANKED: 25, // Минимальный рейтинг для создания ranked-игры
  32 |     MIN_RATING: 25,
  33 |     RANKED_WIN_COINS: 50,
  34 |     RANKED_LOSS_COINS: 25
  35 | };
  36 | 
  37 | // Способности и их стоимость (монеты)
  38 | export const ABILITIES = {
  39 |     scout:       { id: 'scout',       cost: 40 },
  40 |     sonar:       { id: 'sonar',       cost: 60 },
  41 |     doubleShot:  { id: 'doubleShot',  cost: 75 },
  42 |     decoy:       { id: 'decoy',       cost: 50 },
  43 |     radar:       { id: 'radar',       cost: 70 },
  44 |     overheat:    { id: 'overheat',    cost: 120 },
  45 |     fog:         { id: 'fog',         cost: 80 },
  46 |     counterStrike: { id: 'counterStrike', cost: 95 }
  47 | };
  48 | 
  49 | export const WEATHER_TYPES = ['calm', 'storm', 'night'];
  50 | 
  51 | export const TEXTS = {
  52 |     en: {
  53 |         app_title: "NAVAL WARFARE",
  54 |         lang_en: "English",
  55 |         lang_ru: "Russian",
  56 |         welcome: "Welcome, Commander",
  57 |         deploy: "DEPLOY",
  58 |         create_battle: "CREATE BATTLE (FRIEND)",
  59 |         play_random: "RANKED RANDOM",
  60 |         shop: "SHOP",
  61 |         dashboard_command: "COMMAND",
  62 |         stats_coins: "Coins",
  63 |         stats_wins: "Wins",
  64 |         stats_winrate: "WinRate",
  65 |         share_link_label: "Send this link to friend:",
  66 |         share_link_copy: "COPY",
  67 |         deploy_fleet: "Deploy Fleet",
  68 |         select_ship: "Select Ship:",
  69 |         ready: "READY FOR BATTLE",
  70 |         waiting: "Waiting for opponent...",
  71 |         your_turn: "YOUR TURN",
  72 |         enemy_turn: "ENEMY TURN",
  73 |         nick_placeholder: "Nickname...",
  74 |         back: "Back",
  75 |         opponent_left: "Opponent left the game",
  76 |         battle_you: "YOU",
  77 |         battle_enemy: "ENEMY",
  78 |         battle_alive: "ALIVE",
  79 |         battle_waiting: "WAITING...",
  80 |         battle_enemy_waters: "ENEMY WATERS",
  81 |         battle_your_fleet: "YOUR FLEET",
  82 |         admin_panel_button: "ADMIN PANEL",
  83 |         admin_title: "ADMIN",
  84 |         admin_active_games: "Active Games",
  85 |         admin_user_id_placeholder: "User ID",
  86 |         admin_amount_placeholder: "Amount",
  87 |         admin_add_coins: "Add Coins",
  88 |         admin_add_gems: "Add Gems",
  89 |         admin_tab_overview: "Overview",
  90 |         admin_tab_matches: "Matches",
  91 |         admin_tab_bans: "Bans",
  92 |         admin_tab_logs: "Logs",
  93 |         admin_ban: "BAN",
  94 |         admin_unban: "UNBAN",
  95 |         admin_ban_reason: "Reason",
  96 |         admin_total_games: "Total Games",
  97 |         admin_human_wins: "Human Wins",
  98 |         admin_bot_wins: "Bot Wins",
  99 |         admin_activity_title: "Activity (last 24h)",
 100 |         admin_recent_matches: "Recent Matches",
 101 |         admin_logs_title: "Admin Logs",
 102 |         admin_view_profile: "View Profile",
 103 |         admin_matches: "matches",
 104 |         admin_no_reason: "no reason",
 105 |         shop_title: "TACTICAL ABILITIES",
 106 |         ability_scout_title: "SCOUT",
 107 |         ability_scout_desc: "Open 1 cell",
 108 |         ability_scout_price: "40 coins",
 109 |         ability_sonar_title: "SONAR",
 110 |         ability_sonar_desc: "Scan 3x3 area",
 111 |         ability_sonar_price: "60 coins",
 112 |         ability_doubleShot_title: "DOUBLE SHOT",
 113 |         ability_doubleShot_desc: "Two shots in a row",
 114 |         ability_doubleShot_price: "75 coins",
 115 |         ability_decoy_title: "DECOY",
 116 |         ability_decoy_desc: "Next enemy shot misses",
 117 |         ability_decoy_price: "50 coins",
 118 |         ability_radar_title: "RADAR",
 119 |         ability_radar_desc: "Block repeated cells",
 120 |         ability_radar_price: "70 coins",
 121 |         ability_overheat_title: "OVERHEAT",
 122 |         ability_overheat_desc: "Enemy skips a turn",
 123 |         ability_overheat_price: "120 coins",
 124 |         ability_fog_title: "FOG",
 125 |         ability_fog_desc: "Hide part of field",
 126 |         ability_fog_price: "80 coins",
 127 |         ability_counterStrike_title: "COUNTER STRIKE",
 128 |         ability_counterStrike_desc: "Return shot on hit",
 129 |         ability_counterStrike_price: "95 coins",
 130 |         settings_title: "SETTINGS",
 131 |         settings_lang_en: "English",
 132 |         settings_lang_ru: "Russian",
 133 |         error_save_user: "Save failed. Check connection and reopen the app.",
 134 |         error_create_battle: "Failed to create battle. Check your connection.",
 135 |         error_matchmaking: "Matchmaking failed. Try again.",
 136 |         match_finished: "Match finished",
 137 |         admin_done: "Done!",
 138 |         shop_purchased: "Purchased",
 139 |         shop_purchase_failed: "Purchase failed",
 140 |         matchmaking_search_title: "Searching for opponent...",
 141 |         matchmaking_search_sub: "We will find a fair enemy or start a bot battle.",
 142 |         matchmaking_cancel: "CANCEL",
 143 |         matchmaking_vs_bot_easy: "You will fight bot (easy).",
 144 |         matchmaking_vs_bot_normal: "You will fight bot (normal).",
 145 |         matchmaking_vs_bot_hard: "You will fight bot (hard).",
 146 |         lb_title: "LEADERBOARDS",
 147 |         lb_tab_rating: "Rating",
 148 |         lb_tab_winrate: "Winrate 30+",
 149 |         lb_tab_games: "Games",
 150 |         onboarding_slide1_title: "FLEET PLACEMENT",
 151 |         onboarding_slide1_text: "Place your ships on the board. Tap a ship to rotate it. When all ships are placed, press \"READY\".",
 152 |         onboarding_slide2_title: "TACTICAL ABILITIES",
 153 |         onboarding_slide2_text: "Buy abilities in the shop for coins. Use them in battle for advantages: scout, double shot, fog, and more.",
 154 |         onboarding_slide3_title: "RATING & ECONOMY",
 155 |         onboarding_slide3_text: "Win matches to increase rating and earn coins. Lose to decrease rating. Higher rating means stronger opponents.",
 156 |         onboarding_next: "NEXT",
 157 |         onboarding_skip: "SKIP",
 158 |         onboarding_start: "START",
 159 |         error_low_rating: "Your rating is too low for ranked matches. Minimum rating: 25",
 160 |         error_low_rating_title: "Rating Too Low"
 161 |     },
 162 |     ru: {
 163 |         app_title: "МОРСКОЙ БОЙ",
 164 |         lang_en: "Английский",
 165 |         lang_ru: "Русский",
 166 |         welcome: "Добро пожаловать",
 167 |         deploy: "В БОЙ",
 168 |         create_battle: "БИТВА С ДРУГОМ",
 169 |         play_random: "РЕЙТИНГОВЫЙ РАНДОМ",
 170 |         shop: "МАГАЗИН",
 171 |         dashboard_command: "КОМАНДОВАНИЕ",
 172 |         stats_coins: "Монеты",
 173 |         stats_wins: "Победы",
 174 |         stats_winrate: "Винрейт",
 175 |         share_link_label: "Отправьте эту ссылку другу:",
 176 |         share_link_copy: "СКОПИРОВАТЬ",
 177 |         deploy_fleet: "Расстановка",
 178 |         select_ship: "Выберите корабль:",
 179 |         ready: "К БОЮ",
 180 |         waiting: "Ждем противника...",
 181 |         your_turn: "ВАШ ХОД",
 182 |         enemy_turn: "ХОД ВРАГА",
 183 |         nick_placeholder: "Ник...",
 184 |         back: "Назад",
 185 |         opponent_left: "Противник вышел из игры",
 186 |         battle_you: "ВЫ",
 187 |         battle_enemy: "ВРАГ",
 188 |         battle_alive: "В СТРОЮ",
 189 |         battle_waiting: "ОЖИДАНИЕ...",
 190 |         battle_enemy_waters: "ВОДЫ ПРОТИВНИКА",
 191 |         battle_your_fleet: "ВАШ ФЛОТ",
 192 |         admin_panel_button: "АДМИН-ПАНЕЛЬ",
 193 |         admin_title: "АДМИН",
 194 |         admin_active_games: "Активные игры",
 195 |         admin_user_id_placeholder: "ID игрока",
 196 |         admin_amount_placeholder: "Сумма",
 197 |         admin_add_coins: "Добавить монеты",
 198 |         admin_add_gems: "Добавить гемы",
 199 |         admin_tab_overview: "Обзор",
 200 |         admin_tab_matches: "Матчи",
 201 |         admin_tab_bans: "Баны",
 202 |         admin_tab_logs: "Логи",
 203 |         admin_ban: "ЗАБАНИТЬ",
 204 |         admin_unban: "РАЗБАНИТЬ",
 205 |         admin_ban_reason: "Причина",
 206 |         admin_total_games: "Всего игр",
 207 |         admin_human_wins: "Побед игроков",
 208 |         admin_bot_wins: "Побед бота",
 209 |         admin_activity_title: "Активность (последние 24ч)",
 210 |         admin_recent_matches: "Последние матчи",
 211 |         admin_logs_title: "Логи админа",
 212 |         admin_view_profile: "Просмотр профиля",
 213 |         admin_matches: "матчей",
 214 |         admin_no_reason: "без причины",
 215 |         shop_title: "ТАКТИЧЕСКИЕ СПОСОБНОСТИ",
 216 |         ability_scout_title: "РАЗВЕДКА",
 217 |         ability_scout_desc: "Открыть 1 клетку",
 218 |         ability_scout_price: "40 монет",
 219 |         ability_sonar_title: "СОНАР",
 220 |         ability_sonar_desc: "Проверить зону 3x3",
 221 |         ability_sonar_price: "60 монет",
 222 |         ability_doubleShot_title: "ДВОЙНОЙ ВЫСТРЕЛ",
 223 |         ability_doubleShot_desc: "Два выстрела подряд",
 224 |         ability_doubleShot_price: "75 монет",
 225 |         ability_decoy_title: "ЛОЖНАЯ ЦЕЛЬ",
 226 |         ability_decoy_desc: "Следующий выстрел врага — мимо",
 227 |         ability_decoy_price: "50 монет",
 228 |         ability_radar_title: "РАДАР",
 229 |         ability_radar_desc: "Запрет повторных клеток",
 230 |         ability_radar_price: "70 монет",
 231 |         ability_overheat_title: "ПЕРЕГРЕВ",
 232 |         ability_overheat_desc: "Враг пропускает ход",
 233 |         ability_overheat_price: "120 монет",
 234 |         ability_fog_title: "ТУМАН",
 235 |         ability_fog_desc: "Скрыть часть поля",
 236 |         ability_fog_price: "80 монет",
 237 |         ability_counterStrike_title: "КОНТР-УДАР",
 238 |         ability_counterStrike_desc: "Ответный выстрел при попадании",
 239 |         ability_counterStrike_price: "95 монет",
 240 |         settings_title: "НАСТРОЙКИ",
 241 |         settings_lang_en: "Английский",
 242 |         settings_lang_ru: "Русский",
 243 |         error_save_user: "Ошибка сохранения. Проверьте интернет и откройте приложение снова.",
 244 |         error_create_battle: "Ошибка создания боя. Проверьте интернет.",
 245 |         error_matchmaking: "Ошибка матчмейкинга. Попробуйте позже.",
 246 |         match_finished: "Матч завершён",
 247 |         admin_done: "Готово!",
 248 |         shop_purchased: "Приобретено",
 249 |         shop_purchase_failed: "Ошибка покупки",
 250 |         matchmaking_search_title: "Ищем соперника...",
 251 |         matchmaking_search_sub: "Найдём честного врага или запустим бой с ботом.",
 252 |         matchmaking_cancel: "ОТМЕНА",
 253 |         matchmaking_vs_bot_easy: "Вы сражаетесь против бота (легко).",
 254 |         matchmaking_vs_bot_normal: "Вы сражаетесь против бота (нормально).",
 255 |         matchmaking_vs_bot_hard: "Вы сражаетесь против бота (сложно).",
 256 |         lb_title: "ТАБЛИЦЫ ЛИДЕРОВ",
 257 |         lb_tab_rating: "Рейтинг",
 258 |         lb_tab_winrate: "Винрейт 30+",
 259 |         lb_tab_games: "Игры",
 260 |         onboarding_slide1_title: "РАССТАНОВКА ФЛОТА",
 261 |         onboarding_slide1_text: "Расставьте свои корабли на поле. Нажмите на корабль, чтобы повернуть его. Когда все корабли расставлены, нажмите «К БОЮ».",
 262 |         onboarding_slide2_title: "ТАКТИЧЕСКИЕ СПОСОБНОСТИ",
 263 |         onboarding_slide2_text: "Покупайте способности в магазине за монеты. Используйте их в бою для получения преимущества: разведка, двойной выстрел, туман и другие.",
 264 |         onboarding_slide3_title: "РЕЙТИНГ И ЭКОНОМИКА",
 265 |         onboarding_slide3_text: "Выигрывайте матчи, чтобы повысить рейтинг и заработать монеты. Проигрывайте — теряйте рейтинг. Чем выше рейтинг, тем сильнее соперники.",
 266 |         onboarding_next: "ДАЛЕЕ",
 267 |         onboarding_skip: "ПРОПУСТИТЬ",
 268 |         onboarding_start: "НАЧАТЬ",
 269 |         error_low_rating: "Ваш рейтинг слишком низкий для рейтинговых матчей. Минимальный рейтинг: 25",
 270 |         error_low_rating_title: "Рейтинг слишком низкий"
 271 |     }
 272 | };
```
---

<div id='file-5'></div>

## 5. js/database.js
> Lines: 359

```javascript
   1 | /**
   2 |  * Все операции чтения/записи Firebase Realtime Database.
   3 |  * Здесь же инициализируем Firebase (app + db), чтобы им могла пользоваться и Auth.
   4 |  */
   5 | 
   6 | import { FIREBASE_CONFIG, ECONOMY, ABILITIES } from './config.js';
   7 | 
   8 | let db = null;
   9 | let appInitialized = false;
  10 | 
  11 | export function initFirebase() {
  12 |     if (!appInitialized) {
  13 |         try {
  14 |             if (typeof firebase === 'undefined') throw new Error('Firebase SDK not loaded');
  15 |             firebase.initializeApp(FIREBASE_CONFIG);
  16 |             db = firebase.database();
  17 |             appInitialized = true;
  18 |         } catch (e) {
  19 |             console.error('Firebase init error:', e);
  20 |             throw e;
  21 |         }
  22 |     }
  23 |     return db;
  24 | }
  25 | 
  26 | export function getDb() {
  27 |     if (!db) {
  28 |         initFirebase();
  29 |     }
  30 |     return db;
  31 | }
  32 | 
  33 | // ——— Users ———
  34 | 
  35 | /** Прочитать пользователя по uid (auth.uid). */
  36 | export async function getUser(userId) {
  37 |     const snap = await getDb().ref('users/' + userId).once('value');
  38 |     return snap.val();
  39 | }
  40 | 
  41 | /**
  42 |  * Частичное обновление пользователя.
  43 |  */
  44 | export function setUser(userId, data) {
  45 |     return getDb().ref('users/' + userId).update(data);
  46 | }
  47 | 
  48 | /**
  49 |  * Создать нового пользователя с начальными значениями экономики и профиля.
  50 |  */
  51 | export function createUser(uid, { telegramId, nickname, language }) {
  52 |     const now = Date.now();
  53 |     const base = {
  54 |         telegramId: telegramId ?? null,
  55 |         nickname: nickname || 'Player',
  56 |         language: language || 'en',
  57 |         rating: ECONOMY.START_RATING,
  58 |         coins: ECONOMY.START_COINS,
  59 |         wins: 0,
  60 |         losses: 0,
  61 |         games: 0,
  62 |         banned: false,
  63 |         createdAt: now,
  64 |         lastActive: now,
  65 |         abilities: {},
  66 |         achievements: {}
  67 |     };
  68 |     return getDb().ref('users/' + uid).set(base);
  69 | }
  70 | 
  71 | // ——— Games ———
  72 | export function setGame(gameId, data) {
  73 |     return getDb().ref('games/' + gameId).set(data);
  74 | }
  75 | 
  76 | export function updateGame(gameId, data) {
  77 |     return getDb().ref('games/' + gameId).update(data);
  78 | }
  79 | 
  80 | export async function getGame(gameId) {
  81 |     const snap = await getDb().ref('games/' + gameId).once('value');
  82 |     return snap.val();
  83 | }
  84 | 
  85 | export function onGame(gameId, callback) {
  86 |     return getDb().ref('games/' + gameId).on('value', snap => callback(snap.val()));
  87 | }
  88 | 
  89 | export function offGame(gameId) {
  90 |     getDb().ref('games/' + gameId).off('value');
  91 | }
  92 | 
  93 | export function setPlayerData(gameId, userId, data) {
  94 |     return getDb().ref('games/' + gameId + '/players/' + userId).set(data);
  95 | }
  96 | 
  97 | export async function getPlayerData(gameId, userId) {
  98 |     const snap = await getDb().ref('games/' + gameId + '/players/' + userId).once('value');
  99 |     return snap.val();
 100 | }
 101 | 
 102 | export function onPlayers(gameId, callback) {
 103 |     return getDb().ref('games/' + gameId + '/players').on('value', snap => callback(snap.val()));
 104 | }
 105 | 
 106 | export function offPlayers(gameId) {
 107 |     getDb().ref('games/' + gameId + '/players').off('value');
 108 | }
 109 | 
 110 | /**
 111 |  * Транзакция выстрела в PvP:
 112 |  * - только текущий ход может стрелять
 113 |  * - считаем попадание на сервере по boards/{opponentId}/ships
 114 |  * - обновляем turn, lastShot, shots, hitsCount и при необходимости завершаем матч.
 115 |  */
 116 | export async function runShootTransaction(gameId, myUserId, opponentId, cellIdx) {
 117 |     const gameRef = getDb().ref('games/' + gameId);
 118 |     return gameRef.runTransaction(current => {
 119 |         const game = current;
 120 |         if (!game || game.turn !== myUserId) return; // не твой ход — отмена
 121 | 
 122 |         const boards = game.boards || {};
 123 |         const oppBoard = boards[opponentId];
 124 |         if (!oppBoard) return;
 125 | 
 126 |         const key = String(cellIdx);
 127 |         const prevShots = oppBoard.shots || {};
 128 |         if (prevShots[key]) return; // уже стреляли сюда — отмена
 129 | 
 130 |         const isHit = !!(oppBoard.ships && oppBoard.ships[key]);
 131 |         const prevHits = oppBoard.hitsCount || 0;
 132 |         const totalShipCells = oppBoard.totalShipCells || 0;
 133 |         const newHits = prevHits + (isHit ? 1 : 0);
 134 | 
 135 |         const finished = totalShipCells > 0 && newHits >= totalShipCells;
 136 |         const nextTurn = finished ? null : (isHit ? myUserId : opponentId);
 137 | 
 138 |         const newOppBoard = {
 139 |             ...oppBoard,
 140 |             shots: { ...prevShots, [key]: true },
 141 |             hitsCount: newHits
 142 |         };
 143 | 
 144 |         const newBoards = {
 145 |             ...boards,
 146 |             [opponentId]: newOppBoard
 147 |         };
 148 | 
 149 |         const updated = {
 150 |             ...game,
 151 |             boards: newBoards,
 152 |             turn: nextTurn,
 153 |             lastShot: { idx: cellIdx, isHit, shooter: myUserId },
 154 |             lastShotAt: Date.now()
 155 |         };
 156 | 
 157 |         if (finished) {
 158 |             updated.status = 'finished';
 159 |             updated.finished = true;
 160 |             updated.result = {
 161 |                 winner: myUserId,
 162 |                 loser: opponentId,
 163 |                 finishedAt: Date.now(),
 164 |                 botGame: false
 165 |             };
 166 |         }
 167 | 
 168 |         return updated;
 169 |     });
 170 | }
 171 | 
 172 | /** Отметить, что игрок отключился (для уведомления противника). */
 173 | export function setPlayerDisconnected(gameId, userId) {
 174 |     return getDb().ref('games/' + gameId + '/disconnected/' + userId).set(Date.now());
 175 | }
 176 | 
 177 | export function onDisconnected(gameId, callback) {
 178 |     return getDb().ref('games/' + gameId + '/disconnected').on('value', snap => callback(snap.val()));
 179 | }
 180 | 
 181 | export function offDisconnected(gameId) {
 182 |     getDb().ref('games/' + gameId + '/disconnected').off('value');
 183 | }
 184 | 
 185 | // ——— Matchmaking ———
 186 | 
 187 | export function enterMatchmakingQueue(uid, rating) {
 188 |     return getDb()
 189 |         .ref('matchmakingQueue/' + uid)
 190 |         .set({
 191 |             rating: rating || ECONOMY.START_RATING,
 192 |             timestamp: Date.now()
 193 |         });
 194 | }
 195 | 
 196 | export function leaveMatchmakingQueue(uid) {
 197 |     return getDb().ref('matchmakingQueue/' + uid).remove();
 198 | }
 199 | 
 200 | export async function getMatchmakingQueue() {
 201 |     const snap = await getDb().ref('matchmakingQueue').once('value');
 202 |     return snap.val() || {};
 203 | }
 204 | 
 205 | // ——— Stats / Leaderboards / Admin ———
 206 | 
 207 | export function incrementGlobalStats(updates) {
 208 |     // updates: { totalGamesDelta, humanWinsDelta, botWinsDelta }
 209 |     const ref = getDb().ref('stats/global');
 210 |     return ref.transaction(current => {
 211 |         const cur = current || {};
 212 |         return {
 213 |             activeUsers: cur.activeUsers || 0,
 214 |             peakOnline: cur.peakOnline || 0,
 215 |             totalGames: (cur.totalGames || 0) + (updates.totalGamesDelta || 0),
 216 |             humanWins: (cur.humanWins || 0) + (updates.humanWinsDelta || 0),
 217 |             botWins: (cur.botWins || 0) + (updates.botWinsDelta || 0)
 218 |         };
 219 |     });
 220 | }
 221 | 
 222 | export async function getActiveGamesCount() {
 223 |     const snap = await getDb().ref('games').orderByChild('status').once('value');
 224 |     const val = snap.val();
 225 |     if (!val) return 0;
 226 |     return Object.values(val).filter(g => g.status && g.status !== 'finished').length;
 227 | }
 228 | 
 229 | export async function adminAddCoinsOrGems(userId, type, amount) {
 230 |     const ref = getDb().ref('users/' + userId + '/' + type);
 231 |     const snap = await ref.once('value');
 232 |     const current = snap.val() || 0;
 233 |     await ref.set(current + amount);
 234 | }
 235 | 
 236 | export function setBan(uid, reason, byAdminUid) {
 237 |     const now = Date.now();
 238 |     const updates = {};
 239 |     updates['/bans/' + uid] = { reason, byAdmin: byAdminUid, timestamp: now };
 240 |     updates['/users/' + uid + '/banned'] = true;
 241 |     return getDb().ref().update(updates);
 242 | }
 243 | 
 244 | export function clearBan(uid) {
 245 |     const updates = {};
 246 |     updates['/bans/' + uid] = null;
 247 |     updates['/users/' + uid + '/banned'] = false;
 248 |     return getDb().ref().update(updates);
 249 | }
 250 | 
 251 | export function logAdminAction(adminUid, action, payload) {
 252 |     const logRef = getDb().ref('adminLogs').push();
 253 |     return logRef.set({
 254 |         adminUid,
 255 |         action,
 256 |         payload: payload || null,
 257 |         timestamp: Date.now()
 258 |     });
 259 | }
 260 | 
 261 | /**
 262 |  * Логирование клиентских ошибок для отладки в проде.
 263 |  * @param {string} errorMessage - Сообщение об ошибке
 264 |  * @param {string} source - Источник (файл:строка)
 265 |  * @param {number} lineno - Номер строки
 266 |  * @param {number} colno - Номер колонки
 267 |  * @param {Error} error - Объект ошибки
 268 |  * @param {string} uid - UID пользователя (опционально)
 269 |  */
 270 | export function logClientError(errorMessage, source, lineno, colno, error, uid = null) {
 271 |     try {
 272 |         const errorRef = getDb().ref('clientErrors').push();
 273 |         return errorRef.set({
 274 |             uid: uid || null,
 275 |             message: errorMessage || 'Unknown error',
 276 |             source: source || 'unknown',
 277 |             lineno: lineno || null,
 278 |             colno: colno || null,
 279 |             stack: error?.stack || null,
 280 |             userAgent: navigator.userAgent || null,
 281 |             url: window.location.href || null,
 282 |             timestamp: Date.now()
 283 |         }).catch(err => {
 284 |             // Если не удалось записать в Firebase, хотя бы логируем в консоль
 285 |             console.error('Failed to log client error to Firebase:', err);
 286 |         });
 287 |     } catch (e) {
 288 |         console.error('Error logging client error:', e);
 289 |     }
 290 | }
 291 | 
 292 | export async function getTopByRating(limit = 50) {
 293 |     const snap = await getDb()
 294 |         .ref('users')
 295 |         .orderByChild('rating')
 296 |         .limitToLast(limit)
 297 |         .once('value');
 298 |     const val = snap.val() || {};
 299 |     // Revert order: highest rating first
 300 |     return Object.entries(val)
 301 |         .map(([uid, u]) => ({ uid, ...u }))
 302 |         .sort((a, b) => (b.rating || 0) - (a.rating || 0));
 303 | }
 304 | 
 305 | export async function getGlobalStats() {
 306 |     const snap = await getDb().ref('stats/global').once('value');
 307 |     return snap.val() || {};
 308 | }
 309 | 
 310 | export async function getRecentActivity(limitHours = 24) {
 311 |     const snap = await getDb().ref('stats/activity').once('value');
 312 |     const val = snap.val() || {};
 313 |     const entries = Object.entries(val).sort((a, b) => (a[0] > b[0] ? -1 : 1));
 314 |     return entries.slice(0, limitHours).map(([bucket, data]) => ({ bucket, ...data }));
 315 | }
 316 | 
 317 | export async function getRecentMatches(limit = 20) {
 318 |     const snap = await getDb().ref('matchHistory').once('value');
 319 |     const val = snap.val() || {};
 320 |     const entries = Object.entries(val).sort((a, b) => (b[1].finishedAt || 0) - (a[1].finishedAt || 0));
 321 |     return entries.slice(0, limit).map(([gameId, data]) => ({ gameId, ...data }));
 322 | }
 323 | 
 324 | export async function getBans() {
 325 |     const snap = await getDb().ref('bans').once('value');
 326 |     const val = snap.val() || {};
 327 |     return Object.entries(val).map(([uid, data]) => ({ uid, ...data }));
 328 | }
 329 | 
 330 | export async function getAdminLogs(limit = 50) {
 331 |     const snap = await getDb().ref('adminLogs').limitToLast(limit).once('value');
 332 |     const val = snap.val() || {};
 333 |     return Object.entries(val)
 334 |         .map(([id, log]) => ({ id, ...log }))
 335 |         .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
 336 | }
 337 | 
 338 | export async function getMatchesForUser(uid, limit = 20) {
 339 |     const snap = await getDb().ref('matchHistory').once('value');
 340 |     const val = snap.val() || {};
 341 |     const matches = [];
 342 |     for (const [gameId, m] of Object.entries(val)) {
 343 |         const players = m.players || {};
 344 |         if (players.host === uid || players.guest === uid) {
 345 |             matches.push({ gameId, ...m });
 346 |         }
 347 |     }
 348 |     matches.sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));
 349 |     return matches.slice(0, limit);
 350 | }
 351 | 
 352 | export async function getUsersForLeaderboards(limit = 200) {
 353 |     const snap = await getDb().ref('users').once('value');
 354 |     const val = snap.val() || {};
 355 |     const users = Object.entries(val).map(([uid, u]) => ({ uid, ...u }));
 356 |     // Можно ограничить сверху по количеству, чтобы не тянуть тысячи записей
 357 |     users.sort((a, b) => (b.games || 0) - (a.games || 0));
 358 |     return users.slice(0, limit);
 359 | }
```
---

<div id='file-6'></div>

## 6. js/economyController.js
> Lines: 36

```javascript
   1 | /**
   2 |  * Контроллер экономики и магазина.
   3 |  * Использует EconomyService (SOLID: отделяем доменную логику от UI).
   4 |  */
   5 | 
   6 | import { state } from './state.js';
   7 | import { EconomyService } from './services.js';
   8 | import { updateDash, showToast } from './ui.js';
   9 | import { TEXTS } from './config.js';
  10 | 
  11 | const economyService = new EconomyService();
  12 | 
  13 | export function initShop() {
  14 |     const coinsEl = document.getElementById('dash-coins');
  15 |     if (coinsEl && state.user) {
  16 |         coinsEl.textContent = state.user.coins;
  17 |     }
  18 | }
  19 | 
  20 | export async function buyAbility(abilityId) {
  21 |     if (!state.user) return;
  22 |     try {
  23 |         const result = await economyService.purchaseAbility(state.user.uid, abilityId);
  24 |         state.user.coins = result.coins;
  25 |         state.user.abilities = state.user.abilities || {};
  26 |         state.user.abilities[abilityId] = result.count;
  27 |         updateDash();
  28 |         const base = TEXTS[state.lang] || TEXTS.en;
  29 |         showToast(`${base.shop_purchased}: ${abilityId} x${result.count}`, 'success');
  30 |     } catch (e) {
  31 |         console.error('Purchase failed', e);
  32 |         const base = TEXTS[state.lang] || TEXTS.en;
  33 |         showToast(base.shop_purchase_failed, 'error');
  34 |     }
  35 | }
  36 | 
```
---

<div id='file-7'></div>

## 7. js/game.js
> Lines: 889

```javascript
   1 | /**
   2 |  * Логика расстановки кораблей и боя. Транзакции выстрелов, валидация расстановки, дисконнект.
   3 |  */
   4 | 
   5 | import { state, resetGameState } from './state.js';
   6 | import { GRID_SIZE, SHIP_SIZES, TEXTS, WEATHER_TYPES, ECONOMY } from './config.js';
   7 | import {
   8 |     setGame,
   9 |     updateGame,
  10 |     getGame,
  11 |     onGame,
  12 |     offGame,
  13 |     setPlayerData,
  14 |     onPlayers,
  15 |     offPlayers,
  16 |     runShootTransaction,
  17 |     setPlayerDisconnected,
  18 |     onDisconnected,
  19 |     offDisconnected,
  20 |     getPlayerData
  21 | } from './database.js';
  22 | import { MatchmakingService, BotPlayer, MatchResultService, StatsService, AchievementsService } from './services.js';
  23 | import {
  24 |     showScreen,
  25 |     renderPlacementGrid,
  26 |     renderShipSelector,
  27 |     renderBattleGrids,
  28 |     updateGridVisuals,
  29 |     setEnemyCellClass,
  30 |     setTurnIndicator,
  31 |     setBattleTimer,
  32 |     showShake,
  33 |     showOpponentLeftMessage
  34 | } from './ui.js';
  35 | import { getTg } from './auth.js';
  36 | import { adminAddCoinsOrGems, getActiveGamesCount, getGlobalStats, getRecentActivity, getRecentMatches, getBans, getAdminLogs, getUser, getMatchesForUser, getTopByRating, getUsersForLeaderboards, setBan, clearBan, logAdminAction } from './database.js';
  37 | 
  38 | // Сервисы (единые инстансы)
  39 | const matchmakingService = new MatchmakingService();
  40 | let botPlayer = new BotPlayer('normal');
  41 | const matchResultService = new MatchResultService();
  42 | const statsService = new StatsService();
  43 | const achievementsService = new AchievementsService();
  44 | 
  45 | const BOT_UID = 'bot';
  46 | const TOTAL_SHIP_CELLS = SHIP_SIZES.reduce((a, b) => a + b, 0);
  47 | 
  48 | function isBotGuest(guestVal) {
  49 |     return typeof guestVal === 'string' && guestVal.startsWith('bot:');
  50 | }
  51 | 
  52 | function getBotDifficultyFromGuest(guestVal) {
  53 |     if (!isBotGuest(guestVal)) return 'normal';
  54 |     return String(guestVal).split(':')[1] || 'normal';
  55 | }
  56 | 
  57 | function sleep(ms) {
  58 |     return new Promise(r => setTimeout(r, ms));
  59 | }
  60 | 
  61 | function randomInt(min, max) {
  62 |     return Math.floor(Math.random() * (max - min + 1)) + min;
  63 | }
  64 | 
  65 | function generateRandomBoard() {
  66 |     const grid = Array(GRID_SIZE * GRID_SIZE).fill(null);
  67 |     for (const size of SHIP_SIZES) {
  68 |         let placed = false;
  69 |         for (let attempt = 0; attempt < 300 && !placed; attempt++) {
  70 |             const orientation = Math.random() < 0.5 ? 'h' : 'v';
  71 |             const row = randomInt(0, GRID_SIZE - 1);
  72 |             const col = randomInt(0, GRID_SIZE - 1);
  73 |             if (!canPlaceShip(grid, row, col, size, orientation)) continue;
  74 |             for (let i = 0; i < size; i++) {
  75 |                 const r = orientation === 'h' ? row : row + i;
  76 |                 const c = orientation === 'h' ? col + i : col;
  77 |                 grid[r * GRID_SIZE + c] = 's';
  78 |             }
  79 |             placed = true;
  80 |         }
  81 |         if (!placed) {
  82 |             // Фоллбек: если вдруг не получилось (маловероятно), перегенерим всё.
  83 |             return generateRandomBoard();
  84 |         }
  85 |     }
  86 |     return grid;
  87 | }
  88 | 
  89 | /** Можно ли поставить корабль длины size в (row, col) с ориентацией orientation. Классические правила: корабли не касаются углами/сторонами. */
  90 | function canPlaceShip(grid, row, col, size, orientation) {
  91 |     const cellsToOccupy = [];
  92 |     for (let i = 0; i < size; i++) {
  93 |         const r = orientation === 'h' ? row : row + i;
  94 |         const c = orientation === 'h' ? col + i : col;
  95 |         if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
  96 |         if (grid[r * GRID_SIZE + c]) return false;
  97 |         cellsToOccupy.push(r * GRID_SIZE + c);
  98 |     }
  99 |     const occupySet = new Set(cellsToOccupy);
 100 |     for (const idx of cellsToOccupy) {
 101 |         const r = Math.floor(idx / GRID_SIZE);
 102 |         const c = idx % GRID_SIZE;
 103 |         for (let dr = -1; dr <= 1; dr++) {
 104 |             for (let dc = -1; dc <= 1; dc++) {
 105 |                 const nr = r + dr;
 106 |                 const nc = c + dc;
 107 |                 if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) continue;
 108 |                 const nIdx = nr * GRID_SIZE + nc;
 109 |                 if (occupySet.has(nIdx)) continue;
 110 |                 if (grid[nIdx]) return false;
 111 |             }
 112 |         }
 113 |     }
 114 |     return true;
 115 | }
 116 | 
 117 | function resetTimer() {
 118 |     if (state.timerInterval) clearInterval(state.timerInterval);
 119 |     let time = 10;
 120 |     setBattleTimer(time);
 121 |     state.timerInterval = setInterval(() => {
 122 |         time--;
 123 |         setBattleTimer(time);
 124 |         if (time <= 0) clearInterval(state.timerInterval);
 125 |     }, 1000);
 126 | }
 127 | 
 128 | export function createBattle() {
 129 |     // Текущая кнопка — "игра с другом" (friend).
 130 |     return createGame('friend', false);
 131 | }
 132 | 
 133 | /**
 134 |  * Создать игру. mode: friend | random, ranked: boolean.
 135 |  */
 136 | export async function createGame(mode = 'friend', ranked = false) {
 137 |     if (!state.user) {
 138 |         showScreen('screen-register');
 139 |         return;
 140 |     }
 141 |     
 142 |     // Проверка минимального рейтинга для ranked-игры
 143 |     if (ranked) {
 144 |         const userRating = state.user.rating || ECONOMY.START_RATING;
 145 |         if (userRating < ECONOMY.MIN_RATING_FOR_RANKED) {
 146 |             const msg = TEXTS[state.lang]?.error_low_rating || TEXTS.en.error_low_rating;
 147 |             showToast(msg, 'error', 5000);
 148 |             return;
 149 |         }
 150 |     }
 151 |     
 152 |     try {
 153 |         resetGameState();
 154 |         const gameId = 'game_' + Date.now();
 155 |         state.gameId = gameId;
 156 |         state.mode = mode;
 157 |         state.ranked = ranked;
 158 |         const weather = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
 159 |         state.weather = weather;
 160 | 
 161 |         await setGame(gameId, {
 162 |             status: 'waiting',
 163 |             mode,
 164 |             ranked,
 165 |             weather,
 166 |             createdAt: Date.now(),
 167 |             players: {
 168 |                 host: state.user.uid,
 169 |                 guest: null
 170 |             },
 171 |             turn: null
 172 |         });
 173 | 
 174 |         const linkInput = document.getElementById('share-link-input');
 175 |         const linkArea = document.getElementById('game-link-area');
 176 |         if (linkInput) linkInput.value = `https://t.me/morskoy_boyyy_bot?startapp=${gameId}`;
 177 |         if (linkArea) linkArea.classList.remove('hidden');
 178 | 
 179 |         onGame(gameId, game => {
 180 |             if (game && game.players && game.players.guest) startGamePlacement();
 181 |         });
 182 |     } catch (e) {
 183 |         console.error('Create battle failed:', e);
 184 |         const msg = TEXTS[state.lang]?.error_create_battle || TEXTS.en.error_create_battle;
 185 |         showToast(msg, 'error');
 186 |     }
 187 | }
 188 | 
 189 | /**
 190 |  * Постановка в очередь random-матчей. Используется для честного PvP и игры против бота.
 191 |  */
 192 | export async function queueRandom() {
 193 |     if (!state.user) {
 194 |         showScreen('screen-register');
 195 |         return;
 196 |     }
 197 |     
 198 |     // Проверка минимального рейтинга для ranked-игры
 199 |     const userRating = state.user.rating || ECONOMY.START_RATING;
 200 |     if (userRating < ECONOMY.MIN_RATING_FOR_RANKED) {
 201 |         const msg = TEXTS[state.lang]?.error_low_rating || TEXTS.en.error_low_rating;
 202 |         showToast(msg, 'error', 5000);
 203 |         return;
 204 |     }
 205 |     
 206 |     try {
 207 |         resetGameState();
 208 |         state.mode = 'random';
 209 |         state.ranked = true;
 210 | 
 211 |         // Запускаем экран поиска
 212 |         state.matchmaking.active = true;
 213 |         state.matchmaking.cancelled = false;
 214 |         state.matchmaking.timer = 10;
 215 |         showScreen('screen-matchmaking');
 216 |         const timerEl = document.getElementById('matchmaking-timer');
 217 |         if (timerEl) timerEl.textContent = String(state.matchmaking.timer);
 218 |         if (state.matchmaking.intervalId) clearInterval(state.matchmaking.intervalId);
 219 |         state.matchmaking.intervalId = setInterval(() => {
 220 |             if (!state.matchmaking.active) {
 221 |                 clearInterval(state.matchmaking.intervalId);
 222 |                 state.matchmaking.intervalId = null;
 223 |                 return;
 224 |             }
 225 |             state.matchmaking.timer = Math.max(0, state.matchmaking.timer - 1);
 226 |             if (timerEl) timerEl.textContent = String(state.matchmaking.timer);
 227 |         }, 1000);
 228 | 
 229 |         const result = await matchmakingService.queueRandom(state.user);
 230 | 
 231 |         // Если за время ожидания пользователь отменил поиск — не стартуем матч.
 232 |         if (state.matchmaking.cancelled) {
 233 |             state.matchmaking.active = false;
 234 |             if (state.matchmaking.intervalId) {
 235 |                 clearInterval(state.matchmaking.intervalId);
 236 |                 state.matchmaking.intervalId = null;
 237 |             }
 238 |             return;
 239 |         }
 240 | 
 241 |         state.gameId = result.gameId;
 242 | 
 243 |         const game = await getGame(result.gameId);
 244 |         if (game && game.players && game.players.guest && String(game.players.guest).startsWith('bot:')) {
 245 |             const diff = String(game.players.guest).split(':')[1] || 'normal';
 246 |             state.botState.difficulty = diff;
 247 |             const msgKey =
 248 |                 diff === 'easy'
 249 |                     ? 'matchmaking_vs_bot_easy'
 250 |                     : diff === 'hard'
 251 |                     ? 'matchmaking_vs_bot_hard'
 252 |                     : 'matchmaking_vs_bot_normal';
 253 |             const msg = TEXTS[state.lang]?.[msgKey] || TEXTS.en[msgKey];
 254 |             if (msg) showToast(msg, 'info');
 255 |         }
 256 | 
 257 |         state.matchmaking.active = false;
 258 |         if (state.matchmaking.intervalId) {
 259 |             clearInterval(state.matchmaking.intervalId);
 260 |             state.matchmaking.intervalId = null;
 261 |         }
 262 | 
 263 |         // Переход к расстановке
 264 |         startGamePlacement();
 265 |     } catch (e) {
 266 |         console.error('Random matchmaking failed:', e);
 267 |         const msg = TEXTS[state.lang]?.error_matchmaking || TEXTS.en.error_matchmaking;
 268 |         showToast(msg, 'error');
 269 |     }
 270 | }
 271 | 
 272 | export function cancelMatchmaking() {
 273 |     if (!state.matchmaking.active) {
 274 |         showScreen('screen-dashboard');
 275 |         return;
 276 |     }
 277 |     state.matchmaking.cancelled = true;
 278 |     state.matchmaking.active = false;
 279 |     if (state.matchmaking.intervalId) {
 280 |         clearInterval(state.matchmaking.intervalId);
 281 |         state.matchmaking.intervalId = null;
 282 |     }
 283 |     showScreen('screen-dashboard');
 284 | }
 285 | 
 286 | export async function joinGame(gameId) {
 287 |     resetGameState();
 288 |     state.gameId = gameId;
 289 |     const game = await getGame(gameId);
 290 |     if (!game || !game.players || !game.players.host) return;
 291 |     state.mode = game.mode || 'friend';
 292 |     state.ranked = !!game.ranked;
 293 |     state.weather = game.weather || 'calm';
 294 | 
 295 |     await updateGame(gameId, {
 296 |         status: 'placement',
 297 |         players: {
 298 |             host: game.players.host,
 299 |             guest: state.user.uid
 300 |         }
 301 |     });
 302 |     startGamePlacement();
 303 | }
 304 | 
 305 | export function startGamePlacement() {
 306 |     showScreen('screen-placement');
 307 |     renderPlacementGrid(placeCurrentShip);
 308 |     renderShipSelector();
 309 | }
 310 | 
 311 | export function rotateShip() {
 312 |     state.orientation = state.orientation === 'h' ? 'v' : 'h';
 313 |     const tg = getTg();
 314 |     if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
 315 | }
 316 | 
 317 | export function placeCurrentShip(idx) {
 318 |     if (state.shipsToPlace.length === 0) return;
 319 |     const size = state.shipsToPlace[0];
 320 |     const row = Math.floor(idx / GRID_SIZE);
 321 |     const col = idx % GRID_SIZE;
 322 | 
 323 |     if (!canPlaceShip(state.grid, row, col, size, state.orientation)) return;
 324 | 
 325 |     const cellsToOccupy = [];
 326 |     for (let i = 0; i < size; i++) {
 327 |         const r = state.orientation === 'h' ? row : row + i;
 328 |         const c = state.orientation === 'h' ? col + i : col;
 329 |         cellsToOccupy.push(r * GRID_SIZE + c);
 330 |     }
 331 | 
 332 |     cellsToOccupy.forEach(i => (state.grid[i] = 's'));
 333 |     state.shipsToPlace.shift();
 334 |     state.ships.push({ cells: cellsToOccupy, hits: 0 });
 335 | 
 336 |     renderPlacementGrid(placeCurrentShip);
 337 |     renderShipSelector();
 338 | 
 339 |     if (state.shipsToPlace.length === 0) {
 340 |         const btn = document.getElementById('btn-ready');
 341 |         if (btn) {
 342 |             btn.disabled = false;
 343 |             btn.style.opacity = '1';
 344 |         }
 345 |     }
 346 |     const tg = getTg();
 347 |     if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
 348 | }
 349 | 
 350 | export async function confirmPlacement() {
 351 |     const btn = document.getElementById('btn-ready');
 352 |     if (btn) btn.textContent = 'WAITING...';
 353 | 
 354 |     await setPlayerData(state.gameId, state.user.uid, {
 355 |         grid: state.grid,
 356 |         ready: true
 357 |     });
 358 | 
 359 |     // Подготовим серверное представление кораблей для PvP: boards/{uid}/ships, totalShipCells, hitsCount=0
 360 |     const shipsMap = {};
 361 |     let cellsTotal = 0;
 362 |     state.ships.forEach(ship => {
 363 |         (ship.cells || []).forEach(idx => {
 364 |             const key = String(idx);
 365 |             shipsMap[key] = true;
 366 |             cellsTotal += 1;
 367 |         });
 368 |     });
 369 |     if (cellsTotal > 0) {
 370 |         const updates = {};
 371 |         updates['boards/' + state.user.uid] = {
 372 |             ships: shipsMap,
 373 |             totalShipCells: cellsTotal,
 374 |             hitsCount: 0,
 375 |             shots: {}
 376 |         };
 377 |         await updateGame(state.gameId, updates);
 378 |     }
 379 | 
 380 |     // Если игра против бота — начинаем сразу после готовности игрока.
 381 |     const game = await getGame(state.gameId);
 382 |     if (game && game.players && isBotGuest(game.players.guest)) {
 383 |         initBattleBot(game);
 384 |         return;
 385 |     }
 386 | 
 387 |     onPlayers(state.gameId, players => {
 388 |         if (players && Object.keys(players).length === 2) {
 389 |             const allReady = Object.values(players).every(p => p && p.ready);
 390 |             if (allReady) initBattle(players);
 391 |         }
 392 |     });
 393 | }
 394 | 
 395 | function initBattle(players) {
 396 |     offPlayers(state.gameId);
 397 |     offGame(state.gameId);
 398 |     showScreen('screen-battle');
 399 |     const pIds = Object.keys(players);
 400 |     const firstTurn = pIds[Math.floor(Math.random() * 2)];
 401 |     updateGame(state.gameId, { turn: firstTurn, status: 'battle' });
 402 | 
 403 |     renderBattleGrids(shoot);
 404 | 
 405 |     onGame(state.gameId, handleGameUpdate);
 406 |     onDisconnected(state.gameId, disconnected => {
 407 |         if (!disconnected) return;
 408 |         const oppIds = pIds.filter(id => id !== state.user.uid);
 409 |         const oppLeft = oppIds.some(oppId => disconnected[oppId]);
 410 |         if (oppLeft) {
 411 |             showOpponentLeftMessage();
 412 |             offGame(state.gameId);
 413 |             offDisconnected(state.gameId);
 414 |             showScreen('screen-dashboard');
 415 |         }
 416 |     });
 417 | 
 418 |     resetTimer();
 419 | }
 420 | 
 421 | async function initBattleBot(game) {
 422 |     offPlayers(state.gameId);
 423 |     offGame(state.gameId);
 424 |     showScreen('screen-battle');
 425 | 
 426 |     const difficulty = getBotDifficultyFromGuest(game.players.guest);
 427 |     state.botState.difficulty = difficulty;
 428 |     botPlayer = new BotPlayer(difficulty);
 429 | 
 430 |     // Генерируем поле бота один раз и сохраняем в игре (только для bot-матчей).
 431 |     // Важно: это не "античит" (в идеале скрывать), но позволяет реализовать бой без серверного кода.
 432 |     const botBoard = game.botBoard || generateRandomBoard();
 433 |     const updates = {
 434 |         status: 'battle',
 435 |         // turn: либо игрок, либо бот
 436 |         turn: Math.random() < 0.5 ? state.user.uid : BOT_UID,
 437 |         botBoard,
 438 |         playerShots: game.playerShots || {},
 439 |         botShots: game.botShots || {},
 440 |         playerHitsCount: game.playerHitsCount || 0,
 441 |         botHitsCount: game.botHitsCount || 0,
 442 |         finished: false
 443 |     };
 444 |     await updateGame(state.gameId, updates);
 445 | 
 446 |     renderBattleGrids(shoot);
 447 |     onGame(state.gameId, handleGameUpdate);
 448 |     resetTimer();
 449 | }
 450 | 
 451 | function handleGameUpdate(game) {
 452 |     if (!game) return;
 453 | 
 454 |     if (game.status === 'finished' || game.finished) {
 455 |         const msg = TEXTS[state.lang]?.match_finished || TEXTS.en.match_finished;
 456 |         showToast(msg, 'success');
 457 |         if (state.user && state.gameId) {
 458 |             // Применяем экономику, статы и ачивки (каждый сервис сам защищён от повторов).
 459 |             matchResultService.applyForUser(state.gameId, game, state.user.uid).catch(() => {});
 460 |             statsService.recordMatch(state.gameId, game).catch(() => {});
 461 |             achievementsService.updateForUser(state.gameId, game, state.user.uid).catch(() => {});
 462 |         }
 463 |         offGame(state.gameId);
 464 |         offDisconnected(state.gameId);
 465 |         showScreen('screen-dashboard');
 466 |         return;
 467 |     }
 468 | 
 469 |     const isMyTurn = game.turn === state.user.uid;
 470 |     const turnText = isMyTurn ? TEXTS[state.lang].your_turn : TEXTS[state.lang].enemy_turn;
 471 |     setTurnIndicator(turnText, isMyTurn);
 472 | 
 473 |     if (isMyTurn) {
 474 |         const tg = getTg();
 475 |         if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
 476 |     }
 477 | 
 478 |     if (game.lastShot) {
 479 |         if (game.lastShot.shooter === state.user.uid) {
 480 |             setEnemyCellClass(game.lastShot.idx, game.lastShot.isHit ? 'hit' : 'miss');
 481 |             if (game.lastShot.isHit) {
 482 |                 const tg = getTg();
 483 |                 if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('heavy');
 484 |             } else if (getTg() && getTg().HapticFeedback) getTg().HapticFeedback.notificationOccurred('error');
 485 |         } else {
 486 |             updateGridVisuals(game.lastShot);
 487 |             if (state.grid[game.lastShot.idx]) showShake();
 488 |         }
 489 |     }
 490 | 
 491 |     resetTimer();
 492 | 
 493 |     // Если это bot-матч и сейчас ход бота — планируем ход.
 494 |     if (game.players && isBotGuest(game.players.guest) && game.turn === BOT_UID) {
 495 |         scheduleBotMove(game).catch(e => console.warn('Bot move error', e));
 496 |     }
 497 | }
 498 | 
 499 | export async function shoot(idx) {
 500 |     const game = await getGame(state.gameId);
 501 |     if (!game || game.turn !== state.user.uid) {
 502 |         const tg = getTg();
 503 |         if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
 504 |         return;
 505 |     }
 506 | 
 507 |     const opponentId = game.players && game.players.host === state.user.uid
 508 |         ? game.players.guest
 509 |         : game.players.host;
 510 |     if (!opponentId) return;
 511 | 
 512 |     // Ветка "против бота"
 513 |     if (isBotGuest(opponentId)) {
 514 |         const playerShots = game.playerShots || {};
 515 |         if (playerShots[String(idx)]) return; // уже стреляли
 516 | 
 517 |         const botBoard = game.botBoard;
 518 |         if (!botBoard) return;
 519 |         const isHit = botBoard[idx] === 's';
 520 | 
 521 |         const nextTurn = isHit ? state.user.uid : BOT_UID;
 522 |         const newPlayerHits = (game.playerHitsCount || 0) + (isHit ? 1 : 0);
 523 |         const finished = newPlayerHits >= TOTAL_SHIP_CELLS;
 524 | 
 525 |         const updates = {
 526 |             turn: finished ? null : nextTurn,
 527 |             lastShot: { idx, isHit, shooter: state.user.uid },
 528 |             lastShotAt: Date.now(),
 529 |             playerShots: { ...playerShots, [String(idx)]: isHit ? 'hit' : 'miss' },
 530 |             playerHitsCount: newPlayerHits
 531 |         };
 532 | 
 533 |         if (finished) {
 534 |             updates.status = 'finished';
 535 |             updates.finished = true;
 536 |             updates.result = {
 537 |                 winner: state.user.uid,
 538 |                 loser: BOT_UID,
 539 |                 finishedAt: Date.now(),
 540 |                 botGame: true
 541 |             };
 542 |         }
 543 | 
 544 |         await updateGame(state.gameId, updates);
 545 | 
 546 |         // локальная отрисовка
 547 |         setEnemyCellClass(idx, isHit ? 'hit' : 'miss');
 548 | 
 549 |         return;
 550 |     }
 551 | 
 552 |     // Ветка PvP: сервер сам решает, было ли попадание, и завершает матч при необходимости.
 553 |     const result = await runShootTransaction(state.gameId, state.user.uid, opponentId, idx);
 554 |     if (!result || !result.committed) return;
 555 | }
 556 | 
 557 | let botMoveInFlight = false;
 558 | async function scheduleBotMove(game) {
 559 |     if (botMoveInFlight) return;
 560 |     botMoveInFlight = true;
 561 |     try {
 562 |         // задержка 1–3 секунды
 563 |         await sleep(randomInt(1000, 3000));
 564 | 
 565 |         const fresh = await getGame(state.gameId);
 566 |         if (!fresh || fresh.turn !== BOT_UID || fresh.finished || fresh.status === 'finished') return;
 567 | 
 568 |         const botShots = fresh.botShots || {};
 569 |         const myShotsArray = Array(GRID_SIZE * GRID_SIZE).fill(null);
 570 |         for (const [k, v] of Object.entries(botShots)) {
 571 |             const i = parseInt(k, 10);
 572 |             if (!Number.isNaN(i)) myShotsArray[i] = v;
 573 |         }
 574 | 
 575 |         // Hunt targets: последние попадания бота по игроку
 576 |         const huntTargets = (fresh.botLastHits || []).slice(-3);
 577 | 
 578 |         const shotIdx = botPlayer.chooseShot({
 579 |             gridSize: GRID_SIZE,
 580 |             myShots: myShotsArray,
 581 |             huntTargets
 582 |         });
 583 |         if (shotIdx < 0) return;
 584 |         if (botShots[String(shotIdx)]) return;
 585 | 
 586 |         const isHit = state.grid[shotIdx] === 's';
 587 |         const nextTurn = isHit ? BOT_UID : state.user.uid;
 588 |         const newBotHits = (fresh.botHitsCount || 0) + (isHit ? 1 : 0);
 589 |         const finished = newBotHits >= TOTAL_SHIP_CELLS;
 590 | 
 591 |         const newBotLastHits = isHit ? [...(fresh.botLastHits || []), shotIdx] : (fresh.botLastHits || []);
 592 |         const updates = {
 593 |             turn: finished ? null : nextTurn,
 594 |             lastShot: { idx: shotIdx, isHit, shooter: BOT_UID },
 595 |             lastShotAt: Date.now(),
 596 |             botShots: { ...botShots, [String(shotIdx)]: isHit ? 'hit' : 'miss' },
 597 |             botHitsCount: newBotHits,
 598 |             botLastHits: newBotLastHits
 599 |         };
 600 | 
 601 |         if (finished) {
 602 |             updates.status = 'finished';
 603 |             updates.finished = true;
 604 |             updates.result = {
 605 |                 winner: BOT_UID,
 606 |                 loser: state.user.uid,
 607 |                 finishedAt: Date.now(),
 608 |                 botGame: true
 609 |             };
 610 |         }
 611 | 
 612 |         await updateGame(state.gameId, updates);
 613 |     } finally {
 614 |         botMoveInFlight = false;
 615 |     }
 616 | }
 617 | 
 618 | export function adminAddCurrency(type) {
 619 |     const uidEl = document.getElementById('admin-user-id');
 620 |     const amountEl = document.getElementById('admin-amount');
 621 |     const uid = uidEl && uidEl.value;
 622 |     const amount = amountEl ? parseInt(amountEl.value, 10) : 0;
 623 |     if (!uid || !amount) return;
 624 |     adminAddCoinsOrGems(uid, type, amount).then(() => {
 625 |         const msg = TEXTS[state.lang]?.admin_done || TEXTS.en.admin_done;
 626 |         showToast(msg, 'success');
 627 |     });
 628 | }
 629 | 
 630 | /** Загрузить данные для админ-панели (overview, matches, bans, logs). */
 631 | export async function loadAdminData() {
 632 |     try {
 633 |         const [activeGames, globalStats, activity, matches, bans, logs] = await Promise.all([
 634 |             getActiveGamesCount(),
 635 |             getGlobalStats(),
 636 |             getRecentActivity(),
 637 |             getRecentMatches(),
 638 |             getBans(),
 639 |             getAdminLogs()
 640 |         ]);
 641 | 
 642 |         const ag = document.getElementById('admin-active-games');
 643 |         const tg = document.getElementById('admin-total-games');
 644 |         const hw = document.getElementById('admin-human-wins');
 645 |         const bw = document.getElementById('admin-bot-wins');
 646 |         if (ag) ag.textContent = String(activeGames);
 647 |         if (tg) tg.textContent = String(globalStats.totalGames || 0);
 648 |         if (hw) hw.textContent = String(globalStats.humanWins || 0);
 649 |         if (bw) bw.textContent = String(globalStats.botWins || 0);
 650 | 
 651 |         const actList = document.getElementById('admin-activity-list');
 652 |         if (actList) {
 653 |             actList.innerHTML = '';
 654 |             const matchesText = TEXTS[state.lang]?.admin_matches || TEXTS.en.admin_matches;
 655 |             activity.forEach(a => {
 656 |                 const li = document.createElement('li');
 657 |                 li.textContent = `${a.bucket}: ${a.matches || 0} ${matchesText}`;
 658 |                 actList.appendChild(li);
 659 |             });
 660 |         }
 661 | 
 662 |         const matchesList = document.getElementById('admin-matches-list');
 663 |         if (matchesList) {
 664 |             matchesList.innerHTML = '';
 665 |             matches.forEach(m => {
 666 |                 const li = document.createElement('li');
 667 |                 const mode = m.mode || 'random';
 668 |                 const winner = m.winner || 'n/a';
 669 |                 const duration = Math.round((m.durationMs || 0) / 1000);
 670 |                 li.textContent = `${m.gameId} | ${mode} | winner: ${winner} | ${duration}s`;
 671 |                 matchesList.appendChild(li);
 672 |             });
 673 |         }
 674 | 
 675 |         const bansList = document.getElementById('admin-bans-list');
 676 |         if (bansList) {
 677 |             bansList.innerHTML = '';
 678 |             bans.forEach(b => {
 679 |                 const li = document.createElement('li');
 680 |                 li.className = 'flex items-center justify-between glass p-2 rounded';
 681 |                 const info = document.createElement('div');
 682 |                 info.className = 'flex-1';
 683 |                 const noReasonText = TEXTS[state.lang]?.admin_no_reason || TEXTS.en.admin_no_reason;
 684 |                 const reason = b.reason || noReasonText;
 685 |                 const date = new Date(b.timestamp || 0).toLocaleDateString();
 686 |                 info.textContent = `${b.uid}: ${reason} (${date})`;
 687 |                 li.appendChild(info);
 688 |                 const unbanBtn = document.createElement('button');
 689 |                 unbanBtn.className = 'btn-secondary px-2 py-1 rounded text-xs';
 690 |                 unbanBtn.textContent = TEXTS[state.lang]?.admin_unban || TEXTS.en.admin_unban;
 691 |                 unbanBtn.onclick = () => adminUnbanUser(b.uid);
 692 |                 li.appendChild(unbanBtn);
 693 |                 bansList.appendChild(li);
 694 |             });
 695 |         }
 696 | 
 697 |         const logsList = document.getElementById('admin-logs-list');
 698 |         if (logsList) {
 699 |             logsList.innerHTML = '';
 700 |             logs.forEach(l => {
 701 |                 const li = document.createElement('li');
 702 |                 li.textContent = `${new Date(l.timestamp || 0).toISOString()} | ${l.action} | ${JSON.stringify(l.payload || {})}`;
 703 |                 logsList.appendChild(li);
 704 |             });
 705 |         }
 706 |     } catch (e) {
 707 |         console.warn('Admin data load failed', e);
 708 |     }
 709 | }
 710 | 
 711 | /** Показать профиль игрока для админа: рейтинг, статы, ачивки, последние матчи. */
 712 | export async function adminViewProfile() {
 713 |     const uidEl = document.getElementById('admin-user-id');
 714 |     const profileBox = document.getElementById('admin-user-profile');
 715 |     if (!uidEl || !profileBox) return;
 716 |     const uid = uidEl.value.trim();
 717 |     if (!uid) return;
 718 | 
 719 |     try {
 720 |         const [user, matches] = await Promise.all([getUser(uid), getMatchesForUser(uid, 10)]);
 721 |         if (!user) {
 722 |             profileBox.classList.remove('hidden');
 723 |             profileBox.innerHTML = `<div>User not found</div>`;
 724 |             return;
 725 |         }
 726 |         const winrate = user.games ? Math.round((user.wins || 0) / user.games * 100) : 0;
 727 |         const achievements = Object.keys(user.achievements || {});
 728 | 
 729 |         const matchesHtml = matches
 730 |             .map(m => {
 731 |                 const mode = m.mode || 'random';
 732 |                 const ranked = m.ranked ? 'R' : 'C';
 733 |                 const youWinner = m.winner === uid ? 'W' : (m.loser === uid ? 'L' : '?');
 734 |                 const dur = Math.round((m.durationMs || 0) / 1000);
 735 |                 return `<li>${m.gameId} | ${mode}/${ranked} | ${youWinner} | ${dur}s</li>`;
 736 |             })
 737 |             .join('');
 738 | 
 739 |         profileBox.classList.remove('hidden');
 740 |         profileBox.innerHTML = `
 741 |             <div><strong>${user.nickname || uid}</strong> (uid: ${uid})</div>
 742 |             <div>Rating: ${user.rating || 0}</div>
 743 |             <div>Coins: ${user.coins || 0}</div>
 744 |             <div>Games: ${user.games || 0}, Wins: ${user.wins || 0}, Losses: ${user.losses || 0}, Winrate: ${winrate}%</div>
 745 |             <div>Best streak: ${user.bestWinStreak || 0}</div>
 746 |             <div>Achievements: ${achievements.length ? achievements.join(', ') : 'none'}</div>
 747 |             <div class="mt-2">
 748 |                 <div class="font-bold mb-1">Recent matches:</div>
 749 |                 <ul class="space-y-1">${matchesHtml || '<li>no matches</li>'}</ul>
 750 |             </div>
 751 |         `;
 752 |     } catch (e) {
 753 |         console.warn('Admin profile load failed', e);
 754 |     }
 755 | }
 756 | 
 757 | /** Загрузить лидерборды: рейтинг, винрейт (30+ игр), количество игр. */
 758 | export async function loadLeaderboards() {
 759 |     try {
 760 |         const [byRating, users] = await Promise.all([
 761 |             getTopByRating(50),
 762 |             getUsersForLeaderboards(200)
 763 |         ]);
 764 | 
 765 |         // Rating: уже отсортирован getTopByRating
 766 |         const ratingList = document.getElementById('lb-rating-list');
 767 |         if (ratingList) {
 768 |             ratingList.innerHTML = '';
 769 |             byRating.forEach((u, idx) => {
 770 |                 const li = document.createElement('li');
 771 |                 const wr = u.games ? Math.round((u.wins || 0) / u.games * 100) : 0;
 772 |                 li.textContent = `${idx + 1}. ${u.nickname || u.uid} — ${u.rating || 0} (${u.games || 0} games, ${wr}% winrate)`;
 773 |                 ratingList.appendChild(li);
 774 |             });
 775 |         }
 776 | 
 777 |         // Games: сортируем по количеству игр
 778 |         const usersByGames = [...users].sort((a, b) => (b.games || 0) - (a.games || 0)).slice(0, 50);
 779 |         const gamesList = document.getElementById('lb-games-list');
 780 |         if (gamesList) {
 781 |             gamesList.innerHTML = '';
 782 |             usersByGames.forEach((u, idx) => {
 783 |                 const wr = u.games ? Math.round((u.wins || 0) / u.games * 100) : 0;
 784 |                 const li = document.createElement('li');
 785 |                 li.textContent = `${idx + 1}. ${u.nickname || u.uid} — ${u.games || 0} games (${wr}% winrate)`;
 786 |                 gamesList.appendChild(li);
 787 |             });
 788 |         }
 789 | 
 790 |         // Winrate 30+: фильтруем пользователей с играми >= 30
 791 |         const with30 = users.filter(u => (u.games || 0) >= 30);
 792 |         const byWinrate = with30
 793 |             .map(u => ({
 794 |                 ...u,
 795 |                 winrate: u.games ? (u.wins || 0) / u.games : 0
 796 |             }))
 797 |             .sort((a, b) => b.winrate - a.winrate)
 798 |             .slice(0, 50);
 799 | 
 800 |         const winrateList = document.getElementById('lb-winrate-list');
 801 |         if (winrateList) {
 802 |             winrateList.innerHTML = '';
 803 |             byWinrate.forEach((u, idx) => {
 804 |                 const wr = Math.round(u.winrate * 100);
 805 |                 const li = document.createElement('li');
 806 |                 li.textContent = `${idx + 1}. ${u.nickname || u.uid} — ${wr}% (${u.wins || 0}/${u.games || 0})`;
 807 |                 winrateList.appendChild(li);
 808 |             });
 809 |         }
 810 |     } catch (e) {
 811 |         console.warn('Leaderboards load failed', e);
 812 |     }
 813 | }
 814 | 
 815 | export function showLeaderboardTab(tab) {
 816 |     const ratingPanel = document.getElementById('lb-panel-rating');
 817 |     const winratePanel = document.getElementById('lb-panel-winrate');
 818 |     const gamesPanel = document.getElementById('lb-panel-games');
 819 |     if (!ratingPanel || !winratePanel || !gamesPanel) return;
 820 | 
 821 |     ratingPanel.classList.add('hidden');
 822 |     winratePanel.classList.add('hidden');
 823 |     gamesPanel.classList.add('hidden');
 824 | 
 825 |     if (tab === 'rating') ratingPanel.classList.remove('hidden');
 826 |     else if (tab === 'winrate') winratePanel.classList.remove('hidden');
 827 |     else if (tab === 'games') gamesPanel.classList.remove('hidden');
 828 | }
 829 | 
 830 | export function showAdminTab(tab) {
 831 |     const overviewPanel = document.getElementById('admin-panel-overview');
 832 |     const matchesPanel = document.getElementById('admin-panel-matches');
 833 |     const bansPanel = document.getElementById('admin-panel-bans');
 834 |     const logsPanel = document.getElementById('admin-panel-logs');
 835 |     if (!overviewPanel || !matchesPanel || !bansPanel || !logsPanel) return;
 836 | 
 837 |     overviewPanel.classList.add('hidden');
 838 |     matchesPanel.classList.add('hidden');
 839 |     bansPanel.classList.add('hidden');
 840 |     logsPanel.classList.add('hidden');
 841 | 
 842 |     if (tab === 'overview') overviewPanel.classList.remove('hidden');
 843 |     else if (tab === 'matches') matchesPanel.classList.remove('hidden');
 844 |     else if (tab === 'bans') bansPanel.classList.remove('hidden');
 845 |     else if (tab === 'logs') logsPanel.classList.remove('hidden');
 846 | }
 847 | 
 848 | export async function adminBanUser() {
 849 |     if (!state.user) return;
 850 |     const uidEl = document.getElementById('admin-ban-uid');
 851 |     const reasonEl = document.getElementById('admin-ban-reason');
 852 |     const uid = uidEl && uidEl.value.trim();
 853 |     const reason = (reasonEl && reasonEl.value.trim()) || 'no reason';
 854 |     if (!uid) return;
 855 | 
 856 |     try {
 857 |         await setBan(uid, reason, state.user.uid);
 858 |         await logAdminAction(state.user.uid, 'BAN_USER', { targetUid: uid, reason });
 859 |         const msg = TEXTS[state.lang]?.admin_done || TEXTS.en.admin_done;
 860 |         showToast(msg, 'success');
 861 |         if (uidEl) uidEl.value = '';
 862 |         if (reasonEl) reasonEl.value = '';
 863 |         await loadAdminData();
 864 |     } catch (e) {
 865 |         console.error('Ban failed', e);
 866 |         showToast('Failed to ban user', 'error');
 867 |     }
 868 | }
 869 | 
 870 | export async function adminUnbanUser(uid) {
 871 |     if (!state.user || !uid) return;
 872 |     try {
 873 |         await clearBan(uid);
 874 |         await logAdminAction(state.user.uid, 'UNBAN_USER', { targetUid: uid });
 875 |         const msg = TEXTS[state.lang]?.admin_done || TEXTS.en.admin_done;
 876 |         showToast(msg, 'success');
 877 |         await loadAdminData();
 878 |     } catch (e) {
 879 |         console.error('Unban failed', e);
 880 |         showToast('Failed to unban user', 'error');
 881 |     }
 882 | }
 883 | 
 884 | /** Вызывать при уходе со страницы/закрытии мини-приложения — отметить дисконнект. */
 885 | export function notifyDisconnect() {
 886 |     if (state.gameId && state.user) {
 887 |         setPlayerDisconnected(state.gameId, state.user.uid).catch(() => {});
 888 |     }
 889 | }
```
---

<div id='file-8'></div>

## 8. js/main.js
> Lines: 181

```javascript
   1 | /**
   2 |  * Точка входа: инициализация, авто-логин, глобальные обработчики и Telegram Back Button.
   3 |  */
   4 | 
   5 | import { tryAutoLogin, getTg, bindRegisterButton } from './auth.js';
   6 | import { showScreen, setLanguage, setScreenChangeCallback, applyTranslations } from './ui.js';
   7 | import { shouldShowOnboarding, showOnboarding, initOnboardingHandlers } from './onboarding.js';
   8 | import { createBattle, joinGame, confirmPlacement, rotateShip, adminAddCurrency, notifyDisconnect, queueRandom, loadAdminData, adminViewProfile, cancelMatchmaking, loadLeaderboards, showLeaderboardTab, showAdminTab, adminBanUser, adminUnbanUser } from './game.js';
   9 | import { copyGameLink } from './ui.js';
  10 | import { state } from './state.js';
  11 | import { TEXTS } from './config.js';
  12 | import { initShop, buyAbility } from './economyController.js';
  13 | import { logClientError } from './database.js';
  14 | 
  15 | // Глобальные функции для onclick в HTML
  16 | window.showScreen = showScreen;
  17 | window.setLanguage = setLanguage;
  18 | window.createBattle = createBattle;
  19 | window.queueRandom = queueRandom;
  20 | window.copyGameLink = copyGameLink;
  21 | window.rotateShip = rotateShip;
  22 | window.confirmPlacement = confirmPlacement;
  23 | window.adminAddCurrency = adminAddCurrency;
  24 | window.buyAbility = buyAbility;
  25 | window.adminViewProfile = adminViewProfile;
  26 | window.cancelMatchmaking = cancelMatchmaking;
  27 | window.adminBanUser = adminBanUser;
  28 | window.adminUnbanUser = adminUnbanUser;
  29 | window.openLeaderboards = async function () {
  30 |     showScreen('screen-leaderboards');
  31 |     await loadLeaderboards();
  32 |     showLeaderboardTab('rating');
  33 | };
  34 | 
  35 | function setupTelegramBackButton() {
  36 |     const tg = getTg();
  37 |     if (!tg || !tg.BackButton) return;
  38 | 
  39 |     const screenHistory = [];
  40 | 
  41 |     setScreenChangeCallback(sid => {
  42 |         if (sid === 'screen-language') {
  43 |             screenHistory.length = 0;
  44 |             screenHistory.push(sid);
  45 |             tg.BackButton.hide();
  46 |         } else {
  47 |             if (screenHistory.length === 0) screenHistory.push('screen-language');
  48 |             screenHistory.push(sid);
  49 |             tg.BackButton.show();
  50 |         }
  51 |     });
  52 | 
  53 |     tg.BackButton.onClick(() => {
  54 |         if (screenHistory.length <= 1) {
  55 |             showScreen('screen-language');
  56 |             screenHistory.length = 0;
  57 |             screenHistory.push('screen-language');
  58 |             tg.BackButton.hide();
  59 |             return;
  60 |         }
  61 |         screenHistory.pop();
  62 |         const prev = screenHistory[screenHistory.length - 1];
  63 |         showScreen(prev);
  64 |     });
  65 | }
  66 | 
  67 | function setupDisconnectOnLeave() {
  68 |     const onLeave = () => {
  69 |         notifyDisconnect();
  70 |     };
  71 |     window.addEventListener('pagehide', onLeave);
  72 |     document.addEventListener('visibilitychange', () => {
  73 |         if (document.visibilityState === 'hidden') onLeave();
  74 |     });
  75 | }
  76 | 
  77 | function setupErrorLogging() {
  78 |     // Обработчик глобальных ошибок JavaScript
  79 |     window.onerror = function(message, source, lineno, colno, error) {
  80 |         const uid = state.user?.uid || null;
  81 |         logClientError(message, source, lineno, colno, error, uid);
  82 |         // Возвращаем false, чтобы браузер показал ошибку в консоли
  83 |         return false;
  84 |     };
  85 |     
  86 |     // Обработчик необработанных промисов
  87 |     window.addEventListener('unhandledrejection', function(event) {
  88 |         const uid = state.user?.uid || null;
  89 |         const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
  90 |         logClientError(
  91 |             `Unhandled Promise Rejection: ${event.reason}`,
  92 |             'promise',
  93 |             null,
  94 |             null,
  95 |             error,
  96 |             uid
  97 |         );
  98 |     });
  99 | }
 100 | 
 101 | async function init() {
 102 |     try {
 103 |         getTg();
 104 |     } catch (e) {}
 105 |     
 106 |     // Настраиваем логирование ошибок
 107 |     setupErrorLogging();
 108 | 
 109 |     const savedLang = localStorage.getItem('lang');
 110 |     if (savedLang && (savedLang === 'en' || savedLang === 'ru')) {
 111 |         state.lang = savedLang;
 112 |         document.querySelectorAll('[data-key]').forEach(el => {
 113 |             const key = el.getAttribute('data-key');
 114 |             if (TEXTS[savedLang] && TEXTS[savedLang][key]) {
 115 |                 if (el.tagName === 'INPUT') el.placeholder = TEXTS[savedLang][key];
 116 |                 else el.textContent = TEXTS[savedLang][key];
 117 |             }
 118 |         });
 119 |     }
 120 | 
 121 |     initOnboardingHandlers();
 122 |     
 123 |     const loggedIn = await tryAutoLogin();
 124 |     if (loggedIn) {
 125 |         applyTranslations();
 126 |         const params = new URLSearchParams(window.location.search);
 127 |         const joinGameId = params.get('startapp');
 128 |         if (joinGameId) await joinGame(joinGameId);
 129 |     } else {
 130 |         // Проверяем, нужно ли показать onboarding
 131 |         if (shouldShowOnboarding()) {
 132 |             showOnboarding();
 133 |             applyTranslations();
 134 |         } else {
 135 |             showScreen('screen-language');
 136 |         }
 137 |     }
 138 | 
 139 |     bindRegisterButton();
 140 |     setupTelegramBackButton();
 141 |     setupDisconnectOnLeave();
 142 |     initShop();
 143 | 
 144 |     const adminBtn = document.getElementById('admin-btn');
 145 |     if (adminBtn) {
 146 |         adminBtn.addEventListener('click', () => {
 147 |             loadAdminData();
 148 |             showAdminTab('overview');
 149 |         });
 150 |     }
 151 | 
 152 |     // Переключатель табов админки
 153 |     const adminTabOverview = document.getElementById('admin-tab-overview');
 154 |     const adminTabMatches = document.getElementById('admin-tab-matches');
 155 |     const adminTabBans = document.getElementById('admin-tab-bans');
 156 |     const adminTabLogs = document.getElementById('admin-tab-logs');
 157 |     if (adminTabOverview && adminTabMatches && adminTabBans && adminTabLogs) {
 158 |         adminTabOverview.addEventListener('click', () => showAdminTab('overview'));
 159 |         adminTabMatches.addEventListener('click', () => showAdminTab('matches'));
 160 |         adminTabBans.addEventListener('click', () => {
 161 |             showAdminTab('bans');
 162 |             loadAdminData();
 163 |         });
 164 |         adminTabLogs.addEventListener('click', () => {
 165 |             showAdminTab('logs');
 166 |             loadAdminData();
 167 |         });
 168 |     }
 169 | 
 170 |     // Локальный переключатель табов лидербордов
 171 |     const lbRating = document.getElementById('lb-tab-rating');
 172 |     const lbWinrate = document.getElementById('lb-tab-winrate');
 173 |     const lbGames = document.getElementById('lb-tab-games');
 174 |     if (lbRating && lbWinrate && lbGames) {
 175 |         lbRating.addEventListener('click', () => showLeaderboardTab('rating'));
 176 |         lbWinrate.addEventListener('click', () => showLeaderboardTab('winrate'));
 177 |         lbGames.addEventListener('click', () => showLeaderboardTab('games'));
 178 |     }
 179 | }
 180 | 
 181 | init().catch(e => console.error('Init error:', e));
```
---

<div id='file-9'></div>

## 9. js/onboarding.js
> Lines: 104

```javascript
   1 | /**
   2 |  * Onboarding система: показывает слайды при первом входе.
   3 |  */
   4 | 
   5 | import { state } from './state.js';
   6 | import { TEXTS } from './config.js';
   7 | import { showScreen, applyTranslations } from './ui.js';
   8 | 
   9 | let currentSlide = 1;
  10 | const TOTAL_SLIDES = 3;
  11 | 
  12 | export function shouldShowOnboarding() {
  13 |     return !localStorage.getItem('onboarding_shown');
  14 | }
  15 | 
  16 | export function markOnboardingShown() {
  17 |     localStorage.setItem('onboarding_shown', 'true');
  18 | }
  19 | 
  20 | export function showOnboarding() {
  21 |     currentSlide = 1;
  22 |     showScreen('screen-onboarding');
  23 |     updateOnboardingUI();
  24 |     // Применить переводы к элементам onboarding
  25 |     applyTranslations();
  26 | }
  27 | 
  28 | function updateOnboardingUI() {
  29 |     // Показать текущий слайд
  30 |     for (let i = 1; i <= TOTAL_SLIDES; i++) {
  31 |         const slide = document.getElementById(`onboarding-slide-${i}`);
  32 |         const dot = document.getElementById(`onboarding-dot-${i}`);
  33 |         if (slide) {
  34 |             if (i === currentSlide) {
  35 |                 slide.classList.remove('hidden');
  36 |             } else {
  37 |                 slide.classList.add('hidden');
  38 |             }
  39 |         }
  40 |         if (dot) {
  41 |             if (i === currentSlide) {
  42 |                 dot.classList.remove('bg-white/30');
  43 |                 dot.classList.add('bg-cyan-400');
  44 |             } else {
  45 |                 dot.classList.remove('bg-cyan-400');
  46 |                 dot.classList.add('bg-white/30');
  47 |             }
  48 |         }
  49 |     }
  50 | 
  51 |     // Обновить кнопки
  52 |     const nextBtn = document.getElementById('onboarding-next');
  53 |     const startBtn = document.getElementById('onboarding-start');
  54 |     const skipBtn = document.getElementById('onboarding-skip');
  55 |     
  56 |     if (currentSlide === TOTAL_SLIDES) {
  57 |         if (nextBtn) nextBtn.classList.add('hidden');
  58 |         if (startBtn) startBtn.classList.remove('hidden');
  59 |     } else {
  60 |         if (nextBtn) nextBtn.classList.remove('hidden');
  61 |         if (startBtn) startBtn.classList.add('hidden');
  62 |     }
  63 | }
  64 | 
  65 | export function nextOnboardingSlide() {
  66 |     if (currentSlide < TOTAL_SLIDES) {
  67 |         currentSlide++;
  68 |         updateOnboardingUI();
  69 |     }
  70 | }
  71 | 
  72 | export function skipOnboarding() {
  73 |     markOnboardingShown();
  74 |     showScreen('screen-language');
  75 | }
  76 | 
  77 | export function finishOnboarding() {
  78 |     markOnboardingShown();
  79 |     showScreen('screen-language');
  80 | }
  81 | 
  82 | export function initOnboardingHandlers() {
  83 |     const nextBtn = document.getElementById('onboarding-next');
  84 |     const startBtn = document.getElementById('onboarding-start');
  85 |     const skipBtn = document.getElementById('onboarding-skip');
  86 |     
  87 |     if (nextBtn) {
  88 |         nextBtn.addEventListener('click', () => {
  89 |             nextOnboardingSlide();
  90 |         });
  91 |     }
  92 |     
  93 |     if (startBtn) {
  94 |         startBtn.addEventListener('click', () => {
  95 |             finishOnboarding();
  96 |         });
  97 |     }
  98 |     
  99 |     if (skipBtn) {
 100 |         skipBtn.addEventListener('click', () => {
 101 |             skipOnboarding();
 102 |         });
 103 |     }
 104 | }
```
---

<div id='file-10'></div>

## 10. js/services.js
> Lines: 423

```javascript
   1 | /**
   2 |  * Сервисный слой: матчмейкинг, экономика, бот, статистика.
   3 |  * Ориентирован на SOLID: каждый класс отвечает за одну зону ответственности.
   4 |  */
   5 | 
   6 | import { ECONOMY, ABILITIES, WEATHER_TYPES } from './config.js';
   7 | import {
   8 |     getDb,
   9 |     enterMatchmakingQueue,
  10 |     leaveMatchmakingQueue,
  11 |     getMatchmakingQueue,
  12 |     getUser,
  13 |     setUser,
  14 |     incrementGlobalStats
  15 | } from './database.js';
  16 | 
  17 | /**
  18 |  * MatchmakingService
  19 |  * Отвечает за постановку в очередь, поиск соперника и создание игр (включая бота).
  20 |  */
  21 | export class MatchmakingService {
  22 |     constructor({ ratingDelta = 100, botWaitMs = 10000 } = {}) {
  23 |         this.ratingDelta = ratingDelta;
  24 |         this.botWaitMs = botWaitMs;
  25 |     }
  26 | 
  27 |     /**
  28 |      * Поставить игрока в очередь и попытаться найти соперника.
  29 |      * Возвращает { type: 'player', gameId } или { type: 'bot', gameId }.
  30 |      */
  31 |     async queueRandom(user) {
  32 |         await enterMatchmakingQueue(user.uid, user.rating);
  33 |         const start = Date.now();
  34 | 
  35 |         while (Date.now() - start < this.botWaitMs) {
  36 |             const match = await this.tryFindOpponent(user);
  37 |             if (match) {
  38 |                 return { type: 'player', gameId: match.gameId };
  39 |             }
  40 |             await new Promise(r => setTimeout(r, 1500));
  41 |         }
  42 | 
  43 |         // Не нашли соперника — играем против бота
  44 |         await leaveMatchmakingQueue(user.uid);
  45 |         const gameId = await this.createBotGame(user);
  46 |         return { type: 'bot', gameId };
  47 |     }
  48 | 
  49 |     async tryFindOpponent(user) {
  50 |         const queue = await getMatchmakingQueue();
  51 |         const entries = Object.entries(queue);
  52 |         if (entries.length === 0) return null;
  53 | 
  54 |         let best = null;
  55 |         let bestDiff = Number.MAX_SAFE_INTEGER;
  56 | 
  57 |         for (const [uid, info] of entries) {
  58 |             if (uid === user.uid) continue;
  59 |             const rating = info.rating || ECONOMY.START_RATING;
  60 |             const diff = Math.abs(rating - (user.rating || ECONOMY.START_RATING));
  61 |             if (diff <= this.ratingDelta && diff < bestDiff) {
  62 |                 best = { uid, rating };
  63 |                 bestDiff = diff;
  64 |             }
  65 |         }
  66 | 
  67 |         if (!best) return null;
  68 | 
  69 |         const gameId = 'game_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  70 |         const hostUid = user.uid < best.uid ? user.uid : best.uid;
  71 |         const guestUid = user.uid < best.uid ? best.uid : user.uid;
  72 |         const weather = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
  73 | 
  74 |         const gameRef = getDb().ref('games/' + gameId);
  75 |         await gameRef.set({
  76 |             status: 'waiting',
  77 |             mode: 'random',
  78 |             ranked: true,
  79 |             weather,
  80 |             createdAt: Date.now(),
  81 |             players: {
  82 |                 host: hostUid,
  83 |                 guest: guestUid
  84 |             },
  85 |             turn: null
  86 |         });
  87 | 
  88 |         await Promise.all([leaveMatchmakingQueue(user.uid), leaveMatchmakingQueue(best.uid)]);
  89 | 
  90 |         return { gameId };
  91 |     }
  92 | 
  93 |     /**
  94 |      * Создать игру против бота. Сложность зависит от рейтинга игрока.
  95 |      */
  96 |     async createBotGame(user) {
  97 |         const rating = user.rating || ECONOMY.START_RATING;
  98 |         let difficulty = 'normal';
  99 |         if (rating < 500) difficulty = 'easy';
 100 |         else if (rating > 1500) difficulty = 'hard';
 101 | 
 102 |         const gameId = 'game_bot_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
 103 |         const weather = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
 104 | 
 105 |         await getDb()
 106 |             .ref('games/' + gameId)
 107 |             .set({
 108 |                 status: 'waiting',
 109 |                 mode: 'random',
 110 |                 ranked: true,
 111 |                 weather,
 112 |                 createdAt: Date.now(),
 113 |                 players: {
 114 |                     host: user.uid,
 115 |                     guest: `bot:${difficulty}`
 116 |                 },
 117 |                 turn: null,
 118 |                 bot: {
 119 |                     difficulty,
 120 |                     searchMode: 'search'
 121 |                 }
 122 |             });
 123 | 
 124 |         return gameId;
 125 |     }
 126 | }
 127 | 
 128 | /**
 129 |  * BotPlayer
 130 |  * Не видит корабли напрямую, использует вероятностную карту.
 131 |  */
 132 | export class BotPlayer {
 133 |     constructor(difficulty = 'normal') {
 134 |         this.difficulty = difficulty; // easy | normal | hard
 135 |         this.errorChance = this.computeErrorChance(difficulty);
 136 |     }
 137 | 
 138 |     computeErrorChance(diff) {
 139 |         if (diff === 'easy') return 0.3;
 140 |         if (diff === 'hard') return 0.08;
 141 |         return 0.15;
 142 |     }
 143 | 
 144 |     /**
 145 |      * Выбор клетки для выстрела.
 146 |      * gameView: { gridSize, myShots[ idx: 'hit'|'miss'|null ], huntTargets: number[] }
 147 |      */
 148 |     chooseShot(gameView) {
 149 |         const { gridSize, myShots, huntTargets } = gameView;
 150 |         const size = gridSize * gridSize;
 151 |         const scores = new Array(size).fill(0);
 152 | 
 153 |         // Базовая вероятность — выше в центре
 154 |         for (let i = 0; i < size; i++) {
 155 |             if (myShots[i]) continue;
 156 |             const row = Math.floor(i / gridSize);
 157 |             const col = i % gridSize;
 158 |             const centerDist = Math.abs(row - gridSize / 2) + Math.abs(col - gridSize / 2);
 159 |             scores[i] += Math.max(0, gridSize - centerDist);
 160 |         }
 161 | 
 162 |         // Hunt режим: усиливаем клетки вокруг последних попаданий
 163 |         for (const hitIdx of huntTargets || []) {
 164 |             const row = Math.floor(hitIdx / gridSize);
 165 |             const col = hitIdx % gridSize;
 166 |             const neighbors = [
 167 |                 [row - 1, col],
 168 |                 [row + 1, col],
 169 |                 [row, col - 1],
 170 |                 [row, col + 1]
 171 |             ];
 172 |             for (const [r, c] of neighbors) {
 173 |                 if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) continue;
 174 |                 const idx = r * gridSize + c;
 175 |                 if (myShots[idx]) continue;
 176 |                 scores[idx] += 20;
 177 |             }
 178 |         }
 179 | 
 180 |         // Небольшой шум случайности
 181 |         for (let i = 0; i < size; i++) {
 182 |             if (myShots[i]) continue;
 183 |             scores[i] += Math.random() * 5;
 184 |         }
 185 | 
 186 |         // Сортируем индексы по убыванию оценки
 187 |         const candidates = [...Array(size).keys()].filter(i => !myShots[i]);
 188 |         candidates.sort((a, b) => scores[b] - scores[a]);
 189 | 
 190 |         if (candidates.length === 0) return -1;
 191 | 
 192 |         // Ошибка: иногда выбираем не лучший выстрел
 193 |         const rnd = Math.random();
 194 |         if (rnd < this.errorChance && candidates.length > 3) {
 195 |             const randomBadIndex = Math.min(
 196 |                 candidates.length - 1,
 197 |                 3 + Math.floor(Math.random() * (candidates.length - 3))
 198 |             );
 199 |             return candidates[randomBadIndex];
 200 |         }
 201 | 
 202 |         return candidates[0];
 203 |     }
 204 | }
 205 | 
 206 | /**
 207 |  * EconomyService
 208 |  * Отвечает за экономику (покупка способностей, награды за матчи).
 209 |  */
 210 | export class EconomyService {
 211 |     async purchaseAbility(uid, abilityId) {
 212 |         const def = ABILITIES[abilityId];
 213 |         if (!def) throw new Error('Unknown ability: ' + abilityId);
 214 |         const user = await getUser(uid);
 215 |         if (!user) throw new Error('User not found');
 216 | 
 217 |         const cost = def.cost;
 218 |         const coins = user.coins ?? ECONOMY.START_COINS;
 219 |         if (coins < cost) throw new Error('Not enough coins');
 220 | 
 221 |         const newCoins = coins - cost;
 222 |         const currentCount = (user.abilities && user.abilities[abilityId]) || 0;
 223 |         const newCount = currentCount + 1;
 224 | 
 225 |         await setUser(uid, {
 226 |             coins: newCoins,
 227 |             abilities: {
 228 |                 ...(user.abilities || {}),
 229 |                 [abilityId]: newCount
 230 |             }
 231 |         });
 232 | 
 233 |         return { coins: newCoins, count: newCount };
 234 |     }
 235 | }
 236 | 
 237 | /**
 238 |  * MatchResultService
 239 |  * Применяет результаты матча (рейтинг, монеты, статы, глобальная аналитика).
 240 |  */
 241 | export class MatchResultService {
 242 |     /**
 243 |      * Применить результат матча к одному пользователю.
 244 |      * game: объект games/{gameId}, uid: auth.uid игрока.
 245 |      */
 246 |     async applyForUser(gameId, game, uid) {
 247 |         if (!game || !game.result) return;
 248 | 
 249 |         const user = await getUser(uid);
 250 |         if (!user) return;
 251 | 
 252 |         // защита от повторной обработки
 253 |         if (user.lastGameId === gameId) return;
 254 | 
 255 |         const ranked = !!game.ranked;
 256 |         const isWinner = game.result.winner === uid;
 257 |         const isLoser = game.result.loser === uid;
 258 | 
 259 |         if (!isWinner && !isLoser) return;
 260 | 
 261 |         let rating = user.rating ?? ECONOMY.START_RATING;
 262 |         let coins = user.coins ?? ECONOMY.START_COINS;
 263 |         let wins = user.wins ?? 0;
 264 |         let losses = user.losses ?? 0;
 265 |         let gamesPlayed = user.games ?? 0;
 266 | 
 267 |         if (ranked) {
 268 |             if (isWinner) {
 269 |                 rating += ECONOMY.RANKED_WIN_RATING_DELTA;
 270 |             } else if (isLoser) {
 271 |                 rating = Math.max(ECONOMY.MIN_RATING, rating + ECONOMY.RANKED_LOSS_RATING_DELTA);
 272 |             }
 273 |         }
 274 | 
 275 |         if (isWinner) {
 276 |             coins += ECONOMY.RANKED_WIN_COINS;
 277 |             wins += 1;
 278 |         } else if (isLoser) {
 279 |             coins += ECONOMY.RANKED_LOSS_COINS;
 280 |             losses += 1;
 281 |         }
 282 |         gamesPlayed += 1;
 283 | 
 284 |         await setUser(uid, {
 285 |             rating,
 286 |             coins,
 287 |             wins,
 288 |             losses,
 289 |             games: gamesPlayed,
 290 |             lastGameId: gameId,
 291 |             lastGameAt: game.result.finishedAt || Date.now()
 292 |         });
 293 | 
 294 |         const botGame = !!game.result.botGame;
 295 |         if (botGame) {
 296 |             await incrementGlobalStats({
 297 |                 totalGamesDelta: 1,
 298 |                 humanWinsDelta: isWinner ? 1 : 0,
 299 |                 botWinsDelta: isLoser ? 1 : 0
 300 |             });
 301 |         } else {
 302 |             await incrementGlobalStats({ totalGamesDelta: 1 });
 303 |         }
 304 |     }
 305 | }
 306 | 
 307 | /**
 308 |  * StatsService
 309 |  * Отвечает за запись matchHistory и агрегированную активность по часам.
 310 |  */
 311 | export class StatsService {
 312 |     getHourBucket(timestamp) {
 313 |         const d = new Date(timestamp);
 314 |         const Y = d.getUTCFullYear();
 315 |         const M = String(d.getUTCMonth() + 1).padStart(2, '0');
 316 |         const D = String(d.getUTCDate()).padStart(2, '0');
 317 |         const H = String(d.getUTCHours()).padStart(2, '0');
 318 |         return `${Y}-${M}-${D}-${H}`;
 319 |     }
 320 | 
 321 |     async recordMatch(gameId, game) {
 322 |         if (!game || !game.result) return;
 323 |         const db = getDb();
 324 | 
 325 |         // Если матч уже записан в историю — ничего не делаем (идемпотентность).
 326 |         const historyRef = db.ref('matchHistory/' + gameId);
 327 |         const snap = await historyRef.once('value');
 328 |         if (snap.exists()) return;
 329 | 
 330 |         const createdAt = game.createdAt || Date.now();
 331 |         const finishedAt = game.result.finishedAt || Date.now();
 332 |         const durationMs = Math.max(0, finishedAt - createdAt);
 333 | 
 334 |         const summary = {
 335 |             createdAt,
 336 |             finishedAt,
 337 |             mode: game.mode || 'random',
 338 |             ranked: !!game.ranked,
 339 |             weather: game.weather || 'calm',
 340 |             players: game.players || {},
 341 |             winner: game.result.winner,
 342 |             loser: game.result.loser,
 343 |             botGame: !!game.result.botGame,
 344 |             durationMs
 345 |         };
 346 | 
 347 |         await historyRef.set(summary);
 348 | 
 349 |         // Активность по часам
 350 |         const bucket = this.getHourBucket(finishedAt);
 351 |         const actRef = db.ref('stats/activity/' + bucket);
 352 |         await actRef.transaction(current => {
 353 |             const cur = current || {};
 354 |             return {
 355 |                 onlineCount: cur.onlineCount || 0, // можно обновлять отдельно
 356 |                 matches: (cur.matches || 0) + 1
 357 |             };
 358 |         });
 359 |     }
 360 | }
 361 | 
 362 | /**
 363 |  * AchievementsService
 364 |  * Простая система ачивок: без способностей, быстрый матч, серия побед.
 365 |  */
 366 | export class AchievementsService {
 367 |     async updateForUser(gameId, game, uid) {
 368 |         if (!game || !game.result) return;
 369 |         const user = await getUser(uid);
 370 |         if (!user) return;
 371 | 
 372 |         const achievements = user.achievements || {};
 373 |         let changed = false;
 374 | 
 375 |         const isWinner = game.result.winner === uid;
 376 | 
 377 |         // Победа без способностей
 378 |         if (isWinner) {
 379 |             const used = game.abilitiesUsed && game.abilitiesUsed[uid];
 380 |             if (!used || Object.keys(used).length === 0) {
 381 |                 if (!achievements.no_abilities_win) {
 382 |                     achievements.no_abilities_win = true;
 383 |                     changed = true;
 384 |                 }
 385 |             }
 386 |         }
 387 | 
 388 |         // Быстрая победа: < 10 ходов (для матчей против бота)
 389 |         if (isWinner && game.result.botGame) {
 390 |             const playerShots = game.playerShots ? Object.keys(game.playerShots).length : 0;
 391 |             const botShots = game.botShots ? Object.keys(game.botShots).length : 0;
 392 |             if (playerShots + botShots < 10) {
 393 |                 if (!achievements.fast_win) {
 394 |                     achievements.fast_win = true;
 395 |                     changed = true;
 396 |                 }
 397 |             }
 398 |         }
 399 | 
 400 |         // Серия побед (5 и более)
 401 |         let streak = user.currentWinStreak || 0;
 402 |         let bestStreak = user.bestWinStreak || 0;
 403 |         if (isWinner) {
 404 |             streak += 1;
 405 |             if (streak > bestStreak) bestStreak = streak;
 406 |             if (streak >= 5 && !achievements.win_streak_5) {
 407 |                 achievements.win_streak_5 = true;
 408 |                 changed = true;
 409 |             }
 410 |         } else {
 411 |             streak = 0;
 412 |         }
 413 | 
 414 |         if (changed || streak !== user.currentWinStreak || bestStreak !== user.bestWinStreak) {
 415 |             await setUser(uid, {
 416 |                 achievements,
 417 |                 currentWinStreak: streak,
 418 |                 bestWinStreak: bestStreak
 419 |             });
 420 |         }
 421 |     }
 422 | }
 423 | 
```
---

<div id='file-11'></div>

## 11. js/state.js
> Lines: 78

```javascript
   1 | /**
   2 |  * Глобальное состояние приложения.
   3 |  * Здесь нет бизнес-логики — только кэш текущего пользователя и матча.
   4 |  */
   5 | 
   6 | import { GRID_SIZE, SHIP_SIZES } from './config.js';
   7 | 
   8 | export const state = {
   9 |     lang: 'en',
  10 |     /**
  11 |      * user: {
  12 |      *   uid: string,
  13 |      *   telegramId: number | null,
  14 |      *   nickname: string,
  15 |      *   rating: number,
  16 |      *   coins: number,
  17 |      *   wins: number,
  18 |      *   losses: number,
  19 |      *   games: number,
  20 |      *   banned: boolean,
  21 |      *   abilities: Record<string, number>
  22 |      * }
  23 |      */
  24 |     user: null,
  25 | 
  26 |     gameId: null,
  27 | 
  28 |     // Локальное представление своей доски и кораблей
  29 |     grid: Array(GRID_SIZE * GRID_SIZE).fill(null),
  30 |     ships: [],
  31 |     currentShipSize: 4,
  32 |     orientation: 'h',
  33 |     shipsToPlace: [...SHIP_SIZES],
  34 | 
  35 |     // Вражеская сетка (для отрисовки попаданий/промахов)
  36 |     enemyGrid: Array(GRID_SIZE * GRID_SIZE).fill(null),
  37 | 
  38 |     // Текущие параметры боя
  39 |     timerInterval: null,
  40 |     weather: 'calm',
  41 |     ranked: false,
  42 |     mode: 'friend', // friend | random
  43 |     opponent: null, // { uid, nickname, rating, isBot, botDifficulty }
  44 | 
  45 |     // Локальная карта вероятностей для бота (используем только в клиентах, которые двигают бота)
  46 |     botState: {
  47 |         difficulty: 'normal', // easy | normal | hard
  48 |         mode: 'search',       // search | hunt
  49 |         lastHits: []          // список индексов последних попаданий
  50 |     },
  51 | 
  52 |     // Матчмейкинг
  53 |     matchmaking: {
  54 |         active: false,
  55 |         cancelled: false,
  56 |         timer: 0,
  57 |         intervalId: null
  58 |     }
  59 | };
  60 | 
  61 | /** Сброс состояния игры (сетка, корабли, бой) для новой партии. */
  62 | export function resetGameState() {
  63 |     state.gameId = null;
  64 |     state.grid = Array(GRID_SIZE * GRID_SIZE).fill(null);
  65 |     state.ships = [];
  66 |     state.shipsToPlace = [...SHIP_SIZES];
  67 |     state.enemyGrid = Array(GRID_SIZE * GRID_SIZE).fill(null);
  68 |     state.weather = 'calm';
  69 |     state.ranked = false;
  70 |     state.mode = 'friend';
  71 |     state.opponent = null;
  72 |     state.botState = { difficulty: 'normal', mode: 'search', lastHits: [] };
  73 |     state.matchmaking = { active: false, cancelled: false, timer: 0, intervalId: null };
  74 |     if (state.timerInterval) {
  75 |         clearInterval(state.timerInterval);
  76 |         state.timerInterval = null;
  77 |     }
  78 | }
```
---

<div id='file-12'></div>

## 12. js/ui.js
> Lines: 184

```javascript
   1 | /**
   2 |  * Переключение экранов, локализация, отрисовка кнопок и сеток.
   3 |  */
   4 | 
   5 | import { state } from './state.js';
   6 | import { TEXTS } from './config.js';
   7 | import { getTg } from './auth.js';
   8 | import { setUser } from './database.js';
   9 | 
  10 | let onScreenChange = null;
  11 | export function setScreenChangeCallback(cb) {
  12 |     onScreenChange = cb;
  13 | }
  14 | 
  15 | export function showScreen(id) {
  16 |     const fullId = id && id.startsWith('screen-') ? id : 'screen-' + id;
  17 |     document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  18 |     const el = document.getElementById(fullId);
  19 |     if (el) el.classList.add('active');
  20 |     if (onScreenChange) onScreenChange(fullId);
  21 | }
  22 | 
  23 | /** Применить текущий язык ко всем элементам с data-key. */
  24 | export function applyTranslations() {
  25 |     const lang = state.lang;
  26 |     document.querySelectorAll('[data-key]').forEach(el => {
  27 |         const key = el.getAttribute('data-key');
  28 |         if (TEXTS[lang] && TEXTS[lang][key]) {
  29 |             if (el.tagName === 'INPUT') el.placeholder = TEXTS[lang][key];
  30 |             else el.textContent = TEXTS[lang][key];
  31 |         }
  32 |     });
  33 | }
  34 | 
  35 | export function setLanguage(lang) {
  36 |     state.lang = lang;
  37 |     localStorage.setItem('lang', lang);
  38 |     applyTranslations();
  39 | 
  40 |     showScreen('screen-register');
  41 |     if (state.user) {
  42 |         showScreen('screen-dashboard');
  43 |         setUser(state.user.uid, { language: lang }).catch(() => {});
  44 |     }
  45 | }
  46 | 
  47 | export function updateDash() {
  48 |     if (!state.user) return;
  49 |     const nameEl = document.getElementById('user-display-name');
  50 |     const coinsEl = document.getElementById('dash-coins');
  51 |     const winsEl = document.getElementById('dash-wins');
  52 |     const winrateEl = document.getElementById('dash-winrate');
  53 |     if (nameEl) nameEl.textContent = state.user.nickname;
  54 |     if (coinsEl) coinsEl.textContent = state.user.coins;
  55 |     if (winsEl) winsEl.textContent = state.user.wins;
  56 |     if (winrateEl) winrateEl.textContent = state.user.games ? Math.round((state.user.wins / state.user.games) * 100) + '%' : '0%';
  57 | }
  58 | 
  59 | export function renderPlacementGrid(onCellClick) {
  60 |     const grid = document.getElementById('placement-grid');
  61 |     if (!grid) return;
  62 |     grid.innerHTML = '';
  63 |     state.grid.forEach((val, idx) => {
  64 |         const cell = document.createElement('div');
  65 |         cell.className = 'cell ' + (val ? 'ship' : '');
  66 |         cell.onclick = () => onCellClick(idx);
  67 |         grid.appendChild(cell);
  68 |     });
  69 | }
  70 | 
  71 | export function renderShipSelector() {
  72 |     const div = document.getElementById('ship-selector');
  73 |     if (!div) return;
  74 |     div.innerHTML = state.shipsToPlace.map(() => '<div class="w-4 h-4 bg-cyan-400 rounded-sm"></div>').join('');
  75 | }
  76 | 
  77 | export function renderBattleGrids(onShootClick) {
  78 |     const eGrid = document.getElementById('enemy-grid');
  79 |     const mGrid = document.getElementById('my-grid');
  80 |     if (eGrid) {
  81 |         eGrid.innerHTML = '';
  82 |         eGrid.classList.add('fog-of-war');
  83 |         for (let i = 0; i < state.grid.length; i++) {
  84 |             const cell = document.createElement('div');
  85 |             cell.className = 'cell';
  86 |             cell.dataset.idx = i;
  87 |             cell.onclick = () => onShootClick(i);
  88 |             eGrid.appendChild(cell);
  89 |         }
  90 |     }
  91 |     if (mGrid) {
  92 |         mGrid.innerHTML = '';
  93 |         state.grid.forEach(val => {
  94 |             const cell = document.createElement('div');
  95 |             cell.className = 'cell ' + (val ? 'ship' : '');
  96 |             mGrid.appendChild(cell);
  97 |         });
  98 |     }
  99 | }
 100 | 
 101 | /** Обновить свою сетку после выстрела противника. */
 102 | export function updateGridVisuals(shot) {
 103 |     const myGrid = document.getElementById('my-grid');
 104 |     if (!myGrid || shot.idx < 0 || shot.idx >= myGrid.children.length) return;
 105 |     const cell = myGrid.children[shot.idx];
 106 |     const isShip = state.grid[shot.idx];
 107 |     cell.className = 'cell ' + (isShip ? 'ship hit' : 'miss');
 108 | }
 109 | 
 110 | export function setEnemyCellClass(idx, className) {
 111 |     const cell = document.querySelector(`#enemy-grid .cell[data-idx="${idx}"]`);
 112 |     if (cell) cell.className = 'cell ' + className;
 113 | }
 114 | 
 115 | export function setMyGridCellClass(idx, className) {
 116 |     const myGrid = document.getElementById('my-grid');
 117 |     if (!myGrid) return;
 118 |     const cell = myGrid.children[idx];
 119 |     if (cell) cell.className = 'cell ' + className;
 120 | }
 121 | 
 122 | export function showShake() {
 123 |     document.body.classList.add('shake');
 124 |     setTimeout(() => document.body.classList.remove('shake'), 500);
 125 | }
 126 | 
 127 | export function copyGameLink() {
 128 |     const input = document.getElementById('share-link-input');
 129 |     if (!input) return;
 130 |     input.select();
 131 |     input.setSelectionRange(0, 99999);
 132 |     try {
 133 |         navigator.clipboard.writeText(input.value);
 134 |         const tg = getTg();
 135 |         if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
 136 |     } catch (e) {}
 137 | }
 138 | 
 139 | export function setTurnIndicator(text, isMyTurn) {
 140 |     const el = document.getElementById('turn-indicator');
 141 |     if (el) {
 142 |         el.textContent = text;
 143 |         el.style.color = isMyTurn ? '#00ffff' : '#ff00ff';
 144 |     }
 145 | }
 146 | 
 147 | export function setBattleTimer(seconds) {
 148 |     const el = document.getElementById('battle-timer');
 149 |     if (el) el.textContent = seconds;
 150 | }
 151 | 
 152 | export function showOpponentLeftMessage() {
 153 |     const key = state.lang === 'ru' ? 'opponent_left' : 'opponent_left';
 154 |     const msg = TEXTS[state.lang]?.opponent_left || 'Opponent left the game';
 155 |     showToast(msg, 'info');
 156 | }
 157 | 
 158 | /**
 159 |  * Показать toast-уведомление (замена alert).
 160 |  * @param {string} message - Текст сообщения
 161 |  * @param {string} type - Тип: 'success', 'error', 'info' (по умолчанию 'info')
 162 |  * @param {number} duration - Длительность в мс (по умолчанию 3000)
 163 |  */
 164 | export function showToast(message, type = 'info', duration = 3000) {
 165 |     const container = document.getElementById('toast-container');
 166 |     if (!container) return;
 167 | 
 168 |     const toast = document.createElement('div');
 169 |     toast.className = `toast toast-${type}`;
 170 |     
 171 |     const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
 172 |     toast.innerHTML = `<span style="font-weight: bold; color: ${type === 'success' ? 'var(--neon-cyan)' : type === 'error' ? '#ff4444' : 'var(--neon-blue)'}">${icon}</span><span>${message}</span>`;
 173 |     
 174 |     container.appendChild(toast);
 175 | 
 176 |     setTimeout(() => {
 177 |         toast.classList.add('toast-exit');
 178 |         setTimeout(() => {
 179 |             if (toast.parentNode) {
 180 |                 toast.parentNode.removeChild(toast);
 181 |             }
 182 |         }, 300);
 183 |     }, duration);
 184 | }
```
---

<div id='file-13'></div>

## 13. main.py
> Lines: 165

```python
   1 | import asyncio
   2 | import logging
   3 | import sys
   4 | import time
   5 | import os
   6 | import json
   7 | from pathlib import Path
   8 | from dotenv import load_dotenv
   9 | from aiogram import Bot, Dispatcher, types
  10 | from aiogram.filters import CommandStart, CommandObject
  11 | from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, FSInputFile
  12 | from aiogram.utils.markdown import hbold
  13 | 
  14 | # ⚙️ ЗАГРУЗКА НАСТРОЕК
  15 | load_dotenv()
  16 | 
  17 | BOT_TOKEN = os.getenv("BOT_TOKEN")
  18 | WEB_APP_URL = os.getenv("WEB_APP_URL")
  19 | WELCOME_IMAGE_PATH = os.getenv("WELCOME_IMAGE_PATH")
  20 | raw_admin_ids = os.getenv("ADMIN_IDS", "")
  21 | ADMIN_IDS = [int(i.strip()) for i in raw_admin_ids.split(",") if i.strip()]
  22 | 
  23 | # Файл для сохранения состояния (кэш, данные) при выключении бота
  24 | DB_PATH = Path(__file__).parent / "bot_state.json"
  25 | 
  26 | cached_welcome_file_id = None
  27 | 
  28 | # Подавить шумные логи aiogram при обрыве соединения
  29 | logging.basicConfig(
  30 |     level=logging.WARNING,
  31 |     format="%(levelname)s: %(message)s"
  32 | )
  33 | logging.getLogger("aiogram.dispatcher").setLevel(logging.WARNING)
  34 | 
  35 | bot = Bot(token=BOT_TOKEN)
  36 | dp = Dispatcher()
  37 | 
  38 | 
  39 | def load_db():
  40 |     """Загрузить состояние бота из файла (при старте)."""
  41 |     global cached_welcome_file_id
  42 |     try:
  43 |         if DB_PATH.exists():
  44 |             with open(DB_PATH, "r", encoding="utf-8") as f:
  45 |                 data = json.load(f)
  46 |                 cached_welcome_file_id = data.get("cached_welcome_file_id")
  47 |     except Exception as e:
  48 |         logging.warning(f"Не удалось загрузить bot_state.json: {e}")
  49 | 
  50 | 
  51 | def save_db():
  52 |     """Сохранить состояние бота в файл (при выключении/перезагрузке)."""
  53 |     try:
  54 |         data = {
  55 |             "cached_welcome_file_id": cached_welcome_file_id,
  56 |         }
  57 |         with open(DB_PATH, "w", encoding="utf-8") as f:
  58 |             json.dump(data, f, ensure_ascii=False, indent=2)
  59 |     except Exception as e:
  60 |         logging.warning(f"Не удалось сохранить bot_state.json: {e}")
  61 | 
  62 | 
  63 | async def show_loading_animation():
  64 |     print("🚀 Инициализация систем Naval Warfare...")
  65 |     toolbar_width = 40
  66 |     for i in range(toolbar_width + 1):
  67 |         time.sleep(0.03)
  68 |         progress = int((i / toolbar_width) * 100)
  69 |         bar = "█" * i + "-" * (toolbar_width - i)
  70 |         sys.stdout.write(f"\r[{bar}] {progress}% Загрузка модулей")
  71 |         sys.stdout.flush()
  72 |     print("\n✅ Система готова к бою!\n")
  73 | 
  74 | 
  75 | @dp.message(CommandStart())
  76 | async def command_start_handler(message: types.Message, command: CommandObject):
  77 |     global cached_welcome_file_id
  78 | 
  79 |     user_name = message.from_user.full_name
  80 |     start_arg = command.args
  81 | 
  82 |     if start_arg:
  83 |         final_url = f"{WEB_APP_URL}?startapp={start_arg}"
  84 |         button_text = "🚀 ПРИСОЕДИНИТЬСЯ К БОЮ"
  85 |     else:
  86 |         final_url = WEB_APP_URL
  87 |         button_text = "🎮 ИГРАТЬ В МОРСКОЙ БОЙ"
  88 | 
  89 |     keyboard = InlineKeyboardMarkup(inline_keyboard=[
  90 |         [InlineKeyboardButton(text=button_text, web_app=WebAppInfo(url=final_url))],
  91 |         [InlineKeyboardButton(text="📢 Чат тех поддержки", url="https://t.me/+TBA0Y-Cg3aU5M2Vi")]
  92 |     ])
  93 | 
  94 |     caption_text = (
  95 |         f"👋 Здравия желаю, {hbold(user_name)}!\n\n"
  96 |         f"⚓️ <b>NAVAL WARFARE 2077</b> — это морской бой нового поколения.\n\n"
  97 |         f"🔥 <b>Что тебя ждет:</b>\n"
  98 |         f"• Сражения с реальными игроками\n"
  99 |         f"• Система званий и рейтингов\n"
 100 |         f"• Эпические спецэффекты\n\n"
 101 |         f"👇 Жми кнопку ниже, чтобы развернуть флот!"
 102 |     )
 103 | 
 104 |     try:
 105 |         if cached_welcome_file_id:
 106 |             await message.answer_photo(
 107 |                 photo=cached_welcome_file_id,
 108 |                 caption=caption_text,
 109 |                 parse_mode="HTML",
 110 |                 reply_markup=keyboard
 111 |             )
 112 |         else:
 113 |             photo_file = FSInputFile(WELCOME_IMAGE_PATH)
 114 |             sent_message = await message.answer_photo(
 115 |                 photo=photo_file,
 116 |                 caption=caption_text,
 117 |                 parse_mode="HTML",
 118 |                 reply_markup=keyboard
 119 |             )
 120 |             cached_welcome_file_id = sent_message.photo[-1].file_id
 121 |             logging.info(f"Файл загружен и кэш сохранён. ID: {cached_welcome_file_id}")
 122 |     except Exception as e:
 123 |         logging.error(f"Ошибка при отправке фото: {e}")
 124 |         await message.answer(caption_text, parse_mode="HTML", reply_markup=keyboard)
 125 | 
 126 | 
 127 | async def on_startup():
 128 |     load_db()
 129 |     await show_loading_animation()
 130 |     for admin_id in ADMIN_IDS:
 131 |         try:
 132 |             await bot.send_message(admin_id, "✅ Бот запущен")
 133 |         except Exception as e:
 134 |             logging.error(f"Не удалось отправить сообщение админу {admin_id}: {e}")
 135 | 
 136 | 
 137 | async def on_shutdown():
 138 |     print("\n🛑 Останавливаю системы...")
 139 |     save_db()
 140 |     for admin_id in ADMIN_IDS:
 141 |         try:
 142 |             await bot.send_message(admin_id, "🛑 Бот остановлен", parse_mode="HTML")
 143 |         except Exception:
 144 |             pass
 145 |     print("Бот выключен.")
 146 | 
 147 | 
 148 | async def main():
 149 |     dp.startup.register(on_startup)
 150 |     dp.shutdown.register(on_shutdown)
 151 |     await bot.delete_webhook(drop_pending_updates=True)
 152 |     try:
 153 |         await dp.start_polling(bot)
 154 |     except asyncio.CancelledError:
 155 |         pass
 156 |     finally:
 157 |         await bot.session.close()
 158 | 
 159 | 
 160 | if __name__ == "__main__":
 161 |     try:
 162 |         asyncio.run(main())
 163 |     except KeyboardInterrupt:
 164 |         print("\n🛑 Остановка бота...")
 165 |         save_db()
```
---


================================================================================
SYSTEM INSTRUCTION: HOW TO MODIFY CODE (JSON FORMAT)
================================================================================
You are a coding assistant. To modify code, you MUST return the response strictly in JSON format.
Do not use old formats with separators. Use only the JSON structure described below.

👉 RESPONSE STRUCTURE (JSON):
Return a list of operations within a root array. Example:
```json
[
  {
    "action": "create",
    "path": "path/to/new_file.py",
    "content": "print('Hello World')\n"
  },
  {
    "action": "delete",
    "path": "path/to/obsolete_file.py"
  },
  {
    "action": "edit",
    "path": "path/to/existing_file.py",
    "operations": [
       {
         "type": "replace_lines",
         "start": 10, "end": 12,
         "content": "    new_code_here()\n    another_line()"
       },
       {
         "type": "replace_text",
         "find": "old_exact_string_code()",
         "replace": "new_exact_string_code()"
       }
    ]
  }
]
```

👉 OPERATIONS EXPLANATION:
1. **action: create** — Creates a new file (or overwrites it entirely). Requires 'content'.
2. **action: delete** — Deletes a file.
3. **action: edit** — Modifies an existing file. Requires 'operations' array.
   - **type: replace_lines**: Replaces lines from 'start' to 'end' (inclusive, 1-based numbering). Ideal if line numbers are enabled.
   - **type: insert_after_line**: Inserts 'content' strictly AFTER the specified 'line' number.
   - **type: replace_text**: Searches for an exact match of text 'find' and changes it to 'replace'. Pay attention to indentation.

IMPORTANT: When using 'replace_lines', ensure line numbers correspond to the current context.
⚠️ VERY IMPORTANT: Do not include neighboring lines (context) in 'content' if you have not changed them and have not included them in the 'start'-'end' range. This leads to code duplication!
