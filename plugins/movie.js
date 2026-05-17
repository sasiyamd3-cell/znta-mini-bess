const { cmd } = require("../command");
const config = require("../config");
const axios = require("axios");

// 🎬 MOVIE DETAILS & SEARCH COMMAND (PATCHED V2)
cmd({
    pattern: "movie",
    alias: ["film", "mv", "movieinfo"],
    react: "🎬",
    desc: "Fetch details and secure search stream for any movie.",
    category: "movie",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("📝 *Please provide a movie name to search!*\n*Ex:* .movie Avatar");

        await reply("📡 *𝐍𝐄𝐗𝐔𝐒-𝐌𝐃 is establishing data-link with global cinema servers...*");

        // Clean query to prevent encoding breaks
        const cleanQuery = q.trim();
        const tmdbApiKey = "55115d4d33458514cc6d83765e94b283"; 
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(cleanQuery)}&include_adult=false`;

        // Request execution with basic browser headers to bypass blockages
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        }).catch((err) => {
            console.error("Axios Fetch Error:", err.message);
            return null;
        });

        if (!response || !response.data || !response.data.results || response.data.results.length === 0) {
            return reply("❌ *Movie data packet not found in matrix arrays!*\n💡 _Try typing the exact English name. (Ex: .movie Interstellar)_");
        }

        const movieData = response.data.results[0];
        
        const title = movieData.title;
        const releaseDate = movieData.release_date || "Unknown Release Node";
        const rating = movieData.vote_average || "N/A";
        const overview = movieData.overview || "No transmission logs available for this manifest.";
        const posterPath = movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : null;

        // Dynamic Cloud Search Links
        const directDownloadLink = `https://www.google.com/search?q=${encodeURIComponent(title + " " + releaseDate.split("-")[0] + " direct download drive link")}`;
        const watchOnlineLink = `https://www.google.com/search?q=${encodeURIComponent(title + " " + releaseDate.split("-")[0] + " watch online free")}`;

        let movieMsg = `🎬 *𝐍𝐄𝐗𝐔𝐒  𝐌𝐎𝐕𝐈𝐄  𝐌𝐀𝐍𝐈𝐅𝐄𝐒𝐓*\n\n` +
                      `📌 *Title:* ${title}\n` +
                      `📅 *Release Date:* ${releaseDate}\n` +
                      `⭐ *TMDB Rating:* ${rating} / 10\n\n` +
                      `📝 *PLOT SUMMARY:*\n` +
                      `_${overview}_\n\n` +
                      `🚀 *𝐐𝐔𝐀𝐍𝐓𝐔𝐌  𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃  𝐍𝐎𝐃𝐄𝐒:*\n` +
                      `📥 [Click for Direct High-Speed DL Drive Link]\n🔗 ${directDownloadLink}\n\n` +
                      `🌐 [Click to Stream / Watch Online Node]\n🔗 ${watchOnlineLink}\n\n` +
                      `> *> SYSTEM ARCHITECTURE V6.7* 🧬`;

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
