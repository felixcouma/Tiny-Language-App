#!/usr/bin/env node

/**
 * TinyVoice Twins Agent Council
 * Dynamically reads project files and runs council analysis
 * Run with: npm start (from tools/council)
 * Then open http://localhost:5000 in your browser
 */

import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..", "..");
const envPath = path.join(projectRoot, ".env.local");

console.log("📂 Looking for .env.local at:", envPath);
dotenv.config({ path: envPath });

const app = express();
app.use(express.json());

console.log("🔑 API Key loaded:", process.env.ANTHROPIC_API_KEY ? "✅ YES" : "❌ NO");
console.log("📂 Reading project files from:", projectRoot);

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

// Read project files dynamically
function readProjectFile(filename) {
  try {
    const filepath = path.join(projectRoot, filename);
    if (fs.existsSync(filepath)) {
      return fs.readFileSync(filepath, "utf-8");
    }
    return null;
  } catch (error) {
    console.error("Error reading", filename, ":", error.message);
    return null;
  }
}

function buildProjectContext() {
  const files = [
    "CURRENT_SESSION.md",
    "TINYVVOICE_PROJECT_CONTEXT.md",
    "CLAUDE.md",
    "README.md",
    "CAPABILITIES_AND_RECENT_CHANGES.md",
    "LEFT_TO_DO.md",
  ];

  let context = "=== TINYVOICE TWINS — LIVE PROJECT CONTEXT ===\n\n";

  for (const filename of files) {
    const content = readProjectFile(filename);
    if (content) {
      context += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📄 ${filename}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      context += content;
      context += "\n";
    }
  }

  return context;
}

let projectContext = buildProjectContext();

// Routes
app.get("/", (req, res) => {
  res.send(getHtmlUI());
});

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
    for (const member of councilMembers) {
      console.log(`📋 Analyzing ${member.name}...`);
      const perspective = getPerspective(member.name);
      const prompt = `${perspective}

PROJECT CONTEXT:
${projectContext}

Respond in the voice of ${member.name.split(" — ")[0]}. Be specific, cite features or docs when possible, and keep it to 5–7 sentences max. Avoid generic praise; focus on what's unique and what's missing.`;

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

    console.log("🏆 Running Grandmaster synthesis...");
    const grandmasterPrompt = `You are the Grandmaster — a strategic synthesis engine. You've heard from four council members:

${councilMembers.map((m) => `**${m.name}** (${m.role}):\n${councilState[m.name]}`).join("\n\n")}

Your job: synthesize this into a **concise, actionable final report** covering:
1. **Strategic Consensus** (what all 4 agree on)
2. **Key Tensions** (where council disagrees, and why it matters)
3. **Top 3 Immediate Actions** (what to do in the next sprint)
4. **Longer-term Bets** (what requires time/credits but unlocks the most value)
5. **Quality Gates** (what NOT to build to avoid bloat)

Format as a structured report, 300–400 words total. Be bold; make calls.`;

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
    .feedback-section {
      padding: 40px;
      border-top: 2px solid #e0e0e0;
      background: white;
    }
    .feedback-section h3 {
      color: #667eea;
      margin-bottom: 20px;
      font-size: 18px;
    }
    textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-family: inherit;
      font-size: 13px;
      resize: vertical;
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
      <button class="btn-secondary" id="cancelBtn" onclick="cancelCouncil()" disabled style="background: #ffcccc; color: #c0392b; border-color: #e74c3c;">
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

    <div class="feedback-section" id="feedbackSection" style="display: none;">
      <h3>💬 Refine the Council's Thinking</h3>
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 10px; font-weight: 600; font-size: 14px;">
          What would you like the council to reconsider or explore deeper?
        </label>
        <textarea 
          id="feedbackText" 
          placeholder="E.g., 'We actually have budget for 2 more animal FX recordings. How should we prioritize?'"
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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🎭 Agent Council running at http://localhost:${PORT}`);
  console.log(`Make sure ANTHROPIC_API_KEY is set in your environment`);
});
