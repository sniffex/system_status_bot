const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
require('dotenv').config();

// Load token and chat ID from environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_BOT_CHAT_ID;

if (!token || !chatId) {
    console.error('Error: Telegram bot token or chat ID is not set. Check your .env file or environment variables.');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Log that the bot is running
console.log('Bot is running with token:', token);
console.log('Sending messages to chat ID:', chatId);

// Function to get PM2 status
const checkPM2Status = () => {
    console.log('Checking PM2 status...');
    exec('pm2 jlist', (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing pm2 jlist:', stderr);
            bot.sendMessage(chatId, `Error getting PM2 status: ${stderr}`);
            return;
        }

        try {
            const pm2List = JSON.parse(stdout);
            console.log('PM2 list fetched:', pm2List);

            let message = 'PM2 Status:\n';
            pm2List.forEach(app => {
                message += `\nApp: ${app.name}\n`;
                message += `Status: ${app.pm2_env.status}\n`;
                message += `PID: ${app.pid}\n`;
                message += `Uptime: ${(Date.now() - app.pm2_env.pm_uptime) / 1000 / 60} minutes\n`;
                message += `Restarts: ${app.pm2_env.restart_time}\n`;
                message += `CPU: ${app.monit.cpu}%\n`;
                message += `Memory: ${(app.monit.memory / 1024 / 1024).toFixed(2)} MB\n`;
                message += `----------\n`;
            });

            bot.sendMessage(chatId, message);
        } catch (parseError) {
            console.error('Error parsing PM2 status JSON:', parseError);
            bot.sendMessage(chatId, `Error parsing PM2 status: ${parseError}`);
        }
    });
};

// Function to send PM2 logs
const sendLogs = () => {
    console.log('Fetching PM2 logs...');
    exec('pm2 logs --lines 50', (error, stdout, stderr) => {
        if (error) {
            console.error('Error fetching PM2 logs:', stderr);
            bot.sendMessage(chatId, `Error fetching PM2 logs: ${stderr}`);
            return;
        }
        console.log('PM2 logs fetched successfully');
        bot.sendMessage(chatId, `PM2 Logs:\n${stdout}`);
    });
};

// Check PM2 status and send logs every hour (3600000 ms = 1 hour)
setInterval(() => {
    console.log('Running scheduled checks...');
    checkPM2Status();
    sendLogs();
}, 3600000);  // 1 hour in milliseconds
