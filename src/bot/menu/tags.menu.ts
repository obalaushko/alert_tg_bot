import { Menu } from '@grammyjs/menu';
import { MSG } from '../../constants/messages.js';

export const setupTagMenu = new Menu('setupTagMenu')
    .text(MSG.menu.buttons.createTag, async (ctx) => {})
    .text(MSG.menu.buttons.updateTag, async (ctx) => {})
    .row()
    .text(MSG.menu.buttons.removeTag, async (ctx) => {})
    .row()
    .text(MSG.menu.buttons.backToMain, async (ctx) => {
        ctx.menu.back();
        await ctx.editMessageText(MSG.menu.text.start);
    });
