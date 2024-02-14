import { Menu, MenuRange } from '@grammyjs/menu';
import { MSG } from '../../constants/messages.js';
import { getAllGroups, getGroupById } from '../../mongodb/operations/groups.js';
import { SessionContext } from '../types/index.js';
import { setupTagKeyboard } from './keyboards.js';
import { LOGGER } from '../../logger/index.js';

export const setupTagMenu = new Menu<SessionContext>('setupTagMenu')
    .dynamic(async () => {
        try {
            const groups = await getAllGroups();

            const range = new MenuRange<SessionContext>();
            if (groups?.length) {
                groups.map((group, index) => {
                    range.text(
                        {
                            text: group.title,
                        },
                        async (ctx) => {
                            ctx.session.activeGroupId = group.groupId;
                            await ctx.api.deleteMessage(
                                ctx.chat?.id!,
                                ctx.msg?.message_id!
                            );
                            const groupInfo = await getGroupById(group.groupId);
                            if (!groupInfo) {
                                LOGGER.error('Error: GroupInfo is not defined');
                                return;
                            }

                            await ctx.reply(MSG.menu.text.setupTag(groupInfo), {
                                reply_markup: setupTagKeyboard,
                            });
                        }
                    );
                    if (index % 2) range.row();
                });
            }
            return range;
        } catch (err) {
            LOGGER.error('Error in setupTagMenu', { metadata: err });
        }
    })
    .row()
    .text(MSG.menu.buttons.backToMainMenu, async (ctx) => {
        ctx.menu.back();
        await ctx.editMessageText(MSG.menu.text.start);
    });
