const { CreatePlug } = require('../lib/commands');
const CONFIG = require('../config');

CreatePlug({
  command: 'tagadmin',
  category: 'group',
  desc: 'Tag admins in the group for hlp',
  execute: async (message, conn, match) => {
    const args = match || message?.text?.split(' ').slice(1).join(' ');
    if (!message.isGroup) return; 
    await message.react('🐂'); 
    const data = await conn.groupMetadata(message.user);
    const admins = data.participants
      .filter(p => p.isAdmin)
      .map(p => p.id.replace('@s.whatsapp.net', '')); 
    if (admins.length === 0) return;
    const voidi = args || '👥 Mentioning admins:';
    const msg = `🔰──⛾「 Tag Admin 」⛾──🔰\n\n${voidi}\n`;
    const _object = admins.map(p => `@${p}`).join('\n');
    const _m = msg + _object;
    await conn.sendMessage(message.user, {
      text: _m,
      mentions: admins.map(p => `${p}@s.whatsapp.net`),
    });
  },
});

CreatePlug({
  command: 'gpp',
  category: 'group',
  desc: 'Get group profile picture',
  execute: async (message, conn) => {
    if (!message.isGroup) return;
    const groupPic = await conn.groupProfilePicture(message.user);
    if (!groupPic) return;
    await conn.sendMessage(message.user, { image: groupPic });
  },
});

CreatePlug({
  command: 'setgpp',
  category: 'group',
  desc: 'Set group profile picture',
  execute: async (message, conn) => {
    if (!message.isGroup) return;
    if (!message.isBotAdmin) return message.reply('_Im not admin_');
    if (!message.isAdmin) return;
    if (!message.quoted) return message.reply('_Reply to an image_');
    const q = message.quoted.imageMessage;
    if (!q.image) return message.reply('_Only images are supported_');
    const media = await q.downloadMedia();
    await conn.updateGroupPicture(message.user, media);
    message.reply('_Group picture has been updated_');
  },
});

CreatePlug({
  command: 'setdesc',
  category: 'group',
  desc: 'Change the group description',
  execute: async (message, conn, match) => {
    if (!message.isGroup) return;
    if (!message.isBotAdmin) return message.reply('_Im not admin_');
    if (!message.isAdmin) return;
    const args = match || message?.message?.text?.split(' ').slice(1).join(' ');
    if (!args) return message.reply('_Please provide a new group description_');
    await conn.groupUpdateDescription(message.user, args);
    message.reply(`_Group description has been updated to: "${args}"_`);
  },
});

CreatePlug({
  command: 'add',
  category: 'group',
  desc: 'Add a user to the group',
  execute: async (message, conn, match) => {
    if (!message.isGroup) return;
    if (!message.isBotAdmin) return message.reply('_Bot is not an admin_');
    if (!message.isAdmin) return;
    const user = message.body.includes('@')
      ? message.body.split('@')[1].split(' ')[0] + '@s.whatsapp.net'
      : match?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    if (!user || (match?.trim() === '' && !message.body.includes('@'))) {
      return conn.sendMessage(message.user, { text: '_Provide a valid number to add_' });}
      const voidi = await conn.groupParticipantsUpdate(message.user, [user], 'add'); 
    if (voidi?.status === 403 || voidi?.status === 'failed') {
      await conn.sendMessage(message.user, {
        text: `Couldn't add ${message.body.includes('@') ? `@${message.body.split('@')[1].split(' ')[0]}` : match.trim()}`,
        mentions: [user],
      });
    } else {
      await conn.sendMessage(message.user, {
        text: `_Added_ ${message.body.includes('@') ? `@${message.body.split('@')[1].split(' ')[0]}` : match.trim()}`,
        mentions: [user],
      });
    }
  },
});

CreatePlug({
  command: 'approve',
  category: 'group',
  desc: 'Approve users from group joining',
  execute: async (message, conn, match) => {
    if (!message.isGroup) return;
    if (!message.isBotAdmin) return message.reply('_not admin_');
    if (!message.isAdmin) return;
    const res = await conn.groupRequestParticipantsList(message.user);
    if (!res || res.length === 0) return;
    for (const participant of res) {
      const jid = participant.jid || `${participant.id}@s.whatsapp.net`; 
      await conn.groupRequestParticipantsUpdate(message.user,[jid],'approve');}
      message.reply(`_Approved ${res.length} user(s)_`);
  },
});

