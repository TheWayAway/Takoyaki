const { SlashCommandBuilder } = require('discord.js');
const { events } = require('../../database/events');
const { hasEventPermission } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addevent')
        .setDescription('Add a new event to the timeline')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Event title')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('date')
                .setDescription('Event date (YYYY-MM-DD) - defaults to today if not provided')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Event time (HH:MM, 24-hour format)')
                .setRequired(false))
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

        const dateInput = interaction.options.getString('date');
        const date = dateInput || new Date().toISOString().split('T')[0];
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const time = interaction.options.getString('time');

        // Validate date format if provided
        if (dateInput && !/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
            return interaction.reply({
                content: 'Invalid date format. Please use YYYY-MM-DD.',
                ephemeral: true
            });
        }

        // Validate time format if provided
        if (time && !/^\d{2}:\d{2}$/.test(time)) {
            return interaction.reply({
                content: 'Invalid time format. Please use HH:MM (24-hour format).',
                ephemeral: true
            });
        }

        const id = events.create(date, title, description, interaction.user.id, time);

        const dateTimeDisplay = time ? `${date} ${time}` : date;
        await interaction.reply({
            content: `Event added with ID **${id}**\n**Date:** ${dateTimeDisplay}\n**Title:** ${title}${description ? `\n**Description:** ${description}` : ''}`,
            ephemeral: true
        });
    }
};
