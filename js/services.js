/**
 * Сервисный слой: матчмейкинг, экономика, бот, статистика.
 * Ориентирован на SOLID: каждый класс отвечает за одну зону ответственности.
 */

import { ECONOMY, ABILITIES, WEATHER_TYPES } from './config.js';
import {
    getDb,
    enterMatchmakingQueue,
    leaveMatchmakingQueue,
    getMatchmakingQueue,
    getUser,
    setUser,
    incrementGlobalStats
} from './database.js';

/**
 * MatchmakingService
 * Отвечает за постановку в очередь, поиск соперника и создание игр (включая бота).
 */
export class MatchmakingService {
    constructor({ ratingDelta = 100, botWaitMs = 10000 } = {}) {
        this.ratingDelta = ratingDelta;
        this.botWaitMs = botWaitMs;
    }

    /**
     * Поставить игрока в очередь и попытаться найти соперника.
     * Возвращает { type: 'player', gameId } или { type: 'bot', gameId }.
     */
    async queueRandom(user) {
        await enterMatchmakingQueue(user.uid, user.rating);
        const start = Date.now();

        while (Date.now() - start < this.botWaitMs) {
            const match = await this.tryFindOpponent(user);
            if (match) {
                return { type: 'player', gameId: match.gameId };
            }
            await new Promise(r => setTimeout(r, 1500));
        }

        // Не нашли соперника — играем против бота
        await leaveMatchmakingQueue(user.uid);
        const gameId = await this.createBotGame(user);
        return { type: 'bot', gameId };
    }

    async tryFindOpponent(user) {
        const queue = await getMatchmakingQueue();
        const entries = Object.entries(queue);
        if (entries.length === 0) return null;

        let best = null;
        let bestDiff = Number.MAX_SAFE_INTEGER;

        for (const [uid, info] of entries) {
            if (uid === user.uid) continue;
            const rating = info.rating || ECONOMY.START_RATING;
            const diff = Math.abs(rating - (user.rating || ECONOMY.START_RATING));
            if (diff <= this.ratingDelta && diff < bestDiff) {
                best = { uid, rating };
                bestDiff = diff;
            }
        }

        if (!best) return null;

        const gameId = 'game_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        const hostUid = user.uid < best.uid ? user.uid : best.uid;
        const guestUid = user.uid < best.uid ? best.uid : user.uid;
        const weather = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];

        const gameRef = getDb().ref('games/' + gameId);
        await gameRef.set({
            status: 'waiting',
            mode: 'random',
            ranked: true,
            weather,
            createdAt: Date.now(),
            players: {
                host: hostUid,
                guest: guestUid
            },
            turn: null
        });

        await Promise.all([leaveMatchmakingQueue(user.uid), leaveMatchmakingQueue(best.uid)]);

        return { gameId };
    }

    /**
     * Создать игру против бота. Сложность зависит от рейтинга игрока.
     */
    async createBotGame(user) {
        const rating = user.rating || ECONOMY.START_RATING;
        let difficulty = 'normal';
        if (rating < 500) difficulty = 'easy';
        else if (rating > 1500) difficulty = 'hard';

        const gameId = 'game_bot_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        const weather = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];

        await getDb()
            .ref('games/' + gameId)
            .set({
                status: 'waiting',
                mode: 'random',
                ranked: true,
                weather,
                createdAt: Date.now(),
                players: {
                    host: user.uid,
                    guest: `bot:${difficulty}`
                },
                turn: null,
                bot: {
                    difficulty,
                    searchMode: 'search'
                }
            });

        return gameId;
    }
}

/**
 * BotPlayer
 * Не видит корабли напрямую, использует вероятностную карту.
 */
export class BotPlayer {
    constructor(difficulty = 'normal') {
        this.difficulty = difficulty; // easy | normal | hard
        this.errorChance = this.computeErrorChance(difficulty);
    }

    computeErrorChance(diff) {
        if (diff === 'easy') return 0.3;
        if (diff === 'hard') return 0.08;
        return 0.15;
    }

