<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TG Multiplayer Test</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
        body { font-family: sans-serif; text-align: center; background: #eee; padding-top: 50px; }
        #counter { font-size: 80px; font-weight: bold; color: #0088cc; }
        button { padding: 20px 40px; font-size: 20px; cursor: pointer; border-radius: 12px; border: none; background: #0088cc; color: white; }
        button:active { background: #005588; }
    </style>
</head>
<body>

    <h1>Счётчик:</h1>
    <div id="counter">0</div>
    <br>
    <button id="btn">ПЛЮС ОДИН!</button>

    <!-- Подключаем Firebase SDK -->
    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getDatabase, ref, onValue, set, runTransaction } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

        // ТВОИ ДАННЫЕ ИЗ FIREBASE CONSOLE:
        const firebaseConfig = {
        apiKey: "AIzaSyBzu_EqbYoHR9AGRjNTjlCX2f4seIMgpwk",
        authDomain: "test-game-bf099.firebaseapp.com",
        databaseURL: "https://test-game-bf099-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "test-game-bf099",
        storageBucket: "test-game-bf099.firebasestorage.app",
        messagingSenderId: "624705252854",
        appId: "1:624705252854:web:f24eb7255da54c47902bd7",
        measurementId: "G-TVDRXT9CHV"
    };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        const countRef = ref(db, 'clicks/count');

        const counterElement = document.getElementById('counter');
        const button = document.getElementById('btn');

        // 1. СЛУШАЕМ ИЗМЕНЕНИЯ (Real-time)
        onValue(countRef, (snapshot) => {
            const data = snapshot.val();
            counterElement.innerText = data || 0;
        });

        // 2. ЗАПИСЫВАЕМ ПРИ НАЖАТИИ
        button.onclick = () => {
            // Используем транзакцию, чтобы два игрока одновременно не "сломали" счет
            runTransaction(countRef, (currentCount) => {
                return (currentCount || 0) + 1;
            });
        };

        // Сообщаем Telegram, что приложение готово
        window.Telegram.WebApp.ready();
    </script>
</body>
</html>
