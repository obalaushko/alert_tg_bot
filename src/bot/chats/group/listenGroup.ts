
import { readGroupFile } from '../../../../mock/index.js';
import { groupChat } from '../../bot.js';


export const listenGroup = async () => {
    const groups = await readGroupFile();
    groupChat.on('message:text').filter(
        async (ctx) => {
            const message = ctx.msg.text;
            console.log(message);
            if (!message) return false;
            return true;
        },
        async (ctx) => {
            const message = ctx.message.text;
            const tags = message.match(/#\w+/g);
            if (tags) {
                tags?.forEach((tag) => {
                    if ('tags' in groups) {
                        const groupTag = groups.tags.find((t) => t.tag === tag);
                        if (groupTag) {
                            // If the tag is known, respond accordingly
                            const usernames = groupTag.members
                                .map((m) => '@' + m.username)
                                .join(', ');
                            ctx.reply(`⚠️ ${usernames}`);
                        }
                    }
                });
            }
        }
    );
};
