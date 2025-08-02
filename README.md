# Confidence Compass - AI Speech Practice App

A full-stack AI-powered public speaking and interview practice web application that helps users build speaking confidence through structured practice sessions and AI feedback.

## 🚀 Features

### Core Functionality
- **Practice Categories**: Interview, Elevator Pitch, Presentation Skills, Networking
- **Audio Prompts**: Pre-recorded questions for each practice scenario
- **Voice Recording**: Built-in microphone recording with countdown timer
- **Speech Analysis**: AI-powered analysis using OpenAI Whisper and GPT-4
- **Real-time Feedback**: Instant feedback on speech patterns and improvement suggestions

### Analysis Metrics
- **Filler Words Count**: Detects "um", "like", "you know", etc.
- **Speech Rate**: Words per minute calculation
- **Pause Duration**: Dead air detection and measurement
- **Confidence Score**: Overall speaking confidence based on multiple factors

### AI Feedback
- **Personalized Suggestions**: GPT-4 powered feedback specific to each practice session
- **Actionable Advice**: Practical tips for immediate improvement
- **Progress Tracking**: Session history and performance metrics

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Query** for data fetching

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **OpenAI API** for speech transcription and analysis
- **ESBuild** for production builds

### Development
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting

## 📁 Project Structure

```
confidencecompass/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Backend Express API
│   ├── index.ts           # Main server file
│   └── speech-analysis.ts # Speech analysis service
├── shared/                # Shared types and schemas
└── package.json           # Project dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd confidencecompass
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start development servers**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start them separately
   npm run dev          # Backend only
   npm run dev:client   # Frontend only
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📋 API Endpoints

### Health Check
- `GET /api/health` - Server status

### Practice Categories
- `GET /api/categories` - Get all practice categories
- `GET /api/categories/:id/questions` - Get questions for a category

### Speech Analysis
- `POST /api/analyze-speech` - Analyze recorded speech

## 🎯 Usage Guide

### 1. Select a Practice Category
Choose from Interview Practice, Elevator Pitch, Presentation Skills, or Networking.

### 2. Choose a Question
Browse through relevant questions for your selected category. Each question includes:
- Audio prompt (simulated for now)
- Duration limit
- Helpful tips

### 3. Practice Session
1. **Listen to the question** - Click "Play Question" to hear the prompt
2. **Prepare** - 3-second countdown gives you time to get ready
3. **Record** - Click "Start Recording" and speak your response
4. **Stop** - Click "Stop Recording" when finished or when time runs out

### 4. Review Analysis
Get instant feedback including:
- **Transcript** of your speech
- **Metrics**: filler words, speech rate, pause duration, confidence
- **AI Feedback**: personalized suggestions for improvement

## 🔧 Development

### Project Scripts
```bash
npm run dev          # Start backend server
npm run dev:client   # Start frontend dev server
npm run dev:full     # Start both servers
npm run build        # Build for production
npm run start        # Start production server
npm run check        # TypeScript type checking
```

### Code Structure
- **Components**: Reusable UI components in `client/src/components/`
- **Pages**: Main page components in `client/src/pages/`
- **API**: Backend endpoints in `server/index.ts`
- **Services**: Business logic in `server/speech-analysis.ts`

### Adding New Features
1. **New Practice Category**: Add to `server/index.ts` categories array
2. **New Questions**: Add to the questionsByCategory object
3. **New Analysis Metrics**: Extend the SpeechMetrics interface
4. **UI Components**: Create in `client/src/components/`

## 🎨 Customization

### Styling
- Uses Tailwind CSS for styling
- Custom components in `client/src/components/ui/`
- Theme can be customized in `tailwind.config.ts`

### Audio Files
Currently uses simulated audio. To add real audio files:
1. Place `.mp3` files in `public/audio/` directory
2. Update question objects with correct `audioUrl` paths
3. Implement actual audio playback in `playQuestionAudio` function

### AI Analysis
The speech analysis can be customized by modifying:
- `server/speech-analysis.ts` - Analysis logic
- Filler word detection patterns
- Confidence scoring algorithm
- GPT-4 prompt engineering

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Required for production:
- `OPENAI_API_KEY` - OpenAI API key for speech analysis
- `NODE_ENV=production` - Production environment
- `PORT` - Server port (default: 5000)

## 📈 Future Enhancements

### Planned Features
- [ ] User authentication and session management
- [ ] Progress tracking and analytics dashboard
- [ ] Custom practice question creation
- [ ] Video recording and analysis
- [ ] Real-time speech coaching
- [ ] Integration with calendar for practice scheduling
- [ ] Export practice sessions and feedback
- [ ] Mobile app version

### Technical Improvements
- [ ] Database integration for session storage
- [ ] Real audio file support
- [ ] Advanced speech analysis algorithms
- [ ] Performance optimizations
- [ ] Comprehensive testing suite

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include steps to reproduce the problem

---

**Built with ❤️ for helping people build confidence in public speaking**
