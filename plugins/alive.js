const { cmd, commands } = require('../command');
const config = require('../config');
const aliveMsg = require('./aliveMsg');
const axios = require('axios'); 
const { sendButtons } = require('gifted-btns'); 

const CHANNEL_JID = "120363406265537739@newsletter"; 

cmd({
    pattern: "alive",
    react: "🤖",
    desc: "Check if the bot is online.",
    category: "main",
    filename: __filename
},
async (zanta, mek, m, { from, reply, userSettings }) => {
    try {
        const settings = userSettings || global.CURRENT_BOT_SETTINGS || {};
        const botName = "𝐍 𝐄 𝐗 𝐔 𝐒 - 𝐌 𝐃"; // ස්ථාවරව නම හැදුවා
        const prefix = settings.prefix || config.DEFAULT_PREFIX || ".";
        const isButtonsOn = settings.buttons === 'true';

        // Placeholder replace කිරීම
        const finalMsg = aliveMsg.getAliveMessage()
            .replace(/{BOT_NAME}/g, botName)
            .replace(/{OWNER_NUMBER}/g, config.OWNER_NUMBER)
            .replace(/{PREFIX}/g, prefix);

        // --- 🎙️ VOICE LOGIC ---
        try {
            const aliveVoiceUrl = 'https://github.com/Akashkavindu/ZANTA_MD/raw/main/images/alive.mp3'; 
            const vResponse = await axios.get(aliveVoiceUrl, { responseType: 'arraybuffer' });
            const vBuffer = Buffer.from(vResponse.data, 'utf-8');

            await zanta.sendMessage(from, { 
                audio: vBuffer, 
                mimetype: 'audio/mpeg', 
                ptt: false, 
                fileName: 'Alive.mp3'
            }, { quoted: mek });

        } catch (voiceError) {
            console.error("[ALIVE VOICE ERROR]", voiceError.message);
        }

        // --- 🖼️ IMAGE LOGIC ---
        let imageLink = (settings.botImage && settings.botImage !== "null" && settings.botImage.startsWith("http")) 
            ? settings.botImage 
            : "https://raw.githubusercontent.com/sasiyamd3-cell/Bot-logo/refs/heads/main/1778591680024.png";

        const contextInfo = {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: CHANNEL_JID,
                serverMessageId: 100,
                newsletterName: "𝐍 𝐄 𝐗 𝐔 𝐒 - 𝐌 𝐃 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋"
            }
        };

        if (isButtonsOn) {
            // --- 🔘 GIFTED-BTNS Logic ---
            await sendButtons(zanta, from, {
                title: `*${botName} IS ONLINE*`,
                text: finalMsg,
                footer: `© 2026 ᴅᴇᴠᴇʟᴏᴘᴇʀ ɴᴇxᴜꜱ`,
                image: { url: imageLink }, 
                aimode: true,
                buttons: [
                    { id: prefix + "ping", text: "⚡ ᴘɪɴɢ" },
                    { id: prefix + "menu", text: "📜 ᴍᴇɴᴜ" },
                    { id: prefix + "settings", text: "⚙️ ꜱᴇᴛᴛɪɴɢꜱ" },
                    { id: prefix + "help", text: "📞 ʜᴇʟᴘ" },
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🌐 BOT WEB',
                            url: 'https://zanta-mini.store'
                        })
                    }
                ]
            }, { quoted: mek, contextInfo });

        } else {
            // --- 🟢 BUTTONS OFF MODE ---
            await zanta.sendMessage(from, {
                image: { url: imageLink },
                caption: finalMsg + `\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ꜱᴀꜱɪʏᴀ ᴍᴅ`,
                contextInfo
            }, { quoted: mek });
        }

    } catch (e) {
        console.error("[ALIVE ERROR]", e);
        reply(`❌ Error: ${e.message}`);
    }
});

module.exports = {};
