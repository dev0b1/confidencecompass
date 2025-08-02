import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { SpeechAnalysisService } from "./speech-analysis";
import { createClient } from '@supabase/supabase-js';

// Set NODE_ENV if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

// Initialize Supabase client
const supabaseUrl = 'https://ssroptidwpmvgescjprf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;
if (supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('⚠️  Supabase API key not found. Database features will be disabled.');
  console.warn('📝 Add SUPABASE_ANON_KEY to your .env file to enable database features.');
}

// Check for required environment variables
const requiredEnvVars = [
  'OPENAI_API_KEY', // For transcription and analysis
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️  Missing required environment variables:');
  missingVars.forEach(varName => console.warn(`   - ${varName}`));
  console.warn('\n📝 Please create a .env file with these variables. See SETUP_SIMPLE.md for details.');
  console.warn('🚀 The app will still start, but some features may not work properly.\n');
}

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Replace with your domain
    : true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Content Security Policy middleware
app.use((req, res, next) => {
  // Only set CSP headers in production
  if (process.env.NODE_ENV === 'production') {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss:",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests"
    ];

    res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
    
    // Additional security headers for production
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
  
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));

// Middleware for logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Speech Practice API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Serve favicon directly
app.get('/favicon.ico', (req, res) => {
  res.redirect('/vite.svg');
});

// Serve static files (for development)
app.use('/vite.svg', express.static(path.join(process.cwd(), 'client', 'public', 'vite.svg')));
app.use('/test-favicon.html', express.static(path.join(process.cwd(), 'client', 'public', 'test-favicon.html')));
app.use('/no-csp.html', express.static(path.join(process.cwd(), 'client', 'public', 'no-csp.html')));

// Get practice categories from Supabase
app.get('/api/categories', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      res.json(data);
    } else {
      // Fallback data when Supabase is not available
      const categories = [
        {
          id: 'interview',
          name: 'Interview Practice',
          description: 'Common interview questions and scenarios',
          icon: '🎯'
        },
        {
          id: 'elevator-pitch',
          name: 'Elevator Pitch',
          description: 'Perfect your 30-second introduction',
          icon: '🚀'
        },
        {
          id: 'presentation',
          name: 'Presentation Skills',
          description: 'Public speaking and presentation practice',
          icon: '🎤'
        },
        {
          id: 'networking',
          name: 'Networking',
          description: 'Conversation starters and networking tips',
          icon: '🤝'
        }
      ];
      
      res.json(categories);
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get questions for a category from Supabase
app.get('/api/categories/:categoryId/questions', async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    if (supabase) {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category_id', categoryId)
        .order('question');
      
      if (error) throw error;
      
      res.json(data);
    } else {
      // Fallback data when Supabase is not available
      const questionsByCategory = {
        interview: [
          {
            id: 'tell-me-about-yourself',
            question: 'Tell me about yourself',
            audioUrl: '/audio/interview/tell-me-about-yourself.mp3',
            duration: 120,
            tips: 'Focus on relevant experience and achievements'
          },
          {
            id: 'why-should-we-hire-you',
            question: 'Why should we hire you?',
            audioUrl: '/audio/interview/why-should-we-hire-you.mp3',
            duration: 90,
            tips: 'Highlight unique value and specific examples'
          },
          {
            id: 'biggest-weakness',
            question: 'What is your biggest weakness?',
            audioUrl: '/audio/interview/biggest-weakness.mp3',
            duration: 90,
            tips: 'Show self-awareness and growth mindset'
          },
          {
            id: 'where-do-you-see-yourself',
            question: 'Where do you see yourself in 5 years?',
            audioUrl: '/audio/interview/where-do-you-see-yourself.mp3',
            duration: 90,
            tips: 'Align with company goals and show ambition'
          }
        ],
        'elevator-pitch': [
          {
            id: 'personal-intro',
            question: 'Introduce yourself professionally',
            audioUrl: '/audio/elevator-pitch/personal-intro.mp3',
            duration: 30,
            tips: 'Include name, role, and key value proposition'
          },
          {
            id: 'value-proposition',
            question: 'What value do you bring?',
            audioUrl: '/audio/elevator-pitch/value-proposition.mp3',
            duration: 30,
            tips: 'Focus on benefits, not just features'
          },
          {
            id: 'call-to-action',
            question: 'End with a clear call to action',
            audioUrl: '/audio/elevator-pitch/call-to-action.mp3',
            duration: 30,
            tips: 'Make it easy for them to take next step'
          }
        ],
        presentation: [
          {
            id: 'opening-hook',
            question: 'Start with an engaging opening',
            audioUrl: '/audio/presentation/opening-hook.mp3',
            duration: 60,
            tips: 'Use a story, question, or surprising fact'
          },
          {
            id: 'key-points',
            question: 'Present your main points clearly',
            audioUrl: '/audio/presentation/key-points.mp3',
            duration: 120,
            tips: 'Use clear structure and transitions'
          },
          {
            id: 'strong-closing',
            question: 'End with impact',
            audioUrl: '/audio/presentation/strong-closing.mp3',
            duration: 60,
            tips: 'Summarize key takeaways and next steps'
          }
        ],
        networking: [
          {
            id: 'ice-breaker',
            question: 'Break the ice naturally',
            audioUrl: '/audio/networking/ice-breaker.mp3',
            duration: 60,
            tips: 'Find common ground or ask about their work'
          },
          {
            id: 'show-interest',
            question: 'Show genuine interest in their work',
            audioUrl: '/audio/networking/show-interest.mp3',
            duration: 90,
            tips: 'Ask thoughtful questions about their role'
          },
          {
            id: 'share-value',
            question: 'Share how you can help them',
            audioUrl: '/audio/networking/share-value.mp3',
            duration: 90,
            tips: 'Offer specific ways you can be valuable'
          }
        ]
      };
      
      const questions = questionsByCategory[categoryId as keyof typeof questionsByCategory] || [];
      res.json(questions);
    }
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Analyze speech recording and save to Supabase
app.post('/api/analyze-speech', async (req, res) => {
  try {
    const { audioData, questionId, categoryId } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }
    
    // Use the speech analysis service
    const analysis = await SpeechAnalysisService.analyzeSpeech(audioData, questionId, categoryId);
    
    // Save session to Supabase if available
    if (supabase) {
      try {
        const { data: session, error } = await supabase
          .from('practice_sessions')
          .insert({
            category_id: categoryId,
            question_id: questionId,
            transcript: analysis.transcript,
            metrics: analysis.metrics,
            feedback: analysis.feedback,
            duration_seconds: analysis.metrics.speechRate > 0 ? Math.round(analysis.transcript.split(' ').length / analysis.metrics.speechRate * 60) : 0,
            confidence_score: analysis.metrics.confidence
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error saving session to Supabase:', error);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }
    
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing speech:', error);
    res.status(500).json({ error: 'Failed to analyze speech' });
  }
});

// Get practice sessions history
app.get('/api/sessions', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('practice_sessions')
        .select(`
          *,
          categories(name, icon),
          questions(question)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      res.json(data);
    } else {
      // Return empty array when Supabase is not available
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  console.error('Server error:', err);
});

// Start server
const server = createServer(app);
const port = process.env.PORT || 5000;

server.listen({
  port,
  host: "localhost",
}, () => {
  console.log(`🚀 Speech Practice server running on port ${port}`);
  console.log(`📱 Open http://localhost:${port} in your browser`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Supabase connected: ${supabaseUrl}`);
  
  if (missingVars.length > 0) {
    console.log(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down server...');
  process.exit(0);
}); 