"use client";

import { useState, useRef } from "react";
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
  User,
} from "lucide-react";

interface SpeakerSegment {
  speaker: number;
  text: string;
  start: number;
  end: number;
}

interface TranscriptionResponse {
  transcript: string;
  speakerSegments: SpeakerSegment[];
  totalSpeakers: number;
}

export default function WarmlyDashboard() {
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [transcript, setTranscript] = useState("");
  const [speakerSegments, setSpeakerSegments] = useState<SpeakerSegment[]>([]);
  const [totalSpeakers, setTotalSpeakers] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null); // Add this line
  const audioChunksRef = useRef<Blob[]>([]);

  const upcomingReminders = [];

  async function transcribeAudioWithDeepgram(audioBlob: Blob): Promise<TranscriptionResponse> {
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
      return {
        transcript: data.transcript || "",
        speakerSegments: data.speakerSegments || [],
        totalSpeakers: data.totalSpeakers || 0,
      };
    } catch (error) {
      console.error("Transcription error:", error);
      return {
        transcript: "Failed to transcribe audio.",
        speakerSegments: [],
        totalSpeakers: 0,
      };
    }
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSpeakerColor = (speakerIndex: number): string => {
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-orange-100 text-orange-800 border-orange-200",
      "bg-pink-100 text-pink-800 border-pink-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200",
    ];
    return colors[speakerIndex % colors.length];
  };

  const handleRecordingToggle = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaStreamRef.current = stream; // Store the stream reference
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          setIsTranscribing(true);
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
          const transcriptionData = await transcribeAudioWithDeepgram(audioBlob);
          setTranscript(transcriptionData.transcript);
          setSpeakerSegments(transcriptionData.speakerSegments);
          setTotalSpeakers(transcriptionData.totalSpeakers);
          setIsTranscribing(false);
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("🎙️ Error starting recording:", error);
      }
    } else {
      mediaRecorderRef.current?.stop();
      // Use the stored stream reference instead
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null; // Clean up the reference
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Warmly</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant={isRecording ? "destructive" : "default"}
              onClick={handleRecordingToggle}
              className="flex items-center space-x-2"
              disabled={isTranscribing}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>
                {isTranscribing 
                  ? "Transcribing..." 
                  : isRecording 
                    ? "Stop Recording" 
                    : "Start Recording"
                }
              </span>
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

        {/* Transcribing Status */}
        {isTranscribing && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center space-x-3 p-4">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-yellow-800 font-medium">Transcribing audio...</span>
              <span className="text-yellow-600 text-sm">
                Processing speech and identifying speakers
              </span>
            </CardContent>
          </Card>
        )}

        {/* Conversation Display */}
        {speakerSegments.length > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Conversation Transcript</span>
                  </CardTitle>
                  <CardDescription>
                    {totalSpeakers} speaker{totalSpeakers !== 1 ? 's' : ''} detected
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalSpeakers }, (_, i) => (
                    <div key={i} className={`px-2 py-1 rounded-full text-xs font-medium border ${getSpeakerColor(i)}`}>
                      Speaker {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-3">
                {speakerSegments.map((segment, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getSpeakerColor(segment.speaker)}`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-sm font-medium ${getSpeakerColor(segment.speaker).split(' ')[1]}`}>
                          Speaker {segment.speaker + 1}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(segment.start)} - {formatTime(segment.end)}
                        </span>
                      </div>
                      <p className="text-gray-800 bg-white p-3 rounded-lg border">
                        {segment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Full Transcript Toggle */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                  Show full transcript (combined)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                  <p className="whitespace-pre-wrap text-sm">{transcript}</p>
                </div>
              </details>
            </CardContent>
          </Card>
        )}

        {/* Legacy Transcript Display (fallback) */}
        {transcript && speakerSegments.length === 0 && (
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
              <p className="text-2xl font-bold text-gray-900 mt-2">—</p>
              <p className="text-sm text-green-600 mt-1">—</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Conversations</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">—</p>
              <p className="text-sm text-green-600 mt-1">—</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Follow-ups</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">—</p>
              <p className="text-sm text-orange-600 mt-1">—</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Opportunities</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">—</p>
              <p className="text-sm text-purple-600 mt-1">—</p>
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

            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-sm">
                Start recording to capture and analyze your networking conversations
              </p>
            </div>
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
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Contact management interface would be implemented here</p>
                  <p className="text-sm">Including filtering, tagging, and relationship tracking</p>
                </div>
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
                {upcomingReminders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No follow-ups scheduled</p>
                    <p className="text-sm">Follow-up reminders will appear here after conversations</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingReminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{reminder.contact}</p>
                          <p className="text-sm text-gray-600">{reminder.action}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-orange-600">{reminder.due}</p>
                          <Button size="sm" variant="outline" className="mt-1">
                            Mark Done
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
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
                      <span className="text-sm">SaaS/Tech</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Healthcare/Biotech</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "25%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">CleanTech</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: "20%" }}></div>
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
    </div>
  );
}