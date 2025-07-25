import { useState, useCallback, useRef, useEffect } from "react";
import { VoiceMetric } from "@shared/schema";
import { EnhancedVoiceAnalyzer, EnhancedVoiceMetrics } from "../lib/enhanced-voice-analyzer";
import { PerformanceOptimizer } from "../lib/performance-optimizer";
import { Track, LocalTrack } from "livekit-client";
import { useRoomContext } from "@livekit/components-react";

/**
 * useVoiceAnalyzer Hook
 * 
 * A React hook that manages real-time voice analysis during conversation practice.
 * This hook coordinates between LiveKit audio streams, Deepgram transcription,
 * and the EnhancedVoiceAnalyzer for comprehensive voice analysis.
 * 
 * Key Features:
 * - Real-time audio level monitoring
 * - Voice metrics calculation (volume, pitch, clarity, pace)
 * - Deepgram integration for live transcription
 * - Advanced voice analysis (tremor detection, emotion analysis)
 * - WebSocket connection management for real-time analysis
 * 
 * Connections:
 * - LiveKit: For audio stream handling
 * - Deepgram: For speech-to-text transcription
 * - EnhancedVoiceAnalyzer: For voice analysis
 * - WebSocket: For real-time analysis server communication
 * 
 * Usage:
 * This hook is typically used in conversation practice components
 * to provide real-time voice analysis feedback.
 */

// Enhanced voice analyzer interface
interface VoiceAnalyzerOptions {
  enableDeepgram?: boolean;
  deepgramApiKey?: string;
  requireLiveKit?: boolean; // NEW: only use LiveKit if true
}

