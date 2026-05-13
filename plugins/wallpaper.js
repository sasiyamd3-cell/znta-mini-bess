const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");

const CHANNEL_JID = "120363233854483997@newsletter";
const UNSPLASH_KEY = "NDGysrFUsvz0GvnPU6hYsRyhCeWk6yXYyw2bYvajRpo"; // ඔයා දුන්න Key එක මෙතනට දාන්න

cmd({
    pattern: "wallpaper",
    alias: ["unsplash", "wall"],
    desc: "Search high-quality HD wallpapers.",
    category: "download",
    react: "🖼️",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, q, prefix, userSettings }) => {
    try {
        if (!q) return reply(`⚠️ Please provide a Name.\n\n*E.g:* \`${prefix}wallpaper Galaxy\``);

        const loading = await zanta.sendMessage(from, { text: `📸 *"${q}" Searching...*` }, { quoted: mek });

        // Unsplash API එකෙන් පින්තූර සෙවීම (Random 1 photo)
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&client_id=${UNSPLASH_KEY}&per_page=1`;

        const response = await axios.get(url);
        const data = response.data;

        if (!data.results || data.results.length === 0) {
            return await zanta.sendMessage(from, { text: "❌ Try again.", edit: loading.key });
        }

        const result = data.results[0];
        const imageUrl = result.urls.regular; // HD URL එක
        const downloadUrl = result.links.download; // Direct download link
        const description = result.alt_description || "High-Quality Wallpaper";

        const settings = userSettings || global.CURRENT_BOT_SETTINGS || {};
        const botName = settings.botName || config.DEFAULT_BOT_NAME || "𝒁𝑨𝑵𝑻𝑨-𝑴𝑫";

        const contextInfo = {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: CHANNEL_JID,
                serverMessageId: 100,
                newsletterName: "𝒁𝑨𝑵𝑻𝑨-𝑴𝑫 𝑶𝑭𝑭𝑰𝑪𝑰𝑨𝑳 </>"
            }
        };

        // පින්තූරය යැවීම
        await zanta.sendMessage(from, {
            image: { url: imageUrl },
            caption: `🖼️ *𝒁𝑨𝑵𝑻𝑨-𝑴𝑫 𝑯𝑫 𝑾𝑨𝑳𝑳𝑷𝑨𝑷𝑬𝑹* 🖼️\n\n` +
                     `✨ *Search:* ${q}\n` +
                     `📝 *Description:* ${description}\n\n` +
                     `> *© 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝑩𝒚 ${botName}*`,
            contextInfo: contextInfo
        }, { quoted: mek });

        await zanta.sendMessage(from, { text: "✅ *Upload Completed!*", edit: loading.key });

    } catch (e) {
        console.error(e);
        let errorMsg = "❌ Error.";
        if (e.response && e.response.status === 401) errorMsg = "❌ API Key Expaired.";
        await zanta.sendMessage(from, { text: errorMsg });
    }
});
