/**
 * Регистрация и проверка пользователя.
 * Используем Firebase Anonymous Auth + Telegram ID как внешнюю идентификацию.
 */

import { state } from './state.js';
import { ADMIN_IDS, ECONOMY, TEXTS } from './config.js';
import { getUser, setUser, createUser, initFirebase } from './database.js';
import { showScreen, updateDash, showToast } from './ui.js';

let tg = null;

export function getTg() {
    if (!tg) tg = window.Telegram?.WebApp;
    return tg;
}

async function ensureAnonAuth() {
    initFirebase();
    const auth = firebase.auth();
    if (!auth.currentUser) {
        await auth.signInAnonymously();
    }
    return auth.currentUser;
}

function applyUserToState(userData, uid) {
    state.user = {
        uid,
        telegramId: userData.telegramId || null,
        nickname: userData.nickname || 'Player',
        rating: userData.rating ?? ECONOMY.START_RATING,
        coins: userData.coins ?? ECONOMY.START_COINS,
        wins: userData.wins ?? 0,
        losses: userData.losses ?? 0,
        games: userData.games ?? 0,
        banned: !!userData.banned,
        abilities: userData.abilities || {},
        language: userData.language || state.lang
    };
    if (userData.language) state.lang = userData.language;

    const tgid = state.user.telegramId;
    if (tgid && ADMIN_IDS.includes(Number(tgid))) {
        const el = document.getElementById('admin-btn');
        if (el) el.classList.remove('hidden');
    }

    localStorage.setItem('uid', String(uid));
    updateDash();
    showScreen('screen-dashboard');
}

/**
 * При загрузке: анонимный Firebase Auth, затем поиск пользователя по uid.
 */
export async function tryAutoLogin() {
    tg = getTg();
    if (tg) {
        tg.ready();
        tg.expand();
        tg.setHeaderColor('#0a0a14');
    }

    const authUser = await ensureAnonAuth();
    const uid = authUser.uid;

    try {
        const userData = await getUser(uid);
        if (userData && userData.nickname) {
            applyUserToState(userData, uid);
            return true;
        }
    } catch (e) {
        console.warn('Auto-login failed:', e);
    }

    return false;
}

/**
 * Регистрация/обновление пользователя по нику и переход в лобби или в игру по ссылке.
 */
export async function registerUser() {
    const nicknameInput = document.getElementById('input-nickname');
    const nickname = (nicknameInput && nicknameInput.value.trim()) || 'Player';
    tg = getTg();
    const telegramId = tg?.initDataUnsafe?.user?.id ?? null;

    const authUser = await ensureAnonAuth();
    const uid = authUser.uid;

    const baseUser = {
        telegramId,
        nickname,
        language: state.lang
    };

    try {
        const existing = await getUser(uid);
        if (existing) {
            await setUser(uid, { ...baseUser, lastActive: Date.now() });
            applyUserToState({ ...existing, ...baseUser }, uid);
        } else {
            await createUser(uid, baseUser);
            applyUserToState(
                {
                    ...baseUser,
                    rating: ECONOMY.START_RATING,
                    coins: ECONOMY.START_COINS,
                    wins: 0,
                    losses: 0,
                    games: 0,
                    banned: false,
                    abilities: {},
                    achievements: {}
                },
                uid
            );
        }
    } catch (e) {
        console.error('Failed to save user:', e);
        const msg = TEXTS[state.lang]?.error_save_user || TEXTS.en.error_save_user;
        showToast(msg, 'error');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const joinGameId = urlParams.get('startapp');
    if (joinGameId) {
        const { joinGame } = await import('./game.js');
        await joinGame(joinGameId);
    } else {
        showScreen('screen-dashboard');
    }
}

export function bindRegisterButton() {
    const btn = document.getElementById('btn-register');
    if (btn) btn.addEventListener('click', () => registerUser());
}