export function useVoiceAnalyzer(options: VoiceAnalyzerOptions = {}) {
  // Only use LiveKit room context if required
  const room = options.requireLiveKit ? useRoomContext() : undefined;
  const [audioLevel, setAudioLevel] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMetrics, setVoiceMetrics] = useState<VoiceMetric[]>([]);
  const [enhancedMetrics, setEnhancedMetrics] = useState<EnhancedVoiceMetrics | null>(null);
  const [deepgramTranscription, setDeepgramTranscription] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const enhancedAnalyzerRef = useRef<EnhancedVoiceAnalyzer | null>(null);
  const deepgramSocketRef = useRef<WebSocket | null>(null);
  const audioBufferRef = useRef<Float32Array[]>([]);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize enhanced voice analyzer
  useEffect(() => {
    if (options.enableDeepgram && options.deepgramApiKey) {
      enhancedAnalyzerRef.current = new EnhancedVoiceAnalyzer(options.deepgramApiKey);
    }
    
    return () => {
      if (enhancedAnalyzerRef.current) {
        enhancedAnalyzerRef.current.destroy();
      }
      if (deepgramSocketRef.current) {
        deepgramSocketRef.current.close();
      }
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
      PerformanceOptimizer.terminateAllWorkers();
    };
  }, [options.enableDeepgram, options.deepgramApiKey]);

  const connectToLivekitAudio = useCallback(async () => {
    if (!room || !audioContextRef.current) return;

    try {
      // Get the local audio track from the room
      const audioTrack = room.localParticipant.getTrackPublication(Track.Source.Microphone)?.track;
      if (!audioTrack) {
        console.error('No audio track available from LiveKit room');
        return;
      }

      // Get the MediaStreamTrack from LiveKit track
      const mediaStreamTrack = audioTrack.mediaStreamTrack;
      if (!mediaStreamTrack) {
        console.error('No MediaStreamTrack available from LiveKit audio track');
        return;
      }

      // Create a MediaStream from the track
      const mediaStream = new MediaStream([mediaStreamTrack]);
      streamRef.current = mediaStream;

      // Create audio context and analyzer
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
      }

      // Connect the audio track to the analyzer
      const source = audioContextRef.current.createMediaStreamSource(mediaStream);
        source.connect(analyserRef.current);

      // Initialize enhanced analyzer with LiveKit stream
      if (enhancedAnalyzerRef.current) {
        await enhancedAnalyzerRef.current.initialize(mediaStream);
      }

      // Start analysis
      analyzeAudio();
    } catch (error) {
      console.error('Failed to connect to LiveKit audio:', error);
    }
  }, [room]);

  const initializeDeepgramConnection = useCallback(() => {
    if (!options.enableDeepgram || !options.deepgramApiKey) return;

    const deepgramUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=en-US&smart_format=true&interim_results=true&punctuate=true&filler_words=true&sentiment=true&emotion=true`;
    
    deepgramSocketRef.current = new WebSocket(deepgramUrl, ['token', options.deepgramApiKey]);

    deepgramSocketRef.current.onopen = () => {
      console.log('Deepgram connection established');
    };

    deepgramSocketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.channel && data.channel.alternatives && data.channel.alternatives[0]) {
        const transcript = data.channel.alternatives[0].transcript;
        if (transcript && transcript.trim()) {
          setDeepgramTranscription(prev => {
            if (data.is_final) {
              return prev + transcript + ' ';
            }
            return transcript;
          });
        }
      }
    };

    deepgramSocketRef.current.onerror = (error) => {
      console.error('Deepgram WebSocket error:', error);
    };

    deepgramSocketRef.current.onclose = () => {
      console.log('Deepgram connection closed');
    };
  }, [options.enableDeepgram, options.deepgramApiKey]);

  const analyzeAudio = useCallback(async () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const frequencyData = new Uint8Array(bufferLength);
    
    analyser.getByteTimeDomainData(dataArray);
    analyser.getByteFrequencyData(frequencyData);
    
    // Calculate basic volume level
    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    const volume = Math.min(100, (average / 128) * 100);
    setAudioLevel(volume);

    // Convert to Float32Array for advanced analysis
    const floatData = new Float32Array(bufferLength);
    for (let i = 0; i < bufferLength; i++) {
      floatData[i] = (dataArray[i] - 128) / 128;
    }

    // Store audio buffer for analysis
    audioBufferRef.current.push(floatData);
    if (audioBufferRef.current.length > 100) {
      audioBufferRef.current.shift();
    }

    // Perform advanced voice analysis
    if (enhancedAnalyzerRef.current && audioBufferRef.current.length >= 10) {
      try {
        setIsAnalyzing(true);
        const advanced = await enhancedAnalyzerRef.current.analyzeVoice();
        setEnhancedMetrics(advanced);

        // Convert advanced metrics to basic voice metric
        const basicMetric: VoiceMetric = {
          volume: advanced.volume,
          pitch: advanced.pitch,
          clarity: advanced.clarity,
          pace: advanced.pace,
          timestamp: advanced.timestamp
        };

        setVoiceMetrics(prev => [...prev.slice(-100), basicMetric]);
      } catch (error) {
        console.error('Advanced analysis error:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }

    // Send audio to Deepgram for transcription
    if (deepgramSocketRef.current && deepgramSocketRef.current.readyState === WebSocket.OPEN) {
      const audioData = floatData.buffer.slice(0);
      deepgramSocketRef.current.send(audioData);
    }

    // Continue the animation frame loop
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, []);

  const calculateBasicPitch = (frequencyData: Uint8Array): number => {
    // Enhanced pitch detection using autocorrelation and peak finding
    let maxIndex = 0;
    let maxValue = 0;
    
    // Focus on human voice frequency range (85-255 Hz fundamental)
    const startIndex = Math.floor((85 / 22050) * frequencyData.length);
    const endIndex = Math.floor((400 / 22050) * frequencyData.length);
    
    for (let i = startIndex; i < Math.min(endIndex, frequencyData.length); i++) {
      if (frequencyData[i] > maxValue) {
        maxValue = frequencyData[i];
        maxIndex = i;
      }
    }
    
    // Convert to pitch score with better mapping
    const frequency = (maxIndex / frequencyData.length) * 22050;
    const normalizedPitch = Math.log(frequency / 85) / Math.log(400 / 85);
    return Math.min(100, Math.max(0, normalizedPitch * 100));
  };

  const calculateBasicClarity = (frequencyData: Uint8Array, volume: number): number => {
    // Enhanced clarity calculation using spectral centroid and SNR
    const totalEnergy = frequencyData.reduce((sum, value) => sum + value * value, 0);
    const avgEnergy = totalEnergy / frequencyData.length;
    
    // Calculate spectral centroid for clarity
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      const magnitude = frequencyData[i];
      weightedSum += i * magnitude;
      magnitudeSum += magnitude;
    }
    
    const spectralCentroid = magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    const normalizedCentroid = spectralCentroid / frequencyData.length;
    
    // Combine multiple factors for better clarity score
    const energyFactor = Math.min(1, totalEnergy / (frequencyData.length * 100));
    const volumeFactor = Math.min(1, volume * 2);
    const clarityScore = (normalizedCentroid * energyFactor * volumeFactor) * 100;
    
    return Math.min(100, Math.max(0, clarityScore));
  };

  const calculateBasicPace = (): number => {
    // Estimate speaking pace based on audio level changes
    if (voiceMetrics.length < 10) return 50;
    
    const recentMetrics = voiceMetrics.slice(-10);
    let changes = 0;
    
    for (let i = 1; i < recentMetrics.length; i++) {
      if (Math.abs(recentMetrics[i].volume - recentMetrics[i-1].volume) > 10) {
        changes++;
      }
    }
    
    // Normalize to 0-100 scale
    return Math.min(100, (changes / 9) * 100);
  };

  const startRecording = useCallback(async () => {
    try {
      // Try to use LiveKit audio track first
      if (room) {
        await connectToLivekitAudio();
      } else {
        // Fallback to getting microphone access directly
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      
      // Initialize audio context and analyzer
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Initialize enhanced analyzer with microphone stream
      if (enhancedAnalyzerRef.current) {
        await enhancedAnalyzerRef.current.initialize(stream);
        }
      }
      
      // Initialize Deepgram connection
      initializeDeepgramConnection();
      
      setIsRecording(true);
        analyzeAudio();

    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, [connectToLivekitAudio, initializeDeepgramConnection, room]);

  const stopRecording = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (deepgramSocketRef.current) {
      deepgramSocketRef.current.close();
      deepgramSocketRef.current = null;
    }

    setIsRecording(false);
    setIsAnalyzing(false);
    audioBufferRef.current = [];
  }, []);

  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsRecording(audioTrack.enabled);
      }
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setVoiceMetrics([]);
    setEnhancedMetrics(null);
    setDeepgramTranscription("");
    audioBufferRef.current = [];
  }, []);

  const getVoiceAnalysisSummary = useCallback(() => {
    if (voiceMetrics.length === 0) return null;

    const recent = voiceMetrics.slice(-50);
    const avgVolume = recent.reduce((sum, m) => sum + m.volume, 0) / recent.length;
    const avgPitch = recent.reduce((sum, m) => sum + m.pitch, 0) / recent.length;
    const avgClarity = recent.reduce((sum, m) => sum + m.clarity, 0) / recent.length;
    const avgPace = recent.reduce((sum, m) => sum + m.pace, 0) / recent.length;

    return {
      averageVolume: Math.round(avgVolume),
      averagePitch: Math.round(avgPitch),
      averageClarity: Math.round(avgClarity),
      averagePace: Math.round(avgPace),
      sampleCount: recent.length,
      transcriptionLength: deepgramTranscription.length
    };
  }, [voiceMetrics, deepgramTranscription]);

  return {
    // Basic metrics
    audioLevel,
    isRecording,
    voiceMetrics,
    
    // Enhanced metrics
    enhancedMetrics,
    deepgramTranscription,
    isAnalyzing,
    
    // Controls
    startRecording,
    stopRecording,
    toggleMute,
    resetAnalysis,
    
    // Analysis
    getVoiceAnalysisSummary,
    
    // Status
    hasDeepgramConnection: !!deepgramSocketRef.current,
    hasEnhancedAnalyzer: !!enhancedAnalyzerRef.current
  };
}
