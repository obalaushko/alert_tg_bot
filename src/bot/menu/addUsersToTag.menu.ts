import { Menu, MenuRange } from '@grammyjs/menu';
import { getAllUsers, getUsersByIds } from '../../mongodb/operations/users.js';
import { MSG } from '../../constants/messages.js';
import {
    addMembersToTag,
    findTagInGroup,
} from '../../mongodb/operations/groups.js';
import { SessionContext } from '../types/index.js';
import { LOGGER } from '../../logger/index.js';

const checked = new Set<number>();

const toggleChecked = (id: number) => {
    if (!checked.delete(id)) checked.add(id);
};

export const addUsersToTagMenu = new Menu<SessionContext>('addUsersToTagMenu')
    .dynamic(async (ctx) => {
        const groupId = ctx.session.activeGroupId;
        const tagId = ctx.session.activeTagId;

        if (!groupId || !tagId) {
            LOGGER.error('Error: GroupId or TagId is not defined');
            return;
        }
        const tagInfo = await findTagInGroup(groupId, tagId);
        if (!tagInfo) return;
        const users = await getAllUsers(
            tagInfo.members?.map((user) => user.userId)
        );

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

                    const users = await getUsersByIds(userIds);
                    if (!users) return;

                    const membersToTag = await addMembersToTag({
                        groupId,
                        tagId,
                        newMembers: users,
                    });

                    checked.clear();
                    if (membersToTag) {
                        LOGGER.info('Add members to tag', {
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
