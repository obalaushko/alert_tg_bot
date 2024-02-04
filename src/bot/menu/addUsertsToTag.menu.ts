import { Menu, MenuRange } from '@grammyjs/menu';
import { getAllUsers, getUsersByIds } from '../../mongodb/operations/users.js';
import { MSG } from '../../constants/messages.js';
import { addMembersToTag } from '../../mongodb/operations/groups.js';
import { SessionContext } from '../types/index.js';

const checked = new Set<number>();

const toggleChecked = (id: number) => {
    if (!checked.delete(id)) checked.add(id);
};

export const addUsersToTagMenu = new Menu<SessionContext>('addUsersToTagMenu')
    .dynamic(async () => {
        const users = await getAllUsers();

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
                    const groupId = ctx.session.activeGroupId!;
                    const tagId = ctx.session.activeTagId!;
                    const membersToTag = await addMembersToTag({
                        groupId,
                        tagId,
                        newMembers: users,
                    });

                    checked.clear();
                    if (membersToTag) {
                        console.log('Add members to tag', membersToTag);
                    }
                    ctx.menu.nav('mainMenu');
                    await ctx.editMessageText(MSG.menu.text.start);
                });
        }

        return range;
    })
    .row()
    .text(MSG.menu.buttons.backToMain, async (ctx) => {
        ctx.menu.nav('mainMenu');
        await ctx.editMessageText(MSG.menu.text.start);
        checked.clear();
    });
