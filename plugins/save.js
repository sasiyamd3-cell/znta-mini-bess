const { cmd } = require("../command");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

// 🖼️ SAVE View Once Image/Video Command
cmd(
{
    pattern: "save",
    react: "💾",
    desc: "Saves View Once image or video safely.",
    category: "media",
    filename: __filename,
},
async (zanta, mek, m, { from, reply }) => {
    try {
        // 1. Reply පණිවිඩයක් දැයි පරීක්ෂා කිරීම
        if (!m.quoted) {
            return reply("Plase reply to *View once* Media.");
        }

        const quotedMsg = m.quoted.msg;
        
        if (!quotedMsg) {
            return reply(`❌ Not found.`);
        }

        // 2. View Once Message එකක්දැයි පරීක්ෂා කිරීම
        const isViewOnce = quotedMsg.viewOnce === true;

        if (!isViewOnce) {
            return reply(`මෙNot view once media. (Actual Type: ${m.quoted.type})`);
        }

        // 3. Image හෝ Video එකක්දැයි පරීක්ෂා කිරීම
        const actualMessageType = m.quoted.type;

        if (actualMessageType !== 'imageMessage' && actualMessageType !== 'videoMessage') {
            return reply("Plase reply to *View once* Media.");
        }

        // 4. Media Streaming (RAM එක පිරීම පාලනය කරයි)
        // මුළු ෆයිල් එකම එකපාර RAM එකට ගන්නේ නැතිව කැබලි (Chunks) විදිහට ලබා ගනී
        const mediaType = actualMessageType === 'imageMessage' ? 'image' : 'video';
        const stream = await downloadContentFromMessage(quotedMsg, mediaType);
        
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        if (!buffer || buffer.length === 0) {
            return reply("❌ Media Download error.");
        }

        // 5. Media එක නැවත Chat එකට යැවීම
        const senderJid = m.quoted.sender;
        const captionText = `🖼️ *Saved View Once Media*\nSender: @${senderJid.split('@')[0]}`;
        
        const messageOptions = {
            [actualMessageType === 'imageMessage' ? 'image' : 'video']: buffer,
            caption: captionText,
            mentions: [senderJid]
        };

        await zanta.sendMessage(from, messageOptions, { quoted: mek });
        await zanta.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error("Save Command Error:", e);
        reply(`*Error:* ${e.message}`);
    }
});
