/**
 * Логика расстановки кораблей и боя. Транзакции выстрелов, валидация расстановки, дисконнект.
 */

import { state, resetGameState } from './state.js';
import { GRID_SIZE, SHIP_SIZES, TEXTS, WEATHER_TYPES, ECONOMY } from './config.js';
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
import { MatchmakingService, BotPlayer, MatchResultService, StatsService, AchievementsService } from './services.js';
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
import { adminAddCoinsOrGems, getActiveGamesCount, getGlobalStats, getRecentActivity, getRecentMatches, getBans, getAdminLogs, getUser, getMatchesForUser, getTopByRating, getUsersForLeaderboards, setBan, clearBan, logAdminAction } from './database.js';

// Сервисы (единые инстансы)
const matchmakingService = new MatchmakingService();
let botPlayer = new BotPlayer('normal');
const matchResultService = new MatchResultService();
const statsService = new StatsService();
const achievementsService = new AchievementsService();

const BOT_UID = 'bot';
const TOTAL_SHIP_CELLS = SHIP_SIZES.reduce((a, b) => a + b, 0);

function isBotGuest(guestVal) {
    return typeof guestVal === 'string' && guestVal.startsWith('bot:');
}

function getBotDifficultyFromGuest(guestVal) {
    if (!isBotGuest(guestVal)) return 'normal';
    return String(guestVal).split(':')[1] || 'normal';
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomBoard() {
    const grid = Array(GRID_SIZE * GRID_SIZE).fill(null);
    for (const size of SHIP_SIZES) {
        let placed = false;
        for (let attempt = 0; attempt < 300 && !placed; attempt++) {
            const orientation = Math.random() < 0.5 ? 'h' : 'v';
            const row = randomInt(0, GRID_SIZE - 1);
            const col = randomInt(0, GRID_SIZE - 1);
            if (!canPlaceShip(grid, row, col, size, orientation)) continue;
            for (let i = 0; i < size; i++) {
                const r = orientation === 'h' ? row : row + i;
                const c = orientation === 'h' ? col + i : col;
                grid[r * GRID_SIZE + c] = 's';
            }
            placed = true;
        }
        if (!placed) {
            // Фоллбек: если вдруг не получилось (маловероятно), перегенерим всё.
            return generateRandomBoard();
        }
    }
    return grid;
}

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
    // Текущая кнопка — "игра с другом" (friend).
    return createGame('friend', false);
}

/**
 * Создать игру. mode: friend | random, ranked: boolean.
 */
export async function createGame(mode = 'friend', ranked = false) {
    if (!state.user) {
        showScreen('screen-register');
        return;
    }
    
    // Проверка минимального рейтинга для ranked-игры
    if (ranked) {
        const userRating = state.user.rating || ECONOMY.START_RATING;
        if (userRating < ECONOMY.MIN_RATING_FOR_RANKED) {
            const msg = TEXTS[state.lang]?.error_low_rating || TEXTS.en.error_low_rating;
            showToast(msg, 'error', 5000);
            return;
        }
    }
    
    try {
        resetGameState();
        const gameId = 'game_' + Date.now();
        state.gameId = gameId;
        state.mode = mode;
        state.ranked = ranked;
        const weather = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
        state.weather = weather;

        await setGame(gameId, {
            status: 'waiting',
            mode,
            ranked,
            weather,
            createdAt: Date.now(),
            players: {
                host: state.user.uid,
                guest: null
            },
            turn: null
        });

        const linkInput = document.getElementById('share-link-input');
        const linkArea = document.getElementById('game-link-area');
        if (linkInput) linkInput.value = `https://t.me/morskoy_boyyy_bot?startapp=${gameId}`;
        if (linkArea) linkArea.classList.remove('hidden');

        onGame(gameId, game => {
            if (game && game.players && game.players.guest) startGamePlacement();
        });
    } catch (e) {
        console.error('Create battle failed:', e);
        const msg = TEXTS[state.lang]?.error_create_battle || TEXTS.en.error_create_battle;
        showToast(msg, 'error');
    }
}

/**
 * Постановка в очередь random-матчей. Используется для честного PvP и игры против бота.
 */
