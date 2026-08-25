module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@auth/(.*)$': '<rootDir>/src/auth/$1',
    '^@players/(.*)$': '<rootDir>/src/players/$1',
    '^@matchmaking/(.*)$': '<rootDir>/src/matchmaking/$1',
    '^@game/(.*)$': '<rootDir>/src/game/$1',
    '^@leaderboard/(.*)$': '<rootDir>/src/leaderboard/$1',
    '^@analytics/(.*)$': '<rootDir>/src/analytics/$1',
    '^@database/(.*)$': '<rootDir>/src/database/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
  },
};
