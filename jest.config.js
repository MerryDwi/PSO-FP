module.exports = {
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "jsx"],
  moduleDirectories: ["node_modules", "src"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html", "json", "json-summary"],
  collectCoverageFrom: [
    "src/**/*.js",
    "auth/**/*.js",
    "utils/**/*.js",
    "!src/**/*.test.js",
    "!src/js/firebase.config.js", // Exclude config file
    "!src/js/main.js", // Exclude DOM-heavy file (login/signup UI)
    "!src/js/leaderboard.js", // Exclude Firebase-heavy file (requires complex mocking)
    "!**/node_modules/**",
    "!**/coverage/**",
  ],
  coverageThreshold: {
    global: {
      branches: 25,
      functions: 25,
      lines: 25,
      statements: 25,
    },
  },
};
