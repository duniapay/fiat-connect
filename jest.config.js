module.exports = {
  watchman: false,
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(ts)$': 'ts-jest',
  },
  collectCoverage: false,
  collectCoverageFrom: ['./src/routes/**'],
  coverageThreshold: {
    global: {
      lines: 90,
    },
  },
  testRegex: '.test.ts$',
  testPathIgnorePatterns: ['dist'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
}
