/**
 * Конфигурация Firebase и константы приложения.
 */

export const ADMIN_IDS = [123456789, 987654321];

export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBzu_EqbYoHR9AGRjNTjlCX2f4seIMgpwk",
  authDomain: "test-game-bf099.firebaseapp.com",
  databaseURL: "https://test-game-bf099-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "test-game-bf099",
  storageBucket: "test-game-bf099.firebasestorage.app",
  messagingSenderId: "624705252854",
  appId: "1:624705252854:web:f24eb7255da54c47902bd7",
  measurementId: "G-TVDRXT9CHV"
};

export const GRID_SIZE = 10;
export const SHIP_SIZES = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

export const TEXTS = {
    en: {
        welcome: "Welcome, Commander",
        deploy: "DEPLOY",
        create_battle: "CREATE BATTLE",
        shop: "SHOP",
        deploy_fleet: "Deploy Fleet",
        select_ship: "Select Ship:",
        ready: "READY FOR BATTLE",
        waiting: "Waiting for opponent...",
        your_turn: "YOUR TURN",
        enemy_turn: "ENEMY TURN",
        nick_placeholder: "Nickname...",
        back: "Back",
        opponent_left: "Opponent left the game"
    },
    ru: {
        welcome: "Добро пожаловать",
        deploy: "В БОЙ",
        create_battle: "СОЗДАТЬ БИТВУ",
        shop: "МАГАЗИН",
        deploy_fleet: "Расстановка",
        select_ship: "Выберите корабль:",
        ready: "К БОЮ",
        waiting: "Ждем противника...",
        your_turn: "ВАШ ХОД",
        enemy_turn: "ХОД ВРАГА",
        nick_placeholder: "Ник...",
        back: "Назад",
        opponent_left: "Противник вышел из игры"
    }
};
