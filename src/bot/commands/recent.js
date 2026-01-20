const { SlashCommandBuilder } = require('discord.js');
const { events } = require('../../database/events');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recent')
        .setDescription('View the most recent events')
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('Number of events to show (default: 5)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(20)),

    async execute(interaction) {
        const count = interaction.options.getInteger('count') || 5;

        const eventList = events.getAll({
            limit: count,
            orderDesc: true
        });

        if (eventList.length === 0) {
            return interaction.reply({
                content: 'No events found.',
                ephemeral: true
            });
        }

        const lines = eventList.map(e => {
            const dateDisplay = e.event_time
                ? `${e.event_date} ${e.event_time}`
                : e.event_date;
            return `**[${e.id}]** \`${dateDisplay}\` - ${e.title}`;
        });

        const response = `**Recent Events** (${eventList.length})\n\n${lines.join('\n')}`;

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
