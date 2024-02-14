import { createLogger, format, transports } from 'winston';
import TelegramLogger from 'winston-telegram';

import * as dotenv from 'dotenv';
import { FORMAT_DATE, LOOGER_GROUP_ID } from '../constants/global.js';

dotenv.config();

const PRODUCTION_BOT_TOKEN = process.env.PRODUCTION_BOT_TOKEN || '';
const mode = process.env.NODE_ENV || 'development';

const { combine, timestamp, errors, colorize, printf } = format;
const errorsFormat = errors({ stack: true });

const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} ${level}: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata, null, 2)}`;
    }
    return msg;
});

const telegramTransport = new TelegramLogger({
    token: PRODUCTION_BOT_TOKEN,
    chatId: LOOGER_GROUP_ID, //https://api.telegram.org/<BOT_TOKEN>/getUpdates
    disableNotification: true,
    batchingDelay: 1000,
    parseMode: 'HTML',
    formatMessage: (info) => {
        try {
            return `<b>[${info.level}]</b> ${info.message}: <pre>${
                info.metadata ? JSON.stringify(info.metadata) : ''
            }</pre>`;
        } catch (err) {
            console.error(`[error] ${err}`);
            return `[${info.level}] ${err}`;
        }
    },
});

const logger = createLogger({
    transports: [
        new transports.File({
            level: 'error',
            filename: 'logs/app-error.log',
        }),
    ],
});

if (mode === 'production') {
    try {
        logger.add(telegramTransport); // https://logs.betterstack.com/team/218160/tail
    } catch (err) {
        console.error('[telegramTransport]', err);
    }
}

logger.add(
    new transports.Console({
        level: 'info',
        format: combine(
            colorize(),
            timestamp({ format: FORMAT_DATE }),
            myFormat,
            errorsFormat
        ),
    })
);

export { logger };
