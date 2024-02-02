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

import { LOGGER } from '../logger/index.js';
import { BOT_RIGHTS } from '../constants/global.js';
import { mainMenu } from './menu/start.menu.js';
import { env } from 'process';

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
            await ctx.reply('Please refrain from sending too many requests!');
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
        const chatMember = await ctx.chatMembers.getChatMember();
        console.log(chatMember);
    } catch (err) {
        console.error(err);
    }
});


//CRASH HANDLER
bot.catch((err) => {
    const ctx = err.ctx;
    LOGGER.error(
        `[bot-catch][Error while handling update ${ctx.update.update_id}]`,
        { metadata: err.error }
    );
    const e = err.error;

    if (e instanceof GrammyError) {
        LOGGER.error(`[bot-catch][Error in request ${ctx.update.update_id}]`, {
            metadata: e.message,
            stack: e.stack,
        });
    } else if (e instanceof HttpError) {
        LOGGER.error(`[bot-catch][Error in request ${ctx.update.update_id}]`, {
            metadata: e.error,
            stack: e.stack,
        });
    } else {
        LOGGER.error(`[bot-catch][Error in request ${ctx.update.update_id}]`, {
            metadata: e,
        });
    }
});

export { bot };
