import TeleBot from 'telebot';
import { Mistral } from '@mistralai/mistralai';

// Инициализация бота
const bot = new TeleBot(process.env.TELEGRAM_BOT_TOKEN);
const apiKey = process.env.API_KEY;
const client = new Mistral({ apiKey: apiKey });

// Массив для хранения chatId пользователей
const users = {}; // Объект для хранения данных о пользователях
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

// Переменная для отслеживания количества команд /start
let startCommandCounter = 0;

// Обработчик команды /start
bot.on('/start', async (msg) => {
    startCommandCounter++;
    console.log(`Received /start command. Counter: ${startCommandCounter}`);

    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'there';

    // Сохраняем chatId пользователя
    users[chatId] = {}; // Инициализация данных для пользователя
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
    await forwardMessageToAdmin(msg, 'Пользователь нажал /start');
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
      rulesMessage = `Благодарим тебя за проявленный интерес!\n\nФинГонки - игра на базе приложения Телеграм. Чтобы принять участие не нужно скачивать дополнительные файлы или переходить на другие сайты - все легко и быстро! 🚀\n\nДействие игры начинается в главном меню, здесь ты можешь перейти в один из 3 разделов:\n1. Карта 🗺\n2. Гараж 🏠\n3. Таблица лидеров 🏅\n\n📍 Карта – ключевая точка, с которой начинается любой заезд в ФинГонках! Выбирай район и погружайся в мир финансовой грамотности! Дальше тебя ждет небольшой теоретический блок с полезной информацией, только после него начинается настоящая гонка! Чем быстрее и правильнее ты отвечаешь на вопросы по пройденному материалу, тем быстрее едет твой автомобиль! Будь внимательным и не дай сопернику себя обогнать! Каждая победа приносит денежный приз и очки славы 🏆\n\n📍 Гараж – место, где находятся все твои автомобили (все как в жизни!) Здесь ты можешь выбрать новый транспорт или прокачать уже имеющийся. Распоряжайся своими средствами с умом!\n\n📍 Таблица лидеров – здесь ты можешь посмотреть свое место в рейтинге, сравнить свои достижения с друзьями и насладиться своими победами!\n\nПоехали? 🏎🏎`;
        startGameLabel = 'Начать игру 🕹';
        rulesLabel = 'Правила 📜';
    } else if (selectedLanguage === 'be') {
      firstMessage = `Вітаем! 🎉\n\nМы рады, што ты вырашыў спрабаваць нашу новую гульню!\n\nЯна створана спецыяльна для таго, каб дапамагчы табе вывучыць фінансавую грамацнасць у цікавым фармаце гонак. Чым хутчэй і правільней ты будзеш адказваць на пытанні, тым хутчэй паедзе твой аўтамабіль!\n\nКаб пачаць гульню, проста націсні на кнопку ніжэй. Пошчасці і прыемнай падарожы ў свет фінансаў! 🚀💰`;
      rulesMessage = `Дзякуем за праяўлены інтарэс!\n\nФінГонкі - гульня на аснове прыкладання Тэлеграм. Каб прыняць удзел не трэба запампаваць дадатковыя файлы або пераходзіць на іншыя сайты - усё лёгка і хутка! 🚀\n\nДзеянне гульні пачынаецца ў галоўным меню, тут ты можаш перайсці ў адзін з 3 раздзелаў:\n1. Карта 🗺\n2. Гараж 🏠\n3. Табліца лідараў 🏅\n\n📍 Карта – ключавая кропка, з якой пачынаецца любы заезд у ФінГонках! Выбірай раён і пагружайся ў свет фінансавай грамацнасці! Далей цябе чакае невялічкі тэарэтычны блок з карыснай інфармацыяй, толькі пасля яго пачынаецца сапраўдная гонка! Чым хутчэй і правільней ты адказваеш на пытанні па прайдзеным матэрыяле, тым хутчэй едзе твой аўтамабіль! Будзь уважлівым і не дай суперніку сябе абгнаць! Каждая перамога прыносіць грашовы прыз і балы славы 🏆\n\n📍 Гараж – месца, дзе знаходзяцца ўсе твае аўтамабілі (усё як у жыцці!) Тут ты можаш выбраць новы транспарт або пракачаць ужо існуючы. Распараджайся сваімі сродкамі з розумам!\n\n📍 Табліца лідараў – тут ты можаш паглядзець сваё месца ў рэйтынгу, параўнаць свае дасягненні з сябрамі і насладзіцца сваімі перамогамі!\n\nПоехалі? 🏎🏎`;
        startGameLabel = 'Пачаць гульню 🕹';
        rulesLabel = 'Правілы 📜';
    } else if (selectedLanguage === 'kk') {
      firstMessage = `Сәлем! 🎉\n\nБіз оңайыңызды жаңа ойынды сынап көруге шешіміңізге қуаныштымыз!\n\nОл қиялдағы автожарыста қиындықтарды қиялдағы қаржылық сауаттылықты үйрену үшін арналған.\n\nСіз тапсырмаларға тезірек және дұрыс жауап берсеңіз, сіздің автокөлігіңіз тезірек жүреді!\n\nОйынды бастау үшін төмендегі түймеге басыңыз. Құтты болсын және қаржы әлемінде жақсы сапар болсын! 🚀💰`;
      rulesMessage = `Қызықтырудың көрсеткен қызығушылығыңызға рахмет!\n\nФинГонки - Telegram қолданбасының негізіндегі ойын. Қатысу үшін қосымша файлдарды жүктемеу немесе басқа сайттарға өту қажет емес - барлығы оңай және тез! 🚀\n\nОйын әрекеті негізгі менюден басталады, мұнда сіз 3 бөлімнің біреуіне өтуіңізге болады:\n1. Карта 🗺\n2. Гараж 🏠\n3. Лидерлер кестесі 🏅\n\n📍 Карта - ФинГонкадағы әрбір жарыс басталатын негізгі нүкте! Аймақты таңдаңыз және қаржылық сауаттылық әлеміне бұрылыңыз! Кейін сіз пайдалы ақпаратпен қысқа теориялық блок күтеді, тек содан кейін нағыз жарыс басталады! Өткен материал бойынша тапсырмаларға тезірек және дұрыс жауап берсеңіз, сіздің автокөлігіңіз тезірек жүреді! Ескеріңіз және қарсыластың сізді асып түсуге мүмкіндік бермеңіз! Әрбір жеңіс қаржылық жүлде және даңқ ұпайларын әкеледі 🏆\n\n📍 Гараж - барлық автокөліктеріңіз орналасқан жер (барлығы тіріліктегідей!). Мұнда сіз жаңа транспортты таңдауға немесе әзір барушыны жақсартуға болады. Өзіңіздің қаражатыңызды ақылмен пайдаланыңыз!\n\n📍 Лидерлер кестесі - мұнда сіз өзіңіздің рейтингтегі орныңызды көруіңізге, достыңызбен салыстыруыңызға және жеңістеріңізбен ләззаттануыңызға болады!\n\nПоехали? 🏎🏎`;
        startGameLabel = 'Ойынды бастау 🕹';
        rulesLabel = 'Ережелер 📜';
    }

    // Отправка первого сообщения с кнопками
    await bot.sendMessage(chatId, firstMessage, {
        parseMode: 'Markdown',
        replyMarkup: bot.inlineKeyboard([
            [bot.inlineButton(startGameLabel, { url: 'https://racingapp.devnullteam.ru' })],
            [bot.inlineButton(rulesLabel, { callback: 'show_rules' })],
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
            await bot.sendMessage(chatId, rulesMessage, { parseMode: 'Markdown', replyMarkup: bot.inlineKeyboard([
              [bot.inlineButton(startGameLabel, { url: 'https://racingapp.devnullteam.ru' })],
          ]) });
        } else {
            await bot.sendMessage(chatId, 'Правила пока недоступны.');
        }
    }
    await forwardMessageToAdmin(msg, 'Пользователь прочитал правила');
});

// Обработчик команды /on для включения ответов AI
bot.on('/on', async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'there';
    const startMessage = `Привет, ${firstName}! 👋 ...`;

    userSettings[chatId] = { aiEnabled: true };
    await bot.sendMessage(chatId, startMessage, { parse_mode: 'Markdown' });
    initializeUserSession(chatId);
    await forwardMessageToAdmin(msg, 'Пользователь включил ответы AI');
});

// Обработчик команды /off для отключения ответов AI
bot.on('/off', async (msg) => {
    const chatId = msg.chat.id;
    userSettings[chatId] = { aiEnabled: false };
    await bot.sendMessage(chatId, '🤖 Ответы AI отключены!');
    await forwardMessageToAdmin(msg, 'Пользователь отключил ответы AI');
});

// Обработчик команды /clear для очистки истории сообщений
bot.on('/clear', async (msg) => {
    const chatId = msg.chat.id;
    clearUserSession(chatId);
    await bot.sendMessage(chatId, '🗑 Ваша история сообщений была очищена.');
    await forwardMessageToAdmin(msg, 'Пользователь очистил историю сообщений');
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
    await forwardMessageToAdmin(msg, 'Пользователь запросил историю сообщений');
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
    await forwardMessageToAdmin(msg, 'Пользователь отправил сообщение');
});

// Запуск бота
export default bot;
