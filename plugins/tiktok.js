const { cmd } = require("../command");
const axios = require('axios');
const config = require('../config');
const { getBotSettings } = require("./bot_db");


// 🕺 TIKTOK DOWNLOADER
cmd({
    pattern: "tiktok",
    alias: ["ttdl", "tt"],
    react: "🕺",
    category: "download",
    filename: __filename
}, async (zanta, mek, m, { from, reply, q, userSettings }) => {
    try {
        if (!q || !q.includes("tiktok.com")) return reply("❌ *Invalid*");

        const loading = await zanta.sendMessage(from, { text: "🔄 *Preccessing...*" }, { quoted: mek });

        //-------------------------------------
        const settings = userSettings || global.CURRENT_BOT_SETTINGS || {};
        const footerText = settings.footerText || config.DEFAULT_FOOTER || "> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴢᴀɴᴛᴀ ᴍɪɴɪ </>"; 
        const fileNamePrefix = settings.fileNamePrefix || config.DEFAULT_FILE_NAME || "ᴢᴀɴᴛᴀ-ᴍɪɴɪ"; 
       //-------------------------------------

        const response = await axios.get(`https://www.tikwm.com/api/?url=${q}`);
        const videoData = response.data?.data;

        if (!videoData) return await zanta.sendMessage(from, { text: "❌ *Can't find*", edit: loading.key });

        await zanta.sendMessage(from, {
            video: { url: videoData.play },
            mimetype: "video/mp4",
            caption: `👤 *Creator:* ${videoData.author.unique_id}\n📝 *Title:* ${videoData.title || 'TikTok'}\n\n> ${footerText}`
        }, { quoted: mek });

        await zanta.sendMessage(from, { text: "✅ *Done!*", edit: loading.key });

    } catch (e) {
        reply(`❌ *Error:* ${e.message}`);
    }
});
