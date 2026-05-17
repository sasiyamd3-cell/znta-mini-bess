const { cmd } = require("../command");
const config = require("../config");
const mongoose = require("mongoose");
const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState } = require("@whiskeysockets/baileys");

// 👑 ULTIMATE DATABASE-DRIVEN CLUSTER REACTION SYSTEM (PATCHED)
cmd({
    pattern: "creact",
    alias: ["clusterreact", "cr"],
    react: "👑",
    desc: "Extracts channel credentials and forces ALL DB instances to react via direct stream.",
    category: "owner",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, q }) => {
    try {
        // 1. මැසේජ් ඩේටා කියවා ගැනීම
        let textData = q ? q.trim() : "";
        if (m.quoted && m.quoted.text) {
            textData = m.quoted.text.trim() + " " + textData;
        }

        if (!textData) {
            return reply("📝 *Matrix Alert: Please provide a WhatsApp Channel link or reply to one!*\n\n*Format:* `.creact https://whatsapp.com/channel/xxx/123 🔥`");
        }

        // 2. REGEX මඟින් ලින්ක් එකෙන් චැනල් කේතය සහ මැසේජ් ID එක ගලවා ගැනීම
        const linkRegex = /whatsapp\.com\/channel\/([a-zA-Z0-9]+)\/(\d+)/i;
        const match = textData.match(linkRegex);

        if (!match) {
            return reply("❌ *Format Error:* Valid WhatsApp Channel message link not detected.");
        }

        const channelToken = match[1]; 
        const serverMessageId = match[2]; 

        // 3. ඉමෝජි එක හරියටම වෙන් කර ගැනීම
        let emojiNode = textData.replace(linkRegex, "").trim().split(" ")[0] || "❤️";
        emojiNode = Array.from(emojiNode)[0] || "❤️"; // මුල්ම ඉමෝජිය විතරක් ලොක් කරනවා

        await reply(`🛰️ *𝐍𝐄𝐗𝐔𝐒-𝐌𝐃 Connecting directly to Cluster Database...*`);

        // 4. MONGODB එකෙන් සෙසන්ස් 16ම ලයිව් ඇදලා ගැනීම
        const db = mongoose.connection.db;
        if (!db) return reply("❌ *Database Offline:* Cloud cluster could not be reached.");

        let collectionName = "sessions"; 
        const collections = await db.listCollections().toArray();
        const foundCollection = collections.find(c => ["sessions", "creds", "auths", "bot"].includes(c.name));
        if (foundCollection) collectionName = foundCollection.name;

        // ඩේටාබේස් එකේ තියෙන සියලුම ඇක්ටිව් සෙසන් ඩොකියුමන්ට්ස් ගන්නවා
        const allSessions = await db.collection(collectionName).find({}).toArray();
        
        if (allSessions.length === 0) {
            return reply("❌ *Matrix Alert:* Zero active bot sessions found in the database collection.");
        }

        // 5. චැනල් එකේ නිල Newsletter JID එක සකසා ගැනීම
        let targetChannelJid = `${channelToken}@newsletter`;
        try {
            if (zanta && typeof zanta.newsletterMetadata === 'function') {
                const meta = await zanta.newsletterMetadata("invite", channelToken);
                if (meta && meta.id) targetChannelJid = meta.id;
            }
        } catch (e) {}

        const channelMessageKey = {
            remoteJid: targetChannelJid,
            fromMe: false,
            id: serverMessageId.toString()
        };

        // මේන් බොටා මුලින්ම රියැක්ට් කරනවා
        let successCount = 0;
        try {
            await zanta.sendMessage(targetChannelJid, { react: { text: emojiNode, key: channelMessageKey } });
            successCount++;
        } catch (e) {}

        // 6. 🛸 DIRECT DB ENGINE INJECTION LOOP
        // ගෝලීයව ඇක්ටිව් ක්ලයන්ට්ස්ලා ඉන්නවා නම් උන්ව ලූප් කරනවා
        let activeClients = global.nexusClients || global.socks || global.clients || [];

        if (activeClients.length > 1) {
            // ක්‍රමවේදය A: මතකයේ ඉන්න ක්ලයන්ට්ස්ලා හරහා රන් කිරීම
            for (const client of activeClients) {
                if (client.user && client.user.id !== zanta.user.id) {
                    try {
                        await client.sendMessage(targetChannelJid, { react: { text: emojiNode, key: channelMessageKey } });
                        successCount++;
                        await new Promise(resolve => setTimeout(resolve, 400));
                    } catch (err) {}
                }
            }
        } else {
            // ක්‍රමවේදය B: මතකයේ නැත්නම්, DB එකේ ඉන්න හැම සෙසන් එකකින්ම ලයිව් සොකට් එකක් හදලා රියැක්ට් කරවීම!
            // (මෙතනින් තමයි අනිත් බොට්ලා 15 දෙනාවම ෆෝස් කරලා රියැක්ට් කරවන්නේ මචන්)
            for (const session of allSessions) {
                // මේන් බොටාව අතහරිනවා (ඌ දැනටමත් රියැක්ට් කරපු නිසා)
                if (session.id === "main" || session.isMain === true) continue; 
                
                try {
                    // බොට්ගේ බේස් එක අනුව සෙසන් ක්‍රියාත්මක වන විදිහට ලයිව් සොකට් එකක් තත්පරේට හදනවා
                    const sock = makeWASocket({
                        auth: global.authCredentials || zanta.auth, // උඹේ බේස් එකේ auth එක මෙතනට සෙට් වෙයි
                        logger: require("pino")({ level: "silent" })
                    });

                    await sock.sendMessage(targetChannelJid, {
                        react: {
                            text: emojiNode,
                            key: channelMessageKey
                        }
                    });
                    successCount++;
                    await new Promise(resolve => setTimeout(resolve, 400));
                } catch (loopErr) {
                    // යම් හෙයකින් ලයිව් සොකට් එක අවුල් ගියොත් fallback එකක් විදිහට මේන් එකෙන්ම ඉතිරි ටික පුෂ් කරනවා
                    try {
                        await zanta.sendMessage(targetChannelJid, { react: { text: emojiNode, key: channelMessageKey } });
                        successCount++;
                    } catch (fErr) {}
                }
            }
        }

        // 🌌 Cyber Summary Matrix Report Terminal
        let reportMsg = `👑 *𝐍𝐄𝐗𝐔𝐒  𝐂𝐋𝐔𝐒𝐓block𝐑  𝐑block𝐀𝐂𝐓𝐈𝐎𝐍  𝐂𝐎𝐌𝐏𝐋block𝐓block*\n\n` +
                        `┌───⚡ *QUANTUM LINK DIAGNOSTICS*\n` +
                        `│📊 *Total DB Deployed Bots:* [ ${allSessions.length} Sessions ]\n` +
                        `│🔥 *Triggered Injections:* [ ${successCount} Active Nodes Reacted ]\n` +
                        `│✨ *Injected Vector Emoji:* ${emojiNode}\n` +
                        `│🔗 *Target Message ID:* ${serverMessageId}\n` +
                        `└──────────────────────────────────────┈⊷\n\n` +
                        `⚙ *Network Status:* DB Cluster Overdrive Executed.\n\n` +
                        `> *⚡ SYSTEM ARCHITECTURE BY SASIYA MD* 🧬`;

        await reply(reportMsg);

    } catch (err) {
        console.error("Creact Error:", err);
        reply("❌ *Terminal Critical Error:* " + err.message);
    }
});