    /**
     * Выбор клетки для выстрела.
     * gameView: { gridSize, myShots[ idx: 'hit'|'miss'|null ], huntTargets: number[] }
     */
    chooseShot(gameView) {
        const { gridSize, myShots, huntTargets } = gameView;
        const size = gridSize * gridSize;
        const scores = new Array(size).fill(0);

        // Базовая вероятность — выше в центре
        for (let i = 0; i < size; i++) {
            if (myShots[i]) continue;
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            const centerDist = Math.abs(row - gridSize / 2) + Math.abs(col - gridSize / 2);
            scores[i] += Math.max(0, gridSize - centerDist);
        }

        // Hunt режим: усиливаем клетки вокруг последних попаданий
        for (const hitIdx of huntTargets || []) {
            const row = Math.floor(hitIdx / gridSize);
            const col = hitIdx % gridSize;
            const neighbors = [
                [row - 1, col],
                [row + 1, col],
                [row, col - 1],
                [row, col + 1]
            ];
            for (const [r, c] of neighbors) {
                if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) continue;
                const idx = r * gridSize + c;
                if (myShots[idx]) continue;
                scores[idx] += 20;
            }
        }

        // Небольшой шум случайности
        for (let i = 0; i < size; i++) {
            if (myShots[i]) continue;
            scores[i] += Math.random() * 5;
        }

        // Сортируем индексы по убыванию оценки
        const candidates = [...Array(size).keys()].filter(i => !myShots[i]);
        candidates.sort((a, b) => scores[b] - scores[a]);

        if (candidates.length === 0) return -1;

        // Ошибка: иногда выбираем не лучший выстрел
        const rnd = Math.random();
        if (rnd < this.errorChance && candidates.length > 3) {
            const randomBadIndex = Math.min(
                candidates.length - 1,
                3 + Math.floor(Math.random() * (candidates.length - 3))
            );
            return candidates[randomBadIndex];
        }

        return candidates[0];
    }
}

/**
 * EconomyService
 * Отвечает за экономику (покупка способностей, награды за матчи).
 */
export class EconomyService {
    async purchaseAbility(uid, abilityId) {
        const def = ABILITIES[abilityId];
        if (!def) throw new Error('Unknown ability: ' + abilityId);
        const user = await getUser(uid);
        if (!user) throw new Error('User not found');

        const cost = def.cost;
        const coins = user.coins ?? ECONOMY.START_COINS;
        if (coins < cost) throw new Error('Not enough coins');

        const newCoins = coins - cost;
        const currentCount = (user.abilities && user.abilities[abilityId]) || 0;
        const newCount = currentCount + 1;

        await setUser(uid, {
            coins: newCoins,
            abilities: {
                ...(user.abilities || {}),
                [abilityId]: newCount
            }
        });

        return { coins: newCoins, count: newCount };
    }
}

/**
 * MatchResultService
 * Применяет результаты матча (рейтинг, монеты, статы, глобальная аналитика).
 */
export class MatchResultService {
    /**
     * Применить результат матча к одному пользователю.
     * game: объект games/{gameId}, uid: auth.uid игрока.
     */
    async applyForUser(gameId, game, uid) {
        if (!game || !game.result) return;

        const user = await getUser(uid);
        if (!user) return;

        // защита от повторной обработки
        if (user.lastGameId === gameId) return;

        const ranked = !!game.ranked;
        const isWinner = game.result.winner === uid;
        const isLoser = game.result.loser === uid;

        if (!isWinner && !isLoser) return;

        let rating = user.rating ?? ECONOMY.START_RATING;
        let coins = user.coins ?? ECONOMY.START_COINS;
        let wins = user.wins ?? 0;
        let losses = user.losses ?? 0;
        let gamesPlayed = user.games ?? 0;

        if (ranked) {
            if (isWinner) {
                rating += ECONOMY.RANKED_WIN_RATING_DELTA;
            } else if (isLoser) {
                rating = Math.max(ECONOMY.MIN_RATING, rating + ECONOMY.RANKED_LOSS_RATING_DELTA);
            }
        }

        if (isWinner) {
            coins += ECONOMY.RANKED_WIN_COINS;
            wins += 1;
        } else if (isLoser) {
            coins += ECONOMY.RANKED_LOSS_COINS;
            losses += 1;
        }
        gamesPlayed += 1;

        await setUser(uid, {
            rating,
            coins,
            wins,
            losses,
            games: gamesPlayed,
            lastGameId: gameId,
            lastGameAt: game.result.finishedAt || Date.now()
        });

        const botGame = !!game.result.botGame;
        if (botGame) {
            await incrementGlobalStats({
                totalGamesDelta: 1,
                humanWinsDelta: isWinner ? 1 : 0,
                botWinsDelta: isLoser ? 1 : 0
            });
        } else {
            await incrementGlobalStats({ totalGamesDelta: 1 });
        }
    }
}

