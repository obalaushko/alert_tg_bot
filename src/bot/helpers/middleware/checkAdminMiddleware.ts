import { Context, Middleware } from 'grammy';
import { LOGGER } from '../../../logger/index.js';

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
            LOGGER.info('User trying to talk with bot', {
                metadata: first_name,
            });
        }
    } catch (err) {
        LOGGER.error({ metadata: err });
    }
};
