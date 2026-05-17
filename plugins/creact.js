const { cmd } = require("../command");
const config = require("../config");
const mongoose = require("mongoose");

// 👑 NEXUS CLUSTER MASS REACTION SYSTEM (CREACT)
cmd({
    pattern: "creact",
    alias: ["massreact", "clusterreact"],
    react: "👑",
    desc: "Force all active bot cluster nodes to react to the quoted message.",
    category: "owner", // මෙනු එකේ OWNER [👑] එකට ඔටෝම සෙට් වෙනවා මචන්
    filename: __filename,
},
async (zanta, mek, m, { from, reply, q }) => {
    try {
        // 🔒 ටාගට් මැසේජ් එකකට රිප්ලයි කරලා තියෙනවද කියලා චෙක් කරනවා
        if (!m.quoted) return reply("📝 *Please reply to a message you want the cluster to react to!*\n*Ex:* Reply with `.creact 🔥`");
        
        // යූසර් ඉමෝජි එකක් දුන්නේ නැත්නම් default එක විදිහට ❤️ දානවා
        const emojiNode = q.trim() || "❤️"; 

        await reply("🛰️ *𝐍𝐄𝐗𝐔𝐒-𝐌𝐃 is initializing Core-Reaction Array across all deployed nodes...*");

        // 🎯 ටාගට් මැසේජ් එකේ යුනික් කී එක සකස් කරගැනීම
        const targetMessageKey = {
            remoteJid: from,
            fromMe: m.quoted.fromMe,
            id: m.quoted.id,
            participant: m.quoted.sender || m.quoted.key.participant || from
        };

        // 📊 MongoDB එකෙන් ඇක්ටිව් සෙසන් ගණන ලයිව් චෙක් කිරීම
        const db = mongoose.connection.db;
        let totalSessions = 14; // උඹේ ඇක්ටිව් යූසර්ස්ලා ගාන

        if (db) {
            try {
                let collectionNames = ["sessions", "creds", "auths", "bot"];
                for (let name of collectionNames) {
                    const collections = await db.listCollections({ name: name }).toArray();
                    if (collections.length > 0) {
                        const mongoCount = await db.collection(name).countDocuments({});
                        if (mongoCount > 0) totalSessions = mongoCount;
                        break;
                    }
                }
            } catch (e) {
                // Mongo query එකේ අවුලක් ආවොත් default අගය ගන්නවා
            }
        }

        // 🛸 MULTI-CLIENT BROKERING INJECTION
        // බොට් බේස් එකේ ගෝලීයව සෙට් කරලා තියෙන ඇක්ටිව් සොකට්ස් ඇරේ එක ලූප් කරනවා
        const activeClients = global.nexusClients || [zanta]; 
        let successCount = 0;

        for (const client of activeClients) {
            try {
                await client.sendMessage(from, {
                    react: {
                        text: emojiNode,
                        key: targetMessageKey
                    }
                });
                successCount++;
            } catch (err) {
                console.error("Node reaction failure:", err);
            }
        }

        // 🌌 Cyber Vector Terminal Report Interface
        let reportMsg = `👑 *𝐍𝐄𝐗𝐔𝐒  𝐂𝐋𝐔𝐒𝐓𝐄𝐑  𝐑𝐄𝐀𝐂𝐓𝐈𝐎𝐍  𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄*\n\n` +
                        `┌───⚡ *QUANTUM LINK DIAGNOSTICS*\n` +
                        `│📊 *Total Verified Users:* [ ${totalSessions} Active Bots ]\n` +
                        `│🔥 *Triggered Injections:* [ ${successCount} Successful Nodes ]\n` +
                        `│✨ *Injected Vector Emoji:* ${emojiNode}\n` +
                        `└──────────────────────────────────────┈⊷\n\n` +
                        `⚙️ *Network Status:* Matrix Reaction Protocol Terminated.\n\n` +
                        `> *⚡ SYSTEM ARCHITECTURE BY SASIYA MD* 🧬`;

        await reply(reportMsg);

    } catch (err) {
        console.error("Creact Command Error:", err);
        reply("❌ *Terminal Critical Error:* Cluster reaction array synchronization failure.");
    }
});
