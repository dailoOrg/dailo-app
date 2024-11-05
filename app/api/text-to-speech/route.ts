import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
    });

    const audioData = await response.arrayBuffer();

    return new NextResponse(audioData, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Error generating speech' },
      { status: 500 }
    );
  }
} 