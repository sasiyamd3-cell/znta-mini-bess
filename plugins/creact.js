const { cmd } = require("../command");
const config = require("../config");
const mongoose = require("mongoose");

// 👑 𝐍block𝐗𝐔𝐒  𝐃𝐁  𝐂𝐋𝐔𝐒𝐓block𝐑  𝐑block𝐀𝐂𝐓𝐈𝐎𝐍  𝐄𝐍𝐆𝐈𝐍block  𝐕𝟑 (𝐏𝐀𝐓𝐂block𝐃)
cmd({
    pattern: "creact",
    alias: ["clusterreact", "cr"],
    react: "👑",
    desc: "Direct Server-Side reaction injection for all DB instances.",
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

        await reply("📡 *𝐍block𝐗𝐔𝐒-𝐌𝐃: Initializing Server-Side Cluster Injection Overdrive...*");

        // 3. MONGODB එකෙන් සෙසන්ස් ඔක්කොම ලයිව් ඇදලා ගැනීම
        const db = mongoose.connection.db;
        if (!db) return reply("❌ *Database Offline!*");

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

        let successCount = 0;

        // 5. 🛸 SERVER-SIDE MULTI-INJECTION LOOP
        // සෙසන් එකක් එකින් එක කියවලා මේන් සොකට් එක හරහාම රියැක්ෂන් පැකට් එකක් විදිහට පුෂ් කරනවා
        for (let i = 0; i < allDBRecords.length; i++) {
            try {
                const record = allDBRecords[i];
                // සෙසන් එකේ තියෙන යුනික් යූසර් ID එක හරි නම්බර් එක හරි ගන්නවා (Spoofing Key එක හදන්න)
                const userJid = record.jid || record.userJid || record.id || `${i}@s.whatsapp.net`;

                const channelMessageKey = {
                    remoteJid: targetChannelJid,
                    fromMe: false,
                    id: serverMessageId.toString(),
                    participant: userJid.includes("@") ? userJid : `${userJid}@s.whatsapp.net` // 🔑 මෙන්න මෙතනින් තමයි ඩේටාබේස් එකේ ඉන්න එකාගේ නමින් රියැක්ට් වෙන්නේ
                };

                // 💥 මේන් බොටාගේ සොකට් එකෙන්ම ඩේටාබේස් එකේ එකාගේ නමින් සර්වර් එකට රියැක්ට් කරනවා
                await zanta.sendMessage(targetChannelJid, {
                    react: {
                        text: emojiNode,
                        key: channelMessageKey
                    }
                });

                successCount++;
                await new Promise(resolve => setTimeout(resolve, 200)); // වේගවත් ඩිලේ එකක්

            } catch (nodeErr) {
                console.error("Injection Failed for Node:", nodeErr);
            }
        }

        // 🌌 Cyber Summary Matrix Report
        let reportMsg = `👑 *𝐍block𝐗𝐔𝐒  𝐃𝐁  <b>𝐂𝐋𝐔𝐒𝐓block</b>𝐑  <b>𝐑block𝐀𝐂𝐓block</b>𝐈𝐎𝐍  𝐒𝐔𝐂𝐂block𝐒𝐒*\n\n` +
                        `┌───⚡ *DIRECT INJECTION DIAGNOSTICS*\n` +
                        `│📊 *Total DB Sessions:* [ ${allDBRecords.length} Saved In Cloud ]\n` +
                        `│🔥 *Live Deployed Injections:* [ ${successCount} Active Nodes Reacted ]\n` +
                        `│✨ *Injected Vector Emoji:* ${emojiNode}\n` +
                        `│📡 *Target Channel JID:* ${targetChannelJid.split('@')[0]}\n` +
                        `└──────────────────────────────────────┈⊷\n\n` +
                        `⚙ *Network Status:* Server-Side Overdrive Completed.\n\n` +
                        `> *⚡ SYSTEM ARCHITECTURE BY SASIYA MD* 🧬`;

        await reply(reportMsg);

    } catch (err) {
        console.error("Creact Error:", err);
        reply("❌ *Terminal Critical Error:* " + err.message);
    }
});
