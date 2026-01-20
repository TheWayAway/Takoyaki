require('dotenv').config();

// Support both prefixed (from .env file) and non-prefixed (from Komodo) env vars
const env = (name) => process.env[`TAKOYAKI_${name}`] || process.env[name];

// Debug: log env vars
console.log('ENV DEBUG:', {
    SUPER_ADMIN_PASSWORD: env('SUPER_ADMIN_PASSWORD') ? 'SET' : 'NOT SET',
});

// Parse comma-separated user IDs
const parseUserIds = (value) => {
    if (!value) return [];
    return value.split(',').map(id => id.trim()).filter(id => id);
};

module.exports = {
    discord: {
        token: env('DISCORD_TOKEN'),
        clientId: env('DISCORD_CLIENT_ID'),
        allowedUserIds: parseUserIds(env('ALLOWED_USER_IDS'))
    },
    web: {
        port: parseInt(env('WEB_PORT'), 10) || 3000,
        password: env('WEB_PASSWORD'),
        superAdminPassword: env('SUPER_ADMIN_PASSWORD'),
        sessionSecret: env('SESSION_SECRET'),
        publicUrl: env('PUBLIC_URL') || `http://localhost:${env('WEB_PORT') || 3000}`
    },
    nodeEnv: env('NODE_ENV') || 'development'
};
