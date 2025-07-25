import { Router } from "express";
import { storage } from "./storage";
import { insertSessionSchema } from "@shared/schema";
import { z } from "zod";
import { conversationTopics, getTopicById } from "./conversation-topics";
import { liveKitService } from "./livekit-service";
import { headPoseManager } from "./head-pose-manager";
import testRouter from "./test-routes";

const router = Router();

// Add test routes
router.use(testRouter);

// Get current user (demo implementation)
router.get("/api/user/current", (req, res) => {
  res.json({
    id: 1,
    name: "Demo User",
    email: "demo@example.com"
  });
});

// Get user progress and stats
router.get("/api/user/progress", async (req, res) => {
  try {
    const progress = await storage.getUserProgress(1);
    const stats = await storage.getSessionStats(1);
    res.json({ progress, stats });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch progress" });
  }
});

// Head pose detector management routes
router.post("/api/head-pose/start", async (req, res) => {
  try {
    const success = await headPoseManager.start();
    if (success) {
      res.json({ 
        success: true, 
        message: "Head pose detector started successfully",
        serverUrl: headPoseManager.getServerUrl()
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: "Failed to start head pose detector" 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error starting head pose detector",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/api/head-pose/stop", async (req, res) => {
  try {
    await headPoseManager.stop();
    res.json({ 
      success: true, 
      message: "Head pose detector stopped successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error stopping head pose detector",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.get("/api/head-pose/status", (req, res) => {
  res.json({
    isRunning: headPoseManager.isServerRunning(),
    serverUrl: headPoseManager.getServerUrl()
  });
});

// Create a new practice session
router.post("/api/sessions", async (req, res) => {
  try {
    const validatedData = insertSessionSchema.parse({
      ...req.body,
      userId: 1 // Default demo user
    });
    
    // Start head pose detector for practice sessions
    if (!headPoseManager.isServerRunning()) {
      console.log('Starting head pose detector for practice session...');
      await headPoseManager.start();
    }
    
    const session = await storage.createSession(validatedData);
    res.status(201).json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid session data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create session" });
  }
});

// Get user sessions
router.get("/api/sessions", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const sessions = await storage.getUserSessions(1, limit);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
});

// Get specific session
router.get("/api/sessions/:id", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const session = await storage.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch session" });
  }
});

// Delete session
router.delete("/api/sessions/:id", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const deleted = await storage.deleteSession(sessionId);
    
    if (!deleted) {
      return res.status(404).json({ message: "Session not found" });
    }
    
    res.json({ message: "Session deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete session" });
  }
});

// Get conversation topics
router.get("/api/conversation/topics", (req, res) => {
  console.log("Fetching conversation topics:", conversationTopics.length, "topics available");
  res.json(conversationTopics);
});

// Create a LiveKit conversation room with AI voice agent
router.post("/api/conversation/create-room", async (req, res) => {
  try {
    const { topicId } = req.body;
    console.log("Creating conversation room for topic ID:", topicId);
    
    if (!topicId) {
      console.log("Missing topicId in request body");
      return res.status(400).json({ error: "Topic ID is required" });
    }

    // Check if LiveKit is configured
    if (!liveKitService.isLiveKitConfigured()) {
      console.log("LiveKit not configured");
      return res.status(503).json({ 
        error: "LiveKit is not configured",
        message: "Please set up your LiveKit credentials in the .env file to use AI conversation features.",
        setupRequired: true
      });
    }

    // Start head pose detector for AI conversations
    if (!headPoseManager.isServerRunning()) {
      console.log('Starting head pose detector for AI conversation...');
      await headPoseManager.start();
    }

    const topic = getTopicById(topicId);
    console.log("Found topic:", topic ? topic.title : "Not found");
    
    if (!topic) {
      console.log("Topic not found for ID:", topicId);
      return res.status(404).json({ error: "Topic not found" });
    }

    // Create room and get token
    console.log("Creating LiveKit room for topic:", topic.title);
    const { roomName, token } = await liveKitService.createConversationRoom(topicId);
    console.log("Room created:", roomName);

    // Wait for agent to connect (with timeout)
    const maxWaitTime = 10000; // 10 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      if (liveKitService.isAgentActive(roomName)) {
        console.log(`AI conversation started in room: ${roomName}`);
        return res.json({
          roomName,
          token,
          serverUrl: liveKitService.getConnectionUrl(),
          topic
        });
      }
      await new Promise(resolve => setTimeout(resolve, 500)); // Check every 500ms
    }

    // If we get here, the agent didn't connect in time
    console.error(`Failed to start AI conversation in room: ${roomName}`);
    await liveKitService.stopVoiceAgent(roomName);
    return res.status(500).json({ 
      error: "Failed to start AI conversation",
      message: "The AI agent failed to connect. Please try again."
    });

  } catch (error) {
    console.error("Error creating conversation room:", error);
    res.status(500).json({ error: "Failed to create conversation room" });
  }
});

// End conversation
router.post("/api/conversation/end", async (req, res) => {
  try {
    const { roomName } = req.body;
    
    if (!roomName) {
      return res.status(400).json({ error: "Room name is required" });
    }

    // Check if LiveKit is configured
    if (!liveKitService.isLiveKitConfigured()) {
      return res.status(503).json({ 
        error: "LiveKit is not configured",
        message: "Please set up your LiveKit credentials in the .env file to use AI conversation features."
      });
    }

    await liveKitService.stopVoiceAgent(roomName);
    res.json({ success: true });

  } catch (error) {
    console.error("Error ending conversation:", error);
    res.status(500).json({ error: "Failed to end conversation" });
  }
});

// Get conversation status
router.get("/api/conversation/status/:roomName", (req, res) => {
  try {
    const { roomName } = req.params;
    
    if (!roomName) {
      return res.status(400).json({ error: "Room name is required" });
    }

    // Check if LiveKit is configured
    if (!liveKitService.isLiveKitConfigured()) {
      return res.status(503).json({ 
        error: "LiveKit is not configured",
        message: "Please set up your LiveKit credentials in the .env file to use AI conversation features."
      });
    }

    const isActive = liveKitService.isAgentActive(roomName);
    res.json({ isActive });

  } catch (error) {
    console.error("Error getting conversation status:", error);
    res.status(500).json({ error: "Failed to get conversation status" });
  }
});

export default router;
