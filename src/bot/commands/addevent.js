const { SlashCommandBuilder } = require('discord.js');
const { events } = require('../../database/events');
const { hasEventPermission } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addevent')
        .setDescription('Add a new event to the timeline')
        .addStringOption(option =>
            option.setName('date')
                .setDescription('Event date (YYYY-MM-DD)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Event title')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Event description')
                .setRequired(false)),

    async execute(interaction) {
        if (!hasEventPermission(interaction.member)) {
            return interaction.reply({
                content: 'You do not have permission to add events.',
                ephemeral: true
            });
        }

        const date = interaction.options.getString('date');
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return interaction.reply({
                content: 'Invalid date format. Please use YYYY-MM-DD.',
                ephemeral: true
            });
        }

        const id = events.create(date, title, description, interaction.user.id);

        await interaction.reply({
            content: `Event added with ID **${id}**\n**Date:** ${date}\n**Title:** ${title}${description ? `\n**Description:** ${description}` : ''}`,
            ephemeral: false
        });
    }
};
