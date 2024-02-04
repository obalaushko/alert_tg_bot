import { ROLES } from "../../../constants/global.js";
import { MSG } from "../../../constants/messages.js";
import { getUserById } from "../../../mongodb/operations/users.js";
import { mainMenu } from "../../menu/start.menu.js";
import { BotContext } from "../../types/index.js";

export const startBotDialog = async (ctx: BotContext) => {
    const {
        user: { id, is_bot, first_name },
    } = await ctx.getAuthor();
    if (is_bot) return;
    try {
        ctx.session.activeGroupId = null;
        const user = await getUserById(id);

        if (user && user.role !== ROLES.User) {
            await ctx.reply(MSG.menu.text.start, {
                reply_markup: mainMenu,
            });
        } else {
            console.log('User trying to talk with bot', first_name);
        }
    } catch (err) {
        console.error(err);
    }
}