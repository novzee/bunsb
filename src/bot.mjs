import TeleBot from 'telebot';

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

export default bot;
