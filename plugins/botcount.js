const { cmd } = require("../command");
const config = require("../config");
const mongoose = require("mongoose"); // MongoDB කනෙක්ශන් එක චෙක් කරන්න

// 📊 GLOBAL NEXUS BOT INSTANCE COUNT COMMAND
cmd({
    pattern: "botcount",
    alias: ["botstatus", "globalcount", "instances"],
    react: "📊",
    desc: "Fetch the total number of active bot instances running via MongoDB cluster.",
    category: "main",
    filename: __filename,
},
async (zanta, mek, m, { from, reply }) => {
    try {
        await reply("🛰️ *𝐍𝐄𝐗𝐔𝐒-𝐌𝐃 is querying Mongo Matrix Clusters for active sessions...*");

        // 1. උඹේ config එකේ තියෙන MONGODB_URI එක හරහා දැනට තියෙන කනෙක්ශන් එක ගන්නවා
        const db = mongoose.connection.db;

        if (!db) {
            return reply("❌ *Matrix Database Error:* Cloud database connection is not active.");
        }

        // 2. උඹේ ඩේටාබේස් එකේ සෙසන් සේව් වෙන Collection එකේ නම මෙතනට දාන්න (ගොඩක් වෙලාවට 'sessions' හෝ 'auths' හෝ 'creds')
        // බොට් බේස් එක අනුව ඔටෝම සෙට් වෙන්න පොදු කලෙක්ෂන් නාමයන් 3ක්ම චෙක් කරනවා:
        let collectionNames = ["sessions", "creds", "auths", "bot"];
        let totalBotsCount = 0;

        for (let name of collectionNames) {
            const collections = await db.listCollections({ name: name }).toArray();
            if (collections.length > 0) {
                totalBotsCount = await db.collection(name).countDocuments({});
                break;
            }
        }

        // Fallback: උඩ කිසිම එකක් සෙට් නොවුණොත් උඹේ බේස් එකේ දැනට සෙට් වෙලා තියෙන කලෙක්ෂන් එක කෙලින්ම ගනියි
        if (totalBotsCount === 0) {
            try {
                // මෙතන 'auth' කියන්නේ උඹේ බේස් එකේ මොන්ගෝ කලෙක්ෂන් නම නම් ඒක දාන්න මචන්
                totalBotsCount = await db.collection("auth").countDocuments({});
            } catch (e) {
                totalBotsCount = 0;
            }
        }

        // 🌌 Cyber Vector Terminal Design
        let serverSpecsMsg = `📊 *𝐍𝐄𝐗𝐔𝐒  𝐆𝐋𝐎𝐁𝐀𝐋  𝐌𝐄𝐓𝐑𝐈𝐂𝐒*\n\n` +
                             `┌───⚡ *MONGO MATRIX DIAGNOSTICS*\n` +
                             `│🚀 *Total Active Bot Instances:* [ ${totalBotsCount} Bots Live ]\n` +
                             `│📡 *Database Status:* CONNECTED [Cloud Cluster]\n` +
                             `│🛠️ *System Architecture:* Nexus Multi-Client v6.7\n` +
                             `└──────────────────────────┈⊷\n\n` +
                             `💡 _This represents the total number of users who paired and deployed a bot using your network platform._\n\n` +
                             `> *𝐏class𝐖𝐄𝐑𝐄𝐃 𝐁🇾 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒* 🧬`;

        await reply(serverSpecsMsg);

    } catch (err) {
        console.error("Mongo Count Error:", err);
        reply("❌ *Terminal Critical Error:* Failed to fetch synchronized data packets from Mongo cluster.");
    }
});
