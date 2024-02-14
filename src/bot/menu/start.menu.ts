import { Menu } from '@grammyjs/menu';
import { MSG } from '../../constants/messages.js';
import { setupAdminMenu } from './admin.menu.js';
import { setupTagMenu } from './tags.menu.js';
import { addUsersToTagMenu } from './addUsersToTag.menu.js';
import { showTagsInGroupMenu } from './chooseTag.menu.js';
import { removeUsersFromTagMenu } from './removeUserFromTag.menu.js';
import { removeTagMenu } from './removeTag.menu.js';
import { LOGGER } from '../../logger/index.js';

export const mainMenu = new Menu('mainMenu')
    .text(MSG.menu.buttons.setupAdmins, async (ctx) => {
        const {
            user: { id },
        } = await ctx.getAuthor();
        try {
            ctx.menu.nav('setupAdminMenu');
            await ctx.editMessageText(MSG.menu.text.setupAdmin);
        } catch (err) {
            LOGGER.error('Error setupAdmins', { metadata: err });
        }
    })
    .text(MSG.menu.buttons.setupTags, async (ctx) => {
        const {
            user: { id },
        } = await ctx.getAuthor();
        try {
            ctx.menu.nav('setupTagMenu');
            await ctx.editMessageText(MSG.menu.text.chooseGroupToUpdate);
        } catch (err) {
            LOGGER.error('Error setupTags', { metadata: err });
        }
    });

mainMenu.register(setupAdminMenu);
mainMenu.register(addUsersToTagMenu as any);
mainMenu.register(removeUsersFromTagMenu as any);
mainMenu.register(removeTagMenu as any);
mainMenu.register(setupTagMenu as any);
mainMenu.register(showTagsInGroupMenu as any);
