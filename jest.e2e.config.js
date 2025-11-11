module.exports = {
  displayName: 'e2e',
  testEnvironment: 'node',
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.base.json' }] },
  moduleNameMapper: {
    '^@app/common$': '<rootDir>/libs/common/src/index.ts',
    '^@app/common/(.*)$': '<rootDir>/libs/common/src/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  testMatch: ['**/?(*.)+(e2e).[tj]s'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
  testTimeout: 30000
};