/**
 * StatsService
 * Отвечает за запись matchHistory и агрегированную активность по часам.
 */
export class StatsService {
    getHourBucket(timestamp) {
        const d = new Date(timestamp);
        const Y = d.getUTCFullYear();
        const M = String(d.getUTCMonth() + 1).padStart(2, '0');
        const D = String(d.getUTCDate()).padStart(2, '0');
        const H = String(d.getUTCHours()).padStart(2, '0');
        return `${Y}-${M}-${D}-${H}`;
    }

    async recordMatch(gameId, game) {
        if (!game || !game.result) return;
        const db = getDb();

        // Если матч уже записан в историю — ничего не делаем (идемпотентность).
        const historyRef = db.ref('matchHistory/' + gameId);
        const snap = await historyRef.once('value');
        if (snap.exists()) return;

        const createdAt = game.createdAt || Date.now();
        const finishedAt = game.result.finishedAt || Date.now();
        const durationMs = Math.max(0, finishedAt - createdAt);

        const summary = {
            createdAt,
            finishedAt,
            mode: game.mode || 'random',
            ranked: !!game.ranked,
            weather: game.weather || 'calm',
            players: game.players || {},
            winner: game.result.winner,
            loser: game.result.loser,
            botGame: !!game.result.botGame,
            durationMs
        };

        await historyRef.set(summary);

        // Активность по часам
        const bucket = this.getHourBucket(finishedAt);
        const actRef = db.ref('stats/activity/' + bucket);
        await actRef.transaction(current => {
            const cur = current || {};
            return {
                onlineCount: cur.onlineCount || 0, // можно обновлять отдельно
                matches: (cur.matches || 0) + 1
            };
        });
    }
}

/**
 * AchievementsService
 * Простая система ачивок: без способностей, быстрый матч, серия побед.
 */
export class AchievementsService {
    async updateForUser(gameId, game, uid) {
        if (!game || !game.result) return;
        const user = await getUser(uid);
        if (!user) return;

        const achievements = user.achievements || {};
        let changed = false;

        const isWinner = game.result.winner === uid;

        // Победа без способностей
        if (isWinner) {
            const used = game.abilitiesUsed && game.abilitiesUsed[uid];
            if (!used || Object.keys(used).length === 0) {
                if (!achievements.no_abilities_win) {
                    achievements.no_abilities_win = true;
                    changed = true;
                }
            }
        }

        // Быстрая победа: < 10 ходов (для матчей против бота)
        if (isWinner && game.result.botGame) {
            const playerShots = game.playerShots ? Object.keys(game.playerShots).length : 0;
            const botShots = game.botShots ? Object.keys(game.botShots).length : 0;
            if (playerShots + botShots < 10) {
                if (!achievements.fast_win) {
                    achievements.fast_win = true;
                    changed = true;
                }
            }
        }

        // Серия побед (5 и более)
        let streak = user.currentWinStreak || 0;
        let bestStreak = user.bestWinStreak || 0;
        if (isWinner) {
            streak += 1;
            if (streak > bestStreak) bestStreak = streak;
            if (streak >= 5 && !achievements.win_streak_5) {
                achievements.win_streak_5 = true;
                changed = true;
            }
        } else {
            streak = 0;
        }

        if (changed || streak !== user.currentWinStreak || bestStreak !== user.bestWinStreak) {
            await setUser(uid, {
                achievements,
                currentWinStreak: streak,
                bestWinStreak: bestStreak
            });
        }
    }
}

