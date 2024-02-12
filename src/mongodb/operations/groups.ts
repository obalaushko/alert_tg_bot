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
            console.error('[addTagToGroup][error]', {
                metadata: { error: 'Group not found' },
            });
            return null;
        }

        // Перевірка на валідність тегу
        if (!/^[\p{L}\d]{3,20}$/u.test(tag)) {
            console.error('[addTagToGroup][error]', {
                metadata: { error: 'Invalid tag' },
            });
            return null;
        }

        group.tags && group.tags.push({ title: tagTitle, tag: `#${tag}` });
        const savedGroup = await group.save();

        if (savedGroup?.id && savedGroup.tags) {
            const newTag = savedGroup.tags[savedGroup.tags.length - 1];
            console.log('[addTagToGroup][success]', {
                metadata: { newTag },
            });
            return newTag;
        } else {
            console.error('[addTagToGroup][error]', {
                metadata: { error: 'Group not updated' },
            });
            return null;
        }
    } catch (error: any) {
        console.error('[addTagToGroup][error]', {
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
            console.error('[addMembersToTag][error]', {
                metadata: { error: 'Group not found or no tags in the group' },
            });
            return null;
        }

        const tagIndex = group.tags.findIndex((tag) => tag.id === tagId);

        if (tagIndex === -1) {
            console.error('[addMembersToTag][error]', {
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
            console.error('[addMembersToTag][error]', {
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

        console.log('[addMembersToTag][success]', {
            metadata: { groupId, tagId, newMembers },
        });

        const updatedGroup = await GroupModel.findOne({ groupId });
        const updatedTag =
            updatedGroup && updatedGroup.tags
                ? updatedGroup.tags.find((t) => t.id === tagId) || null
                : null;

        return updatedTag;
    } catch (error: any) {
        console.error('[addMembersToTag][error]', {
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
            console.error('[removeUsersFromTag][error]', {
                metadata: { error: 'Group not found' },
            });
            return null;
        }

        if (!group.tags) {
            console.error('[removeUsersFromTag][error]', {
                metadata: { error: 'No tags in the group' },
            });
            return null;
        }

        const tag = group.tags.find((tag) => tag.id === tagId);
        if (!tag) {
            console.error('[removeUsersFromTag][error]', {
                metadata: { error: 'Tag not found' },
            });
            return null;
        }

        if (!tag.members) {
            console.error('[removeUsersFromTag][error]', {
                metadata: { error: 'No members in the tag' },
            });
            return null;
        }

        tag.members = tag.members.filter(
            (member) => !userIds.includes(member.userId)
        );

        const updatedGroup = await group.save();

        if (updatedGroup) {
            console.log('[removeUsersFromTag][success]', {
                metadata: { updatedGroup },
            });
            return updatedGroup;
        } else {
            console.error('[removeUsersFromTag][error]', {
                metadata: { error: 'Group not updated' },
            });
            return null;
        }
    } catch (error: any) {
        console.error('[removeUsersFromTag][error]', {
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
            console.error('[findAllTagsInGroup][error]', {
                metadata: { error: 'Group not found or no tags in the group' },
            });
            return null;
        }

        const tags = group.tags.map((item) => ({
            title: item?.title || '',
            id: item?.id || '',
            tag: item?.tag || '',
        }));

        console.log('[findAllTagsInGroup][success]', {
            metadata: { groupId, tags },
        });

        return tags;
    } catch (error: any) {
        console.error('[findAllTagsInGroup][error]', {
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
            console.error('[findTagInGroup][error]', {
                metadata: { error: 'Group not found or no tags in the group' },
            });
            return null;
        }

        const tag = group.tags.find((item) => item.id === tagId);

        if (!tag) {
            console.error('[findTagInGroup][error]', {
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

        console.log('[findTagInGroup][success]', {
            metadata: { groupId, tagId, result },
        });

        return result;
    } catch (error: any) {
        console.error('[findTagInGroup][error]', {
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
            console.error('[deleteTag][error]', {
                metadata: { error: 'Group not found or no tags in the group' },
            });
            return false;
        }

        const tagIndex = group.tags.findIndex((tag) => tag.id === tagId);

        if (tagIndex === -1) {
            console.error('[deleteTag][error]', {
                metadata: { error: 'Tag not found in the group' },
            });
            return false;
        }

        group.tags.splice(tagIndex, 1);
        await group.save();

        console.log('[deleteTag][success]', {
            metadata: { groupId, tagId },
        });

        return true;
    } catch (error: any) {
        console.error('[deleteTag][error]', {
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
            console.error('[editTag][error]', {
                metadata: { error: 'Group not found or no tags in the group' },
            });
            return null;
        }

        const tag = group.tags.find((tag) => tag.id === tagId);

        if (!tag) {
            console.error('[editTag][error]', {
                metadata: { error: 'Tag not found in the group' },
            });
            return null;
        }

        tag.title = newTitle;
        tag.tag = `#${newTag}`;
        await group.save();

        console.log('[editTag][success]', {
            metadata: { groupId, tagId, newTitle, newTag },
        });

        return tag;
    } catch (error: any) {
        console.error('[editTag][error]', {
            metadata: { error: error, stack: error.stack?.toString() },
        });
        return null;
    }
};
