import { ROLES } from "../../../constants/global.js";
import { readUserFile } from "../../../../mock/index.js";
import { addGroup } from "../../../mongodb/operations/groups.js";
import { addUser, addUsers } from "../../../mongodb/operations/users.js";
import { bot, groupChat } from "../../bot.js";
import { findUserInGroup } from "../../helpers/user.helper.js";

export const joinBotToTGGroup = () => {
    groupChat.on('message:new_chat_members:is_bot', async (ctx) => {
        try {
            const botInfo = await bot.api.getMe();
            const chatInfo = await ctx.getChat();
            console.log('Chat info', chatInfo);
    
            console.log('Bot info', botInfo);
    
            // find user with ADMIN_ID
            try {
                const ADMIN_ID = Number(process.env.ADMIN_ID) || 0;
                const adminUser = await ctx.getChatMember(ADMIN_ID);
    
                console.log('Admin user info', adminUser);
    
                if (adminUser.status === 'creator') {
                    // save group to DB
                    if ('title' in chatInfo) {
                        const newGroup = await addGroup({
                            groupId: chatInfo.id,
                            title: chatInfo.title,
                            type: chatInfo.type,
                        });
                        // add admin first
                        await addUser({
                            userId: adminUser.user.id,
                            username: adminUser.user.username,
                            firstName: adminUser.user.first_name,
                            role: ROLES.Creator,
                            groupLink: newGroup,
                        });
                        
                        const mockData = await readUserFile();
                        const usersGroup = await findUserInGroup(
                            chatInfo.id,
                            botInfo.id,
                            mockData.users
                        );
    
                        // save users to DB
                        usersGroup && (await addUsers(usersGroup));
                    }
                } else {
                    // remove bot from group
                    try {
                        if (chatInfo.type === 'supergroup') {
                            await bot.api.unbanChatMember(chatInfo.id, botInfo.id);
                        } else {
                            await bot.api.banChatMember(chatInfo.id, botInfo.id);
                        }
                        console.log('Bot leave the group!');
                    } catch (err) {
                        console.error('Error remove bot', err);
                    }
                }
            } catch (err) {
                console.error('Error find admin', err);
            }
        } catch (err) {
            console.error('Error in message:new_chat_members:is_bot', err);
        }
    });
}