import { Document, Schema, SchemaTypes, model, Types } from 'mongoose';
import { IUser } from './user.js';

export interface IGroup extends Document {
    groupId: number;
    title: string;
    type?: string;
    tags?: {
        title: string;
        tag: string;
        members?: Types.ObjectId[] | IUser[] | null;
    }[];
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
            title: String,
            tag: String,
            members: [
                {
                    type: SchemaTypes.ObjectId,
                    ref: 'User',
                },
            ],
        },
    ],
    membersCount: {
        type: Number,
    },
});

export const GroupModel = model<IGroup>('Group', groupSchema);
