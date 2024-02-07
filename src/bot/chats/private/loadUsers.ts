import { privateChat } from '../../bot.js';

// Loading list users in group
export const loadUsers = async () => {
    privateChat.command('loading', async (ctx) => {
        const { user } = await ctx.getAuthor();
        const ADMIN_ID = Number(process.env.ADMIN_ID) || 0;
        const adminUser = await ctx.getChatMember(ADMIN_ID);

        if (adminUser.user.id === user.id) {
            await ctx.conversation.enter('loadUsersConversations');
        }
    });
};
