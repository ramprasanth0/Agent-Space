export default {
  roots: [
    "<rootDir>/src",
    "<rootDir>/frontend-tests"
  ],
  testMatch: [
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  setupFilesAfterEnv: [
    "<rootDir>/setupTests.js"
  ],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest"
  },
  moduleNameMapper: {
  '\\.svg$': '<rootDir>/src/assets/__mocks__/svgMock.js',
  }
};
