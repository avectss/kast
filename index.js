const { Client, Collection, GatewayIntentBits, Partials, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const showKastNeofetch = require('./utils/neofetch'); // 🧠 Importamos el neofetch

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

client.commands = new Collection();
const commands = [];

// 📦 Cargar slash commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

// ✅ Registrar comandos slash al iniciar
client.once('ready', async () => {
    showKastNeofetch(client); // 🚀 Mostramos el neofetch al iniciar

    console.log(`✅ Logged in as ${client.user.tag}`);

    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands }
        );
        console.log('✅ Slash commands registered globally');
    } catch (error) {
        console.error('❌ Error registering slash commands:', error);
    }

    console.log('successfully finished startup');
});

// 🔥 Cargar eventos del folder "events"
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    client.on(event.name, (...args) => event.execute(...args, client));
}

client.login(config.token);
