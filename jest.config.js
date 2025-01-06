module.exports = {
  // Tells Jest to use ts-jest for TypeScript files
  preset: "ts-jest",

  // Match test files (e.g., *.test.ts, *.spec.ts, etc.)
  testMatch: [
    "**/__tests__/**/*.(test|spec).[jt]s?(x)",
    "**/?(*.)+(test|spec).[jt]s?(x)",
  ],

  // Optionally set a test environment (Node recommended for APIs)
  testEnvironment: "node",

  // If Next imports cause issues, you may need to transform or mock them
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },

  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@/app/(.*)$": "<rootDir>/app/$1",
  },

  moduleDirectories: ["node_modules", "<rootDir>"],
};