export async function queueRandom() {
    if (!state.user) {
        showScreen('screen-register');
        return;
    }
    
    // Проверка минимального рейтинга для ranked-игры
    const userRating = state.user.rating || ECONOMY.START_RATING;
    if (userRating < ECONOMY.MIN_RATING_FOR_RANKED) {
        const msg = TEXTS[state.lang]?.error_low_rating || TEXTS.en.error_low_rating;
        showToast(msg, 'error', 5000);
        return;
    }
    
    try {
        resetGameState();
        state.mode = 'random';
        state.ranked = true;

        // Запускаем экран поиска
        state.matchmaking.active = true;
        state.matchmaking.cancelled = false;
        state.matchmaking.timer = 10;
        showScreen('screen-matchmaking');
        const timerEl = document.getElementById('matchmaking-timer');
        if (timerEl) timerEl.textContent = String(state.matchmaking.timer);
        if (state.matchmaking.intervalId) clearInterval(state.matchmaking.intervalId);
        state.matchmaking.intervalId = setInterval(() => {
            if (!state.matchmaking.active) {
                clearInterval(state.matchmaking.intervalId);
                state.matchmaking.intervalId = null;
                return;
            }
            state.matchmaking.timer = Math.max(0, state.matchmaking.timer - 1);
            if (timerEl) timerEl.textContent = String(state.matchmaking.timer);
        }, 1000);

        const result = await matchmakingService.queueRandom(state.user);

        // Если за время ожидания пользователь отменил поиск — не стартуем матч.
        if (state.matchmaking.cancelled) {
            state.matchmaking.active = false;
            if (state.matchmaking.intervalId) {
                clearInterval(state.matchmaking.intervalId);
                state.matchmaking.intervalId = null;
            }
            return;
        }

        state.gameId = result.gameId;

        const game = await getGame(result.gameId);
        if (game && game.players && game.players.guest && String(game.players.guest).startsWith('bot:')) {
            const diff = String(game.players.guest).split(':')[1] || 'normal';
            state.botState.difficulty = diff;
            const msgKey =
                diff === 'easy'
                    ? 'matchmaking_vs_bot_easy'
                    : diff === 'hard'
                    ? 'matchmaking_vs_bot_hard'
                    : 'matchmaking_vs_bot_normal';
            const msg = TEXTS[state.lang]?.[msgKey] || TEXTS.en[msgKey];
            if (msg) showToast(msg, 'info');
        }

        state.matchmaking.active = false;
        if (state.matchmaking.intervalId) {
            clearInterval(state.matchmaking.intervalId);
            state.matchmaking.intervalId = null;
        }

        // Переход к расстановке
        startGamePlacement();
    } catch (e) {
        console.error('Random matchmaking failed:', e);
        const msg = TEXTS[state.lang]?.error_matchmaking || TEXTS.en.error_matchmaking;
        showToast(msg, 'error');
    }
}

export function cancelMatchmaking() {
    if (!state.matchmaking.active) {
        showScreen('screen-dashboard');
        return;
    }
    state.matchmaking.cancelled = true;
    state.matchmaking.active = false;
    if (state.matchmaking.intervalId) {
        clearInterval(state.matchmaking.intervalId);
        state.matchmaking.intervalId = null;
    }
    showScreen('screen-dashboard');
}

