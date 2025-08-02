# Confidence Compass - Data Flow Documentation

## 🔄 Overview

This document describes how data flows through the Confidence Compass application, from user interaction to AI analysis and back to the user interface.

## 📊 Data Flow Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │  Frontend   │    │   Backend   │    │   AI APIs   │
│ Interaction │───►│   React     │───►│   Express   │───►│  OpenAI/    │
│             │    │             │    │             │    │ OpenRouter  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       ▲                   ▲                   ▲                   │
       │                   │                   │                   │
       └───────────────────┼───────────────────┼───────────────────┘
                           │                   │
                    ┌─────────────┐    ┌─────────────┐
                    │   Analysis  │    │   Response  │
                    │   Results   │    │   Display   │
                    └─────────────┘    └─────────────┘
```

## 🎯 Detailed Flow Steps

### 1. User Interaction Flow

#### Step 1: Category Selection
```
User clicks category → Frontend fetches categories → Displays category list
```

**Data Flow:**
1. User selects a practice category (e.g., "Interview Practice")
2. Frontend calls `GET /api/categories`
3. Backend returns category data
4. Frontend displays category options

**Data Structure:**
```typescript
interface PracticeCategory {
  id: string;        // "interview"
  name: string;      // "Interview Practice"
  description: string; // "Common interview questions..."
  icon: string;      // "🎯"
}
```

#### Step 2: Question Selection
```
User selects question → Frontend fetches questions → Displays question details
```

**Data Flow:**
1. User clicks on a category
2. Frontend calls `GET /api/categories/:categoryId/questions`
3. Backend returns questions for that category
4. Frontend displays question list with details

**Data Structure:**
```typescript
interface PracticeQuestion {
  id: string;        // "tell-me-about-yourself"
  question: string;  // "Tell me about yourself"
  audioUrl: string;  // "/audio/interview/tell-me-about-yourself.mp3"
  duration: number;  // 120 (seconds)
  tips: string;      // "Focus on relevant experience..."
  categoryId: string; // "interview"
}
```

#### Step 3: Audio Recording
```
User starts recording → Frontend captures audio → Converts to base64
```

**Data Flow:**
1. User clicks "Start Recording"
2. Frontend requests microphone permission
3. MediaRecorder captures audio stream
4. Audio is converted to base64 string
5. Recording state is managed in React state

**Data Structure:**
```typescript
// Audio data as base64 string
const audioData = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT..."
```

### 2. API Request Flow

#### Step 4: Speech Analysis Request
```
Frontend sends audio → Backend receives → Processes with AI → Returns analysis
```

**Data Flow:**
1. Frontend sends POST request to `/api/analyze-speech`
2. Request body contains:
   ```typescript
   {
     audioData: string;    // Base64 encoded audio
     questionId: string;   // "tell-me-about-yourself"
     categoryId: string;   // "interview"
   }
   ```
3. Backend receives request
4. Backend processes audio with AI services
5. Backend returns analysis results

### 3. AI Processing Flow

#### Step 5: Speech Transcription
```
Audio data → OpenAI Whisper → Text transcript
```

**Data Flow:**
1. Backend receives base64 audio data
2. Converts to buffer: `Buffer.from(audioData, 'base64')`
3. Sends to OpenAI Whisper API
4. Receives text transcript
5. Handles errors gracefully with fallback

**API Call:**
```typescript
const transcription = await openai.audio.transcriptions.create({
  file: new Blob([buffer], { type: 'audio/wav' }),
  model: "whisper-1",
  response_format: "text"
});
```

#### Step 6: Text Analysis
```
Transcript → Metrics calculation → Speech analysis
```

**Data Flow:**
1. Backend receives transcript text
2. Analyzes for filler words: `['um', 'uh', 'like', 'you know', ...]`
3. Calculates speech rate (words per minute)
4. Estimates pause duration
5. Computes confidence score

**Analysis Logic:**
```typescript
// Filler word detection
const fillerWords = ['um', 'uh', 'like', 'you know', 'i mean', ...];
let fillerWordCount = 0;
fillerWords.forEach(filler => {
  const regex = new RegExp(`\\b${filler}\\b`, 'gi');
  const matches = transcript.match(regex);
  if (matches) {
    fillerWordCount += matches.length;
  }
});

