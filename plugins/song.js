const { cmd } = require("../command");
const axios = require("axios");
const config = require('../config');
const { getBotSettings } = require("./bot_db");

cmd({
    pattern: "song",
    alias: ["yta", "mp3", "play"],
    react: "🎧",
    desc: "Download YouTube MP3 using Zanta-API",
    category: "download",
    filename: __filename,
}, async (bot, mek, m, { from, q, reply, userSettings }) => {
    try {
        if (!q) return reply("🎧 *ZANTA-MD SONG SEARCH*\n\nExample: .song alone");

        //-------------------------------------
        const settings = userSettings || global.CURRENT_BOT_SETTINGS || {};
        const footerText = settings.footerText || config.DEFAULT_FOOTER || "> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴢᴀɴᴛᴀ ᴍɪɴɪ </>"; 
        const fileNamePrefix = settings.fileNamePrefix || config.DEFAULT_FILE_NAME || "ᴢᴀɴᴛᴀ-ᴍɪɴɪ"; 
        //-------------------------------------

        // 1. API හරහා සෙවීම
        const searchRes = await axios.get(`API EKAK THIYENAM YT SEARCH EKATA DAGANNA?q=${encodeURIComponent(q)}`);
        if (!searchRes.data.status || searchRes.data.results.length === 0) return reply("❌ No results found.");

        const video = searchRes.data.results[0]; // පළමු වීඩියෝ එක

        let msg = `🎵 *ZANTA AUDIO PLAYER* 🎵\n\n` +
                  `📝 *Title:* ${video.title}\n` +
                  `👤 *Author:* ${video.author}\n` +
                  `⏱️ *Duration:* ${video.timestamp}\n` +
                  `🔗 *Link:* ${video.url}\n\n` +
                  `*Reply with a number:* \n\n` +
                  `1 ➢ \`Audio File\`\n` +
                  `2 ➢ \`Document File\`\n` +
                  `3 ➢ \`Voice Message\`\n\n` +
                  `> ${footerText}`;

        const sentMsg = await bot.sendMessage(from, { 
            image: { url: video.thumbnail }, 
            caption: msg 
        }, { quoted: mek });

        // --- Reply Listener ---
        const listener = async (update) => {
            const msgUpdate = update.messages[0];
            if (!msgUpdate.message) return;

            const body = msgUpdate.message.conversation || msgUpdate.message.extendedTextMessage?.text;
            const isReplyToBot = msgUpdate.message.extendedTextMessage?.contextInfo?.stanzaId === sentMsg.key.id;

            if (isReplyToBot && (body === '1' || body === '2' || body === '3')) {
                await bot.sendMessage(from, { react: { text: '⏳', key: msgUpdate.key } });

                try {
                    // 2. අලුත් API එක හරහා ඩවුන්ලෝඩ් ලින්ක් එක ගැනීම
                    const finalLink = await getDownloadLink(video.url);
                    if (!finalLink) return reply("❌ Download link not found.");

                    if (body === '1') {
                        await bot.sendMessage(from, { 
                            audio: { url: finalLink }, 
                            mimetype: "audio/mpeg", 
                            ptt: false 
                        }, { quoted: msgUpdate });
                    } else if (body === '2') {
                        await bot.sendMessage(from, { 
                            document: { url: finalLink }, 
                            mimetype: "audio/mpeg", 
                            fileName: `${video.title}.mp3`,
                            caption: `> ${footerText}`
                        }, { quoted: msgUpdate });
                    } else if (body === '3') {
                        await bot.sendMessage(from, { 
                            audio: { url: finalLink }, 
                            mimetype: 'audio/ogg; codecs=opus',
                            ptt: true 
                        }, { quoted: msgUpdate });
                    }

                    await bot.sendMessage(from, { react: { text: '✅', key: msgUpdate.key } });
                } catch (err) {
                    reply("❌ Error downloading audio.");
                }
                bot.ev.off('messages.upsert', listener);
            }
        };

        bot.ev.on('messages.upsert', listener);
        setTimeout(() => bot.ev.off('messages.upsert', listener), 300000);

    } catch (e) {
        reply("❌ *Error:* " + e.message);
    }
});

// --- අලුත් API Logic එක ---
async function getDownloadLink(videoUrl) {
    try {
        const apikey = "Manul-Official"; // ඔයාගේ API key එක
        const response = await axios.get(`API EKAK THIYENAM DAGANNA`);
        
        // API response එකේ data.url එක තමයි tunnel link එක
        return response.data.status ? response.data.data.url : null;
    } catch (e) {
        return null;
    }
}
