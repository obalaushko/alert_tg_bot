import { Service } from 'node-windows';
import { exec } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as cron from 'node-cron';

dotenv.config();

const projectPath = process.env.PROJECT_PATH;

if (!projectPath) {
  console.error('Error: PROJECT_PATH is not specified in the .env file.');
  process.exit(1);
}

const svc = new Service({
  name: 'Hello World',
  description: 'The nodejs.org example web server.',
  script: path.join(projectPath, 'node_modules', '.bin', 'npm'),
});

// Визначення розкладу
const cronSchedule = '0 19 * * 1-5'; // Запускати о 19:00 в будні (Пн-Пт)

// Перевірка часу і запуск/вимкнення застосунку за розкладом
cron.schedule(cronSchedule, () => {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentDayOfWeek = currentTime.getDay();

  // Перевірка, чи це будній день і чи час до 19:00
  const isWeekdayAndBefore7PM = currentDayOfWeek >= 1 && currentDayOfWeek <= 5 && currentHour < 19;

  if (isWeekdayAndBefore7PM) {
    // Виконати команди для запуску застосунку
    exec('git reset --hard && git checkout main && git pull && npm run build && npm run start', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing commands: ${error}`);
        return;
      }
      console.log(`Git and npm commands executed successfully: ${stdout}`);
      svc.start();
    });
  } else {
    // Виконати команду для зупинки застосунку
    svc.stop();
  }
});

svc.on('install', function () {
  // Необхідно встановити службу тут, інакше зміни не відобразяться в планувальнику завдань
  svc.install();
});

// Запуск перевірки розкладу
cron.schedule('*/1 * * * *', () => {
  console.log('Checking schedule...');
});
