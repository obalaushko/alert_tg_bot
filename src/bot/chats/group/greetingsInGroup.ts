import moment from 'moment-timezone';
import * as dotenv from 'dotenv';

import { MSG } from '../../../constants/messages.js';
import { bot } from '../../bot.js';
import { GrammyError } from 'grammy';
import {
    getGroupById,
    updateGroup,
} from '../../../mongodb/operations/groups.js';
import { LOGGER } from '../../../logger/index.js';

dotenv.config();

export const greetingsInGroup = async (groupId?: number) => {
    try {
        const now = moment().tz('Europe/Kiev');
        const isWeekday = now.isoWeekday() < 6;
        const GROUP_ID = groupId || process.env.GROUP_ID || '';

        if (!GROUP_ID) {
            LOGGER.error('Error: GROUP_ID/groupId is not defined');
            return;
        }

        if (isWeekday) {
            // TMP group id
            await bot.api.sendMessage(GROUP_ID, MSG.groups.greetings.static);

            LOGGER.info('Greetings sent!');
        }
    } catch (error) {
        LOGGER.error('Error in greetingsInGroup', { metadata: error });
        if (error instanceof GrammyError) {
            if (error.parameters.migrate_to_chat_id) {
                LOGGER.info('Update group after Error migration to supergroup');
                const newGroupId = error.parameters.migrate_to_chat_id;

                const GROUP_ID = process.env.GROUP_ID || '';
                const update = await updateGroup({
                    id: Number(GROUP_ID),
                    newGroupId: newGroupId,
                    newType: 'supergroup',
                });

                if (update) {
                    greetingsInGroup(newGroupId);
                } else {
                    const group = await getGroupById(newGroupId);

                    if (group) {
                        greetingsInGroup(group.groupId);
                    }
                }
            }
        }
    }
};
