const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
jidNormalizedUser,
getContentType,
fetchLatestBaileysVersion,
Browsers,
generateForwardMessageContent,
prepareWAMessageMedia,
downloadContentFromMessage,
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const P = require("pino");
const express = require("express");
const path = require("path");
const axios = require("axios");
const mongoose = require("mongoose");
const config = require("./config");
const { sms } = require("./lib/msg");
const { getGroupAdmins } = require("./lib/functions");
const { commands, replyHandlers } = require("./command");

const { lastMenuMessage } = require("./plugins/menu");
const { lastSettingsMessage } = require("./plugins/settings");
const { lastHelpMessage } = require("./plugins/help");
const { connectDB, getBotSettings, updateSetting } = require("./plugins/bot_db");

const NodeCache = require("node-cache");
const msgRetryCounterCache = new NodeCache();

// --------------------------------------------------------------------------
// [SECTION: GLOBAL CONFIGURATIONS & LOGGING]
// --------------------------------------------------------------------------
const logger = P({ level: "silent" });
const activeSockets = new Set();
const lastWorkTypeMessage = new Map();
const lastAntiDeleteMessage = new Map();
const lastAntiEditMessage = new Map();
const lastSecurityMessage = new Map();
const retryCount = {};

global.activeSockets = new Set();
global.BOT_SESSIONS_CONFIG = {};
const MY_APP_ID = String(process.env.APP_ID || "1");

// --------------------------------------------------------------------------
// [SECTION: MONGODB DATABASE SCHEMA]
// --------------------------------------------------------------------------
const SessionSchema = new mongoose.Schema({
number: { type: String, required: true, unique: true },
creds: { type: Object, default: null },
APP_ID: { type: String, required: true },
}, { collection: "sessions" });

const Session = mongoose.models.Session || mongoose.model("Session", SessionSchema);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));





// -------------------------------------------------------------------------
// [SECTION: UTILITY FUNCTIONS]
// -------------------------------------------------------------------------
const decodeJid = (jid) => {
if (!jid) return jid;
if (/:\d+@/gi.test(jid)) {
const decode = jid.split(":");
return decode[0] + "@" + decode[1].split("@")[1] || jid;
}
return jid;
};

//-----------USER NUMBER FIND--------------
async function getSenderNumber(zanta, mek) {
try {
let altJid = mek.key?.remoteJidAlt;
if (altJid && altJid.endsWith('@s.whatsapp.net')) {
    return altJid.split('@')[0];
}

let pn = mek.key?.senderPn || mek.message?.extendedTextMessage?.contextInfo?.participant;
if (pn && pn.endsWith('@s.whatsapp.net')) {
    return pn.split('@')[0];
}

let jid = mek.key.participant || mek.key.remoteJid || "";

if (jid.endsWith('@s.whatsapp.net')) {
    return jid.split('@')[0].split(':')[0];
}
if (jid.endsWith('@lid')) {
    const [result] = await zanta.onWhatsApp(jid);
    if (result && result.exists && result.jid) {
        return result.jid.split('@')[0];
    }
}
return jid.split('@')[0].split(':')[0].replace(/[^\d]/g, "");

} catch (e) {
let fallback = mek.key?.remoteJidAlt || mek.key?.remoteJid || "";
return fallback.split('@')[0].replace(/[^\d]/g, "");
}
}



global.CURRENT_BOT_SETTINGS = {
botName: config.DEFAULT_BOT_NAME,
ownerName: config.DEFAULT_OWNER_NAME,
prefix: config.DEFAULT_PREFIX,
};

// --------------------------------------------------------------------------
// [SECTION: EXPRESS SERVER SETUP]
// --------------------------------------------------------------------------
const app = express();
const port = process.env.PORT || 5000;

