const { cmd } = require("../command");
const config = require("../config");

// 1. 🎮 GTA VICE CITY CHEAT CODES DATABASE
cmd({
    pattern: "gtavc",
    alias: ["vicecity", "gtacheat"],
    react: "🚗",
    desc: "Get classic GTA Vice City cheat codes instantly.",
    category: "fun",
    filename: __filename,
},
async (zanta, mek, m, { from, reply }) => {
    try {
        let txt = `🎮 *𝐍𝐄𝐗𝐔𝐒  𝐆𝐓𝐀  𝐕𝐈𝐂𝐄  𝐂𝐈𝐓𝐘  𝐂𝐇𝐄𝐀𝐓𝐒*\n\n` +
                  `💪 *Player Cheats:*\n` +
                  `• \`ASPIRINE\` - Full Health\n` +
                  `• \`PRECIOUSPROTECTION\` - Full Armor\n` +
                  `• \`THUGSTOOLS\` - Thug Weapons (Tier 1)\n` +
                  `• \`PROFESSIONALTOOLS\` - Professional Weapons (Tier 2)\n` +
                  `• \`NUTTERTOOLS\` - Heavy Weapons (Tier 3)\n\n` +
                  `🚗 *Vehicle Spawns:*\n` +
                  `• \`PANZER\` - Spawn Rhino Tank 🚀\n` +
                  `• \`THELASTRIDE\` - Spawn Romero's Hearse\n` +
                  `• \`ROCKANDROLLCAR\` - Spawn Love Fist Limo\n` +
                  `• \`GETTHEREFAST\` - Spawn Sabre Turbo\n\n` +
                  `🌟 *Wanted Level:*\n` +
                  `• \`YOUWONTTAKEMEALIVE\` - Raise Wanted Level\n` +
                  `• \`LEAVEMEALONE\` - Clear Wanted Level 🛡️\n\n` +
                  `> *⚙️ SYSTEM ARCHITECTURE V6.7*`;
        return await reply(txt);
    } catch (err) { 
        console.error(err);
        reply("❌ Database node offline."); 
    }
});

// 2. 🕴️ MAFIA 2 CHEAT CODES & TRICKS
cmd({
    pattern: "mafia2",
    alias: ["mafiacheat"],
    react: "🕴️",
    desc: "Get Mafia 2 gameplay tips and unlock mechanics.",
    category: "fun",
    filename: __filename,
},
async (zanta, mek, m, { from, reply }) => {
    try {
        let txt = `🕴️ *𝐍𝐄𝐗𝐔𝐒  𝐌𝐀𝐅𝐈𝐀  𝐈𝐈  𝐓𝐄𝐑𝐌𝐈𝐍𝐀𝐋*\n\n` +
                  `💡 *Note:* Mafia 2 doesn't have standard typed console cheats, but here are the official Developer Exploits & Unlocks:\n\n` +
                  `💵 *Infinite Money Glitch:*\n` +
                  `• Go to Mike Bruski's Scrapyard, crush any car in the compactor, walk away to reset the zone, and repeat for endless cash flow.\n\n` +
                  `🛡️ *Wanted Level Evasion:*\n` +
                  `• If the cops recognize your plates or clothes, instantly change your outfit at a clothing store or visit a body shop to change your vehicle's license plate.\n\n` +
                  `🚗 *Fast Customization Unlocks:*\n` +
                  `• Deliver high-end sports cars to Derek at the docks to clean up major cash and unlock premium garage components.\n\n` +
                  `> *𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒* 🧬`;
        return await reply(txt);
    } catch (err) { 
        console.error(err);
        reply("❌ Data fetch failure."); 
    }
});

// 3. 🎯 INSULT COMMAND (ROAST)
cmd({
    pattern: "roast",
    alias: ["insult", "madda"],
    react: "🔥",
    desc: "Roast a user with a savage tech/cyber statement.",
    category: "fun",
    filename: __filename,
},
async (zanta, mek, m, { from, reply }) => {
    try {
        if (!m.quoted) return reply("📌 *Reply to the node (user) you want to roast!*");
        let target = m.quoted.sender;

        const roasts = [
            "Your brain is running on a 1Hz clock cycle with a corrupted partition table.",
            "If your brain was an open-source project, nobody would fork it.",
            "You are like a virus without a payload, completely useless.",
            "Your logic structure has more memory leaks than Windows Vista.",
            "My AI code compiled faster than your last two brain cells trying to communicate."
        ];
        let randomRoast = roasts[Math.floor(Math.random() * roasts.length)];

        return await zanta.sendMessage(from, { text: `🔥 @${target.split('@')[0]}, ${randomRoast}`, mentions: [target] }, { quoted: mek });
    } catch (err) { 
        console.error(err);
        reply("❌ Roast matrix failed."); 
    }
});

