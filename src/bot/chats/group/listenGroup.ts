import { ROLES } from '../../../constants/global.js';
import {
    getAllGroups,
    updateGroup,
} from '../../../mongodb/operations/groups.js';
import { getUserById } from '../../../mongodb/operations/users.js';
import { groupChat } from '../../bot.js';
import { BotContext } from '../../types/index.js';

export const listenGroup = async () => {
    groupChat.on(['message:text', 'edit']).filter(
        async (ctx: BotContext) => {
            // ! Bot must be admin in the group
            try {
                const {
                    user: { id, is_bot },
                } = await ctx.getAuthor();
                if (is_bot) return false;
                const message = ctx.msg?.text;
                if (!message) return false;
                if (!message.match(/#\w+/g)) return false;

                const user =
                    ctx.session?.admins?.length &&
                    ctx.session.admins.find((admin) => admin.userId === id);
                if (user) {
                    return true;
                } else {
                    const user = await getUserById(id); //

                    if (user && user.role !== ROLES.User) {
                        ctx.session.admins = [];
                        ctx.session.admins.push(user);
                        return true;
                    } else {
                        return false;
                    }
                }
            } catch (err) {
                console.error(err);
                return false;
            }
        },
        async (ctx: BotContext) => {
            const groups = await getAllGroups();
            const uniqueUsers = new Set<string>();
            if (!groups) return console.error('Error: Groups are not defined');
            const message = ctx.msg?.text || ctx.message?.text;
            if (!message) return console.error('Error: Message is not defined');
            const tagsMatch = message.match(/#\w+/g);

            const messageId = ctx.message?.message_id || ctx.msg?.message_id;

            groups.forEach((group) => {
                if (tagsMatch) {
                    tagsMatch?.forEach((tag) => {
                        if ('tags' in group) {
                            const groupTag =
                                group.tags &&
                                group.tags.find((t) => t.tag === tag);
                            if (groupTag) {
                                // If the tag is known, respond accordingly
                                if (groupTag.members?.length) {
                                    groupTag.members.forEach((m) => {
                                        uniqueUsers.add('@' + m.username);
                                    });
                                }
                            }
                        }
                    });
                }
            });
            // Send message to the group
            if (uniqueUsers.size) {
                const usernames = [...uniqueUsers].join(', ');
                try {
                    await ctx.reply(usernames, {
                        reply_to_message_id: messageId,
                    });
                } catch (err) {
                    console.error('Error: Send message to the group', err);
                }
            }
        }
    );
    groupChat.on('message:migrate_to_chat_id', async (ctx) => {
        console.log('Update Group after migration to supergroup')
        const group = await ctx.getChat();

        const newGroupId = ctx.message.migrate_to_chat_id;

        await updateGroup({
            id: group.id,
            newGroupId: newGroupId,
            newType: 'supergroup',
        });
    });
};
