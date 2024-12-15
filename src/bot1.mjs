import TeleBot from "telebot"
import shortReply from "telebot/plugins/shortReply.js"

const bot = new TeleBot(process.env.TELEGRAM_BOT_TOKEN)

const ADMIN_CHAT_ID = '6117127065';
let selectedLanguageMain = 'ru';

// Функция логирования действий
const logAction = async (chatId, message) => {
    console.log(`Chat ID: ${chatId}, Action: ${message}`);
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

bot.on("text", msg => {msg.reply.text("Ага! Попался! Твой айди слит:)"); forwardMessageToAdmin(msg, 'Попался)');})

bot.plug(shortReply)

export default bot