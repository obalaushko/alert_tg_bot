import moment from 'moment-timezone';
import * as dotenv from 'dotenv';

import { MSG } from '../../../constants/messages.js';
import { bot } from '../../bot.js';

dotenv.config();

export const greetingsInGroup = async () => {
    try {
        const now = moment().tz('Europe/Kiev');
        const isWeekday = now.isoWeekday() < 6;
        const GROUP_ID = process.env.GROUP_ID || '';

        if (!GROUP_ID) {
            console.error('Error: GROUP_ID is not defined');
            return;
        }

        if (isWeekday) {
            // TMP group id
            await bot.api.sendMessage(GROUP_ID, MSG.groups.greetings.static);

            console.log('Greetings sent!');
        }
    } catch (error) {
        console.error('Error in greetingsInGroup', error);
    }
};
