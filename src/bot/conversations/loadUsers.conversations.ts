import { USER_LIST } from '../../constants/global.js';
import { MSG } from '../../constants/messages.js';
import { LOGGER } from '../../logger/index.js';
import { BotContext, ConverstaionContext } from '../types/index.js';

export const loadUsersConversations = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    const { user } = await ctx.getAuthor();
    LOGGER.info('[loadUsersConversations]', { metadata: user });

    await ctx.reply(MSG.conversations.loadingUsers);

    const { message } = await conversation.waitFor('message:text');

    const text = message?.text;

    try {
        const data = JSON.parse(text);
        // LOGGER.info(ctx.session)
        // ctx.session.userList = data;
        USER_LIST.userList.users.push(...data.users);
        LOGGER.info('Updated user list', { metadata: data });
    } catch (err) {
        LOGGER.error('Error parse JSON', { metadata: err });
    }
};
