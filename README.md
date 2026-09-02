# 🌱 CropHealth AI — Krishi Suraksha Platform
### *AI-Powered Early Crop Pest/Disease Detection, Surveillance & ICAR Advisory System*
> **Smart India Hackathon 2026 | Problem Statement ID: 26131**  
> *Ministry/Organization: Government of Maharashtra • MSInS*

---

## 🌟 Overview
**CropHealth AI (Krishi Suraksha)** is an enterprise-grade, mobile-first agricultural decision support platform designed to empower smallholder and commercial farmers across India. Combining multimodal vision AI, live Open-Meteo microclimate telemetry, ICAR Integrated Pest Management (IPM) guidelines, certified KVK agricultural scientist validation, and real-time geospatial surveillance heatmaps.

---

## ✨ Key Features

### 1. 📷 Multimodal AI Crop Diagnosis
- Instant on-device camera capture & upload to Supabase Storage.
- Dual-path validation engine with confidence bounded screening (`1%` to `99%`).
- Comprehensive disease pathogen catalog: Cotton (Pink Bollworm, Grey Mildew), Tomato (Early/Late Blight), Rice (Blast, Sheath Blight), Soybean (Rust), Wheat (Rust), Grapes (Downy Mildew), Sugarcane (Red Rot).

### 2. 🌤 Live Microclimate & GDD Risk Engine
- Real-time hourly Open-Meteo API weather synchronization (Temperature, Relative Humidity, Precipitation, Wind Speed).
- Growing Degree Days (GDD) and fungal risk coefficient calculation.
- Automated early warning in-app push alerts for sudden humidity or pest risk spikes.

### 3. 👨‍🔬 Certified KVK Expert Validation & Audit Trail
- Multi-tier role-based access control (`farmer`, `expert`, `officer`, `admin`).
- Dual-action scientist verification workflow with ICAR IPM chemical/non-chemical treatment prescriptions.
- Immutable audit log tracking with timestamps.

### 4. 🗺 Interactive Farm Map & Surveillance Heatmap
- Leaflet + OpenStreetMap integration with one-tap device GPS location detection.
- Pan-India hierarchy support across 28+ states and all 750+ districts.
- District and Taluka disease density hotspot heatmaps.

### 5. 🌐 13 Indian Languages (100% Consistent Multilingual i18n)
- Hindi (`हिन्दी`), Marathi (`मराठी`), Bengali (`বাংলা`), Tamil (`தமிழ்`), Telugu (`తెలుగు`), Gujarati (`ગુજરાતી`), Punjabi (`ਪੰਜਾਬੀ`), Kannada (`ಕನ್ನಡ`), Malayalam (`മലയാളം`), Odia (`ଓଡ଼ିଆ`), Assamese (`অসমীয়া`), Urdu (`اردو`), English.
- Pure language consistency without mixed Hindi/English text leaks.

### 6. 🔐 Multi-Option Authentication & Master Recovery
- 📱 10-Digit Mobile Number + Password Login/Signup.
- 🌐 One-Tap Google OAuth Sign-In.
- 🔑 Master Recovery Key (`SIH2026`) self-service password reset system.
- 🗄 Automatic PostgreSQL profile creation trigger and Supabase Realtime synchronization.

---

## 🏗 System Architecture

```
                                  ┌────────────────────────┐
                                  │   Farmer Mobile / Web  │
                                  │   (React + TypeScript) │
                                  └───────────┬────────────┘
                                              │
                     ┌────────────────────────┼────────────────────────┐
                     ▼                        ▼                        ▼
           ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
           │ Supabase Auth    │     │ Open-Meteo API   │     │ Gemini AI Engine │
           │ Phone / Google   │     │ Hourly Telemetry │     │ Multimodal Vision│
           └─────────┬────────┘     └─────────┬────────┘     └─────────┬────────┘
                     │                        │                        │
                     └────────────────────────┼────────────────────────┘
                                              ▼
                             ┌──────────────────────────────────┐
                             │  Supabase PostgreSQL (Realtime)  │
                             │  • profiles       • farms        │
                             │  • farm_crops     • observations │
                             │  • diagnoses      • expert_evals │
                             │  • risk_alerts    • weather_obs  │
                             └──────────────────────────────────┘
```

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Leaflet
- **Backend & Database**: Supabase (PostgreSQL with RLS, Realtime Channels, Edge Functions, Storage Buckets)
- **AI & ML**: Google Gemini Vision AI API & ICAR Pest Diagnostic Knowledge Base
- **Weather Telemetry**: Open-Meteo Open API (Zero API key dependency)
- **Deployment**: Vercel (Production-grade Single Page App configuration)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/gopal-maddheshiya/krishi-suraksha-sih2026.git
cd krishi-suraksha-sih2026
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://qlloickdkhipjwqtnzkc.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄 Supabase Database Setup
Execute the unified migration script [`supabase/migrations/20260903000007_unified_all_in_one_setup.sql`](supabase/migrations/20260903000007_unified_all_in_one_setup.sql) in your **Supabase SQL Editor** to automatically configure all tables, RLS policies, auto-triggers, and realtime publications.

---

## 🚢 Vercel Deployment

1. Import the repository into [Vercel](https://vercel.com/).
2. Add the environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy! The included `vercel.json` ensures all client-side routing works seamlessly.

---

## 👥 Team
- **Project**: Krishi Suraksha (CropHealth AI)
- **Problem Statement**: SIH 2026 — PS 26131
- **License**: MIT