CreatePlug({
  command: 'approve',
  category: 'group',
  desc: 'Approve users from group joining',
  execute: async (message, conn, match) => {
    if (!message.isGroup) return;
    if (!message.isBotAdmin) return message.reply('_not admin_');
    if (!message.isAdmin) return;
    const res = await conn.groupRequestParticipantsList(message.user);
    if (!res || res.length === 0) return;
    for (const participant of res) {
      const jid = participant.jid || `${participant.id}@s.whatsapp.net`; 
      await conn.groupRequestParticipantsUpdate(message.user,[jid],'reject');}
      message.reply(`_Pending rejected_`);
  },
});

CreatePlug({
    command: 'kick',
    category: 'group',
    desc: 'Kick members by country code or kick all members',
    execute: async (message, conn, args) => {
        if (!message.isGroup || !message.isBotAdmin || !message.isAdmin) return;
        const arg = args[1];
        if (arg === 'all') {
            const { participants } = await conn.groupMetadata(message.user);
            const com = participants.filter(member => !member.admin && member.id !== conn.user.id);
            if (com.length === 0) return;
            for (const user of com) {
                await conn.groupParticipantsUpdate(message.user, [user.id], 'remove');
                await new Promise(resolve => setTimeout(resolve, 500)); }
            return message.reply(`${arg.length} _user(s) removed_`); }
          if (!arg || isNaN(arg.replace('+', ''))) {
            return message.reply('Please provide a valid country code (e.g., `kick +27`).');}
        const { participants } = await conn.groupMetadata(message.user);
        const cam = participants.filter(member => member.id.split('@')[0].startsWith(arg.replace('+', '')));
        if (cam.length === 0) return;
        for (const user of cam) {
            await conn.groupParticipantsUpdate(message.user, [user.id], 'remove');
            await new Promise(resolve => setTimeout(resolve, 500)); }
        return message.reply(`${cam.length} _user(s) removed_`);
    },
});
                    
CreatePlug({
    command: 'kickall',
    category: 'group',
    desc: 'kick all_',
    execute: async (message, conn, args) => {
        if (!message.isGroup) return;
        if(!message.isBotAdmin) return;
        if (!message.isAdmin) return;
        const memb = await conn.groupMetadata(message.user);
        const part = memb.participants.filter(member => !member.admin);
        const parti = part.map(member => member.id);
        if (parti.length === 0) return;
        for (let i = 0; i < parti.length; i++) {
            await conn.groupParticipantsUpdate(message.user, [parti[i]], 'remove');
            await new Promise(resolve => setTimeout(resolve, 500)); 
        }
    },
});

CreatePlug({
    command: 'lockinvite',
    category: 'group',
    desc: 'Lock the group invite',
    execute: async (message, conn) => {
        if (!message.isGroup) return;
        if(!message.isBotAdmin) return message.reply('_um not admin_');
        if (!message.isAdmin) return;
        await conn.groupSettingUpdate(message.user, 'locked');
        message.reply('_Done_');
    },
});

CreatePlug({
    command: 'tagall',
    category: 'group',
    desc: 'Tag all users in the group',
    execute: async (message, conn, args) => {
        if (!message.isGroup) return;
        var data = await conn.groupMetadata(message.user);
        var participants = data.participants.map(p => p.id.replace('@s.whatsapp.net', ''));
        const msg = `⛊──⛾「 Tag All 」⛾──⛊\n\n👥 Mentioning all:\n`;
        const _object = participants.map(p => `@${p}`).join('\n');
        const _m = msg + _object;
        conn.sendMessage(message.user, {
            text: _m,
            mentions: participants.map(p => p + '@s.whatsapp.net'),
        });
    },
});

