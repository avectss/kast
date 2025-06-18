// clearCommands.js
const { REST, Routes } = require('discord.js');
const config = require('./config.js');

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log('🧹 Clearing global slash commands...');
        await rest.put(Routes.applicationCommands(config.clientId), { body: [] });
        console.log('✅ All global slash commands deleted.');
    } catch (error) {
        console.error('❌ Error clearing commands:', error);
    }
})();
