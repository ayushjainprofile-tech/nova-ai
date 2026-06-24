import { useState, useRef, useEffect } from "react";

// ─── Gemini API ───────────────────────────────────────────────────────────────
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGemini(apiKey, systemPrompt, userMessage) {
  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Gemini API error");
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// ─── Scoring helpers ──────────────────────────────────────────────────────────
function scoreProspect(info) {
  let score = 40;
  const incomeStr = String(info.income || "").replace(/[^0-9]/g, "");
  const income = parseInt(incomeStr, 10) || 0;
  if (income > 100000) score += 25;
  else if (income > 60000) score += 18;
  else if (income > 30000) score += 10;

  const intentMap = { home_loan: 20, car_loan: 18, fd: 14, savings: 10, insurance: 12 };
  score += intentMap[info.product] || 8;

  const employed = String(info.employed || "").toLowerCase();
  if (employed === "yes" || employed === "true") score += 10;
  
  const existing = String(info.existing_customer || "").toLowerCase();
  if (existing === "yes" || existing === "true") score += 5;

  return Math.min(score, 99);
}

function getTag(score) {
  if (score >= 85) return "HOT";
  if (score >= 65) return "WARM";
  return "NEW";
}

function productLabel(p) {
  return { home_loan: "Home Loan", car_loan: "Car Loan", fd: "Fixed Deposit", savings: "Savings Account", insurance: "Insurance" }[p] || p;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --green-dark: #0A2E2A;
    --green-mid: #0D5C4B;
    --green-light: #028090;
    --gold: #F5A623;
    --gold-light: #FEF3D7;
    --mint: #E8F4F2;
    --white: #FFFFFF;
    --gray: #6B7E7C;
    --text: #1A2E2A;
    --hot: #E53E3E;
    --warm: #DD6B20;
    --new: #3182CE;
    --radius: 14px;
    --shadow: 0 4px 24px rgba(0,0,0,0.10);
  }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--green-dark);
    color: var(--text);
    min-height: 100vh;
  }

  /* ── NAV ── */
  .nav {
    background: var(--green-mid);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    height: 58px;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 12px rgba(0,0,0,0.18);
  }
  .nav-logo { font-family: 'Sora', sans-serif; font-size: 22px; color: var(--white); display: flex; align-items: center; gap: 8px; }
  .nav-logo span { color: var(--gold); }
  .nav-tabs { display: flex; gap: 4px; }
  .nav-tab {
    padding: 6px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;
    color: rgba(255,255,255,0.65); border: none; background: transparent; transition: all 0.18s;
  }
  .nav-tab:hover { color: var(--white); background: rgba(255,255,255,0.08); }
  .nav-tab.active { background: var(--gold); color: var(--green-dark); }
  .nav-badge { background: var(--green-dark); color: var(--gold); font-size: 11px; font-weight: 700; border-radius: 20px; padding: 2px 8px; }

  /* ── API KEY BANNER ── */
  .api-banner {
    background: var(--gold-light);
    border-bottom: 2px solid var(--gold);
    padding: 10px 28px;
    display: flex; align-items: center; gap: 12px;
    font-size: 13px; color: #7a5000;
  }
  .api-banner input {
    flex: 1; max-width: 360px; padding: 6px 12px; border-radius: 8px;
    border: 1.5px solid var(--gold); font-size: 13px; outline: none;
    background: var(--white);
  }
  .api-banner button {
    padding: 6px 16px; border-radius: 8px; background: var(--gold);
    color: var(--green-dark); font-weight: 700; font-size: 13px; border: none; cursor: pointer;
  }

  /* ── PAGES ── */
  .page { min-height: calc(100vh - 58px); }

  /* ── CHATBOT PAGE ── */
  .chat-page {
    display: flex; flex-direction: column; align-items: center;
    padding: 32px 16px 24px;
    background: linear-gradient(160deg, #0A2E2A 0%, #0D3D35 60%, #0A2E2A 100%);
    min-height: calc(100vh - 58px);
  }
  .chat-header { text-align: center; margin-bottom: 24px; }
  .chat-header h1 { font-family: 'Sora', sans-serif; font-size: 28px; color: var(--white); }
  .chat-header p { color: rgba(255,255,255,0.55); font-size: 14px; margin-top: 4px; }

  .chat-window {
    width: 100%; max-width: 540px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: var(--radius);
    display: flex; flex-direction: column;
    height: 520px;
    box-shadow: var(--shadow);
  }
  .chat-topbar {
    background: var(--green-mid);
    border-radius: var(--radius) var(--radius) 0 0;
    padding: 12px 18px;
    display: flex; align-items: center; gap: 10px;
  }
  .bot-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--gold);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .bot-info { flex: 1; }
  .bot-info strong { color: var(--white); font-size: 14px; display: block; }
  .bot-info span { color: rgba(255,255,255,0.55); font-size: 11px; }
  .online-dot { width: 8px; height: 8px; border-radius: 50%; background: #48BB78; box-shadow: 0 0 0 2px rgba(72,187,120,0.3); }

  .chat-messages {
    flex: 1; overflow-y: auto; padding: 16px 14px; display: flex; flex-direction: column; gap: 10px;
  }
  .chat-messages::-webkit-scrollbar { width: 4px; }
  .chat-messages::-webkit-scrollbar-track { background: transparent; }
  .chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }

  .msg { display: flex; flex-direction: column; max-width: 82%; }
  .msg.bot { align-self: flex-start; }
  .msg.user { align-self: flex-end; }
  .msg-bubble {
    padding: 10px 14px; border-radius: 12px; font-size: 13.5px; line-height: 1.5;
  }
  .msg.bot .msg-bubble { background: rgba(13,92,75,0.75); color: #C8EDE8; border-bottom-left-radius: 4px; }
  .msg.user .msg-bubble { background: var(--gold); color: var(--green-dark); font-weight: 500; border-bottom-right-radius: 4px; }
  .msg-time { font-size: 10px; color: rgba(255,255,255,0.3); margin-top: 3px; }
  .msg.user .msg-time { text-align: right; }

  .typing-indicator { display: flex; gap: 4px; align-items: center; padding: 10px 14px; background: rgba(13,92,75,0.5); border-radius: 12px; width: fit-content; }
  .typing-dot { width: 7px; height: 7px; border-radius: 50%; background: #6FDCC8; animation: bounce 1.2s infinite; }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }

  .quick-replies { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 14px; }
  .quick-btn {
    padding: 6px 12px; border-radius: 20px; border: 1.5px solid rgba(245,166,35,0.5);
    background: transparent; color: var(--gold); font-size: 12px; cursor: pointer; transition: all 0.15s;
  }
  .quick-btn:hover { background: var(--gold); color: var(--green-dark); }

  .chat-input-row {
    padding: 10px 12px;
    border-top: 1px solid rgba(255,255,255,0.08);
    display: flex; gap: 8px;
  }
  .chat-input {
    flex: 1; background: rgba(255,255,255,0.07); border: 1.5px solid rgba(255,255,255,0.12);
    border-radius: 10px; padding: 9px 13px; color: var(--white); font-size: 13px; outline: none;
    transition: border 0.15s;
  }
  .chat-input::placeholder { color: rgba(255,255,255,0.3); }
  .chat-input:focus { border-color: var(--gold); }
  .send-btn {
    width: 40px; height: 40px; border-radius: 10px; background: var(--gold);
    border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0; transition: opacity 0.15s;
  }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* lead captured card */
  .lead-captured {
    margin: 12px 14px;
    background: linear-gradient(135deg, #0D5C4B, #028090);
    border-radius: 12px;
    padding: 14px 16px;
    color: var(--white);
  }
  .lead-captured h4 { font-size: 13px; color: var(--gold); margin-bottom: 6px; }
  .lead-score-big { font-family: 'Sora', sans-serif; font-size: 40px; color: var(--gold); }
  .lead-tag { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-left: 8px; }
  .tag-HOT { background: var(--hot); color: #fff; }
  .tag-WARM { background: var(--warm); color: #fff; }
  .tag-NEW { background: var(--new); color: #fff; }
  .view-dash-btn {
    margin-top: 10px; width: 100%; padding: 8px; border-radius: 8px;
    background: var(--gold); color: var(--green-dark); font-weight: 700;
    font-size: 13px; border: none; cursor: pointer;
  }

  /* ── RM DASHBOARD ── */
  .dash-page {
    padding: 24px 24px;
    background: #F0F7F5;
    min-height: calc(100vh - 58px);
  }
  .dash-header { margin-bottom: 20px; }
  .dash-header h1 { font-family: 'Sora', sans-serif; font-size: 22px; color: var(--green-mid); }
  .dash-header p { color: var(--gray); font-size: 13px; margin-top: 2px; }

  .stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
  .stat-card {
    background: var(--white); border-radius: var(--radius); padding: 16px 18px;
    box-shadow: var(--shadow); border-top: 3px solid transparent;
  }
  .stat-card.green { border-top-color: var(--green-mid); }
  .stat-card.gold  { border-top-color: var(--gold); }
  .stat-card.red   { border-top-color: var(--hot); }
  .stat-card.blue  { border-top-color: var(--new); }
  .stat-val { font-family: 'Sora', sans-serif; font-size: 30px; color: var(--green-mid); }
  .stat-label { font-size: 12px; color: var(--gray); margin-top: 2px; }

  .leads-grid { display: grid; grid-template-columns: 1fr 360px; gap: 16px; }
  .leads-list-card { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
  .card-header { padding: 14px 18px; border-bottom: 1px solid #E8F0EE; display: flex; align-items: center; justify-content: space-between; }
  .card-header h3 { font-size: 14px; font-weight: 700; color: var(--green-mid); }
  .filter-row { display: flex; gap: 6px; }
  .filter-btn {
    padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; border: none; cursor: pointer;
    background: #E8F4F2; color: var(--green-mid); transition: all 0.15s;
  }
  .filter-btn.active { background: var(--green-mid); color: var(--white); }

  .lead-item {
    padding: 13px 18px; border-bottom: 1px solid #F0F7F5;
    display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background 0.12s;
  }
  .lead-item:hover { background: #F6FDFB; }
  .lead-item.selected { background: #E8F4F2; }
  .lead-avatar {
    width: 38px; height: 38px; border-radius: 50%; background: var(--green-mid);
    color: var(--white); font-weight: 700; font-size: 14px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .lead-info { flex: 1; min-width: 0; }
  .lead-name { font-size: 13.5px; font-weight: 600; color: var(--text); }
  .lead-product { font-size: 12px; color: var(--gray); margin-top: 1px; }
  .lead-score-col { text-align: right; }
  .lead-score-num { font-family: 'Sora', sans-serif; font-size: 18px; color: var(--green-mid); }
  .lead-score-sub { font-size: 10px; color: var(--gray); }

  .empty-leads { padding: 40px; text-align: center; color: var(--gray); font-size: 14px; }

  /* Score Detail Panel */
  .score-panel {
    background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow);
    overflow: hidden; position: sticky; top: 80px;
  }
  .score-panel-top {
    background: linear-gradient(135deg, var(--green-dark), var(--green-mid));
    padding: 20px 20px 24px;
    text-align: center;
  }
  .score-circle {
    width: 90px; height: 90px; border-radius: 50%;
    border: 4px solid var(--gold);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    margin: 0 auto 12px;
    background: rgba(0,0,0,0.2);
  }
  .score-circle .big-num { font-family: 'Sora', sans-serif; font-size: 32px; color: var(--gold); line-height: 1; }
  .score-circle .score-lbl { font-size: 9px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; }
  .panel-name { color: var(--white); font-weight: 700; font-size: 16px; }
  .panel-product { color: rgba(255,255,255,0.55); font-size: 12px; margin-top: 2px; }

  .score-panel-body { padding: 16px 18px; }
  .factor-row { margin-bottom: 12px; }
  .factor-label { display: flex; justify-content: space-between; font-size: 12px; color: var(--gray); margin-bottom: 4px; }
  .factor-val { font-weight: 700; color: var(--green-mid); }
  .factor-bar { height: 6px; border-radius: 3px; background: #E8F4F2; overflow: hidden; }
  .factor-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--green-light), var(--green-mid)); transition: width 0.5s; }

  .ai-suggestion {
    background: #F0F7F5; border-radius: 10px; padding: 12px 14px; margin: 14px 0;
    border-left: 3px solid var(--green-mid);
  }
  .ai-suggestion h5 { font-size: 11px; color: var(--green-mid); font-weight: 700; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  .ai-suggestion p { font-size: 12px; color: var(--gray); line-height: 1.5; }

  .call-btn {
    width: 100%; padding: 11px; border-radius: 10px;
    background: var(--green-mid); color: var(--white); font-weight: 700; font-size: 14px;
    border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .no-select { padding: 60px 20px; text-align: center; color: var(--gray); font-size: 13px; }

  /* ── SCORE CARD PAGE ── */
  .score-page {
    padding: 24px;
    background: #F0F7F5;
    min-height: calc(100vh - 58px);
  }
  .score-page h1 { font-family: 'Sora', sans-serif; font-size: 22px; color: var(--green-mid); margin-bottom: 4px; }
  .score-page p { color: var(--gray); font-size: 13px; margin-bottom: 20px; }

  .score-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .score-card {
    background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden;
  }
  .score-card-top {
    background: linear-gradient(135deg, var(--green-dark), var(--green-mid));
    padding: 16px;
    display: flex; align-items: center; gap: 14px;
  }
  .score-donut {
    width: 64px; height: 64px; border-radius: 50%; flex-shrink: 0;
    border: 4px solid var(--gold);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.25);
  }
  .score-donut .dn { font-family: 'Sora', sans-serif; font-size: 20px; color: var(--gold); line-height: 1; }
  .score-donut .dl { font-size: 8px; color: rgba(255,255,255,0.4); }
  .sc-info .sc-name { color: var(--white); font-weight: 700; font-size: 15px; }
  .sc-info .sc-prod { color: rgba(255,255,255,0.55); font-size: 12px; margin-top: 2px; }
  .score-card-body { padding: 14px 16px; }
  .mini-factor { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; }
  .mini-factor-label { font-size: 11px; color: var(--gray); width: 100px; flex-shrink: 0; }
  .mini-bar { flex: 1; height: 5px; border-radius: 3px; background: #E8F4F2; overflow: hidden; }
  .mini-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--green-light), var(--green-mid)); }
  .mini-pct { font-size: 11px; font-weight: 700; color: var(--green-mid); width: 32px; text-align: right; }

  .score-card-footer {
    padding: 10px 16px; border-top: 1px solid #F0F7F5;
    display: flex; align-items: center; justify-content: space-between;
  }
  .assign-btn {
    padding: 6px 14px; border-radius: 8px; background: var(--green-mid);
    color: var(--white); font-size: 12px; font-weight: 700; border: none; cursor: pointer;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .stat-row { grid-template-columns: repeat(2, 1fr); }
    .leads-grid { grid-template-columns: 1fr; }
    .score-panel { position: static; }
  }
`;

// ─── CHATBOT SYSTEM PROMPT ────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are ProspectIQ, IDBI Bank's AI sales assistant. Your job is to engage website visitors, qualify them as loan/banking prospects, and capture their information.

CONVERSATION FLOW:
1. Greet warmly and ask what banking product they're interested in (home loan, car loan, FD, savings account, insurance)
2. Ask their monthly income range
3. Ask if they're currently employed/self-employed
4. Ask if they're an existing IDBI customer
5. Ask for their name and preferred contact time
6. Once you have all info, say "LEAD_CAPTURED" followed by a JSON on a new line like:
{"name":"...","product":"home_loan","income":"80000","employed":"yes","existing_customer":"no","contact_time":"morning"}

product values: home_loan, car_loan, fd, savings, insurance

Be conversational, warm, and brief. Max 2 sentences per response. Use Indian banking context.`;

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_LEADS = [
  { id: 1, name: "Rajesh Kumar",  product: "home_loan",  income: "95000",  employed: "yes", existing_customer: "no",  contact_time: "morning" },
  { id: 2, name: "Priya Sharma",  product: "fd",         income: "75000",  employed: "yes", existing_customer: "yes", contact_time: "evening" },
  { id: 3, name: "Anil Mehta",    product: "car_loan",   income: "55000",  employed: "yes", existing_customer: "no",  contact_time: "afternoon" },
  { id: 4, name: "Sunita Rao",    product: "savings",    income: "28000",  employed: "no",  existing_customer: "no",  contact_time: "morning" },
  { id: 5, name: "Vikram Singh",  product: "insurance",  income: "110000", employed: "yes", existing_customer: "yes", contact_time: "evening" },
];

const AI_SCRIPTS = {
  home_loan:  "Lead is interested in home loan. Mention IDBI's competitive 8.4% interest rate and quick 7-day approval. Ask about property location.",
  car_loan:   "Lead wants a car loan. Highlight 0 processing fee this month and 100% on-road funding. Confirm if new or used car.",
  fd:         "Lead is interested in FD. Offer 7.5% senior citizen rate or 7.1% general. Mention auto-renewal and premature withdrawal options.",
  savings:    "New savings account prospect. Offer zero-balance account with UPI benefits. Mention digital onboarding — no branch visit needed.",
  insurance:  "Insurance lead. Cross-sell IDBI Federal Life Insurance with IDBI account benefits. Ask about family size and coverage amount needed.",
};

// ─── TIME HELPER ─────────────────────────────────────────────────────────────
function now() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ─── CHATBOT ─────────────────────────────────────────────────────────────────
function Chatbot({ apiKey, onLeadCapture }) {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Namaste! 🙏 I'm ProspectIQ, IDBI Bank's AI assistant. I'm here to help you find the best banking product for your needs.\n\nAre you looking for a loan, investment, or a new account today?", time: now() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(null);
  const [history, setHistory] = useState("Assistant: Namaste! 🙏 I'm ProspectIQ, IDBI Bank's AI assistant. I'm here to help you find the best banking product for your needs.\n\nAre you looking for a loan, investment, or a new account today?");
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const quickReplies = messages.length === 1
    ? ["Home Loan", "Car Loan", "Fixed Deposit", "Savings Account", "Insurance"]
    : [];

  async function send(text) {
    if (!text.trim() || loading) return;
    if (!apiKey) { alert("Please enter your Gemini API key above."); return; }

    const userMsg = { role: "user", text, time: now() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);

    const newHistory = history + `\nUser: ${text}`;

    try {
      const reply = await callGemini(apiKey, SYSTEM_PROMPT, newHistory || text);

      if (reply.includes("LEAD_CAPTURED")) {
        const jsonMatch = reply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const info = JSON.parse(jsonMatch[0]);
          const score = scoreProspect(info);
          const tag = getTag(score);
          const lead = { ...info, id: Date.now(), score, tag };
          setLeadCaptured(lead);
          onLeadCapture(lead);
          const cleanReply = reply.split("LEAD_CAPTURED")[0].trim() ||
            `Thank you, ${info.name}! 🎉 I've captured your details. Our RM will contact you during ${info.contact_time}. You've been scored ${score}/100 — ${tag} priority!`;
          setMessages(m => [...m, { role: "bot", text: cleanReply, time: now() }]);
        }
      } else {
        setMessages(m => [...m, { role: "bot", text: reply, time: now() }]);
      }
      setHistory(newHistory + `\nAssistant: ${reply}`);
    } catch (e) {
      setMessages(m => [...m, { role: "bot", text: "Sorry, I'm having a connectivity issue. Please try again in a moment. 🙏", time: now() }]);
    }
    setLoading(false);
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h1>🤖 ProspectIQ Chatbot</h1>
        <p>AI-powered prospect qualification for IDBI Bank</p>
      </div>

      <div className="chat-window">
        <div className="chat-topbar">
          <div className="bot-avatar">🤖</div>
          <div className="bot-info">
            <strong>ProspectIQ AI</strong>
            <span>IDBI Bank — Sales Assistant</span>
          </div>
          <div className="online-dot" />
        </div>

        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="msg-bubble">{m.text}</div>
              <div className="msg-time">{m.time}</div>
            </div>
          ))}
          {loading && (
            <div className="msg bot">
              <div className="typing-indicator">
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {quickReplies.length > 0 && (
          <div className="quick-replies">
            {quickReplies.map(r => (
              <button key={r} className="quick-btn" onClick={() => send(r)}>{r}</button>
            ))}
          </div>
        )}

        {leadCaptured && (
          <div className="lead-captured">
            <h4>✅ Lead Captured!</h4>
            <div>
              <span className="lead-score-big">{leadCaptured.score}</span>
              <span className={`lead-tag tag-${leadCaptured.tag}`}>{leadCaptured.tag}</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>
              {leadCaptured.name} · {productLabel(leadCaptured.product)}
            </div>
          </div>
        )}

        <div className="chat-input-row">
          <input
            className="chat-input"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send(input)}
            disabled={loading}
          />
          <button className="send-btn" onClick={() => send(input)} disabled={loading || !input.trim()}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── RM DASHBOARD ─────────────────────────────────────────────────────────────
function Dashboard({ leads }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("ALL");

  const allLeads = [...MOCK_LEADS.map(l => ({ ...l, score: scoreProspect(l), tag: getTag(scoreProspect(l)) })), ...leads]
    .sort((a, b) => b.score - a.score);

  const filtered = filter === "ALL" ? allLeads : allLeads.filter(l => l.tag === filter);
  const hot = allLeads.filter(l => l.tag === "HOT").length;
  const pipeline = allLeads.reduce((a, l) => {
    const est = { home_loan: 50, car_loan: 8, fd: 5, savings: 0.5, insurance: 3 }[l.product] || 2;
    return a + est;
  }, 0);

  const factors = (lead) => ({
    "Income Signal":    Math.min(99, Math.round((parseInt(lead.income) || 0) / 1200)),
    "Intent Score":     { home_loan: 92, car_loan: 85, fd: 78, savings: 65, insurance: 80 }[lead.product] || 70,
    "Employment":       lead.employed === "yes" ? 95 : 40,
    "Customer Loyalty": lead.existing_customer === "yes" ? 90 : 50,
  });

  return (
    <div className="dash-page">
      <div className="dash-header">
        <h1>RM Priority Dashboard</h1>
        <p>Today's AI-ranked lead list — sorted by conversion probability</p>
      </div>

      <div className="stat-row">
        <div className="stat-card green">
          <div className="stat-val">{allLeads.length}</div>
          <div className="stat-label">Total Leads</div>
        </div>
        <div className="stat-card red">
          <div className="stat-val">{hot} 🔥</div>
          <div className="stat-label">Hot Prospects</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-val">₹{pipeline}L</div>
          <div className="stat-label">Pipeline Value</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-val">{leads.length}</div>
          <div className="stat-label">Live (Chatbot)</div>
        </div>
      </div>

      <div className="leads-grid">
        <div className="leads-list-card">
          <div className="card-header">
            <h3>Prospect List</h3>
            <div className="filter-row">
              {["ALL","HOT","WARM","NEW"].map(f => (
                <button key={f} className={`filter-btn ${filter===f?"active":""}`} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-leads">No {filter} prospects yet.</div>
          ) : filtered.map(lead => (
            <div key={lead.id} className={`lead-item ${selected?.id === lead.id ? "selected" : ""}`} onClick={() => setSelected(lead)}>
              <div className="lead-avatar">{lead.name[0]}</div>
              <div className="lead-info">
                <div className="lead-name">{lead.name}</div>
                <div className="lead-product">
                  <span className={`lead-tag tag-${lead.tag}`}>{lead.tag}</span>
                  {" "}{productLabel(lead.product)}
                </div>
              </div>
              <div className="lead-score-col">
                <div className="lead-score-num">{lead.score}</div>
                <div className="lead-score-sub">/ 100</div>
              </div>
            </div>
          ))}
        </div>

        <div className="score-panel">
          {selected ? (
            <>
              <div className="score-panel-top">
                <div className="score-circle">
                  <span className="big-num">{selected.score}</span>
                  <span className="score-lbl">score</span>
                </div>
                <div className="panel-name">{selected.name}</div>
                <div className="panel-product">{productLabel(selected.product)}</div>
                <div style={{ marginTop: 6 }}>
                  <span className={`lead-tag tag-${selected.tag}`}>{selected.tag} Priority</span>
                </div>
              </div>
              <div className="score-panel-body">
                {Object.entries(factors(selected)).map(([k, v]) => (
                  <div key={k} className="factor-row">
                    <div className="factor-label">
                      <span>{k}</span>
                      <span className="factor-val">{v}%</span>
                    </div>
                    <div className="factor-bar">
                      <div className="factor-fill" style={{ width: `${v}%` }} />
                    </div>
                  </div>
                ))}
                <div className="ai-suggestion">
                  <h5>🤖 AI Suggestion</h5>
                  <p>{AI_SCRIPTS[selected.product] || "Follow up within 24 hours for best conversion."}</p>
                </div>
                <button className="call-btn">📞 Connect with Lead</button>
              </div>
            </>
          ) : (
            <div className="no-select">
              <div style={{ fontSize: 32, marginBottom: 10 }}>👆</div>
              Select a prospect to view their score card and AI talking points.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SCORE CARDS ─────────────────────────────────────────────────────────────
function ScoreCards({ leads }) {
  const allLeads = [
    ...MOCK_LEADS.map(l => ({ ...l, score: scoreProspect(l), tag: getTag(scoreProspect(l)) })),
    ...leads
  ].sort((a, b) => b.score - a.score);

  const factors = (lead) => [
    { label: "Income Signal",    val: Math.min(99, Math.round((parseInt(lead.income) || 0) / 1200)) },
    { label: "Intent Score",     val: { home_loan: 92, car_loan: 85, fd: 78, savings: 65, insurance: 80 }[lead.product] || 70 },
    { label: "Employment",       val: lead.employed === "yes" ? 95 : 40 },
    { label: "Customer Loyalty", val: lead.existing_customer === "yes" ? 90 : 50 },
  ];

  return (
    <div className="score-page">
      <h1>Prospect Score Cards</h1>
      <p>Individual AI-generated score breakdowns for all {allLeads.length} prospects</p>

      <div className="score-grid">
        {allLeads.map(lead => (
          <div key={lead.id} className="score-card">
            <div className="score-card-top">
              <div className="score-donut">
                <span className="dn">{lead.score}</span>
                <span className="dl">SCORE</span>
              </div>
              <div className="sc-info">
                <div className="sc-name">{lead.name}</div>
                <div className="sc-prod">{productLabel(lead.product)}</div>
                <div style={{ marginTop: 6 }}>
                  <span className={`lead-tag tag-${lead.tag}`}>{lead.tag}</span>
                </div>
              </div>
            </div>
            <div className="score-card-body">
              {factors(lead).map(f => (
                <div key={f.label} className="mini-factor">
                  <span className="mini-factor-label">{f.label}</span>
                  <div className="mini-bar"><div className="mini-fill" style={{ width: `${f.val}%` }} /></div>
                  <span className="mini-pct">{f.val}%</span>
                </div>
              ))}
            </div>
            <div className="score-card-footer">
              <span style={{ fontSize: 12, color: "var(--gray)" }}>Contact: {lead.contact_time || "anytime"}</span>
              <button className="assign-btn">📞 Assign RM</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("chat");
  const [apiKey, setApiKey] = useState("");
  const [apiInput, setApiInput] = useState("");
  const [liveleads, setLiveLeads] = useState([]);

  function onLeadCapture(lead) {
    setLiveLeads(l => [lead, ...l]);
  }

  return (
    <>
      <style>{css}</style>

      <nav className="nav">
        <div className="nav-logo">Prospect<span>IQ</span></div>
        <div className="nav-tabs">
          <button className={`nav-tab ${tab==="chat"?"active":""}`} onClick={() => setTab("chat")}>🤖 Chatbot</button>
          <button className={`nav-tab ${tab==="dash"?"active":""}`} onClick={() => setTab("dash")}>
            📊 RM Dashboard {liveleads.length > 0 && <span className="nav-badge">{liveleads.length} new</span>}
          </button>
          <button className={`nav-tab ${tab==="scores"?"active":""}`} onClick={() => setTab("scores")}>🎯 Score Cards</button>
        </div>
      </nav>

      {!apiKey && (
        <div className="api-banner">
          <span>🔑 Enter your Gemini API key to activate the chatbot:</span>
          <input
            type="password"
            placeholder="AIza..."
            value={apiInput}
            onChange={e => setApiInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && setApiKey(apiInput)}
          />
          <button onClick={() => setApiKey(apiInput)}>Activate</button>
        </div>
      )}

      <div className="page">
        {tab === "chat"   && <Chatbot apiKey={apiKey} onLeadCapture={onLeadCapture} />}
        {tab === "dash"   && <Dashboard leads={liveleads} />}
        {tab === "scores" && <ScoreCards leads={liveleads} />}
      </div>
    </>
  );
}
