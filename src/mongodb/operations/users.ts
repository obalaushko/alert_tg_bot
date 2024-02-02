import { LOGGER } from '../../logger/index.js';
import { IUser, UserModel } from '../schemas/user.js';

export const addUser = async ({
    userId,
    username,
    role,
    firstName,
}: Pick<
    IUser,
    'userId' | 'username' | 'role' | 'firstName'
>): Promise<IUser | null> => {
    try {
        const user = await getUserById(userId);
        if (user) {
            return null;
        }

        const newUser = new UserModel({
            userId,
            username,
            role,
            firstName,
        });

        const savedUser = await newUser.save();

        if (savedUser?.id) {
            LOGGER.info('[addUser][success]', { metadata: { savedUser } });
        } else {
            LOGGER.error('[addUser][error]', {
                metadata: { error: 'User not saved' },
            });
        }

        return savedUser;
    } catch (error: any) {
        LOGGER.error('[addUser][error]', {
            metadata: { error: error, stack: error.stack?.toString() },
        });
        return null;
    }
};

export const getUserById = async (id: number): Promise<IUser | null> => {
    try {
        const user = await UserModel.findOne({ userId: id }).exec();
        if (user) {
            return user;
        } else {
            return null;
        }
    } catch (error: any) {
        LOGGER.error('[getUserById][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

export const getAllUsers = async (): Promise<IUser[] | null> => {
    try {
        const users = await UserModel.find().exec();

        return users;
    } catch (error: any) {
        LOGGER.error('[getAllUsers][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};
