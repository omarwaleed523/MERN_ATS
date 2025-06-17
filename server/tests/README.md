# MERN ATS Testing Guide

This directory contains the test suite for the MERN ATS application.

## Test Structure

The tests are organized into the following structure:

```
tests/
├── unit/             # Unit tests for individual components
├── integration/      # Tests for API endpoints and component interactions  
├── e2e/              # End-to-end tests for complete workflows
├── mocks/            # Mock implementations for testing
└── setup.js          # Jest setup configuration
```

## Test Types

### Unit Tests

Unit tests verify that individual components work correctly in isolation. These tests focus on:

- **Models**: Testing schema validation, required fields, and relationships
- **Controllers**: Testing business logic and error handling
- **Utilities**: Testing helper functions and services

### Integration Tests

Integration tests verify that components work together correctly. These tests focus on:

- **API Endpoints**: Testing HTTP request/response handling
- **Database Operations**: Testing data persistence and retrieval
- **Authentication**: Testing security middleware and token handling

### End-to-End Tests

End-to-end tests verify complete user workflows from start to finish. These tests simulate real user interactions with the system, such as:

- Registering as a candidate and applying for jobs
- Posting jobs as a recruiter and reviewing applications
- Managing the interview process from scheduling to feedback

## Running Tests

### Running All Tests

```bash
npm test
```

### Running Specific Test Types

```bash
# Run only unit tests
npm test -- --testMatch="**/tests/unit/**/*.test.js"

# Run only integration tests
npm test -- --testMatch="**/tests/integration/**/*.test.js"

# Run only e2e tests
npm test -- --testMatch="**/tests/e2e/**/*.test.js"
```

### Running a Specific Test File

```bash
npm test -- path/to/test/file.test.js
```

### Generating Coverage Report

```bash
npm test -- --coverage
```

### Generating HTML Test Report

```bash
npm test
```

This will automatically generate an HTML test report at `./test-report.html` in the server directory. The HTML report includes:

- A summary of all test suites and test cases
- Pass/fail status for each test
- Test execution time and performance warnings
- Detailed failure messages and stack traces
- Console logs captured during test execution

You can open this HTML file in any web browser to view a user-friendly representation of your test results. This is particularly useful for:

- Sharing test results with team members
- Documenting test runs for project stakeholders
- Quickly identifying problematic test cases
- Analyzing test performance issues

The report is configured with the following options:
- Page title: "MERN ATS Test Report"
- Sort order: Tests are sorted by status (failed tests first)

### Generating Excel Test Documentation

```bash
npm run test:excel
```

This command generates a detailed Excel workbook (`test-documentation.xlsx`) containing comprehensive documentation for all test cases in the project. The Excel document includes:

- **Test ID**: Unique identifier for each test (format: [Type]-[File]-[Number])
- **Description**: The test case description
- **Details**: Full test details including the test suite name
- **Prerequisites**: Any setup required for the test to run
- **Expected Result**: What the test expects to happen
- **Actual Result**: The actual outcome of the test

The Excel document contains multiple sheets:
1. **All Tests**: A complete list of all test cases across all categories
2. **Unit Tests**: Detailed documentation for unit tests only
3. **Integration Tests**: Detailed documentation for integration tests only
4. **E2E Tests**: Detailed documentation for end-to-end tests only
5. **Summary**: A count of tests by category

This documentation is particularly useful for:
- Project documentation and auditing
- Test case management and tracking
- Sharing test coverage with stakeholders and team members
- Onboarding new developers to the testing infrastructure

The workbook is formatted with color-coding to easily identify different test types and includes proper styling for readability.

### Generating Both HTML and Excel Reports

```bash
npm run test:all-reports
```

This command runs both the HTML report generation and the Excel documentation generation in sequence. Use this when you need both formats for comprehensive test reporting and documentation.
- Execution time warnings: Tests taking more than 5 seconds are flagged with a warning
- Execution time errors: Tests taking more than 10 seconds are flagged with an error

## Testing Tools

- **Jest**: Main testing framework
- **Supertest**: HTTP testing library for API testing
- **MongoDB Memory Server**: In-memory MongoDB database for isolated testing

## Test Setup

The `setup.js` file contains the global setup and teardown configuration for Jest. This includes:

- Setting up the MongoDB Memory Server for isolated database testing
- Setting default environment variables for testing
- Configuring global mocks for external dependencies

## Adding New Tests

When adding new tests, follow these guidelines:

1. Place tests in the appropriate directory based on test type
2. Name test files with `.test.js` suffix
3. Follow the pattern of existing tests for consistency
4. Use descriptive test names that explain what's being tested
5. Properly clean up resources in afterEach/afterAll blocks

## Mocking

The `mocks/` directory contains mock implementations used for testing. These mocks help isolate the component being tested by replacing external dependencies.

Key mocks include:
- `authMiddleware.js`: Mock implementation of the authentication middleware
- Email service mocks
- External API mocks

## Common Issues

### "Worker process has failed to exit gracefully"

This issue can occur when resources aren't properly cleaned up after tests. Ensure all database connections, timers, and event listeners are properly closed/cleared in `afterEach`/`afterAll` blocks.

### Failed Tests Due to Async Operations

If tests are failing due to async operations not completing, make sure to:
- Properly use `async/await` syntax
- Return promises from test functions
- Use Jest's `done` callback when appropriate

## Best Practices

1. Test one thing per test case
2. Use descriptive test names
3. Set up and tear down test data for each test
4. Mock external dependencies
5. Test both success and error cases
6. Keep tests fast and independent
7. Regularly run the full test suite to catch regressions
