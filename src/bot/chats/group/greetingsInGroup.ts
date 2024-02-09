import moment from 'moment-timezone';

import { MSG } from '../../../constants/messages.js';
import { bot } from '../../bot.js';

export const greetingsInGroup = async () => {
    try {
        const now = moment().tz('Europe/Kiev');
        const isWeekday = now.isoWeekday() < 6;

        if (isWeekday) {
            // TMP group id
            await bot.api.sendMessage(
                -1001992031620,
                MSG.groups.greetings.static
            );

            console.log('Greetings sent!');
        }
    } catch (error) {
        console.error('Error in greetingsInGroup', error);
    }
};
