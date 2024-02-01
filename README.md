# Основний функціонал
Бот повиннен позначати (тегати) людей в групі щоб вони звернули увагу на пріорітетне повідомлення.

## Попередній workflow
Бот додається до групи, аналізує учасників групи, додає їх в БД, адміну групи або ж модератору(якщо такий є) дає відповідну роль, адміну потрібно почати взаємодію з ботом (бот в телеграмі не може писати перший) щоб розділити людей на групи, після чого бот пасивно відслідковує повідомлення чекаючи сигналу тегнути людей

---

### Як дізнатися id групи?
Ви можете дізнатися ID групи в Telegram, використовуючи веб-версію Telegram. Ось як це зробити:

1. Відкрийте веб-версію Telegram в браузері.
2. Клацніть правою кнопкою миші на назву групи в лівому меню¹.
3. Клацніть кнопку 'Inspect'.
4. Ви побачите ID групи в атрибуті `data-peer-id="-xxxxxxxxxx"` або `peer="-xxxxxxxxxx"`.

Або ж ви можете просто відкрити потрібну групу в веб-версії Telegram і подивитися на URL. Це буде щось на зразок `https://web.telegram.org/z/xxxxxxxxxx`, де `xxxxxxxxxx` - це ID групи.

Зверніть увагу, що ці методи повертають ID групи як від'ємне число. Це нормально, Telegram використовує від'ємні числа для позначення ID груп.