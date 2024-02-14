import { ROLES } from '../../constants/global.js';
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
            LOGGER.info(`[addUser][info] User already exists: ${userId}`);
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

export const addUsers = async (users: IUser[]): Promise<IUser[] | null> => {
    try {
        const addedUsers: IUser[] = [];

        for (const user of users) {
            const addedUser = await addUser(user);
            if (addedUser) {
                addedUsers.push(addedUser);
            }
        }

        return addedUsers.length > 0 ? addedUsers : null;
    } catch (error: any) {
        LOGGER.error('[addUsers][error]', {
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

export const getUsersByIds = async (ids: number[]): Promise<IUser[] | null> => {
    try {
        const users = await UserModel.find({ userId: { $in: ids } }).exec();
        if (users.length > 0) {
            return users;
        } else {
            return null;
        }
    } catch (error: any) {
        LOGGER.error('[getUsersByIds][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

export const getAllUsers = async (
    excludeUserIds: number[] = []
): Promise<IUser[] | null> => {
    try {
        const users = await UserModel.find({
            userId: { $nin: excludeUserIds },
        }).exec();

        return users;
    } catch (error: any) {
        LOGGER.error('[getAllUsers][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

export const getAllAdminRoles = async (): Promise<IUser[] | null> => {
    try {
        const users = await UserModel.find({ role: ROLES.Admin }).exec();

        return users;
    } catch (error: any) {
        LOGGER.error('[getAllAdminRoles][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

export const getAllUserRoles = async (): Promise<IUser[] | null> => {
    try {
        const users = await UserModel.find({ role: ROLES.User }).exec();

        return users;
    } catch (error: any) {
        LOGGER.error('[getAllUserRoles][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

export const updateUsersToAdmin = async (
    userIds: number[]
): Promise<IUser[] | null> => {
    try {
        const result = await UserModel.updateMany(
            { userId: { $in: userIds } },
            { $set: { role: 'admin' } }
        ).exec();

        if (result && result.modifiedCount > 0) {
            const users = await UserModel.find({
                userId: { $in: userIds },
            }).exec();
            return users;
        } else {
            LOGGER.error('[updateUsersToAdmin][error]', {
                metadata: { error: 'No users updated' },
            });
            return null;
        }
    } catch (error: any) {
        LOGGER.error('[updateUsersToAdmin][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

export const updateUsersToUser = async (
    userIds: number[]
): Promise<IUser[] | null> => {
    try {
        const result = await UserModel.updateMany(
            { userId: { $in: userIds } },
            { $set: { role: 'user' } }
        ).exec();

        if (result && result.modifiedCount > 0) {
            const users = await UserModel.find({
                userId: { $in: userIds },
            }).exec();
            return users;
        } else {
            LOGGER.error('[updateUsersToUser][error]', {
                metadata: { error: 'No users updated' },
            });
            return null;
        }
    } catch (error: any) {
        LOGGER.error('[updateUsersToUser][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};
