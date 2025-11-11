module.exports = {
  displayName: 'unit',
  testEnvironment: 'node',
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.base.json' }] },
  moduleNameMapper: {
    '^@app/common$': '<rootDir>/libs/common/src',
    '^@app/common/(.*)$': '<rootDir>/libs/common/src/$1'
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  testMatch: ['**/__tests__/**/*.spec.[tj]s', '**/?(*.)+(spec).[tj]s'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  verbose: true,
  clearMocks: true,
};
