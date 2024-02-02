import { Context, SessionFlavor } from 'grammy';
import { type Conversation, type ConversationFlavor } from '@grammyjs/conversations';
import { ChatMembersFlavor } from '@grammyjs/chat-members';

interface SessionData {}
export type SessionContext = Context & SessionFlavor<SessionData>;
export type BotContext = SessionContext & ConversationFlavor & ChatMembersFlavor;
export type ConverstaionContext = Conversation<BotContext>;
