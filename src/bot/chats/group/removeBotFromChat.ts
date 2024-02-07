import { ROLES } from '../../../constants/global.js';
import { getUserById } from '../../../mongodb/operations/users.js';
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

            if (adminUser.user.id === id) {
                await bot.api.unbanChatMember(ctx.chat.id, botInfo.id);
                return;
            }
            const user =
                ctx.session?.admins?.length &&
                ctx.session.admins.find((admin) => admin.userId === id);

            if (user) {
                await bot.api.unbanChatMember(ctx.chat.id, botInfo.id);
            } else {
                const user = await getUserById(id); //

                if (user && user.role !== ROLES.User) {
                    ctx.session.admins = [];
                    ctx.session.admins.push(user);

                    await bot.api.unbanChatMember(ctx.chat.id, botInfo.id);
                }
            }
        } catch (err) {
            console.error('Error remove bot', err);
        }
    });
};
