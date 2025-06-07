"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Mic,
  MicOff,
  Users,
  Calendar,
  MapPin,
  Bell,
  Search,
  Plus,
  TrendingUp,
  Clock,
  Heart,
  AlertCircle,
} from "lucide-react"

export default function WarmlyDashboard() {
  const [isRecording, setIsRecording] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const recentConversations = [
    {
      id: 1,
      name: "Sarah Chen",
      title: "VP of Engineering",
      company: "TechFlow Inc",
      industry: "SaaS",
      location: "San Francisco, CA",
      timestamp: "2 hours ago",
      duration: "12 min",
      keyPoints: ["Looking for AI integration partners", "Expanding team in Q2", "Interested in our ML capabilities"],
      interests: ["Machine Learning", "Team Building", "Product Strategy"],
      followUp: "Send portfolio of AI projects",
      priority: "high",
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      title: "Founder",
      company: "GreenTech Solutions",
      industry: "CleanTech",
      location: "Austin, TX",
      timestamp: "5 hours ago",
      duration: "8 min",
      keyPoints: ["Seeking sustainability consultants", "Planning Series A", "Mentioned mutual connection"],
      interests: ["Sustainability", "Fundraising", "Network Building"],
      followUp: "Intro to Sarah from Acme Ventures",
      priority: "medium",
    },
    {
      id: 3,
      name: "Dr. Emily Watson",
      title: "Research Director",
      company: "BioInnovate Labs",
      industry: "Biotech",
      location: "Boston, MA",
      timestamp: "1 day ago",
      duration: "15 min",
      keyPoints: [
        "Discussing collaboration opportunities",
        "Shared research interests",
        "Conference speaking opportunity",
      ],
      interests: ["Biotech Research", "Academic Partnerships", "Public Speaking"],
      followUp: "Schedule follow-up call next week",
      priority: "high",
    },
  ]

  const upcomingReminders = [
    { id: 1, contact: "Sarah Chen", action: "Send AI portfolio", due: "Today, 3:00 PM" },
    { id: 2, contact: "Marcus Rodriguez", action: "Make intro to Sarah", due: "Tomorrow, 10:00 AM" },
    { id: 3, contact: "Dr. Emily Watson", action: "Schedule follow-up call", due: "Friday, 2:00 PM" },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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
              onClick={() => setIsRecording(!isRecording)}
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
              <span className="text-red-600 text-sm">Ensure all participants have consented to recording</span>
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
              <p className="text-2xl font-bold text-gray-900 mt-2">247</p>
              <p className="text-sm text-green-600 mt-1">+12 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Conversations</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">18</p>
              <p className="text-sm text-green-600 mt-1">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Follow-ups</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">5</p>
              <p className="text-sm text-orange-600 mt-1">Due today</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Opportunities</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">23</p>
              <p className="text-sm text-purple-600 mt-1">Active leads</p>
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

            <div className="space-y-4">
              {recentConversations.map((conversation) => (
                <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                          <AvatarFallback>
                            {conversation.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{conversation.name}</CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            <span>
                              {conversation.title} at {conversation.company}
                            </span>
                            <Badge variant="outline">{conversation.industry}</Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center space-x-1 mb-1">
                          <Clock className="w-3 h-3" />
                          <span>{conversation.timestamp}</span>
                        </div>
                        <Badge className={getPriorityColor(conversation.priority)}>
                          {conversation.priority} priority
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{conversation.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{conversation.duration}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Key Points:</h4>
                      <ul className="space-y-1">
                        {conversation.keyPoints.map((point, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Interests:</h4>
                      <div className="flex flex-wrap gap-2">
                        {conversation.interests.map((interest, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Heart className="w-3 h-3 mr-1" />
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">Follow-up Action:</h4>
                          <p className="text-sm text-blue-800">{conversation.followUp}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Management</CardTitle>
                <CardDescription>
                  All contacts extracted from your conversations, organized by industry and relationship strength.
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
                <div className="space-y-3">
                  {upcomingReminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
  )
}
