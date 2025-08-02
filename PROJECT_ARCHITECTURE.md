# Confidence Compass - Project Architecture

## 🏗️ System Overview

Confidence Compass is an AI-powered speech practice application that helps users improve their public speaking skills through structured practice sessions and AI feedback.

### Core Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Services   │
│   (React)       │◄──►│   (Express)     │◄──►│   (OpenAI)      │
│                 │    │                 │    │   (OpenRouter)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
confidencecompass/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ui/                # Base UI components (Radix UI)
│   │   │   ├── layout/            # Layout components
│   │   │   │   └── sidebar.tsx    # Navigation sidebar
│   │   │   └── status/            # Status components
│   │   │       └── feature-status.tsx
│   │   ├── pages/                 # Main application pages
│   │   │   ├── dashboard-simple.tsx  # Main speech practice interface
│   │   │   ├── session-history.tsx   # Session history page
│   │   │   └── settings.tsx          # Settings page
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── lib/                   # Utility functions
│   │   └── App.tsx                # Main app component
│   └── index.html                 # HTML entry point
├── server/                         # Backend Express API
│   ├── index.ts                   # Main server file with API routes
│   └── speech-analysis.ts         # AI analysis service
├── shared/                        # Shared TypeScript types
│   └── schema.ts                  # TypeScript interfaces
├── README.md                      # Main documentation
├── SETUP_SIMPLE.md               # Setup guide
├── REFACTOR_SUMMARY.md           # Refactoring overview
├── REFACTOR_CHECKLIST.md         # Refactoring checklist
├── PROJECT_ARCHITECTURE.md       # This file
├── DATA_FLOW.md                  # Data flow documentation
└── package.json                  # Dependencies
```

## 🔄 Data Flow

### 1. User Interaction Flow
```
User selects category → Chooses question → Records audio → Gets AI feedback
```

### 2. API Request Flow
```
Frontend → Backend API → AI Services → Response → Frontend Display
```

### 3. Speech Analysis Flow
```
Audio Recording → Base64 Encoding → OpenAI Whisper → Text Analysis → GPT-4 Feedback
```

## 🎯 Core Components

### Frontend Components

#### `dashboard-simple.tsx` (Main Interface)
- **Purpose**: Main speech practice interface
- **Key Features**:
  - Category selection
  - Question browsing
  - Audio recording with countdown
  - Real-time progress tracking
  - Analysis results display

#### `sidebar.tsx` (Navigation)
- **Purpose**: Application navigation
- **Features**: Links to different pages

#### `feature-status.tsx` (System Status)
- **Purpose**: Display system health and feature status
- **Features**: Shows which services are available

### Backend Services

#### `index.ts` (API Server)
- **Purpose**: Express server with API endpoints
- **Key Endpoints**:
  - `GET /api/health` - Server status
  - `GET /api/categories` - Get practice categories
  - `GET /api/categories/:id/questions` - Get questions
  - `POST /api/analyze-speech` - Analyze speech

#### `speech-analysis.ts` (AI Service)
- **Purpose**: AI-powered speech analysis
- **Features**:
  - OpenAI Whisper transcription
  - Filler word detection
  - Speech rate calculation
  - Confidence scoring
  - GPT-4 feedback generation
  - OpenRouter fallback

## 🔧 Technology Stack

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Radix UI**: Accessible components
- **React Query**: Data fetching
- **Vite**: Build tool

### Backend
- **Node.js**: Runtime
- **Express**: Web framework
- **TypeScript**: Type safety
- **CORS**: Cross-origin support

### AI Services
- **OpenAI API**: Primary AI service
  - Whisper: Speech transcription
  - GPT-4: Feedback generation
- **OpenRouter**: Fallback AI service
  - Mistral-7B: Alternative feedback model

### Development
- **ESBuild**: Production builds
- **TSX**: Development runtime

## 📊 Data Models

### PracticeCategory
```typescript
interface PracticeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}
```

### PracticeQuestion
```typescript
interface PracticeQuestion {
  id: string;
  question: string;
  audioUrl: string;
  duration: number;
  tips: string;
  categoryId: string;
}
```

### SpeechAnalysis
```typescript
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
```

## 🔐 Environment Variables

### Required
- `OPENAI_API_KEY`: OpenAI API key for transcription and feedback

### Optional
- `OPENROUTER_API_KEY`: OpenRouter API key for fallback AI service
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)

## 🚀 API Endpoints

### Health Check
```
GET /api/health
Response: { status: 'ok', message: string, environment: string, timestamp: string }
```

### Categories
```
GET /api/categories
Response: PracticeCategory[]
```

### Questions
```
GET /api/categories/:categoryId/questions
Response: PracticeQuestion[]
```

### Speech Analysis
```
POST /api/analyze-speech
Body: { audioData: string, questionId: string, categoryId: string }
Response: SpeechAnalysis
```

## 🔄 State Management

### Frontend State
- **Categories**: Available practice categories
- **Questions**: Questions for selected category
- **Recording State**: Current recording status
- **Analysis Results**: Speech analysis and feedback

### Backend State
- **Server Status**: Health and configuration
- **AI Service Status**: Available AI services

## 🎯 Key Features

### Speech Practice
1. **Category Selection**: Choose practice type
2. **Question Browsing**: Browse relevant questions
3. **Audio Recording**: Record responses with timer
4. **Real-time Feedback**: Instant analysis and suggestions

### AI Analysis
1. **Speech Transcription**: Convert audio to text
2. **Metrics Calculation**: Analyze speech patterns
3. **Feedback Generation**: AI-powered improvement suggestions

### User Experience
1. **Clean Interface**: Modern, responsive design
2. **Progress Tracking**: Visual progress indicators
3. **Error Handling**: Graceful error management

## 🔧 Configuration

### CORS Configuration
```typescript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### AI Service Configuration
- **Primary**: OpenAI GPT-4 for feedback
- **Fallback**: OpenRouter Mistral-7B
- **Transcription**: OpenAI Whisper

## 🚀 Deployment

### Development
```bash
npm run dev:full  # Start both frontend and backend
```

### Production
```bash
npm run build     # Build for production
npm start         # Start production server
```

## 📈 Scalability Considerations

### Current Architecture
- Single-page application
- RESTful API
- Stateless backend
- Client-side state management

### Future Enhancements
- Database integration for session storage
- User authentication and accounts
- Real-time collaboration features
- Mobile app version

---

**This architecture provides a solid foundation for an AI-powered speech practice application with clear separation of concerns and extensible design.** 