import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini API client on server-side
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      platform: "X ARENA",
      network: "X Layer (Mainnet / Testnet)",
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // 1. AI Match Analysis Endpoint
  app.post("/api/ai/analysis", async (req, res) => {
    const { gameType, matchData } = req.body;
    try {
      const client = getGeminiClient();
      if (!client) {
        // High quality fallback analysis if no key
        return res.json({
          analysis: generateFallbackAnalysis(gameType, matchData),
          isAiGenerated: false,
        });
      }

      let prompt = "";
      if (gameType === "chess") {
        prompt = `You are a Grandmaster Chess Analyst for the competitive platform X ARENA.
Analyze this chess match:
Winner: ${matchData.winner || "Draw"}
Player Color: ${matchData.playerColor}
AI/Opponent: ${matchData.opponentName} (${matchData.opponentRating} Elo)
Moves PGN / History: ${JSON.stringify(matchData.moves || [])}
Final FEN: ${matchData.fen || "N/A"}
Total Moves: ${matchData.totalMoves || 0}
Result Reason: ${matchData.reason || "Checkmate / Resignation"}

Provide a sharp, grandmaster-level structured breakdown in valid JSON format with:
{
  "summary": "2-3 sentences assessing overall game quality, opening choice, and tactical tension",
  "accuracy": 82, // estimated 0-100 score for player
  "keyTurningPoint": "Brief description of the decisive move/mistake or tactical sequence",
  "playerStrengths": ["Strength 1", "Strength 2"],
  "playerWeaknesses": ["Weakness or missed tactic 1", "Area to polish"],
  "proTip": "One specific actionable advice for future ranked games",
  "mvpPiece": "e.g. White Bishop on d5 / Black Knight"
}`;
      } else {
        prompt = `You are an elite competitive 2048 analyst and algorithmic gaming coach for X ARENA.
Analyze this 2048 match run:
Score: ${matchData.score}
Max Tile: ${matchData.highestTile}
Total Moves: ${matchData.moves}
Duration: ${matchData.duration} seconds
Rating Change: ${matchData.ratingChange || "+15"}
Difficulty: ${matchData.difficulty || "Ranked Standard"}

Provide a sharp tactical performance breakdown in valid JSON format with:
{
  "summary": "2-3 sentences evaluating the corner-lock technique, grid organization, and collapse efficiency",
  "accuracy": 88, // 0-100 tactical precision score
  "keyTurningPoint": "The critical merge point or crowded board maneuver",
  "playerStrengths": ["Strength 1", "Strength 2"],
  "playerWeaknesses": ["Missed directional efficiency", "Over-reliance on random shifts"],
  "proTip": "Advanced technique recommendation (e.g., snake chaining, perimeter lockdown)",
  "mvpPiece": "The decisive tile merge, e.g. ${matchData.highestTile} Tile"
}`;
      }

      const response = await client.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ analysis: parsed, isAiGenerated: true });
    } catch (error: any) {
      console.error("AI Analysis error:", error);
      res.json({
        analysis: generateFallbackAnalysis(gameType, matchData),
        isAiGenerated: false,
        error: error.message,
      });
    }
  });

  // 2. AI Coach Chat / Diagnosis
  app.post("/api/ai/coach", async (req, res) => {
    const { userMessage, gameContext, playerStats, chatHistory } = req.body;
    try {
      const client = getGeminiClient();
      if (!client) {
        return res.json({
          reply: getFallbackCoachReply(userMessage, gameContext),
        });
      }

      const systemPrompt = `You are "AETHER", the Master AI Coach of X ARENA—the elite competitive Web3 gaming platform.
You coach players in Chess (Elo strategies, openings, tactical motifs, endgames) and 2048 (snake patterns, monotonic ordering, corner anchors, trap avoidance).
Player Profile:
- Chess Rating: ${playerStats?.chessRating || 1200} Elo (Tier: ${playerStats?.chessTier || "Gold"})
- 2048 Rating: ${playerStats?.score2048Rating || 1250} (Best: ${playerStats?.bestScore2048 || 16384})
- Overall Winrate: ${playerStats?.winRate || "54%"}

Tone: Intelligent, sharp, encouraging, esports-focused, precise. Give crisp actionable advice and concrete examples. Keep answers within 2-4 punchy paragraphs.`;

      const prompt = `${systemPrompt}\n\nChat History:\n${(chatHistory || [])
        .map((m: any) => `${m.role}: ${m.text}`)
        .join("\n")}\n\nUser Question: ${userMessage}`;

      const response = await client.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          temperature: 0.6,
        },
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("AI Coach error:", error);
      res.json({
        reply: getFallbackCoachReply(userMessage, gameContext),
      });
    }
  });

  // 3. Dynamic Challenge Generator
  app.post("/api/ai/generate-challenge", async (req, res) => {
    const { gameType, difficulty, theme } = req.body;
    try {
      const client = getGeminiClient();
      if (!client) {
        return res.json({ challenge: getFallbackChallenge(gameType, difficulty) });
      }

      const prompt = `Generate a fresh competitive challenge for the game "${gameType}" in X ARENA.
Difficulty: ${difficulty || "Medium"} (Beginner/Medium/Hard/Expert/Master)
Theme requested: ${theme || "Tactical Blitz"}

Format in valid JSON:
{
  "id": "chal_gen_${Date.now()}",
  "title": "Title of the challenge",
  "game": "${gameType}",
  "difficulty": "${difficulty || "Medium"}",
  "description": "Engaging 1-2 sentence description of the scenario and mission",
  "objective": "Clear single-sentence win condition",
  "targetScore": 2048, // if 2048, or target move count if chess
  "moveLimit": 30, // optional limit or 0 for none
  "timeLimitSeconds": 180, // e.g. 180 or 0
  "rewardUsdc": 5.0,
  "rewardXp": 250,
  "handicapDescription": "e.g. Start without queen / Corner tiles locked / 5 second bullet per move",
  "tags": ["Tactics", "Speedrun", "AI Duel"]
}`;

      const response = await client.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ challenge: parsed });
    } catch (err) {
      res.json({ challenge: getFallbackChallenge(gameType, difficulty) });
    }
  });

  // 4. In-Game AI Banter / Reaction
  app.post("/api/ai/agent-reaction", async (req, res) => {
    const { agentName, agentPersonality, boardEvent, gameType } = req.body;
    try {
      const client = getGeminiClient();
      if (!client) {
        return res.json({ reaction: getFallbackReaction(agentName, boardEvent) });
      }

      const prompt = `You are ${agentName}, an AI opponent in X ARENA with the personality: "${agentPersonality}".
Event that just happened in the game (${gameType}): "${boardEvent}".
Provide a short 1-sentence in-character reaction/taunt/compliment (max 15 words).`;

      const response = await client.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          temperature: 0.8,
        },
      });

      res.json({ reaction: response.text?.trim() });
    } catch (e) {
      res.json({ reaction: getFallbackReaction(agentName, boardEvent) });
    }
  });

  // Vite integration for dev vs prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`X ARENA server running on http://0.0.0.0:${PORT}`);
  });
}

