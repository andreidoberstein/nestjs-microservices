module.exports = {
  displayName: 'unit',
  testEnvironment: 'node',
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.base.json' }] },
  testMatch: ['**/__tests__/**/*.spec.[tj]s', '**/?(*.)+(spec).[tj]s'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  verbose: true,
};
