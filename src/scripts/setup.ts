import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let currentDir = __dirname;
while (!fs.existsSync(path.join(currentDir, 'package.json'))) {
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
        throw new Error('Не вдалося знайти корінь проекту');
    }
    currentDir = parentDir;
}

const root = currentDir;
const envPath = path.join(root, '.env');
const readmeMD = path.join(root, 'README.md');

console.log(`\x1b[35mЦей скрипт допоможе вам налаштувати телаграм бот.\x1b[0m`);

rl.question(
    'Чи хочете ви ввести ADMIN_ID та GROUP_ID? (yes/no): ',
    (answer: string) => {
        if (answer.toLowerCase() === 'yes') {
            console.log(
                `Як дізнатися ADMIN_ID та GROUP_ID читайте в \x1b[34m${readmeMD}\x1b[0m`
            );
            rl.question('Введіть ADMIN_ID: ', (adminId: string) => {
                rl.question('Введіть GROUP_ID: ', (groupId: string) => {
                    let env = fs.existsSync(envPath)
                        ? fs.readFileSync(envPath, 'utf-8')
                        : '';
                    let lines = env.split('\n');

                    let adminIdExists = false;
                    let groupIdExists = false;

                    lines = lines.map((line) => {
                        if (line.startsWith('ADMIN_ID=')) {
                            adminIdExists = true;
                            return `ADMIN_ID=${adminId}`;
                        } else if (line.startsWith('GROUP_ID=')) {
                            groupIdExists = true;
                            return `GROUP_ID=${groupId}`;
                        } else {
                            return line;
                        }
                    });

                    if (!adminIdExists) {
                        lines.push(`ADMIN_ID=${adminId}`);
                    }

                    if (!groupIdExists) {
                        lines.push(`GROUP_ID=${groupId}`);
                    }

                    env = lines.join('\n');
                    fs.writeFileSync(envPath, env);
                    console.log(
                        'ADMIN_ID та GROUP_ID були успішно записані в .env файл.'
                    );

                    rl.question(
                        'Чи хочете ви встановити npm залежності? (yes/no): ',
                        (answer: string) => {
                            if (answer.toLowerCase() === 'yes') {
                                console.log('Встановлюємо npm залежності...');
                                exec('npm install', (error, stdout, stderr) => {
                                    if (error) {
                                        console.log(
                                            `Помилка при встановленні npm залежностей: ${error.message}`
                                        );
                                        return;
                                    }
                                    if (stderr) {
                                        console.log(
                                            `Стандартна помилка: ${stderr}`
                                        );
                                        return;
                                    }
                                    console.log(`Результат: ${stdout}`);
                                });
                            }

                            rl.close();
                        }
                    );
                });
            });
        } else {
            console.log('Пропускаємо крок введення ADMIN_ID та GROUP_ID.');

            rl.question(
                'Чи хочете ви встановити npm залежності? (yes/no): ',
                (answer: string) => {
                    if (answer.toLowerCase() === 'yes') {
                        console.log('Встановлюємо npm залежності...');
                        exec('npm install', (error, stdout, stderr) => {
                            if (error) {
                                console.log(
                                    `Помилка при встановленні npm залежностей: ${error.message}`
                                );
                                return;
                            }
                            if (stderr) {
                                console.log(`Стандартна помилка: ${stderr}`);
                                return;
                            }
                            console.log(`Результат: ${stdout}`);
                        });
                    }

                    rl.close();
                }
            );
        }
    }
);
