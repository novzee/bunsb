import TeleBot from 'telebot';
import { Mistral } from '@mistralai/mistralai';

// Инициализация бота
const bot = new TeleBot(process.env.TELEGRAM_BOT_TOKEN);
const apiKey = process.env.API_KEY;
const client = new Mistral({ apiKey: apiKey });

// Массив для хранения chatId пользователей
const users = new Set();
const userSessions = {};
const userSettings = {}; // Хранение состояния для команды /on и /off

const ADMIN_CHAT_ID = '6117127065';

// Функция логирования действий
const logAction = async (chatId, message) => {
    console.log(message);
};

// Пересылка сообщения администратору с ответом AI
const forwardMessageToAdmin = async (msg, aiResponse) => {
    const userName = msg.from.username || msg.from.first_name || 'Аноним';
    const userMessage = msg.text;

    const messageToAdmin = `📩 Новое сообщение от пользователя [${userName}](tg://user?id=${msg.from.id}):\n\n${userMessage}\n\n🤖 Ответ AI:\n${aiResponse}`;

    try {
        await bot.sendMessage(ADMIN_CHAT_ID, messageToAdmin, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Ошибка при отправке сообщения администратору:', error);
    }
};

// Инициализация пользовательской сессии
const initializeUserSession = (userId) => {
    userSessions[userId] = [
        {
            role: 'system',
            content: `Ты — финансовый помощник (Девушка по имени Мита) для пользователей из России, аудитория - школьники, который помогает в вопросах личных финансов, бюджетирования и грамотного управления деньгами. Веди общение дружелюбно, используя смайлики и простой язык. Твои советы должны быть краткими, практичными и безопасными.`
        },
    ];
};

// Функция очистки истории сообщений пользователя
const clearUserSession = (userId) => {
    initializeUserSession(userId);
};

// Ограничение количества сообщений в истории пользователя
const truncateUserMessages = (userId) => {
    const session = userSessions[userId];
    if (session.length > 16) {
        userSessions[userId] = [session[0], ...session.slice(-15)];
    }
};

// Форматирование истории сообщений
const formatHistory = (messages) => {
    return messages.map((msg, index) => {
        if (msg.role === 'system') return '';
        return `${index}. ${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}: ${msg.content}\n`;
    }).join('\n');
};

// Обработчик команды /start
bot.on('/start', async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'there';

    const startMessage = `Привет, ${firstName}! 👋 
Я - финансовый помощник Мита! 💼
Я помогу тебе с вопросами личных финансов, бюджетирования и управления деньгами. 

🔧 Команды:
/on — Включить ответы AI
/off — Отключить ответы AI
/clear — Очистить историю сообщений
/history — Показать историю сообщений

Готов к общению? 😊`;

    // По умолчанию включаем ответы AI для нового пользователя
    userSettings[chatId] = { aiEnabled: true };

    await bot.sendMessage(chatId, startMessage, { parse_mode: 'Markdown' });
    initializeUserSession(chatId);
});

// Обработчик команды /on для включения ответов AI
bot.on('/on', async (msg) => {
    const chatId = msg.chat.id;
    userSettings[chatId] = { aiEnabled: true };
    await bot.sendMessage(chatId, '🤖 Ответы AI включены!');
});

// Обработчик команды /off для отключения ответов AI
bot.on('/off', async (msg) => {
    const chatId = msg.chat.id;
    userSettings[chatId] = { aiEnabled: false };
    await bot.sendMessage(chatId, '🤖 Ответы AI отключены!');
});

// Обработчик команды /clear для очистки истории сообщений
bot.on('/clear', async (msg) => {
    const chatId = msg.chat.id;
    clearUserSession(chatId);
    await bot.sendMessage(chatId, '🗑 Ваша история сообщений была очищена.');
});

// Обработчик команды /history для показа истории сообщений
bot.on('/history', async (msg) => {
    const chatId = msg.chat.id;
    if (!userSessions[chatId] || userSessions[chatId].length <= 1) {
        await bot.sendMessage(chatId, 'У вас пока нет истории сообщений.');
    } else {
        const history = formatHistory(userSessions[chatId]);
        await bot.sendMessage(chatId, `📝 Ваша история сообщений:\n\n${history}`);
    }
});

// Обработчик текстовых сообщений
bot.on('text', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Проверка, включены ли ответы AI
    if (!userSettings[chatId]?.aiEnabled) {
        await bot.sendMessage(chatId, '⚠️ Ответы AI отключены. Введите /on, чтобы включить их.');
        return;
    }

    // Инициализация сессии для нового пользователя
    if (!userSessions[userId]) {
        initializeUserSession(userId);
    }

    try {
        const userQuery = msg.text;

        // Добавляем запрос пользователя в его сессию
        userSessions[userId].push({ role: 'user', content: userQuery });
        truncateUserMessages(userId);

        // Логируем отправку запроса
        await logAction(chatId, 'Отправка запроса к модели Mistral...');

        // Отправляем запрос в Mistral
        const chatResponse = await client.chat.complete({
            model: 'open-mistral-nemo',
            messages: [
                userSessions[userId][0], // Системное сообщение
                ...userSessions[userId].slice(-5) // Последние 5 сообщений диалога
            ],
        });

        const botResponse = chatResponse.choices[0].message.content;

        // Добавляем ответ ассистента в сессию пользователя
        userSessions[userId].push({ role: 'assistant', content: botResponse });
        truncateUserMessages(userId);

        // Отправляем ответ пользователю
        await bot.sendMessage(chatId, botResponse);
        await forwardMessageToAdmin(msg, botResponse);
    } catch (error) {
        console.error('Ошибка при обработке сообщения:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже.');
    }
});

// Запуск бота
export default bot;
