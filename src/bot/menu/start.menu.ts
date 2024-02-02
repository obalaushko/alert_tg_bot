import { Menu } from "@grammyjs/menu";
import { MSG } from "../../constants/messages.js";

export const mainMenu = new Menu('mainMenu')
.text(MSG.menu.buttons.setup, async (ctx) => {
    const {
        user: { id },
    } = await ctx.getAuthor();
})