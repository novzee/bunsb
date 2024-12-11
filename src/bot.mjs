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
    firstMessage = `Привет! 🎉\n\nМы рады, что ты решил попробовать нашу новую игру!\n\nОна создана специально для того, чтобы помочь тебе научиться финансовой грамотности в увлекательном формате гонки. Чем быстрее и правильнее ты будешь отвечать на вопросы, тем быстрее поедет твой автомобиль!\n\nЧтобы начать игру, просто нажми на кнопку ниже. Удачи и приятного путешествия в мир финансов! 🚀💰`;

    rulesMessage = `📜 *Правила игры ФинГонки*\n\nФинГонки — это игра на базе Telegram, цель которой — повысить твою финансовую грамотность через захватывающие автогонки. Вот основные моменты:\n\n1. *Карта 🗺*: Начни заезд, выбрав район и изучив теоретический материал.\n2. *Гараж 🏠*: Управляй своими автомобилями — улучшай их или покупай новые.\n3. *Таблица лидеров 🏅*: Сравнивай свои достижения с другими участниками и поднимайся в рейтинге.\n\nОтвечай на вопросы быстро и правильно, чтобы твой автомобиль мчался к победе! 🏎️💨`;

    startGameLabel = 'Начать игру 🕹';
    rulesLabel = 'Правила 📜';
  } else if (selectedLanguage === 'be') {
    firstMessage = `Вітаем! 🎉\n\nМы рады, што ты вырашыў спрабаваць нашу новую гульню!\n\nЯна створана для таго, каб дапамагчы табе вывучыць фінансавую грамату ў займальным фармаце гонкі. Чым хутчэй і правільней ты будзеш адказваць на пытанні, тым хутчэй паедзе твой аўтамабіль!\n\nКаб пачаць гульню, проста націсні на кнопку ніжэй. Удачы і прыемнага падарожжа ў свет фінансаў! 🚀💰`;

    rulesMessage = `📜 *Правілы гульні ФінГонкі*\n\nФінГонкі — гэта гульня на аснове Telegram, мэтай якой з'яўляецца павышэнне фінансавай граматнасці праз захапляльныя гонкі. Асноўныя моманты:\n\n1. *Карта 🗺*: Пачні гонку, выбраўшы раён і вывучыўшы тэарэтычны матэрыял.\n2. *Гараж 🏠*: Кіруй сваімі аўтамабілямі — паляпшай іх або набывай новыя.\n3. *Табліца лідараў 🏅*: Параўноўвай свае дасягненні з іншымі ўдзельнікамі і падымайся ў рэйтынгу.\n\nАдказвай на пытанні хутка і правільна, каб твой аўтамабіль імчаўся да перамогі! 🏎️💨`;

    startGameLabel = 'Пачаць гульню 🕹';
    rulesLabel = 'Правілы 📜';
  } else if (selectedLanguage === 'kk') {
    firstMessage = `Сәлем! 🎉\n\nБіз сіздің жаңа ойынымызды сынап көру шешіміңізге қуаныштымыз!\n\nОйын сізге қаржылық сауаттылықты автожарыс форматында үйренуге көмектеседі. Сұрақтарға жылдам әрі дұрыс жауап берсеңіз, сіздің көлігіңіз жылдамырақ жүреді!\n\nОйынды бастау үшін төмендегі батырманы басыңыз. Қаржы әлемінде сәтті сапар тілейміз! 🚀💰`;

    rulesMessage = `📜 *ФинГонки ойынының ережелері*\n\nФинГонки — бұл Telegram негізіндегі ойын, оның мақсаты — қызықты жарыстар арқылы қаржылық сауаттылықты арттыру. Негізгі бөлімдер:\n\n1. *Карта 🗺*: Аймақты таңдап, теориялық бөлімнен өтіп, жарысты бастаңыз.\n2. *Гараж 🏠*: Көліктеріңізді басқарыңыз — жаңасын сатып алыңыз немесе барын жақсартыңыз.\n3. *Лидерлер кестесі 🏅*: Өз жетістіктеріңізді басқалармен салыстырып, рейтингте жоғарылаңыз.\n\nСұрақтарға жылдам әрі дұрыс жауап беріп, жеңіске жетіңіз! 🏎️💨`;

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

  // Сохраняем правила для пользователя
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
