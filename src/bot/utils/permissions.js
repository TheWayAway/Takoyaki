const { PermissionFlagsBits } = require('discord.js');
const { guildConfig } = require('../../database/events');
const config = require('../../config');

function hasEventPermission(member) {
    // Check if user is in the allowed user IDs list
    if (config.discord.allowedUserIds.length > 0) {
        // If allowed user IDs are configured, only those users can manage events
        return config.discord.allowedUserIds.includes(member.user.id);
    }

    // Fallback to role-based permissions if no user IDs configured
    // Server admins always have permission
    if (member.permissions.has(PermissionFlagsBits.Administrator)) {
        return true;
    }

    // Check if user has any of the allowed roles
    const guildCfg = guildConfig.get(member.guild.id);
    const allowedRoles = guildCfg.allowed_roles;

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
