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
        const group = await getGroupById(groupId);
        for (const idOrUsername of idsOrUsernames) {
            try {
                const user = await bot.api.getChat(idOrUsername);
                if (user.id !== botId) {
                    if ('username' in user && 'first_name' in user) {
                        users.push({
                            userId: user.id,
                            username: user.username,
                            firstName: user.first_name,
                            groupLink: group,
                        } as IUser);
                    } else {
                        users.push({
                            userId: user.id,
                            groupLink: group,
                        } as IUser);
                    }
                }
            } catch (error) {
                console.error(`Failed to get user ${idOrUsername}: `, error);
            }
        }
        return users;
    } catch (err) {
        console.error('Failed to get group', err);
    }
}