// 4. ❤️ LOVE COMPATIBILITY CALCULATOR
cmd({
    pattern: "love",
    alias: ["compat"],
    react: "❤️",
    desc: "Calculate love percentage between you and quoted user.",
    category: "fun",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, sender }) => {
    try {
        if (!m.quoted) return reply("📌 *Reply to a user to test your system compatibility!*");
        let target = m.quoted.sender;
        let percentage = Math.floor(Math.random() * 101);

        let txt = `❤️ *𝐍𝐄𝐗𝐔𝐒  𝐋𝐎𝐕𝐄  𝐌𝐀𝐓𝐑𝐈𝐗* ❤️\n\n` +
                  `👤 *Node A:* @${sender.split('@')[0]}\n` +
                  `👤 *Node B:* @${target.split('@')[0]}\n\n` +
                  `📊 *Compatibility Score:* \`[ ${percentage}% ]\`\n`;

        if (percentage > 75) txt += `📶 *Status:* Highly Compatible. Mainframe stable. ✨`;
        else if (percentage > 40) txt += `📶 *Status:* Moderate connection. High latency detected. ⚠️`;
        else txt += `📶 *Status:* System rejection. Protocol conflict. 🚫`;

        return await zanta.sendMessage(from, { text: txt, mentions: [sender, target] }, { quoted: mek });
    } catch (err) { 
        console.error(err);
        reply("❌ Logic error."); 
    }
});

// 5. 🔮 ADVICE GENERATOR
cmd({
    pattern: "advice",
    react: "💡",
    desc: "Get life advice from the bot matrix.",
    category: "fun",
    filename: __filename,
},
async (zanta, mek, m, { from, reply }) => {
    try {
        const advices = [
            "Never commit your API keys directly to public GitHub repositories.",
            "Don't worry if it doesn't work right. If everything did, you'd be out of a job.",
            "Before you change the codebase, make sure you have a working backup node.",
            "A rolling stone gathers no moss, but a running script gathers massive logs.",
            "Rest your eyes from the neon screens occasionally, coder."
        ];
        let randomAdvice = advices[Math.floor(Math.random() * advices.length)];
        return await reply(`💡 *𝐍𝐄𝐗𝐔𝐒  𝐌𝐀𝐓𝐑𝐈𝐗  𝐀𝐃𝐕𝐈𝐂𝐄:*\n\n> "${randomAdvice}"`);
    } catch (err) { 
        console.error(err);
        reply("❌ Terminal connection lost."); 
    }
});

// 6. 🧠 FACT EXPONENT
cmd({
    pattern: "fact",
    react: "📝",
    desc: "Get a random tech/cyberpunk fact.",
    category: "fun",
    filename: __filename,
},
async (zanta, mek, m, { from, reply }) => {
    try {
        const facts = [
            "The first computer bug was an actual real moth trapped in a relay back in 1947.",
            "Over 70% of professional hackers work during midnight hours.",
            "The term 'Cyberpunk' was coined by writer Bruce Bethke in 1980 for his short story.",
            "Windows XP source code was completely leaked to the public domain in 2020."
        ];
        let randomFact = facts[Math.floor(Math.random() * facts.length)];
        return await reply(`📝 *𝐃𝐈𝐆𝐈𝐓𝐀𝐋  𝐅𝐀𝐂𝐓:*\n\n${randomFact}`);
    } catch (err) { 
        console.error(err);
        reply("❌ Error."); 
    }
});

