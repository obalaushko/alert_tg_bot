import { ROLES } from '../../../constants/global.js';
import { LOGGER } from '../../../logger/index.js';
import { getAllGroups } from '../../../mongodb/operations/groups.js';
import { getUserById } from '../../../mongodb/operations/users.js';
import { BotContext } from '../../types/index.js';

export const showAllTags = async (ctx: BotContext) => {
    try {
        const {
            user: { id, is_bot },
        } = await ctx.getAuthor();
        if (is_bot) return false;

        const user =
            ctx.session?.admins?.length &&
            ctx.session.admins.find((admin) => admin.userId === id);
        if (!user) {
            const user = await getUserById(id);

            if (user && user.role !== ROLES.User) {
                ctx.session.admins = [];
                ctx.session.admins.push(user);
            } else {
                return false;
            }
        }
        const groups = await getAllGroups();
        if (!groups) return LOGGER.error('Error: groups not found');

        groups.forEach((group) => {
            // !TMP message, refactor after update mongo schema
            const tags = group.tags;
            if (tags) {
                tags.forEach((tag) => {
                    ctx.reply(
                        `Group: ${group.title}, Tag: ${tag.tag}, Title: ${tag.title}, Members: ${tag.members?.length ? tag.members.map((member) => ` @${member.username}`) : 'No members'}`
                    );
                });
            }
        });
    } catch (err) {
        LOGGER.error('[showAllTags]: ', { metadata: err });
    }
};
