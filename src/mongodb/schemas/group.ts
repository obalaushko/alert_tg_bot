import { Model, Schema, model } from 'mongoose';

export interface IGroup extends Document {
    groupId: number;
    title: string;
    type?: string;
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
    membersCount: {
        type: Number,
    },
});

export const GroupModel: Model<IGroup> = model<IGroup>('Group', groupSchema);
