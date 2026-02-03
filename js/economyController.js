/**
 * Контроллер экономики и магазина.
 * Использует EconomyService (SOLID: отделяем доменную логику от UI).
 */

import { state } from './state.js';
import { EconomyService } from './services.js';
import { updateDash, showToast } from './ui.js';
import { TEXTS } from './config.js';

const economyService = new EconomyService();

export function initShop() {
    const coinsEl = document.getElementById('dash-coins');
    if (coinsEl && state.user) {
        coinsEl.textContent = state.user.coins;
    }
}

export async function buyAbility(abilityId) {
    if (!state.user) return;
    try {
        const result = await economyService.purchaseAbility(state.user.uid, abilityId);
        state.user.coins = result.coins;
        state.user.abilities = state.user.abilities || {};
        state.user.abilities[abilityId] = result.count;
        updateDash();
        const base = TEXTS[state.lang] || TEXTS.en;
        showToast(`${base.shop_purchased}: ${abilityId} x${result.count}`, 'success');
    } catch (e) {
        console.error('Purchase failed', e);
        const base = TEXTS[state.lang] || TEXTS.en;
        showToast(base.shop_purchase_failed, 'error');
    }
}

