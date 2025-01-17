import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// Add export config to mark as dynamic
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { prompt } = await req.json();
  console.log("Stream API: Starting request with prompt:", {
    userPrompt: prompt.userPrompt,
    model: prompt.model,
    timestamp: new Date().toISOString(),
  });

  try {
    const response = await openai.chat.completions.create({
      model: prompt.model,
      temperature: prompt.temperature,
      messages: [
        { role: "system", content: prompt.systemPrompt },
        { role: "user", content: prompt.userPrompt },
      ],
      stream: true,
    });

    console.log("Stream API: Got initial response from OpenAI");

    // Create a ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        let totalChunks = 0;
        let totalContent = "";

        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || "";
          totalContent += content;
          totalChunks++;

          if (totalChunks % 10 === 0) {
            // Log every 10 chunks
            console.log("Stream API: Streaming progress:", {
              chunksProcessed: totalChunks,
              lastChunkLength: content.length,
              totalContentLength: totalContent.length,
            });
          }

          controller.enqueue(new TextEncoder().encode(content));
        }

        console.log("Stream API: Stream complete:", {
          totalChunks,
          finalContentLength: totalContent.length,
          timestamp: new Date().toISOString(),
        });

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Stream API Error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    return new Response("Error streaming response", { status: 500 });
  }
}
