import { IUser } from '../mongodb/schemas/user.js';

export const MSG = {
    menu: {
        text: {
            start: (user: IUser) =>
                `Привіт, ${user.firstName}!\n Ти можеш керувати налаштуваннями роботи бота.\n\n`,
        },
        buttons: {
            setup: 'Назначити адмінів',
            back: '<< Назад',
            approve: '✅ Прийняти',
            add: '✅ Додати',
            update: '🔄 Оновити',
            send: '📩 Надіслати',
            cancel: '🚫 Скасувати',
            backToMain: 'До головного меню',
        },
    },
};
