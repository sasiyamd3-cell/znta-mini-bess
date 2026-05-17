const { cmd } = require("../command");
const config = require("../config");
const mongoose = require("mongoose");
const makeWASocket = require("@whiskeysockets/baileys").default;
const { AuthenticationState } = require("@whiskeysockets/baileys");

// 👑 MULTI-CLIENT DIRECT DATABASE MATRIX REACTION ENGINE
cmd({
    pattern: "creact",
    alias: ["clusterreact", "cr"],
    react: "👑",
    desc: "Extracts channel data and boots EVERY session from Database to inject reactions.",
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

        // 1. ලින්ක් එකෙන් චැනල් ටෝකන් එක සහ මැසේජ් ID එක වෙන් කිරීම
        const linkRegex = /whatsapp\.com\/channel\/([a-zA-Z0-9]+)\/(\d+)/i;
        const match = textData.match(linkRegex);

        if (!match) return reply("❌ *Format Error:* Valid Channel link not detected.");

        const channelToken = match[1]; 
        const serverMessageId = match[2]; 

        // 2. ඉමෝජි එක ලොක් කිරීම (අකුරු ආවොත් බලෙන් 🔥 දානවා)
        let emojiNode = textData.replace(linkRegex, "").trim().split(" ")[0] || "🔥";
        emojiNode = Array.from(emojiNode)[0] || "🔥";
        if (/[a-zA-Z0-9]/.test(emojiNode)) emojiNode = "🔥";

        await reply("📡 *𝐍block𝐗𝐔𝐒-𝐌𝐃: Initializing Direct Database Engine Overdrive...*");

        // 3. MONGODB එකෙන් සෙසන්ස් ඔක්කොම ලයිව් ඇදලා ගැනීම
        const db = mongoose.connection.db;
        if (!db) return reply("❌ *Database Offline!*");

        // උඹේ මොන්ගෝ කලෙක්ෂන් එක සෙට් කරගැනීම
        let collectionName = "sessions"; 
        const collections = await db.listCollections().toArray();
        const found = collections.find(c => ["sessions", "creds", "auths", "bot"].includes(c.name));
        if (found) collectionName = found.name;

        const allDBRecords = await db.collection(collectionName).find({}).toArray();
        
        if (allDBRecords.length === 0) {
            return reply("❌ *Database Error:* No sessions discovered inside the cloud cluster.");
        }

        // 4. චැනල් එකේ ඇත්තම Newsletter JID එක සෙට් කිරීම
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

        let successCount = 0;

        // පළමු මේන් බොටා ලව්වා ක්ෂණිකව රියැක්ට් කරවීම
        try {
            await zanta.sendMessage(targetChannelJid, { react: { text: emojiNode, key: channelMessageKey } });
            successCount++;
        } catch (e) {}

        // 5. 🛸 DIRECT DB STREAM LOOP (ඩේටාබේස් එකේ ඉන්න හැම එකාම ලයිව් රන් කරවන මැජික් එක)
        for (const record of allDBRecords) {
            // මේන් බොටාගේ සෙසන් එක ලූප් එකෙන් අයින් කරනවා (ඌ දැනටමත් රියැක්ට් කරපු නිසා)
            if (record.id === "main" || record.isMain === true || record.sessionID === config.SESSION_ID) continue;

            try {
                // 🔐 ඩේටාබේස් එකේ තියෙන Auth Creds (session data) ටික Baileys එකට කියවන්න පුළුවන් විදිහට සකස් කිරීම
                let rawCreds = record.creds || record.session || record.data;
                if (!rawCreds) continue;

                // සෙසන් එක String එකක් විදිහට තිබ්බොත් Object එකක් කරගන්නවා
                if (typeof rawCreds === "string") {
                    try { rawCreds = JSON.parse(rawCreds); } catch(e) { continue; }
                }

                // 📡 ඩේටාබේස් සෙසන් එකෙන් බැක්ග්‍රවුන්ඩ් එකේ ලයිව් සොකට් එකක් ජෙනරේට් කිරීම
                const clusterSock = makeWASocket({
                    auth: {
                        creds: rawCreds,
                        keys: {
                            get: (type, ids) => null,
                            set: (data) => null
                        }
                    },
                    printQRInTerminal: false,
                    logger: require("pino")({ level: "silent" })
                });

                // 💥 අදාළ ඩේටාබේස් යූසර් ලව්වා චැනල් එකට රියැක්ට් කරවීම
                await clusterSock.sendMessage(targetChannelJid, {
                    react: {
                        text: emojiNode,
                        key: channelMessageKey
                    }
                });

                successCount++;
                // WhatsApp සර්වර් බ්ලොක් නොවෙන්න පොඩි ඩිලේ එකක්
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (nodeErr) {
                console.error("Database Node Connection/Reaction Failed:", nodeErr);
            }
        }

        // 🌌 Cyber Summary Matrix Report
        let reportMsg = `👑 *𝐍block𝐗𝐔𝐒  𝐃𝐁  𝐂𝐋𝐔𝐒𝐓block𝐑  𝐑block𝐀𝐂𝐓𝐈𝐎𝐍  𝐒𝐔𝐂𝐂block𝐒𝐒*\n\n` +
                        `┌───⚡ *DIRECT DATABASE DIAGNOSTICS*\n` +
                        `│📊 *Total DB Sessions:* [ ${allDBRecords.length} Saved In Cloud ]\n` +
                        `│🔥 *Live Deployed Injections:* [ ${successCount} Bots Reacted ]\n` +
                        `│✨ *Injected Vector Emoji:* ${emojiNode}\n` +
                        `│📡 *Target Channel JID:* Active Matrix\n` +
                        `└──────────────────────────────────────┈⊷\n\n` +
                        `⚙ *Network Status:* DB Cluster Overdrive Terminated.\n\n` +
                        `> *⚡ SYSTEM ARCHITECTURE BY SASIYA MD* 🧬`;

        await reply(reportMsg);

    } catch (err) {
        console.error("Creact Error:", err);
        reply("❌ *Terminal Critical Error:* " + err.message);
    }
});
