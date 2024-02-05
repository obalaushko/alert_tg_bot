import * as fs from 'fs';
import * as path from 'path';

interface UserObject {
    users: string[];
}
interface Member {
    id: number;
    username: string;
    admin: boolean;
}

interface Tag {
    id: string;
    title: string;
    tag: string;
    members: Member[];
}

interface Group {
    id: number;
    members: Member[];
    tags: Tag[];
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

export const readGroupFile = async (): Promise<Group> => {
    try {
        const currentFileDirectory: string = path.dirname(
            new URL(import.meta.url).pathname
        );
        const filePath: string = path.resolve(
            currentFileDirectory,
            'groups.json'
        );

        const data: string = await fs.promises.readFile(filePath, 'utf8');

        const obj: Group = JSON.parse(data);

        return obj;
    } catch (error) {
        console.error('Помилка при читанні файлу:', error);
        throw error;
    }
};

export const writeUserFile = async (userObject: UserObject): Promise<void> => {
    try {
        const currentFileDirectory: string = path.dirname(
            new URL(import.meta.url).pathname
        );
        const filePath: string = path.resolve(
            currentFileDirectory,
            'users.json'
        );

        const data: string = JSON.stringify(userObject);

        await fs.promises.writeFile(filePath, data, 'utf8');
    } catch (error) {
        console.error('Помилка при запису в файл:', error);
        throw error;
    }
};

interface GroupObject {
    id: number;
    members: { id: number; username: string, admin: boolean }[];
    tags: {
        id: string;
        title: string;
        tag: string;
        members: { id: number; username: string, admin: boolean }[];
    }[];
}

export const writeGroupFile = async (
    groupObject: GroupObject
): Promise<void> => {
    try {
        const currentFileDirectory: string = path.dirname(
            new URL(import.meta.url).pathname
        );
        const filePath: string = path.resolve(
            currentFileDirectory,
            'groups.json'
        );

        const data: string = JSON.stringify(groupObject);

        await fs.promises.writeFile(filePath, data, 'utf8');
    } catch (error) {
        console.error('Помилка при запису в файл:', error);
        throw error;
    }
};
