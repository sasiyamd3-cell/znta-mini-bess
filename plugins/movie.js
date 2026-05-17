const { cmd } = require("../command");
const config = require("../config");
const axios = require("axios");

// 🎬 MOVIE DETAILS & SEARCH COMMAND
cmd({
    pattern: "movie",
    alias: ["film", "mv", "movieinfo"],
    react: "🎬",
    desc: "Fetch details and secure search stream for any movie.",
    category: "movie", // අපේ අලුත් මෙනu එකේ MOVIE [1] එකට ඔටෝ සෙට් වෙනවා
    filename: __filename,
},
async (zanta, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("📝 *Please provide a movie name to search!*\n*Ex:* .movie Avatar");

        await reply("📡 *𝐍𝐄𝐗𝐔𝐒-𝐌𝐃 is establishing data-link with global cinema servers...*");

        // --- TMDB Free Public Key Node (Testing Core) ---
        // 💡 මචන් උඹ tmdb එකෙන් එකක් හදාගත්ත ගමන් මේ '55115d4d33458514cc6d83765e94b283' වෙනුවට උඹේ key එක දාපන්
        const tmdbApiKey = "55115d4d33458514cc6d83765e94b283"; 
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(q)}`;

        const searchResponse = await axios.get(searchUrl).catch(() => null);

        if (!searchResponse || !searchResponse.data || !searchResponse.data.results || searchResponse.data.results.length === 0) {
            return reply("❌ *Movie data packet not found in matrix arrays!*");
        }

        // මුලින්ම එන නිවැරදිම ෆිල්ම් එකේ ඩේටා ගන්නවා
        const movieData = searchResponse.data.results[0];
        
        const title = movieData.title;
        const releaseDate = movieData.release_date || "Unknown Release Node";
        const rating = movieData.vote_average || "N/A";
        const overview = movieData.overview || "No transmission logs available for this manifest.";
        const posterPath = movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : null;

        // 🔗 Dynamic Cloud Search Links (යූසර්ට ක්ෂණිකව ෆිල්ම් එක බාගන්න Google Nodes)
        const directDownloadLink = `https://www.google.com/search?q=${encodeURIComponent(title + " " + releaseDate.split("-")[0] + " direct download drive link")}`;
        const watchOnlineLink = `https://www.google.com/search?q=${encodeURIComponent(title + " " + releaseDate.split("-")[0] + " watch online free")}`;

        // මෙනු ලේඅවුට් එක උඹ ආස කරන Cyberpunk/Tech විදිහට හැදුවා
        let movieMsg = `🎬 *𝐍𝐄𝐗𝐔𝐒  𝐌𝐎𝐕𝐈𝐄  𝐌𝐀𝐍𝐈𝐅𝐄𝐒𝐓*\n\n` +
                      `📌 *Title:* ${title}\n` +
                      `📅 *Release Date:* ${releaseDate}\n` +
                      `⭐ *TMDB Rating:* ${rating} / 10\n\n` +
                      `📝 *PLOT SUMMARY:*\n` +
                      `_${overview}_\n\n` +
                      `🚀 *𝐐𝐔𝐀𝐍𝐓𝐔𝐌  𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃  𝐍𝐎𝐃𝐄𝐒:*\n` +
                      `📥 [Click for Direct High-Speed DL Drive Link]\n🔗 ${directDownloadLink}\n\n` +
                      `🌐 [Click to Stream / Watch Online Node]\n🔗 ${watchOnlineLink}\n\n` +
                      `> *𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒* 🧬`;

        if (posterPath) {
            await zanta.sendMessage(from, {
                image: { url: posterPath },
                caption: movieMsg
            }, { quoted: mek });
        } else {
            await reply(movieMsg);
        }

    } catch (err) {
        console.error("Movie Engine Error:", err);
        reply("❌ *Terminal Critical Error:* Cinema stream synchronization failure.");
    }
});
