import { Menu, MenuRange } from '@grammyjs/menu';
import { MSG } from '../../constants/messages.js';
import {
    getAllAdminRoles,
    getAllUserRoles,
    updateUsersToAdmin,
    updateUsersToUser,
} from '../../mongodb/operations/users.js';

const checked = new Set<number>();

const toggleChecked = (id: number) => {
    if (!checked.delete(id)) checked.add(id);
};

const addAdminMenu = new Menu('addAdminMenu')
    .dynamic(async () => {
        const users = await getAllUserRoles();

        const range = new MenuRange();
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

                range.row();
                checked.size &&
                    range.text(MSG.menu.buttons.update, async (ctx) => {
                        const userIds = [...checked];

                        const updateUsers = await updateUsersToAdmin(userIds);

                        checked.clear();
                        if (updateUsers?.length) {
                            console.log('Update Users', updateUsers);
                        }
                        ctx.menu.back();
                    });
            });
        }

        return range;
    })
    .row()
    .text(MSG.menu.buttons.back, async (ctx) => {
        ctx.menu.nav('setupAdminMenu');
        await ctx.editMessageText(MSG.menu.text.setupAdmin);
        checked.clear();
    })
    .text(MSG.menu.buttons.backToMain, async (ctx) => {
        ctx.menu.nav('mainMenu');
        await ctx.editMessageText(MSG.menu.text.start);
        checked.clear();
    });

const removeAdminMenu = new Menu('removeAdminMenu')
    .dynamic(async () => {
        const users = await getAllAdminRoles();

        const range = new MenuRange();
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

                range.row();
                checked.size &&
                    range.text(MSG.menu.buttons.update, async (ctx) => {
                        const userIds = [...checked];

                        const updateUsers = await updateUsersToUser(userIds);

                        checked.clear();
                        if (updateUsers?.length) {
                            console.log('Update Users', updateUsers);
                        }
                        ctx.menu.back();
                    });
            });
        }

        return range;
    })
    .row()
    .text(MSG.menu.buttons.back, async (ctx) => {
        ctx.menu.nav('setupAdminMenu');
        await ctx.editMessageText(MSG.menu.text.setupAdmin);
        checked.clear();
    })
    .text(MSG.menu.buttons.backToMain, async (ctx) => {
        ctx.menu.nav('mainMenu');
        await ctx.editMessageText(MSG.menu.text.start);
        checked.clear();
    });

export const setupAdminMenu = new Menu('setupAdminMenu')
    .text(MSG.menu.buttons.addAdmin, async (ctx) => {
        const {
            user: { id },
        } = await ctx.getAuthor();
        try {
            ctx.menu.nav('addAdminMenu');
            await ctx.editMessageText(MSG.menu.text.addAdmin);
        } catch (err) {
            console.error('Error addAdmin', err);
        }
    })
    .text(MSG.menu.buttons.removeAdmin, async (ctx) => {
        const {
            user: { id },
        } = await ctx.getAuthor();
        try {
            ctx.menu.nav('removeAdminMenu');
            await ctx.editMessageText(MSG.menu.text.removeAdmin);
        } catch (err) {
            console.error('Error removeAdmin', err);
        }
    })
    .row()
    .text(MSG.menu.buttons.backToMain, async (ctx) => {
        ctx.menu.back();
        await ctx.editMessageText(MSG.menu.text.start);
    });

setupAdminMenu.register(addAdminMenu);
setupAdminMenu.register(removeAdminMenu);
