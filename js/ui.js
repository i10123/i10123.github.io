/**
 * Переключение экранов, локализация, отрисовка кнопок и сеток.
 */

import { state } from './state.js';
import { TEXTS } from './config.js';
import { getTg } from './auth.js';
import { setUser } from './database.js';

let onScreenChange = null;
export function setScreenChangeCallback(cb) {
    onScreenChange = cb;
}

export function showScreen(id) {
    const fullId = id && id.startsWith('screen-') ? id : 'screen-' + id;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(fullId);
    if (el) el.classList.add('active');
    if (onScreenChange) onScreenChange(fullId);
}

/** Применить текущий язык ко всем элементам с data-key. */
export function applyTranslations() {
    const lang = state.lang;
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (TEXTS[lang] && TEXTS[lang][key]) {
            if (el.tagName === 'INPUT') el.placeholder = TEXTS[lang][key];
            else el.textContent = TEXTS[lang][key];
        }
    });
}

export function setLanguage(lang) {
    state.lang = lang;
    localStorage.setItem('lang', lang);
    applyTranslations();

    showScreen('screen-register');
    if (state.user) {
        showScreen('screen-dashboard');
        setUser(state.user.id, { lang }).catch(() => {});
    }
}

export function updateDash() {
    if (!state.user) return;
    const nameEl = document.getElementById('user-display-name');
    const coinsEl = document.getElementById('dash-coins');
    const winsEl = document.getElementById('dash-wins');
    const winrateEl = document.getElementById('dash-winrate');
    if (nameEl) nameEl.textContent = state.user.nickname;
    if (coinsEl) coinsEl.textContent = state.user.coins;
    if (winsEl) winsEl.textContent = state.user.wins;
    if (winrateEl) winrateEl.textContent = state.user.games ? Math.round((state.user.wins / state.user.games) * 100) + '%' : '0%';
}

export function renderPlacementGrid(onCellClick) {
    const grid = document.getElementById('placement-grid');
    if (!grid) return;
    grid.innerHTML = '';
    state.grid.forEach((val, idx) => {
        const cell = document.createElement('div');
        cell.className = 'cell ' + (val ? 'ship' : '');
        cell.onclick = () => onCellClick(idx);
        grid.appendChild(cell);
    });
}

export function renderShipSelector() {
    const div = document.getElementById('ship-selector');
    if (!div) return;
    div.innerHTML = state.shipsToPlace.map(() => '<div class="w-4 h-4 bg-cyan-400 rounded-sm"></div>').join('');
}

export function renderBattleGrids(onShootClick) {
    const eGrid = document.getElementById('enemy-grid');
    const mGrid = document.getElementById('my-grid');
    if (eGrid) {
        eGrid.innerHTML = '';
        eGrid.classList.add('fog-of-war');
        for (let i = 0; i < state.grid.length; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.idx = i;
            cell.onclick = () => onShootClick(i);
            eGrid.appendChild(cell);
        }
    }
    if (mGrid) {
        mGrid.innerHTML = '';
        state.grid.forEach(val => {
            const cell = document.createElement('div');
            cell.className = 'cell ' + (val ? 'ship' : '');
            mGrid.appendChild(cell);
        });
    }
}

/** Обновить свою сетку после выстрела противника. */
export function updateGridVisuals(shot) {
    const myGrid = document.getElementById('my-grid');
    if (!myGrid || shot.idx < 0 || shot.idx >= myGrid.children.length) return;
    const cell = myGrid.children[shot.idx];
    const isShip = state.grid[shot.idx];
    cell.className = 'cell ' + (isShip ? 'ship hit' : 'miss');
}

export function setEnemyCellClass(idx, className) {
    const cell = document.querySelector(`#enemy-grid .cell[data-idx="${idx}"]`);
    if (cell) cell.className = 'cell ' + className;
}

export function setMyGridCellClass(idx, className) {
    const myGrid = document.getElementById('my-grid');
    if (!myGrid) return;
    const cell = myGrid.children[idx];
    if (cell) cell.className = 'cell ' + className;
}

export function showShake() {
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 500);
}

export function copyGameLink() {
    const input = document.getElementById('share-link-input');
    if (!input) return;
    input.select();
    input.setSelectionRange(0, 99999);
    try {
        navigator.clipboard.writeText(input.value);
        const tg = getTg();
        if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    } catch (e) {}
}

export function setTurnIndicator(text, isMyTurn) {
    const el = document.getElementById('turn-indicator');
    if (el) {
        el.textContent = text;
        el.style.color = isMyTurn ? '#00ffff' : '#ff00ff';
    }
}

export function setBattleTimer(seconds) {
    const el = document.getElementById('battle-timer');
    if (el) el.textContent = seconds;
}

export function showOpponentLeftMessage() {
    const key = state.lang === 'ru' ? 'opponent_left' : 'opponent_left';
    const msg = TEXTS[state.lang]?.opponent_left || 'Opponent left the game';
    alert(msg);
}
