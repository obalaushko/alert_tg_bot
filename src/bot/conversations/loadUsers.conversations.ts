import { USER_LIST } from '../../constants/global.js';
import { MSG } from '../../constants/messages.js';
import { BotContext, ConverstaionContext } from '../types/index.js';

export const loadUsersConversations = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    const { user } = await ctx.getAuthor();
    console.log('[loadUsersConversations]', user);

    await ctx.reply(MSG.conversations.loadingUsers);

    const { message } = await conversation.waitFor('message:text');

    const text = message?.text;

    try {
        const data = JSON.parse(text);
        // console.log(ctx.session)
        // ctx.session.userList = data;
        USER_LIST.userList.users.push(...data.users);
        console.log('Updated user list', data);
    } catch (err) {
        console.error('Error parse JSON', err);
    }
};
