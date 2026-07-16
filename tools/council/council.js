#!/usr/bin/env node

/**
 * TinyVoice Twins Agent Council
 * A standalone tool (not part of the app). Loads ANTHROPIC_API_KEY from the
 * repo-root .env.local. Setup: `cd tools/council && npm install`.
 * Run: `npm start` (from tools/council) — then open http://localhost:5000.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Resolve the repo-root .env.local regardless of the current working directory.
const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(here, "..", "..", ".env.local") });

import Anthropic from "@anthropic-ai/sdk";
import express from "express";

const app = express();
app.use(express.json());

// Debug: Check if API key is loaded
console.log("🔑 API Key loaded:", process.env.ANTHROPIC_API_KEY ? "✅ YES" : "❌ NO");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const councilMembers = [
  {
    name: "Iris — Product Lead",
    role: "User Experience & Feature Strategy",
    color: "#FF8C00",
  },
  {
    name: "Marcus — Tech Architect",
    role: "Implementation & Technical Excellence",
    color: "#1E90FF",
  },
  {
    name: "Dr. Sofia — Learning Science Expert",
    role: "Pedagogical Efficacy & Therapy Alignment",
    color: "#32CD32",
  },
  {
    name: "Alex — Parent/Guardian UX",
    role: "Caregiver Experience & Twin-Specific Design",
    color: "#FF1493",
  },
];

const projectContext = `
TinyVoice (a.k.a. "TinyVoice Twins") is a sound-first, speech-therapy-aligned early-language app
for TODDLERS (ages ~2–3), mobile-first PWA. Now a therapist-driven pilot. (Refreshed 2026-07-15.)

KEY FEATURES IMPLEMENTED:
- Speech-first: every word is HEARD in a warm PRE-RENDERED human-like voice — 3 selectable voices
  (Aoede default · Leda · Sulafat, Google Cloud TTS). NEVER the robotic device voice; a missing clip
  plays a soft chime, so clip coverage is kept complete (letters A–Z, phonics, praise all recorded).
- Real assets only: our own hand-styled WebP ILLUSTRATIONS (not photos, no emoji, no synthetic
  placeholders) + real Creative-Commons animal SOUNDS.
- 7 "worlds" / 139 items (each: word, wiki ref, spoken line, a 1→2→3-word "expand" ladder, sound key).
- Learning Screen: tap-to-hear word + sound discovery; expand ladder; "Auto Play" (auto-advances then
  STOPS at the end, no loop); optional per-child "expectant pause" (a few seconds before auto-speak so
  the child gets a communicative opportunity to name it first — Dunst & Trivette responsiveness).
- "Things I Do": 28 ANIMATED verbs using our OWN boy + girl characters (key-pose flip-book loops, no
  audio to sync); solo verbs alternate boy/girl, social verbs (hug/dance/laugh/play) show BOTH kids;
  plays gently under prefers-reduced-motion; the last verb settles (freezes) when Auto Play finishes.
- Word Board: an AAC-style categorized vocabulary board — ~200 therapist-aligned CORE words across 3
  frequency tiers — plus a "Find" word-focus mode.
- Phrase practice: Word Practice + Phrase Builder (2-word / 3-word banks).
- Sing with Pip: 13 public-domain children's songs, each with an our-own-character animation +
  karaoke captions; now a robust transport-bar PLAYER (shuffle · prev · play/pause · next, auto-
  advances the enabled-songs queue, stops at the end). Per-child song enabling + voice.
- Counting + Colours worlds; Phonics + Sound-game + Twin-Mode mini-games (shared ChoiceGame engine).
- Twin Mode: generic RENAMABLE per-child profiles; a fresh device seeds only "Everyone" then asks
  "how many children?"; childCount (1|2) gates Twin Mode; cooperative turn-taking (no winner).
- Per-child state: progress (seen / collected / a parent-facing "today" line), stage, focus words,
  enabled songs, wait-time, screen-time limit + quiet hours.
- Parent area (gated): voice switch, song enable, progress, screen-time/bedtime.
- Cloud (OPTIONAL pilot, Supabase): magic-link auth + per-child sync + a 30-day soft trial (banner
  only — child play is NEVER blocked). Runs fully local & offline without any of it.
- PWA: offline-first; /sounds/ + /images/ use StaleWhileRevalidate so a re-recorded clip/image at the
  SAME url self-heals on next play. Deployed to GitHub Pages (free demo) + Vercel (pilot w/ cloud env).

DESIGN PHILOSOPHY / QUALITY BARS:
- NO scores / streaks / pressure — gentle "collection" + celebration only; any growth signal is
  surfaced to PARENTS, never as a child-facing scoreboard.
- Warm, bold, chunky, tactile; one action per screen; toddler-safe; prefers-reduced-motion respected.
- Real illustration + warm voice + real sound over anything synthetic.
- Per-child everything (progress, stage, screen-time, bedtime).
- NO feature bloat: every feature must earn its place via learning science + toddler/twin value.
- Learning science aligned: Dunst & Trivette child-responsive practices; AAC core-vocabulary board.

TECH STACK (corrects earlier notes):
React + Vite + Zustand. Audio is a CUSTOM lib (src/lib/audio.js) — NOT Howler. Plain CSS (NOT
Tailwind). Google Cloud / Vertex asset pipeline (pre-rendered voice clips + WebP images, committed).
Supabase optional. Playwright UI regression suite (npm run verify:ui).
`;

// Competitive landscape for a COMPARATIVE review — the top toddler / early-language speech apps
// TinyVoice competes against. Populated from current (2025–26) market research so the council
// grounds its "how do we compare / where's our edge" calls in real products, not vibes.
const competitorContext = `
TOP-5 COMPETITOR APPS (toddler / early-language speech space), from 2025–26 market research:

1) SPEECH BLUBS (category leader, 6M+ downloads, built w/ 1,000+ SLPs, 4.6★). Freemium → ~$60/yr.
   Signature moat = PEER VIDEO MOUTH-MODELING: the child watches REAL OTHER KIDS pronounce a
   sound/word then imitates into the mic; AR face filters; real photos + real voice; big Parents'
   Academy. Weakness: pricey, finicky mic ASR, spans to age 8 (not toddler-pure), feels supplemental.

2) KHAN ACADEMY KIDS (the "free giant," 21M+ learners, Stanford-designed, ages 2–8). 100% FREE,
   ad-free, no IAP. Huge 5,000+ activity library, adaptive path, licensed content, teacher dashboards.
   Weakness: general early-ed, NOT speech therapy — no articulation drills, no mic practice, no AAC.

3) OTSIMO SPEECH THERAPY SLP (clinical, UC Berkeley/Edinburgh-backed). Freemium → ~$4.49–6.99/mo or
   ~$116 lifetime. Structured oral-motor → consonant → word → phrase drills with ASR/ML scoring; a
   dev-test sets a personalized schedule; caregivers can align with a real SLP. Weakness: feels like
   therapy not play; billing complaints; toddler-speech ASR imperfect.

4) LINGUMI (toddler UX benchmark, 2M+ users, ages 2–5; now owned by Novakid). Subscription (EFL model).
   ONE 10-min lesson/day (deliberate screen-time cap = healthy-habits positioning); child-tuned speech
   detection; multi-language; optional physical foam cubes. Weakness: it's ENGLISH-LEARNING (EFL), not
   speech therapy; less relevant for English-native late talkers; future uncertain post-acquisition.

5) PROLOQUO2GO (gold-standard AAC, AssistiveWare). ONE-TIME ~$250, iOS-only. Symbol word-board:
   tap SymbolStix symbols to speak utterances aloud; 14,000+ symbols, 100+ natural voices (incl. child
   voices), deep accessibility; "Progressive Language" reveals words as skill grows. Weakness: very
   expensive, iOS-only, steep setup, clinical — overkill/intimidating for a typical late-talking
   toddler (cheaper toddler AAC = free Twinkl Symbols AAC).

FIELD TABLE STAKES: real photo+voice, ad-free/kid-safe, play-based mini-games, some parent dashboard.
FIELD EDGE FEATURES (only the best): video/mouth modeling (Speech Blubs owns it), speech recognition
(weak on toddlers everywhere), SLP-designed adaptive isolation→word→phrase curriculum, AAC boards.

WHITE-SPACE GAPS none of them fill well (candidate edges): (a) TWIN / SIBLING multi-child on ONE device
— essentially absent everywhere; (b) toddler-first PLAYFUL AAC word-board (vs $250 clinical or
utilitarian-free); (c) a strictly NO-SCORE / NO-STREAK curiosity-reward stance (clinical apps drill,
Lingumi gamifies); (d) an installable OFFLINE PWA with a free web demo — the entire top-5 are native
store apps; (e) warm fully-pre-rendered voice with named voice choice + a no-robotic-voice guarantee;
(f) a lightweight optional therapist-pilot cloud sync in the CONSUMER toddler tier. Hardest walls to
climb: Speech Blubs' video-modeling moat and Khan's "free" — differentiate on the gaps, don't attack those two head-on.
`;

// ============================================
// ROUTES
// ============================================

// Serve the HTML UI
app.get("/", (req, res) => {
  res.send(getHtmlUI());
});

// API endpoint: run council analysis
app.post("/api/council", async (req, res) => {
  console.log("📥 /api/council called");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const councilState = {};

  try {
    // Run each council member
    for (const member of councilMembers) {
      console.log(`📋 Analyzing ${member.name}...`);
      const perspective = getPerspective(member.name);
      const prompt = `${perspective}

PROJECT CONTEXT:
${projectContext}

${competitorContext}

This is a COMPARATIVE review. In your domain, benchmark TinyVoice against the 5 competitor apps
above and answer three things, concretely:
  1) WHERE WE ALREADY WIN — a real advantage vs these apps we should protect/lean into.
  2) WHERE WE'RE BEHIND — a specific gap where a competitor does something we don't (name it).
  3) THE ONE EDGE MOVE — a single improvement in your domain that would give us a durable edge
     WITHOUT bloating the app (must respect: no scores/streaks, speech-first warm voice, real
     illustrations, per-child, toddler-safe, lean). Say if it's cheap or costly.

Respond in the voice of ${member.name.split(" — ")[0]}. Be specific, name competitors and our real
features, keep it to 6–8 sentences max. No generic praise. Format: **Where we win:** … **Where we're
behind:** … **The one edge move:** …`;

      try {
        const message = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        });

        const content = message.content[0].text;
        councilState[member.name] = content;

        send({
          type: "member",
          name: member.name,
          content: content,
        });
        console.log(`✅ ${member.name} complete`);
      } catch (memberError) {
        console.error(`❌ Error with ${member.name}:`, memberError.message);
        send({
          type: "error",
          message: `Error analyzing ${member.name}: ${memberError.message}`,
        });
        throw memberError;
      }
    }

    // Run grandmaster synthesis
    console.log("🏆 Running Grandmaster synthesis...");
    const grandmasterPrompt = `You are the Grandmaster — a strategic synthesis engine. This was a COMPARATIVE
review of TinyVoice against the top 5 toddler / early-language speech apps. You've heard from four
council members:

${councilMembers.map((m) => `**${m.name}** (${m.role}):\n${councilState[m.name]}`).join("\n\n")}

Synthesize into a **concise, competitive final report** covering:
1. **How We Compare** — a short WIN / PARITY / BEHIND table vs the field (3–5 rows; name competitors).
2. **Our Defensible Edge** — the 1–2 things TinyVoice does that the field does NOT (protect these).
3. **Top 3 Edge Moves** — the highest-leverage improvements that CLOSE a real gap or SHARPEN our edge,
   each with a rough cost (cheap / medium / costly) and the competitor it answers. Every one must be
   non-bloating and respect the quality bars (no scores/streaks, speech-first warm voice, real
   illustrations, per-child, toddler-safe, lean).
4. **Do NOT Build** — 2–3 tempting competitor features to deliberately SKIP (would bloat or break brand).

Format as a structured report, 350–450 words. Be bold; make calls; prefer specifics over hedging.`;

    const grandmasterMessage = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      messages: [{ role: "user", content: grandmasterPrompt }],
    });

    const grandmasterContent = grandmasterMessage.content[0].text;
    councilState["Grandmaster"] = grandmasterContent;

    send({
      type: "grandmaster",
      content: grandmasterContent,
      councilState: councilState,
    });

    send({ type: "done" });
    res.end();
    console.log("✅ Council complete");
  } catch (error) {
    console.error("❌ COUNCIL ERROR:", error.message);
    console.error("Full error:", error);
    send({
      type: "error",
      message: `API Error: ${error.message}. Check server console for details.`,
    });
    res.end();
  }
});

// API endpoint: refine based on feedback
app.post("/api/refine", async (req, res) => {
  console.log("📥 /api/refine called");
  const { feedback, originalAnalysis } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const refinementPrompt = `You are the Grandmaster. The council has already provided this initial analysis:

INITIAL ANALYSIS:
${originalAnalysis}

NOW, the product builder has provided this feedback/question:
"${feedback}"

Based on this new input, provide a REFINED or EXPANDED analysis. Should you:
- Acknowledge new constraints or opportunities they've raised?
- Reconsider prioritization given this context?
- Pivot the recommendations?
- Dig deeper into a specific area?

Keep it concise (200-300 words). Be specific about how this feedback changes your thinking, if at all.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      messages: [{ role: "user", content: refinementPrompt }],
    });

    const refinedContent = message.content[0].text;

    send({
      type: "refined",
      content: refinedContent,
    });

    send({ type: "done" });
    res.end();
    console.log("✅ Refinement complete");
  } catch (error) {
    console.error("❌ REFINE ERROR:", error.message);
    send({
      type: "error",
      message: error.message,
    });
    res.end();
  }
});

// ============================================
// HELPERS
// ============================================

function getPerspective(memberName) {
  const perspectives = {
    "Iris — Product Lead": `You are Iris, the Product Lead. Review TinyVoice Twins and provide 2–3 key strengths and 2–3 critical gaps from a UX/product perspective. Focus on user journey, feature completeness, and roadmap alignment. Be candid about what's missing that would meaningfully improve the user experience. Format: **Strengths:** ... **Gaps:** ... **Red Flag:** ...`,

    "Marcus — Tech Architect": `You are Marcus, the Tech Architect. Evaluate the technical implementation: React 18 + Tailwind + Howler + Zustand stack, audio generation pipeline (Google Cloud TTS), PWA caching strategy, asset optimization. What's working? What technical debt or scaling concerns exist? Any performance red flags? Format: **What's Solid:** ... **Technical Debt:** ... **Scaling Concern:** ...`,

    "Dr. Sofia — Learning Science Expert": `You are Dr. Sofia, the Learning Science Expert. Review the pedagogical approach: sound-first design, phrase progression (levels 1–3), AAC board principles, speech therapy alignment, Dunst & Trivette child-responsive practices. Is the learning progression sound? Are we missing evidence-based practices? Format: **Learning Wins:** ... **Therapy Alignment:** ... **Missing Evidence:** ...`,

    "Alex — Parent/Guardian UX": `You are Alex, the Parent/Guardian UX Expert. You focus on the caregiver experience and twin-specific design: parent dashboard, voice selection, progress insights, cooperation vs. competition, setup friction. What's delighting parents? What's painful? Format: **Parent Delight:** ... **Friction Points:** ... **Twin-Specific Gap:** ...`,
  };

  return perspectives[memberName] || "";
}

function getHtmlUI() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TinyVoice Twins — Agent Council Review</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
      color: #2c3e50;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    .council-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      padding: 40px;
    }
    .council-member {
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
      background: #f9f9f9;
    }
    .council-member.grandmaster {
      grid-column: 1 / -1;
      border: 3px solid #667eea;
      background: linear-gradient(135deg, #f3f0ff 0%, #fef5f9 100%);
    }
    .member-title {
      font-weight: 700;
      font-size: 16px;
      margin-bottom: 8px;
    }
    .member-role {
      font-size: 12px;
      color: #999;
      margin-bottom: 15px;
      font-style: italic;
    }
    .member-content {
      font-size: 13px;
      line-height: 1.6;
      color: #555;
      min-height: 40px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .controls {
      padding: 30px 40px;
      background: #f5f5f5;
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }
    button {
      padding: 12px 28px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
    }
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
    .btn-secondary {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .status {
      padding: 20px 40px;
      background: white;
      text-align: center;
      font-size: 13px;
      color: #999;
      border-top: 1px solid #e0e0e0;
    }
    .loading {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #667eea;
      border-radius: 50%;
      animation: pulse 1.5s infinite;
      margin-right: 8px;
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    .action-document {
      padding: 40px;
      background: white;
      border-top: 2px solid #667eea;
    }
    .action-document pre {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 12px;
      line-height: 1.6;
      color: #2c3e50;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎭 TinyVoice Twins Agent Council</h1>
      <p>A Structured Review of Strengths, Gaps, and Strategic Enhancements</p>
    </div>

    <div class="council-grid" id="council"></div>

    <div class="controls">
      <button class="btn-primary" id="startBtn" onclick="startCouncil()">
        🚀 Convene Council
      </button>
      <button class="btn-secondary" id="cancelBtn" onclick="cancelCouncil()" disabled>
        ⊘ Cancel Council
      </button>
      <button class="btn-secondary" id="exportBtn" onclick="exportAction()" disabled>
        📋 Export Action Document
      </button>
    </div>

    <div class="status" id="status"></div>

    <div class="action-document" id="actionDoc" style="display: none;">
      <h2>📄 Grandmaster's Action Document</h2>
      <pre id="actionText"></pre>
    </div>

    <div class="feedback-section" id="feedbackSection" style="display: none; padding: 40px; border-top: 2px solid #e0e0e0;">
      <h3 style="color: #667eea; margin-bottom: 20px; font-size: 18px;">💬 Refine the Council's Thinking</h3>
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 10px; font-weight: 600; font-size: 14px;">
          What would you like the council to reconsider or explore deeper?
        </label>
        <textarea 
          id="feedbackText" 
          placeholder="E.g., 'We actually have budget for 2 more animal FX recordings. How should we prioritize?'"
          style="width: 100%; height: 100px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-family: inherit; font-size: 13px; resize: vertical;"
        ></textarea>
      </div>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <button class="btn-primary" id="refineBtn" onclick="refineFeedback()" style="flex: 1; min-width: 200px;">
          🔄 Ask Council to Reconsider
        </button>
        <button class="btn-secondary" id="resetBtn" onclick="resetCouncil()" style="flex: 1; min-width: 200px;">
          ↺ Start New Council Review
        </button>
      </div>
      <div id="refinedOutput" style="display: none; margin-top: 40px; padding-top: 40px; border-top: 2px solid #e0e0e0;">
        <h4 style="color: #667eea; margin-bottom: 15px; font-size: 16px;">📝 Grandmaster's Refined Analysis</h4>
        <pre id="refinedText" style="background: #f5f5f5; padding: 20px; border-radius: 8px; overflow-x: auto; font-size: 12px; line-height: 1.6; color: #2c3e50; white-space: pre-wrap; word-wrap: break-word;"></pre>
      </div>
    </div>
  </div>

  <script>
    const councilMembers = [
      { name: "Iris — Product Lead", role: "User Experience & Feature Strategy", color: "#FF8C00" },
      { name: "Marcus — Tech Architect", role: "Implementation & Technical Excellence", color: "#1E90FF" },
      { name: "Dr. Sofia — Learning Science Expert", role: "Pedagogical Efficacy & Therapy Alignment", color: "#32CD32" },
      { name: "Alex — Parent/Guardian UX", role: "Caregiver Experience & Twin-Specific Design", color: "#FF1493" }
    ];

    let councilState = {};

    function initializeCouncil() {
      const council = document.getElementById("council");
      council.innerHTML = "";

      councilMembers.forEach(member => {
        const div = document.createElement("div");
        div.className = "council-member";
        div.innerHTML = \`
          <div class="member-title" style="color: \${member.color}">\${member.name}</div>
          <div class="member-role">\${member.role}</div>
          <div class="member-content" id="content-\${member.name}">
            <div class="loading"></div> Analyzing...
          </div>
        \`;
        council.appendChild(div);
      });

      const grandmaster = document.createElement("div");
      grandmaster.className = "council-member grandmaster";
      grandmaster.innerHTML = \`
        <div class="member-title" style="color: #667eea">🏆 Grandmaster — Strategic Synthesizer</div>
        <div class="member-role">Final Analysis & Action Prioritization</div>
        <div class="member-content" id="content-Grandmaster">
          <div class="loading"></div> Waiting for council input...
        </div>
      \`;
      council.appendChild(grandmaster);
    }

    async function startCouncil() {
      initializeCouncil();
      document.getElementById("startBtn").disabled = true;
      document.getElementById("cancelBtn").disabled = false;
      document.getElementById("exportBtn").disabled = true;
      document.getElementById("actionDoc").style.display = "none";
      updateStatus("Council convening... streaming live analysis");

      try {
        const response = await fetch("/api/council", { method: "POST" });
        
        if (!response.ok) {
          throw new Error(\`Server error: \${response.status} \${response.statusText}\`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\\n\\n");

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].replace(/^data: /, "");
            if (line) {
              const data = JSON.parse(line);

              if (data.type === "member") {
                document.getElementById(\`content-\${data.name}\`).textContent = data.content;
                updateStatus(\`✓ \${data.name} complete\`);
                councilState[data.name] = data.content;
              } else if (data.type === "grandmaster") {
                document.getElementById("content-Grandmaster").textContent = data.content;
                councilState["Grandmaster"] = data.content;
                document.getElementById("actionDoc").style.display = "block";
                document.getElementById("actionText").textContent = data.content;
                document.getElementById("feedbackSection").style.display = "block";
              } else if (data.type === "done") {
                updateStatus("✅ Council review complete!");
              } else if (data.type === "error") {
                updateStatus("❌ " + data.message);
              }
            }
          }

          buffer = lines[lines.length - 1];
        }

        document.getElementById("startBtn").disabled = false;
        document.getElementById("cancelBtn").disabled = true;
        document.getElementById("exportBtn").disabled = false;
      } catch (error) {
        updateStatus("❌ Error: " + error.message);
        document.getElementById("startBtn").disabled = false;
        document.getElementById("cancelBtn").disabled = true;
      }
    }

    function cancelCouncil() {
      if (confirm("Cancel the council review?")) {
        updateStatus("⊘ Council review cancelled.");
        document.getElementById("startBtn").disabled = false;
        document.getElementById("cancelBtn").disabled = true;
      }
    }

    function updateStatus(msg) {
      document.getElementById("status").textContent = msg;
    }

    function exportAction() {
      const text = document.getElementById("actionText").textContent;
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "TinyVoice_Council_Action_Document.txt");
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    async function refineFeedback() {
      const feedback = document.getElementById("feedbackText").value.trim();
      if (!feedback) {
        alert("Please enter your feedback.");
        return;
      }

      document.getElementById("refineBtn").disabled = true;
      document.getElementById("refineBtn").textContent = "⏳ Grandmaster reconsidering...";
      updateStatus("Grandmaster re-analyzing with your feedback...");

      try {
        const response = await fetch("/api/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feedback: feedback,
            originalAnalysis: councilState["Grandmaster"]
          })
        });

        if (!response.ok) {
          throw new Error(\`Server error: \${response.status}\`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\\n\\n");

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].replace(/^data: /, "");
            if (line) {
              const data = JSON.parse(line);

              if (data.type === "refined") {
                document.getElementById("refinedOutput").style.display = "block";
                document.getElementById("refinedText").textContent = data.content;
                updateStatus("✅ Grandmaster's refined analysis ready.");
              } else if (data.type === "done") {
                // Complete
              } else if (data.type === "error") {
                updateStatus("❌ " + data.message);
              }
            }
          }

          buffer = lines[lines.length - 1];
        }
      } catch (error) {
        updateStatus("❌ Error: " + error.message);
      } finally {
        document.getElementById("refineBtn").disabled = false;
        document.getElementById("refineBtn").textContent = "🔄 Ask Council to Reconsider";
      }
    }

    function resetCouncil() {
      if (confirm("Start a fresh council review? Current findings will be cleared.")) {
        councilState = {};
        document.getElementById("actionDoc").style.display = "none";
        document.getElementById("feedbackSection").style.display = "none";
        document.getElementById("refinedOutput").style.display = "none";
        document.getElementById("feedbackText").value = "";
        document.getElementById("refinedText").textContent = "";
        startCouncil();
      }
    }
  </script>
</body>
</html>`;
}

// ============================================
// START SERVER
// ============================================

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🎭 Agent Council running at http://localhost:${PORT}`);
  console.log(`Make sure ANTHROPIC_API_KEY is set in your environment`);
});