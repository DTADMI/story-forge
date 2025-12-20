import type {Config} from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '.',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    testMatch: ['**/?(*.)+(spec|test).ts'],
    transform: {
        '^.+\\.(t|j)s$': ['ts-jest', {tsconfig: 'tsconfig.json'}]
    },
    moduleNameMapper: {},
    setupFilesAfterEnv: [],
    collectCoverageFrom: ['src/**/*.(t|j)s'],
    coveragePathIgnorePatterns: ['/node_modules/']
};

export default config;
