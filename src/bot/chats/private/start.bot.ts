import { MSG } from '../../../constants/messages.js';
import { mainMenu } from '../../menu/start.menu.js';
import { BotContext } from '../../types/index.js';

export const startBotDialog = async (ctx: BotContext) => {
    const {
        user: { id, is_bot, first_name },
    } = await ctx.getAuthor();
    if (is_bot) return;
    try {
        ctx.session.activeGroupId = null;
        ctx.session.activeTagId = null;
        const ADMIN_ID = Number(process.env.ADMIN_ID) || 0;
        const adminUser = await ctx.getChatMember(ADMIN_ID);

        if (adminUser.user.id === id) {
            await ctx.reply(MSG.menu.text.start, {
                reply_markup: mainMenu,
            });
        } else {
            await ctx.reply(MSG.errors.accessDenied);
            console.log('User trying to talk with bot', first_name);
        }
    } catch (err) {
        console.error(err);
    }
};
