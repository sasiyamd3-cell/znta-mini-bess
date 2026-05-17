const { cmd } = require("../command");
const config = require("../config");
const axios = require("axios");

// 🎬 MOVIE DETAILS & SEARCH COMMAND WITH PERSONAL TMDB KEY
cmd({
    pattern: "movie",
    alias: ["film", "mv", "movieinfo"],
    react: "🎬",
    desc: "Fetch details and secure search stream for any movie.",
    category: "movie", // මෙනු එකේ MOVIE [1] එකට ඔටෝ සෙට් වෙනවා
    filename: __filename,
},
async (zanta, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("📝 *Please provide a movie name to search!*\n*Ex:* .movie Interstellar");

        await reply("📡 *𝐍𝐄𝐗𝐔𝐒-𝐌𝐃 is establishing data-link with cinema cluster using secure API node...*");

        // 🔑 උඹේ ඉමේජ් එකෙන් ගත්තු නිවැරදිම පුද්ගලික API Key එක මෙතනට සෙට් කරා මචන්
        const tmdbApiKey = "b598110b0c8a7b5063cbba3798a263a0"; 
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(q.trim())}&include_adult=false`;

        // Request implementation with proxy headers
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        }).catch(() => null);

        if (!response || !response.data || !response.data.results || response.data.results.length === 0) {
            return reply("❌ *Movie data packet not found! True node could not be resolved in TMDB matrix.*");
        }

        // මුලින්ම ලැබෙන වඩාත්ම නිවැරදිම මුවී ඩේටා පැකට් එක ගන්නවා
        const movieData = response.data.results[0];
        
        const title = movieData.title;
        const releaseDate = movieData.release_date || "Unknown Node";
        const rating = movieData.vote_average ? movieData.vote_average.toFixed(1) : "N/A";
        const overview = movieData.overview || "No transmission logs available for this manifest.";
        
        // 🖼️ TMDB Original Image URL Node
        const posterPath = movieData.poster_path ? `https://image.tmdb.org/t/p/original${movieData.poster_path}` : null;

        // 🔗 Dynamic Secure Search Links (යූසර්ට ෆිල්ම් එක බාගන්න Google Drive Direct Link Queries)
        const year = releaseDate !== "Unknown Node" ? releaseDate.split("-")[0] : "";
        const directDownloadLink = `https://www.google.com/search?q=${encodeURIComponent(title + " " + year + " direct download drive link")}`;
        const watchOnlineLink = `https://www.google.com/search?q=${encodeURIComponent(title + " " + year + " watch online free")}`;

        // 🌌 NEXUS Cyberpunk Style Menu Design
        let movieMsg = `🎬 *𝐍𝐄𝐗𝐔𝐒  𝐌𝐎𝐕𝐈𝐄  𝐌𝐀𝐍𝐈𝐅𝐄𝐒𝐓*\n\n` +
                      `📌 *Title:* ${title}\n` +
                      `📅 *Release Date:* ${releaseDate}\n` +
                      `⭐ *TMDB Rating:* ${rating} / 10\n\n` +
                      `📝 *PLOT SUMMARY:*\n` +
                      `_${overview}_\n\n` +
                      `🚀 *𝐐𝐔𝐀𝐍𝐓𝐔𝐌  𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃  𝐍𝐎𝐃𝐄𝐒:*\n` +
                      `📥 [Direct High-Speed DL Drive Link]\n🔗 ${directDownloadLink}\n\n` +
                      `🌐 [Stream / Watch Online Node]\n🔗 ${watchOnlineLink}\n\n` +
                      `> *𝐒𝐘𝐒𝐓𝐄𝐌 𝐀𝐑𝐂𝐇𝐈𝐓𝐄𝐂𝐓𝐔𝐑𝐄 𝐕𝟔.𝟕* 🧬`;

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
