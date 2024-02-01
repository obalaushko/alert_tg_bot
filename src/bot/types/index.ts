import { Context, SessionFlavor } from 'grammy';
import {
    type Conversation,
    type ConversationFlavor,
} from '@grammyjs/conversations';

interface SessionData {
    config: {
        test: string
    }
}
export type SessionContext = Context & SessionFlavor<SessionData>;
export type BotContext = SessionContext & ConversationFlavor;
export type ConverstaionContext = Conversation<BotContext>;