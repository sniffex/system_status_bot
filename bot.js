const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
require('dotenv').config();
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_BOT_CHAT_ID;
const bot = new TelegramBot(token, { polling: true });

console.log('Bot is running...', token);
// Function to get PM2 status
const checkPM2Status = () => {
    exec('pm2 jlist', (error, stdout, stderr) => {
        if (error) {
            bot.sendMessage(chatId, `Error getting PM2 status: ${stderr}`);
            return;
        }

        try {
            const pm2List = JSON.parse(stdout);
            let message = 'PM2 Status:\n';
            pm2List.forEach(app => {
                message += `\nApp: ${app.name}\n`;
                message += `Status: ${app.pm2_env.status}\n`;
                message += `PID: ${app.pid}\n`;
                message += `Uptime: ${app.pm2_env.pm_uptime}\n`;
                message += `Restarts: ${app.pm2_env.restart_time}\n`;
                message += `CPU: ${app.monit.cpu}%\n`;
                message += `Memory: ${(app.monit.memory / 1024 / 1024).toFixed(2)} MB\n`;
                message += `----------\n`;
            });

            bot.sendMessage(chatId, message);
        } catch (parseError) {
            bot.sendMessage(chatId, `Error parsing PM2 status: ${parseError}`);
        }
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
    sendLogs();
}, 1000);  // 1 s in milliseconds
