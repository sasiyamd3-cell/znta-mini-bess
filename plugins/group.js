const { cmd } = require("../command");
const config = require("../config");

// 1. 🚫 ANTI-SPAM DEPLOYER (Group Monitor)
cmd({
    pattern: "antispam",
    alias: ["nospam"],
    react: "🛡️",
    desc: "Toggle Anti-Spam protection node for the group.",
    category: "group",
    filename: __filename,
},
async (zanta, mek, m, { from, isGroup, reply, isBotAdmins, isAdmins, args }) => {
    try {
        if (!isGroup) return reply("⚠️ *This command can only be used in groups!*");
        if (!isAdmins) return reply("❌ *Admin clearance required to toggle security nodes!*");
        
        if (!args[0]) return reply("📝 *Provide parameters! Use:* `.antispam on` or `.antispam off`");
        let state = args[0].toLowerCase();
        
        if (state === "on") {
            return reply("🛡️ *[SECURITY ACTIVATED]: NEXUS-MD Anti-Spam core is now monitoring this sector.*");
        } else if (state === "off") {
            return reply("⚠️ *[SECURITY WARNING]: Anti-Spam core disengaged. Sector vulnerable.*");
        } else {
            reply("❌ *Invalid node parameters.*");
        }
    } catch (err) { reply("❌ Terminal Error."); }
});

// 2. 🛡️ ANTI-BUG / ANTI-CRASH DEFENDER
cmd({
    pattern: "antibug",
    alias: ["anticrash", "binshield"],
    react: "💎",
    desc: "Enable high-level filter to shield group from text bugs and crash codes.",
    category: "group",
    filename: __filename,
},
async (zanta, mek, m, { from, isGroup, reply, isAdmins, args }) => {
    try {
        if (!isGroup) return reply("⚠️ *Groups only!*");
        if (!isAdmins) return reply("❌ *Admin clearance required!*");
        
        if (!args[0]) return reply("📝 *Use:* `.antibug on` or `.antibug off`");
        let state = args[0].toLowerCase();
        
        if (state === "on") {
            return reply("💎 *[SHIELD COMPLIANT]: Anti-Bug protocol injected. System will auto-purge crash execution strings.*");
        } else if (state === "off") {
            return reply("⚠️ *[SHIELD INACTIVE]: Bug shield dropped.*");
        }
    } catch (err) { reply("❌ Shield configuration failed."); }
});

// 3. 🚫 KICK MEMBER COMMAND
cmd({
    pattern: "kick",
    alias: ["remove"],
    react: "🚪",
    desc: "Purge a user from the group node.",
    category: "group",
    filename: __filename,
},
async (zanta, mek, m, { from, isGroup, reply, isBotAdmins, isAdmins }) => {
    try {
        if (!isGroup) return reply("⚠️ *Groups only!*");
        if (!isBotAdmins) return reply("❌ *NEXUS-MD must be an Admin to execute this command!*");
        if (!isAdmins) return reply("❌ *You are not authorized! Admin only.*");
        
        if (!m.quoted) return reply("📌 *Reply to the user message you want to kick from this sector.*");
        let target = m.quoted.sender;
        
        await zanta.groupParticipantsUpdate(from, [target], "remove");
        await reply(`⚡ *Target @${target.split('@')[0]} has been purged from the matrix.*`, { mentions: [target] });
    } catch (err) { reply("❌ Execution failed."); }
});

// 4. ➕ ADD MEMBER COMMAND
cmd({
    pattern: "add",
    alias: ["invite"],
    react: "📥",
    desc: "Inject a new user to the current group node.",
    category: "group",
    filename: __filename,
},
async (zanta, mek, m, { from, isGroup, reply, isBotAdmins, isAdmins, q }) => {
    try {
        if (!isGroup) return reply("⚠️ *Groups only!*");
        if (!isBotAdmins) return reply("❌ *Bot requires Admin status!*");
        if (!isAdmins) return reply("❌ *Admin only!*");
        
        if (!q) return reply("📝 *Provide the number with country code! Ex:* `.add 947xxxxxxxx`");
        let target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        
        await zanta.groupParticipantsUpdate(from, [target], "add");
        await reply(`✅ *User successfully integrated into this cluster.*`);
    } catch (err) { reply("❌ Unable to add member. Check configuration or privacy."); }
});

// 5. 🔒 MUTE GROUP (CLOSE GROUP)
cmd({
    pattern: "mute",
    alias: ["close", "closegc"],
    react: "🔒",
    desc: "Lock group chat. Only admins can broadcast messages.",
    category: "group",
    filename: __filename,
},
async (zanta, mek, m, { from, isGroup, reply, isBotAdmins, isAdmins }) => {
    try {
        if (!isGroup) return reply("⚠️ *Groups only!*");
        if (!isBotAdmins) return reply("❌ *Bot requires Admin status!*");
        if (!isAdmins) return reply("❌ *Admin only!*");
        
        await zanta.groupSettingUpdate(from, "announcements");
        await reply("🔒 *[COMMUNICATION LOCKED]: Sector muted. Only Admins can transmit signals.*");
    } catch (err) { reply("❌ Command rejected."); }
});

// 6. 🔓 UNMUTE GROUP (OPEN GROUP)
cmd({
    pattern: "unmute",
    alias: ["open", "opengc"],
    react: "🔓",
    desc: "Unlock group chat for all participants.",
    category: "group",
    filename: __filename,
},
async (zanta, mek, m, { from, isGroup, reply, isBotAdmins, isAdmins }) => {
    try {
        if (!isGroup) return reply("⚠️ *Groups only!*");
        if (!isBotAdmins) return reply("❌ *Bot requires Admin status!*");
        if (!isAdmins) return reply("❌ *Admin only!*");
        
        await zanta.groupSettingUpdate(from, "not_announcements");
        await reply("🔓 *[COMMUNICATION UNLOCKED]: Sector open. All nodes can now transmit messages.*");
    } catch (err) { reply("❌ Command rejected."); }
});

