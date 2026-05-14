const { cmd } = require("../command");
const axios = require('axios');
const config = require('../config');
const { getBotSettings } = require("./bot_db");


// 🕺 TIKTOK DOWNLOADER - NEXUS-MD EDITION
cmd({
    pattern: "tiktok",
    alias: ["ttdl", "tt"],
    react: "🕺",
    category: "download",
    filename: __filename
}, async (zanta, mek, m, { from, reply, q, userSettings }) => {
    try {
        if (!q || !q.includes("tiktok.com")) return reply("❌ *Invalid TikTok Link!*");

        // Branding ටික ස්ථාවර කරමු
        const settings = userSettings || global.CURRENT_BOT_SETTINGS || {};
        const footerText = "𝐍 𝐄 𝐗 𝐔 𝐒 - 𝐌 𝐃 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋"; 
        const fileNamePrefix = "𝐍𝐄𝐗𝐔𝐒-𝐌𝐃"; 

        const loading = await zanta.sendMessage(from, { 
            text: `┃   📥 ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ᴛɪᴋᴛᴏᴋ ᴠɪᴅᴇᴏ...\n\n> *© ${footerText}*` 
        }, { quoted: mek });

        const response = await axios.get(`https://www.tikwm.com/api/?url=${q}`);
        const videoData = response.data?.data;

        if (!videoData) return await zanta.sendMessage(from, { text: "❌ *Can't find video content!*", edit: loading.key });

        // උඹේ Screenshot එකේ විදිහටම ලස්සනට Caption එක හැදුවා
        const caption = `🎬 *𝐍 𝐄 𝐗 𝐔 𝐒 - 𝐌 𝐃 TIKTOK DOWNLOADER* 🎬\n` +
                        `📦\n\n` +
                        `👤 *Creator:* ${videoData.author.unique_id}\n` +
                        `📝 *Title:* ${videoData.title || 'TikTok Video'}\n` +
                        `🎵 *Music:* ${videoData.music_info.title}\n` +
                        `📊 *Stats:* 💬${videoData.comment_count} | 🔄${videoData.share_count}\n\n` +
                        `| > © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒 </>`;

        await zanta.sendMessage(from, {
            video: { url: videoData.play },
            mimetype: "video/mp4",
            caption: caption
        }, { quoted: mek });

        await zanta.sendMessage(from, { 
            text: `✅ *Status:* ᴅᴏᴡɴʟᴏᴀᴅ ᴄᴏᴍᴘʟᴇᴛᴇᴅ!`, 
            edit: loading.key 
        });

    } catch (e) {
        console.error(e);
        reply(`❌ *Error:* ${e.message}`);
    }
});
