import TeleBot from 'telebot';

// Инициализация бота
const bot = new TeleBot(process.env.TELEGRAM_BOT_TOKEN);

const RULES_TEXT = "Пожалуйста, ознакомьтесь с правилами группы:\n1. Правило первое\n2. Правило второе\n...";

// Обработка новых сообщений (постов) от администратора
bot.on('text', (msg) => {
  // Если сообщение отправлено администратором (ID: 136817688) и не является ответом
  if (msg.from.id === 136817688 && !msg.reply_to_message) {
    // Отправляем сообщение с правилами в виде ответа к посту
    bot.sendMessage(msg.chat.id, RULES_TEXT, {
      reply_to_message_id: msg.message_id
    });
  }
});

// Обработка комментариев (сообщений-ответов) под постом
bot.on('text', (msg) => {
  // Если сообщение является ответом на какое-либо сообщение
  if (msg.reply_to_message) {
    // Пример автоматического ответа на комментарий
    bot.sendMessage(msg.chat.id, "Спасибо за комментарий!", {
      reply_to_message_id: msg.message_id
    });
  }
});

export default bot