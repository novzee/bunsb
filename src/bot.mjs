import TeleBot from 'telebot';

// Инициализация бота
const bot = new TeleBot(process.env.TELEGRAM_BOT_TOKEN);

// Обработка новых сообщений (постов) от администратора
const RULES_TEXT = "Пожалуйста, ознакомьтесь с правилами группы:\n1. Правило первое\n2. Правило второе\n...";

bot.on('text', (msg) => {
  // Если сообщение отправлено администратором (ID: 136817688) и не является ответом – считаем его новым постом
  if (msg.sender_chat.type == "channel" && !msg.reply_to_message) {
    bot.sendMessage(msg.chat.id, RULES_TEXT + + JSON.stringify(msg), {
      reply_to_message_id: msg.message_id
    });
  }
  // Если сообщение является ответом (комментарий)
  else if (msg.reply_to_message) {
    bot.sendMessage(msg.chat.id, "Спасибо за комментарий!" + JSON.stringify(msg), {
      reply_to_message_id: msg.message_id
    });
  }
  // Можно добавить другие условия, если нужно
});

export default bot