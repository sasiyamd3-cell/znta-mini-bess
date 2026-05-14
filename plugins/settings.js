const { cmd } = require("../command");
const { updateSetting } = require("./bot_db");
const config = require("../config");

// Default Image Link
const DEFAULT_IMG = "https://raw.githubusercontent.com/sasiyamd3-cell/Bot-logo/refs/heads/main/1778591680024.png";

const lastSettingsMessage = new Map();
const lastSecurityMessage = new Map(); 

cmd({
    pattern: "settings",
    alias: ["set", "dashboard", "status"],
    desc: "Display and edit bot settings via reply.",
    category: "main",
    react: "⚙️",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, sender, isOwner, prefix, userSettings }) => {

    // --- 🛡️ Access Control Setup ---
    const allowedNumbers = [
        "94771810698", 
        "94743404814", 
        "94766247995", 
        "192063001874499", 
        "270819766866076"
    ];

    const senderNumber = sender.split("@")[0].replace(/[^\d]/g, "");
    const isAllowed = allowedNumbers.includes(senderNumber) || isOwner;

    if (!isAllowed) {
        return reply("🚫 *ACCESS DENIED!* \n\nThis dashboard can be used only by the Bot Owner.");
    }

    // --- 📊 Settings Configuration ---
    const settings = userSettings || global.BOT_SESSIONS_CONFIG?.[senderNumber] || {};
    const botName = "𝐍 𝐄 𝐗 𝐔 𝐒 - 𝐌 𝐃";
    const ownerName = settings.ownerName || config.DEFAULT_OWNER_NAME || "Sasiya MD";
    const botPrefix = settings.prefix || prefix || ".";
    const workType = (settings.workType || "public").toUpperCase();
    
    // Error Fix: displayImg variable එක define කිරීම
    const displayImg = settings.botImage || DEFAULT_IMG;

    // --- 📊 Status Indicators ---
    const getStatus = (val) => val === 'true' ? '『 ✅ ON 』' : '『 ❌ OFF 』';
    
    const getAntiDeleteStatus = (val) => {
        if (val === "1") return '『 👤 USER CHAT 』';
        if (val === "2") return '『 📥 YOUR CHAT 』';
        return '『 ❌ OFF 』';
    };

    let statusText = `⚡ *${botName} DASHBOARD* ⚡\n\n`;

    statusText += `*—「 BASIC CONFIGS 」—*\n\n`;
    statusText += `01. 🤖 *Bot Name:* ${botName}\n`;
    statusText += `02. 👤 *Owner Name:* ${ownerName}\n`;
    statusText += `03. 🎮 *Bot Prefix:* [ ${botPrefix} ]\n`;
    statusText += `04. 🔐 *Work Mode:* ${workType}\n\n`;

    statusText += `*—「 BOT SETTINGS 」—*\n\n`;
    statusText += `05. 🚀 *Always Online:* ${getStatus(settings.alwaysOnline)}\n`;
    statusText += `06. 📩 *Auto Read:* ${getStatus(settings.autoRead)}\n`;
    statusText += `07. ⌨ *Auto Typing:* ${getStatus(settings.autoTyping)}\n`;
    statusText += `08. 👁️ *Status Seen:* ${getStatus(settings.autoStatusSeen)}\n`;
    statusText += `09. ❤️ *Status React:* ${getStatus(settings.autoStatusReact)}\n`;
    statusText += `10. 📑 *Read Cmd:* ${getStatus(settings.readCmd)}\n`;
    statusText += `11. 🎙️ *Recording Voice:* ${getStatus(settings.autoVoice)}\n`;
    statusText += `12. 🔘 *Buttons:* ${getStatus(settings.buttons)}\n`;
    statusText += `13. 🛡️ *Anti-Delete:* ${getAntiDeleteStatus(settings.antidelete)}\n`;
    statusText += `14. ⚡ *Auto React:* ${getStatus(settings.autoReact)}\n\n`;

    statusText += `*–––––––––––––––––––––––––*\n`;
    statusText += `*💡 EDIT SETTINGS:* \n`;
    statusText += `Reply with number + value.\n`;
    statusText += `Ex: Reply *14 on* or *14 off*\n\n`;
    statusText += `*–––––––––––––––––––––––––*\n`;
    statusText += `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒 </>`;

    const sentMsg = await zanta.sendMessage(from, {
        image: { url: displayImg },
        caption: statusText
    }, { quoted: mek });

    lastSettingsMessage.set(from, sentMsg.key.id);

    // Memory Cleanup
    setTimeout(() => {
        if (lastSettingsMessage.get(from) === sentMsg.key.id) {
            lastSettingsMessage.delete(from);
        }
    }, 30 * 60 * 1000); 
});

module.exports = { lastSettingsMessage, lastSecurityMessage };
