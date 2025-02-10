import TeleBot from 'telebot';

// Инициализация бота
const bot = new TeleBot(process.env.TELEGRAM_BOT_TOKEN);

// Обработчик любых текстовых сообщений
bot.on('text', async (msg) => {
    // Логируем приход сообщения, чтобы понять, откуда оно
    console.log(`Получено сообщение от ${msg.from.username}: ${msg.text}`);

    // Отправляем ответ "йоу" в ответ на любое сообщение
    await bot.sendMessage(msg.chat.id, 'йоу', { reply_to_message_id: msg.message_id });
});

export default bot