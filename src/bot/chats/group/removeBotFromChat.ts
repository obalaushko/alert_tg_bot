import { deleteGroup } from '../../../mongodb/operations/groups.js';
import { bot, groupChat } from '../../bot.js';

export const removeBotFromChat = async () => {
    groupChat.command('remove', async (ctx) => {
        try {
            const botInfo = await bot.api.getMe();
            const {
                user: { id, is_bot },
            } = await ctx.getAuthor();
            if (is_bot) return;
            const ADMIN_ID = Number(process.env.ADMIN_ID) || 0;
            const adminUser = await ctx.getChatMember(ADMIN_ID);
            const chatInfo = await ctx.getChat();

            if (adminUser.user.id === id) {
                try {
                    if (chatInfo.type === 'supergroup') {
                        await bot.api.unbanChatMember(chatInfo.id, botInfo.id);
                    } else {
                        await bot.api.banChatMember(chatInfo.id, botInfo.id);
                    }
                    await deleteGroup(chatInfo.id);
                } catch (err) {
                    console.error('[removeBotFromChat][error]', err);
                }
            }
        } catch (err) {
            console.error('Error remove bot', err);
        }
    });
};
