/**
 * Регистрация и проверка пользователя. Авто-логин по Telegram ID или localStorage userId из Firebase.
 */

import { state } from './state.js';
import { ADMIN_IDS } from './config.js';
import { getUser, setUser } from './database.js';
import { showScreen } from './ui.js';
import { updateDash } from './ui.js';

let tg = null;

export function getTg() {
    if (!tg) tg = window.Telegram?.WebApp;
    return tg;
}

function applyUserToState(userData, userId) {
    state.user = {
        id: userId,
        nickname: userData.nickname || 'Player',
        coins: userData.coins ?? 100,
        wins: userData.wins ?? 0,
        games: userData.games ?? 0,
        lang: userData.lang || state.lang
    };
    if (userData.lang) state.lang = userData.lang;
    const numId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    if (!isNaN(numId) && ADMIN_IDS.includes(numId)) {
        const el = document.getElementById('admin-btn');
        if (el) el.classList.remove('hidden');
    }
    localStorage.setItem('userId', String(userId));
    updateDash();
    showScreen('screen-dashboard');
}

/**
 * При загрузке: Telegram ID или localStorage userId — если пользователь есть в Firebase, сразу на dashboard.
 */
export async function tryAutoLogin() {
    tg = getTg();
    if (tg) {
        tg.ready();
        tg.expand();
        tg.setHeaderColor('#0a0a14');
    }

    const telegramId = tg?.initDataUnsafe?.user?.id;
    const savedUserId = localStorage.getItem('userId');

    // 1) Пробуем по Telegram ID
    if (telegramId) {
        try {
            const userData = await getUser(telegramId);
            if (userData && userData.nickname) {
                applyUserToState(userData, telegramId);
                return true;
            }
        } catch (e) {
            console.warn('Auto-login (Telegram) failed:', e);
        }
    }

    // 2) Пробуем по сохранённому userId (браузер без Telegram или один и тот же юзер)
    if (savedUserId) {
        try {
            const userData = await getUser(savedUserId);
            if (userData && userData.nickname) {
                applyUserToState(userData, savedUserId);
                return true;
            }
        } catch (e) {
            console.warn('Auto-login (saved userId) failed:', e);
        }
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
    const userId = tg?.initDataUnsafe?.user?.id ?? Math.floor(Math.random() * 1000000);

    state.user = {
        id: userId,
        nickname,
        coins: 100,
        wins: 0,
        games: 0,
        lang: state.lang
    };

    if (ADMIN_IDS.includes(userId)) {
        const el = document.getElementById('admin-btn');
        if (el) el.classList.remove('hidden');
    }

    try {
        await setUser(userId, state.user);
    } catch (e) {
        console.error('Failed to save user:', e);
        alert('Ошибка сохранения. Проверьте интернет и откройте приложение снова.');
        return;
    }

    localStorage.setItem('userId', String(userId));
    updateDash();

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
