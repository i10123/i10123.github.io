/**
 * Глобальное состояние приложения.
 */

import { GRID_SIZE, SHIP_SIZES } from './config.js';

export const state = {
    lang: 'en',
    user: null,
    gameId: null,
    grid: Array(GRID_SIZE * GRID_SIZE).fill(null),
    ships: [],
    currentShipSize: 4,
    orientation: 'h',
    shipsToPlace: [...SHIP_SIZES],
    enemyGrid: Array(GRID_SIZE * GRID_SIZE).fill(null),
    timerInterval: null
};

/** Сброс состояния игры (сетка и корабли) для новой партии. */
export function resetGameState() {
    state.grid = Array(GRID_SIZE * GRID_SIZE).fill(null);
    state.ships = [];
    state.shipsToPlace = [...SHIP_SIZES];
    state.enemyGrid = Array(GRID_SIZE * GRID_SIZE).fill(null);
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}
