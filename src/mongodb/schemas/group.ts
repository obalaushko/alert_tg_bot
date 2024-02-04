import { Document, Schema, SchemaTypes, model, Types } from 'mongoose';
import { IUser } from './user.js';

export interface ITag {
    id?: Types.ObjectId;
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
                type: SchemaTypes.ObjectId,
                default: () => new Types.ObjectId(),
            },
            title: String,
            tag: {
                type: String,
                unique: true,
                minlength: 3,
                maxlength: 20
            },
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
