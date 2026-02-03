/**
 * Все операции чтения/записи Firebase Realtime Database.
 * Здесь же инициализируем Firebase (app + db), чтобы им могла пользоваться и Auth.
 */

import { FIREBASE_CONFIG, ECONOMY, ABILITIES } from './config.js';

let db = null;
let appInitialized = false;

export function initFirebase() {
    if (!appInitialized) {
        try {
            if (typeof firebase === 'undefined') throw new Error('Firebase SDK not loaded');
            firebase.initializeApp(FIREBASE_CONFIG);
            db = firebase.database();
            appInitialized = true;
        } catch (e) {
            console.error('Firebase init error:', e);
            throw e;
        }
    }
    return db;
}

export function getDb() {
    if (!db) {
        initFirebase();
    }
    return db;
}

// ——— Users ———

/** Прочитать пользователя по uid (auth.uid). */
export async function getUser(userId) {
    const snap = await getDb().ref('users/' + userId).once('value');
    return snap.val();
}

/**
 * Частичное обновление пользователя.
 */
export function setUser(userId, data) {
    return getDb().ref('users/' + userId).update(data);
}

/**
 * Создать нового пользователя с начальными значениями экономики и профиля.
 */
export function createUser(uid, { telegramId, nickname, language }) {
    const now = Date.now();
    const base = {
        telegramId: telegramId ?? null,
        nickname: nickname || 'Player',
        language: language || 'en',
        rating: ECONOMY.START_RATING,
        coins: ECONOMY.START_COINS,
        wins: 0,
        losses: 0,
        games: 0,
        banned: false,
        createdAt: now,
        lastActive: now,
        abilities: {},
        achievements: {}
    };
    return getDb().ref('users/' + uid).set(base);
}

// ——— Games ———
export function setGame(gameId, data) {
    return getDb().ref('games/' + gameId).set(data);
}

export function updateGame(gameId, data) {
    return getDb().ref('games/' + gameId).update(data);
}

export async function getGame(gameId) {
    const snap = await getDb().ref('games/' + gameId).once('value');
    return snap.val();
}

export function onGame(gameId, callback) {
    return getDb().ref('games/' + gameId).on('value', snap => callback(snap.val()));
}

export function offGame(gameId) {
    getDb().ref('games/' + gameId).off('value');
}

export function setPlayerData(gameId, userId, data) {
    return getDb().ref('games/' + gameId + '/players/' + userId).set(data);
}

export async function getPlayerData(gameId, userId) {
    const snap = await getDb().ref('games/' + gameId + '/players/' + userId).once('value');
    return snap.val();
}

export function onPlayers(gameId, callback) {
    return getDb().ref('games/' + gameId + '/players').on('value', snap => callback(snap.val()));
}

export function offPlayers(gameId) {
    getDb().ref('games/' + gameId + '/players').off('value');
}

/**
 * Транзакция выстрела в PvP:
 * - только текущий ход может стрелять
 * - считаем попадание на сервере по boards/{opponentId}/ships
 * - обновляем turn, lastShot, shots, hitsCount и при необходимости завершаем матч.
 */
export async function runShootTransaction(gameId, myUserId, opponentId, cellIdx) {
    const gameRef = getDb().ref('games/' + gameId);
    return gameRef.runTransaction(current => {
        const game = current;
        if (!game || game.turn !== myUserId) return; // не твой ход — отмена

        const boards = game.boards || {};
        const oppBoard = boards[opponentId];
        if (!oppBoard) return;

        const key = String(cellIdx);
        const prevShots = oppBoard.shots || {};
        if (prevShots[key]) return; // уже стреляли сюда — отмена

        const isHit = !!(oppBoard.ships && oppBoard.ships[key]);
        const prevHits = oppBoard.hitsCount || 0;
        const totalShipCells = oppBoard.totalShipCells || 0;
        const newHits = prevHits + (isHit ? 1 : 0);

        const finished = totalShipCells > 0 && newHits >= totalShipCells;
        const nextTurn = finished ? null : (isHit ? myUserId : opponentId);

        const newOppBoard = {
            ...oppBoard,
            shots: { ...prevShots, [key]: true },
            hitsCount: newHits
        };

        const newBoards = {
            ...boards,
            [opponentId]: newOppBoard
        };

        const updated = {
            ...game,
            boards: newBoards,
            turn: nextTurn,
            lastShot: { idx: cellIdx, isHit, shooter: myUserId },
            lastShotAt: Date.now()
        };

        if (finished) {
            updated.status = 'finished';
            updated.finished = true;
            updated.result = {
                winner: myUserId,
                loser: opponentId,
                finishedAt: Date.now(),
                botGame: false
            };
        }

        return updated;
    });
}

/** Отметить, что игрок отключился (для уведомления противника). */
export function setPlayerDisconnected(gameId, userId) {
    return getDb().ref('games/' + gameId + '/disconnected/' + userId).set(Date.now());
}

export function onDisconnected(gameId, callback) {
    return getDb().ref('games/' + gameId + '/disconnected').on('value', snap => callback(snap.val()));
}

export function offDisconnected(gameId) {
    getDb().ref('games/' + gameId + '/disconnected').off('value');
}

// ——— Matchmaking ———

export function enterMatchmakingQueue(uid, rating) {
    return getDb()
        .ref('matchmakingQueue/' + uid)
        .set({
            rating: rating || ECONOMY.START_RATING,
            timestamp: Date.now()
        });
}

export function leaveMatchmakingQueue(uid) {
    return getDb().ref('matchmakingQueue/' + uid).remove();
}

