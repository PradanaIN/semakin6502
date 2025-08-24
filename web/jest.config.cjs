module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '@/(.*)\\.pdf$': '<rootDir>/test-file-stub.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^.+\\.pdf$': '<rootDir>/test-file-stub.js'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/?(*.)+(test).[jt]s?(x)']
};