function generateFallbackAnalysis(gameType: string, matchData: any) {
  if (gameType === "chess") {
    const won = matchData.winner === "player" || matchData.winner === "White";
    return {
      summary: won
        ? "Superb tactical discipline. You gained active piece coordination in the middlegame and converted your positional edge into an unstoppable advantage."
        : "A hard-fought contest. You maintained solid central control early on, but dynamic counter-play created complications in the endgame.",
      accuracy: won ? 89 : 74,
      keyTurningPoint: "Middlegame pawn tension break and subsequent bishop diagonal activation.",
      playerStrengths: [
        "Strong king safety awareness",
        "Efficient minor piece mobility",
        "Decisive tempo control",
      ],
      playerWeaknesses: [
        "Slight hesitation on pawn lever timing",
        "Check defense calculation depth",
      ],
      proTip: "In closed positions, prioritize outpost knight maneuvers before launching flank attacks.",
      mvpPiece: "Light-squared Bishop",
    };
  } else {
    const score = matchData.score || 4000;
    const accuracy = Math.min(98, Math.max(65, Math.floor(score / 200)));
    return {
      summary: `Impressive run with a peak tile of ${matchData.highestTile || 2048}. The corner consolidation strategy retained structural coherence throughout high board densities.`,
      accuracy,
      keyTurningPoint: `The smooth transition from the 512 tile merge to anchoring the ${matchData.highestTile || 1024} tile in the primary anchor corner.`,
      playerStrengths: [
        "Consistent corner anchor discipline",
        "High moves-per-second conversion",
        "Careful avoidance of upward accidental collapses",
      ],
      playerWeaknesses: [
        "Occasional snake pattern breakdown during unexpected spawns",
      ],
      proTip: "Maintain monotonic descending order along the edge (e.g., 2048 > 1024 > 512 > 256) to ensure chaining cascades.",
      mvpPiece: `${matchData.highestTile || 2048} Tile Anchor`,
    };
  }
}

