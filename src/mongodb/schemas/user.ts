import { Model, Schema, SchemaTypes, model } from "mongoose";
import { ROLES } from "../../constants/global.js";
import { IGroup } from "./group.js";

export interface IUser extends Document {
    userId: number;
    role?: (typeof ROLES)[keyof typeof ROLES];
    username?: string;
    firstName?: string;
    groupLink?: IGroup | null
}

export const userSchema: Schema = new Schema<IUser>({
    userId: {
        type: Number,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: false,
        unique: true,
    },
    role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.User,
    },
    firstName: {
        type: String,
        required: false,
    },
    groupLink: {
        type: SchemaTypes.ObjectId,
        ref: 'Group',
    },
});

export const UserModel: Model<IUser> = model<IUser>('User', userSchema);