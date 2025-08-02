import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { History, Play, Calendar, TrendingUp, Clock } from 'lucide-react';

interface Session {
  id: string;
  category_id: string;
  question_id: string;
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
  duration_seconds: number;
  confidence_score: number;
  created_at: string;
  categories?: {
    name: string;
    icon: string;
  };
  questions?: {
    question: string;
  };
}

// API base URL - points to backend server
const API_BASE_URL = 'http://localhost:5000';

export default function SessionHistory() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch session history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session History</h1>
          <p className="text-gray-600 mt-2">Review your past practice sessions and track your progress</p>
        </div>
        <Button onClick={fetchSessions} variant="outline">
          <History className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold">{sessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Avg Confidence</p>
                  <p className="text-2xl font-bold">
                    {Math.round(sessions.reduce((acc, s) => acc + s.confidence_score, 0) / sessions.length * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Time</p>
                  <p className="text-2xl font-bold">
                    {formatDuration(sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Last Session</p>
                  <p className="text-sm font-bold">
                    {sessions[0] ? formatDate(sessions[0].created_at) : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sessions List */}
      {sessions.length === 0 ? (
      <Card>
          <CardContent className="p-8 text-center">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions yet</h3>
            <p className="text-gray-600 mb-4">Start your first practice session to see your history here</p>
            <Button onClick={() => window.location.href = '/'}>
              <Play className="w-4 h-4 mr-2" />
              Start Practice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{session.categories?.icon || '🎤'}</span>
                    <div>
                      <CardTitle className="text-lg">
                        {session.categories?.name || 'Practice Session'}
          </CardTitle>
                      <CardDescription>
                        {session.questions?.question || 'Practice question'}
                      </CardDescription>
            </div>
                      </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {formatDate(session.created_at)}
                          </Badge>
                    <Badge className={getConfidenceColor(session.confidence_score)}>
                      {Math.round(session.confidence_score * 100)}% Confidence
                          </Badge>
                        </div>
                      </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Metrics */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {session.metrics?.fillerWords || 0}
                    </div>
                    <div className="text-xs text-gray-600">Filler Words</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {session.metrics?.speechRate || 0}
                    </div>
                    <div className="text-xs text-gray-600">Words/Min</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {session.metrics?.pauseDuration || 0}s
                    </div>
                    <div className="text-xs text-gray-600">Pause Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">
                      {formatDuration(session.duration_seconds || 0)}
                    </div>
                    <div className="text-xs text-gray-600">Duration</div>
                  </div>
                </div>

                {/* Transcript Preview */}
                {session.transcript && (
                  <div>
                    <h4 className="font-semibold mb-2">Transcript</h4>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm max-h-20 overflow-y-auto">
                      {session.transcript.length > 200 
                        ? `${session.transcript.substring(0, 200)}...`
                        : session.transcript
                      }
                    </div>
                  </div>
                )}

                {/* Feedback Summary */}
                {session.feedback?.summary && (
                  <div>
                    <h4 className="font-semibold mb-2">AI Feedback</h4>
                    <div className="p-3 bg-blue-50 rounded-lg text-sm">
                      {session.feedback.summary}
                    </div>
            </div>
          )}
        </CardContent>
      </Card>
          ))}
        </div>
      )}
    </div>
  );
}
