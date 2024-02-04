import { MSG } from '../../constants/messages.js';
import { addTagToGroup } from '../../mongodb/operations/groups.js';
import { addUsersToTagMenu } from '../menu/addUsertsToTag.menu.js';
import { BotContext, ConverstaionContext } from '../types/index.js';
import { isCancel } from '../utils/utils.js';

export const createTagConversations = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    const { user } = await ctx.getAuthor();
    console.log('[createTagConversations]', user);

    // Запит на введення назви тегу
    await ctx.reply(MSG.conversations.chooseTagTitle, {
        reply_markup: { remove_keyboard: true },
    });
    const { message } = await conversation.waitFor('message:text');
    const title = message?.text;

    if (isCancel(title || '')) {
        await ctx.reply(MSG.conversations.leaveConversation);
        await ctx.conversation.exit();
        console.log(`[createTagConversations] Leave the conversation`);
        return;
    }

    // Запит на введення самого тегу
    let isValidFormat = false;
    let tag = '';
    await ctx.reply(MSG.conversations.chooseTagName);
    while (!isValidFormat) {
        const message = await conversation.waitFor('message:text');

        tag = message.msg.text;

        if (isCancel(tag || '')) {
            await ctx.reply(MSG.conversations.leaveConversation);
            await ctx.conversation.exit();
            console.log(`[createTagConversations] Leave the conversation`);
            return;
        }

        if (tag) {
            const nameSurnameRegex = /^[\p{L}]{3,20}$/u;
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

    console.log(`[createTagConversations] Tag title: ${title}, Tag: ${tag}`);

    // Add tag to DB
    const addTag = await conversation.external(async () => {
        if (ctx.session.activeGroupId) {
            const newTag = await addTagToGroup({
                groupId: ctx.session.activeGroupId!,
                tag: tag,
                tagTitle: title,
            });
            
            return newTag
        } else {
            console.error('Error activeGroupId not found!');
        }
    });

    if (addTag) {
        // Next to add users
        console.log(addTag);
        if (!addTag.id) {
            console.error('Error tag Id not found!');
            return;
        }
        await ctx.reply(MSG.conversations.chooseMemberToAddTag(addTag.title), {
            reply_markup: addUsersToTagMenu
        })
        ctx.session.activeTagId = addTag.id;
    }

    return;
};
