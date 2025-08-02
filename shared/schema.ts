// Speech practice types
export interface PracticeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface PracticeQuestion {
  id: string;
  question: string;
  audioUrl: string;
  duration: number;
  tips: string;
  categoryId: string;
}

export interface SpeechAnalysis {
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

export interface PracticeSession {
  id: string;
  categoryId: string;
  questionId: string;
  analysis: SpeechAnalysis;
  createdAt: Date;
}

// Voice analysis types
export interface VoiceMetric {
  volume: number;
  pitch: number;
  clarity: number;
  pace: number;
  timestamp: number;
}
