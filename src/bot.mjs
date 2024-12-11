const TeleBot = require('telebot');
const schedule = require('node-schedule');

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

  // Первое сообщение с кнопками
  const firstMessage = `Привет, ${firstName}! 🎉\n\nМы рады, что ты решил попробовать нашу новую игру! Она создана специально для того, чтобы помочь тебе научиться финансовой грамотности в увлекательном формате гонки. Чем быстрее и правильнее ты будешь отвечать на вопросы, тем быстрее поедет твой автомобиль!\n\nЧтобы начать игру, просто нажми на кнопку ниже. Удачи и приятного путешествия в мир финансов! 🚀💰`;

  await bot.sendMessage(chatId, firstMessage, {
    parseMode: 'Markdown',
    replyMarkup: bot.keyboard([
      ['Начать игру 🕹', 'Правила 📜']
    ], { resize: true })
  });
});

// Автоматическое сообщение каждые два часа всем пользователям
schedule.scheduleJob('0 */2 * * *', async () => {
  for (const chatId of users) {
    try {
      await bot.sendMessage(chatId, 'Давно тебя не было в уличных гонках! 🏎💨');
    } catch (error) {
      console.error(`Ошибка отправки сообщения пользователю ${chatId}:`, error);
    }
  }
});

export default bot;
