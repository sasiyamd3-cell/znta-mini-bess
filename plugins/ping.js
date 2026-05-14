const { cmd } = require("../command");
const os = require('os');
const { runtime } = require('../lib/functions');
const config = require("../config");
const axios = require('axios'); 

const STATUS_IMAGE_URL = "https://raw.githubusercontent.com/sasiyamd3-cell/Bot-logo/refs/heads/main/1778591680024.png";

// --- 🖼️ IMAGE PRE-LOAD LOGIC ---
let cachedStatusImage = null;

async function preLoadStatusImage() {
    try {
        const response = await axios.get(STATUS_IMAGE_URL, { responseType: 'arraybuffer' });
        cachedStatusImage = Buffer.from(response.data);
        console.log("✅ [CACHE] NEXUS-MD System status image pre-loaded.");
    } catch (e) {
        console.error("❌ [CACHE] Failed to pre-load system image:", e.message);
        cachedStatusImage = null;
    }
}

preLoadStatusImage();

function bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

cmd({
    pattern: "system",
    alias: ["status", "botinfo", "ping"],
    react: "⚙️",
    desc: "Check bot speed and system status.",
    category: "main",
    filename: __filename,
},
async (zanta, mek, m, { from, userSettings }) => {
    try {
        const startTime = Date.now();
        const settings = userSettings || global.CURRENT_BOT_SETTINGS || {};
        const botName = "𝐍 𝐄 𝐗 𝐔 𝐒 - 𝐌 𝐃";

        // Loading message
        const loadingMsg = await zanta.sendMessage(from, { text: "🔍 *Checking Nexus Systems...*" }, { quoted: mek });

        const memoryUsage = process.memoryUsage();
        const latency = Date.now() - startTime;
        const upTime = runtime(process.uptime());

        const statusMessage = `
╔═══════════════════════╗
  ⚡ *${botName} STATUS* ⚡
╚═══════════════════════╝

🚀 *Speed:* ${latency} ms
⏳ *Uptime:* ${upTime}
💾 *RAM Usage:* ${bytesToSize(memoryUsage.heapUsed)} / ${bytesToSize(os.totalmem())}
🖥️ *Platform:* ${os.platform()}
🛰️ *Hostname:* ${os.hostname()}

◈━━━━━━━ ɴᴇxᴜꜱ ꜱʏꜱᴛᴇᴍ ━━━━━━━◈
> *© 2026 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒 𝐓𝐄𝐀𝐌*`.trim();

        // --- 🖼️ IMAGE LOGIC ---
        let imageToDisplay;
        if (settings.botImage && settings.botImage !== "null" && settings.botImage.startsWith("http")) {
            imageToDisplay = { url: settings.botImage };
        } else {
            imageToDisplay = cachedStatusImage || { url: STATUS_IMAGE_URL };
        }

        // අවසාන පණිවිඩය රූපය සමඟ යැවීම
        await zanta.sendMessage(from, {
            image: imageToDisplay,
            caption: statusMessage,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363398185153217@newsletter",
                    serverMessageId: 100,
                    newsletterName: "𝐍 𝐄 𝐗 𝐔 𝐒 - 𝐌 𝐃 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋"
                }
            }
        }, { quoted: mek });

        // පැරණි පණිවිඩය මැකීම
        await zanta.sendMessage(from, { delete: loadingMsg.key });

    } catch (e) {
        console.error("[SYSTEM ERROR]", e);
    }
});
