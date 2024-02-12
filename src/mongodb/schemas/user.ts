import { Model, Schema, model } from 'mongoose';
import { ROLES } from '../../constants/global.js';

export interface IUser extends Document {
    userId: number;
    role?: (typeof ROLES)[keyof typeof ROLES];
    username?: string;
    firstName?: string;
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
});

export const UserModel: Model<IUser> = model<IUser>('User', userSchema);
