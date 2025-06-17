module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageReporters: ['text', 'lcov', 'clover', 'json', 'html'],
  testPathIgnorePatterns: ['/node_modules/'],
  verbose: true,
  setupFilesAfterEnv: ['./tests/setup.js'],
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'MERN ATS Test Report',
        outputPath: './test-report.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
        sort: 'status',
        executionTimeWarningThreshold: 5,
        executionTimeErrorThreshold: 10,
        dateFormat: 'yyyy-mm-dd HH:MM:ss',
        customScriptPath: null
      }
    ]
  ]
};
