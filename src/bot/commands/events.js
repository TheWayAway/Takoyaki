const { SlashCommandBuilder } = require('discord.js');
const { events } = require('../../database/events');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('events')
        .setDescription('List events from the timeline')
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('Number of events to show (default: 10)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(50))
        .addStringOption(option =>
            option.setName('before')
                .setDescription('Show events before this date (YYYY-MM-DD)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('after')
                .setDescription('Show events after this date (YYYY-MM-DD)')
                .setRequired(false)),

    async execute(interaction) {
        const count = interaction.options.getInteger('count') || 10;
        const before = interaction.options.getString('before');
        const after = interaction.options.getString('after');

        const eventList = events.getAll({
            limit: count,
            before,
            after,
            orderDesc: true
        });

        if (eventList.length === 0) {
            return interaction.reply({
                content: 'No events found.',
                ephemeral: true
            });
        }

        const lines = eventList.map(e =>
            `**[${e.id}]** \`${e.event_date}\` - ${e.title}`
        );

        const response = `**Timeline Events** (${eventList.length})\n\n${lines.join('\n')}`;

        // Discord has a 2000 character limit
        if (response.length > 2000) {
            await interaction.reply({
                content: response.substring(0, 1997) + '...',
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: response,
                ephemeral: true
            });
        }
    }
};
