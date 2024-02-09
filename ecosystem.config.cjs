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
      post_update: [
        'git pull',
        'npm run build',
      ],
      output: './logs/out.log',
      error: './logs/error.log'
    },
  ],
};
