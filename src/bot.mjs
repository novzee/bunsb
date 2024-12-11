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
bot.on('/on', async (msg) => {
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
bot.on('/start', async (msg) => {
  startCommandCounter++;
  console.log(`Received /start command. Counter: ${startCommandCounter}`);

  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'there';

  // Сохраняем chatId пользователя
  users.add(chatId);
  console.log(`Added user: ${chatId}`);

  // Сообщение с кнопками выбора языка
  const languageSelectionMessage = `Привет, ${firstName}! 🎉\n\nПожалуйста, выбери язык:`;

  await bot.sendMessage(chatId, languageSelectionMessage, {
    parseMode: 'Markdown',
    replyMarkup: bot.inlineKeyboard([
      [bot.inlineButton('Русский 🇷🇺', { callback: 'ru' })],
      [bot.inlineButton('Беларусский 🇧🇾', { callback: 'be' })],
      [bot.inlineButton('Казахстанский 🇰🇿', { callback: 'kk' })]
    ])
  });
});

// Обработчик нажатия кнопки выбора языка
bot.on('callbackQuery', async (msg) => {
  const chatId = msg.message.chat.id;
  const selectedLanguage = msg.data;

  let firstMessage = '';
  let rulesMessage = '';
  let startGameLabel = '';
  let rulesLabel = '';

  if (selectedLanguage === 'ru') {
    firstMessage = `Привет! 🎉\n\nМы рады, что ты решил попробовать нашу новую игру! 🚀💰`;
    rulesMessage = `Правила игры на русском языке 📜\n\n...`;
    startGameLabel = 'Начать игру 🕹';
    rulesLabel = 'Правила 📜';
  } else if (selectedLanguage === 'be') {
    firstMessage = `Вітаем! 🎉\n\nМы рады, што ты вырашыў спрабаваць нашу новую гульню! 🚀💰`;
    rulesMessage = `Правілы гульні на беларускай мове 📜\n\n...`;
    startGameLabel = 'Пачаць гульню 🕹';
    rulesLabel = 'Правілы 📜';
  } else if (selectedLanguage === 'kk') {
    firstMessage = `Сәлем! 🎉\n\nБіз жаңа ойынды сынап көруге шешіміңізге қуаныштымыз! 🚀💰`;
    rulesMessage = `Ойын ережелері қазақ тілінде 📜\n\n...`;
    startGameLabel = 'Ойынды бастау 🕹';
    rulesLabel = 'Ережелер 📜';
  }

  // Отправка первого сообщения с кнопками
  await bot.sendMessage(chatId, firstMessage, {
    parseMode: 'Markdown',
    replyMarkup: bot.inlineKeyboard([
      [bot.inlineButton(startGameLabel, { url: 'https://racingapp.devnullteam.ru' })],
      [bot.inlineButton(rulesLabel, { callback: 'show_rules' })]
    ])
  });

  // Сохраняем правила в памяти для дальнейшего использования
  users[chatId] = rulesMessage;
});

// Обработчик нажатия кнопки "Правила"
bot.on('callbackQuery', async (msg) => {
  if (msg.data === 'show_rules') {
    const chatId = msg.message.chat.id;
    const rulesMessage = users[chatId];

    if (rulesMessage) {
      await bot.sendMessage(chatId, rulesMessage, { parseMode: 'Markdown' });
    } else {
      await bot.sendMessage(chatId, 'Правила пока недоступны.');
    }
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
