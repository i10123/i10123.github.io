/**
 * Логика расстановки кораблей и боя. Транзакции выстрелов, валидация расстановки, дисконнект.
 */

import { state, resetGameState } from './state.js';
import { GRID_SIZE, SHIP_SIZES, TEXTS } from './config.js';
import {
    setGame,
    updateGame,
    getGame,
    onGame,
    offGame,
    setPlayerData,
    onPlayers,
    offPlayers,
    runShootTransaction,
    setPlayerDisconnected,
    onDisconnected,
    offDisconnected,
    getPlayerData
} from './database.js';
import {
    showScreen,
    renderPlacementGrid,
    renderShipSelector,
    renderBattleGrids,
    updateGridVisuals,
    setEnemyCellClass,
    setTurnIndicator,
    setBattleTimer,
    showShake,
    showOpponentLeftMessage
} from './ui.js';
import { getTg } from './auth.js';
import { adminAddCoinsOrGems } from './database.js';

/** Можно ли поставить корабль длины size в (row, col) с ориентацией orientation. Классические правила: корабли не касаются углами/сторонами. */
function canPlaceShip(grid, row, col, size, orientation) {
    const cellsToOccupy = [];
    for (let i = 0; i < size; i++) {
        const r = orientation === 'h' ? row : row + i;
        const c = orientation === 'h' ? col + i : col;
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
        if (grid[r * GRID_SIZE + c]) return false;
        cellsToOccupy.push(r * GRID_SIZE + c);
    }
    const occupySet = new Set(cellsToOccupy);
    for (const idx of cellsToOccupy) {
        const r = Math.floor(idx / GRID_SIZE);
        const c = idx % GRID_SIZE;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) continue;
                const nIdx = nr * GRID_SIZE + nc;
                if (occupySet.has(nIdx)) continue;
                if (grid[nIdx]) return false;
            }
        }
    }
    return true;
}

function resetTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    let time = 10;
    setBattleTimer(time);
    state.timerInterval = setInterval(() => {
        time--;
        setBattleTimer(time);
        if (time <= 0) clearInterval(state.timerInterval);
    }, 1000);
}

export function createBattle() {
    return createGame();
}

export async function createGame() {
    if (!state.user) {
        showScreen('screen-register');
        return;
    }
    try {
        resetGameState();
        const gameId = 'game_' + Date.now();
        state.gameId = gameId;

        await setGame(gameId, {
            host: state.user.id,
            status: 'waiting',
            turn: null
        });

        const linkInput = document.getElementById('share-link-input');
        const linkArea = document.getElementById('game-link-area');
        if (linkInput) linkInput.value = `https://t.me/morskoy_boyyy_bot?startapp=${gameId}`;
        if (linkArea) linkArea.classList.remove('hidden');

        onGame(gameId, game => {
            if (game && game.guest) startGamePlacement();
        });
    } catch (e) {
        console.error('Create battle failed:', e);
        alert(state.lang === 'ru' ? 'Ошибка создания боя. Проверьте интернет.' : 'Failed to create battle. Check your connection.');
    }
}

export async function joinGame(gameId) {
    resetGameState();
    state.gameId = gameId;
    await updateGame(gameId, { guest: state.user.id, status: 'placement' });
    startGamePlacement();
}

export function startGamePlacement() {
    showScreen('screen-placement');
    renderPlacementGrid(placeCurrentShip);
    renderShipSelector();
}

