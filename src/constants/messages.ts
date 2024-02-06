import { IGroup, ITag } from '../mongodb/schemas/group.js';

export const MSG = {
    conversations: {
        chooseTagName:
            'Введи коротку назву тегу по якому бот буде розуміти що потрібно застосувати сповіщення.\n\nВказувати потрібно без будь яких спец символів.\nНаприклад: <i>all</i>, <i>admin</i>. Кінцевий результат буде #all, #admin, саме за таким тегом бот буде розуміти що потрібно застосувати сповіщення.\nСкасувати введення можна командою /cancel',
        chooseTagTitle:
            'Введи симантичну назву тегу, щоб розуміти про що цей тег.\n\nНаприклад: <i>Ввіділ маркетингу</i>\nСкасувати введення можна командою /cancel',
        leaveConversation: 'Розмову завершено.',
        invalidInput:
            'Введіть назву тегу від 3 до 20 символів, не використовуючи спец символів!',
        chooseMemberToAddTag: (title: string) =>
            `Вибери користувачів яких хочеш додати до щойно створеного тегу <b>${title}</b>.`,
        tagCreated: 'Тег успішно створено!',
        tagUpdated: 'Тег успішно оновлено!',
    },
    menu: {
        text: {
            selectActions: (tag: ITag) =>
                `Інформація про тег:\n\nНазва тегу: <b>${
                    tag.title
                }</b>\nСимвольний тег: <b>${
                    tag.tag
                }</b>\nКількість користувачів: <b>${
                    tag.members?.length || 0
                }</b>\n\n${
                    tag.members?.length
                        ? tag.members
                              .map(
                                  (user) =>
                                      `@${user.username}` || user.firstName
                              )
                              .join(', ')
                        : ''
                }`,
            start: `Привіт, ти можеш керувати налаштуваннями роботи бота.\n\n`,
            setupAdmin:
                'Ти можеш вибрати кому з користувачів групи надати або позбавити ролі admin\n\nРоль admin дозволяє взаємодіяти з ботом, та бот буде слідкувати за повідомленнями адмінів в групі.',
            setupTag: (group: IGroup) =>
                `Інформація про групу:\n\nНазва групи: <b>${
                    group.title
                }</b>\nТип групи: <b>${group.type}</b>\nId групи: ${
                    group.groupId
                }\nКількість тегів: <b>${group.tags?.length || 0}</b>\n\n${
                    group.tags?.length
                        ? group.tags.map((tag) => `${tag.tag}`).join(', ')
                        : ''
                }`,
            addAdmin: 'Вибери кому дати роль адміна',
            removeAdmin: 'Вибери у кого забрати роль адміна',
            chooseGroupToUpdate:
                'Вибери групу для якої потрібно створити/оновити/видалити теги.',
            chooseTagToUpdate: 'Вибери тег який потрібно оновити.',
            chooseTagToRemove: 'Вибери тег який потрібно видалити.',
            sessionDeprecated: 'Сесія застаріла, спробуйте ще раз.',
            selsectUserToAdd: 'Вибери користувача якого хочеш додати до тегу.',
            selsectUserToRemove:
                'Вибери користувача якого хочеш видалити з тегу.',
            usersNotFound: 'Користувачі не знайдені.',
            tagRemoded: 'Тег успішно видалено.',
        },
        buttons: {
            setupAdmins: 'Адміни',
            addAdmin: 'Додати адміна',
            removeAdmin: 'Видалити адміна',
            setupTags: 'Теги',
            back: '⬅️ Назад',
            approve: '✅ Прийняти',
            add: '✅ Додати',
            update: '🔄 Оновити',
            send: '📩 Надіслати',
            cancel: '🚫 Скасувати',
            cancelEdit: 'Редагування скасовано.',
            backToMainMenu: 'До головного меню',
        },
        keyboards: {
            createTag: '🏷️ Створити тег',
            updateTag: '✏️ Редагувати тег',
            removeTag: '🗑️ Видалити тег',
            backToMainKeyboard: '🏠 До головного меню',
            editTagName: '✏️ Редагувати назву',
            removeUserFromTag: '🗑️ Видалити юзера',
            addUserToTag: '✅ Додати юзера',
            back: '⬅️ Назад',
        },
    },
    errors: {
        forbidden: 'Дія заборонена.',
        accessDenied: 'У доступі відмовленно.',
    },
};
