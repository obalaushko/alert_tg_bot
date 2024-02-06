import { Document, Schema, model,  } from 'mongoose';
import { IUser, userSchema } from './user.js';
import { nanoid } from 'nanoid';

export interface ITag {
    id?: string;
    title: string;
    tag: string;
    members?: IUser[] | null;
}
export interface IGroup extends Document {
    groupId: number;
    title: string;
    type?: string;
    tags?: ITag[];
    membersCount?: number;
}

export const groupSchema: Schema = new Schema<IGroup>({
    groupId: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
    },
    tags: [
        {
            id: {
                type: String,
                default: () => nanoid(),
            },
            title: String,
            tag: {
                type: String,
                unique: true,
                minlength: 3,
                maxlength: 20,
            },
            members: [userSchema],
        },
    ],
    membersCount: {
        type: Number,
    },
});

export const GroupModel = model<IGroup>('Group', groupSchema);
