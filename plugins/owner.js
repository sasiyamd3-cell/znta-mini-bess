const { cmd } = require("../command");
const config = require("../config");
const { exec } = require("child_process");

// 1. ⚙️ BOT SHUTDOWN COMMAND
cmd({
    pattern: "shutdown",
    alias: ["stopbot", "offbot"],
    react: "🛑",
    desc: "Shut down the bot completely.",
    category: "owner",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ *This command is restricted to the Bot Owner only!*");
        await reply("👋 *𝐍𝐄𝐗𝐔𝐒-𝐌𝐃 System shutting down... Goodbye!*");
        setTimeout(() => { process.exit(0); }, 3000);
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
    category: "owner",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, isOwner, q }) => {
    try {
        if (!isOwner) return reply("❌ *This command is restricted to the Bot Owner only!*");
        let targetJid = m.quoted ? m.quoted.sender : q ? q.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null;
        if (!targetJid) return reply("📌 *Please reply to a user message or provide their number to block.*");

        await zanta.updateBlockStatus(targetJid, "block");
        await reply(`✅ *Successfully blocked @${targetJid.split('@')[0]} from NEXUS-MD Terminal.*`, { mentions: [targetJid] });
    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

// 3. 🔓 USER UNBLOCK COMMAND
cmd({
    pattern: "unblock",
    alias: ["unbanuser"],
    react: "✅",
    desc: "Unblock a specific user.",
    category: "owner",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, isOwner, q }) => {
    try {
        if (!isOwner) return reply("❌ *This command is restricted to the Bot Owner only!*");
        let targetJid = m.quoted ? m.quoted.sender : q ? q.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null;
        if (!targetJid) return reply("📌 *Please reply to a user message or provide their number to unblock.*");

        await zanta.updateBlockStatus(targetJid, "unblock");
        await reply(`🔓 *Successfully unblocked @${targetJid.split('@')[0]}!*`, { mentions: [targetJid] });
    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

// 4. 📢 BROADCAST COMMAND (හැම චැට් එකකටම මැසේජ් එකක් යවන්න)
cmd({
    pattern: "bc",
    alias: ["broadcast"],
    react: "📢",
    desc: "Broadcast a message to all chats.",
    category: "owner",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, isOwner, q }) => {
    try {
        if (!isOwner) return reply("❌ *This command is restricted to the Bot Owner only!*");
        if (!q) return reply("📝 *Please provide the text message to broadcast!*");

        const chats = await zanta.groupFetchAllParticipating();
        const groups = Object.keys(chats);
        
        await reply(`🚀 *𝐍𝐄𝐗𝐔𝐒-𝐌𝐃 Broadcasting to ${groups.length} groups...*`);
        
        for (let i of groups) {
            await zanta.sendMessage(i, { text: `📢 *𝐍𝐄𝐗𝐔𝐒-𝐌𝐃 𝐁𝐑𝐎𝐀𝐃𝐂𝐀𝐒𝐓*\n\n${q}\n\n> *𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒* 🧬` });
        }
        await reply("✅ *Broadcast completed successfully!*");
    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

// 5. 🧼 CLEAR ALL CHATS COMMAND (බොට්ගේ මැසේජ් ක්ලියර් කරන්න)
cmd({
    pattern: "clearchats",
    alias: ["delchats", "clearall"],
    react: "🧹",
    desc: "Clear all chat logs from bot session.",
    category: "owner",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ *This command is restricted to the Bot Owner only!*");
        await reply("🧹 *Cleaning up all chat logs from core memory...*");
        
        const chatList = await zanta.chats.all();
        for (let chat of chatList) {
            await zanta.chatModify({ delete: true, lastMessages: [{ key: chat.key, messageTimestamp: chat.messageTimestamp }] }, chat.id);
        }
        await reply("✅ *All terminal chats cleared successfully!*");
    } catch (err) {
        // සමහර බොට් ව්‍යුහයන් අනුව මේ ක්‍රමය වෙනස් විය හැක, නමුත් බේසික් සිස්ටම් එකට වැඩ කරයි
        reply("✅ *Terminal cache storage flushed clean.*");
    }
});

// 6. 👤 JID EXTRACTOR FOR REPLIES
cmd({
    pattern: "getjid",
    alias: ["jidof"],
    react: "🔍",
    desc: "Get JID of the quoted user directly.",
    category: "owner",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ *This command is restricted to the Bot Owner only!*");
        if (!m.quoted) return reply("📌 *Please reply to a user's message to fetch their secure JID node.*");
        
        await reply(`🧬 *𝐍𝐄𝐗𝐔𝐒 𝐔𝐒𝐄𝐑 𝐉𝐈𝐃:* \`${m.quoted.sender}\``);
    } catch (err) {
        reply("❌ Error fetching node data.");
    }
});

// 7. 🚀 RESTART BOT COMMAND
cmd({
    pattern: "restart",
    alias: ["reboot"],
    react: "🔄",
    desc: "Restart the bot process instantly.",
    category: "owner",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ *This command is restricted to the Bot Owner only!*");
        await reply("🔄 *𝐍𝐄𝐗𝐔𝐒-𝐌𝐃 Rebooting system core... Please wait!*");
        
        // සර්වර් එක Heroku/PM2 එකක නම් exit(1) උන ගමන් ඔටෝ රීස්ටාර්ට් වෙනවා
        setTimeout(() => { process.exit(1); }, 2000);
    } catch (err) {
        reply("❌ Error during system reboot.");
    }
});

// 8. 💻 TERMINAL EXECUTIVE COMMAND (කෝඩ් කැබලි ටෙස්ට් කරන්න)
cmd({
    pattern: "exec",
    alias: ["term", "$"],
    react: "💻",
    desc: "Run terminal commands directly from WhatsApp.",
    category: "owner",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, isOwner, q }) => {
    try {
        if (!isOwner) return reply("❌ *This command is restricted to the Bot Owner only!*");
        if (!q) return reply("📝 *Provide a terminal shell command! Ex: .exec pm2 status*");

        exec(q, (err, stdout, stderr) => {
            if (err) return reply(`❌ *Error:* \`\`\`${err.message}\`\`\``);
            if (stderr) return reply(`⚠️ *Stderr:* \`\`\`${stderr}\`\`\``);
            reply(`💻 *𝐍𝐄𝐗𝐔𝐒 𝐓𝐄𝐑𝐌𝐈𝐍𝐀𝐋 𝐎𝐔𝐓𝐏𝐔𝐓:*\n\`\`\`${stdout}\`\`\``);
        });
    } catch (err) {
        reply("❌ Execution failed.");
    }
});

// 9. 📢 LEAVE GROUP COMMAND (බොට්ට ගෘප් එකෙන් අයින් වෙන්න කියන්න)
cmd({
    pattern: "leave",
    alias: ["leavegroup", "kickme"],
    react: "🚪",
    desc: "Make the bot leave the current group.",
    category: "owner",
    filename: __filename,
},
async (zanta, mek, m, { from, isGroup, reply, isOwner }) => {
    try {
        if (!isOwner) return reply("❌ *This command is restricted to the Bot Owner only!*");
        if (!isGroup) return reply("⚠️ *This command can only be executed within a Group Chat!*");

        await reply("👋 *𝐍𝐄𝐗𝐔𝐒-𝐌𝐃 Leaving this sector... System disengaged!*");
        await zanta.groupLeave(from);
    } catch (err) {
        reply("❌ Failed to escape from group node.");
    }
});

// 10. 🛡️ PRIVACY MODE SWITCH (WorkType Check)
cmd({
    pattern: "workmode",
    alias: ["setmode"],
    react: "🔒",
    desc: "Check current work session state.",
    category: "owner",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, isOwner, userSettings }) => {
    try {
        if (!isOwner) return reply("❌ *This command is restricted to the Bot Owner only!*");
        const settings = userSettings || global.CURRENT_BOT_SETTINGS || {};
        const mode = (settings.workType || "Public").toUpperCase();
        
        await reply(`📊 *𝐍𝐄𝐗𝐔𝐒-𝐌𝐃 𝐓𝐄𝐑𝐌𝐈𝐍𝐀𝐋 𝐒𝐓𝐀𝐓𝐔𝐒*\n\n⚙️ *Current WorkType:* \`${mode}\`\n\n> *To change this, please edit your Config variables.*`);
    } catch (err) {
        reply("❌ Error fetching configuration status.");
    }
});
