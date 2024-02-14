import { Menu, MenuRange } from '@grammyjs/menu';
import { getUsersByIds } from '../../mongodb/operations/users.js';
import { MSG } from '../../constants/messages.js';
import {
    findTagInGroup,
    removeUsersFromTag,
} from '../../mongodb/operations/groups.js';
import { SessionContext } from '../types/index.js';
import { UserModel } from '../../mongodb/schemas/user.js';
import { LOGGER } from '../../logger/index.js';

const checked = new Set<number>();

const toggleChecked = (id: number) => {
    if (!checked.delete(id)) checked.add(id);
};

export const removeUsersFromTagMenu = new Menu<SessionContext>(
    'removeUsersFromTagMenu'
)
    .dynamic(async (ctx) => {
        const groupId = ctx.session.activeGroupId;
        const tagId = ctx.session.activeTagId;
        if (!groupId || !tagId) {
            LOGGER.error('Error: GroupId or TagId is not defined');
            return new MenuRange<SessionContext>();
        }

        const tag = await findTagInGroup(groupId, tagId);
        if (!tag) {
            LOGGER.error('Error: Tag is not defined');
            return new MenuRange<SessionContext>();
        }
        const users = await UserModel.find({ _id: { $in: tag.members } });

        const range = new MenuRange<SessionContext>();

        if (users?.length) {
            users.map((user, index) => {
                range.text(
                    {
                        text: checked.has(user.userId)
                            ? `✔️ @${user.username || user.firstName!}`
                            : `@${user.username}` || user.firstName!,
                        payload: user.userId.toString(),
                    },
                    (ctx) => {
                        toggleChecked(Number(ctx.match));

                        ctx.menu.update();
                    }
                );
                if (index % 2) range.row();
            });
            range.row();
            checked.size &&
                range.text(MSG.menu.buttons.update, async (ctx) => {
                    const userIds = [...checked];

                    if (!users) return;

                    if (!groupId || !tagId) {
                        LOGGER.error('Error: GroupId or TagId is not defined');
                        return;
                    }

                    const membersToTag = await removeUsersFromTag({
                        groupId,
                        tagId,
                        userIds: userIds,
                    });

                    checked.clear();
                    if (membersToTag) {
                        LOGGER.info('Remove members from tag', {
                            metadata: membersToTag,
                        });
                    }
                    ctx.menu.nav('mainMenu');
                    await ctx.editMessageText(MSG.menu.text.start);
                });
        }

        return range;
    })
    .row()
    .text(MSG.menu.buttons.backToMainMenu, async (ctx) => {
        ctx.menu.nav('mainMenu');
        await ctx.editMessageText(MSG.menu.text.start);
        checked.clear();
    });
