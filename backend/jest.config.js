export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  testMatch: ['**/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', 'logger.test.js'],
  transform: {},
  testTimeout: 15000
};
