import { describe, it, expect, jest } from "@jest/globals";
import { OpenAI } from "openai";

// Create a mock constructor function
const mockConstructor = jest.fn();

// Mock OpenAI with proper types
jest.mock("openai", () => ({
  OpenAI: jest.fn((...args) => {
    mockConstructor(...args);
    return {
      chat: {
        completions: {
          create: jest.fn().mockImplementation(() =>
            Promise.resolve({
              choices: [
                {
                  delta: { content: "Test response" },
                  index: 0,
                  finish_reason: null,
                },
              ],
              id: "test-id",
              object: "chat.completion.chunk",
              created: Date.now(),
              model: "gpt-3.5-turbo",
            })
          ),
        },
      },
    };
  }),
}));

describe("POST /api/openai/stream", () => {
  beforeEach(() => {
    jest.resetModules();
    mockConstructor.mockClear();
    process.env = { ...process.env, OPENAI_API_KEY: "test-key" };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should handle streaming chat completion request", async () => {
    const mockRequest = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({
        prompt: {
          model: "gpt-3.5-turbo",
          temperature: 0.7,
          systemPrompt: "You are a helpful assistant",
          userPrompt: "Hello",
        },
      }),
    });

    const { POST } = await import("../../../../app/api/openai/stream/route");
    const response = await POST(mockRequest);

    expect(response).toBeDefined();
    expect(response instanceof Response).toBeTruthy();
    expect(mockConstructor).toHaveBeenCalledWith({ apiKey: "test-key" });
  });

  it("should return error for invalid request", async () => {
    const mockRequest = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({}), // Empty body
    });

    const { POST } = await import("../../../../app/api/openai/stream/route");
    const response = await POST(mockRequest);

    expect(response).toBeDefined();
    expect(response instanceof Response).toBeTruthy();
    expect(response.status).toBe(500);
  });
});
