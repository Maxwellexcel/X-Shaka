const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
    Browsers,
    delay,
} = require("@whiskeysockets/baileys");
const { serialize } = require("./lib/messages");
const ut = require("util");
const { getMessage } = require('./cn_data/group');
const { getPlugins } = require("./lib/loads");
const CONFIG = require("./config");
const readline = require("readline");
const chalk = require("chalk");
const pino = require("pino");
const { makeInMemoryStore } = require("@whiskeysockets/baileys");
const { commands } = require("./lib/commands");

global.SESSION_ID = "session";
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const question = (text) => new Promise((resolve) => rl.question(text, resolve));
const store = makeInMemoryStore({
    logger: pino().child({ level: "silent", stream: "store" }),
});

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(`./session`);
    const conn = makeWASocket({
        auth: state,
        version: (await fetchLatestBaileysVersion()).version,
        printQRInTerminal: false,
        browser: Browsers.macOS('Chrome'),
        logger: pino({ level: "silent" }),
    });

    function log(level, message) {
        if (CONFIG.logging.level === "info" && level === "info") {
            console.log(chalk.blueBright(`[INFO] ${message}`));
        } else if (CONFIG.logging.level === "error" && level === "error") {
            console.log(chalk.redBright(`[ERROR] ${message}`));
        } else if (CONFIG.logging.level === "debug") {
            console.log(chalk.greenBright(`[DEBUG] ${message}`));
        }
    }

    conn.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type === "notify" && Array.isArray(messages)) {
            for (const msg of messages) {
                const message = await serialize(conn, msg);
                if (!message) {
                    log("error", "error_seril");
                    continue;
                } try {
                    const { sender, isGroup, text } = message;
                    const isPrivate = CONFIG.app.mode === "public";
                    if (!isPrivate && !message.fromMe && !CONFIG.app.mods.includes(sender.split("@")[0])) {
                        return;
                    }
                    const control = CONFIG.app.prefix;
                    let cmd_txt = text ? text.trim().toLowerCase() : null;
                    if (cmd_txt && cmd_txt.startsWith(control)) {
                        cmd_txt = cmd_txt.slice(control.length).trim();
                    }
                    const command = commands.find((c) => c.command === cmd_txt);
                    if (command) {
                        await command.execute(message, conn);
                    } else if (cmd_txt?.startsWith("$") || cmd_txt?.startsWith(">")) {
                        try {
                            const result = await eval(cmd_txt.slice(1).trim());
                            return message.reply(`${ut.inspect(result, { depth: null })}`);
                        } catch (error) {
                            message.reply(`${error.message}`);
                        }
                    }} catch (error) {
                    log("error", `${error.message}`);
                }
            }
        }
    });

    conn.ev.on("creds.update", saveCreds);
    if (!conn.authState.creds.registered) {
        console.clear();
        console.log(chalk.cyan('Starting pairing process_num?...'));
        let phoneNumber = await question(`   ${chalk.cyan('- Please enter your WhatsApp number')}: `);
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        try {
            let code = await conn.requestPairingCode(phoneNumber);
            console.log(chalk.cyan(`Pair_Code=>: ${code}`));
          } catch (error) {
            log("error", error);
      }
        rl.close();
 }
    
conn.ev.on("group-participants.update", async ({ id, participants, action }) => {
    for (const participant of participants) {
        const username = `@${participant.split('@')[0]}`;
        const timestamp = new Date().toLocaleString();
        try {
          const message_admin = getMessage(action, username, timestamp);
            if (message_admin) {
             await conn.sendMessage(id, { text: message_admin, mentions: [participant] });
            } else {
                }} catch (error) {
            log("error", `${error.message}`);
        }}
});

    conn.ev.on("connection.update", async (update) => {
        const { connection } = update;
        if (connection === "open") {
            console.log(chalk.greenBright('Connection established successfully!'));
            const plugins = getPlugins();
        }
    });
}

startBot();
