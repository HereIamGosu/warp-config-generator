const express = require('express');
const { getWarpConfigLink } = require('./warpConfig');
const path = require('path');

const app = express();

// Подключаем статические файлы (путь 'public' можно сразу передавать в метод express.static)
app.use(express.static(path.resolve(__dirname, 'public')));

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Маршрут для генерации конфигурации
app.get('/warp', async (req, res) => {
    try {
        // Получение ссылки на конфиг
        const content = await getWarpConfigLink();
        
        if (content) {
            res.json({ success: true, content });
        } else {
            // Уточняющее сообщение для клиента
            res.status(500).json({ success: false, message: 'Не удалось сгенерировать конфиг.' });
        }
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        // Обработка ошибок с более информативным сообщением
        res.status(500).json({ success: false, message: 'Произошла ошибка на сервере. Попробуйте позже.' });
    }
});

module.exports = app;
