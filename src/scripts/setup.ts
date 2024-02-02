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

function findProjectRoot(currentDir: string): string {
    while (!fs.existsSync(path.join(currentDir, 'package.json'))) {
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) {
            throw new Error('Не вдалося знайти корінь проекту');
        }
        currentDir = parentDir;
    }
    return currentDir;
}

function readEnvironmentFile(envPath: string): string[] {
    return fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8').split('\n') : [];
}

function updateOrInsertEnvVariable(lines: string[], variable: string, value: string): void {
    const index = lines.findIndex(line => line.startsWith(`${variable}=`));
    if (index !== -1) {
        lines[index] = `${variable}=${value}`;
    } else {
        lines.push(`${variable}=${value}`);
    }
}

function writeEnvironmentFile(envPath: string, lines: string[]): void {
    fs.writeFileSync(envPath, lines.join('\n'));
}

function installNpmDependencies(): void {
    console.log('Встановлюємо npm залежності...');
    exec('npm install', (error, stdout, stderr) => {
        if (error) {
            console.log(`Помилка при встановленні npm залежностей: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`Стандартна помилка: ${stderr}`);
            return;
        }
        console.log(`Результат: ${stdout}`);
    });
}

console.log(`\x1b[35mЦей скрипт допоможе вам налаштувати телаграм бот.\x1b[0m`);

const currentDir = findProjectRoot(__dirname);
const root = currentDir;
const envPath = path.join(root, '.env');
const readmeMD = path.join(root, 'README.md');

rl.question('Чи хочете ви оновити конфігурацію оточення? (yes/no): ', (answer: string) => {
    if (answer.toLowerCase() === 'yes') {
        console.log(`Як дізнатися ADMIN_ID та GROUP_ID читайте в \x1b[34m${readmeMD}\x1b[0m`);
        rl.question('Введіть ADMIN_ID: ', (adminId: string) => {
            rl.question('Введіть GROUP_ID: ', (groupId: string) => {
                rl.question('Введіть MONGO_DB_USER: ', (mongoDbUser: string) => {
                    rl.question('Введіть MONGO_DB_PASSWORD: ', (mongoDbPassword: string) => {
                        rl.question('Введіть MONGO_DB_HOST: ', (mongoDbHost: string) => {
                            rl.question('Введіть PRODUCTION_BOT_TOKEN: ', (productionBotToken: string) => {
                                const envLines = readEnvironmentFile(envPath);

                                updateOrInsertEnvVariable(envLines, 'ADMIN_ID', adminId);
                                updateOrInsertEnvVariable(envLines, 'GROUP_ID', groupId);
                                updateOrInsertEnvVariable(envLines, 'MONGO_DB_USER', mongoDbUser);
                                updateOrInsertEnvVariable(envLines, 'MONGO_DB_PASSWORD', mongoDbPassword);
                                updateOrInsertEnvVariable(envLines, 'MONGO_DB_HOST', mongoDbHost);
                                updateOrInsertEnvVariable(envLines, 'PRODUCTION_BOT_TOKEN', productionBotToken);

                                writeEnvironmentFile(envPath, envLines);

                                console.log('Конфігурація оточення успішно оновленна!');

                                rl.question('Чи хочете ви оновити npm залежності? (yes/no): ', (answer: string) => {
                                    if (answer.toLowerCase() === 'yes') {
                                        installNpmDependencies();
                                    }
                                    rl.close();
                                });
                            });
                        });
                    });
                });
            });
        });
    } else {

        rl.question('Чи хочете ви оновити npm залежності? (yes/no): ', (answer: string) => {
            if (answer.toLowerCase() === 'yes') {
                installNpmDependencies();
            }
            rl.close();
        });
    }
});
