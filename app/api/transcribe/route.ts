// app/api/transcribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";

const deepgramApiKey = process.env.DEEPGRAM_API_KEY!;
const deepgram = createClient(deepgramApiKey);

export async function POST(request: NextRequest) {
  try {
    const arrayBuffer = await request.arrayBuffer();
    console.log("Received audio buffer of bytes:", arrayBuffer.byteLength);
    
    const buffer = Buffer.from(arrayBuffer);
    
    // Use the new SDK API structure
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      {
        model: "nova-2", // or "nova" for the latest model
        punctuate: true,
        language: "en-US",
        mimetype: "audio/webm"
      }
    );

    if (error) {
      console.error("Deepgram API error:", error);
      return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 });
    }

    console.log("Deepgram response:", result);
    
    const transcript = result.results.channels[0].alternatives[0].transcript;
    
    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("Deepgram transcription error:", error);
    return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 });
  }
}