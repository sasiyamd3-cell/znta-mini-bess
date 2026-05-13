const { cmd } = require("../command");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream/promises");

cmd({
    pattern: "forward",
    alias: ["fwd", "f"],
    desc: "Forward messages using temp storage to save RAM.",
    category: "tools",
    react: "⏩",
    filename: __filename
}, async (bot, mek, m, { from, args, reply, isOwner }) => {
    let tempFilePath = null;

    try {
        if (!isOwner) return reply("❌ *This command is only for the Bot Owner!*");
        if (!m.quoted) return reply("⚠️ *Please reply to a message.*");
        if (!args[0]) return reply("⚠️ *Provide a Target JID.*");

        let targetJid = args[0].trim();
        if (!targetJid.includes("@") && !isNaN(targetJid)) targetJid += "@s.whatsapp.net";

        const quotedMsg = m.quoted;
        const msgType = quotedMsg.type;

        await bot.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // ක්‍රමය 1: සෘජු Forward කිරීම (RAM වැය නොවේ)
        try {
            await bot.sendMessage(targetJid, { forward: m.quoted });
            await bot.sendMessage(from, { react: { text: '✅', key: mek.key } });
            return; 
        } catch (err) {
            console.log("Direct forward failed, using Temp Storage method...");
        }

        // ක්‍රමය 2: Temp Storage භාවිතා කර Download කර යැවීම
        const mediaTypes = {
            imageMessage: 'image',
            videoMessage: 'video',
            audioMessage: 'audio',
            documentMessage: 'document',
            stickerMessage: 'sticker'
        };

        if (mediaTypes[msgType]) {
            const mediaType = mediaTypes[msgType];

            // Temp Folder එක සකස් කිරීම
            const tempDir = path.join(__dirname, "../temp");
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const fileName = quotedMsg.msg.fileName || `fwd_${Date.now()}`;
            tempFilePath = path.join(tempDir, fileName);

            // Stream එකක් හරහා කෙලින්ම Hard Disk එකට Save කිරීම (RAM එක ඉතිරි වේ)
            const stream = await downloadContentFromMessage(quotedMsg.msg, mediaType);
            const writeStream = fs.createWriteStream(tempFilePath);

            await pipeline(stream, writeStream);

            // යැවීමට අවශ්‍ය Content එක සකස් කිරීම
            const messageOptions = {
                [mediaType]: { url: tempFilePath },
                caption: quotedMsg.msg.caption || "",
                mimetype: quotedMsg.msg.mimetype,
                fileName: fileName
            };

            await bot.sendMessage(targetJid, messageOptions);
            await bot.sendMessage(from, { react: { text: '✅', key: mek.key } });
            await reply(`✅ *FORWARD SUCCESSFUL*`);

        } else {
            // Text Message එකක් නම්
            const textContent = quotedMsg.text || quotedMsg.msg?.conversation || quotedMsg.msg?.extendedTextMessage?.text;
            if (textContent) {
                await bot.sendMessage(targetJid, { text: textContent });
                await bot.sendMessage(from, { react: { text: '✅', key: mek.key } });
            }
        }

    } catch (e) {
        console.error("FORWARD ERROR:", e);
        reply(`❌ *FORWARD FAILED*\n\nReason: ${e.message}`);
    } finally {
        // 🗑️ අවසානයේ Temp file එක delete කර storage එක ඉතිරි කිරීම
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try { fs.unlinkSync(tempFilePath); } catch (err) { console.error("Cleanup Error:", err); }
        }
    }
});
