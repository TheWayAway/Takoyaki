const { SlashCommandBuilder } = require('discord.js');
const { events } = require('../../database/events');
const { hasEventPermission } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editevent')
        .setDescription('Edit an existing event')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('Event ID to edit')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('date')
                .setDescription('New date (YYYY-MM-DD)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('New title')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('New description')
                .setRequired(false)),

    async execute(interaction) {
        if (!hasEventPermission(interaction.member)) {
            return interaction.reply({
                content: 'You do not have permission to edit events.',
                ephemeral: true
            });
        }

        const id = interaction.options.getInteger('id');
        const date = interaction.options.getString('date');
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');

        if (!date && !title && description === null) {
            return interaction.reply({
                content: 'Please provide at least one field to update.',
                ephemeral: true
            });
        }

        // Validate date format if provided
        if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return interaction.reply({
                content: 'Invalid date format. Please use YYYY-MM-DD.',
                ephemeral: true
            });
        }

        const updates = {};
        if (date) updates.eventDate = date;
        if (title) updates.title = title;
        if (description !== null) updates.description = description;

        const updated = events.update(id, updates, interaction.user.id);

        if (!updated) {
            return interaction.reply({
                content: `Event with ID ${id} not found.`,
                ephemeral: true
            });
        }

        await interaction.reply({
            content: `Event **${id}** updated:\n**Date:** ${updated.event_date}\n**Title:** ${updated.title}${updated.description ? `\n**Description:** ${updated.description}` : ''}`,
            ephemeral: false
        });
    }
};
