# Confidence Compass - Simple Setup Guide

This is a simplified version of the Confidence Compass app, focused on AI-powered speech practice without complex real-time features.

## 🚀 Quick Setup

### 1. Prerequisites
- Node.js 18+ installed
- OpenAI API key (for speech analysis)
- Modern web browser with microphone support

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd confidencecompass

# Install dependencies
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
# Required for speech analysis
OPENAI_API_KEY=your_openai_api_key_here

# Optional - defaults to development
NODE_ENV=development

# Optional - defaults to 5000
PORT=5000
```

### 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev:full

# Or start them separately:
npm run dev          # Backend server (port 5000)
npm run dev:client   # Frontend server (port 3000)
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🎯 Core Features

### Speech Practice Categories
- **Interview Practice**: Common interview questions
- **Elevator Pitch**: 30-second introductions
- **Presentation Skills**: Public speaking practice
- **Networking**: Conversation starters

### AI Analysis
- **Speech Transcription**: OpenAI Whisper
- **Filler Word Detection**: "um", "like", "you know", etc.
- **Speech Rate**: Words per minute
- **Pause Detection**: Silence measurement
- **Confidence Scoring**: Overall speaking confidence
- **AI Feedback**: GPT-4 powered suggestions

## 🛠️ Architecture

### Frontend (React + TypeScript)
- **Pages**: Main application views
- **Components**: Reusable UI elements
- **Hooks**: Custom React hooks
- **Lib**: Utility functions

### Backend (Express + TypeScript)
- **API Routes**: RESTful endpoints
- **Speech Analysis**: OpenAI integration
- **Error Handling**: Comprehensive error management

### Shared
- **Types**: TypeScript interfaces
- **Schemas**: Data validation

## 📁 Key Files

```
confidencecompass/
├── client/src/
│   ├── pages/
│   │   └── dashboard-simple.tsx    # Main speech practice interface
│   ├── components/
│   │   ├── ui/                     # UI components
│   │   └── layout/
│   │       └── sidebar.tsx         # Navigation
│   └── App.tsx                     # App entry point
├── server/
│   ├── index.ts                    # Express server
│   └── speech-analysis.ts          # AI analysis service
├── shared/
│   └── schema.ts                   # TypeScript types
└── package.json
```

## 🔧 Customization

### Adding New Practice Categories

Edit `server/index.ts` and add to the categories array:

```typescript
{
  id: 'your-category',
  name: 'Your Category Name',
  description: 'Description of the category',
  icon: '🎯'
}
```

### Adding New Questions

Add questions to the `questionsByCategory` object:

```typescript
'your-category': [
  {
    id: 'question-id',
    question: 'Your question text?',
    audioUrl: '/audio/your-category/question.mp3',
    duration: 90, // seconds
    tips: 'Helpful tips for this question'
  }
]
```

### Customizing Speech Analysis

Modify `server/speech-analysis.ts`:

- **Filler Words**: Update the `fillerWords` array
- **Confidence Scoring**: Adjust the calculation algorithm
- **AI Feedback**: Customize the GPT-4 prompt

## 🚀 Production Deployment

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production

```env
NODE_ENV=production
OPENAI_API_KEY=your_openai_api_key
PORT=5000
```

### Deployment Options

- **Vercel**: Deploy frontend and backend separately
- **Railway**: Full-stack deployment
- **Heroku**: Traditional deployment
- **Docker**: Containerized deployment

## 🐛 Troubleshooting

### Common Issues

1. **Microphone not working**
   - Check browser permissions
   - Ensure microphone is not used by other apps
   - Try refreshing the page

2. **Analysis not working**
   - Verify OPENAI_API_KEY is set correctly
   - Check network connectivity
   - Review browser console for errors

3. **Audio not playing**
   - Currently uses simulated audio
   - Add real audio files to `public/audio/` directory

### Development Tips

- Use browser dev tools to check for console errors
- Test microphone permissions in browser settings
- Check network tab for API request failures
- Monitor server logs for backend issues

## 📈 Next Steps

### Immediate Improvements
1. Add real audio files for practice questions
2. Implement user authentication
3. Add progress tracking and analytics
4. Create custom question builder

### Advanced Features
1. Real-time speech coaching
2. Video recording and analysis
3. Multi-language support
4. Mobile app version
5. Integration with calendar apps

## 💡 Usage Tips

1. **Microphone Setup**: Ensure your browser has microphone permissions
2. **Clear Speech**: Speak clearly and at a moderate pace
3. **Practice Regularly**: Use the app daily for best results
4. **Review Feedback**: Pay attention to AI suggestions for improvement
5. **Track Progress**: Monitor your metrics over time

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the browser console for errors
3. Ensure all environment variables are set correctly
4. Check the GitHub issues for known problems

---

**Ready to build confidence in public speaking! 🎤** 