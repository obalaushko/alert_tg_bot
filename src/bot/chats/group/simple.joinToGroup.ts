import { readUserFile, writeGroupFile } from '../../../../mock/index.js';
import { bot, groupChat } from '../../bot.js';
import { findUserInGroup } from '../../helpers/user.helper.js';

export const simpleJoinBotToTGGroup = () => {
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
                    // save group to JSON file
                    if ('title' in chatInfo) {
                        const newGroup = {
                            id: chatInfo.id,
                            members: [] as { id: number; username: string, admin: boolean }[],
                            tags: [] as {
                                id: string;
                                title: string;
                                tag: string;
                                members: { id: number; username: string,  admin: boolean }[];
                            }[],
                        };

                        const mockData = await readUserFile();
                        const usersGroup = await findUserInGroup(
                            chatInfo.id,
                            botInfo.id,
                            mockData.users
                        );

                        // save users to JSON file
                        if (usersGroup) {
                            usersGroup.forEach((user) => {
                                newGroup.members.push({
                                    id: user.userId,
                                    username: user.username || '',
                                    admin: false,
                                });
                            });
                        }

                        // Write the group data to the JSON file
                        await writeGroupFile(newGroup);
                    }
                } else {
                    // remove bot from group
                    try {
                        if (chatInfo.type === 'supergroup') {
                            await bot.api.unbanChatMember(
                                chatInfo.id,
                                botInfo.id
                            );
                        } else {
                            await bot.api.banChatMember(
                                chatInfo.id,
                                botInfo.id
                            );
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
};
