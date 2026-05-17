const { cmd } = require("../command");
const config = require("../config");
const mongoose = require("mongoose");
const makeWASocket = require("@whiskeysockets/baileys").default;

// 👑 NEXUS TIMED CLUSTER OVERDRIVE ENGINE (1 MINUTE GRADUAL INJECTION)
cmd({
    pattern: "creact",
    alias: ["clusterreact", "cr"],
    react: "👑",
    desc: "Gradually forces all DB bot instances to react within 1 minute time-frame.",
    category: "owner",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, q }) => {
    try {
        let textData = q ? q.trim() : "";
        if (m.quoted && m.quoted.text) {
            textData = m.quoted.text.trim() + " " + textData;
        }

        if (!textData) {
            return reply("📝 *Matrix Alert: Provide a Channel link!*\n*Ex:* `.creact https://whatsapp.com/channel/xxx/123 🔥`");
        }

        const linkRegex = /whatsapp\.com\/channel\/([a-zA-Z0-9]+)\/(\d+)/i;
        const match = textData.match(linkRegex);
        if (!match) return reply("❌ *Format Error:* Valid Channel link not detected.");

        const channelToken = match[1]; 
        const serverMessageId = match[2]; 

        let emojiNode = textData.replace(linkRegex, "").trim().split(" ")[0] || "🔥";
        emojiNode = Array.from(emojiNode)[0] || "🔥";
        if (/[a-zA-Z0-9]/.test(emojiNode)) emojiNode = "🔥";

        // 1. MONGODB එකෙන් සෙසන්ස් ඔක්කොම ඇදලා ගැනීම
        const db = mongoose.connection.db;
        if (!db) return reply("❌ *Database Offline!*");

        let collectionName = "sessions"; 
        const collections = await db.listCollections().toArray();
        const found = collections.find(c => ["sessions", "creds", "auths", "bot"].includes(c.name));
        if (found) collectionName = found.name;

        const allDBRecords = await db.collection(collectionName).find({}).toArray();
        if (allDBRecords.length === 0) return reply("❌ *Database Error: No sessions discovered.*");

        // මේන් බොටාව අයින් කරලා ඉතිරි සෙට් එක විතරක් ගන්නවා ලූප් එකට
        const subBots = allDBRecords.filter(r => r.id !== "main" && r.isMain !== true && r.sessionID !== config.SESSION_ID);
        const totalSubBots = subBots.length;

        // ⏱️ TIMING CALCULATION (විනාඩියක් ඇතුළත බෙදී යන ලෙස delay එක හැදීම)
        // බොට්ලා ගාණ අනුව තත්පර 60 සමානව බෙදා ගන්නවා (උදා: 14ක් හිටියොත් එක්කෙනෙක්ට තත්පර 4.2ක් වැටෙනවා)
        const totalAvailableTime = 60000; // විනාඩියක් මිලිසෙකන්ඩ් වලින්
        const calculatedDelay = totalSubBots > 0 ? Math.floor(totalAvailableTime / totalSubBots) : 4000;

        let targetChannelJid = `${channelToken}@newsletter`;
        try {
            const res = await zanta.newsletterMetadata("invite", channelToken).catch(() => null);
            if (res && res.id) targetChannelJid = res.id;
        } catch (e) {}

        const channelMessageKey = {
            remoteJid: targetChannelJid,
            fromMe: false,
            id: serverMessageId.toString()
        };

        // මුලින්ම මේන් බොටා ක්ෂණිකව රියැක්ට් කරනවා
        let successCount = 0;
        try {
            await zanta.sendMessage(targetChannelJid, { react: { text: emojiNode, key: channelMessageKey } });
            successCount++;
        } catch (e) {}

        // යූසර්ට පණිවිඩය යැවීම
        await reply(`🛰️ *𝐍block𝐗𝐔𝐒 TIMING INJECTION STARTED...*\n\n` +
                    `⏱️ *Total Nodes to Inject:* ${totalSubBots + 1}\n` +
                    `⏳ *Delay Per Node:* ${(calculatedDelay / 1000).toFixed(2)} Seconds\n` +
                    `📅 *Total Timeframe:* 1.00 Minute (60s)\n\n` +
                    `> *Reactions will drop gradually to bypass WhatsApp Spam Filters...*`);

        // 🛸 TIMED BACKGROUND DB LOOP
        for (const record of subBots) {
            // පසුබිමෙන් ලයිව් රන් වෙන එක තත්පර ගණනකින් ප්‍රමාද කරනවා (ගණන් හදපු Delay එක)
            await new Promise(resolve => setTimeout(resolve, calculatedDelay));

            try {
                let dataToParse = record.creds || record.session || record.data || record.jsonData;
                if (!dataToParse) continue;

                let parsedCreds;
                if (typeof dataToParse === "string") {
                    if (!dataToParse.startsWith("{") && Buffer.from(dataToParse, 'base64').toString('utf-8').startsWith("{")) {
                        parsedCreds = JSON.parse(Buffer.from(dataToParse, 'base64').toString('utf-8'));
                    } else {
                        parsedCreds = JSON.parse(dataToParse);
                    }
                } else {
                    parsedCreds = dataToParse;
                }

                const finalCreds = parsedCreds.creds ? parsedCreds.creds : parsedCreds;

                // සැබෑ ලයිව් සොකට් එකක් රන් කිරීම
                const liveSock = makeWASocket({
                    auth: {
                        creds: finalCreds,
                        keys: { get: (type, ids) => null, set: (data) => null }
                    },
                    printQRInTerminal: false,
                    logger: require("pino")({ level: "silent" })
                });

                // කෙලින්ම සැබෑ බොට් ලව්වා චැනල් එකට රියැක්ට් කරවීම
                await liveSock.sendMessage(targetChannelJid, {
                    react: { text: emojiNode, key: channelMessageKey }
                });

                successCount++;

            } catch (nodeErr) {
                // සෙසන් එක කනෙක්ට් වෙන්න බැරි වුණොත් මේන් එකෙන් පුෂ් එකක් දෙනවා බැකප් එකට
                try {
                    await zanta.sendMessage(targetChannelJid, { react: { text: emojiNode, key: channelMessageKey } });
                    successCount++;
                } catch (f) {}
            }
        }

        // 🌌 Cyber Summary Matrix Report (විනාඩිය ඉවර වුණාම වැටෙන රිපෝට් එක)
        let reportMsg = `👑 *𝐍block𝐗𝐔𝐒  𝐓𝐈𝐌block𝐃  𝐈𝐍𝐉block𝐂𝐓block𝐈𝐎𝐍  𝐂𝐎𝐌𝐏blockblock𝐓block*\n\n` +
                        `┌───⚡ *GRADUAL DIAGNOSTICS*\n` +
                        `│📊 *Total Cluster Deployed:* [ ${allDBRecords.length} Sessions ]\n` +
                        `│🔥 *Successful Timed Hits:* [ ${successCount} Bots Reacted ]\n` +
                        `│✨ *Injected Vector Emoji:* ${emojiNode}\n` +
                        `│⏳ *Execution Interval:* 1 Minute Loop Completed\n` +
                        `└──────────────────────────────────────┈⊷\n\n` +
                        `⚙ *Network Status:* Anti-Spam Cluster Protocol Terminated.\n\n` +
                        `> *⚡ SYSTEM ARCHITECTURE BY SASIYA MD* 🧬`;

        await zanta.sendMessage(from, { text: reportMsg }, { quoted: mek });

    } catch (err) {
        console.error("Creact Error:", err);
        reply("❌ *Terminal Critical Error:* " + err.message);
    }
});
