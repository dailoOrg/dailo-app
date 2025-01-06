import "@testing-library/jest-dom";

// Add any global test setup here
global.Request = class MockRequest extends Request {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(input, init);
  }
} as any;
