import { LOGGER } from '../../logger/index.js';
import { IGroup, GroupModel, ITag } from '../schemas/group.js';
import { IUser, UserModel } from '../schemas/user.js';

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
            LOGGER.info('[addGroup][success]', { metadata: { savedGroup } });
        } else {
            LOGGER.error('[addGroup][error]', {
                metadata: { error: 'Group not saved' },
            });
        }

        return savedGroup;
    } catch (error: any) {
        LOGGER.error('[addGroup][error]', {
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
        LOGGER.error('[getGroupById][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

interface UpdateGroupParams {
    id: number;
    newGroupId?: number;
    newType?: string;
    newTitle?: string;
}

export const updateGroup = async ({
    id,
    newGroupId,
    newType,
    newTitle,
}: UpdateGroupParams): Promise<IGroup | null> => {
    try {
        const group = await GroupModel.findOneAndUpdate(
            { groupId: id },
            { groupId: newGroupId, type: newType, title: newTitle },
            { new: true }
        ).exec();

        if (group) {
            LOGGER.info('[updateGroup][success]', { metadata: { group } });
            return group;
        } else {
            LOGGER.error(`[updateGroup][error]: Group with ${id} not found`);
            return null;
        }
    } catch (error: any) {
        LOGGER.error('[updateGroup][error]', {
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
        LOGGER.error('[getAllGroups][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

export const addTagToGroup = async ({
    groupId,
    tagTitle,
    tag,
}: {
    groupId: IGroup['groupId'];
    tagTitle: string;
    tag: string;
}): Promise<ITag | null> => {
    try {
        const group = await GroupModel.findOne({ groupId });
        if (!group) {
            LOGGER.error('[addTagToGroup][error]', {
                metadata: { error: 'Group not found' },
            });
            return null;
        }

        // Перевірка на валідність тегу
        if (!/^[\p{L}\d]{3,20}$/u.test(tag)) {
            LOGGER.error('[addTagToGroup][error]', {
                metadata: { error: 'Invalid tag' },
            });
            return null;
        }

        group.tags && group.tags.push({ title: tagTitle, tag: `#${tag}` });
        const savedGroup = await group.save();

        if (savedGroup?.id && savedGroup.tags) {
            const newTag = savedGroup.tags[savedGroup.tags.length - 1];
            LOGGER.info('[addTagToGroup][success]', {
                metadata: { newTag },
            });
            return newTag;
        } else {
            LOGGER.error('[addTagToGroup][error]', {
                metadata: { error: 'Group not updated' },
            });
            return null;
        }
    } catch (error: any) {
        LOGGER.error('[addTagToGroup][error]', {
            metadata: { error: error, stack: error.stack?.toString() },
        });
        return null;
    }
};

export const addMembersToTag = async ({
    groupId,
    tagId,
    newMembers,
}: {
    groupId: number;
    tagId: string;
    newMembers: IUser[];
}): Promise<ITag | null> => {
    try {
        const group = await GroupModel.findOne({
            groupId,
        });

        if (!group || !group.tags) {
            LOGGER.error('[addMembersToTag][error]', {
                metadata: { error: 'Group not found or no tags in the group' },
            });
            return null;
        }

        const tagIndex = group.tags.findIndex((tag) => tag.id === tagId);

        if (tagIndex === -1) {
            LOGGER.error('[addMembersToTag][error]', {
                metadata: { error: 'Tag not found in the group' },
            });
            return null;
        }

        const existingMembers = group.tags[tagIndex]?.members || [];

        const duplicateMembers = newMembers.filter((newMember) =>
            existingMembers.some(
                (existingMember) => existingMember.userId === newMember.userId
            )
        );

        if (duplicateMembers.length > 0) {
            LOGGER.error('[addMembersToTag][error]', {
                metadata: {
                    error: 'Duplicate members found',
                    duplicateMembers,
                },
            });
            return null;
        }

        const updatedMembers = existingMembers.concat(newMembers);

        const update = {
            $set: {
                [`tags.${tagIndex}.members`]: updatedMembers,
            },
        };

        await GroupModel.updateOne({ groupId }, update, { upsert: true });

        LOGGER.info('[addMembersToTag][success]', {
            metadata: { groupId, tagId, newMembers },
        });

        const updatedGroup = await GroupModel.findOne({ groupId });
        const updatedTag =
            updatedGroup && updatedGroup.tags
                ? updatedGroup.tags.find((t) => t.id === tagId) || null
                : null;

        return updatedTag;
    } catch (error: any) {
        LOGGER.error('[addMembersToTag][error]', {
            metadata: { error: error, stack: error.stack?.toString() },
        });
        return null;
    }
};

export const removeUsersFromTag = async ({
    groupId,
    tagId,
    userIds,
}: {
    groupId: IGroup['groupId'];
    tagId: ITag['id'];
    userIds: IUser['userId'][];
}): Promise<IGroup | null> => {
    try {
        const group = await GroupModel.findOne({ groupId });
        if (!group) {
            LOGGER.error('[removeUsersFromTag][error]', {
                metadata: { error: 'Group not found' },
            });
            return null;
        }

        if (!group.tags) {
            LOGGER.error('[removeUsersFromTag][error]', {
                metadata: { error: 'No tags in the group' },
            });
            return null;
        }

        const tag = group.tags.find((tag) => tag.id === tagId);
        if (!tag) {
            LOGGER.error('[removeUsersFromTag][error]', {
                metadata: { error: 'Tag not found' },
            });
            return null;
        }

        if (!tag.members) {
            LOGGER.error('[removeUsersFromTag][error]', {
                metadata: { error: 'No members in the tag' },
            });
            return null;
        }

        tag.members = tag.members.filter(
            (member) => !userIds.includes(member.userId)
        );

        const updatedGroup = await group.save();

        if (updatedGroup) {
            LOGGER.info('[removeUsersFromTag][success]', {
                metadata: { updatedGroup },
            });
            return updatedGroup;
        } else {
            LOGGER.error('[removeUsersFromTag][error]', {
                metadata: { error: 'Group not updated' },
            });
            return null;
        }
    } catch (error: any) {
        LOGGER.error('[removeUsersFromTag][error]', {
            metadata: { error: error, stack: error.stack?.toString() },
        });
        return null;
    }
};

export const findAllTagsInGroup = async (
    groupId: number
): Promise<{ title: string; id: string; tag: string }[] | null> => {
    try {
        const group = await GroupModel.findOne({ groupId });

        if (!group || !group.tags) {
            LOGGER.error('[findAllTagsInGroup][error]', {
                metadata: { error: 'Group not found or no tags in the group' },
            });
            return null;
        }

        const tags = group.tags.map((item) => ({
            title: item?.title || '',
            id: item?.id || '',
            tag: item?.tag || '',
        }));

        LOGGER.info('[findAllTagsInGroup][success]', {
            metadata: { groupId, tags },
        });

        return tags;
    } catch (error: any) {
        LOGGER.error('[findAllTagsInGroup][error]', {
            metadata: { error: error, stack: error.stack?.toString() },
        });
        return null;
    }
};

export const findTagInGroup = async (
    groupId: number,
    tagId: string
): Promise<ITag | null> => {
    try {
        const group = await GroupModel.findOne({ groupId });

        if (!group || !group.tags) {
            LOGGER.error('[findTagInGroup][error]', {
                metadata: { error: 'Group not found or no tags in the group' },
            });
            return null;
        }

        const tag = group.tags.find((item) => item.id === tagId);

        if (!tag) {
            LOGGER.error('[findTagInGroup][error]', {
                metadata: { error: 'Tag not found in the group' },
            });
            return null;
        }

        const members = await UserModel.find({ _id: { $in: tag.members } });
        const result = {
            title: tag.title || '',
            id: tag.id || '',
            tag: tag.tag || '',
            members: members || [],
            memberCount: members ? members.length : 0,
        };

        LOGGER.info('[findTagInGroup][success]', {
            metadata: { groupId, tagId, result },
        });

        return result;
    } catch (error: any) {
        LOGGER.error('[findTagInGroup][error]', {
            metadata: { error: error, stack: error.stack?.toString() },
        });
        return null;
    }
};

export const deleteTag = async (
    groupId: number,
    tagId: string
): Promise<boolean> => {
    try {
        const group = await GroupModel.findOne({ groupId });

        if (!group || !group.tags) {
            LOGGER.error('[deleteTag][error]', {
                metadata: { error: 'Group not found or no tags in the group' },
            });
            return false;
        }

        const tagIndex = group.tags.findIndex((tag) => tag.id === tagId);

        if (tagIndex === -1) {
            LOGGER.error('[deleteTag][error]', {
                metadata: { error: 'Tag not found in the group' },
            });
            return false;
        }

        group.tags.splice(tagIndex, 1);
        await group.save();

        LOGGER.info('[deleteTag][success]', {
            metadata: { groupId, tagId },
        });

        return true;
    } catch (error: any) {
        LOGGER.error('[deleteTag][error]', {
            metadata: { error: error, stack: error.stack?.toString() },
        });
        return false;
    }
};

interface EditTagInput {
    groupId: number;
    tagId: string;
    newTitle: string;
    newTag: string;
}

export const editTag = async ({
    groupId,
    tagId,
    newTitle,
    newTag,
}: EditTagInput): Promise<ITag | null> => {
    try {
        const group = await GroupModel.findOne({ groupId });

        if (!group || !group.tags) {
            LOGGER.error('[editTag][error]', {
                metadata: { error: 'Group not found or no tags in the group' },
            });
            return null;
        }

        const tag = group.tags.find((tag) => tag.id === tagId);

        if (!tag) {
            LOGGER.error('[editTag][error]', {
                metadata: { error: 'Tag not found in the group' },
            });
            return null;
        }

        tag.title = newTitle;
        tag.tag = `#${newTag}`;
        await group.save();

        LOGGER.info('[editTag][success]', {
            metadata: { groupId, tagId, newTitle, newTag },
        });

        return tag;
    } catch (error: any) {
        LOGGER.error('[editTag][error]', {
            metadata: { error: error, stack: error.stack?.toString() },
        });
        return null;
    }
};

export const deleteGroup = async (groupId: number): Promise<boolean> => {
    try {
        const group = await GroupModel.findOne({ groupId });

        if (!group) {
            LOGGER.error('[deleteGroup][error]', {
                metadata: { error: `Group not found ${groupId}` },
            });
            return false;
        }

        await GroupModel.deleteOne({ groupId });

        LOGGER.info('[deleteGroup][success]', {
            metadata: { groupId },
        });

        return true;
    } catch (error: any) {
        LOGGER.error('[deleteGroup][error]', {
            metadata: { error: error, stack: error.stack?.toString() },
        });
        return false;
    }
};