export async function getMatchmakingQueue() {
    const snap = await getDb().ref('matchmakingQueue').once('value');
    return snap.val() || {};
}

// ——— Stats / Leaderboards / Admin ———

export function incrementGlobalStats(updates) {
    // updates: { totalGamesDelta, humanWinsDelta, botWinsDelta }
    const ref = getDb().ref('stats/global');
    return ref.transaction(current => {
        const cur = current || {};
        return {
            activeUsers: cur.activeUsers || 0,
            peakOnline: cur.peakOnline || 0,
            totalGames: (cur.totalGames || 0) + (updates.totalGamesDelta || 0),
            humanWins: (cur.humanWins || 0) + (updates.humanWinsDelta || 0),
            botWins: (cur.botWins || 0) + (updates.botWinsDelta || 0)
        };
    });
}

export async function getActiveGamesCount() {
    const snap = await getDb().ref('games').orderByChild('status').once('value');
    const val = snap.val();
    if (!val) return 0;
    return Object.values(val).filter(g => g.status && g.status !== 'finished').length;
}

export async function adminAddCoinsOrGems(userId, type, amount) {
    const ref = getDb().ref('users/' + userId + '/' + type);
    const snap = await ref.once('value');
    const current = snap.val() || 0;
    await ref.set(current + amount);
}

export function setBan(uid, reason, byAdminUid) {
    const now = Date.now();
    const updates = {};
    updates['/bans/' + uid] = { reason, byAdmin: byAdminUid, timestamp: now };
    updates['/users/' + uid + '/banned'] = true;
    return getDb().ref().update(updates);
}

export function clearBan(uid) {
    const updates = {};
    updates['/bans/' + uid] = null;
    updates['/users/' + uid + '/banned'] = false;
    return getDb().ref().update(updates);
}

export function logAdminAction(adminUid, action, payload) {
    const logRef = getDb().ref('adminLogs').push();
    return logRef.set({
        adminUid,
        action,
        payload: payload || null,
        timestamp: Date.now()
    });
}

/**
 * Логирование клиентских ошибок для отладки в проде.
 * @param {string} errorMessage - Сообщение об ошибке
 * @param {string} source - Источник (файл:строка)
 * @param {number} lineno - Номер строки
 * @param {number} colno - Номер колонки
 * @param {Error} error - Объект ошибки
 * @param {string} uid - UID пользователя (опционально)
 */
export function logClientError(errorMessage, source, lineno, colno, error, uid = null) {
    try {
        const errorRef = getDb().ref('clientErrors').push();
        return errorRef.set({
            uid: uid || null,
            message: errorMessage || 'Unknown error',
            source: source || 'unknown',
            lineno: lineno || null,
            colno: colno || null,
            stack: error?.stack || null,
            userAgent: navigator.userAgent || null,
            url: window.location.href || null,
            timestamp: Date.now()
        }).catch(err => {
            // Если не удалось записать в Firebase, хотя бы логируем в консоль
            console.error('Failed to log client error to Firebase:', err);
        });
    } catch (e) {
        console.error('Error logging client error:', e);
    }
}

export async function getTopByRating(limit = 50) {
    const snap = await getDb()
        .ref('users')
        .orderByChild('rating')
        .limitToLast(limit)
        .once('value');
    const val = snap.val() || {};
    // Revert order: highest rating first
    return Object.entries(val)
        .map(([uid, u]) => ({ uid, ...u }))
        .sort((a, b) => (b.rating || 0) - (a.rating || 0));
}

export async function getGlobalStats() {
    const snap = await getDb().ref('stats/global').once('value');
    return snap.val() || {};
}

export async function getRecentActivity(limitHours = 24) {
    const snap = await getDb().ref('stats/activity').once('value');
    const val = snap.val() || {};
    const entries = Object.entries(val).sort((a, b) => (a[0] > b[0] ? -1 : 1));
    return entries.slice(0, limitHours).map(([bucket, data]) => ({ bucket, ...data }));
}

export async function getRecentMatches(limit = 20) {
    const snap = await getDb().ref('matchHistory').once('value');
    const val = snap.val() || {};
    const entries = Object.entries(val).sort((a, b) => (b[1].finishedAt || 0) - (a[1].finishedAt || 0));
    return entries.slice(0, limit).map(([gameId, data]) => ({ gameId, ...data }));
}

export async function getBans() {
    const snap = await getDb().ref('bans').once('value');
    const val = snap.val() || {};
    return Object.entries(val).map(([uid, data]) => ({ uid, ...data }));
}

export async function getAdminLogs(limit = 50) {
    const snap = await getDb().ref('adminLogs').limitToLast(limit).once('value');
    const val = snap.val() || {};
    return Object.entries(val)
        .map(([id, log]) => ({ id, ...log }))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

export async function getMatchesForUser(uid, limit = 20) {
    const snap = await getDb().ref('matchHistory').once('value');
    const val = snap.val() || {};
    const matches = [];
    for (const [gameId, m] of Object.entries(val)) {
        const players = m.players || {};
        if (players.host === uid || players.guest === uid) {
            matches.push({ gameId, ...m });
        }
    }
    matches.sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));
    return matches.slice(0, limit);
}

export async function getUsersForLeaderboards(limit = 200) {
    const snap = await getDb().ref('users').once('value');
    const val = snap.val() || {};
    const users = Object.entries(val).map(([uid, u]) => ({ uid, ...u }));
    // Можно ограничить сверху по количеству, чтобы не тянуть тысячи записей
    users.sort((a, b) => (b.games || 0) - (a.games || 0));
    return users.slice(0, limit);
}
