const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const config = require('../config');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST().setToken(config.discord.token);

(async () => {
    try {
        console.log(`Refreshing ${commands.length} application (/) commands...`);

        const data = await rest.put(
            Routes.applicationCommands(config.discord.clientId),
            { body: commands }
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
})();
