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
        mimetype: "audio/webm",
        diarize: true, // Enable speaker diarization
        diarize_version: "2023-10-12" // Use the latest diarization version
      }
    );

    if (error) {
      console.error("Deepgram API error:", error);
      return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 });
    }

    console.log("Deepgram response:", result);
    
    // Handle diarized transcript
    const words = result.results.channels[0].alternatives[0].words;
    const transcript = result.results.channels[0].alternatives[0].transcript;
    
    // Group words by speaker
    const speakerSegments = [];
    let currentSpeaker = null;
    let currentSegment = { speaker: null, text: "", start: 0, end: 0 };
    
    if (words && words.length > 0) {
      for (const word of words) {
        if (word.speaker !== currentSpeaker) {
          // New speaker detected
          if (currentSegment.text) {
            speakerSegments.push(currentSegment);
          }
          currentSpeaker = word.speaker;
          currentSegment = {
            speaker: word.speaker,
            text: word.punctuated_word || word.word,
            start: word.start,
            end: word.end
          };
        } else {
          // Same speaker, append word
          currentSegment.text += " " + (word.punctuated_word || word.word);
          currentSegment.end = word.end;
        }
      }
      // Add the last segment
      if (currentSegment.text) {
        speakerSegments.push(currentSegment);
      }
    }
    
    return NextResponse.json({ 
      transcript, 
      speakerSegments,
      totalSpeakers: result.results.channels[0].alternatives[0].summaries?.[0]?.speaker_count || 0
    });
  } catch (error) {
    console.error("Deepgram transcription error:", error);
    return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 });
  }
}