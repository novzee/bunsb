import TeleBot from 'telebot';
import fs from 'fs';
import schedule from 'node-schedule';

const bot = new TeleBot(process.env.TELEGRAM_BOT_TOKEN);

// Массив для хранения chatId пользователей
const users = new Set();

let startCommandCounter = 0;
const counterFilePath = './startCommandCounter.txt';

// Загрузка значения счетчика из файла при запуске
if (fs.existsSync(counterFilePath)) {
  const counterValue = fs.readFileSync(counterFilePath, 'utf8');
  startCommandCounter = parseInt(counterValue, 10) || 0;
}

// Обработчик команды /start
bot.on(/\/start/, async (msg) => {
  startCommandCounter++;
  console.log(`Received /start command. Counter: ${startCommandCounter}`);
  
  // Сохранение значения счетчика в файл
  fs.writeFileSync(counterFilePath, startCommandCounter.toString());

  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'there';

  // Сохраняем chatId пользователя
  users.add(chatId);

  // Первое сообщение с кнопками
  const firstMessage = `Привет, ${firstName}! 🎉\n\nМы рады, что ты решил попробовать нашу новую игру! Она создана специально для того, чтобы помочь тебе научиться финансовой грамотности в увлекательном формате гонки. Чем быстрее и правильнее ты будешь отвечать на вопросы, тем быстрее поедет твой автомобиль!\n\nЧтобы начать игру, просто нажми на кнопку ниже. Удачи и приятного путешествия в мир финансов! 🚀💰`;

  await bot.sendMessage(chatId, firstMessage, {
    parseMode: 'Markdown',
    replyMarkup: bot.keyboard([
      // Добавьте кнопки здесь
    ])
  });
});

// Автоматическое сообщение каждые два часа всем пользователям
schedule.scheduleJob('0 */2 * * *', () => {
  for (const chatId of users) {
    bot.sendMessage(chatId, 'Давно тебя не было в уличных гонках! 🏎💨');
  }
});

// Запуск бота
export default bot;
