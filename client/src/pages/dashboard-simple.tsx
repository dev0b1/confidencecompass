import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { useToast } from '../hooks/use-toast';
import { Mic, Play, Pause, Square, Loader2, CheckCircle, AlertCircle, Video, VideoOff } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface Question {
  id: string;
  question: string;
  audioUrl: string;
  duration: number;
  tips: string;
}

interface SpeechAnalysis {
  transcript: string;
  metrics: {
    fillerWords: number;
    speechRate: number;
    pauseDuration: number;
    confidence: number;
  };
  feedback: {
    summary: string;
    suggestions: string[];
  };
}

// API base URL - points to backend server
const API_BASE_URL = 'http://localhost:5000';

interface DashboardSimpleProps {
  initialCategory?: string | null;
}

export default function DashboardSimple({ initialCategory }: DashboardSimpleProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analysis, setAnalysis] = useState<SpeechAnalysis | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [videoRecorder, setVideoRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [videoChunks, setVideoChunks] = useState<Blob[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialCategory && categories.length > 0) {
      const category = categories.find(cat => cat.id === initialCategory);
      if (category) {
        setSelectedCategory(category);
        fetchQuestions(category.id);
      }
    }
  }, [initialCategory, categories]);

  // Fetch questions when category is selected
  useEffect(() => {
    if (selectedCategory && !initialCategory) {
      fetchQuestions(selectedCategory.id);
    }
  }, [selectedCategory, initialCategory]);

  // Handle countdown timer
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      startRecording();
    }
  }, [countdown]);

  // Handle recording timer
  useEffect(() => {
    if (isRecording && selectedQuestion) {
      const timer = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= selectedQuestion.duration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRecording, selectedQuestion]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchQuestions = async (categoryId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}/questions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
    }
  };

  const playQuestionAudio = async (question: Question) => {
    try {
      // For now, we'll use a mock audio since we don't have actual audio files
      // In a real implementation, you'd load the actual audio file
      toast({
        title: "Audio Playback",
        description: `Playing: ${question.question}`,
      });
      
      // Simulate audio playback
      setIsPlayingAudio(true);
      setTimeout(() => {
        setIsPlayingAudio(false);
        startCountdown();
      }, 2000);
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Error",
        description: "Failed to play audio",
        variant: "destructive",
      });
    }
  };

  const startCountdown = () => {
    setCountdown(3);
  };

  const startRecording = async () => {
    try {
      // Get both audio and video streams
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      
      // Set video stream for display
      setVideoStream(stream);
      
      // Create audio recorder
      const audioRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const audioChunks: Blob[] = [];
      
      audioRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      audioRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioChunks(audioChunks);
        analyzeSpeech(audioBlob);
      };
      
      // Create video recorder
      const videoRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const videoChunks: Blob[] = [];
      
      videoRecorder.ondataavailable = (event) => {
        videoChunks.push(event.data);
      };
      
      videoRecorder.onstop = () => {
        const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
        setVideoChunks(videoChunks);
        const videoUrl = URL.createObjectURL(videoBlob);
        setVideoUrl(videoUrl);
      };
      
      // Start both recorders
      audioRecorder.start();
      videoRecorder.start();
      
      setMediaRecorder(audioRecorder);
      setVideoRecorder(videoRecorder);
      setIsRecording(true);
      setIsVideoRecording(true);
      setRecordingTime(0);
      setAnalysis(null);
      setVideoUrl(null);
      
      toast({
        title: "Recording Started",
        description: "Speak clearly and look at the camera",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to start recording. Please check camera and microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (videoRecorder && videoRecorder.state !== 'inactive') {
      videoRecorder.stop();
    }
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    
    setIsRecording(false);
    setIsVideoRecording(false);
    setCountdown(null);
    
    toast({
      title: "Recording Stopped",
      description: "Analyzing your speech...",
    });
  };

  const analyzeSpeech = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    
    try {
      // Convert audio to base64 for API
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      const response = await fetch(`${API_BASE_URL}/api/analyze-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: base64Audio,
          questionId: selectedQuestion?.id,
          categoryId: selectedCategory?.id,
        }),
      });
      
      const data = await response.json();
      setAnalysis(data);
      
      toast({
        title: "Analysis Complete",
        description: "Your speech has been analyzed",
      });
    } catch (error) {
      console.error('Error analyzing speech:', error);
      toast({
        title: "Error",
        description: "Failed to analyze speech",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Speech Practice</h1>
          <p className="text-gray-600 mt-2">Improve your speaking skills with AI-powered feedback</p>
        </div>
        {selectedQuestion && (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {selectedCategory?.name}
            </Badge>
            <Badge variant="outline">
              {formatTime(recordingTime)} / {formatTime(selectedQuestion.duration)}
            </Badge>
          </div>
        )}
      </div>

      {/* Categories Grid */}
      {!selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedCategory(category)}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{category.icon}</span>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Questions List */}
      {selectedCategory && !selectedQuestion && (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedCategory(null)}
            >
              ← Back to Categories
            </Button>
            <h2 className="text-xl font-semibold">{selectedCategory.name}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((question) => (
              <Card key={question.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{question.question}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline">
                        {formatTime(question.duration)}
                      </Badge>
                      <span className="text-sm text-gray-600">{question.tips}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setSelectedQuestion(question)}
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Practice
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Practice Session */}
      {selectedQuestion && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                setSelectedQuestion(null);
                setAnalysis(null);
                setRecordingTime(0);
                setCountdown(null);
                setIsRecording(false);
              }}
            >
              ← Back to Questions
            </Button>
            <h2 className="text-xl font-semibold">{selectedQuestion.question}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Practice Area */}
            <Card>
              <CardHeader>
                <CardTitle>Practice Session</CardTitle>
                <CardDescription>
                  Listen to the question, then record your response with video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Preview/Recording */}
                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                  {videoStream && isVideoRecording ? (
                    <video
                      ref={(video) => {
                        if (video) video.srcObject = videoStream;
                      }}
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : videoUrl ? (
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <Video className="w-12 h-12 mx-auto mb-2" />
                        <p>Camera preview will appear here</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Recording indicator */}
                  {isVideoRecording && (
                    <div className="absolute top-2 right-2 flex items-center space-x-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>REC</span>
                    </div>
                  )}
                </div>

                {/* Audio Playback */}
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => playQuestionAudio(selectedQuestion)}
                    disabled={isPlayingAudio || isRecording}
                    variant="outline"
                  >
                    {isPlayingAudio ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Play Question
                  </Button>
                </div>

                {/* Countdown */}
                {countdown !== null && countdown > 0 && (
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold text-blue-600">
                      {countdown}
                    </div>
                    <p className="text-gray-600">Get ready to speak...</p>
                  </div>
                )}

                {/* Recording Controls */}
                <div className="flex items-center justify-center space-x-4">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      disabled={countdown !== null || isAnalyzing}
                      size="lg"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Video className="w-5 h-5 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      size="lg"
                      variant="destructive"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                </div>

                {/* Recording Progress */}
                {isRecording && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Recording...</span>
                      <span>{formatTime(recordingTime)} / {formatTime(selectedQuestion.duration)}</span>
                    </div>
                    <Progress 
                      value={(recordingTime / selectedQuestion.duration) * 100} 
                      className="w-full"
                    />
                  </div>
                )}

                {/* Analysis Loading */}
                {isAnalyzing && (
                  <div className="text-center py-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-gray-600">Analyzing your speech...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysis && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>
                    AI-powered feedback on your speech
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analysis.metrics.fillerWords}</div>
                      <div className="text-sm text-gray-600">Filler Words</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analysis.metrics.speechRate}</div>
                      <div className="text-sm text-gray-600">Words/Min</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{analysis.metrics.pauseDuration}s</div>
                      <div className="text-sm text-gray-600">Pause Time</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getConfidenceColor(analysis.metrics.confidence)}`}>
                        {Math.round(analysis.metrics.confidence * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Confidence</div>
                    </div>
                  </div>

                  {/* Transcript */}
                  <div>
                    <h4 className="font-semibold mb-2">Transcript</h4>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                      {analysis.transcript}
                    </div>
                  </div>

                  {/* Feedback */}
                  <div>
                    <h4 className="font-semibold mb-2">AI Feedback</h4>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm mb-2">{analysis.feedback.summary}</p>
                      <ul className="text-sm space-y-1">
                        {analysis.feedback.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 