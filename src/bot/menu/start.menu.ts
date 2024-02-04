import { Menu } from '@grammyjs/menu';
import { MSG } from '../../constants/messages.js';
import { setupAdminMenu } from './admin.menu.js';
import { setupTagMenu } from './tags.menu.js';
import { addUsersToTagMenu } from './addUsertsToTag.menu.js';

export const mainMenu = new Menu('mainMenu')
    .text(MSG.menu.buttons.setupAdmins, async (ctx) => {
        const {
            user: { id },
        } = await ctx.getAuthor();
        try {
            ctx.menu.nav('setupAdminMenu');
            await ctx.editMessageText(MSG.menu.text.setupAdmin); 
        } catch (err) {
            console.error('Error setupAdmins', err)
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
            console.error('Error setupTags', err)
        }
    });

mainMenu.register(setupAdminMenu)
mainMenu.register(addUsersToTagMenu as any)
mainMenu.register(setupTagMenu as any)