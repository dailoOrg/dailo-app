import { NextResponse } from 'next/server'
import OpenAI from "openai"
import { writeFile } from 'fs/promises'
import { join } from 'path'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save the file temporarily
    const tempFilePath = join('/tmp', file.name)
    await writeFile(tempFilePath, buffer)

    const transcription = await openai.audio.transcriptions.create({
      file: await import('fs').then((mod) => mod.createReadStream(tempFilePath)),
      model: "whisper-1",
    })

    // Clean up the temporary file
    await import('fs/promises').then((mod) => mod.unlink(tempFilePath))

    return NextResponse.json({ text: transcription.text })
  } catch (error) {
    console.error('Error transcribing audio:', error)
    return NextResponse.json({ error: 'Error transcribing audio' }, { status: 500 })
  }
}