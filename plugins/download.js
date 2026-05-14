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
        const footerText = "𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒"; 
        const fileNamePrefix = "𝐍𝐄𝐗𝐔𝐒-𝐌𝐃"; 
    //-------------------------------------

      const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(q)}/limit=1`;
      const { data } = await axios.get(apiUrl);

      if (!data?.datalist?.list?.length) {
        return reply("⚠️ *No apps found with the given name.*");
      }

      const app = data.datalist.list[0];
      const appSize = (app.size / 1048576).toFixed(2);

      if (parseFloat(appSize) > 600) {
        return reply(`🚫 *File is too large (${appSize} MB).* Max limit is 600MB.`);
      }

      // උඹ එවපු පින්තූරේ විදිහටම අකුරක්වත් වෙනස් නොවෙන්න හැදුවා
      const caption = `📦 *𝐍 𝐄 𝐗 𝐔 𝐒 - 𝐌 𝐃 APK DOWNLOADER* 📦\n` +
                      `📦\n\n` +
                      `📝 *Name:* ${app.name}\n` +
                      `🆔 *Package:* ${app.package}\n` +
                      `⚖️ *Size:* ${appSize} MB\n` +
                      `👤 *Developer:* ${app.developer.name}\n\n` +
                      `| > © ${footerText} </>`;

      await test.sendMessage(
        from,
        {
          image: { url: app.icon },
          caption: caption,
        },
        { quoted: mek }
      );

      const downloadUrl = app.file.path_alt || app.file.path;
      
      const response = await axios({
        method: "get",
        url: downloadUrl,
        responseType: "stream", 
      });

      await test.sendMessage(
        from,
        {
          document: { stream: response.data }, 
          fileName: `${app.name}.apk`,
          mimetype: "application/vnd.android.package-archive",
          contentLength: app.size 
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
