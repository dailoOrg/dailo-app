import { describe, it, expect, jest } from "@jest/globals";
import { OpenAI } from "openai";

// Mock OpenAI with proper types for speech API
jest.mock("openai", () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    audio: {
      speech: {
        create: jest.fn().mockImplementation(() =>
          Promise.resolve({
            body: new ReadableStream(),
            text: async () => "mock audio data",
            arrayBuffer: async () => new ArrayBuffer(8),
            headers: new Headers(),
            status: 200,
            statusText: "OK",
            ok: true,
            url: "",
            json: async () => ({}),
            clone: () => ({} as Response),
            bodyUsed: false,
            type: "default",
            redirected: false,
            blob: async () => new Blob(),
            formData: async () => new FormData(),
          } as Response)
        ),
      },
    },
  })),
}));

describe("POST /api/text-to-speech", () => {
  const env = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...env, OPENAI_API_KEY: "test-key" };
  });

  afterEach(() => {
    process.env = env;
  });

  it("should convert text to speech", async () => {
    const mockRequest = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ text: "Hello world" }),
    });

    const { POST } = await import("../../../app/api/text-to-speech/route");
    const response = await POST(mockRequest);

    expect(response).toBeDefined();
    expect(response instanceof Response).toBeTruthy();
  });
});
