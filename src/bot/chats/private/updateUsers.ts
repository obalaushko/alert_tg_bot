import { privateChat } from '../../bot.js';

export const updateUsers = async () => {
    privateChat.command('userAdd', async (ctx) => {
        // TODO add one user to DB, find user by @username
    });
};
