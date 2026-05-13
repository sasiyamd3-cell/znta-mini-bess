const mongoose = require("mongoose");
const config = require("../config");

// --- ⚙️ MONGODB URI SETTINGS ---
const MONGO_URI = "mongodb+srv://cloud25588_db_user:RQxEbZhj74uGOtb4@cluster0.pptbqdr.mongodb.net/newdtzmini064771?appName=Cluster0";

const SettingsSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    botName: { type: String, default: config.DEFAULT_BOT_NAME },
    ownerName: { type: String, default: config.DEFAULT_OWNER_NAME },
    prefix: { type: String, default: config.DEFAULT_PREFIX },
    workType: { type: String, default: "public" }, // 04
    alwaysOnline: { type: String, default: "false" }, // 07
    autoRead: { type: String, default: "false" }, // 08
    autoTyping: { type: String, default: "false" }, // 09
    autoStatusSeen: { type: String, default: "true" }, // 10
    autoStatusReact: { type: String, default: "true" }, // 11
    readCmd: { type: String, default: "false" }, // 12
    autoVoice: { type: String, default: "false" }, // 13
    buttons: { type: String, default: "true" }, // 16
    antidelete: { type: String, default: "false" }, // 18
    autoReact: { type: String, default: "false" }, //
    footerText: { type: String, default: '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴢᴀɴᴛᴀ ᴍɪɴɪ </>' },
    fileNamePrefix: { type: String, default: 'ZANTA-MINI' }
});






const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);





const settingsCache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

async function connectDB() {
    if (mongoose.connection.readyState === 1) return;
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 100,
            minPoolSize: 10,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            serverSelectionTimeoutMS: 30000,
        });
        console.log("✅ MongoDB Connected Successfully with Security Support!");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
    }
}

const cleanId = (jid) => jid ? jid.split("@")[0].replace(/[^0-9]/g, "") : null;

async function getBotSettings(userNumber) {
    const targetId = cleanId(userNumber);
    if (!targetId) return null;
    if (settingsCache.has(targetId)) return settingsCache.get(targetId);

    try {
        let settings = await Settings.findOne({ id: targetId }).lean();
        if (!settings) {
            settings = await Settings.create({ id: targetId });
            settings = settings.toObject ? settings.toObject() : settings;
        }
        settingsCache.set(targetId, settings);
        setTimeout(() => settingsCache.delete(targetId), CACHE_TTL);
        return settings;
    } catch (e) {
        console.error("❌ Error fetching settings:", e);
        return null;
    }
}

async function updateSetting(userNumber, keyOrObject, value = null) {
    try {
        const targetId = cleanId(userNumber);
        let updateData = (typeof keyOrObject === "object") ? keyOrObject : { $set: { [keyOrObject]: value } };
        const result = await Settings.findOneAndUpdate(
            { id: targetId }, 
            updateData, 
            { new: true, upsert: true, lean: true }
        );
        if (result) settingsCache.set(targetId, result);
        return !!result;
    } catch (e) {
        console.error("❌ Error updating setting:", e);
        return false;
    }
}


module.exports = { connectDB, getBotSettings, updateSetting, Settings };
