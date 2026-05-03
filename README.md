# ☕ Coffee Alison

A playful Next.js app with Tailwind CSS + Firebase Firestore. The "No" button runs away from your mouse!

## Tech Stack
- **Next.js 14** (App Router)
- **Tailwind CSS** for styling
- **Firebase Firestore** for storing responses

## Setup

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a **Web App** to the project
4. Enable **Firestore Database** (start in test mode for development)

### 2. Environment Variables
```bash
cp .env.local.example .env.local
```
Paste your Firebase config values from: Firebase Console → Project Settings → Your Apps → SDK setup

### 3. Install & Run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) ☕

## Firestore Data Structure
Each click saves a document to the `responses` collection:
```json
{
  "answer": "yes" | "ofcourse" | "annoying" | "no",
  "createdAt": <Firestore Timestamp>
}
```
