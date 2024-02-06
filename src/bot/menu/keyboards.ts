import { Keyboard } from "grammy";
import { MSG } from "../../constants/messages.js";

export const setupTagKeyboard = new Keyboard()
    .text(MSG.menu.keyboards.createTag)
    .text(MSG.menu.keyboards.updateTag)
    .text(MSG.menu.keyboards.removeTag)
    .row()
    .text(MSG.menu.keyboards.backToMainKeyboard)
    .resized()
    .oneTime();

export const chooseHowUpdateTag = new Keyboard()
    .text(MSG.menu.keyboards.addUserToTag)
    .text(MSG.menu.keyboards.editTagName)
    .text(MSG.menu.keyboards.removeUserFromTag)
    .row()
    .text(MSG.menu.keyboards.backToMainKeyboard)
    .resized()
    .oneTime();