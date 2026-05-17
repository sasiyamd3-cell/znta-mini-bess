const { cmd } = require("../command");
const { updateSetting } = require("./bot_db"); // 🛠️ MongoDB Update Function එක
const config = require("../config");

// Default Image Link
const DEFAULT_IMG = "https://raw.githubusercontent.com/sasiyamd3-cell/Bot-logo/refs/heads/main/1778591680024.png";

const lastSettingsMessage = new Map();
const lastSecurityMessage = new Map(); 

// ⚙️ 1. DISPLAY DASHBOARD COMMAND
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
    
    const displayImg = settings.botImage || DEFAULT_IMG;

    // --- 📊 Status Indicators ---
    const getStatus = (val) => val === 'true' || val === true ? '『 ✅ ON 』' : '『 ❌ OFF 』';
    
    const getAntiDeleteStatus = (val) => {
        if (val === "1" || val === 1) return '『 👤 USER CHAT 』';
        if (val === "2" || val === 2) return '『 📥 YOUR CHAT 』';
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
    statusText += `Reply to this message with number + value.\n`;
    statusText += `Ex: Reply *14 on* or *14 off*\n`;
    statusText += `Ex Anti-Delete: Reply *13 1* or *13 2* or *13 off*\n`;
    statusText += `*–––––––––––––––––––––––––*\n`;
    statusText += `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒 </>`;

    const sentMsg = await zanta.sendMessage(from, {
        image: { url: displayImg },
        caption: statusText
    }, { quoted: mek });

    // මෙතනින් තමයි මේ මැසේජ් ID එක සේව් කරගන්නේ පස්සේ රිප්ලයි එක අල්ලන්න
    lastSettingsMessage.set(from, sentMsg.key.id);

    // Memory Cleanup
    setTimeout(() => {
        if (lastSettingsMessage.get(from) === sentMsg.key.id) {
            lastSettingsMessage.delete(from);
        }
    }, 30 * 60 * 1000); 
});


// 🔄 2. AUTOMATED REPLY HANDLER ENGINE (ලයිව් අප්ඩේට් සහ රිපෝට් සිස්ටම් එක)
cmd({
    on: "text",
    dontAddCommandList: true
}, async (zanta, mek, m, { from, reply, sender, isOwner }) => {
    
    // රිප්ලයි මැසේජ් එකක් තියෙනවාද සහ ඒක අපේ Settings මැසේජ් එකටමද කරලා තියෙන්නේ කියලා බලනවා
    if (!m.quoted || !lastSettingsMessage.has(from) || m.quoted.id !== lastSettingsMessage.get(from)) return;

    // බලය තියෙන කෙනෙක්ද කියලා ආයේ චෙක් කරනවා ආරක්ෂාවට
    const allowedNumbers = ["94771810698", "94743404814", "94766247995", "192063001874499", "270819766866076"];
    const senderNumber = sender.split("@")[0].replace(/[^\d]/g, "");
    if (!allowedNumbers.includes(senderNumber) && !isOwner) return;

    const input = m.text.trim().toLowerCase().split(" ");
    const num = input[0]; // යූසර් ගහපු අංකය (උදා: 14)
    const val = input[1]; // යූසර් ගහපු අගය (උදා: on / off)

    if (!num || !val) return;

    // 🗺️ අංක වලට අදාළ MongoDB Database Keys Mapping එක
    const keysMap = {
        "05": "alwaysOnline",
        "06": "autoRead",
        "07": "autoTyping",
        "08": "autoStatusSeen",
        "09": "autoStatusReact",
        "10": "readCmd",
        "11": "autoVoice",
        "12": "buttons",
        "13": "antidelete",
        "14": "autoReact"
    };

    const dbKey = keysMap[num] || keysMap[`0${num}`.slice(-2)]; // 5 හරි 05 හරි ගැහුවොත් දෙකම අල්ලනවා

    if (!dbKey) {
        return reply(`❌ *TERMINAL ERROR:* Invalid config number *[ ${num} ]*. Please select a valid number from the dashboard.`);
    }

    let finalValue;
    let displayStatus;

    // Anti-delete (13) එකේ වැලියු චෙක් කිරීම
    if (dbKey === "antidelete") {
        if (val === "1") { finalValue = "1"; displayStatus = "👤 USER CHAT"; }
        else if (val === "2") { finalValue = "2"; displayStatus = "📥 YOUR CHAT"; }
        else if (val === "off" || val === "false") { finalValue = "false"; displayStatus = "❌ OFF"; }
        else {
            return reply("⚠️ *INVALID VALUE!* \n\nFor Anti-Delete, reply with:\n*13 1* (User Chat)\n*13 2* (Your Chat)\n*13 off* (Turn Off)");
        }
    } else {
        // අනිත් සාමාන්‍ย සෙටින්ග්ස් වල ON / OFF චෙක් කිරීම
        if (val === "on" || val === "true") { finalValue = "true"; displayStatus = "✅ ON"; }
        else if (val === "off" || val === "false") { finalValue = "false"; displayStatus = "❌ OFF"; }
        else {
            return reply(`⚠️ *INVALID VALUE!* \n\nFormat: Reply with *${num} on* or *${num} off*`);
        }
    }

    try {
        // 🗃️ MONGODB UPDATE EXECUTION
        // උඹේ බොට් එකේ ඩේටාබේස් අප්ඩේට් වෙන ෆන්ක්ෂන් එකට ඩේටා යැවීම
        const isUpdated = await updateSetting(senderNumber, { [dbKey]: finalValue });

        // Global Cache එක ලයිව් අප්ඩේට් කිරීම (බොට්ටාට ක්ෂණිකව කියවා ගන්න)
        if (!global.BOT_SESSIONS_CONFIG) global.BOT_SESSIONS_CONFIG = {};
        if (!global.BOT_SESSIONS_CONFIG[senderNumber]) global.BOT_SESSIONS_CONFIG[senderNumber] = {};
        global.BOT_SESSIONS_CONFIG[senderNumber][dbKey] = finalValue;

        // 👑 SUCCESS CYBER REPORT MATRIX
        let successMsg = `👑 *𝐍𝐄𝐗𝐔𝐒  𝐌𝐀𝐓𝐑𝐈𝐗  𝐂𝐎𝐍𝐅𝐈𝐆  𝐔𝐏𝐃𝐀𝐓𝐄𝐃*\n\n` +
                         `┌───⚡ *SYSTEM MODIFICATION REPORT*\n` +
                         `│👤 *Operator:* @${senderNumber}\n` +
                         `│🔑 *Config Key:* ${dbKey.toUpperCase()}\n` +
                         `│🔥 *Execution Status:* SUCCESSFUL\n` +
                         `│✨ *New Live State:* [ ${displayStatus} ]\n` +
                         `└──────────────────────────────────────┈⊷\n\n` +
                         `⚙️ *Network Status:* Configuration Synced with MongoDB Database.\n\n` +
                         `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒 </>`;

        await zanta.sendMessage(from, { text: successMsg, mentions: [sender] }, { quoted: mek });
        
        // පරණ Settings මැසේජ් ID එක මැප් එකෙන් අයින් කරනවා එක පාරක් කරපු නිසා
        lastSettingsMessage.delete(from);

    } catch (dbErr) {
        console.error("Database Update Failed:", dbErr);
        // ❌ FAILURE REPORT
        return reply(`❌ *DATABASE CRITICAL ERROR!*\n\nFailed to sync configuration with cloud cluster.\n*Reason:* ${dbErr.message}`);
    }
});

module.exports = { lastSettingsMessage, lastSecurityMessage };
