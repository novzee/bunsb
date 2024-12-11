import TeleBot from 'telebot';
import schedule from 'node-schedule';

// Инициализация бота
const bot = new TeleBot(process.env.TELEGRAM_BOT_TOKEN);

// Массив для хранения chatId пользователей
const users = new Set();

let startCommandCounter = 0;

// Обработчик команды /start
bot.on('/start', async (msg) => {
  startCommandCounter++;
  console.log(`Received /start command. Counter: ${startCommandCounter}`);

  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'there';

  // Сохраняем chatId пользователя
  users.add(chatId);
  console.log(`Added user: ${chatId}`);

  // Первое сообщение с кнопками
  const firstMessage = `Привет, ${firstName}! 🎉\n\nМы рады, что ты решил попробовать нашу новую игру!`;

  await bot.sendMessage(chatId, firstMessage, {
    parseMode: 'Markdown',
    replyMarkup: bot.inlineKeyboard([
      [
        bot.inlineButton('Начать игру 🕹', { url: 'https://racingapp.devnullteam.ru' }),
        bot.inlineButton('Правила 📜', { callback: 'show_rules' })
      ]
    ])
  });
});

// Обработчик нажатия кнопки "Правила"
bot.on('callbackQuery', async (msg) => {
  if (msg.data === 'show_rules') {
    const chatId = msg.message.chat.id;

    const rulesMessage = `*ПРАВИЛА ИГРЫ*\n\nБлагодарим тебя за проявленный интерес! 🚀\n\n1. *Карта* 🗺\n2. *Гараж* 🏠\n3. *Таблица лидеров* 🏅\n\nПоехали? 🏎🏎`;

    await bot.sendMessage(chatId, rulesMessage, { parseMode: 'Markdown' });
  }
});

// Автоматическое сообщение каждые две минуты
schedule.scheduleJob('*/2 * * * *', async () => {
  console.log(`Запущена задача по расписанию в ${new Date().toLocaleTimeString()}`);

  if (users.size === 0) {
    console.log('Нет пользователей для отправки сообщений.');
    return;
  }

  for (const chatId of users) {
    try {
      await bot.sendMessage(chatId, 'Давно тебя не было в уличных гонках! 🏎💨');
      console.log(`Сообщение успешно отправлено пользователю ${chatId}`);
    } catch (error) {
      console.error(`Ошибка отправки сообщения пользователю ${chatId}:`, error.message);
    }
  }
});

export default bot;
