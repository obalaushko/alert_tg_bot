import { LOGGER } from '../../logger/index.js';
import { getGroupById } from '../../mongodb/operations/groups.js';
import { IUser } from '../../mongodb/schemas/user.js';
import { bot } from '../bot.js';

export async function findUserInGroup(
    groupId: number,
    botId: number,
    idsOrUsernames: (number | string)[]
) {
    const users: IUser[] = [];
    try {
        const group = await getGroupById(groupId); // TODO
        for (const idOrUsername of idsOrUsernames) {
            try {
                const user = await bot.api.getChat(idOrUsername);
                if (user.id !== botId) {
                    if ('username' in user && 'first_name' in user) {
                        users.push({
                            userId: user.id,
                            username: user.username,
                            firstName: user.first_name,
                        } as IUser);
                    } else {
                        users.push({
                            userId: user.id,
                        } as IUser);
                    }
                }
            } catch (error) {
                LOGGER.error(`Failed to get user ${idOrUsername}: `, {
                    metadata: error,
                });
            }
        }
        return users;
    } catch (err) {
        LOGGER.error('Failed to get group', { metadata: err });
    }
}
