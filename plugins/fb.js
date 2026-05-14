const { cmd } = require("../command");
const getFbVideoInfo = require("@xaviabot/fb-downloader");
const config = require("../config");
const { getBotSettings } = require("./bot_db");

cmd({
    pattern: "fb",
    alias: ["facebook"],
    react: "📥",
    desc: "Download Facebook Videos.",
    category: "download",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, q, userSettings }) => {
    try {
        if (!q) return reply("❤️ *Please provide a FB Video Link.*");

        // --- Branding ස්ථාවර කිරීම ---
        const settings = userSettings || global.CURRENT_BOT_SETTINGS || {};
        const footerText = "𝐍 𝐄 𝐗 𝐔 𝐒 - 𝐌 𝐃 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋"; 
        const fileNamePrefix = "𝐍𝐄𝐗𝐔𝐒-𝐌𝐃"; 
        // -------------------------------------

        const fbRegex = /(https?:\/\/)?(www\.)?(facebook|fb)\.com\/.+/;
        if (!fbRegex.test(q)) return reply("☹️ *Invalid Link.*");


        const loadingDesc = `┃   📥 ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ʏᴏᴜʀ ᴠɪᴅᴇᴏ...\n\n> *© ${footerText}*`;
        const sentMsg = await zanta.sendMessage(from, {
            text: loadingDesc,
        }, { quoted: mek });

        const result = await getFbVideoInfo(q);

        if (!result || (!result.sd && !result.hd)) {
            return await zanta.sendMessage(from, { 
                text: "☹️ *Failed to download video. Please check the link.*", 
                edit: sentMsg.key 
            });
        }

        const bestUrl = result.hd || result.sd;
        const quality = result.hd ? "HD" : "SD";

        const successDesc = `✅ *Status:* ᴅᴏᴡɴʟᴏᴀᴅ ᴄᴏᴍᴘʟᴇᴛᴇᴅ!\n👻 *Quality:* ${quality}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴇᴠᴇʟᴏᴘᴇʀ ɴᴇxᴜꜱ*`;

        await zanta.sendMessage(from, { 
            text: successDesc, 
            edit: sentMsg.key 
        });

        await zanta.sendMessage(from, {
            video: { url: bestUrl },
            caption: `*📥 Quality: ${quality}*\n\n> *© ${footerText}*`,
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply(`❌ *Error:* ${e.message}`);
    }
});
