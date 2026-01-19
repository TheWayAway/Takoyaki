const { PermissionFlagsBits } = require('discord.js');
const { guildConfig } = require('../../database/events');

function hasEventPermission(member) {
    // Server admins always have permission
    if (member.permissions.has(PermissionFlagsBits.Administrator)) {
        return true;
    }

    // Check if user has any of the allowed roles
    const config = guildConfig.get(member.guild.id);
    const allowedRoles = config.allowed_roles;

    if (allowedRoles.length === 0) {
        // If no roles configured, only admins can manage events
        return false;
    }

    return member.roles.cache.some(role => allowedRoles.includes(role.id));
}

function isAdmin(member) {
    return member.permissions.has(PermissionFlagsBits.Administrator);
}

module.exports = { hasEventPermission, isAdmin };
