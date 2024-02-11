## Запуск за допомогою PM2

Для автоматизованого управління та запуску вашого Node.js проекту використовуючи PM2, виконайте наступні кроки:

### 1. Встановлення PM2 глобально

```bash
npm install -g pm2
```

2. Створення файлу ecosystem.config.cjs
   Створіть файл ecosystem.config.cjs у кореневій директорії вашого проекту та додайте вміст, замінивши 'your-app-name' на власне ім'я вашого додатку:

```javascript
module.exports = {
    apps: [
        {
            name: 'telegram_alert_bot',
            script: 'npx',
            args: 'npm run start',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PATH: '/home/deimos/.nvm/versions/node/v20.9.0/bin/:$PATH',
            },
            exec_mode: 'fork',
            exec_interpreter: 'bash',
            post_update: ['git pull', 'npm run build'],
            output: './logs/out.log',
            error: './logs/error.log',
        },
    ],
};
```

3. Запуск PM2
   Запустіть PM2 та ваш додаток за допомогою команди:

```bash
pm2 start ecosystem.config.cjs
```

4. Збереження конфігурації PM2 для автозапуску
   Після успішного запуску, використовуйте команду pm2 save, щоб зберегти конфігурацію PM2 для автозапуску при старті системи:

```bash
pm2 save
```

5. Автоматичний запуск PM2 при старті системи (опціонально)
   Використайте команду pm2 startup для налаштування автоматичного запуску PM2 при старті системи та виконайте вказану команду:

```bash
pm2 startup
```

Тепер ваш додаток повинен автоматично оновлювати git, виконувати npm run build та запускати ваш проект через PM2. Регулярно перевіряйте логи PM2 за допомогою команди pm2 logs для виявлення можливих помилок або неполадок.
