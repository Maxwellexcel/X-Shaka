const { commands, CreatePlug } = require('../lib/commands');
const { monospace } = require('../lib/monospace');
const { pack } = require('./mongodb/botpic.js');
const CONFIG = require('../config');

CreatePlug({
    command: 'menu',
    category: 'general',
    desc: 'types',
    execute: async (message, conn) => {
        await message.react('🗣️');
        const gorized = commands.reduce((acc, cmd) => {
            if (!acc[cmd.category]) acc[cmd.category] = [];
            acc[cmd.category].push(cmd.command);
            return acc;
        }, {});

        const namo = () => {
            const now = new Date();
            const date = now.toLocaleDateString('en-ZA', { timeZone: 'Africa/Johannesburg' });  
            const time = now.toLocaleTimeString('en-ZA', { timeZone: 'Africa/Johannesburg' });  
            return `╭──╼【 ${monospace(CONFIG.app.botname.toUpperCase())} 】\n` +
                   `┃ ✦ Prefix  : ${CONFIG.app.prefix}\n` +
                   `┃ ✦ User    : ${message.pushName || 'unknown'}\n` +
                   `┃ ✦ Pack    : ${pack.name}\n` +
                   `┃ ✦ Date    : ${date}\n` +  
                   `┃ ✦ Time    : ${time}\n` +  
                   `┃ ✦ Version : ${CONFIG.app.version}\n` +
                   `╰──────────╼`;
        };

        const _cxl = (category, cmds) => {
            return `╭───╼【 *${monospace(category.toUpperCase())}* 】\n` +
                   cmds.map(cmd => `┃ ∘ \`\`\`${cmd.toLowerCase()}\`\`\``).join('\n') + '\n' +
                   `╰──────────╼`;
        };

        let msg = namo() + '\n\n'; 
        for (const [category, cmds] of Object.entries(gorized)) {
            msg += _cxl(category, cmds) + '\n\n';
        }
        msg += `made with 💘`;
        await conn.sendMessage(message.user, { 
            image: { url: pack.url }, 
            caption: msg.trim() },
            { quoted: message });
    }
});

CreatePlug({
    command: 'list',
    category: 'general',
    desc: 'Display list',
    execute: async (message, conn) => {   
        const dontAddCommandList = commands
            .map((cmd, index) => `${index + 1}. ${monospace(cmd.command)}`)
            .join('\n');
        await conn.sendMessage(message.user, { text: dontAddCommandList }, { quoted: message });
    }
});
    