export async function joinGame(gameId) {
    resetGameState();
    state.gameId = gameId;
    const game = await getGame(gameId);
    if (!game || !game.players || !game.players.host) return;
    state.mode = game.mode || 'friend';
    state.ranked = !!game.ranked;
    state.weather = game.weather || 'calm';

    await updateGame(gameId, {
        status: 'placement',
        players: {
            host: game.players.host,
            guest: state.user.uid
        }
    });
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

    await setPlayerData(state.gameId, state.user.uid, {
        grid: state.grid,
        ready: true
    });

    // Подготовим серверное представление кораблей для PvP: boards/{uid}/ships, totalShipCells, hitsCount=0
    const shipsMap = {};
    let cellsTotal = 0;
    state.ships.forEach(ship => {
        (ship.cells || []).forEach(idx => {
            const key = String(idx);
            shipsMap[key] = true;
            cellsTotal += 1;
        });
    });
    if (cellsTotal > 0) {
        const updates = {};
        updates['boards/' + state.user.uid] = {
            ships: shipsMap,
            totalShipCells: cellsTotal,
            hitsCount: 0,
            shots: {}
        };
        await updateGame(state.gameId, updates);
    }

    // Если игра против бота — начинаем сразу после готовности игрока.
    const game = await getGame(state.gameId);
    if (game && game.players && isBotGuest(game.players.guest)) {
        initBattleBot(game);
        return;
    }

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
        const oppIds = pIds.filter(id => id !== state.user.uid);
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

async function initBattleBot(game) {
    offPlayers(state.gameId);
    offGame(state.gameId);
    showScreen('screen-battle');

    const difficulty = getBotDifficultyFromGuest(game.players.guest);
    state.botState.difficulty = difficulty;
    botPlayer = new BotPlayer(difficulty);

    // Генерируем поле бота один раз и сохраняем в игре (только для bot-матчей).
    // Важно: это не "античит" (в идеале скрывать), но позволяет реализовать бой без серверного кода.
    const botBoard = game.botBoard || generateRandomBoard();
    const updates = {
        status: 'battle',
        // turn: либо игрок, либо бот
        turn: Math.random() < 0.5 ? state.user.uid : BOT_UID,
        botBoard,
        playerShots: game.playerShots || {},
        botShots: game.botShots || {},
        playerHitsCount: game.playerHitsCount || 0,
        botHitsCount: game.botHitsCount || 0,
        finished: false
    };
    await updateGame(state.gameId, updates);

    renderBattleGrids(shoot);
    onGame(state.gameId, handleGameUpdate);
    resetTimer();
}

function handleGameUpdate(game) {
    if (!game) return;

    if (game.status === 'finished' || game.finished) {
        const msg = TEXTS[state.lang]?.match_finished || TEXTS.en.match_finished;
        showToast(msg, 'success');
        if (state.user && state.gameId) {
            // Применяем экономику, статы и ачивки (каждый сервис сам защищён от повторов).
            matchResultService.applyForUser(state.gameId, game, state.user.uid).catch(() => {});
            statsService.recordMatch(state.gameId, game).catch(() => {});
            achievementsService.updateForUser(state.gameId, game, state.user.uid).catch(() => {});
        }
        offGame(state.gameId);
        offDisconnected(state.gameId);
        showScreen('screen-dashboard');
        return;
    }

    const isMyTurn = game.turn === state.user.uid;
    const turnText = isMyTurn ? TEXTS[state.lang].your_turn : TEXTS[state.lang].enemy_turn;
    setTurnIndicator(turnText, isMyTurn);

    if (isMyTurn) {
        const tg = getTg();
        if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    }

    if (game.lastShot) {
        if (game.lastShot.shooter === state.user.uid) {
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

    // Если это bot-матч и сейчас ход бота — планируем ход.
    if (game.players && isBotGuest(game.players.guest) && game.turn === BOT_UID) {
        scheduleBotMove(game).catch(e => console.warn('Bot move error', e));
    }
}

export async function shoot(idx) {
    const game = await getGame(state.gameId);
    if (!game || game.turn !== state.user.uid) {
        const tg = getTg();
        if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
        return;
    }

    const opponentId = game.players && game.players.host === state.user.uid
        ? game.players.guest
        : game.players.host;
    if (!opponentId) return;

    // Ветка "против бота"
    if (isBotGuest(opponentId)) {
        const playerShots = game.playerShots || {};
        if (playerShots[String(idx)]) return; // уже стреляли

        const botBoard = game.botBoard;
        if (!botBoard) return;
        const isHit = botBoard[idx] === 's';

        const nextTurn = isHit ? state.user.uid : BOT_UID;
        const newPlayerHits = (game.playerHitsCount || 0) + (isHit ? 1 : 0);
        const finished = newPlayerHits >= TOTAL_SHIP_CELLS;

        const updates = {
            turn: finished ? null : nextTurn,
            lastShot: { idx, isHit, shooter: state.user.uid },
            lastShotAt: Date.now(),
            playerShots: { ...playerShots, [String(idx)]: isHit ? 'hit' : 'miss' },
            playerHitsCount: newPlayerHits
        };

        if (finished) {
            updates.status = 'finished';
            updates.finished = true;
            updates.result = {
                winner: state.user.uid,
                loser: BOT_UID,
                finishedAt: Date.now(),
                botGame: true
            };
        }

        await updateGame(state.gameId, updates);

        // локальная отрисовка
        setEnemyCellClass(idx, isHit ? 'hit' : 'miss');

        return;
    }

    // Ветка PvP: сервер сам решает, было ли попадание, и завершает матч при необходимости.
    const result = await runShootTransaction(state.gameId, state.user.uid, opponentId, idx);
    if (!result || !result.committed) return;
}

let botMoveInFlight = false;
async function scheduleBotMove(game) {
    if (botMoveInFlight) return;
    botMoveInFlight = true;
    try {
        // задержка 1–3 секунды
        await sleep(randomInt(1000, 3000));

        const fresh = await getGame(state.gameId);
        if (!fresh || fresh.turn !== BOT_UID || fresh.finished || fresh.status === 'finished') return;

        const botShots = fresh.botShots || {};
        const myShotsArray = Array(GRID_SIZE * GRID_SIZE).fill(null);
        for (const [k, v] of Object.entries(botShots)) {
            const i = parseInt(k, 10);
            if (!Number.isNaN(i)) myShotsArray[i] = v;
        }

        // Hunt targets: последние попадания бота по игроку
        const huntTargets = (fresh.botLastHits || []).slice(-3);

        const shotIdx = botPlayer.chooseShot({
            gridSize: GRID_SIZE,
            myShots: myShotsArray,
            huntTargets
        });
        if (shotIdx < 0) return;
        if (botShots[String(shotIdx)]) return;

        const isHit = state.grid[shotIdx] === 's';
        const nextTurn = isHit ? BOT_UID : state.user.uid;
        const newBotHits = (fresh.botHitsCount || 0) + (isHit ? 1 : 0);
        const finished = newBotHits >= TOTAL_SHIP_CELLS;

        const newBotLastHits = isHit ? [...(fresh.botLastHits || []), shotIdx] : (fresh.botLastHits || []);
        const updates = {
            turn: finished ? null : nextTurn,
            lastShot: { idx: shotIdx, isHit, shooter: BOT_UID },
            lastShotAt: Date.now(),
            botShots: { ...botShots, [String(shotIdx)]: isHit ? 'hit' : 'miss' },
            botHitsCount: newBotHits,
            botLastHits: newBotLastHits
        };

        if (finished) {
            updates.status = 'finished';
            updates.finished = true;
            updates.result = {
                winner: BOT_UID,
                loser: state.user.uid,
                finishedAt: Date.now(),
                botGame: true
            };
        }

        await updateGame(state.gameId, updates);
    } finally {
        botMoveInFlight = false;
    }
}

export function adminAddCurrency(type) {
    const uidEl = document.getElementById('admin-user-id');
    const amountEl = document.getElementById('admin-amount');
    const uid = uidEl && uidEl.value;
    const amount = amountEl ? parseInt(amountEl.value, 10) : 0;
    if (!uid || !amount) return;
    adminAddCoinsOrGems(uid, type, amount).then(() => {
        const msg = TEXTS[state.lang]?.admin_done || TEXTS.en.admin_done;
        showToast(msg, 'success');
    });
}

/** Загрузить данные для админ-панели (overview, matches, bans, logs). */
export async function loadAdminData() {
    try {
        const [activeGames, globalStats, activity, matches, bans, logs] = await Promise.all([
            getActiveGamesCount(),
            getGlobalStats(),
            getRecentActivity(),
            getRecentMatches(),
            getBans(),
            getAdminLogs()
        ]);

        const ag = document.getElementById('admin-active-games');
        const tg = document.getElementById('admin-total-games');
        const hw = document.getElementById('admin-human-wins');
        const bw = document.getElementById('admin-bot-wins');
        if (ag) ag.textContent = String(activeGames);
        if (tg) tg.textContent = String(globalStats.totalGames || 0);
        if (hw) hw.textContent = String(globalStats.humanWins || 0);
        if (bw) bw.textContent = String(globalStats.botWins || 0);

        const actList = document.getElementById('admin-activity-list');
        if (actList) {
            actList.innerHTML = '';
            const matchesText = TEXTS[state.lang]?.admin_matches || TEXTS.en.admin_matches;
            activity.forEach(a => {
                const li = document.createElement('li');
                li.textContent = `${a.bucket}: ${a.matches || 0} ${matchesText}`;
                actList.appendChild(li);
            });
        }

        const matchesList = document.getElementById('admin-matches-list');
        if (matchesList) {
            matchesList.innerHTML = '';
            matches.forEach(m => {
                const li = document.createElement('li');
                const mode = m.mode || 'random';
                const winner = m.winner || 'n/a';
                const duration = Math.round((m.durationMs || 0) / 1000);
                li.textContent = `${m.gameId} | ${mode} | winner: ${winner} | ${duration}s`;
                matchesList.appendChild(li);
            });
        }

        const bansList = document.getElementById('admin-bans-list');
        if (bansList) {
            bansList.innerHTML = '';
            bans.forEach(b => {
                const li = document.createElement('li');
                li.className = 'flex items-center justify-between glass p-2 rounded';
                const info = document.createElement('div');
                info.className = 'flex-1';
                const noReasonText = TEXTS[state.lang]?.admin_no_reason || TEXTS.en.admin_no_reason;
                const reason = b.reason || noReasonText;
                const date = new Date(b.timestamp || 0).toLocaleDateString();
                info.textContent = `${b.uid}: ${reason} (${date})`;
                li.appendChild(info);
                const unbanBtn = document.createElement('button');
                unbanBtn.className = 'btn-secondary px-2 py-1 rounded text-xs';
                unbanBtn.textContent = TEXTS[state.lang]?.admin_unban || TEXTS.en.admin_unban;
                unbanBtn.onclick = () => adminUnbanUser(b.uid);
                li.appendChild(unbanBtn);
                bansList.appendChild(li);
            });
        }

        const logsList = document.getElementById('admin-logs-list');
        if (logsList) {
            logsList.innerHTML = '';
            logs.forEach(l => {
                const li = document.createElement('li');
                li.textContent = `${new Date(l.timestamp || 0).toISOString()} | ${l.action} | ${JSON.stringify(l.payload || {})}`;
                logsList.appendChild(li);
            });
        }
    } catch (e) {
        console.warn('Admin data load failed', e);
    }
}

/** Показать профиль игрока для админа: рейтинг, статы, ачивки, последние матчи. */
export async function adminViewProfile() {
    const uidEl = document.getElementById('admin-user-id');
    const profileBox = document.getElementById('admin-user-profile');
    if (!uidEl || !profileBox) return;
    const uid = uidEl.value.trim();
    if (!uid) return;

    try {
        const [user, matches] = await Promise.all([getUser(uid), getMatchesForUser(uid, 10)]);
        if (!user) {
            profileBox.classList.remove('hidden');
            profileBox.innerHTML = `<div>User not found</div>`;
            return;
        }
        const winrate = user.games ? Math.round((user.wins || 0) / user.games * 100) : 0;
        const achievements = Object.keys(user.achievements || {});

        const matchesHtml = matches
            .map(m => {
                const mode = m.mode || 'random';
                const ranked = m.ranked ? 'R' : 'C';
                const youWinner = m.winner === uid ? 'W' : (m.loser === uid ? 'L' : '?');
                const dur = Math.round((m.durationMs || 0) / 1000);
                return `<li>${m.gameId} | ${mode}/${ranked} | ${youWinner} | ${dur}s</li>`;
            })
            .join('');

        profileBox.classList.remove('hidden');
        profileBox.innerHTML = `
            <div><strong>${user.nickname || uid}</strong> (uid: ${uid})</div>
            <div>Rating: ${user.rating || 0}</div>
            <div>Coins: ${user.coins || 0}</div>
            <div>Games: ${user.games || 0}, Wins: ${user.wins || 0}, Losses: ${user.losses || 0}, Winrate: ${winrate}%</div>
            <div>Best streak: ${user.bestWinStreak || 0}</div>
            <div>Achievements: ${achievements.length ? achievements.join(', ') : 'none'}</div>
            <div class="mt-2">
                <div class="font-bold mb-1">Recent matches:</div>
                <ul class="space-y-1">${matchesHtml || '<li>no matches</li>'}</ul>
            </div>
        `;
    } catch (e) {
        console.warn('Admin profile load failed', e);
    }
}

/** Загрузить лидерборды: рейтинг, винрейт (30+ игр), количество игр. */
export async function loadLeaderboards() {
    try {
        const [byRating, users] = await Promise.all([
            getTopByRating(50),
            getUsersForLeaderboards(200)
        ]);

        // Rating: уже отсортирован getTopByRating
        const ratingList = document.getElementById('lb-rating-list');
        if (ratingList) {
            ratingList.innerHTML = '';
            byRating.forEach((u, idx) => {
                const li = document.createElement('li');
                const wr = u.games ? Math.round((u.wins || 0) / u.games * 100) : 0;
                li.textContent = `${idx + 1}. ${u.nickname || u.uid} — ${u.rating || 0} (${u.games || 0} games, ${wr}% winrate)`;
                ratingList.appendChild(li);
            });
        }

        // Games: сортируем по количеству игр
        const usersByGames = [...users].sort((a, b) => (b.games || 0) - (a.games || 0)).slice(0, 50);
        const gamesList = document.getElementById('lb-games-list');
        if (gamesList) {
            gamesList.innerHTML = '';
            usersByGames.forEach((u, idx) => {
                const wr = u.games ? Math.round((u.wins || 0) / u.games * 100) : 0;
                const li = document.createElement('li');
                li.textContent = `${idx + 1}. ${u.nickname || u.uid} — ${u.games || 0} games (${wr}% winrate)`;
                gamesList.appendChild(li);
            });
        }

        // Winrate 30+: фильтруем пользователей с играми >= 30
        const with30 = users.filter(u => (u.games || 0) >= 30);
        const byWinrate = with30
            .map(u => ({
                ...u,
                winrate: u.games ? (u.wins || 0) / u.games : 0
            }))
            .sort((a, b) => b.winrate - a.winrate)
            .slice(0, 50);

        const winrateList = document.getElementById('lb-winrate-list');
        if (winrateList) {
            winrateList.innerHTML = '';
            byWinrate.forEach((u, idx) => {
                const wr = Math.round(u.winrate * 100);
                const li = document.createElement('li');
                li.textContent = `${idx + 1}. ${u.nickname || u.uid} — ${wr}% (${u.wins || 0}/${u.games || 0})`;
                winrateList.appendChild(li);
            });
        }
    } catch (e) {
        console.warn('Leaderboards load failed', e);
    }
}

export function showLeaderboardTab(tab) {
    const ratingPanel = document.getElementById('lb-panel-rating');
    const winratePanel = document.getElementById('lb-panel-winrate');
    const gamesPanel = document.getElementById('lb-panel-games');
    if (!ratingPanel || !winratePanel || !gamesPanel) return;

    ratingPanel.classList.add('hidden');
    winratePanel.classList.add('hidden');
    gamesPanel.classList.add('hidden');

    if (tab === 'rating') ratingPanel.classList.remove('hidden');
    else if (tab === 'winrate') winratePanel.classList.remove('hidden');
    else if (tab === 'games') gamesPanel.classList.remove('hidden');
}

export function showAdminTab(tab) {
    const overviewPanel = document.getElementById('admin-panel-overview');
    const matchesPanel = document.getElementById('admin-panel-matches');
    const bansPanel = document.getElementById('admin-panel-bans');
    const logsPanel = document.getElementById('admin-panel-logs');
    if (!overviewPanel || !matchesPanel || !bansPanel || !logsPanel) return;

    overviewPanel.classList.add('hidden');
    matchesPanel.classList.add('hidden');
    bansPanel.classList.add('hidden');
    logsPanel.classList.add('hidden');

    if (tab === 'overview') overviewPanel.classList.remove('hidden');
    else if (tab === 'matches') matchesPanel.classList.remove('hidden');
    else if (tab === 'bans') bansPanel.classList.remove('hidden');
    else if (tab === 'logs') logsPanel.classList.remove('hidden');
}

export async function adminBanUser() {
    if (!state.user) return;
    const uidEl = document.getElementById('admin-ban-uid');
    const reasonEl = document.getElementById('admin-ban-reason');
    const uid = uidEl && uidEl.value.trim();
    const reason = (reasonEl && reasonEl.value.trim()) || 'no reason';
    if (!uid) return;

    try {
        await setBan(uid, reason, state.user.uid);
        await logAdminAction(state.user.uid, 'BAN_USER', { targetUid: uid, reason });
        const msg = TEXTS[state.lang]?.admin_done || TEXTS.en.admin_done;
        showToast(msg, 'success');
        if (uidEl) uidEl.value = '';
        if (reasonEl) reasonEl.value = '';
        await loadAdminData();
    } catch (e) {
        console.error('Ban failed', e);
        showToast('Failed to ban user', 'error');
    }
}

export async function adminUnbanUser(uid) {
    if (!state.user || !uid) return;
    try {
        await clearBan(uid);
        await logAdminAction(state.user.uid, 'UNBAN_USER', { targetUid: uid });
        const msg = TEXTS[state.lang]?.admin_done || TEXTS.en.admin_done;
        showToast(msg, 'success');
        await loadAdminData();
    } catch (e) {
        console.error('Unban failed', e);
        showToast('Failed to unban user', 'error');
    }
}

/** Вызывать при уходе со страницы/закрытии мини-приложения — отметить дисконнект. */
export function notifyDisconnect() {
    if (state.gameId && state.user) {
        setPlayerDisconnected(state.gameId, state.user.uid).catch(() => {});
    }
}