CreatePlug({
    command: 'promote',
    category: 'group',
    desc: 'Promote members',
    execute: async (message, conn, args) => {
        if (!message.isGroup) return;
        if (!message.isBotAdmin) return message.reply('_not an admin_');
        if (!message.isAdmin) return;
        if (!args) return message.reply('_Please mention the user_');
        let target; 
        if (message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo) {
            target = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else {
            target = args.includes('@s.whatsapp.net') ? args : args + '@s.whatsapp.net';}
        if (!target) return;
        await conn.groupParticipantsUpdate(message.user, [target], 'promote');
        message.reply(`_promoted_ ${target.replace('@s.whatsapp.net', '')} as admin`);
    },
});

CreatePlug({
    command: 'demote',
    category: 'group',
    desc: 'Demote members',
    execute: async (message, conn, args) => {
        if (!message.isGroup) return;
        if (!message.isBotAdmin) return message.reply('_um not an admin_');
        if (!message.isAdmin) return;
        if (!args) return message.reply('_Please mention the user_');
        let target;
        if (message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo) {
        target = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else {
        target = args.includes('@s.whatsapp.net') ? args : args + '@s.whatsapp.net';}
        if (!target) return;
        await conn.groupParticipantsUpdate(message.user, [target], 'demote');
        message.reply(`_demoted_ ${target.replace('@s.whatsapp.net', '')}`);
    },
});
    
CreatePlug({
    command: 'mute',
    category: 'group',
    desc: 'Mute the group',
    execute: async (message, conn, args) => {
        if (!message.isGroup) return;
        if (!message.isBotAdmin) return message.reply('_not_admin_');
        if (!message.isAdmin) return;
        const data = await conn.groupMetadata(message.user);
        if (data.announce) return message.reply('_The group is already muted_');
        await conn.groupSettingUpdate(message.user, 'announcement');
        message.reply('_The group now_muted_');
    },
});

CreatePlug({
    command: 'unmute',
    category: 'group',
    desc: 'Unmute the group',
    execute: async (message, conn) => {
        if (!message.isGroup) return;
        if (!message.isBotAdmin) return message.reply('_not an admin_');
        if (!message.isAdmin) return;
        const data = await conn.groupMetadata(message.user);
        if (!data.announce) return message.reply('_The group already opened_');
        await conn.groupSettingUpdate(message.user, 'not_announcement');
        },
});

CreatePlug({
    command: 'remove',
    category: 'group',
    desc: 'Remove a member from the group',
    execute: async (message, conn, args) => {
        if (!message.isGroup) return;
        if (!message.isBotAdmin) return message.reply('_um not admin_');
        if (!message.isAdmin) return;
        if (!args) return message.reply('_Please mention a member_');
        let target = message.message.extendedTextMessage?.contextInfo?.mentionedJid[0] || (args.includes('@s.whatsapp.net') ? args : args + '@s.whatsapp.net');
        if (!target) return;
        await conn.groupParticipantsUpdate(message.user, [target], 'remove')
            .then(() => message.reply(`_removed_ ${target.replace('@s.whatsapp.net', '')}`))
            .catch((error) => { 
                console.error(error); 
                message.reply('err'); 
            });
    },
}); 

CreatePlug({
    command: 'info',
    category: 'group',
    desc: 'Get information about the group',
    execute: async (message, conn) => {
        if (!message.isGroup) return;
        const groupMetadata = await conn.groupMetadata(message.user);
        const name = groupMetadata.subject;
        const desc = groupMetadata.desc;
        const count = groupMetadata.participants.length;
        const img = await conn.profilePictureUrl(message.user);
        await conn.sendMessage(message.user, {
            image: { url: img }, 
            caption: `*Name*: ${name}\n*Members*: ${count}`
        });
    }
});
 
CreatePlug({
    command: 'invite',
    category: 'group',
    desc: 'group_invites',
    execute: async (message, conn) => {
        const isAdmin = message.isAdmin;
        if (!isAdmin) return;
        var _invites  = await conn.groupInviteCode(message.user);
        await message.reply(`*Group Link*:\nhttps://chat.whatsapp.com/${_invites}`);
    }
});

CreatePlug({
    command: 'leave',
    category: 'group',
    desc: 'gc_leave',
    execute: async (message, conn) => {
        const isAdmin = message.isOwner;
        if (!isAdmin) return;
        const owners = message.isOwner ? [...message.isOwner, CONFIG.app.me] : [CONFIG.app.me];
        if (!owners.includes(message.user)) {
        return;}
        await conn.groupLeave(message.user);
    }
});
