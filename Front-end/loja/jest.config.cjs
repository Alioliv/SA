module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  setupFiles: ['<rootDir>/src/__mocks__/textEncoder.js'],
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { configFile: './babel.config.cjs' }],
  },
  moduleNameMapper: {
    '\\.module\\.css$': '<rootDir>/src/__mocks__/styleMock.js',
    '\\.css$': '<rootDir>/src/__mocks__/styleMock.js',
    '\\.(svg|png|jpg|jpeg|gif|webp)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  testMatch: ['**/tests/**/*.test.{js,jsx}'],
  injectGlobals: true,
}