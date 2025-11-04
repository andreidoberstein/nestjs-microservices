module.exports = {
  displayName: 'e2e',
  testEnvironment: 'node',
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.base.json' }] },
  testMatch: ['**/?(*.)+(e2e).[tj]s'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
  testTimeout: 30000
};
