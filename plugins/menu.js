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
    var dDisplay = d > 0 ? d + (d == 1 ? " Day, " : " Days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " Hour, " : " Hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " Min, " : " Mins, ") : "";
    return dDisplay + hDisplay + mDisplay;
}

// 📜 FULLY PATCHED NEXUS CORE MENU COMMAND
cmd({
    pattern: "menu",
    alias: ["panel", "help", "list"],
    react: "⚡",
    desc: "Displays the main menu or a category list.",
    category: "main",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, args, userSettings }) => {
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
        const isMainCmd = (inputBody === `${finalPrefix}menu` || inputBody === "menu" || inputBody === `${finalPrefix}help` || inputBody === "help");

        if (!isNumber && !isCategorySelection && !isMainCmd) return;
        
        if (isNumber && !isMainCmd) {
            if (!m.quoted || lastMenuMessage.get(from) !== m.quoted.id) return;
        }

        // --- 📊 කැටගරි ලිස්ට් එක සැකසීම ---
        const groupedCommands = {};
        const defaultCategories = ["main", "download", "games", "movie", "group", "owner", "ai", "search", "tools", "logo", "fun"];
        
        defaultCategories.forEach(cat => {
            groupedCommands[cat] = [];
        });

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
                newsletterName: "𝐍 𝐄 𝐗 𝐔 𝐒  𝐌 𝐀 𝐓 𝐑 𝐈 𝐗  ⚡"
            }
        };

        // --- 📂 කැටගරි ඉන්ටර්ෆේස් ලේඅවුට් එක ---
        if (selectedCategory && groupedCommands[selectedCategory]) {
            let displayTitle = selectedCategory.toUpperCase();
            let emoji = { 
                main: '📡', download: '📥', games: '🎮', movie: '🎬', group: '👥', owner: '👑', 
                ai: '🧠', search: '🔍', tools: '⚡', logo: '🎨', fun: '🎉' 
            }[selectedCategory.toLowerCase()] || '📌';

            let commandList = `🧬 *𝐍𝐄𝐗𝐔𝐒  𝐐𝐔𝐀𝐍𝐓𝐔𝐌  𝐌𝐄𝐍𝐔* 🧬\n\n` +
                              `┌───⚡ *⚡ NODE DIRECTORY » ${emoji} ${displayTitle}* ⚡───┐\n` +
                              `│ 🤖 *SYSTEM PREFIX:* [  ${finalPrefix}  ]\n` +
                              `│ 📊 *TOTAL MACROS:* ${groupedCommands[selectedCategory].length} Nodes Loaded\n` +
                              `└────────────────────────────────────────┘\n\n`;

            if (groupedCommands[selectedCategory].length === 0) {
                commandList += `  ⚠️  _No macros integrated in this sub-terminal._\n`;
            } else {
                groupedCommands[selectedCategory].forEach((c) => {
                    commandList += `  ⚡  \`${finalPrefix}${c.pattern}\`\n`;
                });
            }
            commandList += `\n> *⚡ SYSTEM ARCHITECTURE BY SASIYA MD* 🧬`;

            return await zanta.sendMessage(from, { text: commandList, contextInfo }, { quoted: mek }); 
        }

        let imageLink = (settings.botImage && settings.botImage.startsWith("http")) ? settings.botImage : MENU_IMAGE_URL;

        if (isButtonsOn) {
            // --- 🔘 [1] BUTTONS MODE ---
            let btnHeader = `🌐 ─── 𝐍 𝐄 𝐗 𝐔 𝐒  𝐄 𝐋 𝐈 𝐓 𝐞  𝐕 𝟔.𝟕 ─── 🌐\n\n` +
                            `⚡ *WELCOME TO THE DIGITAL MATRIX TERMINAL* ⚡\n\n` +
                            `┌───⚡ *⚡ CYBER ARCHITECTURE ⚡* ───┐\n` +
                            `│👤 *OPERATOR:* ${ownerName}\n` +
                            `│⏳ *CORE RUNTIME:* ${uptime}\n` +
                            `│🚀 *INFRASTRUCTURE:* Heroku Quantum\n` +
                            `│🛠️ *FIREWALL STATUS:* Active [${mode}]\n` +
                            `└────────────────────────────────┘\n\n` +
                            `🔥 *DEPLOY YOUR OWN INSTANCE:* \n` +
                            `_Want this ultimate cyberpunk machine inside your own chat? Click the glowing pair node below, scan instantly, and take full control._\n\n` +
                            `🔻 *Select a secure sub-node directory below to explore modules:*`;

            await sendButtons(zanta, from, {
                title: `*${botName} QUANTUM TERMINAL*`, 
                text: btnHeader,
                footer: `© 2026 ᴅᴇᴠᴇʟᴏᴘᴇʀ ɴᴇxᴜꜱ ᴄᴏʀᴇ`,
                image: { url: imageLink }, 
                aimode: true,
                buttons: [
                    { id: 'cat_main', text: '📡 ᴍᴀɪɴ ᴄᴏʀᴇ' },
                    { id: 'cat_download', text: '📥 ᴅᴏᴡɴʟᴏᴀᴅ' },
                    { id: 'cat_games', text: '🎮 ɢᴀᴍᴇ ɪɴꜰobject' },  
                    { id: 'cat_movie', text: '🎬 ᴍᴏᴠɪᴇ ᴅʟ' },  
                    { id: 'cat_group', text: '👥 ɢʀᴏᴜᴘ' },
                    { id: 'cat_owner', text: '👑 ᴏᴡɴᴇʀ' },
                    { id: 'cat_ai', text: '🧠 ᴀɪ ʙʀᴀɪɴ' },
                    { id: 'cat_search', text: '🔍 ꜱᴇᴀʀᴄʜ' },
                    { id: 'cat_tools', text: '⚡ ᴛᴏᴏʟs' },
                    { id: 'cat_logo', text: '🎨 ʟᴏɢᴏ' },
                    { id: 'cat_fun', text: '🎉 ꜰᴜɴ' },
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '⚡ [ DEPLOY ME - GET PAIR CODE ] 🔐',
                            url: 'https://sasinda-sait-5c33c9cc740d.herokuapp.com'
                        })
                    }
                ]
            }, { quoted: mek, contextInfo });

        } else {
            // --- 🔢 [2] NUMBER REPLY MODE ---
            let numHeader = `🛸 ─── 𝐍 𝐄 𝐗 𝐔 𝐒  𝐌 𝐔 𝐋 𝐓 𝐈 𝐕 𝐄 𝐑 𝐒 𝐄 ─── 🛸\n\n` +
                            `┌───⚡ *⚡ SYSTEM MAIN CONTROL ⚡* ───┐\n` +
                            `│👑 *DEVELOPER:* ${ownerName}\n` +
                            `│⏱️ *UPTIME METRICS:* ${uptime}\n` +
                            `│🪐 *NETWORK MATRIX:* ${mode} Node\n` +
                            `└─────────────────────────────────┘\n\n` +
                            `┌───✨ *✨ SECURE STORAGE MODULES ✨* ───┐\n`;

            const numEmojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '🔀', '🆕', '🎵'];
            
            categoryKeys.forEach((catKey, index) => {
                let emoji = { 
                    main: '📡', download: '📥', games: '🎮', movie: '🎬', group: '👥', owner: '👑', 
                    ai: '🧠', search: '🔍', tools: '⚡', logo: '🎨', fun: '🎉' 
                }[catKey] || '📌';
                let currentNum = numEmojis[index + 1] || `${index + 1}.`;

                numHeader += `│ ${currentNum} ${emoji} ${catKey.toUpperCase()} [${groupedCommands[catKey].length}]\n`;
            });

            numHeader += `└─────────────────────────────────┘\n\n` +
                         `🔗 *Want to Deploy NEXUS-MD on your Number?*\n` +
                         `👉 https://sasinda-sait-5c33c9cc740d.herokuapp.com\n\n` +
                         `💡 *Reply with the index number to inject a module array.*\n\n` +
                         `> *🔥 SYSTEM ARCHITECTURE BY SASIYA MD* 🧬`;

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
        reply("❌ Terminal Critical Error: " + err.message);
    }
});

module.exports = { lastMenuMessage };
