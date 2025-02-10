import TeleBot from 'telebot';

// Инициализация бота
const bot = new TeleBot(process.env.TELEGRAM_BOT_TOKEN);

// ID канала или группы, откуда приходят посты
const blogChannelId = '@tttttteess'; // Замените на ID или username вашего канала

// Обработчик новых сообщений
bot.on('text', async (msg) => {
    // Проверяем, является ли сообщение постом в блоге
    if (msg.chat.username === blogChannelId || msg.chat.id === blogChannelId) {
        // Логируем действие, чтобы увидеть, что за пост был получен
        console.log(`Новый пост в блоге от пользователя ${msg.from.username}: ${msg.text}`);

        // Отправляем "йоу" в качестве комментария
        await bot.sendMessage(msg.chat.id, 'йоу', { reply_to_message_id: msg.message_id });
    }
});

export default bot;
