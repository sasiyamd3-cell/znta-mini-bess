const { cmd } = require("../command");
const config = require("../config");

// 📊 BOT CHATS COUNT COMMAND
cmd({
    pattern: "botcount",
    alias: ["status", "botstatus", "count"],
    react: "📊",
    desc: "Fetch live connected chats and groups configuration matrix.",
    category: "main", // අපේ ප්‍රධාන මෙනු එකට ඔටෝ එකතු වෙනවා
    filename: __filename,
},
async (zanta, mek, m, { from, reply }) => {
    try {
        await reply("🛰️ *𝐍𝐄𝐗𝐔𝐒-𝐌𝐃 is querying localized chat matrix clusters...*");

        // 🔍 බොට් සම්බන්ධ වෙලා තියෙන මුළු චැට් ලිස්ට් එකම ගන්නවා (Baileys Store / Cache එකෙන්)
        // උඹේ බොට්ගේ Baileys සෙටප් එක අනුව zanta.chats හෝ zanta.store.chats පාවිච්චි වෙන්න පුළුවන්
        const allChats = zanta.chats ? zanta.chats.all() : Array.from(zanta.store?.chats?.values() || []);
        
        let totalChats = allChats.length;
        let groupCount = 0;
        let privateCount = 0;

        // ගෲප් චැට් සහ පර්සනල් චැට් වෙන් කරලා ගණන් ගන්නවා
        allChats.forEach(chat => {
            const id = chat.id || chat.jid || '';
            if (id.endsWith('@g.us')) {
                groupCount++;
            } else if (id.endsWith('@s.whatsapp.net')) {
                privateCount++;
            }
        });

        // චැට් ලිස්ට් එක හිස් නම් (සමහර විට බොට්ගේ memory cache එක තාම load වෙන ගමන් නම්) fallback එකක් දානවා
        if (totalChats === 0) {
            // බොට් දැනට ඉන්න චැට් එක හරි අඩුම තරමේ එකතු කරනවා
            totalChats = 1;
            if (from.endsWith('@g.us')) groupCount = 1; else privateCount = 1;
        }

        // 🌌 Cyberpunk Metric Interface Design
        let countMsg = `📊 *𝐍𝐄𝐗𝐔𝐒  𝐒𝐘𝐒𝐓𝐄𝐌  𝐌𝐄𝐓𝐑𝐈𝐂𝐒*\n\n` +
                       `┌───⚡ *CLUSTER DIAGNOSTICS*\n` +
                       `│📡 *Total Connected Nodes:* [ ${totalChats} Chats ]\n` +
                       `│👥 *Active Group Clusters:* [ ${groupCount} Groups ]\n` +
                       `│👤 *Private Terminal Links:* [ ${privateCount} Users ]\n` +
                       `└──────────────────────────┈⊷\n\n` +
                       `⚙️ *Network Status:* Operational [Secure]\n` +
                       `🤖 *Core Variant:* Nexus Elite v6.7\n\n` +
                       `> *𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄Ｒ 𝐍𝐄𝐗𝐔𝐒* 🧬`;

        await reply(countMsg);

    } catch (err) {
        console.error("BotCount Command Error:", err);
        reply("❌ *Terminal Error:* Failed to scan localized database clusters.");
    }
});
