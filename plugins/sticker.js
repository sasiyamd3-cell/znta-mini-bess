const { cmd } = require("../command");
const fs = require('fs');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

ffmpeg.setFfmpegPath(ffmpegPath);

const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

/**
 * Media බාගත කිරීම
 */
const downloadMedia = async (message, type) => {
    try {
        const stream = await downloadContentFromMessage(message, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    } catch (e) {
        console.error("Download Error:", e);
        return null;
    }
};

// 1. 🖼️ IMAGE/VIDEO TO STICKER (.sticker)
cmd({
    pattern: "sticker",
    alias: ["s", "st"],
    react: "🌟",
    desc: "Convert image or video to sticker.",
    category: "tools",
    filename: __filename,
}, async (zanta, mek, m, { from, reply }) => {
    try {
        // මෙතනදී m.quoted සහ m.quoted.msg තිබේදැයි බලනවා (Save command එකේ වගේමයි)
        if (!m.quoted || !m.quoted.msg) {
            return reply("*Please reply to Image* ❌");
        }

        const quotedMsg = m.quoted.msg;
        const type = m.quoted.type; // imageMessage, videoMessage, etc.

        // Image හෝ Video එකක් නොවේ නම් error එකක් දෙනවා
        if (type !== 'imageMessage' && type !== 'videoMessage') {
            return reply("*Please reply to Image* ❌");
        }

        await zanta.sendMessage(from, { text: "*Creating Sticker...* ⏳" }, { quoted: mek });

        const mediaType = type === 'imageMessage' ? 'image' : 'video';
        const buffer = await downloadMedia(quotedMsg, mediaType);
        
        if (!buffer) return reply("Error downloading media!");

        const inPath = path.join(tempDir, `temp_${Date.now()}`);
        const outPath = path.join(tempDir, `st_${Date.now()}.webp`);
        fs.writeFileSync(inPath, buffer);

        ffmpeg(inPath)
            .on('end', async () => {
                await zanta.sendMessage(from, { 
                    sticker: fs.readFileSync(outPath), 
                    packname: "ZANTA-MD", 
                    author: "Sticker-Bot" 
                }, { quoted: mek });
                
                if (fs.existsSync(inPath)) fs.unlinkSync(inPath);
                if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
            })
            .on('error', (e) => {
                console.error(e);
                reply("FFMPEG Error!");
                if (fs.existsSync(inPath)) fs.unlinkSync(inPath);
                if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
            })
            .addOutputOptions([
                "-vcodec", "libwebp", 
                "-vf", "scale=320:320:force_original_aspect_ratio=decrease,pad=320:320:(320-iw)/2:(320-ih)/2:color=white@0.0"
            ])
            .save(outPath);

    } catch (e) {
        console.error(e);
        reply("Something went wrong!");
    }
});

// 2. 🎡 STICKER TO IMAGE (.toimg)
cmd({
    pattern: "toimg",
    alias: ["img"],
    react: "🖼️",
    desc: "Convert sticker to image.",
    category: "tools",
    filename: __filename,
}, async (zanta, mek, m, { from, reply }) => {
    try {
        // Sticker එකක්දැයි පරීක්ෂා කිරීම
        if (!m.quoted || !m.quoted.msg || m.quoted.type !== 'stickerMessage') {
            return reply("*Please reply to Sticker* ❌");
        }

        await zanta.sendMessage(from, { text: "*Converting to Image...* ⏳" }, { quoted: mek });

        const buffer = await downloadMedia(m.quoted.msg, 'sticker');
        const inPath = path.join(tempDir, `st_in_${Date.now()}.webp`);
        const outPath = path.join(tempDir, `img_${Date.now()}.png`);
        fs.writeFileSync(inPath, buffer);

        ffmpeg(inPath)
            .on('end', async () => {
                await zanta.sendMessage(from, { 
                    image: fs.readFileSync(outPath), 
                    caption: "> *ZANTA-MD Convert*" 
                }, { quoted: mek });
                
                if (fs.existsSync(inPath)) fs.unlinkSync(inPath);
                if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
            })
            .on('error', (e) => {
                console.error(e);
                reply("FFMPEG Error!");
                if (fs.existsSync(inPath)) fs.unlinkSync(inPath);
                if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
            })
            .save(outPath);
            
    } catch (e) {
        console.error(e);
        reply("Error!");
    }
});

module.exports = {};
