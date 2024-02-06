import { MSG } from '../../constants/messages.js';
import { editTag } from '../../mongodb/operations/groups.js';
import { setupTagKeyboard } from '../menu/keyboards.js';
import { BotContext, ConverstaionContext } from '../types/index.js';
import { isCancel } from '../utils/utils.js';

export const changeTagConversations = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    const { user } = await ctx.getAuthor();
    console.log('[changeTagConversations]', user);

    await ctx.reply(MSG.conversations.chooseTagTitle, {
        reply_markup: { remove_keyboard: true },
    });
    const { message } = await conversation.waitFor('message:text');
    const title = message?.text;

    if (isCancel(title || '')) {
        await ctx.reply(MSG.conversations.leaveConversation);
        // await ctx.conversation.exit();
        console.log(`[changeTagConversations] Leave the conversation`);
        return;
    }

    let isValidFormat = false;
    let tag = '';
    await ctx.reply(MSG.conversations.chooseTagName);
    while (!isValidFormat) {
        const message = await conversation.waitFor('message:text');

        tag = message.msg.text;

        if (isCancel(tag || '')) {
            await ctx.reply(MSG.conversations.leaveConversation);
            // await ctx.conversation.exit();
            console.log(`[changeTagConversations] Leave the conversation`);
            return;
        }

        if (tag) {
            const nameSurnameRegex = /^[\p{L}\d]{3,20}$/u;
            const match = nameSurnameRegex.exec(tag);

            if (match) {
                const cleanedInput = tag.trim();
                tag = cleanedInput;
                isValidFormat = true;
            } else {
                await ctx.reply(MSG.conversations.invalidInput);
            }
        }
    }

    console.log(`[changeTagConversations] Tag title: ${title}, Tag: ${tag}`);

    // Add tag to DB
    const updateTag = await conversation.external(async () => {
        if (ctx.session.activeGroupId && ctx.session.activeTagId) {
            const updateTag = await editTag({
                groupId: ctx.session.activeGroupId!,
                tagId: ctx.session.activeTagId!,
                newTag: tag,
                newTitle: title,
            });

            return updateTag;
        } else {
            console.error('Error activeGroupId not found!');
        }
    });

    if (updateTag) {
        await ctx.reply(MSG.conversations.tagUpdated, {
            reply_markup: setupTagKeyboard,
        });
    }

    return;
};
