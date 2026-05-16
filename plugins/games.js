const { cmd } = require("../command");
const config = require("../config");
const axios = require("axios");

// 🎮 GAME DETAILS COMMAND
cmd({
    pattern: "game",
    alias: ["gamedetail", "gameinfo", "ginfo"],
    react: "🎮",
    desc: "Fetch comprehensive information and details about any game.",
    category: "games", // මෙනු එකේ GAMES [1] එකට ඔටෝ සෙට් වෙනවා
    filename: __filename,
},
async (zanta, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("📝 *Please provide a game name to scan!*\n*Ex:* .game GTA Vice City");

        await reply("🛰️ *𝐍𝐄𝐗𝐔𝐒-𝐌𝐃 is querying database for game specifications...*");

        // උඹ දුන්න API Key එක සහ Game Details Endpoint එක
        const apiKey = "66e854da7ab44ee2b9c69d8b04ec6804";
        const apiUrl = `https://api.nexoracle.com/info/game?q=${encodeURIComponent(q)}&apikey=${apiKey}`;

        const response = await axios.get(apiUrl).catch(() => null);

        if (!response || !response.data || !response.data.result) {
            return reply("❌ *Game parameters not found in matrix database or API key is restricted!*");
        }

        const game = response.data.result;

        // ඩවුන්ලෝඩ් ලින්ක්ස් නැතුව ගේම් එකේ සම්පූර්ණ විස්තර ටික විතරක් Cyber-Tech ස්ටයිල් එකට හැදුවා
        let gameMsg = `🎮 *𝐍𝐄𝐗𝐔𝐒  𝐆𝐀𝐌𝐄  𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍*\n\n` +
                      `📌 *Title:* ${game.title || q}\n` +
                      `🪐 *Platform:* ${game.platform || 'N/A'}\n` +
                      `📦 *File Size / Required Space:* ${game.size || 'N/A'}\n` +
                      `📅 *Release Date:* ${game.release_date || game.released || 'N/A'}\n` +
                      `⭐ *System Rating:* ${game.rating || 'N/A'}\n` +
                      `🏢 *Developer / Publisher:* ${game.developer || game.publisher || 'N/A'}\n\n` +
                      `📝 *GAME MANIFEST (Description):*\n` +
                      `_${game.description || 'No detailed architecture description provided for this node.'}_\n\n` +
                      `> *𝐒𝐘𝐒𝐓𝐄𝐌 𝐀𝐑𝐂𝐇𝐈𝐓𝐄𝐂𝐓𝐔𝐑𝐄 𝐕𝟔.𝟕* 🧬`;

        // ගේම් එකේ Cover Art / Photo එකක් තියෙනවා නම් ඒකත් එක්කම විස්තර ටික යවනවා
        if (game.thumb || game.image || game.background_image) {
            await zanta.sendMessage(from, {
                image: { url: game.thumb || game.image || game.background_image },
                caption: gameMsg
            }, { quoted: mek });
        } else {
            await reply(gameMsg);
        }

    } catch (err) {
        console.error("Game API Error:", err);
        reply("❌ *Terminal Error:* Failed to fetch game metadata cloud packets.");
    }
});
