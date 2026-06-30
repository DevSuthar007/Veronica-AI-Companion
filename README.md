# Veronica AI 🤖💜

> Your personal productivity companion that actually gives a damn.

🌐 **Live Demo:** [veronica-ai-15063223082.asia-southeast1.run.app](https://veronica-ai-15063223082.asia-southeast1.run.app/)

Most productivity apps remind you. Veronica *stays with you*.

She tracks your deadlines, polishes your notes, scores your consistency, and yes — she gets mad if you keep ignoring your tasks.

---

## 🤔 What is this?

Veronica is an AI-powered companion built to fix the one thing every productivity app gets wrong: **accountability without personality**.

She's not a notification. She's not a checklist. She's a character who reacts to how well you're keeping your commitments — happy when you're on top of things, worried when you're slipping, and straight-up angry when you've been ghosting your own goals.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 Smart Deadline Tracking | Just type naturally — *"finish report by tomorrow 5pm"* — she handles the rest |
| 💖 Cooperation Score | A live score that reflects your real follow-through, from 0% to 100% |
| 🎙️ Voice + Mood System | Veronica speaks, and her tone shifts between Happy, Neutral, Worried & Angry |
| 📝 Note Polisher | Turns your messy drafts into clean, structured markdown documents |
| ⏱️ Study Sprint Mode | Focused work blocks with direct encouragement to keep you locked in |
| 🛡️ Offline Fallback | Three-tier AI architecture — works even when the cloud doesn't |

---

## 🧠 How the AI Fallback Works

Veronica never goes down. Here's why:

```
Request comes in
      ↓
Gemini 2.5 Flash  ──(fails)──→  Retry once
      ↓                               ↓
   Success                  Gemini 2.0 Flash Lite
                                       ↓
                              (fails) → Veronica's Offline
                                        Heuristic Engine
```

You never lose your companion mid-session — even during outages.

---

## 💖 The Cooperation Score

| Score Range | Veronica's Mood |
|---|---|
| 90% – 100% | 😊 Happy |
| 60% – 89% | 😐 Neutral |
| 30% – 59% | 😟 Worried |
| 0% – 29% | 😠 Angry |

No tasks assigned? Score stays at a perfect **100%** — she trusts you until you give her a reason not to.

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite + TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

**Backend**
- Node.js + Express.js
- Esbuild + TSX

**AI & Cloud**
- Google Gemini 2.5 Flash *(primary)*
- Google Gemini 2.0 Flash Lite *(fallback)*
- Google AI Studio
- Google Cloud Run

**Browser APIs**
- Web Speech Synthesis API *(Veronica's voice)*
- Web LocalStorage API *(offline persistence)*

---

## 🚀 Running Locally

**Prerequisites:** Node.js

1. Install dependencies:
```bash
npm install
```

2. Set your `GEMINI_API_KEY` in `.env.local`:
```bash
GEMINI_API_KEY=your_key_here
```

3. Start the dev server:
```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) and meet Veronica.

---

## 🌐 Live Demo

Try it live → [veronica-ai-15063223082.asia-southeast1.run.app](https://veronica-ai-15063223082.asia-southeast1.run.app/)

Deployed on **Google Cloud Run** — auto-scaling, zero cold-start pain.

---

## 📁 Project Structure

```
Veronica-AI-Companion/
├── src/
│   ├── components/   # UI components & Veronica avatar
│   ├── pages/        # App views
│   └── lib/          # Utilities & state
├── assets/           # Static assets
├── server.ts         # Express backend
├── index.html
├── package.json
└── tsconfig.json
```

---

## ⚡ Why Veronica?

Because the problem was never that you forgot.
It's that nothing made you *care* enough to remember.

Veronica makes it personal.

---

Built with 💜 for **Vibe2Ship Hackathon 2026**

---

© 2026 Dev Suthar. All rights reserved.
