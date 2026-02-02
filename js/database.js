/**
 * Все операции чтения/записи Firebase Realtime Database.
 */

import { FIREBASE_CONFIG } from './config.js';

let db = null;

export function getDb() {
    if (!db) {
        try {
            if (typeof firebase === 'undefined') throw new Error('Firebase SDK not loaded');
            firebase.initializeApp(FIREBASE_CONFIG);
            db = firebase.database();
        } catch (e) {
            console.error('Firebase Error:', e);
            throw e;
        }
    }
    return db;
}

// ——— Users ———
export async function getUser(userId) {
    const snap = await getDb().ref('users/' + userId).once('value');
    return snap.val();
}

export function setUser(userId, data) {
    return getDb().ref('users/' + userId).update(data);
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
 * Транзакция выстрела: только текущий ход может стрелять, атомарно обновляем turn и lastShot.
 */
export async function runShootTransaction(gameId, myUserId, opponentId, cellIdx, isHit) {
    const gameRef = getDb().ref('games/' + gameId);
    return gameRef.runTransaction(current => {
        const game = current;
        if (!game || game.turn !== myUserId) return; // не твой ход — отмена
        const nextTurn = isHit ? myUserId : opponentId;
        return {
            ...game,
            turn: nextTurn,
            lastShot: { idx: cellIdx, isHit, shooter: myUserId },
            lastShotAt: Date.now()
        };
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

// ——— Admin ———
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
