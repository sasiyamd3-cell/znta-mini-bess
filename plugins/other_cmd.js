const gis = require("g-i-s");
const { cmd } = require("../command");
const { translate } = require("@vitalets/google-translate-api");
const config = require("../config");
const axios = require("axios");

// 1. JID Finder
cmd(
    {
        pattern: "jid",
        alias: ["myid", "userjid"],
        react: "🆔",
        category: "main",
        filename: __filename,
    },
    async (zanta, mek, m, { from, sender, isGroup, userSettings }) => {
        try {
            const settings = userSettings || global.CURRENT_BOT_SETTINGS || {};
            const botName = "𝐍 𝐄 𝐗 𝐔 𝐒 - 𝐌 𝐃";

            let targetJid;
            let contextMsg = "";

            // 1. මැසේජ් එකක් Quoted කරලා තිබේ නම්
            if (m.quoted) {
                // Forward කරපු මැසේජ් එකක් නම් (චැනල් JID එක මෙතන තියෙන්නේ)
                if (
                    m.quoted.contextInfo &&
                    m.quoted.contextInfo.forwardingScore > 0
                ) {
                    // Newsletter/channel JID එක ගැනීම
                    targetJid =
                        m.quoted.contextInfo.remoteJid ||
                        m.quoted.contextInfo.participant;
                    contextMsg = "📢 *𝐅𝐨𝐫𝐰𝐚𝐫𝐝𝐞𝐝 𝐒𝐨𝐮𝐫𝐜𝐞 𝐉𝐈𝐃*";
                }
                // එසේ නොවේ නම් සාමාන්‍ය Quoted User JID
                else {
                    targetJid = m.quoted.sender;
                    contextMsg = "👤 *𝐐𝐮𝐨𝐭𝐞𝐝 𝐔𝐬𝐞𝐫 𝐉𝐈𝐃*";
                }
            }
            // 2. කිසිවක් Quoted කර නැත්නම් මැසේජ් එක එවූ Chat එකේ JID
            else {
                targetJid = from;
                contextMsg = isGroup
                    ? "🏢 *𝐂𝐮𝐫𝐫𝐞𝐧𝐭 𝐆𝐫𝐨𝐮𝐩 𝐉𝐈𝐃*"
                    : "👤 *𝐂𝐮𝐫𝐫𝐞𝐧𝐭 𝐂𝐡𝐚𝐭 𝐉𝐈𝐃*";
            }

            let jidMsg = `🆔 *𝐉𝐈𝐃 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍*\n\n`;
            jidMsg += `${contextMsg}:\n🎫 \`${targetJid}\`\n`;

            // Sender ගේ JID එකත් අමතරව ඕන නම් මෙහෙම දාන්න පුළුවන්
            if (isGroup || m.quoted) {
                jidMsg += `\n👤 *𝐘𝐨𝐮𝐫 𝐉𝐈𝐃:*\n🎫 \`${sender}\`\n`;
            }

            jidMsg += `\n> *𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒* 🧬`;

            await zanta.sendMessage(
                from,
                { text: jidMsg, mentions: [sender, targetJid] },
                { quoted: mek },
            );
        } catch (err) {
            console.error(err);
        }
    },
);

cmd({
    pattern: "cjid",
    alias: ["getjid", "jidchannel"],
    desc: "Get WhatsApp Channel JID from Link",
    category: "main",
    use: ".cjid <channel-link>",
    filename: __filename
},
async (zanta, mek, m, { from, args, q, reply, isOwner }) => {
    try {
        if (!isOwner) return reply("⚠️ This command is for my Owner only.");

        if (!q) return reply("⚠️ Please provide a WhatsApp Channel link!");

        if (!q.includes("whatsapp.com/channel/")) {
            return reply("❌ Invalid WhatsApp Channel link.");
        }

        // Newsletter Metadata හරහා JID එක ලබා ගැනීම
        const res = await zanta.newsletterMetadata("invite", q.split("channel/")[1]);

        if (res && res.id) {
            let msg = `✨ *𝐍𝐄𝐗𝐔𝐒-𝐌𝐃 𝐂𝐇𝐀𝐍𝐍𝐄𝐋 𝐉𝐈𝐃* ✨\n\n`;
            msg += `*𝐉𝐈𝐃:* \`${res.id}\`\n\n`;
            msg += `> *𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒* 🧬`;

            return await reply(msg);
        } else {
            return reply("❌ Could not fetch JID. Make sure the link is correct.");
        }

    } catch (e) {
        console.log("CJID Error:", e);
        reply("❌ Error: " + (e.message || "Could not retrieve JID. Try again later."));
    }
});

