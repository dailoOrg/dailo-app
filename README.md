# Dailo - AI-Enhanced Podcast Platform

A modern web application that combines podcast streaming with AI-powered interactions, built using Next.js 14, Shadcn/ui, and OpenAI's APIs.

## 1. Tech Stack

- [TypeScript](https://www.typescriptlang.org/) - Static typing and enhanced developer experience
- [Next.js 14](https://nextjs.org/) - React framework with server-side rendering
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Customizable UI components
- [OpenAI API](https://platform.openai.com/docs/api-reference) - Powers AI features including:
  - Speech-to-Text (Whisper API)
  - Text-to-Speech (TTS API)
  - Chat Completions API

## 2. Features

- 🎙️ Podcast Streaming - Listen to curated tech podcasts
- 🤖 AI Interaction - Ask questions about podcast content in real-time
- 🎯 Voice Input - Record questions using your microphone
- 🔊 AI Voice Responses - Get answers in natural speech
- 📱 Responsive Design - Works on desktop and mobile devices

## 3. Project Structure

- `app/` - Main application code
  - `api/` - API routes for OpenAI integration
    - `openai/` - Chat completion endpoints
    - `text-to-speech/` - TTS conversion endpoint
    - `transcribe/` - Speech-to-text endpoint
  - `podcasts/` - Podcast pages and routing
  - `landing-page.tsx` - Homepage component
  - `podcast-page.tsx` - Individual podcast view

- `components/` - Reusable React components
  - `audio/` - Audio input/output components
  - `layout/` - Layout components like navigation
  - `ui/` - Shadcn UI components

- `hooks/` - Custom React hooks
  - `useOpenAI.ts` - OpenAI API integration
  - `useStreamingTTS.ts` - Streaming TTS functionality
  - `useOpenAIStream.ts` - Streaming completions

- `public/` - Static assets and data
  - `data/` - Podcast metadata and content

## 4. Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dailo
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file:
```bash
OPENAI_API_KEY=your_openai_api_key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 5. Key Components

### Podcast Player
The core podcast player component (`components/podcast-player.tsx`) includes:
- Audio playback controls
- Progress tracking
- Voice input for questions
- AI response streaming

### AI Integration
- Real-time transcription of voice questions
- Natural language processing of podcast content
- Text-to-speech conversion for AI responses

## 6. Environment Variables

Required environment variables:
- `OPENAI_API_KEY` - Your OpenAI API key