// Cache Sync Endpoint.
app.get("/update-cache", async (req, res) => {
const userNumber = req.query.id;
if (!userNumber) return res.status(400).send("No ID");
try {
const newData = await getBotSettings(userNumber);
if (newData) {
global.BOT_SESSIONS_CONFIG[userNumber] = newData;
console.log(`♻️ Memory Synced for ${userNumber}`);
}
res.send("OK");
} catch (e) { res.status(500).send("Error"); }
});

const MSG_FILE = path.join(__dirname, "messages.json");

const readMsgs = () => {
try {
if (!fs.existsSync(MSG_FILE)) return {};
const data = fs.readFileSync(MSG_FILE, "utf8");
return data ? JSON.parse(data) : {};
} catch (e) { return {}; }
};

const writeMsgs = (data) => {
try { fs.writeFileSync(MSG_FILE, JSON.stringify(data, null, 2)); } 
catch (e) { console.error("File Write Error:", e); }
};

// --------------------------------------------------------------------------
// [SECTION: ERROR HANDLING]
// --------------------------------------------------------------------------
process.on("uncaughtException", (err) => {
if (err.message.includes("Connection Closed") || err.message.includes("EPIPE")) return;
console.error("⚠️ Exception:", err);
});

process.on("unhandledRejection", (reason) => {
if (reason?.message?.includes("Connection Closed") || reason?.message?.includes("Unexpected end")) return;
});

// --------------------------------------------------------------------------
// [SECTION: PLUGIN LOADER] - Plugins පූරණය කිරීම
// --------------------------------------------------------------------------
async function loadPlugins() {
const pluginsPath = path.join(__dirname, "plugins");
fs.readdirSync(pluginsPath).forEach((plugin) => {
if (path.extname(plugin).toLowerCase() === ".js") {
try { require(`./plugins/${plugin}`); } 
catch (e) { console.error(`[Loader] Error ${plugin}:`, e); }
}
});
console.log(`✨ Loaded: ${commands.length} Commands`);
}

// --------------------------------------------------------------------------
// [SECTION: SYSTEM STARTUP & APP_ID LOGIC] - පද්ධතිය ආරම්භ කිරීම
// --------------------------------------------------------------------------
async function startSystem() {
await connectDB();
await loadPlugins();

const myBatch = await Session.find({ APP_ID: MY_APP_ID });
console.log(`🚀 Instance APP_ID: ${MY_APP_ID} | 📂 Handling ${myBatch.length} users.`);

const BATCH_SIZE = 4;
const DELAY_BETWEEN_BATCHES = 8000;

for (let i = 0; i < myBatch.length; i += BATCH_SIZE) {
const batch = myBatch.slice(i, i + BATCH_SIZE);
setTimeout(async () => {
batch.forEach((sessionData) => {
if (sessionData.creds) connectToWA(sessionData);
});
}, (i / BATCH_SIZE) * DELAY_BETWEEN_BATCHES);
}

// DB Watcher for live session updates
Session.watch().on("change", async (data) => {
if (data.operationType === "insert" || data.operationType === "update") {
let sessionData = data.operationType === "insert" ? data.fullDocument : await Session.findById(data.documentKey._id);

if (!sessionData || !sessionData.creds || sessionData.APP_ID !== MY_APP_ID) return;

const userNumberOnly = sessionData.number.split("@")[0];
const isAlreadyActive = Array.from(activeSockets).some( (s) => s.user && decodeJid(s.user.id).includes(userNumberOnly));

if (!isAlreadyActive) {
console.log(`♻️ New session for [${userNumberOnly}] matched APP_ID ${MY_APP_ID}. Connecting...`);
await connectToWA(sessionData);
}
}
});
}