// Confidence calculation
const confidence = Math.max(0, Math.min(1, 
  1 - (fillerWordCount / Math.max(wordCount, 1)) * 0.5 - 
  (pauseDuration / 60) * 0.3
));
```

#### Step 7: AI Feedback Generation
```
Analysis data → GPT-4 → Structured feedback
```

**Data Flow:**
1. Backend prepares prompt with transcript and metrics
2. Sends to OpenAI GPT-4 (primary) or OpenRouter Mistral-7B (fallback)
3. Receives AI-generated feedback
4. Parses response into structured format

**Prompt Structure:**
```typescript
const prompt = `You are an expert speech coach analyzing a practice response.

Question Category: ${categoryId}
Question ID: ${questionId}

Transcript: "${transcript}"

Metrics:
- Filler words: ${metrics.fillerWords}
- Speech rate: ${metrics.speechRate} words per minute
- Pause duration: ${metrics.pauseDuration} seconds
- Confidence score: ${Math.round(metrics.confidence * 100)}%

Please provide:
1. A brief summary (2-3 sentences) of the overall performance
2. 3 specific, actionable suggestions for improvement`;
```

**Fallback Logic:**
```typescript
try {
  // Try OpenAI first
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [...],
    max_tokens: 300,
    temperature: 0.7
  });
} catch (openaiError) {
  // Fallback to OpenRouter
  const completion = await openRouterClient.chat.completions.create({
    model: "mistralai/mistral-7b-instruct",
    messages: [...],
    max_tokens: 300,
    temperature: 0.7
  });
}
```

### 4. Response Flow

#### Step 8: Analysis Results
```
Backend → Frontend → User display
```

**Data Flow:**
1. Backend returns structured analysis
2. Frontend receives response
3. Frontend updates UI with results
4. User sees analysis and feedback

**Response Structure:**
```typescript
interface SpeechAnalysis {
  transcript: string;
  metrics: {
    fillerWords: number;    // 5
    speechRate: number;     // 120 (words per minute)
    pauseDuration: number;  // 15.5 (seconds)
    confidence: number;     // 0.75 (0-1 scale)
  };
  feedback: {
    summary: string;        // "Good effort! You spoke clearly..."
    suggestions: string[];  // ["Try to reduce filler words...", ...]
  };
}
```

## 🔧 Error Handling Flow

### 1. Network Errors
```
Request fails → Frontend shows error → User can retry
```

### 2. AI Service Errors
```
OpenAI fails → Try OpenRouter → If both fail → Show default feedback
```

### 3. Audio Recording Errors
```
Microphone denied → Show permission error → Guide user to enable
```

## 📊 State Management

### Frontend State
```typescript
// Main application state
const [categories, setCategories] = useState<PracticeCategory[]>([]);
const [selectedCategory, setSelectedCategory] = useState<PracticeCategory | null>(null);
const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
const [selectedQuestion, setSelectedQuestion] = useState<PracticeQuestion | null>(null);
const [isRecording, setIsRecording] = useState(false);
const [analysis, setAnalysis] = useState<SpeechAnalysis | null>(null);
```

### Backend State
```typescript
// Server configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## 🚀 Performance Considerations

### 1. Audio Processing
- **Base64 encoding**: Efficient for API transmission
- **File size limits**: 50MB limit for audio data
- **Compression**: Consider audio compression for large files

### 2. AI Service Optimization
- **Caching**: Cache common responses
- **Rate limiting**: Handle API rate limits gracefully
- **Fallback strategy**: Multiple AI service providers

### 3. Frontend Optimization
- **Lazy loading**: Load components on demand
- **State persistence**: Save user progress
- **Error boundaries**: Graceful error handling

## 🔐 Security Considerations

### 1. API Security
- **CORS configuration**: Restrict origins in production
- **Input validation**: Validate all user inputs
- **Rate limiting**: Prevent abuse

### 2. Data Privacy
- **Audio data**: Temporary storage only
- **User data**: No persistent storage currently
- **API keys**: Secure environment variable storage

## 📈 Monitoring and Logging

### 1. Request Logging
```typescript
// Log all API requests
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
});
```

### 2. Error Tracking
- **Frontend errors**: Console logging and user feedback
- **Backend errors**: Server-side logging
- **AI service errors**: Detailed error tracking

---

**This data flow ensures reliable, scalable, and user-friendly speech practice functionality with robust error handling and performance optimization.** 