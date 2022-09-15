module.exports = {
  watchman: false,
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(ts)$': 'ts-jest',
  },
  testRegex: '.e2e-spec.ts$',
  testPathIgnorePatterns: ['dist'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
}
