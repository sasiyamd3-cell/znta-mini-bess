const { cmd, commands } = require("../command");
const os = require('os');
const config = require("../config");
const axios = require('axios'); 
const { sendButtons } = require('gifted-btns'); 

const MENU_IMAGE_URL = "https://raw.githubusercontent.com/sasiyamd3-cell/Bot-logo/refs/heads/main/1778591680024.png";
const CHANNEL_JID = "120363398185153217@newsletter"; 
const PAIRING_SITE = "https://sasinda-sait-5c33c9cc740d.herokuapp.com"; // උඹේ අලුත් ලින්ක් එක
const lastMenuMessage = new Map();

function runtime(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    var dDisplay = d > 0 ? d + (d == 1 ? " Day, " : " Days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " Hr, " : " Hrs, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " Min, " : " Mins, ") : "";
    return dDisplay + hDisplay + mDisplay;
}

cmd({
    pattern: "menu",
    react: "🚀",
    desc: "Displays the NEXUS-MD futuristic menu.",
    category: "main",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, args, userSettings, pushname }) => {
    try {
        const settings = userSettings || global.CURRENT_BOT_SETTINGS || {};
        const finalPrefix = settings.prefix || config.DEFAULT_PREFIX || '.'; 
        const botName = "𝐍 𝐄 𝐗 𝐔 𝐒 - 𝐌 𝐃";
        const ownerName = settings.ownerName || config.DEFAULT_OWNER_NAME || 'Sasiya MD';
        const uptime = runtime(process.uptime());

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
                newsletterName: "𝐍 𝐄 𝐗 𝐔 𝐒 - 𝐌 𝐃 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋"
            }
        };

        if (selectedCategory && groupedCommands[selectedCategory]) {
            let displayTitle = selectedCategory.toUpperCase();
            let emoji = { main: '🏠', download: '📥', tools: '🛠', logo: '🎨', media: '🖼' }[selectedCategory.toLowerCase()] || '📌';

            let commandList = `╭────〔 ${emoji} ${displayTitle} 〕────┈⊷\n`;
            commandList += `│ 👤 ᴜꜱᴇʀ: ${pushname}\n│ 📊 ᴛᴏᴛᴀʟ: ${groupedCommands[selectedCategory].length}\n╰───────────────┈⊷\n\n`;

            groupedCommands[selectedCategory].forEach((c) => {
                commandList += `  ⚡ ${finalPrefix}${c.pattern}\n`;
            });
            commandList += `\n> *© ${botName}*`;

            return await zanta.sendMessage(from, { text: commandList, contextInfo }, { quoted: mek }); 
        }

        // --- නව තාක්ෂණික මෙනු ස්ටයිල් එක (Modern Tech Style) ---
        let headerText = `┌━━━━━━━━━━━━━━━━━━━━━━━┐\n` +
                         `   ⚡ 𝐍 𝐄 𝐗 𝐔 𝐒  𝐌 𝐃  𝐒𝐘𝐒𝐓𝐄𝐌 ⚡\n` +
                         `└━━━━━━━━━━━━━━━━━━━━━━━┘\n\n` +
                         `╔═══════════════════════╗\n` +
                         `┃ 👤 ᴏᴡɴᴇʀ : ${ownerName}\n` +
                         `┃ ⏳ ᴜᴘᴛɪᴍᴇ: ${uptime}\n` +
                         `┃ ⚙️ ᴘʀᴇꜰɪx: [ ${finalPrefix} ]\n` +
                         `┃ 🛡️ ꜱᴛᴀᴛᴜꜱ: ᴏᴘᴇʀᴀᴛɪᴏɴᴀʟ\n` +
                         `╚═══════════════════════╝\n\n` +
                         `『 📂 ᴄᴏᴍᴍᴀɴᴅ ᴄᴀᴛᴇɢᴏʀɪᴇꜱ 』\n\n`;

        let imageLink = (settings.botImage && settings.botImage.startsWith("http")) ? settings.botImage : MENU_IMAGE_URL;

        if (isButtonsOn) {
            await sendButtons(zanta, from, {
                title: `*${botName} - ᴍᴀɪɴ ᴘᴀɴᴇʟ*`, 
                text: headerText + "ꜱᴇʟᴇᴄᴛ ᴀ ᴄᴀᴛᴇɢᴏʀʏ ꜰʀᴏᴍ ʙᴇʟᴏᴡ ᴛᴏ ᴠɪᴇᴡ ᴄᴏᴍᴍᴀɴᴅꜱ.",
                footer: `© 2026 ᴅᴇᴠᴇʟᴏᴘᴇʀ ɴᴇxᴜꜱ`,
                image: { url: imageLink }, 
                aimode: true,
                buttons: [
                    { id: 'cat_main', text: '🏠 ᴍᴀɪɴ ʟɪꜱᴛ' },
                    { id: 'cat_download', text: '📥 ᴅᴏᴡɴʟᴏᴀᴅꜱ' },
                    { id: 'cat_tools', text: '🛠 ʙᴏᴛ ᴛᴏᴏʟꜱ' },
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🔐 GET PAIR CODE',
                            url: PAIRING_SITE
                        })
                    }
                ]
            }, { quoted: mek, contextInfo });

        } else {
            let menuText = headerText;
            categoryKeys.forEach((catKey, index) => {
                let currentNum = index + 1;
                menuText += `  [${currentNum}] ${catKey.toUpperCase()} (${groupedCommands[catKey].length} ᴄᴍᴅꜱ)\n`;
            });

            menuText += `\n───────────────────────\n` +
                        `  🔗 ᴘᴀɪʀ ꜱɪᴛᴇ: ${PAIRING_SITE}\n` +
                        `  © ᴅᴇᴠᴇʟᴏᴘᴇʀ ɴᴇxᴜꜱ | ꜱᴀꜱɪʏᴀ ᴍᴅ\n` +
                        `───────────────────────`;

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
