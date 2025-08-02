import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Mic, 
  History, 
  TrendingUp, 
  Clock, 
  Play,
  Target,
  Rocket,
  Presentation,
  Handshake
} from 'lucide-react';

export default function Dashboard() {
  const quickStats = [
    {
      title: 'Total Sessions',
      value: '12',
      change: '+3 this week',
      icon: Mic,
      color: 'text-blue-600'
    },
    {
      title: 'Avg Confidence',
      value: '78%',
      change: '+5% this month',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Practice Time',
      value: '2h 34m',
      change: '+45m this week',
      icon: Clock,
      color: 'text-purple-600'
    }
  ];

  const practiceCategories = [
    {
      name: 'Interview Practice',
      description: 'Common interview questions and scenarios',
      icon: Target,
      color: 'bg-blue-100 text-blue-600',
      href: '/practice?category=interview'
    },
    {
      name: 'Elevator Pitch',
      description: 'Perfect your 30-second introduction',
      icon: Rocket,
      color: 'bg-green-100 text-green-600',
      href: '/practice?category=elevator-pitch'
    },
    {
      name: 'Presentation Skills',
      description: 'Public speaking and presentation practice',
      icon: Presentation,
      color: 'bg-purple-100 text-purple-600',
      href: '/practice?category=presentation'
    },
    {
      name: 'Networking',
      description: 'Conversation starters and networking tips',
      icon: Handshake,
      color: 'bg-orange-100 text-orange-600',
      href: '/practice?category=networking'
    }
  ];

  const recentSessions = [
    {
      id: '1',
      category: 'Interview Practice',
      question: 'Tell me about yourself',
      confidence: 85,
      date: '2 hours ago',
      duration: '2:34'
    },
    {
      id: '2',
      category: 'Elevator Pitch',
      question: 'What value do you bring?',
      confidence: 72,
      date: '1 day ago',
      duration: '1:45'
    },
    {
      id: '3',
      category: 'Presentation Skills',
      question: 'Start with an engaging opening',
      confidence: 68,
      date: '2 days ago',
      duration: '3:12'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600">
            Ready to improve your speaking confidence? Let's practice!
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-green-600">{stat.change}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Practice Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mic className="mr-2 h-5 w-5" />
                Practice Categories
              </CardTitle>
              <CardDescription>
                Choose a category to start practicing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {practiceCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Link key={category.name} href={category.href}>
                    <Button variant="outline" className="w-full justify-start h-16">
                      <Icon className={`mr-3 h-5 w-5 ${category.color}`} />
                      <div className="text-left">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-gray-500">{category.description}</div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="mr-2 h-5 w-5" />
                Recent Sessions
              </CardTitle>
              <CardDescription>
                Your latest practice sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{session.category}</p>
                        <p className="text-xs text-gray-500">{session.question}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {session.confidence}% confidence
                          </Badge>
                          <span className="text-xs text-gray-500">{session.duration}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{session.date}</span>
                    </div>
                  ))}
                  <Link href="/history">
                    <Button variant="ghost" className="w-full mt-2">
                      View All Sessions
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No practice sessions yet</p>
                  <Link href="/practice">
                    <Button>
                      <Play className="mr-2 h-4 w-4" />
                      Start Your First Session
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>
              Jump right into a practice session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/practice">
                <Button size="lg" className="flex-1">
                  <Mic className="mr-2 h-5 w-5" />
                  Start Practice Session
                </Button>
              </Link>
              <Link href="/history">
                <Button variant="outline" size="lg" className="flex-1">
                  <History className="mr-2 h-5 w-5" />
                  View Progress
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
