/**
 * Точка входа: инициализация, авто-логин, глобальные обработчики и Telegram Back Button.
 */

import { tryAutoLogin, getTg, bindRegisterButton } from './auth.js';
import { showScreen, setLanguage, setScreenChangeCallback, applyTranslations } from './ui.js';
import { createBattle, joinGame, confirmPlacement, rotateShip, adminAddCurrency, notifyDisconnect } from './game.js';
import { copyGameLink } from './ui.js';
import { state } from './state.js';
import { TEXTS } from './config.js';

// Глобальные функции для onclick в HTML
window.showScreen = showScreen;
window.setLanguage = setLanguage;
window.createBattle = createBattle;
window.copyGameLink = copyGameLink;
window.rotateShip = rotateShip;
window.confirmPlacement = confirmPlacement;
window.adminAddCurrency = adminAddCurrency;

function setupTelegramBackButton() {
    const tg = getTg();
    if (!tg || !tg.BackButton) return;

    const screenHistory = [];

    setScreenChangeCallback(sid => {
        if (sid === 'screen-language') {
            screenHistory.length = 0;
            screenHistory.push(sid);
            tg.BackButton.hide();
        } else {
            if (screenHistory.length === 0) screenHistory.push('screen-language');
            screenHistory.push(sid);
            tg.BackButton.show();
        }
    });

    tg.BackButton.onClick(() => {
        if (screenHistory.length <= 1) {
            showScreen('screen-language');
            screenHistory.length = 0;
            screenHistory.push('screen-language');
            tg.BackButton.hide();
            return;
        }
        screenHistory.pop();
        const prev = screenHistory[screenHistory.length - 1];
        showScreen(prev);
    });
}

function setupDisconnectOnLeave() {
    const onLeave = () => {
        notifyDisconnect();
    };
    window.addEventListener('pagehide', onLeave);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') onLeave();
    });
}

async function init() {
    try {
        getTg();
    } catch (e) {}

    const savedLang = localStorage.getItem('lang');
    if (savedLang && (savedLang === 'en' || savedLang === 'ru')) {
        state.lang = savedLang;
        document.querySelectorAll('[data-key]').forEach(el => {
            const key = el.getAttribute('data-key');
            if (TEXTS[savedLang] && TEXTS[savedLang][key]) {
                if (el.tagName === 'INPUT') el.placeholder = TEXTS[savedLang][key];
                else el.textContent = TEXTS[savedLang][key];
            }
        });
    }

    const loggedIn = await tryAutoLogin();
    if (loggedIn) {
        applyTranslations();
        const params = new URLSearchParams(window.location.search);
        const joinGameId = params.get('startapp');
        if (joinGameId) await joinGame(joinGameId);
    } else {
        showScreen('screen-language');
    }

    bindRegisterButton();
    setupTelegramBackButton();
    setupDisconnectOnLeave();
}

init().catch(e => console.error('Init error:', e));
