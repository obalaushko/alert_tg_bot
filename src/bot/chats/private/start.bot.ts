import { ROLES } from '../../../constants/global.js';
import { MSG } from '../../../constants/messages.js';
import { getUserById } from '../../../mongodb/operations/users.js';
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
        const user =
            ctx.session?.admins?.length &&
            ctx.session.admins.find((admin) => admin.userId === id);
        if (user) {
            await ctx.reply(MSG.menu.text.start, {
                reply_markup: mainMenu,
            });
        } else {
            const user = await getUserById(id); //

            if (user && user.role !== ROLES.User) {
                ctx.session.admins = [];
                ctx.session.admins.push(user);
                await ctx.reply(MSG.menu.text.start, {
                    reply_markup: mainMenu,
                });
            } else {
                await ctx.reply(MSG.errors.accessDenied);
                console.log('User trying to talk with bot', first_name);
            }
        }
    } catch (err) {
        console.error(err);
    }
};
