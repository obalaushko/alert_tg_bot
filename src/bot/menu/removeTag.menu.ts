import { Menu, MenuRange } from '@grammyjs/menu';
import { SessionContext } from '../types/index.js';
import {
    deleteTag,
    findAllTagsInGroup,
} from '../../mongodb/operations/groups.js';
import { MSG } from '../../constants/messages.js';
import { LOGGER } from '../../logger/index.js';

export const removeTagMenu = new Menu<SessionContext>('removeTagMenu')
    .dynamic(async (ctx) => {
        const groupId = ctx.session.activeGroupId;
        if (!groupId) {
            LOGGER.error('Error: GroupId is not defined');
            return new MenuRange<SessionContext>();
        }

        const tags = await findAllTagsInGroup(groupId);

        const range = new MenuRange<SessionContext>();

        if (tags?.length) {
            tags.map((tag, index) => {
                range.text(
                    {
                        text: tag.tag,
                        payload: tag.id,
                    },
                    async (ctx) => {
                        ctx.session.activeTagId = ctx.match;
                        await ctx.api.deleteMessage(
                            ctx.chat?.id!,
                            ctx.msg?.message_id!
                        );

                        const removeTag = await deleteTag(groupId, ctx.match);

                        if (!removeTag) {
                            LOGGER.error('Error: Tag is not removed');
                            return;
                        }
                        ctx.reply(MSG.menu.text.tagRemoded);
                    }
                );
                if ((index + 1) % 3 === 0) range.row();
            });
            range.row();
        }

        return range;
    })
    .row()
    .text(MSG.menu.buttons.backToMainMenu, async (ctx) => {
        ctx.menu.nav('mainMenu');
        await ctx.editMessageText(MSG.menu.text.start);
    });
