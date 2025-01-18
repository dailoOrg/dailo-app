import { useState } from "react";

export function useOpenAIStream<T>() {
  const [result, setResult] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ content: string }>>([]);

  const generateStreamingResponse = async (prompt: any) => {
    setLoading(true);
    setError(null);
    setMessages([]);

    try {
      const response = await fetch("/api/openai/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Stream request failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedText += chunk;

        setMessages([
          {
            content: accumulatedText,
          },
        ]);
      }

      setResult({
        answer: accumulatedText,
        confidence: 1,
      } as T);
    } catch (err) {
      setError("Error generating response");
      console.error("Streaming error:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    result,
    loading,
    error,
    messages,
    generateStreamingResponse,
  };
}
