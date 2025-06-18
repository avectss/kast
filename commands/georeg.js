const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { fetch } = require('undici');

const countries = require('../data/countries.json');
const cities = require('../data/cities.json');
const dataPath = path.join(__dirname, '../data/georegistrations.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('georeg')
        .setDescription('Register your country and city')
        .addStringOption(option =>
            option.setName('country')
                .setDescription('Select your country')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName('city')
                .setDescription('Select your city')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async execute(interaction, client) {
        try {
            const userId = interaction.user.id;
            const username = interaction.user.username;
            const country = interaction.options.getString('country');
            const city = interaction.options.getString('city');

            // Geocodificar ubicación
            const query = `${city}, ${country}`;
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
            const res = await fetch(url, { headers: { 'User-Agent': 'KastBot' } });
            const data = await res.json();

            if (!data[0]) {
                return interaction.reply({
                    content: `❌ Couldn't geocode **${city}, ${country}**. Please try a different location.`,
                    flags: 64
                });
            }

            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);

            let registrations = {};
            if (fs.existsSync(dataPath)) {
                registrations = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            }

            registrations[userId] = {
                username,
                country,
                city,
                lat,
                lon
            };

            fs.writeFileSync(dataPath, JSON.stringify(registrations, null, 2));

            await interaction.reply({
                content: `✅ Location registered: **${city}, ${country}**`,
                flags: 64
            });
        } catch (err) {
            console.error("❌ Error in /georeg:", err);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "⚠️ Something went wrong while registering your location.",
                    flags: 64
                });
            }
        }
    },

    async autocomplete(interaction) {
        const focused = interaction.options.getFocused(true);

        if (focused.name === 'country') {
            const filtered = countries.filter(c =>
                c.toLowerCase().startsWith(focused.value.toLowerCase())
            ).slice(0, 25);

            return interaction.respond(filtered.map(c => ({ name: c, value: c })));
        }

        if (focused.name === 'city') {
            const selectedCountry = interaction.options.getString('country');

            if (!selectedCountry || !cities[selectedCountry]) {
                return interaction.respond([{ name: 'Select a country first', value: 'null' }]);
            }

            const cityList = cities[selectedCountry] || [];

            const filtered = cityList.filter(city =>
                city.toLowerCase().startsWith(focused.value.toLowerCase())
            ).slice(0, 25);

            return interaction.respond(filtered.map(city => ({ name: city, value: city })));
        }
    }
};
