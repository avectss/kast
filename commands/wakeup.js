const { SlashCommandBuilder } = require('discord.js');
const responses = require('../utils/responses');
const wakeupMap = new Map();

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wakeup')
        .setDescription('Wake up a deafened user with chaos')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The sleepyhead to wake up')
                .setRequired(true)
        ),

    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const guild = interaction.guild;

        if (!target || !target.voice.channel) {
            return interaction.reply({ content: "That user ain't in a VC, bruh 🤨", flags: 64 });
        }

        if (!target.voice.deaf) {
            return interaction.reply({ content: "They're already up! No need to nuke their eardrums 🔊", flags: 64 });
        }

        if (wakeupMap.has(target.id)) {
            return interaction.reply({ content: "Yo, that one’s already bein’ dragged outta bed 🛌", flags: 64 });
        }

        wakeupMap.set(target.id, true);
        await interaction.reply({ content: getRandom(responses.wakeupStart), flags: 0 });

        const originalChannel = target.voice.channel;
        let wakeIndex = 1;

        while (
            guild.channels.cache.find(c => c.name === `wakeup${wakeIndex}`) ||
            guild.channels.cache.find(c => c.name === `wakeup${wakeIndex + 1}`)
            ) {
            wakeIndex += 2;
        }

        const wake1 = await guild.channels.create({
            name: `wakeup${wakeIndex}`,
            type: 2,
            parent: originalChannel.parentId
        });

        const wake2 = await guild.channels.create({
            name: `wakeup${wakeIndex + 1}`,
            type: 2,
            parent: originalChannel.parentId
        });

        let toggle = true;

        const interval = setInterval(async () => {
            const userChannel = target.voice.channel;

            if (!userChannel) return; // Usuario desconectado

            // Si se desensordeció
            if (!target.voice.deaf) {
                clearInterval(interval);
                wakeupMap.delete(target.id);

                try {
                    if (guild.channels.cache.get(originalChannel.id)) {
                        await target.voice.setChannel(originalChannel);
                    } else {
                        console.warn("⚠️ Original channel was deleted.");
                    }
                } catch (err) {
                    console.warn("⚠️ Couldn't return user to original VC:", err);
                }

                setTimeout(async () => {
                    await wake1.delete().catch(() => {});
                    await wake2.delete().catch(() => {});
                }, 1000);

                await interaction.followUp({ content: getRandom(responses.wakeupEnd), flags: 0 });
                return;
            }

            // Validar existencia de wakeup channels
            const nextChannel = toggle ? wake1 : wake2;
            const next = guild.channels.cache.get(nextChannel.id);
            if (!next) {
                console.error("❌ Wakeup channel no longer exists, aborting.");
                clearInterval(interval);
                wakeupMap.delete(target.id);

                try {
                    if (guild.channels.cache.get(originalChannel.id)) {
                        await target.voice.setChannel(originalChannel);
                    }
                } catch (err) {
                    console.warn("⚠️ Couldn't return user to original VC:", err);
                }

                setTimeout(async () => {
                    await wake1.delete().catch(() => {
                    });
                    await wake2.delete().catch(() => {
                    });
                }, 1000);

                return;
            }
            try {
                await target.voice.setChannel(next);
                toggle = !toggle;
            } catch (err) {
                console.error('❌ Error moving user:', err);
                clearInterval(interval);
                wakeupMap.delete(target.id);
            }
        }, 1000);
    }
};
