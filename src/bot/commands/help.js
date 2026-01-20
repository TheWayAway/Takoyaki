const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List all available commands'),

    async execute(interaction) {
        const commands = [
            { name: '/addevent', description: 'Add a new event to the timeline' },
            { name: '/editevent', description: 'Edit an existing event' },
            { name: '/deleteevent', description: 'Delete an event from the timeline' },
            { name: '/events', description: 'List events with filters (count, before, after)' },
            { name: '/recent', description: 'View the most recent events' },
            { name: '/timeline', description: 'Get the link to view the timeline website' },
            { name: '/config', description: 'Configure bot settings (admin only)' },
            { name: '/help', description: 'Show this help message' }
        ];

        const lines = commands.map(cmd => `**${cmd.name}** - ${cmd.description}`);
        const response = `**Available Commands**\n\n${lines.join('\n')}`;

        await interaction.reply({
            content: response,
            ephemeral: true
        });
    }
};
