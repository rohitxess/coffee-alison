
A playful Next.js app with Tailwind CSS + Firebase Firestore. 

## Tech Stack
- **Next.js 14** (App Router)
- **Tailwind CSS** for styling
- **Typescript** 
- **React.js**
- **Firebase Firestore** for storing responses
- **Firebase Storage** for storing jpeg and png files 
- **Twilio** for sms routing
- **Zod and express** for validation and authentication 

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

### 3. Install & Run (use yarn or npm or another other package manager)
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 

