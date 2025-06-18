const fs = require('fs');
const path = require('path');
const { PermissionsBitField } = require('discord.js');
const responses = require('../utils/responses');
const config = require('../config.json');

const dataPath = path.join(__dirname, '../data/channelOwners.json');

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // ✅ AUTOCOMPLETE HANDLER
        if (interaction.isAutocomplete()) {
            const command = client.commands.get(interaction.commandName);
            if (command && command.autocomplete) {
                try {
                    await command.autocomplete(interaction);
                } catch (err) {
                    console.error('❌ Error in autocomplete handler:', err);
                }
            }
            return;
        }

        // ✅ SLASH COMMAND HANDLER
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error('❌ Error executing slash command:', error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: '⚠️ Error executing command.', ephemeral: true });
                }
            }
            return;
        }

        // ✅ BUTTON HANDLER
        if (interaction.isButton()) {
            const channel = interaction.member?.voice?.channel;

            if (!channel || channel.parentId !== config.vcCategoryId) {
                return interaction.reply({ content: "❌ You must be in your voice channel to use this.", ephemeral: true });
            }

            let controlData = {};
            if (fs.existsSync(dataPath)) {
                controlData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            }

            const data = controlData[channel.id];
            const isOwner = data?.ownerId === interaction.member.id;
            const isPublic = data?.public;

            if (!isOwner && !isPublic) {
                return interaction.reply({ content: "❌ You don't have permission to control this VC.", ephemeral: true });
            }

            try {
                const ephemeral = interaction.customId.startsWith('stay_');
                const id = interaction.customId.replace('stay_', '');

                switch (id) {
                    case 'vc_lock':
                        await channel.permissionOverwrites.edit(channel.guild.id, {
                            Connect: false
                        });
                        return interaction.reply({ content: getRandom(responses.lock), ephemeral });

                    case 'vc_unlock':
                        await channel.permissionOverwrites.edit(channel.guild.id, {
                            Connect: true
                        });
                        return interaction.reply({ content: getRandom(responses.unlock), ephemeral });

                    case 'vc_ghost':
                        await channel.permissionOverwrites.edit(channel.guild.id, {
                            ViewChannel: false
                        });
                        return interaction.reply({ content: getRandom(responses.ghost), ephemeral });

                    case 'vc_show':
                        await channel.permissionOverwrites.edit(channel.guild.id, {
                            ViewChannel: true
                        });
                        return interaction.reply({ content: getRandom(responses.unghost), ephemeral });

                    case 'vc_toggle':
                        controlData[channel.id].public = !controlData[channel.id].public;
                        fs.writeFileSync(dataPath, JSON.stringify(controlData, null, 2));
                        return interaction.reply({
                            content: controlData[channel.id].public
                                ? "🔓 This VC is now public."
                                : "🔒 This VC is now private.",
                            ephemeral
                        });

                    default:
                        return;
                }
            } catch (err) {
                console.error("❌ Error in button handler:", err);
                return interaction.reply({ content: "⚠️ Something went wrong.", ephemeral: true });
            }
        }
    }
};
