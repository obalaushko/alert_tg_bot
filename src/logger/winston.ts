import { createLogger, format, transports } from 'winston';

const { combine, timestamp, errors, colorize, printf } = format;
const errorsFormat = errors({ stack: true });

const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} ${level}: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata, null, 2)}`;
    }
    return msg;
});

const logger = createLogger({
    level: 'info',
    exitOnError: false,
    format: combine(colorize(), timestamp(), myFormat, errorsFormat),
    transports: [new transports.Console()],
});

export { logger };
