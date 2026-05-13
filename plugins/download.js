const { cmd } = require("../command");
const axios = require('axios');
const config = require('../config');
const { getBotSettings } = require("./bot_db");


cmd(
  {
    pattern: "apk",
    alias: ["android", "app"],
    react: "📍",
    desc: "Download your favourite apk",
    category: "download",
    filename: __filename,
  },
  async (test, mek, m, { q, reply, from, userSettings }) => {
    try {
      if (!q) return reply("❌ *Please provide an app name to search!*");

      await test.sendMessage(from, { react: { text: "⏳", key: mek.key } });

      //-------------------------------------
        const settings = userSettings || global.CURRENT_BOT_SETTINGS || {};
        const footerText = settings.footerText || config.DEFAULT_FOOTER || "> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴢᴀɴᴛᴀ ᴍɪɴɪ </>"; 
        const fileNamePrefix = settings.fileNamePrefix || config.DEFAULT_FILE_NAME || "ᴢᴀɴᴛᴀ-ᴍɪɴɪ"; 
    //-------------------------------------

      const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(q)}/limit=1`;
      const { data } = await axios.get(apiUrl);

      if (!data?.datalist?.list?.length) {
        return reply("⚠️ *No apps found with the given name.*");
      }

      const app = data.datalist.list[0];
      const appSize = (app.size / 1048576).toFixed(2);

      // සයිස් එක 400MB වලට වඩා වැඩි නම් පණිවිඩයක් දීම
      if (parseFloat(appSize) > 600) {
        return reply(`🚫 *File is too large (${appSize} MB).* Max limit is 600MB.`);
      }

      const caption = `📦 *ZANTA-MD APK DOWNLOADER* 📦\n\n` +
                      `📝 *Name:* ${app.name}\n` +
                      `🆔 *Package:* ${app.package}\n` +
                      `⚖️ *Size:* ${appSize} MB\n` +
                      `👤 *Developer:* ${app.developer.name}\n\n` +
                      `> ${footerText}`;

      // 1. ඇප් එකේ විස්තර සහ ෆොටෝ එක යැවීම
      await test.sendMessage(
        from,
        {
          image: { url: app.icon },
          caption: caption,
        },
        { quoted: mek }
      );

      // 2. APK ෆයිල් එක Streaming ක්‍රමයට ලබා ගැනීම
      const downloadUrl = app.file.path_alt || app.file.path;
      
      const response = await axios({
        method: "get",
        url: downloadUrl,
        responseType: "stream", // මෙතනින් තමයි streaming active වෙන්නේ
      });

      // 3. Document එකක් ලෙස Stream එක යැවීම
      await test.sendMessage(
        from,
        {
          document: { stream: response.data }, // Stream එක කෙලින්ම යොමු කරයි
          fileName: `${app.name}.apk`,
          mimetype: "application/vnd.android.package-archive",
          contentLength: app.size // සයිස් එක කලින් දීමෙන් වේගය වැඩි වේ
        },
        { quoted: mek }
      );

      await test.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (err) {
      console.error("❌ APK Downloader Error:", err);
      reply("❌ *An error occurred while downloading the APK. The server might be busy.*");
    }
  }
);
