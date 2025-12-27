import type {Config} from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/test/**/*.e2e-spec.ts',
    '<rootDir>/**/?(*.)+(spec|test).ts',
  ],
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {tsconfig: 'tsconfig.json'}],
  },
  moduleNameMapper: {},
  setupFilesAfterEnv: [],
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coveragePathIgnorePatterns: ['/node_modules/'],
};

export default config;
