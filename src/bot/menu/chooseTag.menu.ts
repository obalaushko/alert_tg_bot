import { Menu, MenuRange } from "@grammyjs/menu";
import { SessionContext } from "../types/index.js";
import { findAllTagsInGroup, findTagInGroup } from "../../mongodb/operations/groups.js";
import { MSG } from "../../constants/messages.js";
import { chooseHowUpdateTag } from "./keyboards.js";

export const showTagsInGroupMenu = new Menu<SessionContext>('showTagsInGroupMenu')
    .dynamic(async (ctx) => {
        const groupId = ctx.session.activeGroupId;
        if (!groupId) {
            console.error('Error: GroupId is not defined');
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
                        await ctx.api.deleteMessage(ctx.chat?.id!, ctx.msg?.message_id!);

                        const tagInfo = await findTagInGroup(groupId, ctx.match);

                        if (!tagInfo) {
                            console.error('Error: TagInfo is not defined');
                            return;
                        }
                        console.log(tagInfo)

                        await ctx.reply(MSG.menu.text.selectActions(tagInfo), {
                            reply_markup: chooseHowUpdateTag
                        });
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