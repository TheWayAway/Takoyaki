require('dotenv').config();

module.exports = {
    discord: {
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.DISCORD_CLIENT_ID
    },
    web: {
        port: parseInt(process.env.WEB_PORT, 10) || 3000,
        password: process.env.WEB_PASSWORD,
        sessionSecret: process.env.SESSION_SECRET,
        publicUrl: process.env.PUBLIC_URL || `http://localhost:${process.env.WEB_PORT || 3000}`
    },
    nodeEnv: process.env.NODE_ENV || 'development'
};
