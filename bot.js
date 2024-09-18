const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
require('dotenv').config();
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_BOT_CHAT_ID;
const bot = new TelegramBot(token, { polling: true });

console.log('Bot is running...', token);
// Function to get PM2 status
const checkPM2Status = () => {
    exec('pm2 status', (error, stdout, stderr) => {
        if (error) {
            bot.sendMessage(chatId, `Error: ${stderr}`);
            return;
        }
        bot.sendMessage(chatId, `PM2 Status:\n${stdout}`);
    });
};

// Function to get Apache status
const checkApacheStatus = () => {
    exec('systemctl status apache2', (error, stdout, stderr) => {
        if (error) {
            bot.sendMessage(chatId, `Error: ${stderr}`);
            return;
        }
        bot.sendMessage(chatId, `Apache Status:\n${stdout}`);
    });
};

// Function to send logs (example for PM2 logs)
const sendLogs = () => {
    exec('pm2 logs', (error, stdout, stderr) => {
        if (error) {
            bot.sendMessage(chatId, `Error: ${stderr}`);
            return;
        }
        bot.sendMessage(chatId, `PM2 Logs:\n${stdout}`);
    });
};

// Send PM2 status and Apache status every hour
setInterval(() => {
    checkPM2Status();
    checkApacheStatus();
}, 1000);  // 1 hour in milliseconds