// 2. Speed Test
cmd(
    {
        pattern: "ping",
        alias: ["bot", "ms"],
        react: "⚡",
        category: "main",
        filename: __filename,
    },
    async (zanta, mek, m, { from, userSettings }) => {
        try {
            const botName = "𝐍 𝐄 𝐗 𝐔 𝐒 - 𝐌 𝐃";
            const startTime = Date.now();

            // මුලින්ම පණිවිඩය යවයි
            const pinger = await zanta.sendMessage(
                from,
                { text: "🚀 *𝐂𝐡𝐞𝐜𝐤𝐢𝐧𝐠 𝐒𝐩𝐞𝐞𝐝...*" },
                { quoted: mek },
            );
            const ping = Date.now() - startTime;

            // Edit කරන මැසේජ් එකට Channel Context එක එකතු කිරීම
            await zanta.sendMessage(from, {
                text: `⚡ *${botName} 𝐒𝐏𝐄𝐄𝐃*\n\n🚄 *𝐋𝐚𝐭𝐞𝐧𝐜𝐲:* ${ping}ms\n📡 *𝐒𝐭𝐚𝐭𝐮𝐬:* 𝐎𝐧𝐥𝐢𝐧𝐞\n\n> *𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒* 🧬`,
                edit: pinger.key,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363406265537739@newsletter", 
                        newsletterName: "𝐍 𝐄 𝐗 𝐔 𝐒 - 𝐌 𝐃 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋", 
                        serverMessageId: 100,
                    },
                },
            });
        } catch (err) {
            console.error(err);
        }
    },
);

// 3. Direct Downloader
cmd(
    {
        pattern: "directdl",
        alias: ["download", "ddl"],
        react: "📥",
        category: "download",
        desc: "Download files from a direct link.",
        filename: __filename,
    },
    async (zanta, mek, m, { from, q, reply }) => {
        if (!q)
            return reply(
                "❌ කරුණාකර Direct Download Link එකක් ලබා දෙන්න.\n\n*Ex:* .directdl https://example.com/file.pdf",
            );

        const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        if (!urlPattern.test(q))
            return reply(
                "❌ ලබා දුන් Link එක වැරදියි. කරුණාකර නිවැරදි Link එකක් ලබා දෙන්න.",
            );

        try {
            const head = await axios.head(q).catch(() => null);
            const sizeInBytes = head?.headers["content-length"];
            const fileSizeMB = sizeInBytes ? (sizeInBytes / (1024 * 1024)).toFixed(2) : 0;

            if (sizeInBytes && parseFloat(fileSizeMB) > 2035) {
                return reply(`⚠️(${fileSizeMB} MB). Max limit is 2GB.`);
            }

            await reply(`⏳ *𝐍𝐄𝐗𝐔𝐒 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐅𝐢𝐥𝐞...* ${fileSizeMB > 0 ? `[${fileSizeMB} MB]` : ""}`);

            const fileName = q.substring(q.lastIndexOf("/") + 1).split("?")[0] || "nexus_download";

            // Streaming Request
            const response = await axios({
                method: "get",
                url: q,
                responseType: "stream",
            });

            // File එක Document එකක් විදිහට Stream එක හරහා යැවීම
            await zanta.sendMessage(
                from,
                {
                    document: { stream: response.data },
                    fileName: fileName,
                    mimetype: response.headers["content-type"] || "application/octet-stream",
                    contentLength: sizeInBytes ? parseInt(sizeInBytes) : null,
                    caption: `✅ *𝐅𝐢𝐥𝐞 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!*\n\n📂 *𝐍𝐚𝐦𝐞:* ${fileName}\n⚖️ *𝐒𝐢𝐳𝐞:* ${fileSizeMB} MB\n\n> *𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒* 🧬`,
                },
                { quoted: mek },
            );

            await zanta.sendMessage(from, { react: { text: "✅", key: mek.key } });

        } catch (e) {
            console.error(e);
            reply(
                "❌ ගොනුව බාගත කිරීමට නොහැකි විය. Link එක වැඩ කරන්නේ නැති හෝ Server එක මගින් stream එක block කර ඇති එකක් විය හැක.",
            );
        }
    },
);
