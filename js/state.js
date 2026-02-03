/**
 * Глобальное состояние приложения.
 * Здесь нет бизнес-логики — только кэш текущего пользователя и матча.
 */

import { GRID_SIZE, SHIP_SIZES } from './config.js';

export const state = {
    lang: 'en',
    /**
     * user: {
     *   uid: string,
     *   telegramId: number | null,
     *   nickname: string,
     *   rating: number,
     *   coins: number,
     *   wins: number,
     *   losses: number,
     *   games: number,
     *   banned: boolean,
     *   abilities: Record<string, number>
     * }
     */
    user: null,

    gameId: null,

    // Локальное представление своей доски и кораблей
    grid: Array(GRID_SIZE * GRID_SIZE).fill(null),
    ships: [],
    currentShipSize: 4,
    orientation: 'h',
    shipsToPlace: [...SHIP_SIZES],

    // Вражеская сетка (для отрисовки попаданий/промахов)
    enemyGrid: Array(GRID_SIZE * GRID_SIZE).fill(null),

    // Текущие параметры боя
    timerInterval: null,
    weather: 'calm',
    ranked: false,
    mode: 'friend', // friend | random
    opponent: null, // { uid, nickname, rating, isBot, botDifficulty }

    // Локальная карта вероятностей для бота (используем только в клиентах, которые двигают бота)
    botState: {
        difficulty: 'normal', // easy | normal | hard
        mode: 'search',       // search | hunt
        lastHits: []          // список индексов последних попаданий
    },

    // Матчмейкинг
    matchmaking: {
        active: false,
        cancelled: false,
        timer: 0,
        intervalId: null
    }
};

/** Сброс состояния игры (сетка, корабли, бой) для новой партии. */
export function resetGameState() {
    state.gameId = null;
    state.grid = Array(GRID_SIZE * GRID_SIZE).fill(null);
    state.ships = [];
    state.shipsToPlace = [...SHIP_SIZES];
    state.enemyGrid = Array(GRID_SIZE * GRID_SIZE).fill(null);
    state.weather = 'calm';
    state.ranked = false;
    state.mode = 'friend';
    state.opponent = null;
    state.botState = { difficulty: 'normal', mode: 'search', lastHits: [] };
    state.matchmaking = { active: false, cancelled: false, timer: 0, intervalId: null };
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}
