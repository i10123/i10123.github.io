/**
 * Точка входа: инициализация, авто-логин, глобальные обработчики и Telegram Back Button.
 */

import { tryAutoLogin, getTg, bindRegisterButton } from './auth.js';
import { showScreen, setLanguage, setScreenChangeCallback, applyTranslations } from './ui.js';
import { shouldShowOnboarding, showOnboarding, initOnboardingHandlers } from './onboarding.js';
import { createBattle, joinGame, confirmPlacement, rotateShip, adminAddCurrency, notifyDisconnect, queueRandom, loadAdminData, adminViewProfile, cancelMatchmaking, loadLeaderboards, showLeaderboardTab, showAdminTab, adminBanUser, adminUnbanUser } from './game.js';
import { copyGameLink } from './ui.js';
import { state } from './state.js';
import { TEXTS } from './config.js';
import { initShop, buyAbility } from './economyController.js';
import { logClientError } from './database.js';

// Глобальные функции для onclick в HTML
window.showScreen = showScreen;
window.setLanguage = setLanguage;
window.createBattle = createBattle;
window.queueRandom = queueRandom;
window.copyGameLink = copyGameLink;
window.rotateShip = rotateShip;
window.confirmPlacement = confirmPlacement;
window.adminAddCurrency = adminAddCurrency;
window.buyAbility = buyAbility;
window.adminViewProfile = adminViewProfile;
window.cancelMatchmaking = cancelMatchmaking;
window.adminBanUser = adminBanUser;
window.adminUnbanUser = adminUnbanUser;
window.openLeaderboards = async function () {
    showScreen('screen-leaderboards');
    await loadLeaderboards();
    showLeaderboardTab('rating');
};

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

function setupErrorLogging() {
    // Обработчик глобальных ошибок JavaScript
    window.onerror = function(message, source, lineno, colno, error) {
        const uid = state.user?.uid || null;
        logClientError(message, source, lineno, colno, error, uid);
        // Возвращаем false, чтобы браузер показал ошибку в консоли
        return false;
    };
    
    // Обработчик необработанных промисов
    window.addEventListener('unhandledrejection', function(event) {
        const uid = state.user?.uid || null;
        const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
        logClientError(
            `Unhandled Promise Rejection: ${event.reason}`,
            'promise',
            null,
            null,
            error,
            uid
        );
    });
}

async function init() {
    try {
        getTg();
    } catch (e) {}
    
    // Настраиваем логирование ошибок
    setupErrorLogging();

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

    initOnboardingHandlers();
    
    const loggedIn = await tryAutoLogin();
    if (loggedIn) {
        applyTranslations();
        const params = new URLSearchParams(window.location.search);
        const joinGameId = params.get('startapp');
        if (joinGameId) await joinGame(joinGameId);
    } else {
        // Проверяем, нужно ли показать onboarding
        if (shouldShowOnboarding()) {
            showOnboarding();
            applyTranslations();
        } else {
            showScreen('screen-language');
        }
    }

    bindRegisterButton();
    setupTelegramBackButton();
    setupDisconnectOnLeave();
    initShop();

    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            loadAdminData();
            showAdminTab('overview');
        });
    }

    // Переключатель табов админки
    const adminTabOverview = document.getElementById('admin-tab-overview');
    const adminTabMatches = document.getElementById('admin-tab-matches');
    const adminTabBans = document.getElementById('admin-tab-bans');
    const adminTabLogs = document.getElementById('admin-tab-logs');
    if (adminTabOverview && adminTabMatches && adminTabBans && adminTabLogs) {
        adminTabOverview.addEventListener('click', () => showAdminTab('overview'));
        adminTabMatches.addEventListener('click', () => showAdminTab('matches'));
        adminTabBans.addEventListener('click', () => {
            showAdminTab('bans');
            loadAdminData();
        });
        adminTabLogs.addEventListener('click', () => {
            showAdminTab('logs');
            loadAdminData();
        });
    }

    // Локальный переключатель табов лидербордов
    const lbRating = document.getElementById('lb-tab-rating');
    const lbWinrate = document.getElementById('lb-tab-winrate');
    const lbGames = document.getElementById('lb-tab-games');
    if (lbRating && lbWinrate && lbGames) {
        lbRating.addEventListener('click', () => showLeaderboardTab('rating'));
        lbWinrate.addEventListener('click', () => showLeaderboardTab('winrate'));
        lbGames.addEventListener('click', () => showLeaderboardTab('games'));
    }
}

init().catch(e => console.error('Init error:', e));
