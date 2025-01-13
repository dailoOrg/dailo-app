import { NextResponse } from "next/server";
import OpenAI from "openai";
import { writeFile } from "fs/promises";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const asyncExec = promisify(exec);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio");

    console.log("Received audio file:", {
      type: audio instanceof Blob ? audio.type : typeof audio,
      size: audio instanceof Blob ? audio.size : "N/A",
      name: audio instanceof File ? audio.name : "unknown",
      isFile: audio instanceof File,
      isBlob: audio instanceof Blob,
      supportedFormats: [
        "flac",
        "m4a",
        "mp3",
        "mp4",
        "mpeg",
        "mpga",
        "oga",
        "ogg",
        "wav",
        "webm",
      ],
    });

    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json(
        { error: "Invalid audio data" },
        { status: 400 }
      );
    }

    // Save incoming file exactly
    const inputFilename = audio instanceof File ? audio.name : "recording.mp4";
    const inputFilePath = join("/tmp", inputFilename);

    // Write it
    const audioBytes = await audio.arrayBuffer();
    console.log("About to write file:", {
      path: inputFilePath,
      bytes: audioBytes.byteLength,
      filename: inputFilename,
    });

    await writeFile(inputFilePath, Buffer.from(audioBytes));

    console.log("About to send to Whisper:", {
      path: inputFilePath,
      exists: await import("fs/promises").then((mod) =>
        mod
          .access(inputFilePath)
          .then(() => true)
          .catch(() => false)
      ),
      size: await import("fs/promises").then((mod) =>
        mod
          .stat(inputFilePath)
          .then((stat) => stat.size)
          .catch(() => -1)
      ),
    });

    // Send directly to Whisper (no conversion needed)
    const transcription = await openai.audio.transcriptions.create({
      file: await import("fs").then((mod) =>
        mod.createReadStream(inputFilePath)
      ),
      model: "whisper-1",
      response_format: "text",
    });

    // Clean up
    await import("fs/promises").then((mod) => mod.unlink(inputFilePath));

    if (!transcription) {
      return NextResponse.json(
        { error: "No transcription text received" },
        { status: 500 }
      );
    }

    return NextResponse.json({ text: transcription.toString() });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Error transcribing audio" },
      { status: 500 }
    );
  }
}
