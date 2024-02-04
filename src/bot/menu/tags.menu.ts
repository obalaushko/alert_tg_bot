import { Menu, MenuRange } from '@grammyjs/menu';
import { MSG } from '../../constants/messages.js';
import { Keyboard } from 'grammy';
import { getAllGroups } from '../../mongodb/operations/groups.js';
import { SessionContext } from '../types/index.js';

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

                            await ctx.reply(MSG.menu.text.setupTag, {
                                reply_markup: setupTagKeyboard,
                            });
                        }
                    );
                    if (index % 2) range.row();
                });
            }
            return range;
        } catch (err) {
            console.error('Error in setupTagMenu', err);
        }
    })
    .row()
    .text(MSG.menu.buttons.backToMain, async (ctx) => {
        ctx.menu.back();
        await ctx.editMessageText(MSG.menu.text.start);
    });

export const setupTagKeyboard = new Keyboard()
    .text(MSG.menu.buttons.createTag)
    .text(MSG.menu.buttons.updateTag)
    .text(MSG.menu.buttons.removeTag)
    .row()
    .text(MSG.menu.buttons.backToMain)
    .resized()
    .oneTime();
