const express = require('express');
const axios = require('axios');
require('dotenv').config();

// Load environment variables
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_BOT_CHAT_ID;

const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Function to send message to Telegram
function sendTelegramMessage(message, chatId = CHAT_ID) {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
    };

    axios.post(url, payload)
        .then(() => {
            console.log('Message sent to Telegram successfully');
        })
        .catch(error => {
            console.error('Error sending message to Telegram:', error.response ? error.response.data : error.message);
        });
}

// Handling /start and /otp commands using polling
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    sendTelegramMessage("Welcome! You can use the /otp command to generate a random OTP.", chatId);
});

bot.onText(/\/otp/, (msg) => {
    const chatId = msg.chat.id;
    const otpMessage = `Your OTP is: ${Math.floor(100000 + Math.random() * 900000)}`; // Generate random 6-digit OTP
    sendTelegramMessage(otpMessage, chatId);
});

// You can still run your Express server for other purposes
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

// Sample route (optional)
app.get('/', (req, res) => {
    res.send('Bot is running with long polling');
});

// Start the Express server on a specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