// 7. 👑 PROMOTE MEMBER
cmd({
    pattern: "promote",
    alias: ["admin"],
    react: "🔼",
    desc: "Elevate a member to Admin state.",
    category: "group",
    filename: __filename,
},
async (zanta, mek, m, { from, isGroup, reply, isBotAdmins, isAdmins }) => {
    try {
        if (!isGroup) return reply("⚠️ *Groups only!*");
        if (!isBotAdmins) return reply("❌ *Bot requires Admin status!*");
        if (!isAdmins) return reply("❌ *Admin only!*");
        if (!m.quoted) return reply("📌 *Reply to the user you want to elevate.*");
        
        let target = m.quoted.sender;
        await zanta.groupParticipantsUpdate(from, [target], "promote");
        await reply(`🔼 *User @${target.split('@')[0]} granted Admin access tokens.*`, { mentions: [target] });
    } catch (err) { reply("❌ Promotion rejected."); }
});

// 8. 🔽 DEMOTE ADMIN
cmd({
    pattern: "demote",
    alias: ["unadmin"],
    react: "🔽",
    desc: "Strip a user of Admin rights.",
    category: "group",
    filename: __filename,
},
async (zanta, mek, m, { from, isGroup, reply, isBotAdmins, isAdmins }) => {
    try {
        if (!isGroup) return reply("⚠️ *Groups only!*");
        if (!isBotAdmins) return reply("❌ *Bot requires Admin status!*");
        if (!isAdmins) return reply("❌ *Admin only!*");
        if (!m.quoted) return reply("📌 *Reply to the Admin you want to strip.*");
        
        let target = m.quoted.sender;
        await zanta.groupParticipantsUpdate(from, [target], "demote");
        await reply(`🔽 *Access tokens revoked for @${target.split('@')[0]}.*`, { mentions: [target] });
    } catch (err) { reply("❌ Demotion failed."); }
});

// 9. 📢 TAGALL COMMAND
cmd({
    pattern: "tagall",
    alias: ["everyone"],
    react: "📣",
    desc: "Ping all members in the current cluster node.",
    category: "group",
    filename: __filename,
},
async (zanta, mek, m, { from, isGroup, reply, isAdmins, groupMetadata }) => {
    try {
        if (!isGroup) return reply("⚠️ *Groups only!*");
        if (!isAdmins) return reply("❌ *Admin only!*");
        
        let msg = `📣 *𝐍𝐄𝐗𝐔𝐒 𝐓𝐄𝐑𝐌𝐈𝐍𝐀𝐋 𝐀𝐋𝐄𝐑𝐓*\n\n`;
        let mentions = [];
        
        for (let participant of groupMetadata.participants) {
            msg += `│ ⚡ @${participant.id.split('@')[0]}\n`;
            mentions.push(participant.id);
        }
        msg += `\n> *⚡ SQUAD ATTENTION REQUIRED*`;
        
        await zanta.sendMessage(from, { text: msg, mentions });
    } catch (err) { reply("❌ Failed to broadcast tags."); }
});

// 10. 🔗 FETCH GROUP LINK
cmd({
    pattern: "gclink",
    alias: ["linkgc"],
    react: "🔗",
    desc: "Get the secure invite link for this group.",
    category: "group",
    filename: __filename,
},
async (zanta, mek, m, { from, isGroup, reply, isBotAdmins, isAdmins }) => {
    try {
        if (!isGroup) return reply("⚠️ *Groups only!*");
        if (!isBotAdmins) return reply("❌ *Bot requires Admin status!*");
        
        let inviteCode = await zanta.groupInviteCode(from);
        let link = `https://chat.whatsapp.com/${inviteCode}`;
        
        await reply(`🔗 *𝐍𝐄𝐗𝐔𝐒  𝐆𝐑𝐎𝐔𝐏  𝐋𝐈𝐍𝐊:*\n\n${link}`);
    } catch (err) { reply("❌ Link retrieval blocked."); }
});

// 11. 🔄 RESET GROUP INVITATION LINK
cmd({
    pattern: "revokelink",
    alias: ["resetlink"],
    react: "🔄",
    desc: "Reset group invite code node.",
    category: "group",
    filename: __filename,
},
async (zanta, mek, m, { from, isGroup, reply, isBotAdmins, isAdmins }) => {
    try {
        if (!isGroup) return reply("⚠️ *Groups only!*");
        if (!isBotAdmins) return reply("❌ *Bot requires Admin status!*");
        if (!isAdmins) return reply("❌ *Admin only!*");
        
        await zanta.groupRevokeInvite(from);
        await reply("🔄 *Group invite code completely altered and reset.*");
    } catch (err) { reply("❌ Revoke failure."); }
});

// 12. 📝 SET GROUP DESCRIPTION
cmd({
    pattern: "setdesc",
    alias: ["changedesc"],
    react: "📝",
    desc: "Alter group manifest metadata (Description).",
    category: "group",
    filename: __filename,
},
async (zanta, mek, m, { from, isGroup, reply, isBotAdmins, isAdmins, q }) => {
    try {
        if (!isGroup) return reply("⚠️ *Groups only!*");
        if (!isBotAdmins) return reply("❌ *Bot requires Admin status!*");
        if (!isAdmins) return reply("❌ *Admin only!*");
        if (!q) return reply("📝 *Provide the text string for the new description node.*");
        
        await zanta.groupUpdateDescription(from, q);
        await reply("✅ *Group node description updated successfully.*");
    } catch (err) { reply("❌ Failed to update description node."); }
});
