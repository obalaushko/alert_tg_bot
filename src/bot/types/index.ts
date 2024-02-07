import { Context, SessionFlavor } from 'grammy';
import {
    type Conversation,
    type ConversationFlavor,
} from '@grammyjs/conversations';
import { ChatMembersFlavor } from '@grammyjs/chat-members';
import { IUser } from '../../mongodb/schemas/user.js';

interface SessionData {
    activeGroupId: number | null;
    activeTagId: string | null;
    admins: IUser[];
    userList: { users: string[] };
}
export type SessionContext = Context & SessionFlavor<SessionData>;
export type BotContext = SessionContext &
    ConversationFlavor &
    ChatMembersFlavor;
export type ConverstaionContext = Conversation<BotContext>;
