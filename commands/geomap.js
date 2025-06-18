const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const dataPath = path.join(__dirname, '../data/georegistrations.json');
const mapImagePath = path.join(__dirname, '../assets/map.png');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('geomap')
        .setDescription('Show a world map with registered users'),

    async execute(interaction) {
        await interaction.deferReply();

        if (!fs.existsSync(dataPath)) {
            return interaction.editReply('❌ No registrations found.');
        }

        const registrations = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const coords = Object.values(registrations)
            .filter(r => r.lat !== undefined && r.lon !== undefined)
            .map(r => ({ lat: r.lat, lon: r.lon }));

        if (coords.length === 0) {
            return interaction.editReply('⚠️ No valid coordinates found.');
        }

        try {
            const image = await loadImage(mapImagePath);
            const width = image.width;
            const height = image.height;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // Dibuja el mapa de fondo
            ctx.drawImage(image, 0, 0, width, height);

            // Convertir coordenadas geográficas a coordenadas en el mapa
            const points = coords.map(({ lat, lon }) => ({
                x: ((lon + 180) / 360) * width,
                y: ((90 - lat) / 180) * height
            }));

            // Dibujar puntos de usuario (rojos, grandes y transparentes)
            ctx.fillStyle = 'rgba(255, 77, 77, 0.7)';
            points.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 7, 0, 2 * Math.PI);
                ctx.fill();
            });

            // Coordenadas de Los Ángeles
            const la = {
                lat: 34.0522,
                lon: -118.2437,
                x: ((-118.2437 + 180) / 360) * width,
                y: ((90 - 34.0522) / 180) * height
            };

            // Dibujar punto azul de Los Ángeles
            ctx.fillStyle = 'rgba(77, 166, 255, 1)';
            ctx.beginPath();
            ctx.arc(la.x, la.y, 9, 0, 2 * Math.PI);
            ctx.fill();

            const buffer = canvas.toBuffer('image/png');
            const attachment = new AttachmentBuilder(buffer, { name: 'geomap.png' });

            await interaction.editReply({
                content: '📡 Global user connections:',
                files: [attachment]
            });
        } catch (err) {
            console.error('❌ Map rendering error:', err);
            await interaction.editReply('❌ Error rendering the map.');
        }
    }
};
