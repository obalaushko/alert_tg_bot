import {
    LOOGER_GROUP_ID,
    ROLES,
    USER_LIST,
} from '../../../constants/global.js';
import { LOGGER } from '../../../logger/index.js';
import { addGroup } from '../../../mongodb/operations/groups.js';
import {
    addUser,
    addUsers,
} from '../../../mongodb/operations/users.js';
import { groupChat } from '../../bot.js';
import { findUserInGroup } from '../../helpers/user.helper.js';

export const joinBotToTGGroup = () => {
    groupChat.on(':new_chat_members:me', async (ctx) => {
        try {
            const botInfo = await ctx.api.getMe();
            const chatInfo = await ctx.getChat();
            LOGGER.info('Chat info', { metadata: chatInfo });

            LOGGER.info('Bot info', { metadata: botInfo });

            // Ckeck if group is LOOGER_GROUP
            if (chatInfo.id === LOOGER_GROUP_ID) return;

            // find user with ADMIN_ID
            try {
                const ADMIN_ID = Number(process.env.ADMIN_ID) || 0;
                const adminUser = await ctx.getChatMember(ADMIN_ID);

                LOGGER.info('Admin user info', { metadata: adminUser });

                // const mockData = ctx.session.userList; // !
                const mockData = USER_LIST.userList; // !
                LOGGER.info('MOCK DATA', { metadata: mockData });

                if (
                    ['member', 'creator', 'administrator'].includes(
                        adminUser.status
                    )
                ) {
                    // save group to DB
                    if ('title' in chatInfo) {
                        await addGroup({
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
                        });

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
                            await ctx.api.unbanChatMember(
                                chatInfo.id,
                                botInfo.id
                            );
                        } else {
                            await ctx.api.banChatMember(
                                chatInfo.id,
                                botInfo.id
                            );
                        }
                        LOGGER.warn('Bot leave the group!');
                        if (mockData.users.length > 0) {
                            LOGGER.error('Error: User list is empty', {
                                metadata: mockData.users,
                            });
                        }
                    } catch (err) {
                        LOGGER.error('Error remove bot', { metadata: err });
                    }
                }
            } catch (err) {
                LOGGER.error('Error find admin', { metadata: err });
            }
        } catch (err) {
            LOGGER.error('Error in message:new_chat_members:me', {
                metadata: err,
            });
        }
    });

    groupChat.on('chat_member', async (ctx) => {
        const newMember = ctx.chatMember.new_chat_member;
        const chatInfo = await ctx.getChat();
        LOGGER.info('[chat_member]', newMember);
        if (newMember.status === 'kicked' || newMember.status === 'left') {
            // remove user from DB
            // Remove user from group wich user has been kicked
            // await deleteUsers(newMember.user.id); // TODO: remove user from group
            LOGGER.info('[chat_member] User has been kicked or left', {
                metadata: { newMember, chatInfo },
            });
        } else if (newMember.status === 'member') {
            // add user to DB
            await addUser({
                userId: newMember.user.id,
                username: newMember.user.username,
                firstName: newMember.user.first_name,
                role: ROLES.User,
            });
        }
    });
};
