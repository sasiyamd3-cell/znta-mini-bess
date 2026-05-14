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
        const botName = "𝐍 𝐄 𝐗 𝐔 𝐒 - 𝐌 𝐃"; 
        const prefix = settings.prefix || config.DEFAULT_PREFIX || ".";
        const isButtonsOn = settings.buttons === 'true';

        // Placeholder replace කිරීම
        const finalMsg = aliveMsg.getAliveMessage()
            .replace(/{BOT_NAME}/g, botName)
            .replace(/{OWNER_NUMBER}/g, config.OWNER_NUMBER)
            .replace(/{PREFIX}/g, prefix);

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
                footer: `© 2026 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒 𝐓𝐄𝐀𝐌`,
                image: { url: imageLink }, 
                aimode: true,
                buttons: [
                    { id: prefix + "system", text: "⚡ ꜱʏꜱᴛᴇᴍ" },
                    { id: prefix + "menu", text: "📜 ᴍᴇɴᴜ" },
                    { id: prefix + "settings", text: "⚙️ ꜱᴇᴛᴛɪɴɢส์" },
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🌐 PAIRING SITE',
                            url: 'https://sasinda-sait-5c33c9cc740d.herokuapp.com'
                        })
                    }
                ]
            }, { quoted: mek, contextInfo });

        } else {
            // --- 🟢 BUTTONS OFF MODE ---
            await zanta.sendMessage(from, {
                image: { url: imageLink },
                caption: finalMsg + `\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒`,
                contextInfo
            }, { quoted: mek });
        }

    } catch (e) {
        console.error("[ALIVE ERROR]", e);
        reply(`❌ Error: ${e.message}`);
    }
});

module.exports = {};
