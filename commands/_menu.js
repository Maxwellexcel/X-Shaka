const { commands, CreatePlug } = require('../lib/commands');
const CONFIG = require('../config');

CreatePlug({
    command: 'menu',
    category: 'general',
    desc: 'types',
    execute: async (message) => {        
      const gorized = commands.reduce((acc, cmd) => {
          if (!acc[cmd.category]) acc[cmd.category] = [];
            acc[cmd.category].push(cmd.command);
            return acc;
}, {});
    const namo = () => {
  return `╭──╼【 𝐗-𝐀𝐒𝐓𝐑𝐀𝐋 】\n` +
`┃ ✦ Prefix  : ${CONFIG.app.prefix}\n` +
`┃ ✦ User    : ${message.user}\n` +
`┃ ✦ Date    : Active\n` +
`┃ ✦ Version : ${CONFIG.app.version}\n` +
`╰──────────╼`;
        };

        const package = (category, cmds) => {
  return `╭───╼【 *${category.toUpperCase()}* 】\n` +
            cmds.map(cmd => `┃ ∘ ${cmd}`).join('\n') + '\n' +
         `╰──────────╼`;
      };
    let msg = namo() + '\n\n'; 
        for (const [category, cmds] of Object.entries(gorized)) {
            msg += package(category, cmds) + '\n\n';
  }
      await conn.send(message.user, { text: msg.trim() });
    }
});
  