// 7. 🎰 SLOT MACHINE GAME
cmd({
    pattern: "slot",
    alias: ["casino"],
    react: "🎰",
    desc: "Spin the secure virtual casino slots.",
    category: "fun",
    filename: __filename,
},
async (zanta, mek, m, { from, reply }) => {
    try {
        const items = ["🍎", "💎", "🎰", "🍒", "🌟", "🔥"];
        let r1 = items[Math.floor(Math.random() * items.length)];
        let r2 = items[Math.floor(Math.random() * items.length)];
        let r3 = items[Math.floor(Math.random() * items.length)];

        let txt = `🎰 *𝐍𝐄𝐗𝐔𝐒  𝐒𝐋𝐎𝐓  𝐌𝐀𝐂𝐇𝐈𝐍𝐄* 🎰\n\n` +
                  `  [ ${r1} | ${r2} | ${r3} ]\n\n`;

        if (r1 === r2 && r2 === r3) txt += `🎉 *JACKPOT! Core engine overflown with luck!*`;
        else if (r1 === r2 || r2 === r3 || r1 === r3) txt += `✨ *Match 2! Matrix stabilized.*`;
        else txt += `❌ *You lost. Try recycling your tokens.*`;

        return await reply(txt);
    } catch (err) { 
        console.error(err);
        reply("❌ System failure."); 
    }
});

// 8. 🌈 GAY PERCENTAGE CALCULATOR
cmd({
    pattern: "gay",
    react: "🌈",
    desc: "Check how gay you or a friend are.",
    category: "fun",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, sender }) => {
    try {
        let target = m.quoted ? m.quoted.sender : sender;
        let rate = Math.floor(Math.random() * 101);
        return await zanta.sendMessage(from, { text: `🌈 *𝐆𝐀𝐘  𝐌𝐄𝐓𝐄𝐑  𝐒𝐂𝐀𝐍𝐍𝐄𝐑*\n\n🎯 *Node:* @${target.split('@')[0]}\n📊 *Rate:* \`[ ${rate}% ]\``, mentions: [target] }, { quoted: mek });
    } catch (err) { 
        console.error(err);
        reply("❌ Scanner crashed."); 
    }
});

// 9. 🪙 COIN FLIP (TOSS)
cmd({
    pattern: "flip",
    alias: ["toss"],
    react: "🪙",
    desc: "Flip a binary coin node.",
    category: "fun",
    filename: __filename,
},
async (zanta, mek, m, { from, reply }) => {
    try {
        let side = Math.random() < 0.5 ? "HEADS 🪙" : "TAILS 🪙";
        return await reply(`🪙 *𝐍𝐄𝐗𝐔𝐒  𝐂𝐎𝐈𝐍  𝐅𝐋𝐈𝐏:* \`${side}\``);
    } catch (err) { 
        console.error(err);
        reply("❌ Gravity node error."); 
    }
});

// 10. 👩‍❤️‍👨 RANDOM SHIPPER (GROUP ONLY SAFETY INSTALLED)
cmd({
    pattern: "ship",
    react: "👩‍❤️‍👨",
    desc: "Randomly match two active nodes in the group cluster.",
    category: "fun",
    filename: __filename,
},
async (zanta, mek, m, { from, reply }) => {
    try {
        // Core එකෙන් කෙලින්ම Group Metadata අදින්න ගියොත් Crash වෙන්න පුළුවන් නිසා ආරක්ෂිතව fetch කරනවා
        if (!from.endsWith('@g.us')) return reply("⚠️ *This command can only be executed within a Group Chat!*");
        
        const groupMetadata = await zanta.groupMetadata(from).catch(() => null);
        if (!groupMetadata) return reply("❌ *Failed to fetch group terminal node data.*");

        let members = groupMetadata.participants;
        if (members.length < 2) return reply("⚠️ *Not enough cluster nodes to match.*");

        let m1 = members[Math.floor(Math.random() * members.length)].id;
        let m2 = members[Math.floor(Math.random() * members.length)].id;

        let attempts = 0;
        while (m1 === m2 && attempts < 10) {
            m2 = members[Math.floor(Math.random() * members.length)].id;
            attempts++;
        }

        let txt = `👩‍❤️‍👨 *𝐍𝐄𝐗𝐔𝐒  𝐑𝐀𝐍𝐃𝐎𝐌  𝐒𝐇𝐈𝐏𝐏𝐄𝐑*\n\n` +
                  `💞 *New Match Detected in System:* \n` +
                  `👉 @${m1.split('@')[0]}  X  @${m2.split('@')[0]}\n\n` +
                  `> *100% Core Matrix Approved!* ✨`;

        return await zanta.sendMessage(from, { text: txt, mentions: [m1, m2] }, { quoted: mek });
    } catch (err) { 
        console.error(err);
        reply("❌ Shipping engine failed."); 
    }
});
