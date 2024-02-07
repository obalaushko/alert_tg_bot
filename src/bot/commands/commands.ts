interface Commands {
    command: string;
    description: string;
}

export const COMMANDS: Commands[] = [
    { command: 'start', description: 'Start interacting with the bot' },
    { command: 'loading', description: 'Loading new user list' },
];
