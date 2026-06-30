<div align="center">

# 🤖 Veronica Task Companion 💜

### *The productivity companion that actually gives a damn.*

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Try%20Veronica%20Now-7C3AED?style=for-the-badge)](https://veronica-ai-15063223082.asia-southeast1.run.app/)

<br/>

> *Most productivity apps remind you.*
> *Veronica stays with you.*

She tracks your deadlines, polishes your notes, scores your consistency —
and yes, **she gets mad** if you keep ignoring your tasks.

</div>

---

## 🤔 What is Veronica?

Veronica is an AI-powered personal companion built to fix the one thing every productivity app gets wrong — **accountability without personality**.

She's not a notification. She's not a checklist.

She's a **character** who reacts to how well you're keeping your commitments — happy when you're crushing it, worried when you're slipping, and straight-up **angry** when you've been ghosting your own goals.

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🎯 | **Smart Deadline Tracking** | Type naturally — *"finish report by tomorrow 5pm"* — she parses the rest |
| 💖 | **Cooperation Score** | A live accountability score from 0% to 100% that updates in real time |
| 🎙️ | **Voice + Mood System** | Veronica speaks — her tone shifts between Happy, Neutral, Worried & Angry |
| 📝 | **AI Note Polisher** | Messy brain-dump → clean, structured markdown document in one click |
| ⏱️ | **Study Sprint Mode** | Focused work blocks with direct encouragement to keep you locked in |
| 🛡️ | **Offline Fallback** | Three-tier AI architecture — works even when the cloud doesn't |

---

## 💖 The Cooperation Score

> *Veronica trusts you by default. Don't break that trust.*

| Score | Mood | What it means |
|---|---|---|
| 90% – 100% | 😊 **Happy** | You're killing it. Keep going. |
| 60% – 89% | 😐 **Neutral** | Decent. But she's watching. |
| 30% – 59% | 😟 **Worried** | She's concerned. Get back on track. |
| 0% – 29% | 😠 **Angry** | You've disappointed her. Fix it. |

No tasks assigned? Score stays at a perfect **100%** — she gives you the benefit of the doubt.

---

## 🧠 How the AI Fallback Works

```
📡 Request comes in
         ↓
 ┌───────────────────┐
 │  Gemini 2.5 Flash │  ◄── Primary Model
 └───────────────────┘
         ↓ fails?
 ┌───────────────────────┐
 │ Gemini 2.0 Flash Lite │  ◄── Secondary Fallback
 └───────────────────────┘
         ↓ fails?
 ┌──────────────────────────────┐
 │ Veronica's Offline Heuristic │  ◄── Local Engine (always works)
 └──────────────────────────────┘
```

> You **never** lose your companion mid-session — even during outages.

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| ⚛️ Frontend | React 18 + Vite + TypeScript |
| 🎨 Styling | Tailwind CSS + Framer Motion |
| 🔧 Backend | Node.js + Express.js |
| 🤖 AI (Primary) | Google Gemini 2.5 Flash |
| 🤖 AI (Fallback) | Google Gemini 2.0 Flash Lite |
| ☁️ Platform | Google Cloud Run + Google AI Studio |
| 🎙️ Voice | Web Speech Synthesis API |
| 💾 Storage | Web LocalStorage API |

</div>

---

## 🚀 Running Locally

**Prerequisites:** Node.js

```bash
# 1. Clone the repo
git clone https://github.com/DevSuthar007/Veronica-AI-Companion.git
cd Veronica-AI-Companion

# 2. Install dependencies
npm install

# 3. Add your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env.local

# 4. Start the dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) and meet Veronica. 💜

---

## 📁 Project Structure

```
Veronica-AI-Companion/
├── 📁 assets/
│   └── 📁 .aistudio/        # Google AI Studio config
├── 📁 src/                   # React frontend source
├── 🔧 server.ts              # Express backend + AI routing
├── 🌐 index.html             # App entry point
├── ⚙️  vite.config.ts        # Vite configuration
├── ⚙️  tsconfig.json         # TypeScript configuration
├── 📦 package.json           # Dependencies
├── 📦 package-lock.json      # Lockfile
├── 🗂️  PROJECT.md            # Project documentation
├── 🗂️  metadata.json         # App metadata
├── 🔒 .env.example           # Environment variables template
└── 🚫 .gitignore
```

---

## ⚡ Why Veronica?

> *The problem was never that you forgot.*
> *It's that nothing made you* **care** *enough to remember.*

Veronica makes productivity **personal**.

---

<div align="center">

Built with 💜 for **Vibe2Ship Hackathon 2026**

🌐 **[Try Veronica Live →](https://veronica-ai-15063223082.asia-southeast1.run.app/)**

---

© 2026 **Dev Suthar**. All rights reserved.

</div>
