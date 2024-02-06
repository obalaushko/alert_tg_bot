import { ROLES } from '../../../constants/global.js';
import { MSG } from '../../../constants/messages.js';
import { getUserById } from '../../../mongodb/operations/users.js';
import { privateChat } from '../../bot.js';
import { addUsersToTagMenu } from '../../menu/addUsersToTag.menu.js';
import { showTagsInGroupMenu } from '../../menu/chooseTag.menu.js';
import { removeTagMenu } from '../../menu/removeTag.menu.js';
import { removeUsersFromTagMenu } from '../../menu/removeUserFromTag.menu.js';
import { setupTagMenu } from '../../menu/tags.menu.js';
import { BotContext } from '../../types/index.js';
import { startBotDialog } from './start.bot.js';

export const tagsSetupHears = async () => {
    privateChat.on('message:text').filter(
        async (ctx: BotContext) => {
            const {
                user: { id, is_bot, first_name },
            } = await ctx.getAuthor();
            if (is_bot) return false;
            try {
                const user =
                    ctx.session?.admins?.length &&
                    ctx.session.admins.find((admin) => admin.userId === id);
                if (user) {
                    return true;
                } else {
                    const user = await getUserById(id); //

                    if (user && user.role !== ROLES.User) {
                        ctx.session.admins = [];
                        ctx.session.admins.push(user);
                        return true;
                    } else {
                        console.log('User trying to talk with bot', first_name);
                        return false;
                    }
                }
            } catch (err) {
                console.error(err);
                return false;
            }
        },
        async (ctx: BotContext) => {
            const message = ctx.msg?.text;
            const groupId = ctx.session.activeGroupId;
            const tagId = ctx.session.activeTagId;

            const checkSession = async (...args: any[]): Promise<boolean> => {
                for (let arg of args) {
                    if (!arg) {
                        await ctx.reply(MSG.menu.text.sessionDeprecated);
                        return false;
                    }
                }
                return true;
            };

            switch (message) {
                // !setupTagKeyboard
                case MSG.menu.keyboards.createTag:
                    if (!(await checkSession(groupId))) return;
                    await ctx.conversation.enter('createTagConversations');
                    break;
                case MSG.menu.keyboards.updateTag:
                    if (!(await checkSession(groupId))) return;
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
                    if (!(await checkSession(groupId))) return;
                    await ctx.reply(MSG.menu.text.chooseTagToRemove, {
                        reply_markup: removeTagMenu,
                    });
                    break;
                case MSG.menu.keyboards.back:
                    await ctx.reply(MSG.menu.text.chooseTagToUpdate, {
                        reply_markup: showTagsInGroupMenu,
                    });
                    break;
                // Back to main keyboard
                case MSG.menu.keyboards.backToMainKeyboard:
                    await ctx.reply(MSG.menu.buttons.cancelEdit, {
                        reply_markup: { remove_keyboard: true },
                    });
                    await startBotDialog(ctx);
                    break;
                // !chooseHowUpdateTag
                case MSG.menu.keyboards.addUserToTag:
                    if (!(await checkSession(groupId, tagId))) return;
                    await ctx.reply(MSG.menu.text.selsectUserToAdd, {
                        reply_markup: addUsersToTagMenu,
                    });
                    break;
                case MSG.menu.keyboards.editTagName:
                    if (!(await checkSession(groupId, tagId))) return;
                    await ctx.conversation.enter('changeTagConversations');
                    break;
                case MSG.menu.keyboards.removeUserFromTag:
                    if (!(await checkSession(groupId, tagId))) return;
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
