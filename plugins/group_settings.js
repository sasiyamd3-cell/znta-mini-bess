const { cmd } = require("../command");

// --- 🛠️ LID/JID ඇඩ්මින් ප්‍රශ්නය විසඳන Function එක ---
const getLastDigits = (jid) => {
    if (!jid) return "";
    let clean = jid.split('@')[0].split(':')[0]; 
    return clean.slice(-8); 
};

// --- 🛡️ PERMISSION CHECKER (අන්තිම ඉලක්කම් 8 පාවිච්චි කර ඇත) ---
const checkPerms = (zanta, m, groupAdmins, isOwner, sender) => {
    const adminDigitsList = (groupAdmins || []).map(ad => getLastDigits(ad));
    const botDigits = getLastDigits(zanta.user.lid || zanta.user.id);
    const userDigits = getLastDigits(m.senderLid || sender);

    const isBotAdmin = adminDigitsList.includes(botDigits);
    const isUserAdmin = adminDigitsList.includes(userDigits);

    if (!isBotAdmin) return "bot_not_admin";
    if (!(isOwner || isUserAdmin)) return "not_admin";
    return "ok";
};

// --- 🔒 MUTE ---
cmd({
    pattern: "mute", alias: ["close"], react: "🔒", desc: "Mute gruop.", category: "tools", filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupAdmins, sender, isOwner }) => {
    if (!isGroup) return reply("❌ *Groups only.*");
    const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
    if (perm === "bot_not_admin") return reply("❌ *මාව Admin කරන්න!*");
    if (perm === "not_admin") return reply("❌ *I have a Admin!*");

    await zanta.groupSettingUpdate(from, 'announcement');
    let desc = `🔒 *Status:* Group Muted\n✅ *Action:* Success\n👤 *By:* @${sender.split('@')[0]}\n\n_Only admins can send messages now._`;
    await zanta.sendMessage(from, { text: desc, mentions: [sender] }, { quoted: mek });
});

// --- 🔓 UNMUTE ---
cmd({
    pattern: "unmute", alias: ["open"], react: "🔓", desc: "Unmute gruop.", category: "tools", filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupAdmins, sender, isOwner }) => {
    if (!isGroup) return reply("❌ *Groups only.*");
    const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
    if (perm === "bot_not_admin") return reply("❌ *මාව Admin කරන්න!*");
    if (perm === "not_admin") return reply("❌ *I have a Admin!*");

    await zanta.groupSettingUpdate(from, 'not_announcement');
    let desc = `🔓 *Status:* Group Unmuted\n✅ *Action:* Success\n👤 *By:* @${sender.split('@')[0]}\n\n_Everyone can send messages now._`;
    await zanta.sendMessage(from, { text: desc, mentions: [sender] }, { quoted: mek });
});

// --- 🚫 KICK (REPLY SUPPORTED) ---
cmd({
    pattern: "kick", 
    react: "🚫", 
    desc: "Remove gruop member.",
    category: "tools", 
    filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupAdmins, sender, isOwner, q }) => {
    if (!isGroup) return reply("❌ *Groups only.*");

    const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
    if (perm === "bot_not_admin") return reply("❌ *මාව Admin කරන්න!*");
    if (perm === "not_admin") return reply("❌ *I have a Admin!*");

    let user = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null);

    if (!user && q) user = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    if (!user) return reply("❌ *කරුණාකර ඉවත් කළ යුතු පුද්ගලයාගේ මැසේජ් එකකට Reply කරන්න.*");

    try {
        await zanta.groupParticipantsUpdate(from, [user], "remove");

        let desc = `

👤 *User:* @${user.split('@')[0]}
✅ *Action:* Successfully Kicked
👮 *By:* @${sender.split('@')[0]}`;

        await zanta.sendMessage(from, { text: desc, mentions: [user, sender] }, { quoted: mek });

    } catch (e) { 
        reply("❌ ඉවත් කිරීමට නොහැක. (ඔහු සමූහයේ නොමැති වීමට හෝ වෙනත් දෝෂයක් විය හැක)"); 
    }
});

