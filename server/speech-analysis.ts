import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize OpenRouter client for fallback
const openRouterClient = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

interface SpeechMetrics {
  fillerWords: number;
  speechRate: number;
  pauseDuration: number;
  confidence: number;
}

interface SpeechFeedback {
  summary: string;
  suggestions: string[];
}

export class SpeechAnalysisService {
  
  /**
   * Analyze speech audio and provide feedback
   */
  static async analyzeSpeech(audioData: string, questionId: string, categoryId: string): Promise<{
    transcript: string;
    metrics: SpeechMetrics;
    feedback: SpeechFeedback;
  }> {
    try {
      // Step 1: Transcribe audio using OpenAI Whisper
      const transcript = await this.transcribeAudio(audioData);
      
      // Step 2: Analyze speech metrics
      const metrics = await this.analyzeMetrics(transcript);
      
      // Step 3: Generate AI feedback
      const feedback = await this.generateFeedback(transcript, metrics, questionId, categoryId);
      
      return {
        transcript,
        metrics,
        feedback
      };
    } catch (error) {
      console.error('Error analyzing speech:', error);
      throw new Error('Failed to analyze speech');
    }
  }

  /**
   * Transcribe audio using OpenAI Whisper
   */
  private static async transcribeAudio(audioData: string): Promise<string> {
    try {
      // Convert base64 to buffer
      const buffer = Buffer.from(audioData, 'base64');
      
      const transcription = await openai.audio.transcriptions.create({
        file: new Blob([buffer], { type: 'audio/wav' }) as any,
        model: "whisper-1",
        response_format: "text"
      });
      
      return transcription as string;
    } catch (error) {
      console.error('Error transcribing audio with OpenAI:', error);
      // Return mock transcript for development
      return "This is a mock transcript for development purposes. In production, this would be the actual transcribed speech from the user's recording.";
    }
  }

  /**
   * Analyze speech metrics from transcript
   */
  private static async analyzeMetrics(transcript: string): Promise<SpeechMetrics> {
    const words = transcript.toLowerCase().split(/\s+/);
    const wordCount = words.length;
    
    // Count filler words
    const fillerWords = [
      'um', 'uh', 'like', 'you know', 'i mean', 'basically', 'actually', 'literally',
      'sort of', 'kind of', 'right', 'okay', 'so', 'well', 'hmm', 'ah'
    ];
    
    let fillerWordCount = 0;
    fillerWords.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = transcript.match(regex);
      if (matches) {
        fillerWordCount += matches.length;
      }
    });
    
    // Calculate speech rate (words per minute) - assuming 60 seconds for now
    const speechRate = Math.round(wordCount * 60 / 60); // words per minute
    
    // Estimate pause duration (simplified)
    const pauseDuration = Math.max(0, 60 - (wordCount * 0.5)); // rough estimate
    
    // Calculate confidence score (0-1)
    const confidence = Math.max(0, Math.min(1, 
      1 - (fillerWordCount / Math.max(wordCount, 1)) * 0.5 - 
      (pauseDuration / 60) * 0.3
    ));
    
    return {
      fillerWords: fillerWordCount,
      speechRate,
      pauseDuration: Math.round(pauseDuration * 10) / 10,
      confidence: Math.round(confidence * 100) / 100
    };
  }

  /**
   * Generate AI feedback using OpenAI or OpenRouter fallback
   */
  private static async generateFeedback(
    transcript: string, 
    metrics: SpeechMetrics, 
    questionId: string, 
    categoryId: string
  ): Promise<SpeechFeedback> {
    try {
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
2. 3 specific, actionable suggestions for improvement

Focus on practical advice that can be implemented immediately. Be encouraging but honest about areas for improvement.`;

      // Try OpenAI first
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are an expert speech coach providing constructive feedback. Be encouraging but honest. Focus on actionable advice."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        });

        const response = completion.choices[0]?.message?.content || '';
        return this.parseFeedbackResponse(response);
      } catch (openaiError) {
        console.log('OpenAI failed, trying OpenRouter fallback...');
        
        // Fallback to OpenRouter with Mistral model
        if (process.env.OPENROUTER_API_KEY) {
          try {
            const completion = await openRouterClient.chat.completions.create({
              model: "mistralai/mistral-7b-instruct",
              messages: [
                {
                  role: "system",
                  content: "You are an expert speech coach providing constructive feedback. Be encouraging but honest. Focus on actionable advice."
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              max_tokens: 300,
              temperature: 0.7
            });

            const response = completion.choices[0]?.message?.content || '';
            return this.parseFeedbackResponse(response);
          } catch (openRouterError) {
            console.error('OpenRouter fallback failed:', openRouterError);
            return this.getDefaultFeedback();
          }
        } else {
          console.error('OpenAI failed and no OpenRouter API key available');
          return this.getDefaultFeedback();
        }
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
      return this.getDefaultFeedback();
    }
  }

  /**
   * Parse the AI response into structured feedback
   */
  private static parseFeedbackResponse(response: string): SpeechFeedback {
    const lines = response.split('\n').filter(line => line.trim());
    const summary = lines[0] || "Good effort! Here are some areas for improvement.";
    const suggestions = lines.slice(1).filter(line => line.trim().length > 0).slice(0, 3);
    
    return {
      summary,
      suggestions: suggestions.length > 0 ? suggestions : [
        "Practice speaking more slowly and clearly",
        "Try to reduce filler words like 'um' and 'like'",
        "Add more pauses between key points for emphasis"
      ]
    };
  }

  /**
   * Get default feedback when AI services are unavailable
   */
  private static getDefaultFeedback(): SpeechFeedback {
    return {
      summary: "Good effort! Here are some general tips for improvement.",
      suggestions: [
        "Practice speaking more slowly and clearly",
        "Try to reduce filler words like 'um' and 'like'",
        "Add more pauses between key points for emphasis"
      ]
    };
  }
} 