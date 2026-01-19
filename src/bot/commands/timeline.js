const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeline')
        .setDescription('Get the link to view the timeline website'),

    async execute(interaction) {
        const url = config.web.publicUrl;

        await interaction.reply({
            content: `View the full timeline at: ${url}`,
            ephemeral: true
        });
    }
};
