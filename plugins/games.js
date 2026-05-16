const { cmd } = require("../command");
const config = require("../config");
const axios = require("axios");

// 🎮 GAME DOWNLOAD COMMAND
cmd({
    pattern: "game",
    alias: ["gamedl", "playstore", "pcgame"],
    react: "🎮",
    desc: "Search and get direct download links for games.",
    category: "games", // අපේ අලුත් මෙනු එකේ GAMES [1] එකට ඔටෝම සෙට් වෙනවා
    filename: __filename,
},
async (zanta, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("📝 *Please provide a game name!*\n*Ex:* .game GTA Vice City");

        await reply("🛰️ *𝐍𝐄𝐗𝐔𝐒-𝐌𝐃 is scanning database for game links...*");

        // උඹ දුන්න API Key එක සහ Endpoint එක මෙතනට සෙට් කරා මචන්
        const apiKey = "66e854da7ab44ee2b9c69d8b04ec6804";
        const apiUrl = `https://api.nexoracle.com/download/game?q=${encodeURIComponent(q)}&apikey=${apiKey}`;

        const response = await axios.get(apiUrl).catch(() => null);

        if (!response || !response.data || !response.data.result) {
            return reply("❌ *Game not found or API node is currently unresponsive!*");
        }

        const game = response.data.result;

        // ගේම් එකේ විස්තර ලස්සනට සයිබර්-ටෙක් ස්ටයිල් එකට පෙළගැස්වීම
        let gameMsg = `🎮 *𝐍𝐄𝐗𝐔𝐒  𝐆𝐀𝐌𝐄  𝐃𝐎𝐖𝐍loader*\n\n` +
                      `📌 *Title:* ${game.title || q}\n` +
                      `📦 *Size:* ${game.size || 'N/A'}\n` +
                      `🪐 *Platform:* ${game.platform || 'PC / Android'}\n` +
                      `⭐ *Rating:* ${game.rating || 'N/A'}\n\n` +
                      `📝 *Description:* _${game.description || 'No description available for this node.'}_\n\n` +
                      `🚀 *𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐋𝐈𝐍𝐊𝐒:*\n` +
                      `🔗 _${game.download_url || game.link || 'Link generation failed.'}_\n\n` +
                      `> *𝐏class𝐖𝐄𝐑𝐄𝐃 🇧🇾 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒* 🧬`;

        // ගේම් එකේ පින්තූරයක් (Thumbnail) තියෙනවා නම් ඒකත් එක්කම මැසේජ් එක යවනවා
        if (game.thumb || game.image) {
            await zanta.sendMessage(from, {
                image: { url: game.thumb || game.image },
                caption: gameMsg
            }, { quoted: mek });
        } else {
            await reply(gameMsg);
        }

    } catch (err) {
        console.error("Game API Error:", err);
        reply("❌ *Terminal Error:* Connection dropped while fetching game node.");
    }
});
