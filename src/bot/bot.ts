import {
    Bot,
    GrammyError,
    HttpError,
    MemorySessionStorage,
    session,
} from 'grammy';
import { apiThrottler } from '@grammyjs/transformer-throttler';
import { limit } from '@grammyjs/ratelimiter';
import { hydrateReply, parseMode } from '@grammyjs/parse-mode';
import type { ParseModeFlavor } from '@grammyjs/parse-mode';
import { chatMembers } from '@grammyjs/chat-members';
import { type ChatMember } from 'grammy/types';

import { globalConfig, groupConfig, outConfig } from './limitsConfig.js';
import { BotContext } from './types/index.js';
import { COMMANDS } from './commands/index.js';
import * as dotenv from 'dotenv';

import { BOT_RIGHTS } from '../constants/global.js';
import { mainMenu } from './menu/start.menu.js';
import { addGroup } from '../mongodb/operations/groups.js';

dotenv.config();

//Env vars
const mode = process.env.NODE_ENV || 'development';
const BOT_TOKEN =
    mode === 'production'
        ? process.env.PRODUCTION_BOT_TOKEN || ''
        : process.env.DEVELOPMENT_BOT_TOKEN || '';

//BOT CONFIG
const bot = new Bot<ParseModeFlavor<BotContext>>(BOT_TOKEN);

const throttler = apiThrottler({
    global: globalConfig,
    group: groupConfig,
    out: outConfig,
});

bot.api.setMyCommands([], { scope: { type: 'all_group_chats' } });
bot.api.setMyCommands(COMMANDS, { scope: { type: 'all_private_chats' } });

bot.use(hydrateReply);
bot.api.config.use(throttler);
bot.api.config.use(parseMode('HTML')); // Sets default parse_mode for ctx.reply
bot.api.setMyDefaultAdministratorRights({
    // https://core.telegram.org/bots/api#chatadministratorrights
    rights: BOT_RIGHTS,
});

bot.use(
    session({
        initial: () => ({}),
    })
);

bot.use(
    limit({
        // Allow only 3 messages to be handled every 2 seconds.
        timeFrame: 2000,
        limit: 3,

        // This is called when the limit is exceeded.
        onLimitExceeded: async (ctx) => {
            if (ctx.chat?.type === 'private') {
                await ctx.reply(
                    'Please refrain from sending too many requests!'
                );
            }
        },

        // Note that the key should be a number in string format such as "123456789".
        keyGenerator: (ctx) => {
            return ctx.from?.id.toString();
        },
    })
);

bot.use(mainMenu);

export const privateChat = bot.chatType('private');
export const groupChat = bot.chatType(['group', 'supergroup']);

// check group and update data
const adapter = new MemorySessionStorage<ChatMember>();
bot.use(chatMembers(adapter));

//START COMMAND
bot.command('start', async (ctx) => {
    const { user } = await ctx.getAuthor();
    if (user.is_bot) return;
    try {
        console.log(ctx.chat.id);
        const chatMember = await ctx.chatMembers.getChatMember();
        console.log(chatMember);
    } catch (err) {
        console.error(err);
    }
});

groupChat.on('message:new_chat_members:is_bot', async (ctx) => {
    try {
        const botInfo = await bot.api.getMe();
        const chatInfo = await ctx.getChat();
        console.log('Chat info', chatInfo);

        console.log('Bot info', botInfo);

        // find user with ADMIN_ID
        try {
            const ADMIN_ID = Number(process.env.ADMIN_ID) || 0;
            const adminUser = await ctx.getChatMember(ADMIN_ID);

            console.log('Admin user info', adminUser);

            if (adminUser.status === 'creator') {
                // save group to DB
                if ('title' in chatInfo) {
                    await addGroup({
                        groupId: chatInfo.id,
                        title: chatInfo.title,
                        type: chatInfo.type,
                    });
                }
            } else {
                // remove bot from group
                try {
                    if (chatInfo.type === 'supergroup') {
                        await bot.api.unbanChatMember(chatInfo.id, botInfo.id);
                    } else {
                        await bot.api.banChatMember(chatInfo.id, botInfo.id);
                    }
                    console.log('Bot leave the group!');
                } catch (err) {
                    console.error('Error remove bot', err);
                }
            }
        } catch (err) {
            console.error('Error find admin', err);
        }
    } catch (err) {
        console.error('Error in message:new_chat_members:is_bot', err);
    }
});

groupChat.command('remove', async (ctx) => {
    const { id } = await bot.api.getMe();

    await bot.api.unbanChatMember(-1001992031620, id);
});

//CRASH HANDLER
bot.catch((err) => {
    const ctx = err.ctx;
    console.error(
        `[bot-catch][Error while handling update ${ctx.update.update_id}]`,
        { metadata: err.error }
    );
    const e = err.error;

    if (e instanceof GrammyError) {
        console.error(`[bot-catch][Error in request ${ctx.update.update_id}]`, {
            metadata: e.message,
            stack: e.stack,
        });
    } else if (e instanceof HttpError) {
        console.error(`[bot-catch][Error in request ${ctx.update.update_id}]`, {
            metadata: e.error,
            stack: e.stack,
        });
    } else {
        console.error(`[bot-catch][Error in request ${ctx.update.update_id}]`, {
            metadata: e,
        });
    }
});

export { bot };
