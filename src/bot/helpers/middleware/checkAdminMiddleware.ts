import { Context, Middleware } from 'grammy';

export const adminCheck: Middleware<Context> = async (ctx, next) => {
    const {
        user: { id, is_bot, first_name },
    } = await ctx.getAuthor();
    if (is_bot) return;
    try {
        const ADMIN_ID = Number(process.env.ADMIN_ID) || 0;
        const adminUser = await ctx.getChatMember(ADMIN_ID);        

        if (adminUser.user.id === id) {
            await next();
        } else {
            console.log('User trying to talk with bot', first_name);
        }
    } catch (err) {
        console.error(err);
    }
};