// --------------------------------------------------------------------------
// [SECTION: WHATSAPP CONNECTION CORE] - WhatsApp සම්බන්ධතාවය හැසිරවීම
// --------------------------------------------------------------------------
async function connectToWA(sessionData) {
    const userNumber = sessionData.number.split("@")[0];
    global.BOT_SESSIONS_CONFIG[userNumber] = await getBotSettings(userNumber);
    let userSettings = global.BOT_SESSIONS_CONFIG[userNumber];

    const authPath = path.join(__dirname, `/auth_info_baileys/${userNumber}/`);
    if (!fs.existsSync(authPath)) fs.mkdirSync(authPath, { recursive: true });
    try { fs.writeFileSync(path.join(authPath, "creds.json"), JSON.stringify(sessionData.creds)); } catch (e) {}

    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    const zanta = makeWASocket({
        logger: logger,
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        auth: state,
        version,
        syncFullHistory: false,
        shouldSyncHistoryMessage: () => false,
        ignoreNewsletterMessages: false,
        emitOwnEvents: true,
        markOnlineOnConnect: userSettings.alwaysOnline === "true",
        msgRetryCounterCache,

       getMessage: async (key) => {
            const msgs = readMsgs();
            if (msgs[key.id]) return msgs[key.id].message;
            return undefined;
        },
        patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(
                message.buttonsMessage ||
                message.templateMessage ||
                message.listMessage
            );
            if (requiresPatch) {
                message = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2,
                            },
                            ...message,
                        },
                    },
                };
            }
            return message;
        },
    });

    activeSockets.add(zanta);
    global.activeSockets.add(zanta);

    zanta.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
    activeSockets.delete(zanta);
    zanta.ev.removeAllListeners();
    if (zanta.onlineInterval) clearInterval(zanta.onlineInterval);

    const reason = lastDisconnect?.error?.output?.statusCode;
    retryCount[userNumber] = (retryCount[userNumber] || 0) + 1;

    if (reason === DisconnectReason.loggedOut) {
        console.log(`👤 [${userNumber}] Logged out. Deleting from DB.`);
        await Session.deleteOne({ number: sessionData.number });
        if (fs.existsSync(authPath)) fs.rmSync(authPath, { recursive: true, force: true });
    }
    else if (retryCount[userNumber] > 5) {
        console.log(`❌ [${userNumber}] Reconnection limit reached. Deleting session from DB.`);
        delete retryCount[userNumber]; 

        try {
            await Session.deleteOne({ number: sessionData.number });
            if (fs.existsSync(authPath)) {
                fs.rmSync(authPath, { recursive: true, force: true });
            }
            console.log(`🗑️ [${userNumber}] Session completely removed due to connection failures.`);
        } catch (dbError) {
            console.error(`⚠️ Error while removing failed session:`, dbError.message);
        }
    }
    else {
        console.log(`🔄 [${userNumber}] Disconnected (Attempt ${retryCount[userNumber]}/5). Reconnecting in 5s...`);
        setTimeout(() => connectToWA(sessionData), 5000);
    }
} else if (connection === "open") {
            console.log(`✅ [${userNumber}] Connected on APP_ID: ${MY_APP_ID}`);
            startScheduling(zanta);

            if (userSettings.connectionMsg === "true") {
        const currentPrefix = userSettings.prefix || config.PREFIX || ".";

        const connectionCaption = `Connected`;

        await zanta.sendMessage(decodeJid(zanta.user.id), {
            image: { url: "https://raw.githubusercontent.com/sasiyamd3-cell/Bot-logo/refs/heads/main/1778591680024.png" },
            caption: connectionCaption,
        });
    }

            setTimeout(async () => {
                const channels = ["120363398185153217@newsletter" , "120363404928317178@newsletter"];
                for (const jid of channels) { try { await zanta.newsletterFollow(jid); } catch (e) {} }
            }, 5000);

            if (zanta.onlineInterval) clearInterval(zanta.onlineInterval);

            const runPresenceLogic = async () => {
                try {
                    if (!zanta.ws.isOpen) return; 
                    const currentSet = global.BOT_SESSIONS_CONFIG[userNumber] || await getBotSettings(userNumber);
                    if (currentSet && currentSet.alwaysOnline === "true") {
                        await zanta.sendPresenceUpdate("available");
                    } else {
                        await zanta.sendPresenceUpdate("unavailable");
                    }
                } catch (e) {
                    console.error(`[Presence Error - ${userNumber}]:`, e.message);
                }
            };

            await runPresenceLogic();
            zanta.onlineInterval = setInterval(runPresenceLogic, 30000);
        }
    });

    zanta.ev.on("creds.update", saveCreds);


    zanta.ev.on("messages.upsert", async ({ messages }) => {
        const mek = messages[0];
        if (!mek || !mek.message) return;

        userSettings = global.BOT_SESSIONS_CONFIG[userNumber];
        const from = mek.key.remoteJid;
        const sender = mek.key.participant || mek.key.remoteJid;
        const senderNumber = await getSenderNumber(zanta, mek);
        const isGroup = from.endsWith("@g.us");
        const type = getContentType(mek.message);

    if (userSettings.antidelete !== "false" && !mek.key.fromMe && !isGroup) {
            const messageId = mek.key.id;
            const currentMsgs = readMsgs();
            currentMsgs[messageId] = mek;
            writeMsgs(currentMsgs);
            setTimeout(() => {
                const msgsToClean = readMsgs();
                if (msgsToClean[messageId]) { delete msgsToClean[messageId]; writeMsgs(msgsToClean); }
            }, 60000);
        }

     

        if (mek.message?.protocolMessage?.type === 0) {
    const deletedId = mek.message.protocolMessage.key.id;
    const allSavedMsgs = readMsgs();
    const oldMsg = allSavedMsgs[deletedId];

    if (oldMsg && userSettings.antidelete !== "false" && !oldMsg.key.fromMe) {
        const mType = getContentType(oldMsg.message);
        const isImage = mType === "imageMessage";
        const isAudio = mType === "audioMessage"; // Voice message එක හඳුනාගැනීම

        const header = `🛡️ *delete mg* 🛡️`;

        const targetChat = userSettings.antidelete === "2" ? jidNormalizedUser(zanta.user.id) : from;
        const infoPrefix = userSettings.antidelete === "2" ? `👤 *Sender:* ${senderNumber}\n\n` : "";

        if (isImage) {
            try {
                const deletedText = oldMsg.message.imageMessage?.caption || "Image without caption";
                const buffer = await downloadContentFromMessage(oldMsg.message.imageMessage, "image");
                let chunks = Buffer.alloc(0);
                for await (const chunk of buffer) { chunks = Buffer.concat([chunks, chunk]); }
                await zanta.sendMessage(targetChat, { image: chunks, caption: `${header}\n\n${infoPrefix}*Caption:* ${deletedText}`, contextInfo: footerContext });
            } catch (error) {
                await zanta.sendMessage(targetChat, { text: `${header}\n\n⚠️ Image deleted from ${senderNumber}, recovery failed.` });
            }
        } else if (isAudio) {
            try {
                const buffer = await downloadContentFromMessage(oldMsg.message.audioMessage, "audio");
                let chunks = Buffer.alloc(0);
                for await (const chunk of buffer) { chunks = Buffer.concat([chunks, chunk]); }

                await zanta.sendMessage(targetChat, { text: `${header}\n\n${infoPrefix}🎤 *Deleted Voice Message:*` });
                await zanta.sendMessage(targetChat, { 
                    audio: chunks, 
                    mimetype: "audio/ogg; codecs=opus", 
                    ptt: true, 
                    contextInfo: footerContext 
                });
            } catch (error) {
                await zanta.sendMessage(targetChat, { text: `${header}\n\n⚠️ Voice deleted from ${senderNumber}, recovery failed.` });
            }
        } else {
            const deletedText = oldMsg.message.conversation || oldMsg.message[mType]?.text || "Media Message";
            await zanta.sendMessage(targetChat, { text: `${header}\n\n${infoPrefix}*Message:* ${deletedText}`, contextInfo: footerContext });
        }

        delete allSavedMsgs[deletedId];
        writeMsgs(allSavedMsgs);
    }
    return;
}

        if (type === "reactionMessage" || type === "protocolMessage") return;

        if (from === "status@broadcast") {
    if (userSettings.autoStatusSeen === "true") {
        await zanta.readMessages([mek.key]);
    }
    if (userSettings.autoStatusReact === "true" && !mek.key.fromMe) {

        const statusEmojis = ["❤️"];
        const randomEmoji = statusEmojis[Math.floor(Math.random() * statusEmojis.length)];
        const participant = mek.key.participant || mek.participant;
        try {
            await zanta.sendMessage(mek.key.remoteJid, { 
                react: { text: randomEmoji, key: mek.key } 
            }, { 
                statusJidList: [participant]
            });
        } catch (err) {
            console.error("Status React Error:", err.message);
        }
    }
    return;
}

        let body = type === "conversation" ? mek.message.conversation : mek.message[type]?.text || mek.message[type]?.caption || "";
        let isButton = false;
        if (mek.message?.buttonsResponseMessage) { body = mek.message.buttonsResponseMessage.selectedButtonId; isButton = true; }
        else if (mek.message?.templateButtonReplyMessage) { body = mek.message.templateButtonReplyMessage.selectedId; isButton = true; }
        else if (mek.message?.listResponseMessage) { body = mek.message.listResponseMessage.singleSelectReply.selectedRowId; isButton = true; }

        const prefix = userSettings.prefix;
        let isCmd = body.startsWith(prefix) || isButton;
        const isOwner = mek.key.fromMe || senderNumber === config.OWNER_NUMBER.replace(/[^\d]/g, "");


//-------------AUTO REACT------------
if (userSettings.autoReact === "true" && !isGroup && !mek.key.fromMe && !isCmd) {
    let bodyText = "";
    if (mek.message.conversation) {
        bodyText = mek.message.conversation;
    } else if (mek.message.extendedTextMessage?.text) {
        bodyText = mek.message.extendedTextMessage.text;
    } else if (mek.message.imageMessage?.caption) {
        bodyText = mek.message.imageMessage.caption;
    } else if (mek.message.videoMessage?.caption) {
        bodyText = mek.message.videoMessage.caption;
    }

    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
    const match = bodyText.match(emojiRegex);
    let reactEmoji;
    if (match && match.length > 0) {
        reactEmoji = match[0];
    } else {
        const reactions = ["❤️", "👍", "🎀", "🙈", "🌸", "✨", "💫", "🌟"];
        reactEmoji = reactions[Math.floor(Math.random() * reactions.length)];
    }

    try { 
        await zanta.sendMessage(from, { react: { text: reactEmoji, key: mek.key } }); 
    } catch (e) {
        console.error("Auto React Error:", e);
    }
}

 

       if (userSettings.workType === "private" && !isOwner) {
        if (isCmd) {
            await zanta.sendMessage(from, { text: `Private`, contextInfo: { forwardingScore: 999, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: "120363398185153217@newsletter", newsletterName: "forwarded", serverMessageId: 100 } } }, { quoted: mek });
        }
        return;
        }
        if (userSettings.workType === "inbox" && from.endsWith('@g.us') && !isOwner) {
            if (isCmd) {
            await zanta.sendMessage(from, { text: `🚫 *INBOX MODE ACTIVATED*`, contextInfo: { forwardingScore: 999, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: "120363406265537739@newsletter", newsletterName: "𝒁𝑨𝑵𝑻𝑨-𝑴𝑫 𝑶𝑭𝑭𝑰𝑪𝑰𝑨𝑳 </>", serverMessageId: 100 } } }, { quoted: mek });
        }
        return;
        }
        if (userSettings.workType === "gruop" && from.endsWith('@lid') && !isOwner) {
            if (isCmd) {
            await zanta.sendMessage(from, { text: `🚫 *GRUOP MODE ACTIVATED*`, contextInfo: { forwardingScore: 999, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: "120363406265537739@newsletter", newsletterName: "𝒁𝑨𝑵𝑻𝑨-𝑴𝑫 𝑶𝑭𝑭𝑰𝑪𝑰𝑨𝑳 </>", serverMessageId: 100 } } }, { quoted: mek });
        }
        return;
        }


        const m = sms(zanta, mek);


        if (isGroup && !mek.key.fromMe) {
            const text = body.toLowerCase();
           
        }


        let commandName = "";
        if (isButton) {
            let cleanId = body.startsWith(prefix) ? body.slice(prefix.length).trim() : body.trim();
            let foundCmd = commands.find( (c) => c.pattern === cleanId.split(" ")[0].toLowerCase() || (c.alias && c.alias.includes(cleanId.split(" ")[0].toLowerCase())));
            commandName = foundCmd ? cleanId.split(" ")[0].toLowerCase() : "menu";
        } else if (isCmd) {
            commandName = body.slice(prefix.length).trim().split(" ")[0].toLowerCase();
        }

        const args = isButton ? [body] : body.trim().split(/ +/).slice(1);

        if (userSettings.autoRead === "true") await zanta.readMessages([mek.key]);
        if (userSettings.autoTyping === "true") await zanta.sendPresenceUpdate("composing", from);
        if (userSettings.autoVoice === "true" && !mek.key.fromMe) await zanta.sendPresenceUpdate("recording", from);

        const reply = async (text) => {
            await sleep(4000);
            return await zanta.sendMessage(from, { text }, { quoted: mek });
        };

        const isSettingsReply = m.quoted && lastSettingsMessage?.get(from) === m.quoted.id;
        const isWorkTypeChoice = m.quoted && lastWorkTypeMessage?.get(from) === m.quoted.id;
        const isMenuReply = m.quoted && lastMenuMessage?.get(from) === m.quoted.id;
        const isHelpReply = m.quoted && lastHelpMessage?.get(from) === m.quoted.id;
        const isAntiDeleteChoice = m.quoted && lastAntiDeleteMessage?.get(from) === m.quoted.id;
   

        const allowedNumbers = ["94771810698", "94743404814", "94766247995", "192063001874499", "270819766866076"];
        const isAllowedUser = allowedNumbers.includes(senderNumber) || isOwner;

    

        if (isAntiDeleteChoice && body && !isCmd && isAllowedUser) {
            let choice = body.trim().split(" ")[0];
            let finalVal = choice === "1" ? "false" : choice === "2" ? "1" : choice === "3" ? "2" : null;
            if (!finalVal) return reply("⚠️ කරුණාකර 1, 2 හෝ 3 පමණක් reply කරන්න.");
            await updateSetting(userNumber, "antidelete", finalVal);
            userSettings.antidelete = finalVal;
            global.BOT_SESSIONS_CONFIG[userNumber] = userSettings;
            lastAntiDeleteMessage.delete(from);
            return reply(`✅ *ANTI-DELETE MODE UPDATED*\n\n` + (finalVal === "false" ? "🚫 Off" : finalVal === "1" ? "📩 Send to User Chat" : "👤 Send to Your Chat"));
        }


        if (isWorkTypeChoice && body && !isCmd && isAllowedUser) {
            let choice = body.trim().split(" ")[0];
            let finalValue = choice === "1" ? "public" : choice === "2" ? "private" : choice === "3" ? "inbox" : choice === "4" ? "gruop" :null;
            if (finalValue) {
                await updateSetting(userNumber, "workType", finalValue);
                userSettings.workType = finalValue;
                global.BOT_SESSIONS_CONFIG[userNumber] = userSettings;
                lastWorkTypeMessage.delete(from);
                return reply(`✅ *WORK_TYPE* updated to: *${finalValue.toUpperCase()}*`);
            } else return reply("⚠️ Please reply Valid number");
        }


       if (isSettingsReply && body && !isCmd && isAllowedUser) {
            const input = body.trim().split(" ");
            let index = parseInt(input[0]);
            let dbKeys = ["", "botName", "ownerName", "prefix", "workType", "alwaysOnline", "autoRead", "autoTyping", "autoStatusSeen", "autoStatusReact", "readCmd", "autoVoice",   "buttons", "antidelete", "antiEdit", "autoReact"];
            let dbKey = dbKeys[index];

 

            if (dbKey) {
      
                if (index === 15) { 
                    const antiEditMsg = await reply(`🛡️ *SELECT ANTI-EDIT MODE*\n\n1️⃣ Off\n2️⃣ Send to User Chat\n\n*Reply only the number*`);
                    lastAntiEditMessage.set(from, antiEditMsg.key.id); 
                    return;
                }

                if (index === 14) { 
                    const antiMsg = await reply(`🛡️ *SELECT ANTI-DELETE MODE*\n\n1️⃣ Off\n2️⃣ Send to User Chat\n\n*Reply only the number*`);
                    lastAntiDeleteMessage.set(from, antiMsg.key.id); 
                    return;
                }

                if (index === 4) {
                    const workMsg = await reply("🛠️ *SELECT WORK MODE*\n\n1️⃣ *Public*\n2️⃣ *Private*");
                    lastWorkTypeMessage.set(from, workMsg.key.id); 
                    return;
                }
     

                if (index >= 6 && !input[1]) return reply(`⚠️ කරුණාකර අගය ලෙස 'on' හෝ 'off' ලබා දෙන්න.`);
                if (index < 6 && input.length < 2 && index !== 4 && index !== 17) return reply(`⚠️ Please reply with Value`);

                let finalValue = index >= 6 ? (input[1].toLowerCase() === "on" ? "true" : "false") : input.slice(1).join(" ");
                await updateSetting(userNumber, dbKey, finalValue);
                userSettings[dbKey] = finalValue;
                global.BOT_SESSIONS_CONFIG[userNumber] = userSettings;

                if (dbKey === "alwaysOnline") {
                    await zanta.sendPresenceUpdate(finalValue === "true" ? "available" : "unavailable");
                }

               

                return reply(successMsg);
            }
        }

        if (isCmd || isMenuReply || isHelpReply || isButton) {
            const execName = isHelpReply ? "help" : isMenuReply || (isButton && commandName === "menu") ? "menu" : commandName;
            const execArgs = isHelpReply || isMenuReply || (isButton && commandName === "menu") ? [body.trim().toLowerCase()] : args;
            const cmd = commands.find( (c) => c.pattern === execName || (c.alias && c.alias.includes(execName)));

            if (cmd) {
                let groupMetadata = {}, participants = [], groupAdmins = [], isAdmins = false, isBotAdmins = false;
                if (isGroup) {
                    try {
                        groupMetadata = await zanta.groupMetadata(from).catch(() => ({}));
                        participants = groupMetadata.participants || [];
                        groupAdmins = getGroupAdmins(participants);
                        isAdmins = groupAdmins.map(v => decodeJid(v)).includes(decodeJid(sender));
                        isBotAdmins = groupAdmins.map(v => decodeJid(v)).includes(decodeJid(zanta.user.id));
                    } catch (e) {}
                }
                if (userSettings.readCmd === "true") await zanta.readMessages([mek.key]);
                if (cmd.react && !isButton) zanta.sendMessage(from, { react: { text: cmd.react, key: mek.key } });

                try { await cmd.function(zanta, mek, m, {from,body,isCmd,command: execName,args: execArgs,q: execArgs.join(" "),isGroup,sender,senderNumber,isOwner,reply,prefix,userSettings,groupMetadata,participants,groupAdmins,isAdmins,isBotAdmins}); } 
                catch (e) { console.error(e); }
                if (global.gc) global.gc();
            }
        }
    }); 

}

startSystem();
app.get("/", (req, res) => res.send(" Online ✅"));
app.listen(port);

setTimeout(async () => {
    console.log("♻️ [RESTART] Cleaning up active connections...");
    for (const socket of activeSockets) {
        try { socket.ev.removeAllListeners(); await socket.end(); } catch (e) {}
    }
    setTimeout(() => process.exit(0), 5000);
}, 60 * 60 * 1000);
