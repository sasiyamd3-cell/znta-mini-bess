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
        const botName = "𝐍 𝐄 𝐗 𝐔 𝐒 - 𝐌 𝐃"; 
        const ownerName = settings.ownerName || config.DEFAULT_OWNER_NAME || 'Sasiya MD';
        const mode = (settings.workType || "Public").toUpperCase();
        const isButtonsOn = settings.buttons === 'true';
        const uptime = runtime(process.uptime());

        let inputBody = m.body ? m.body.trim().toLowerCase() : "";
        const isNumber = /^\d+$/.test(inputBody); 
        const isCategorySelection = inputBody.startsWith('cat_');
        const isMainCmd = (inputBody === `${finalPrefix}menu` || inputBody === "menu");

        if (!isNumber && !isCategorySelection && !isMainCmd) return;
        if (isNumber && !isMainCmd) {
            if (!m.quoted || lastMenuMessage.get(from) !== m.quoted.id) return;
        }

        // --- 📊 කැටගරි ලිස්ට් එක (අලුත් ඒවා එක්ක) ---
        const groupedCommands = {};
        
        // මුලින්ම හිස් කැටගරි ටික Structure එකට දානවා (කමාණ්ඩ්ස් නැතත් ලිස්ට් එකේ පේන්න)
        const defaultCategories = ["main", "download", "group", "owner", "ai", "search", "tools", "logo", "fun"];
        defaultCategories.forEach(cat => {
            groupedCommands[cat] = [];
        });

        // දැනට තියෙන කමාණ්ඩ්ස් ටික අදාළ කැටගරි වලට බෙදනවා
        commands.filter(c => c.pattern && c.pattern !== "menu").forEach(cmdData => {
            let cat = cmdData.category?.toLowerCase() || "fun";
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

        // --- 📂 කැටගරියක් ඇතුළට ගියාම පේන ලුක් එක ---
        if (selectedCategory && groupedCommands[selectedCategory]) {
            let displayTitle = selectedCategory.toUpperCase();
            let emoji = { 
                main: '📡', download: '📥', group: '👥', owner: '👑', 
                ai: '🧠', search: '🔍', tools: '⚡', logo: '🎨', fun: '🎉' 
            }[selectedCategory.toLowerCase()] || '📌';

            let commandList = `✨ 𝐍 𝐄 𝐗 𝐔 𝐒  𝐄 𝐋 𝐈 𝐓 𝐄  𝐌 𝐄 𝐍 𝐔 ✨\n\n` +
                              `┌───⚡ 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐘 » ${emoji} ${displayTitle}\n` +
                              `│🤖 *Prefix:* [  ${finalPrefix}  ]\n` +
                              `│📊 *Commands:* ${groupedCommands[selectedCategory].length} Available\n` +
                              `└──────────────────────────┈⊷\n\n`;

            if (groupedCommands[selectedCategory].length === 0) {
                commandList += `  ⚠️  _No commands integrated yet. Coming soon!_\n`;
            } else {
                groupedCommands[selectedCategory].forEach((c) => {
                    commandList += `  ⚡  \`${finalPrefix}${c.pattern}\`\n`;
                });
            }
            commandList += `\n> *𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒* 🧬`;

            return await zanta.sendMessage(from, { text: commandList, contextInfo }, { quoted: mek }); 
        }

        let imageLink = (settings.botImage && settings.botImage.startsWith("http")) ? settings.botImage : MENU_IMAGE_URL;

        if (isButtonsOn) {
            // --- 🔘 [1] BUTTONS ON MODE STYLE ---
            let btnHeader = `╔═════════════════════════╗\n` +
                            `    🧬 𝐍 𝐄 𝐗 𝐔 𝐒  𝐌 𝐀 𝐓 𝐑 𝐈 𝐗 🧬\n` +
                            `╚═════════════════════════╝\n\n` +
                            `┌───❖ 📦 𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎 ❖───┐\n` +
                            `│👤 *👑 Owner:* ${ownerName}\n` +
                            `│⏳ *⏰ Uptime:* ${uptime}\n` +
                            `│🚀 *🪐 Platform:* Heroku\n` +
                            `│🛠️ *💎 Status:* Active [${mode}]\n` +
                            `└────────────────────────┘\n\n` +
                            `🔻 *Select a secure node category below to explore available modules:*`;

            await sendButtons(zanta, from, {
                title: `*${botName} TERMINAL*`, 
                text: btnHeader,
                footer: `© 2026 ᴅᴇᴠᴇʟᴏᴘᴇʀ ɴᴇxᴜꜱ`,
                image: { url: imageLink }, 
                aimode: true,
                buttons: [
                    { id: 'cat_main', text: '📡 ᴍᴀɪɴ' },
                    { id: 'cat_download', text: '📥 ᴅᴏᴡɴʟᴏᴀᴅ' },
                    { id: 'cat_group', text: '👥 ɢʀᴏᴜᴘ' },
                    { id: 'cat_owner', text: '👑 ᴏᴡɴᴇʀ' },
                    { id: 'cat_ai', text: '🧠 ᴀɪ' },
                    { id: 'cat_search', text: '🔍 ꜱᴇᴀʀᴄʜ' },
                    { id: 'cat_tools', text: '⚡ ᴛᴏᴏʟs' },
                    { id: 'cat_logo', text: '🎨 ʟᴏɢᴏ' },
                    { id: 'cat_fun', text: '🎉 ꜰᴜɴ' },
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🔐 GET PAIR CODE',
                            url: 'https://sasinda-sait-5c33c9cc740d.herokuapp.com'
                        })
                    }
                ]
            }, { quoted: mek, contextInfo });

        } else {
            // --- 🔢 [2] BUTTONS OFF (NUMBER REPLY) MODE STYLE ---
            let numHeader = `🛸 𝐍 𝐄 𝐗 𝐔 𝐒  𝐌 𝐔 𝐋 𝐓 𝐈 𝐕 𝐄 𝐑 𝐒 𝐄 🛸\n\n` +
                            `┌───⚡ 𝐂𝐎𝐑𝐄 𝐂𝐎𝐍𝐓𝐑𝐎𝐋 ───┐\n` +
                            `│👑 *Developer:* ${ownerName}\n` +
                            `│⏱️ *Runtime:* ${uptime}\n` +
                            `│🪐 *Network:* ${mode} Mode\n` +
                            `└───────────────────────┘\n\n` +
                            `┌───✨ 𝐒𝐄𝐂𝐔𝐑𝐄 𝐌𝐎𝐃𝐔𝐋𝐄𝐒 ───┐\n`;

            const numEmojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '🔀'];
            
            categoryKeys.forEach((catKey, index) => {
                let emoji = { 
                    main: '📡', download: '📥', group: '👥', owner: '👑', 
                    ai: '🧠', search: '🔍', tools: '⚡', logo: '🎨', fun: '🎉' 
                }[catKey] || '📌';
                let currentNum = numEmojis[index + 1] || `${index + 1}.`;

                numHeader += `│ ${currentNum} ${emoji} ${catKey.toUpperCase()} [${groupedCommands[catKey].length}]\n`;
            });

            numHeader += `└───────────────────────┘\n\n` +
                         `💡 *Reply with the index number to unlock a category.*\n\n` +
                         `🧬 *𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒*\n` +
                         `🤖 *🔥 𝘚𝘺𝘴𝘵𝘦𝘮 𝘈𝘳𝘤𝘩𝘪𝘵𝘦𝘤𝘵𝘶𝘳𝘦 𝘝6.7*`;

            const sent = await zanta.sendMessage(from, {
                image: { url: imageLink },
                caption: numHeader,
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
