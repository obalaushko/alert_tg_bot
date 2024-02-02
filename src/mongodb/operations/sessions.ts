import { ISession, SessionModel } from '../schemas/sessions.js';

export const getSession = async (): Promise<ISession[] | null> => {
    try {
        const users = await SessionModel.find().exec();

        return users;
    } catch (error: any) {
        console.error('[getSession][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};
