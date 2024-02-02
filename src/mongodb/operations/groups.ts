import { IGroup, GroupModel } from '../schemas/group.js';

export const addGroup = async ({
    groupId,
    title,
    type,
}: Pick<IGroup, 'groupId' | 'title' | 'type'>): Promise<IGroup | null> => {
    try {
        const group = await getGroupById(groupId);
        if (group) {
            return null;
        }

        const newGroup = new GroupModel({
            groupId,
            title,
            type,
        });

        const savedGroup = await newGroup.save();

        if (savedGroup?.id) {
            console.log('[addGroup][success]', { metadata: { savedGroup } });
        } else {
            console.error('[addGroup][error]', {
                metadata: { error: 'Group not saved' },
            });
        }

        return savedGroup;
    } catch (error: any) {
        console.error('[addGroup][error]', {
            metadata: { error: error, stack: error.stack?.toString() },
        });
        return null;
    }
};

export const getGroupById = async (id: number): Promise<IGroup | null> => {
    try {
        const group = await GroupModel.findOne({ groupId: id }).exec();
        if (group) {
            return group;
        } else {
            return null;
        }
    } catch (error: any) {
        console.error('[getGroupById][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

export const getAllGroups = async (): Promise<IGroup[] | null> => {
    try {
        const groups = await GroupModel.find().exec();

        return groups;
    } catch (error: any) {
        console.error('[getAllGroups][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};