// --- ⭐ PROMOTE (REPLY / TAG / NUMBER) ---
cmd({
    pattern: "promote", 
    react: "⭐", 
    desc: "Promote gruop member.",
    category: "tools", 
    filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupAdmins, sender, isOwner, q }) => {
    try {
        if (!isGroup) return reply("❌ *Groups only.*");

        const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
        if (perm === "bot_not_admin") return reply("❌ *maawa Admin karanna!*");
        if (perm === "not_admin") return reply("❌ *oba Admin kenek newei!*");

        // User logic (Reply -> Tag -> Number)
        let user = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null);
        if (!user && q) user = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

        if (!user) return reply("❌ *karunakaara Reply ho ankaya laba denna.*");

        await zanta.groupParticipantsUpdate(from, [user], "promote");

        let desc = `

👤 *User:* @${user.split('@')[0]}
⭐ *Status:* Now Admin
👮 *By:* @${sender.split('@')[0]}`;

        await zanta.sendMessage(from, { text: desc, mentions: [user, sender] }, { quoted: mek });

    } catch (e) { 
        reply("❌ Error: " + e.message); 
    }
});


cmd({
    pattern: "demote", 
    react: "📉", 
    desc: "Demote gruop member.",
    category: "tools", 
    filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupAdmins, sender, isOwner, q }) => {
    try {
        if (!isGroup) return reply("❌ *Groups only.*");

        const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
        if (perm === "bot_not_admin") return reply("❌ *maawa Admin karanna!*");
        if (perm === "not_admin") return reply("❌ *I have a Admin!*");

        // User logic (Reply -> Tag -> Number)
        let user = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null);
        if (!user && q) user = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

        if (!user) return reply("❌ *karunakaara Tag, Reply ho ankaya laba denna.*");

        await zanta.groupParticipantsUpdate(from, [user], "demote");

        let desc = `

👤 *User:* @${user.split('@')[0]}
📉 *Status:* Admin Removed
👮 *By:* @${sender.split('@')[0]}`;

        await zanta.sendMessage(from, { text: desc, mentions: [user, sender] }, { quoted: mek });

    } catch (e) { 
        reply("❌ Error: " + e.message); 
    }
});
// --- ➕ ADD MEMBERS (MULTI-SUPPORT WITH LID) ---
cmd({
    pattern: "add", 
    react: "➕", 
    category: "tools", 
    desc: "Add multiple members with LID/JID support.", 
    filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupAdmins, sender, isOwner, q }) => {
    if (!isGroup) return reply("❌ *Groups only.*");

    const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
    if (perm === "bot_not_admin") return reply("❌ *I have admin!*");
    if (perm === "not_admin") return reply("❌ *I have admin!*");

    if (!q) return reply("❌ *Provide a Number. (Ex: .add 947xxxxxxxx, 947yyyyyyyy)*");

    // කොමා මගින් අංක වෙන් කර array එකකට ගැනීම
    let inputNumbers = q.split(",");
    let resultsSummary = "";
    let mentionsArray = [];

    for (let rawNum of inputNumbers) {
        let num = rawNum.replace(/[^0-9]/g, "");
        if (num.length < 10) {
            resultsSummary += `❌ *${num || rawNum}*: Invalid number!\n`;
            continue;
        }

        try {
            // 🔍 පියවර 1: අංකය පරීක්ෂා කිරීම
            const [result] = await zanta.onWhatsApp(num);
            
            if (!result || !result.exists) {
                resultsSummary += `❌ *${num}*: Cnat find user.\n`;
                continue;
            }

            let targetJid = result.jid;
            mentionsArray.push(targetJid);

            // 🛠️ පියවර 2: ඇඩ් කිරීම
            const response = await zanta.groupParticipantsUpdate(from, [targetJid], "add");
            const res = response[0];

            if (res.status === "200") {
                resultsSummary += `✅ Added.\n`;
            } else if (res.status === "403") {
                resultsSummary += `⚠️  Cant add.\n`;
            } else if (res.status === "408") {
                resultsSummary += `⚠️ *${num}*: Send invite.\n`;
            } else if (res.status === "409") {
                resultsSummary += `⚠️ *${num}*: දැAlready added.\n`;
            } else {
                resultsSummary += `❌ *${num}*: Failed (Status: ${res.status})\n`;
            }
        } catch (e) { 
            console.error("LID Add Error:", e);
            resultsSummary += `❌ *${num}*: Error.\n`;
        }
    }

    // අවසාන ප්‍රතිඵලය එකවර යැවීම
    reply(`*Add Participants Results:*\n\n${resultsSummary}`, { mentions: mentionsArray });
});

