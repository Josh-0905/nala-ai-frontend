# 🍳 NALA AI — Frontend Client Application

> **Turn What You Have Into What You'll Love**  
> AI-powered smart kitchen, pantry scanner, and recipe matching assistant.

---

## 🌟 Overview

The **NALA AI Frontend** is a modern, responsive Single Page Application (SPA) built with React 18, TypeScript, Vite, and Tailwind CSS. It empowers users to scan their pantry ingredients using photo uploads, voice dictation, or 1-click curated kits, and delivers instant recipe recommendations matching their exact ingredients with step-by-step cooking assistance.

---

## 🛠️ Technology Stack

* **Core Framework**: React 18.3.1
* **Build Tooling**: Vite 6.0.7
* **Language**: TypeScript 5.7.2
* **Styling**: Tailwind CSS 3.4.17 + PostCSS + Autoprefixer
* **Icons**: Lucide React 0.469.0
* **Animation & Visuals**: Canvas Confetti 1.9.4
* **Deployment Target**: Vercel

---

## 🚀 Features

1. **Smart Pantry Scanner**:
   * Multi-input engine: Photo upload, Natural Language text input, Voice dictation, and 1-Click pantry trays.
   * Visual radar scanner with instant ingredient identification (zero potato hallucination for Biryani and authentic dishes).
   * Interactive pantry chips with categories (Vegetables, Proteins, Masalas, Dairy, Grains, Oils).
2. **Dynamic Recipe Recommendations**:
   * Pantry Match Ratio scoring (100% full match, high match, partial match).
   * Dietary and regional filters (Telangana Heritage, South Indian, North Indian, Indo-Chinese, Continental, High Protein, Budget, 15-Minute Express).
3. **Step-by-Step Cooking Mode**:
   * Guided culinary steps with active timers, portion scaling, and technique hints.
4. **Food Waste & Expiry Tracker**:
   * Alerts users on ingredients expiring soon, calculates saved money and reduced waste metrics.
5. **Smart Shopping List**:
   * 1-click missing ingredient checklist generation with categorization and mark-as-bought functionality.
6. **Community Reviews & Ratings**:
   * Star rating system, photo attachments, helpful votes, and taste feedback.
7. **Admin Analytics Dashboard**:
   * Live inventory analytics, top scanned ingredients, user activity, and recipe metrics.

---

## 📦 Project Structure

```
client/
├── public/                 # Static assets, icons, and favicon
├── src/
│   ├── assets/             # Brand logos and imagery
│   ├── components/         # Reusable UI components & modals
│   │   ├── CookingModeModal.tsx
│   │   ├── Navbar.tsx
│   │   ├── RecipeReviewsSection.tsx
│   │   └── ...
│   ├── contexts/           # React Context state
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   ├── pages/              # Primary view pages
│   │   ├── AdminDashboardPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── FavoritesHistoryPage.tsx
│   │   ├── FoodWastePage.tsx
│   │   ├── RecipeDetailPage.tsx
│   │   ├── RecipesPage.tsx
│   │   ├── ScanPage.tsx
│   │   └── ShoppingListPage.tsx
│   ├── services/           # Backend API communication
│   │   └── api.ts
│   ├── types/              # TypeScript data interfaces
│   │   └── index.ts
│   ├── utils/              # Image dictionaries & utility helpers
│   ├── App.tsx             # Root component and navigation state
│   ├── index.css           # Tailwind CSS directives and custom animations
│   └── main.tsx            # DOM root mounting
├── .env.example            # Environment template
├── index.html              # HTML shell
├── package.json            # Client dependencies and npm scripts
├── tailwind.config.js      # Custom theme colors and typography
├── tsconfig.json           # TypeScript configuration
├── vercel.json             # Vercel SPA routing rewrites
└── vite.config.ts          # Vite bundler configuration & dev proxy
```

---

## ⚙️ Installation & Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **npm**: v9.0.0 or higher

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
For local development, leave `VITE_API_URL` empty to use the Vite proxy to `http://localhost:5000`.  
For production deployment, set `VITE_API_URL` to your live backend URL (e.g., `https://nala-ai-backend.onrender.com`).

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```
Generates optimized static assets in the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 🌐 Deployment to Vercel

1. Import this repository into [Vercel](https://vercel.com).
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:
   * `VITE_API_URL`: Your live backend API URL (optional if using serverless API routes).
6. Click **Deploy**.
