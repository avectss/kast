// config.js
require('dotenv').config();

module.exports = {
    token: process.env.DISCORD_TOKEN,
    vcTriggerChannelId: process.env.VC_TRIGGER_CHANNEL_ID,
    vcCategoryId: process.env.VC_CATEGORY_ID,
    clientId: process.env.CLIENT_ID,
};
