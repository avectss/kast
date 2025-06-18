const { ChannelType, PermissionsBitField } = require('discord.js');
const vcNames = require('../utils/vcNames');
const config = require('../config.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/channelOwners.json');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        const member = newState.member;

        // Si entra al canal generador
        if (
            newState.channelId === config.vcTriggerChannelId &&
            (!oldState.channelId || oldState.channelId !== newState.channelId)
        ) {
            const guild = newState.guild;
            const rawName = member.user.username.trim();
            const username = rawName.length > 16 ? rawName.slice(0, 16) : rawName;
            const vcName = vcNames[Math.floor(Math.random() * vcNames.length)];
            const name = `${username}'s ${vcName}`;

            const newChannel = await guild.channels.create({
                name: name,
                type: ChannelType.GuildVoice,
                parent: config.vcCategoryId,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        allow: [PermissionsBitField.Flags.Connect]
                    },
                    {
                        id: member.id,
                        allow: [PermissionsBitField.Flags.ManageChannels]
                    }
                ]
            });

            await member.voice.setChannel(newChannel);

            let controlData = {};
            if (fs.existsSync(dataPath)) {
                controlData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            }

            controlData[newChannel.id] = {
                ownerId: member.id,
                public: false
            };

            fs.writeFileSync(dataPath, JSON.stringify(controlData, null, 2));
        }

        // Si el canal se queda vacío y no es el generador
        if (
            oldState.channel &&
            oldState.channel.parentId === config.vcCategoryId &&
            oldState.channel.members.size === 0 &&
            oldState.channelId !== config.vcTriggerChannelId
        ) {
            setTimeout(async () => {
                if (
                    oldState.channel &&
                    oldState.channel.members.size === 0 &&
                    !oldState.channel.name.toLowerCase().startsWith('wakeup')
                ) {
                    let controlData = {};
                    if (fs.existsSync(dataPath)) {
                        controlData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                    }

                    delete controlData[oldState.channel.id];
                    fs.writeFileSync(dataPath, JSON.stringify(controlData, null, 2));

                    await oldState.channel.delete().catch(() => {});
                }
            }, 1000);
        }
    }
};
