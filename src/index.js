const { start: startBot } = require('./bot/client');
const { start: startWeb } = require('./web/server');

async function main() {
    console.log('Starting Takoyaki...');

    try {
        // Start both services
        await Promise.all([
            startBot(),
            startWeb()
        ]);

        console.log('Takoyaki is now running!');
    } catch (error) {
        console.error('Failed to start:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nShutting down...');
    process.exit(0);
});

main();
