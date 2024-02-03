import * as fs from 'fs';
import * as path from 'path';

interface UserObject {
    users: string[];
}

export const readUserFile = async (): Promise<UserObject> => {
    try {
        const currentFileDirectory: string = path.dirname(
            new URL(import.meta.url).pathname
        );
        const filePath: string = path.resolve(
            currentFileDirectory,
            'users.json'
        );

        const data: string = await fs.promises.readFile(filePath, 'utf8');

        const obj: UserObject = JSON.parse(data);

        return obj;
    } catch (error) {
        console.error('Помилка при читанні файлу:', error);
        throw error;
    }
};
