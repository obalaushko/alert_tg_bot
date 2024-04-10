interface Commands {
    command: string;
    description: string;
}

export const COMMANDS: Commands[] = [
    { command: 'start', description: 'Start interacting with the bot' },
    { command: 'loading', description: 'Loading new user list' },
    { command: 'alltags', description: 'Show all tags in group' },
    { command: 'greetings', description: 'Greetings in group' },
];
