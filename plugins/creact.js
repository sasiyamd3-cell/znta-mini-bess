const { cmd } = require("../command");
const config = require("../config");
const mongoose = require("mongoose");

// 👑 NEXUS AUTOMATED CHANNEL CLUSTER INJECTION SYSTEM
cmd({
    pattern: "creact",
    alias: ["clusterreact", "cr"],
    react: "👑",
    desc: "Extracts channel credentials from a link and forces all active nodes to react.",
    category: "owner",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, q }) => {
    try {
        // 1. යූසර් කෙලින්ම ලින්ක් එක දුන්නද නැත්නම් මැසේජ් එකකට රිප්ලයි කරලද කියලා බලනවා
        let textData = q ? q.trim() : "";
        if (m.quoted && m.quoted.text) {
            textData = m.quoted.text.trim() + " " + textData;
        }

        if (!textData) {
            return reply("📝 *Matrix Alert: Please provide a WhatsApp Channel link or reply to one!*\n\n*Format:* `.creact https://whatsapp.com/channel/xxx/123 🔥`");
        }

        // 2. REGEX මඟින් චැනල් කේතය (Token) සහ මැසේජ් ID එක ලින්ක් එකෙන් ඔටෝම ගලවා ගැනීම
        const linkRegex = /whatsapp\.com\/channel\/([a-zA-Z0-9]+)\/(\d+)/i;
        const match = textData.match(linkRegex);

        if (!match) {
            return reply("❌ *Format Error:* Valid WhatsApp Channel message link not detected.");
        }

        const channelToken = match[1]; // චැනල් එකේ Token එක (උදා: 0029Vb7a9bO6RGJKJbh4xR0F)
        const serverMessageId = match[2]; // මැසේජ් ID එක (උදා: 1231)

        // 3. යූසර් දීපු ඉමෝජි එක වෙන් කරලා ගැනීම (නැත්නම් Default එක ❤️)
        // Regex එක අයින් කරලා ඉතිරි වෙන කෑල්ලෙන් ඉමෝජි එක ගන්නවා
        let emojiNode = textData.replace(linkRegex, "").trim().split(" ")[0] || "❤️";
        
        // යූසර් ඉමෝජි වැලක් (🔥👋🥺) දුන්නොත් මුල්ම එක විතරක් ගන්නවා (Baileys error වදින්නේ නැති වෙන්න)
        emojiNode = Array.from(emojiNode)[0] || "❤️";

        await reply(`🛰️ *𝐍block𝐗𝐔𝐒-𝐌𝐃 Fetching Channel Node: [ ${channelToken} ]...*`);

        // 4. MULTI-CLIENT Sockets ටික හැම ක්‍රමයකින්ම ඇදලා ගන්නවා (Fixing the "1 Successful Node" Bug)
        let activeClients = [];
        
        if (global.nexusClients && Array.isArray(global.nexusClients)) {
            activeClients = global.nexusClients;
        } else if (global.socks && Array.isArray(global.socks)) {
            activeClients = global.socks;
        } else if (global.clients && Array.isArray(global.clients)) {
            activeClients = global.clients;
        }

        // ඉදිරියටම වැඩේ කරන්න Active clients ඇරේ එක හිස් නම් දැනට කමාන්ඩ් එක රන් කරන බොටාව හරි දානවා
        if (activeClients.length === 0) {
            activeClients = [zanta];
        }

        // 5. චැනල් එකේ ඇත්තම JID එක (Newsletter JID) හොයාගැනීමට Baileys Metadata Query එකක් ගැසීම
        // (සටහන: සමහර බේස් වලට කෙලින්ම Token එකට රියැක්ට් කරන්න බැහැ, JID එකම ඕනේ)
        let targetChannelJid = `${channelToken}@newsletter`; // Fallback JID
        
        try {
            // පළමු බොටා ලව්වා චැනල් එකේ නිල JID එක සර්වර් එකෙන් ලයිව් ඉල්ලනවා
            if (activeClients[0] && typeof activeClients[0].newsletterMetadata === 'function') {
                const meta = await activeClients[0].newsletterMetadata("invite", channelToken);
                if (meta && meta.id) targetChannelJid = meta.id;
            }
        } catch (metaErr) {
            console.log("Newsletter metadata fetch bypass, using fallback token JID.");
        }

        const channelMessageKey = {
            remoteJid: targetChannelJid,
            fromMe: false,
            id: serverMessageId.toString()
        };

        let successCount = 0;

        // 6. 🛸 ACTIVE CLUSTER INJECTION LOOP (හැම බොටෙක්ම එක පිට එක රියැක්ට් කරනවා)
        for (const client of activeClients) {
            try {
                if (client && typeof client.sendMessage === 'function') {
                    await client.sendMessage(targetChannelJid, {
                        react: {
                            text: emojiNode,
                            key: channelMessageKey
                        }
                    });
                    successCount++;
                    // WhatsApp බෑන් නොවෙන්න බොට්ස්ලා අතර තත්පර කාලයක පොඩි Delay එකක් තියනවා
                    await new Promise(resolve => setTimeout(resolve, 500)); 
                }
            } catch (err) {
                console.error("Individual Node failed to react:", err);
            }
        }

        // 📊 MongoDB එකෙන් දැනට ඇතුළේ තියෙන මුළු සෙසන් ගාණ නිකන් බලාගන්න ගන්නවා
        let dbSessionsCount = activeClients.length;
        try {
            const db = mongoose.connection.db;
            if (db) {
                const collections = await db.listCollections().toArray();
                const found = collections.find(c => ["sessions", "creds", "auths"].includes(c.name));
                if (found) {
                    dbSessionsCount = await db.collection(found.name).countDocuments({});
                }
            }
        } catch (dbErr) {}

        // 🌌 Cyber Summary Matrix Report Terminal
        let reportMsg = `👑 *𝐍block𝐗𝐔𝐒  𝐂𝐋𝐔𝐒𝐓block𝐑  𝐑block𝐀𝐂𝐓𝐈𝐎𝐍  𝐂𝐎𝐌𝐏𝐋block𝐓block*\n\n` +
                        `┌───⚡ *QUANTUM LINK DIAGNOSTICS*\n` +
                        `│📊 *Total Cluster Users:* [ ${dbSessionsCount} Deployed Bots ]\n` +
                        `│🔥 *Triggered Injections:* [ ${successCount} Active Nodes Reacted ]\n` +
                        `│✨ *Injected Vector Emoji:* ${emojiNode}\n` +
                        `│🔗 *Target Message ID:* ${serverMessageId}\n` +
                        `└──────────────────────────────────────┈⊷\n\n` +
                        `⚙️ *Network Status:* Channel Target Completed Successfully.\n\n` +
                        `> *⚡ SYSTEM ARCHITECTURE BY SASIYA MD* 🧬`;

        await reply(reportMsg);

    } catch (err) {
        console.error("Creact Error:", err);
        reply("❌ *Terminal Critical Error:* Cluster injection execution failure: " + err.message);
    }
});
