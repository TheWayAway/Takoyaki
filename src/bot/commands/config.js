const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { guildConfig } = require('../../database/events');
const { isAdmin } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configure bot settings')
        .addSubcommandGroup(group =>
            group.setName('roles')
                .setDescription('Manage allowed roles for event management')
                .addSubcommand(subcommand =>
                    subcommand.setName('add')
                        .setDescription('Add a role that can manage events')
                        .addRoleOption(option =>
                            option.setName('role')
                                .setDescription('Role to add')
                                .setRequired(true)))
                .addSubcommand(subcommand =>
                    subcommand.setName('remove')
                        .setDescription('Remove a role from event management')
                        .addRoleOption(option =>
                            option.setName('role')
                                .setDescription('Role to remove')
                                .setRequired(true)))
                .addSubcommand(subcommand =>
                    subcommand.setName('list')
                        .setDescription('List all allowed roles'))),

    async execute(interaction) {
        if (!isAdmin(interaction.member)) {
            return interaction.reply({
                content: 'Only administrators can manage bot configuration.',
                ephemeral: true
            });
        }

        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        if (group === 'roles') {
            const guildId = interaction.guild.id;

            if (subcommand === 'add') {
                const role = interaction.options.getRole('role');
                const roles = guildConfig.addRole(guildId, role.id);

                await interaction.reply({
                    content: `Role **${role.name}** can now manage events.\nAllowed roles: ${roles.length}`,
                    ephemeral: true
                });
            } else if (subcommand === 'remove') {
                const role = interaction.options.getRole('role');
                const roles = guildConfig.removeRole(guildId, role.id);

                await interaction.reply({
                    content: `Role **${role.name}** can no longer manage events.\nAllowed roles: ${roles.length}`,
                    ephemeral: true
                });
            } else if (subcommand === 'list') {
                const config = guildConfig.get(guildId);
                const roleIds = config.allowed_roles;

                if (roleIds.length === 0) {
                    return interaction.reply({
                        content: 'No roles configured. Only administrators can manage events.',
                        ephemeral: true
                    });
                }

                const roleNames = roleIds.map(id => {
                    const role = interaction.guild.roles.cache.get(id);
                    return role ? role.name : `Unknown (${id})`;
                });

                await interaction.reply({
                    content: `**Allowed Roles:**\n${roleNames.map(n => `• ${n}`).join('\n')}`,
                    ephemeral: true
                });
            }
        }
    }
};
