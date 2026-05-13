const { cmd } = require("../command");
// profilePictureUrl function එකට Baileys client object එක (zanta) අවශ්‍යයි.

cmd(
    {
        pattern: "getdp",
        react: "👤",
        desc: "Get the profile picture.",
        category: "tools",
        filename: __filename,
    },
    async (
        zanta,
        mek,
        m,
        {
            from,
            q,
            quoted,
            reply,
            isGroup,
            sender,
            mentionUser,
            args,
        }
    ) => {
        try {
            let targetJid;
            
            // 1. Target JID තීරණය කිරීම
            if (mentionUser && mentionUser.length > 0) {
                targetJid = mentionUser[0];
            } else if (m.quoted) {
                targetJid = m.quoted.sender;
            } else if (isGroup && (q === 'group' || q === 'g')) {
                // '.getdp group' කියා ගැසුවොත්, Group DP එක
                targetJid = from;
            } else if (!isGroup && !q) {
                // 🔑 නව Logic: Personal Chat එකකදී සහ කිසිවක් සඳහන් කර නොමැති විට.
                // Chat එකේ අනෙක් පුද්ගලයා (ඔබේ සහකරු)
                // From යනු Chat JID එක වන අතර, එය Group එකක් නොවේ නම්, එය Chat Partner ගේ JID එකයි.
                targetJid = from; 
            } else if (isGroup && !q) {
                 // Group එකකදී, කිසිවක් සඳහන් කර නොමැති විට, යවන පුද්ගලයාගේ DP එක (පෙර පරිදිම)
                 targetJid = sender;
                 return reply("*Please mention user.!*");
            } else if (args.length > 0 && !isNaN(args[0])) {
                // Number එකක් කෙලින්ම දී ඇත්නම්
                targetJid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            } else {
                 return reply("*Please mention user.!*");
            }
            
            if (!targetJid) {
                 return reply("*⚠️ Target JID Failed*");
            }

            // 2. Profile Picture URL එක ලබා ගැනීම
            const profilePictureUrl = await zanta.profilePictureUrl(targetJid, 'image');

            if (!profilePictureUrl) {
                return reply(`*❌ Cant find ?*`);
            }
            
            // 3. Image එක Resend කිරීම
            await zanta.sendMessage(from, {
                image: { url: profilePictureUrl },
                caption: `*✅Profile picture downloaded*`
            }, { quoted: mek });

        } catch (e) {
            console.error("--- GETDP ERROR ---", e);
            reply(`*🚨 Error:* ${e.message || e}. Cant get DP.`);
        }
    }
);
