import { MSG } from '../../../constants/messages.js';
import { privateChat } from '../../bot.js';
import { BotContext } from '../../types/index.js';
import { startBotDialog } from './start.bot.js';

export const tagsSetupHears = async () => {
    privateChat.on('message:text').filter(
        async (ctx: BotContext) => {
            if (ctx.session.activeGroupId) {
                return true;
            } else return false;
        },
        async (ctx: BotContext) => {
            const message = ctx.msg?.text;
            console.log(message)

            switch (message) {
                case MSG.menu.buttons.createTag:
                    await ctx.conversation.enter('createTagConversations');
                    break;
                case MSG.menu.buttons.updateTag:
                    // Обробка натискання кнопки "Редагувати тег"
                    // Тут може бути виклик функції для редагування тегу
                    break;
                case MSG.menu.buttons.removeTag:
                    // Обробка натискання кнопки "Видалити тег"
                    // Тут може бути виклик функції для видалення тегу
                    break;
                case MSG.menu.buttons.backToMain:
                    await ctx.reply(MSG.menu.buttons.cancelEdit, {
                        reply_markup: { remove_keyboard: true },
                    });
                    await startBotDialog(ctx);
                    break;
                default:
                    // Обробка інших текстових повідомлень, якщо потрібно
                    break;
            }
        }
    );
};
