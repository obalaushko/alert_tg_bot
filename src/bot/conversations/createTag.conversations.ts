import { MSG } from '../../constants/messages.js';
import { BotContext, ConverstaionContext } from '../types/index.js';
import { isCancel } from '../utils/utils.js';

export const createTagConversations = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    const { user } = await ctx.getAuthor();
    console.log('[createTagConversations]', user);

    // Запит на введення назви тегу
    await ctx.reply(MSG.conversations.chooseTagTitle);
    const { message } = (await conversation.waitFor('message:text')) as any;
    const title = message?.text;

    if (isCancel(title || '')) {
        await ctx.reply(MSG.conversations.leaveConversation);
        await ctx.conversation.exit();
        console.log(`[createTagConversations] Leave the conversation`);
        return;
    }

    // Запит на введення самого тегу
    let isValidFormat = false;
    let tag = ''
    while (isValidFormat) {
        await ctx.reply(MSG.conversations.chooseTagName);
        const message = (await conversation.waitFor('message:text')) as any;

        tag = message?.text;
    
        if (isCancel(tag || '') || !/^[\p{L}]{3,20}$/u.test(tag)) {
            await ctx.reply(MSG.conversations.invalidInput);
        } else {
            isValidFormat = true;
        }
    }
    
    // Тепер 'tag' містить валідний тег, який ввів користувач
    console.log(`[createTagConversations] Tag: ${tag}`);
    

    console.log(`[createTagConversations] Tag title: ${title}, Tag: ${tag}`);

    // Додавання тегу до бази даних
    const update = await conversation.external(
        async () => {
            
        }
    );

    return;
};
