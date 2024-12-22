import * as path from 'path';

const isDevelopment = process.env.NODE_ENV === 'development';

export const config = {
    server: {
        port: parseInt(process.env.PORT || '6379', 10),
        host: process.env.HOST || 'localhost',
    },
    auth: {
        minPasswordLength: 8,
    },
    store: {
        maxConnections: 10,
        minConnections: 2,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
    },
    development: isDevelopment,
} as const;
