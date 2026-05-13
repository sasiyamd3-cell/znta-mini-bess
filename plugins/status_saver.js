const { cmd } = require("../command");
const { getContentType, downloadContentFromMessage } = require("@whiskeysockets/baileys"); 
const config = require("../config"); 

cmd(
    {
        pattern: "send", 
        react: "📥",
        desc: "Download status",
        category: "media",
        filename: __filename,
    },
    async (zanta, mek, m, { from, reply, args, prefix }) => {
        try {
            if (!m.quoted) {
                return reply(`❌ Please reply to *Status*.`);
            }

            const quotedObject = m.quoted;
            const innerMessage = quotedObject.msg || quotedObject.message; 

            if (!innerMessage) {
                return reply(`❌ Failed.`);
            }

            if (!quotedObject.isStatus) {
                let actualType = innerMessage.type || getContentType(innerMessage);
                if (innerMessage.mimetype) {
                    if (innerMessage.mimetype.startsWith('image')) actualType = 'imageMessage';
                    else if (innerMessage.mimetype.startsWith('video')) actualType = 'videoMessage';
                    else if (innerMessage.mimetype.startsWith('audio')) actualType = 'audioMessage';
                }
                return reply(`⚠️ ❌ Please reply to *Status*. (Actual Type: ${actualType || 'unknown'})`);
            }

            const type = quotedObject.type; 

            if (type === 'imageMessage' || type === 'videoMessage') {


                // --- RAM එක ඉතිරි කරගන්නා අලුත් ක්‍රමය (Streaming) ---
                const stream = await downloadContentFromMessage(
                    innerMessage, 
                    type === 'imageMessage' ? 'image' : 'video'
                );

                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                // ---------------------------------------------

                const senderJid = quotedObject.sender;
                const caption = `${type === 'imageMessage' ? '🖼️ *Status Image Saved*' : '📹 *Status Video Saved*'}\nStatus Owner: @${senderJid.split('@')[0]}`;

                await zanta.sendMessage(from, { 
                    [type === 'imageMessage' ? 'image' : 'video']: buffer, 
                    caption: caption,
                    mentions: [senderJid]
                }, { quoted: mek });

                await zanta.sendMessage(from, { react: { text: "✅", key: mek.key } });

            } else {
                return reply(`❌ මෙFailed  -  Type:(${type})`);
            }

        } catch (err) {
            console.error("Status Saver Command Error:", err);
            reply("❌ Status Downlaod failed");
        }
    }
);
