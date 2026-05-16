const { cmd } = require("../command");
const config = require("../config");

// 1. ⚙️ BOT SHUTDOWN COMMAND
cmd({
    pattern: "shutdown",
    alias: ["stopbot", "offbot"],
    react: "🛑",
    desc: "Shut down the bot completely.",
    category: "owner", // මෙතන 'owner' දුන්නම අපේ මෙනු එකට ඔටෝ එකතු වෙනවා
    filename: __filename,
},
async (zanta, mek, m, { from, reply, isOwner }) => {
    try {
        // කමාන්ඩ් එක ගහන්නේ බොට්ගේ අයිතිකාරයා (Owner) ද කියලා චෙක් කරනවා
        if (!isOwner) return reply("❌ *This command is restricted to the Bot Owner only!*");

        await reply("👋 *𝐍𝐄𝐗𝐔𝐒-𝐌𝐃 System shutting down... Goodbye!*");
        
        // සර්වර් ප්‍රොසෙස් එක තත්පර 3කින් නවත්වනවා
        setTimeout(() => {
            process.exit(0);
        }, 3000);

    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

// 2. 🔐 USER BLOCK COMMAND
cmd({
    pattern: "block",
    alias: ["banuser"],
    react: "🚫",
    desc: "Block a specific user from using the bot.",
    category: "owner", // මේකත් 'owner' කැටගරියටම වැටෙනවා
    filename: __filename,
},
async (zanta, mek, m, { from, reply, isOwner, q }) => {
    try {
        if (!isOwner) return reply("❌ *This command is restricted to the Bot Owner only!*");

        // බ්ලොක් කරන්න ඕන කෙනාගේ නම්බර් එක හෝ මැසේජ් එකක් රිප්ලයි කරලා තියෙන්න ඕනේ
        let targetJid = m.quoted ? m.quoted.sender : q ? q.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null;

        if (!targetJid) return reply("📌 *Please reply to a user message or provide their number to block.*");

        // WhatsApp හරහා පරිශීලකයාව බ්ලොක් කිරීම
        await zanta.updateBlockStatus(targetJid, "block");
        
        await reply(`✅ *Successfully blocked @${targetJid.split('@')[0]} from NEXUS-MD Terminal.*`, {
            mentions: [targetJid]
        });

    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});
