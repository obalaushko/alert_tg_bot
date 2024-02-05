import { MSG } from '../../../constants/messages.js';
import { privateChat } from '../../bot.js';
import { addUsersToTagMenu } from '../../menu/addUsersToTag.menu.js';
import { showTagsInGroupMenu } from '../../menu/chooseTag.menu.js';
import { removeUsersFromTagMenu } from '../../menu/removeUserFromTag.menu.js';
import { setupTagMenu } from '../../menu/tags.menu.js';
import { BotContext } from '../../types/index.js';
import { startBotDialog } from './start.bot.js';

export const tagsSetupHears = async () => {
    privateChat.on('message:text').filter(
        async (ctx: BotContext) => {
            return true;
            // Now this condition is always true
            // if (ctx.session.activeGroupId) {
            //     return true;
            // } else return false;
        },
        async (ctx: BotContext) => {
            const message = ctx.msg?.text;
            const groupId = ctx.session.activeGroupId;

            const checkSession = async () => {
                if (!groupId) {
                    await ctx.reply(MSG.menu.text.sessionDeprecated);
                }
            };

            switch (message) {
                // !setupTagKeyboard
                case MSG.menu.keyboards.createTag:
                    await checkSession();
                    await ctx.conversation.enter('createTagConversations');
                    break;
                case MSG.menu.keyboards.updateTag:
                    await checkSession();
                    if (groupId) {
                        await ctx.reply(MSG.menu.text.chooseTagToUpdate, {
                            reply_markup: showTagsInGroupMenu,
                        });
                    } else {
                        await ctx.reply(MSG.menu.text.chooseGroupToUpdate, {
                            reply_markup: setupTagMenu,
                        });
                    }
                    break;
                case MSG.menu.keyboards.removeTag:
                    await checkSession();
                    // Обробка натискання кнопки "Видалити тег"
                    // Тут може бути виклик функції для видалення тегу
                    break;
                case MSG.menu.keyboards.backToMainKeyboard:
                    await ctx.reply(MSG.menu.buttons.cancelEdit, {
                        reply_markup: { remove_keyboard: true },
                    });
                    await startBotDialog(ctx);
                    break;
                // !chooseHowUpdateTag
                case MSG.menu.keyboards.addUserToTag:
                    await checkSession();
                    await ctx.reply(MSG.menu.text.selsectUserToAdd, {
                        reply_markup: addUsersToTagMenu,
                    });
                    break;
                case MSG.menu.keyboards.editTagName:
                    await checkSession();
                    await ctx.conversation.enter('changeNameTagConversations');
                    break;
                case MSG.menu.keyboards.removeUserFromTag:
                    await checkSession();
                    await ctx.reply(MSG.menu.text.selsectUserToRemove, {
                        reply_markup: removeUsersFromTagMenu,
                    });
                    break;
                default:
                    // Обробка інших текстових повідомлень, якщо потрібно
                    break;
            }
        }
    );
};
