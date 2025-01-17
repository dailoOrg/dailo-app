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

    console.log("Stream Hook: Starting request", {
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await fetch("/api/openai/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        console.error("Stream Hook: Request failed", {
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error("Stream request failed");
      }

      console.log("Stream Hook: Got response, starting to read");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader!.read();
        if (done) {
          console.log("Stream Hook: Stream complete", {
            totalChunks: chunkCount,
            finalLength: accumulatedText.length,
            timestamp: new Date().toISOString(),
          });
          break;
        }

        const chunk = decoder.decode(value);
        accumulatedText += chunk;
        chunkCount++;

        if (chunkCount % 10 === 0) {
          // Log every 10 chunks
          console.log("Stream Hook: Reading progress", {
            chunksRead: chunkCount,
            currentLength: accumulatedText.length,
          });
        }

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
      console.error("Stream Hook: Error", {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      });
      setError("Error generating response");
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
