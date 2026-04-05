/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.(spec|test).ts', '**/tests/**/*.(spec|test).js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/', '/coverage/'],
  passWithNoTests: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
};