// --- 🔗 INVITE ---
cmd({
  pattern: "invite", alias: ["link"], react: "🔗", desc: "Get invite link.", category: "tools", filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupMetadata, groupAdmins }) => {
  try {
      if (!isGroup) return reply("❌ *Groups only.*");
      const adminDigitsList = (groupAdmins || []).map(ad => getLastDigits(ad));
      const botDigits = getLastDigits(zanta.user.lid || zanta.user.id);

      if (!adminDigitsList.includes(botDigits)) return reply("❌ *I have a Admin!*");

      const code = await zanta.groupInviteCode(from);
      let ppUrl;
      try { ppUrl = await zanta.profilePictureUrl(from, 'image'); } catch { ppUrl = "https://i.ibb.co/vYm6p6n/whatsapp-group-icon.png"; }

      let desc = `🎬 *Group:* ${groupMetadata.subject}\n🔗 *Link:* https://chat.whatsapp.com/${code}\n\n_Join using the link above!_`;
      await zanta.sendMessage(from, { image: { url: ppUrl }, caption: desc }, { quoted: mek });
  } catch (e) { reply("❌ Error: " + e.message); }
});

// --- 🔔 TAGALL ---
cmd({
    pattern: "tagall", alias: ["all"], react: "📢", category: "tools", desc: "Tag all.", filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, participants, groupAdmins, sender, isOwner, q }) => {
    if (!isGroup) return reply("❌ *Groups only.*");
    const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
    if (perm === "not_admin") return reply("❌ *Admin Only!*");

    let txt = `*📢 TAG ALL MEMBERS*\n\n📢 *Message:* ${q ? q : 'No message'}\n\n`;
    for (let mem of participants) { txt += `🔘 @${mem.id.split('@')[0]}\n`; }
    await zanta.sendMessage(from, { text: txt, mentions: participants.map(p => p.id) }, { quoted: mek });
});

// --- ⛔ KICK ALL MEMBERS ---
cmd({
    pattern: "kickall", 
    react: "🚫", 
    category: "tools", 
    desc: "Remove all group members except admins and bot.", 
    filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupAdmins, sender, isOwner, participants }) => {
    if (!isGroup) return reply("❌ *Groups only.*");

    // අවසර පරීක්ෂාව
    const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
    if (perm === "bot_not_admin") return reply("❌ *I have admin!*");
    if (perm === "not_admin") return reply("❌ *I have admin!*");
    if (!isOwner) return reply("❌ *You are not Bot owner!*");

    try {
        // ඇඩ්මින්වරුන් නොවන සාමාජිකයින් පමණක් තෝරා ගැනීම
        const admins = groupAdmins;
        const botNumber = zanta.user.id.split(":")[0] + "@s.whatsapp.net";
        
        const membersToKick = participants
            .filter(p => !admins.includes(p.id) && p.id !== botNumber)
            .map(p => p.id);

        if (membersToKick.length === 0) {
            return reply("✅ *Cant found users for kick.*");
        }

        await reply(`⏳ *${membersToKick.length} Users Removing started...*`);

        // සියලුම සාමාජිකයින් එකවර ඉවත් කිරීම
        const response = await zanta.groupParticipantsUpdate(from, membersToKick, "remove");

        // ප්‍රතිඵලය පරීක්ෂා කිරීම
        let successCount = 0;
        response.forEach(res => {
            if (res.status === "200") successCount++;
        });

        return reply(`✅ *Done!* \n\n*Count:* ${successCount}\n*Failed count:* ${membersToKick.length - successCount}\n\n*Note:* Not removed admins.`);

    } catch (e) {
        console.error("KickAll Error:", e);
        reply("❌ *Error:*.");
    }
});

// --- 👋 LEFT ---
cmd({
    pattern: "left", react: "👋", category: "tools", desc: "Leave in gruop.", filename: __filename,
}, async (zanta, mek, m, { from, isGroup, isOwner, reply }) => {
    if (!isGroup) return reply("❌ *Groups only.*");
    if (!isOwner) return reply("❌ *Owner Only!*");
    await reply("👋 *Good bye!I am Leaving the group...*");
    await zanta.groupLeave(from);
});
