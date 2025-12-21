// Centralized environment reader for API
// Validates presence of required variables at boot.

export const env = {
    apiJwtSecret: process.env.API_JWT_SECRET || '',
    nodeEnv: process.env.NODE_ENV || 'development'
};

export function assertEnv() {
    if (!env.apiJwtSecret) {
        throw new Error('Missing API_JWT_SECRET. Set it in api/.env (and CI/CD) to enable API auth.');
    }
}
