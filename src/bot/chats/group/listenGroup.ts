import { ROLES } from '../../../constants/global.js';
import { LOGGER } from '../../../logger/index.js';
import {
    getGroupById,
    updateGroup,
} from '../../../mongodb/operations/groups.js';
import { getUserById } from '../../../mongodb/operations/users.js';
import { groupChat } from '../../bot.js';
import { BotContext } from '../../types/index.js';

export const listenGroup = async () => {
    groupChat.on(['message::hashtag', 'edit::hashtag']).filter(
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
                LOGGER.error({ metadata: err });
                return false;
            }
        },
        async (ctx: BotContext) => {
            const { id } = await ctx.getChat();

            const group = await getGroupById(id);

            const uniqueUsers = new Set<string>();
            if (!group)
                return LOGGER.error(`Error: group with id ${id} not found`);
            const message = ctx.msg?.text || ctx.message?.text;
            if (!message) return LOGGER.error('Error: Message is not defined');
            const tagsMatch = message.match(/#\w+/g);

            const messageId = ctx.message?.message_id || ctx.msg?.message_id;

            if (tagsMatch) {
                tagsMatch?.forEach((tag) => {
                    if ('tags' in group) {
                        const groupTag =
                            group.tags && group.tags.find((t) => t.tag === tag);
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

            // Send message to the group
            if (uniqueUsers.size) {
                const usernames = [...uniqueUsers].join(', ');
                try {
                    await ctx.reply(usernames, {
                        reply_to_message_id: messageId,
                    });
                } catch (err) {
                    LOGGER.error('Error: Send message to the group', {
                        metadata: err,
                    });
                }
            }
        }
    );
    groupChat.on(':migrate_to_chat_id', async (ctx) => {
        const { id } = await ctx.getChat();

        const newGroupId = ctx.message.migrate_to_chat_id;

        LOGGER.info('Update Group after migration to supergroup', {
            metadata: { oldGroupId: id, newGroupId: newGroupId },
        });

        await updateGroup({
            id: id,
            newGroupId: newGroupId,
            newType: 'supergroup',
        });
    });
};
