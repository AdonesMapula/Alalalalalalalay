# 🏛️ ALALAY (Alalalalalalalay) — Philippine Citizen Assistance & Public Benefits Intelligence Platform

[![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini AI](https://img.shields.io/badge/Gemini_AI-1.5_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

**ALALAY** is a state-of-the-art Philippine public service discovery and navigation system. It bridges the gap between citizens and government welfare programs by coupling **statutory Citizen's Charters**, a **deterministic multi-factor eligibility engine**, a secure **Document Locker**, and **Google Gemini Generative AI** grounded in verified government data.

---

## 🚀 Key Features

### 1. Multi-Factor Intelligent Benefits Matching Engine
- **Deterministic Rules Primacy**: Financial calculations and statutory qualification logic are executed deterministically by [`rulesEngine.js`](./src/services/rulesEngine.js) to guarantee **zero AI hallucination**.
- **Senior Citizens Centric Matching (RA 9994 / RA 10645)**: Intelligently calculates citizen age from Date of Birth and promotes OSCA social pensions, centenarian cash incentives, and 100% PhilHealth Zero-Balance Billing to the top with `🌟 Top Match for Senior Citizen ({age} yrs)`.
- **Solo Parents Welfare (RA 11861)**: Automatically flags statutory 10% infant discounts, educational assistance, and parental leaves with `👨‍👧 Solo Parent Priority`.
- **Persons with Disabilities (RA 10754)**: Detects PWD credentials and matches 20% discounts, 12% VAT exemption, and assistive medical devices (`♿ PWD Priority Support`).
- **Employment & Salary Loans**: Matches contributing members with SSS Salary/Calamity loans and Pag-IBIG MP2/Housing options (`💼 Employed Member Benefit`), and links displaced workers with DOLE TUPAD and DSWD SLP (`🤝 Emergency Employment & Aid`).
- **Indigent Safety Net**: Automatically matches low-income citizens with 100% DOH Medical Assistance for Indigent Patients (MAP), PCSO IMAP, and DSWD AICS emergency grants (`🤝 Indigent Safety Net Priority`).
- **Document Locker Readiness Gauge**: Calculates exact document completeness (`docReadinessPercent`) and alerts citizens to missing prerequisites before applying.

---

### 2. Dedicated AI Citizen Consultation Workspace (`AskAlalayPageView.jsx`)
- **Full-Viewport Fixed Card Height**: Designed to fit snugly inside the screen viewport without creating outer browser scrollbars.
- **Fixed Header & Input Bar**: The top consultation header and bottom input form remain permanently docked in view while **only the middle conversation area scrolls**.
- **Step-by-Step Interactive Cards**: AI responses are formatted into numbered procedural steps, clear requirement checklists, and verified `.gov.ph` citation badges.
- **Topic Shortcuts**: 1-click consultation presets for *🏥 Hospital Subsidies*, *💼 SSS Loans*, *👴 Senior Citizen Free Healthcare*, *🎓 UniFAST Grants*, and *🤝 DSWD Crisis Aid*.
- **Transcript Export**: 1-click download of the complete consultation log as a clean `.txt` document.

---

### 3. Responsive 3 : 1 Dual-Card Service Detail Modal (`OpportunityDetailModal.jsx`)
- **Smooth Sliding Layout**: Clicking *"Ask ALALAY About This Service"* slides the main 3/4 detail card to the left and smoothly mounts the 1/4 AI chat card on the right.
- **Sticky Headers & Action Footers**: Program overviews, statutory entitlements, and document checklists scroll independently while the header and action buttons stay fixed.
- **Dedicated Workspace Navigator (`Maximize2`)**: 1-click button in the chat modal header that expands the consultation into the full-page workspace.
- **Grounded Charter Analysis**: Side AI chat references the exact Citizen's Charter of the selected service.

---

### 4. User-Isolated Real-time Chat Archives
- **Strict User Privacy**: Chat archives in Supabase are strictly filtered by `user_email` and `user_id`. Citizens only see their own private consultations.
- **Per-User LocalStorage Cache**: Consultations are cached under partitioned keys (`alalay_chat_archives_${userEmail}`) for instantaneous offline-ready access.
- **Seamless Session Resumption**: Reopening a previously viewed service automatically restores the active conversation history unless cleared by the citizen.

---

### 5. Admin Operations Hub (`AdminDashboard.jsx`)
- **Fixed Non-Scrolling Admin Sidebar**: Pinned with `h-screen sticky top-0` so navigation, database deployment, and sign-out controls are permanently accessible regardless of content length.
- **Citizen User Management**: Allows administrators to create and manage citizen profiles with **Date of Birth (`birth_date`)**, **Citizenship**, PWD, and Solo Parent flags.
- **Real-Time Web & Social Scraper**: Scrapes and analyzes government agency Facebook announcements and `.gov.ph` portals with automatic JSON parsing and AI categorization.
- **Knowledge Base & Two-Tier Source Governance**: Manages authoritative Tier A Citizen's Charters and moderates Tier B unverified public notices.

---

### 6. Document Locker Vault & Auto-Fulfillment
- Secure storage for digital citizen credentials (PhilSys National ID, OSCA Senior ID, Barangay Indigency, PhilHealth MDR, PWD ID, Birth Certificate).
- Automatically cross-referenced against service requirements with visual **Auto-Verified in Locker ✓** badges.

---

### 7. Custom Design System & Thin Blue Scrollbars (`index.css`)
- **Global Thin Blue Scrollbars**: Custom `6px` ultra-thin scrollbars styled with ALALAY's primary blue (`#093a96`) and dark navy hover state (`#072d75`).
- **Glassmorphism & Micro-Animations**: GPU-accelerated cubic-bezier transitions (`animate-modal-in`, `animate-side-in`, `animate-message-pop`).
- **Responsive Layouts**: Seamless desktop sidebar layout and mobile bottom navigation tab bar (`BottomTabBar.jsx`).

---

## 🛡️ AI Safety & Security Documentation

For detailed technical specifications on our safety architecture, refer to:
- 📖 [**`SYSTEM_ARCHITECTURE.md`**](./SYSTEM_ARCHITECTURE.md) — Comprehensive component architecture, data flow sequences, and pastable Mermaid diagrams.
- 🛡️ [**`AI_GUARDRAILS.md`**](./AI_GUARDRAILS.md) — The 8 layers of AI guardrails, anti-hallucination protocols, dual-key failover system, and Data Privacy Act (RA 10173) compliance.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, Vite 6 |
| **Styling & Design System** | Tailwind CSS 4, Custom Thin Scrollbars, Glassmorphism |
| **Icons & Typography** | Lucide React, Plus Jakarta Sans |
| **Generative AI** | Google Gemini 1.5 Flash / 2.0 Flash (`@google/genai` & REST) |
| **Backend & Database** | Supabase (PostgreSQL, Row-Level Security, Realtime) |
| **Deterministic Engine** | Custom JavaScript Rules Engine (`rulesEngine.js`) |

---

## ⚙️ Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/AdonesMapula/Alalalalalalalay.git
cd Alalay

# Install dependencies
npm install
```

### 3. Environment Variables Setup
Create a `.env` file in the root directory:
```env
# Google Gemini AI Keys (Dual-Key Failover)
VITE_GEMINI_API="your_primary_gemini_api_key"
VITE_GEMINI_API_RESERVE="your_reserve_gemini_api_key"

# Supabase Database Configuration
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

### 4. Database Schema Setup
Execute the SQL script in [`supabase_schema.sql`](./supabase_schema.sql) inside your Supabase SQL Editor to initialize all tables, Row Level Security policies, indexes, and seeded Citizen's Charters.

### 5. Running the Application Locally
```bash
# Start local development server
npm run dev

# Build production bundle
npm run build
```

---

## 🏛️ Grounded Legal References
- **RA 9994**: *Expanded Senior Citizens Act of 2010*
- **RA 10645**: *Mandatory PhilHealth Coverage for All Senior Citizens*
- **RA 11861**: *Expanded Solo Parents Welfare Act*
- **RA 10754**: *An Act Expanding the Benefits and Privileges of Persons with Disability (PWD)*
- **RA 11032**: *Ease of Doing Business and Efficient Government Service Delivery Act (Citizen's Charter)*
- **RA 10173**: *Data Privacy Act of 2012 (DPA)*
- **RA 11223**: *Universal Health Care Act (UHC)*

---

*Developed with pride for Filipino Citizens.* 🇵🇭
