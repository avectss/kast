const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.js');

const dataPath = path.join(__dirname, '../data/channelOwners.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Control your VC'),

    async execute(interaction) {
        console.log('🔧 /panel triggered');

        const member = interaction.member;
        const channel = member.voice.channel;

        if (!channel) {
            console.log('❌ No voice channel detected');
        } else {
            console.log(`🎧 Channel detected: ${channel.name} (${channel.id})`);
        }

        if (!channel || channel.parentId !== config.vcCategoryId) {
            console.log('❌ Not in a valid VC category');
            return interaction.reply({
                content: "❌ You must be in a dynamic VC.",
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: false });
        console.log('✅ deferReply() sent');

        let controlData = {};
        if (fs.existsSync(dataPath)) {
            controlData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }

        if (!controlData[channel.id]) {
            console.log('🆕 Registering new VC in channelOwners.json');
            controlData[channel.id] = {
                ownerId: member.id,
                public: false
            };
            fs.writeFileSync(dataPath, JSON.stringify(controlData, null, 2));
        }

        const isOwner = controlData[channel.id].ownerId === member.id;
        const isPublic = controlData[channel.id].public;

        console.log(`🔐 Access check — isOwner: ${isOwner}, isPublic: ${isPublic}`);

        if (!isOwner && !isPublic) {
            console.log('⛔ User not authorized to use panel');
            return interaction.editReply({
                content: "❌ Only the owner can use the panel."
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0x3c3b40)
            .setTitle("🎛 Voice Channel Control Panel")
            .setDescription(`Manage: **${channel.name}**`)
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

        console.log('📦 Sending panel embed...');
        await interaction.editReply({ embeds: [embed], components: [row] });
        console.log('✅ Panel embed sent successfully');
    }
};