export function rotateShip() {
    state.orientation = state.orientation === 'h' ? 'v' : 'h';
    const tg = getTg();
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

export function placeCurrentShip(idx) {
    if (state.shipsToPlace.length === 0) return;
    const size = state.shipsToPlace[0];
    const row = Math.floor(idx / GRID_SIZE);
    const col = idx % GRID_SIZE;

    if (!canPlaceShip(state.grid, row, col, size, state.orientation)) return;

    const cellsToOccupy = [];
    for (let i = 0; i < size; i++) {
        const r = state.orientation === 'h' ? row : row + i;
        const c = state.orientation === 'h' ? col + i : col;
        cellsToOccupy.push(r * GRID_SIZE + c);
    }

    cellsToOccupy.forEach(i => (state.grid[i] = 's'));
    state.shipsToPlace.shift();
    state.ships.push({ cells: cellsToOccupy, hits: 0 });

    renderPlacementGrid(placeCurrentShip);
    renderShipSelector();

    if (state.shipsToPlace.length === 0) {
        const btn = document.getElementById('btn-ready');
        if (btn) {
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }
    const tg = getTg();
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
}

export async function confirmPlacement() {
    const btn = document.getElementById('btn-ready');
    if (btn) btn.textContent = 'WAITING...';

    await setPlayerData(state.gameId, state.user.id, {
        grid: state.grid,
        ready: true
    });

    onPlayers(state.gameId, players => {
        if (players && Object.keys(players).length === 2) {
            const allReady = Object.values(players).every(p => p && p.ready);
            if (allReady) initBattle(players);
        }
    });
}

function initBattle(players) {
    offPlayers(state.gameId);
    offGame(state.gameId);
    showScreen('screen-battle');
    const pIds = Object.keys(players);
    const firstTurn = pIds[Math.floor(Math.random() * 2)];
    updateGame(state.gameId, { turn: firstTurn, status: 'battle' });

    renderBattleGrids(shoot);

    onGame(state.gameId, handleGameUpdate);
    onDisconnected(state.gameId, disconnected => {
        if (!disconnected) return;
        const oppIds = pIds.filter(id => id !== state.user.id);
        const oppLeft = oppIds.some(oppId => disconnected[oppId]);
        if (oppLeft) {
            showOpponentLeftMessage();
            offGame(state.gameId);
            offDisconnected(state.gameId);
            showScreen('screen-dashboard');
        }
    });

    resetTimer();
}

function handleGameUpdate(game) {
    if (!game) return;

    const isMyTurn = game.turn === state.user.id;
    const turnText = isMyTurn ? TEXTS[state.lang].your_turn : TEXTS[state.lang].enemy_turn;
    setTurnIndicator(turnText, isMyTurn);

    if (isMyTurn) {
        const tg = getTg();
        if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    }

    if (game.lastShot) {
        if (game.lastShot.shooter === state.user.id) {
            setEnemyCellClass(game.lastShot.idx, game.lastShot.isHit ? 'hit' : 'miss');
            if (game.lastShot.isHit) {
                const tg = getTg();
                if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('heavy');
            } else if (getTg() && getTg().HapticFeedback) getTg().HapticFeedback.notificationOccurred('error');
        } else {
            updateGridVisuals(game.lastShot);
            if (state.grid[game.lastShot.idx]) showShake();
        }
    }

    resetTimer();
}

export async function shoot(idx) {
    const game = await getGame(state.gameId);
    if (!game || game.turn !== state.user.id) {
        const tg = getTg();
        if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
        return;
    }

    const opponentId = game.host === state.user.id ? game.guest : game.host;
    if (!opponentId) return;

    const oppData = await getPlayerData(state.gameId, opponentId);
    if (!oppData || !oppData.grid) return;
    const isHit = oppData.grid[idx] === 's';

    const result = await runShootTransaction(state.gameId, state.user.id, opponentId, idx, isHit);
    if (!result || !result.committed) return;

    setEnemyCellClass(idx, isHit ? 'hit' : 'miss');
    if (isHit) {
        const tg = getTg();
        if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('heavy');
    } else {
        const tg = getTg();
        if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
    }
}

export function adminAddCurrency(type) {
    const uidEl = document.getElementById('admin-user-id');
    const amountEl = document.getElementById('admin-amount');
    const uid = uidEl && uidEl.value;
    const amount = amountEl ? parseInt(amountEl.value, 10) : 0;
    if (!uid || !amount) return;
    adminAddCoinsOrGems(uid, type, amount).then(() => alert('Done!'));
}

/** Вызывать при уходе со страницы/закрытии мини-приложения — отметить дисконнект. */
export function notifyDisconnect() {
    if (state.gameId && state.user) {
        setPlayerDisconnected(state.gameId, state.user.id).catch(() => {});
    }
}
