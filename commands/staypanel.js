const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');

const dataPath = path.join(__dirname, '../data/channelOwners.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staypanel')
        .setDescription('Control your VC and learn commands'),

    async execute(interaction) {
        const member = interaction.member;
        const channel = member.voice.channel;

        if (!channel || channel.parentId !== config.vcCategoryId) {
            return interaction.reply({
                content: "❌ You must be in a dynamic VC.",
                ephemeral: true
            });
        }

        let controlData = {};
        if (fs.existsSync(dataPath)) {
            controlData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }

        if (!controlData[channel.id]) {
            controlData[channel.id] = {
                ownerId: member.id,
                public: false
            };
            fs.writeFileSync(dataPath, JSON.stringify(controlData, null, 2));
        }

        const isOwner = controlData[channel.id].ownerId === member.id;
        const isPublic = controlData[channel.id].public;

        if (!isOwner && !isPublic) {
            return interaction.reply({
                content: "❌ Only the owner can use the panel.",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0x3c3b40)
            .setTitle("🎛 Voice Channel Control Panel")
            .setDescription(`Manage: **${channel.name}**`)
            .addFields(
                {
                    name: "🔧 Available Commands",
                    value:
                        `**/wakeup @user** – Moves a deafened user quickly between 2 channels until they un-deafen, then returns them to their VC.\n` +
                        "Useful to wake someone up or get their attention. 💥\n\n" +
                        "**/staypanel** – Opens this control panel and shows help.\n" +
                        "Useful if you want full control and guidance of your VC."
                }
            )
            .setFooter({
                text: `Control: ${isPublic ? "Everyone" : "Owner only"}`
            });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('vc_lock')
                .setLabel('Lock')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔒'),
            new ButtonBuilder()
                .setCustomId('vc_unlock')
                .setLabel('Unlock')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🔓'),
            new ButtonBuilder()
                .setCustomId('vc_ghost')
                .setLabel('Ghost')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('👻'),
            new ButtonBuilder()
                .setCustomId('vc_show')
                .setLabel('Show')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('👁'),
            new ButtonBuilder()
                .setCustomId('vc_toggle')
                .setLabel(isPublic ? 'Make Private' : 'Make Public')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🎛')
        );

        return interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    }
};
