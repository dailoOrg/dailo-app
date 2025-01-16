import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// Add export config to mark as dynamic
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { prompt } = await req.json();
  console.log(" QUESTION TO STREAMING API:", prompt.userPrompt);

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

    // Create a ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || "";
          controller.enqueue(new TextEncoder().encode(content));
        }
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
    const isTest = process.env.NODE_ENV === "test";
    if (!isTest) {
      console.error("OpenAI API error:", error);
    }
    return new Response("Error streaming response", { status: 500 });
  }
}
