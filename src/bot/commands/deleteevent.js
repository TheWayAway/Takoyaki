const { SlashCommandBuilder } = require('discord.js');
const { events } = require('../../database/events');
const { hasEventPermission } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deleteevent')
        .setDescription('Delete an event from the timeline')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('Event ID to delete')
                .setRequired(true)),

    async execute(interaction) {
        if (!hasEventPermission(interaction.member)) {
            return interaction.reply({
                content: 'You do not have permission to delete events.',
                ephemeral: true
            });
        }

        const id = interaction.options.getInteger('id');
        const event = events.getById(id);

        if (!event) {
            return interaction.reply({
                content: `Event with ID ${id} not found.`,
                ephemeral: true
            });
        }

        events.delete(id);

        await interaction.reply({
            content: `Event **${id}** deleted: \`${event.event_date}\` - ${event.title}`,
            ephemeral: true
        });
    }
};
