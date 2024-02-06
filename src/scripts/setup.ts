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
    return fs.existsSync(envPath)
        ? fs.readFileSync(envPath, 'utf-8').split('\n')
        : [];
}

function updateOrInsertEnvVariable(
    lines: string[],
    variable: string,
    value: string
): void {
    const index = lines.findIndex((line) => line.startsWith(`${variable}=`));
    if (index !== -1) {
        lines[index] = `${variable}=${value}`;
    } else {
        lines.push(`${variable}=${value}`);
    }
}

function writeEnvironmentFile(envPath: string, lines: string[]): void {
    fs.writeFileSync(envPath, lines.join('\n'));
}

function installNpmDependencies(): Promise<void> {
    console.log('Встановлюємо npm залежності...');
    return new Promise((resolve) => {
        exec('npm install', (error, stdout, stderr) => {
            if (error) {
                console.log(
                    `Помилка при встановленні npm залежностей: ${error.message}`
                );
            } else if (stderr) {
                console.log(`Стандартна помилка: ${stderr}`);
            } else {
                console.log(`Результат: ${stdout}`);
            }
            resolve();
        });
    });
}

console.log(`\x1b[35mЦей скрипт допоможе вам налаштувати телеграм бот.\x1b[0m`);

const currentDir = findProjectRoot(__dirname);
const root = currentDir;
const envPath = path.join(root, '.env');
const readmeMD = path.join(root, 'README.md');

async function askQuestionWithDefault(
    question: string,
    defaultValue: string
): Promise<string> {
    return new Promise((resolve) => {
        rl.question(
            `${question} (default: ${defaultValue}): `,
            (answer: string) => {
                resolve(answer.trim() === '' ? defaultValue : answer);
            }
        );
    });
}

async function configureEnvironment(): Promise<void> {
    const answer = await askQuestion(
        'Чи хочете ви оновити конфігурацію оточення? (yes/no): '
    );

    if (answer.toLowerCase() === 'yes') {
        console.log(
            `Як дізнатися ADMIN_ID та GROUP_ID читайте в \x1b[34m${readmeMD}\x1b[0m`
        );

        const adminId = await askQuestionWithDefault('Введіть ADMIN_ID', '""');
        const mongoDbUser = await askQuestionWithDefault(
            'Введіть MONGO_DB_USER',
            '""'
        );
        const mongoDbPassword = await askQuestionWithDefault(
            'Введіть MONGO_DB_PASSWORD',
            '""'
        );
        const mongoDbHost = await askQuestionWithDefault(
            'Введіть MONGO_DB_HOST',
            '""'
        );
        const productionBotToken = await askQuestionWithDefault(
            'Введіть PRODUCTION_BOT_TOKEN',
            '""'
        );

        const envLines = readEnvironmentFile(envPath);

        updateOrInsertEnvVariable(envLines, 'ADMIN_ID', adminId);
        updateOrInsertEnvVariable(envLines, 'MONGO_DB_USER', mongoDbUser);
        updateOrInsertEnvVariable(
            envLines,
            'MONGO_DB_PASSWORD',
            mongoDbPassword
        );
        updateOrInsertEnvVariable(envLines, 'MONGO_DB_HOST', mongoDbHost);
        updateOrInsertEnvVariable(
            envLines,
            'PRODUCTION_BOT_TOKEN',
            productionBotToken
        );

        writeEnvironmentFile(envPath, envLines);

        console.log('Конфігурацію оточення завершено.');

        const npmAnswer = await askQuestion(
            'Чи хочете ви встановити npm залежності? (yes/no): '
        );

        if (npmAnswer.toLowerCase() === 'yes') {
            await installNpmDependencies();
        }
    } else {
        const npmAnswer = await askQuestion(
            'Чи хочете ви встановити npm залежності? (yes/no): '
        );

        if (npmAnswer.toLowerCase() === 'yes') {
            await installNpmDependencies();
        }
    }

    rl.close();
}

function askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

// Виклик функції для початку виконання
configureEnvironment();
