const { cmd, commands } = require("../command");
const os = require('os');
const config = require("../config");
const axios = require('axios'); 
const { sendButtons } = require('gifted-btns'); 

const MENU_IMAGE_URL = "https://raw.githubusercontent.com/sasiyamd3-cell/Bot-logo/refs/heads/main/1778591680024.png";
const CHANNEL_JID = "120363398185153217@newsletter"; 
const lastMenuMessage = new Map();

function runtime(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    return dDisplay + hDisplay + mDisplay;
}

cmd({
    pattern: "menu",
    react: "📜",
    desc: "Displays the main menu or a category list.",
    category: "main",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, args, userSettings, pushname }) => {
    try {
        const settings = userSettings || global.CURRENT_BOT_SETTINGS || {};
        const finalPrefix = settings.prefix || config.DEFAULT_PREFIX || '.'; 
        const botName = "𝐍 𝐄 𝐗 𝐔 𝐒 - 𝐌 𝐃"; // මෙතන නම ස්ථාවර කළා
        const ownerName = settings.ownerName || config.DEFAULT_OWNER_NAME || 'Sasiya MD';
        const mode = (settings.workType || "Public").toUpperCase();
        const isButtonsOn = settings.buttons === 'true';
        const uptime = runtime(process.uptime());
        const latency = Date.now() - mek.messageTimestamp * 1000;

        let inputBody = m.body ? m.body.trim().toLowerCase() : "";
        const isNumber = /^\d+$/.test(inputBody); 
        const isCategorySelection = inputBody.startsWith('cat_');
        const isMainCmd = (inputBody === `${finalPrefix}menu` || inputBody === "menu");

        if (!isNumber && !isCategorySelection && !isMainCmd) return;
        if (isNumber && !isMainCmd) {
            if (!m.quoted || lastMenuMessage.get(from) !== m.quoted.id) return;
        }

        const groupedCommands = {};
        commands.filter(c => c.pattern && c.pattern !== "menu").forEach(cmdData => {
            let cat = cmdData.category?.toLowerCase() || "other";
            if (!groupedCommands[cat]) groupedCommands[cat] = [];
            groupedCommands[cat].push(cmdData);
        });

        const categoryKeys = Object.keys(groupedCommands).sort();
        const categoryMap = {}; 
        categoryKeys.forEach((cat, index) => { categoryMap[index + 1] = cat; });

        let selectedCategory;
        if (isCategorySelection) {
            selectedCategory = inputBody.replace('cat_', '');
        } else if (isNumber) {
            selectedCategory = categoryMap[parseInt(inputBody)];
        }

        const contextInfo = {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: CHANNEL_JID,
                serverMessageId: 100,
                newsletterName: "𝐍 𝐄 𝐗 𝐔 𝐒 - 𝐌 𝐃 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋 </>"
            }
        };

        if (selectedCategory && groupedCommands[selectedCategory]) {
            let displayTitle = selectedCategory.toUpperCase();
            let emoji = { main: '🏠', download: '📥', tools: '🛠', logo: '🎨', media: '🖼' }[selectedCategory.toLowerCase()] || '📌';

            let commandList = `╭━━〔 ${emoji} ${displayTitle} 〕━━┈⊷\n`;
            commandList += `┃ 📝 Category : ${displayTitle}\n┃ 📊 Available : ${groupedCommands[selectedCategory].length}\n╰━━━━━━━━━━━━━━┈⊷\n\n`;

            groupedCommands[selectedCategory].forEach((c) => {
                commandList += `┃ ◈ 🔆 ${finalPrefix}${c.pattern}\n`;
            });
            commandList += `\n> *© ${botName}*`;

            return await zanta.sendMessage(from, { text: commandList, contextInfo }, { quoted: mek }); 
        }

        // --- පට්ටම ලුක් එක තියෙන Header එක ---
        let headerText = `╔═════════════════════════╗\n` +
                         `  ⚡ ${botName} ⚡\n` +
                         `╚═════════════════════════╝\n\n` +
                         `┏━━━━━━━━━━━━━━━━━━━━━━━━━┓\n` +
                         `┃ 👤 𝐎𝐖𝐍𝐄𝐑   : ${ownerName}\n` +
                         `┃ ⏳ 𝐔𝐏𝐓𝐈𝐌𝐄  : ${uptime}\n` +
                         `┃ 🚀 𝐏𝐋𝐀𝐓𝐅𝐎𝐑𝐌 : Heroku\n` +
                         `┃ 🛠️ 𝐒𝐓𝐀𝐓𝐔𝐒   : Operational\n` +
                         `┗━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                         `◈━━━━━━━ ɴᴇxᴜꜱ ᴍᴇɴᴜ ━━━━━━━◈\n\n`;

        let imageLink = (settings.botImage && settings.botImage.startsWith("http")) ? settings.botImage : MENU_IMAGE_URL;

        if (isButtonsOn) {
            await sendButtons(zanta, from, {
                title: `*${botName}*`, 
                text: headerText + "🔻 ꜱᴇʟᴇᴄᴛ ᴀ ᴄᴀᴛᴇɢᴏʀʏ",
                footer: `© 2026 ᴅᴇᴠᴇʟᴏᴘᴇʀ ɴᴇxᴜꜱ`,
                image: { url: imageLink }, 
                aimode: true,
                buttons: [
                    { id: 'cat_main', text: '🏠 ᴍᴀɪɴ' },
                    { id: 'cat_download', text: '📥 ᴅᴏᴡɴʟᴏᴀᴅ' },
                    { id: 'cat_tools', text: '🛠 ᴛᴏᴏʟs' },
                    { id: 'cat_logo', text: '🎨 ʟᴏɢᴏ' },
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
            const numEmojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
            let menuText = headerText + `╭〔 📜 𝐌𝐄𝐍𝐔 𝐋𝐈𝐒𝐓 〕\n`;
            
            categoryKeys.forEach((catKey, index) => {
                let emoji = { main: '🏠', download: '📥', tools: '🛠', logo: '🎨', media: '🖼' }[catKey] || '📌';
                let currentNum = numEmojis[index + 1] || `${index + 1}.`;

                menuText += `┃ ${currentNum}  ${catKey.toUpperCase()} (${groupedCommands[catKey].length})\n`;
            });

            menuText += `╰\n\n_💡 Reply with number to select._\n\n` +
                        `   © 2026 ᴅᴇᴠᴇʟᴏᴘᴇʀ ɴᴇxᴜꜱ\n` +
                        `    ᴘᴏᴡᴇʀᴇᴅ ʙʏ ꜱᴀꜱɪʏᴀ ᴍᴅ\n` +
                        `◈━━━━━━━━━━━━━━━━━━━━━━━━━◈`;

            const sent = await zanta.sendMessage(from, {
                image: { url: imageLink },
                caption: menuText,
                contextInfo
            }, { quoted: mek });

            lastMenuMessage.set(from, sent.key.id);
            setTimeout(() => lastMenuMessage.delete(from), 10 * 60 * 1000);
        }

    } catch (err) {
        console.error("Menu Error:", err);
        reply("❌ Error: " + err.message);
    }
});

module.exports = { lastMenuMessage };
