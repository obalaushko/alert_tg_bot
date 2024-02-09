import { Service } from 'node-windows';
import { exec } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const projectPath = process.env.PROJECT_PATH;

if (!projectPath) {
  console.error('Error: PROJECT_PATH is not specified in the .env file.');
  process.exit(1);
}

const svc = new Service({
  name: 'Telegram_bot',
  description: 'Add service Telegram bot (alert_bot).',
  script: path.join(projectPath, 'node_modules', '.bin', 'npm'),
});

// Виконати команди для реєстрації служби
exec('git reset --hard && git checkout main && git pull && npm run build && npm run start', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing commands: ${error}`);
    process.exit(1);
  }
  console.log(`Git and npm commands executed successfully: ${stdout}`);

  // Встановити службу після реєстрації
  svc.on('install', function () {
    // Необхідно встановити службу тут, інакше зміни не відобразяться в планувальнику завдань
    svc.install();
  });

  // Викликати подію 'install' для встановлення служби
  svc.emit('install');
});
