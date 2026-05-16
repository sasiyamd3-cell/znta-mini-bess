const { cmd } = require("../command");
const config = require("../config");
const axios = require("axios");

// 1. 🧠 CHATGPT AI COMMAND
cmd({
    pattern: "ai",
    alias: ["gpt", "chatgpt"],
    react: "🧠",
    desc: "Ask anything from NEXUS-MD AI.",
    category: "ai", // මෙනු එකේ 'ai' වලටම වැටෙන්න ලෝවර්කේස් කළා
    filename: __filename,
},
async (zanta, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("📝 *Please provide a question!*\n*Ex:* .ai write a short poem about coding.");
        
        await reply("⚡ *𝐍𝐄𝐗𝐔𝐒-𝐌𝐃 AI is thinking...*");
        
        // Free ChatGPT API Engine
        const response = await axios.get(`https://api.nexoracle.com/ai/chatgpt?q=${encodeURIComponent(q)}`).catch(() => null);
        
        if (response && response.data && response.data.result) {
            let aiReply = `🧠 *𝐍𝐄𝐗𝐔𝐒  𝐀𝐈  𝐑𝐄𝐒𝐏𝐎𝐍𝐒𝐄*\n\n${response.data.result}\n\n> *𝐏class𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒* 🧬`;
            return await reply(aiReply);
        } else {
            return reply("❌ *AI Node is currently offline or busy. Please try again shortly!*");
        }
    } catch (err) {
        console.error("AI Command Error:", err);
        reply("❌ *Terminal Error:* Connection dropped in core matrix.");
    }
});

// 2. 🎨 AI IMAGE GENERATOR (TEXT TO IMAGE)
cmd({
    pattern: "imagine",
    alias: ["aiimg", "draw"],
    react: "🎨",
    desc: "Generate futuristic AI images from text.",
    category: "ai",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, q, sender }) => {
    try {
        if (!q) return reply("📝 *Please provide a prompt!*\n*Ex:* .imagine cyberpunk hacker room, neon lights");
        
        await reply("🎨 *Creating your imagination... Please wait!*");
        
        const imageUrl = `https://api.nexoracle.com/ai/fluximg?q=${encodeURIComponent(q)}`;
        
        await zanta.sendMessage(from, {
            image: { url: imageUrl },
            caption: `✨ *𝐍𝐄𝐗𝐔𝐒  𝐀𝐈  𝐈𝐌𝐀𝐆𝐄*\n\n🔮 *Prompt:* \`${q}\`\n\n> *𝐏𝐎𝐖𝐄𝐑Ｅ𝐃 𝐁𝐘 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐍𝐄𝐗𝐔𝐒* 🧬`,
            mentions: [sender]
        }, { quoted: mek });
        
    } catch (err) {
        console.error(err);
        reply("❌ *Image Engine Error:* Render node failed.");
    }
});

// 3. 💻 ADVANCED CODING AI
cmd({
    pattern: "codeai",
    alias: ["coder", "bugfix"],
    react: "💻",
    desc: "Specialized AI for web and software development tasks.",
    category: "ai",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("📝 *Describe the code you need help with!*\n*Ex:* .codeai express server code");
        
        await reply("💻 *Analyzing architecture nodes...*");
        
        const response = await axios.get(`https://api.nexoracle.com/ai/blackbox?q=${encodeURIComponent(q)}`).catch(() => null);
        
        if (response && response.data && response.data.result) {
            let codeReply = `⚡ *𝐍𝐄𝐗𝐔𝐒  <b>𝐂𝐎𝐃𝐄</b>  𝐀𝐈*\n\n${response.data.result}\n\n> *𝐒𝐘𝐒𝐓𝐄𝐌 𝐀𝐑𝐂𝐇𝐈𝐓𝐄𝐂𝐓𝐔𝐑𝐄 𝐕𝟔.𝟕* 🧬`;
            return await reply(codeReply);
        } else {
            return reply("❌ *Coding server failure. Check connection parameters!*");
        }
    } catch (err) {
        console.error(err);
        reply("❌ *Terminal Error:* Connection failure.");
    }
});

// 4. 🗣️ TEXT TO AI VOICE REPLY
cmd({
    pattern: "sayai",
    alias: ["ttsai", "voiceai"],
    react: "🗣️",
    desc: "Convert text into smooth AI narration audio.",
    category: "ai",
    filename: __filename,
},
async (zanta, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("📝 *Please provide text to speak!*");
        
        const audioUrl = `https://api.nexoracle.com/misc/tts?text=${encodeURIComponent(q)}&lang=en`;
        
        await zanta.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: "audio/mp4",
            ptt: true
        }, { quoted: mek });
        
    } catch (err) {
        console.error(err);
        reply("❌ *Voice Synthesis Failed.*");
    }
});