function getFallbackCoachReply(userMessage: string, gameContext: string) {
  const msg = (userMessage || "").toLowerCase();
  if (msg.includes("chess") || gameContext === "chess" || msg.includes("opening") || msg.includes("mate")) {
    return `Great tactical query! When playing in X ARENA Ranked Chess, the three critical pillars are:\n\n1. **Dynamic Piece Activity**: Always look for candidate moves that improve your least active piece. An outpost knight on d5/e5 often equates to a full pawn advantage.\n\n2. **Pawn Structure & Levers**: Don't push pawns blindly. Every pawn move creates irreversible weaknesses. In Sicilian and King's Indian structures, time your central pawn breaks (c5/d5/f5) precisely when your opponent commits their king.\n\n3. **Calculation Discipline**: Use the "Checks, Captures, Threats" checklist before every single move. What's your opponent's most forcing reply? Focus on this in your next Ranked match to bump your rating!`;
  }
  return `In competitive 2048, mastering the **Corner-Anchor Snake Strategy** is paramount for climbing the X ARENA ladder:\n\n1. **The Pure Anchor**: Pick one corner (Bottom-Left or Bottom-Right) and NEVER move in the opposite vertical direction. Keep your highest tile locked there permanently.\n\n2. **Monotonic Snake Line**: Organize your highest tiles along the bottom row in strict descending order (e.g. 2048 -> 1024 -> 512 -> 256). When the bottom row fills up, wrap the snake to the second row.\n\n3. **Emergency Space Clearance**: If forced into an unfavorable shift, collapse low numbers immediately rather than creating split anchors. Master this and reaching 4096+ in ranked play is well within reach!`;
}

function getFallbackChallenge(gameType: string, difficulty: string) {
  if (gameType === "chess") {
    return {
      id: `chal_chess_${Date.now()}`,
      title: "Grandmaster Endgame Gauntlet",
      game: "chess",
      difficulty: difficulty || "Hard",
      description: "Convert a subtle Rook & Bishop imbalance against an aggressive AI tactician with a 30-move limit.",
      objective: "Achieve checkmate or force resignation within 30 moves.",
      moveLimit: 30,
      timeLimitSeconds: 300,
      rewardUsdc: 10.0,
      rewardXp: 400,
      handicapDescription: "Opponent has active knight outposts; zero blunder margin.",
      tags: ["Endgame", "Tactical", "Timed"],
    };
  }
  return {
    id: `chal_2048_${Date.now()}`,
    title: "Corner Lock Velocity Run",
    game: "2048",
    difficulty: difficulty || "Expert",
    description: "Reach the 1024 tile in under 350 moves while keeping the top-left cell un-anchored.",
    objective: "Create a 1024 tile in less than 350 moves.",
    targetScore: 1024,
    moveLimit: 350,
    timeLimitSeconds: 240,
    rewardUsdc: 8.0,
    rewardXp: 350,
    handicapDescription: "Fast timer ticking; each idle second deducts 5 bonus points.",
    tags: ["Speedrun", "Precision", "High-Yield"],
  };
}

function getFallbackReaction(agentName: string, boardEvent: string) {
  const reactions = [
    "Interesting move... but let's see how you handle my counter-thrust.",
    "A bold choice! My calculations predicted that 3 turns ago.",
    "Well played. You have sharper instincts than most human contenders.",
    "Tension is rising on the board. One slip changes everything.",
    "You won't break my defense that easily!",
  ];
  return reactions[Math.floor(Math.random() * reactions.length)];
}

startServer();
