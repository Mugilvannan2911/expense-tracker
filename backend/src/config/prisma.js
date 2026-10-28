const { PrismaClient } = require('@prisma/client');

// Use global singleton pattern to prevent connection pool exhaustion on Aiven Cloud MySQL during dev hot-reloads
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    errorFormat: 'pretty',
});

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

/**
 * Diagnostic helper to verify Aiven remote database connectivity and round-trip latency
 */
const checkDbConnection = async () => {
    const startTime = Date.now();
    try {
        await prisma.$queryRaw`SELECT 1`;
        const latency = Date.now() - startTime;
        return {
            connected: true,
            database: 'Aiven MySQL',
            latencyMs: latency
        };
    } catch (err) {
        return {
            connected: false,
            database: 'Aiven MySQL',
            error: err.message
        };
    }
};

// Graceful disconnection from Aiven remote database
const handleExit = async () => {
    try {
        await prisma.$disconnect();
    } catch {
        // Ignore during shutdown
    }
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
process.on('beforeExit', handleExit);

prisma.checkDbConnection = checkDbConnection;

module.exports = prisma;