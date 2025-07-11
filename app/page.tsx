"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mic,
  MicOff,
  Users,
  Calendar,
  Bell,
  Search,
  Plus,
  TrendingUp,
  Clock,
} from "lucide-react";
import Image from 'next/image';

export default function WarmlyDashboard() {
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [transcript, setTranscript] = useState(""); // New transcript state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [structuredTranscripts, setStructuredTranscripts] = useState<object[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("structuredTranscripts");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 1) {
          setStructuredTranscripts(parsed);
        }
      } catch (e) {
        console.error("❌ Failed to parse structuredTranscripts from localStorage:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("structuredTranscripts", JSON.stringify(structuredTranscripts));
  }, [structuredTranscripts]);

  async function transcribeAudioWithDeepgram(audioBlob: Blob): Promise<string> {
    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: audioBlob,
        headers: {
          "Content-Type": "audio/webm",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.transcript || "";
    } catch (error) {
      console.error("Transcription error:", error);
      return "Failed to transcribe audio.";
    }
  }

  const handleRecordingToggle = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });

          // Save audio to localStorage as base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            localStorage.setItem("audioRecording", base64Audio);
            console.log("✅ Audio saved to localStorage");
          };
          reader.readAsDataURL(audioBlob);

          // Call Deepgram API via backend
          const transcriptText = await transcribeAudioWithDeepgram(audioBlob);

          setTranscript(transcriptText);
          console.log(transcript);

          const transcript_data = { transcript: transcriptText };

          if (transcriptText === "") {
            console.warn("Transcript data is empty.")
            return;
          }

          const response = await fetch('https://warmly-transcript-api.vercel.app/structured_transcript', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transcript_data),
          });

          const result = await response.json();
          console.log(result)
          setStructuredTranscripts(prev => [...prev, result]);
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("🎙️ Error starting recording:", error);
      }
    } else {
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const handleRemoveTranscript = (index: number) => {
    const updated = structuredTranscripts.filter((_, i) => i !== index);
    setStructuredTranscripts(updated);
    localStorage.setItem("structuredTranscripts", JSON.stringify(updated));
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/Warmly Logo.webp"
                alt="The company (warmly) logo."
                width={150}
                height={150}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant={isRecording ? "destructive" : "default"}
              onClick={handleRecordingToggle}
              className="flex items-center space-x-2"
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isRecording ? "Stop Recording" : "Start Recording"}</span>
            </Button>
            <Button variant="outline" size="icon">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        {/* Recording Status */}
        {isRecording && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="flex items-center space-x-3 p-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-800 font-medium">Recording in progress...</span>
              <span className="text-red-600 text-sm">
                Ensure all participants have consented to recording
              </span>
            </CardContent>
          </Card>
        )}

        {/* Transcript Display */}
        {transcript && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>Transcript</CardTitle>
              <CardDescription>Speech-to-text transcription of your recording</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{transcript}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Total Contacts</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {structuredTranscripts.length !== 0
                  ? structuredTranscripts.reduce((sum, currentValue) => {
                    return sum + (currentValue["Names of Speakers"] || []).length;
                  }, 0)
                  : "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Conversations</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {structuredTranscripts.length !== 0 ? structuredTranscripts.length : "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Follow-ups</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {structuredTranscripts.length !== 0
                  ? structuredTranscripts.reduce((sum, currentValue) => {
                    return sum + (currentValue["Things to Follow Up On"] || []).length;
                  }, 0)
                  : "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Opportunities</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {structuredTranscripts.length !== 0
                  ? structuredTranscripts.reduce((sum, currentValue) => {
                    return sum + (currentValue["Social or Business Overlaps"] || []).length;
                  }, 0)
                  : "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="conversations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="conversations">Recent Conversations</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="reminders">Follow-ups</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="space-y-4">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Manual Entry
              </Button>
            </div>

            {structuredTranscripts.length === 0 && <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-sm">
                Start recording to capture and analyze your networking conversations
              </p>
            </div>}

            {structuredTranscripts.length > 0 && structuredTranscripts.some(obj => Object.keys(obj).length > 0) && (
              <Card className="mb-6 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle>Structured Transcripts</CardTitle>
                  <CardDescription>Insights parsed from your conversations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {structuredTranscripts.map((structured, idx) => (
                    <div key={idx} className="relative p-4 bg-white rounded border shadow-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTranscript(idx)}
                        className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                      <h1 className="font-bold text-gray-3000">Conversation {idx}: </h1>
                      {Object.entries(structured).map(([key, value]) => (
                        <div key={key} className="mb-3">
                          <h4 className="font-semibold text-gray-700">{key}</h4>
                          <ul className="list-disc list-inside text-gray-600">
                            {Array.isArray(value) ? (
                              value.length === 0 ? (
                                <li className="italic text-gray-400">None</li>
                              ) : (
                                value.map((item, i) =>
                                  typeof item === 'string' || typeof item === 'number'
                                    ? <li key={i}>{item}</li>
                                    : <li key={i}>{
                                      <pre>{JSON.stringify(item, null, 2)}</pre>
                                    }</li>
                                )
                              )
                            ) : typeof value === 'string' || typeof value === 'number' ? (
                              <li>{value}</li>
                            ) : (
                              <li>{JSON.stringify(value)}</li>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Management</CardTitle>
                <CardDescription>
                  All contacts extracted from your conversations, organized by industry and
                  relationship strength.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {structuredTranscripts.length === 0 && <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                  <p className="text-sm">
                    Start recording to capture and analyze your networking conversations
                  </p>
                </div>}

                {structuredTranscripts.length !== 0 && (
                  <Card className="mb-6 border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle>Contacts</CardTitle>
                      <CardDescription>Insights parsed from your conversations</CardDescription>
                    </CardHeader>

                    {structuredTranscripts.length !== 0 && <CardContent className="space-y-4">
                      {structuredTranscripts.map((structured, transcript_idx) => (
                        structured["Names of Speakers"].length !== 0 &&
                        <div key={transcript_idx} className="relative p-4 bg-white rounded border shadow-sm">
                          {(structured["Names of Speakers"] || []).map((name: string, idx: number) => (
                            <p key={`${transcript_idx}-${idx}`} className="mb-2">
                              From conversation {transcript_idx + 1}, name of speaker: "{name}".
                              Their business interests: {
                                (structured["Social or Business Overlaps"] || []).length === 0
                                  ? "None"
                                  : (structured["Social or Business Overlaps"] || []).join(", ")
                              }
                            </p>
                          ))}
                        </div>
                      ))}
                    </CardContent>}
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Follow-ups</CardTitle>
                <CardDescription>Action items and reminders based on your conversations.</CardDescription>
              </CardHeader>
              <CardContent>
                {structuredTranscripts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                    <p className="text-sm">
                      Start recording to capture and analyze your networking conversations
                    </p>
                  </div>
                )}

                {structuredTranscripts.length !== 0 && (
                  <Card className="mb-6 border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle>Follow-ups</CardTitle>
                      <CardDescription>Insights parsed from your conversations</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {structuredTranscripts.map((structured, transcript_idx) => (
                        (structured["Things to Follow Up On"] || []).length !== 0 && (
                          <div key={transcript_idx} className="relative p-4 bg-white rounded border shadow-sm">
                            {(structured["Things to Follow Up On"] || []).map((followup: string, idx: number) => (
                              <p key={`${transcript_idx}-${idx}`} className="mb-2">
                                From conversation {transcript_idx + 1}: "{followup}"
                              </p>
                            ))}
                          </div>
                        )
                      ))}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Industry Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">N/A</span>
                      <span className="text-sm font-medium">0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">N/A</span>
                      <span className="text-sm font-medium">0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">N/A</span>
                      <span className="text-sm font-medium">0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Networking Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Activity charts and analytics</p>
                    <p className="text-sm">Conversation trends, follow-up rates, etc.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div >
  );
}
