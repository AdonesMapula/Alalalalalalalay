# 🏛️ ALALAY (Alalalalalalalay) — Philippine Citizen Assistance & Public Benefits Intelligence Platform

[![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini AI](https://img.shields.io/badge/Gemini_AI-Flash_3.6_%2F_3.7_%2F_2.0-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Tesseract.js](https://img.shields.io/badge/Tesseract.js-Client_OCR-5C6BC0?logo=tesseract&logoColor=white)](https://tesseract.projectnaptha.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

**ALALAY** is a state-of-the-art Philippine public service discovery, document intelligence, and government navigation system. It bridges the gap between citizens and public welfare programs by coupling **statutory Citizen's Charters**, a **deterministic multi-factor eligibility engine**, an **Active Benefit Tracker**, a secure **DocAgent Document Vault with Multimodal Vision OCR**, an **Auto-Apply Consent Engine**, and **Google Gemini Generative AI** grounded in verified government data.

---

## 🚀 Key Features

### 1. Multimodal Image & Document Parser Engine (`imageParserService.js`)
- **Deep Whole-Image Content Reading**: Reads text, layout, stamps, seals, statement numbers, consumer records, and due dates directly from image pixels (**100% independent of filename metadata**), eliminating false classifications caused by generic camera filenames (`IMG_1029.jpg`, `scan_001.png`, `photo.jpeg`).
- **Hybrid AI Vision & Local In-Browser OCR**:
  - *Primary*: Multimodal Google Gemini Vision AI (`gemini-1.5-flash` / `gemini-2.0-flash`) for deep semantic understanding of document layout, complex forms, stamps, and tables.
  - *Secondary*: Client-side `tesseract.js` OCR fallback for uninterrupted offline or rate-limited operation.
- **Comprehensive Document Classification**:
  - **Proof of Billing / Utility Bills**: Metropolitan Cebu Water District (MCWD), Maynilad, Manila Water, Prime Water, Meralco, Electric Cooperatives, PLDT, Globe, Converge (extracts statement numbers, account codes, due dates, consumer names, and service addresses).
  - **National ID / Gov ID**: PhilSys National ID (CRN), Driver's License, UMID, Passport, SSS/GSIS, PRC, Voter's ID, Senior Citizen ID, PWD ID.
  - **Barangay Certificates**: Indigency Certificates, Barangay Clearances, Residency Certificates.
  - **Clearances**: NBI Clearance, Police Clearance.
  - **Health & Civil Records**: PhilHealth Member Data Record (MDR), PSA Birth Certificate, Medical Certificates, Clinical Abstracts.
  - **Employment & Income**: Certificate of Employment (COE), Employee Payslips, BIR 2316 / ITR, Resume / Curriculum Vitae (CV), Bio-Data.
  - **Academic Records**: School Registration / Certificate of Registration (COR), Transcript of Records.
- **Instant Confidence Level & Form Autofill**: Once an image is uploaded and scanned, the system displays the **Confidence Score** (e.g., `97% Confidence Level`), **Document Name**, and **Document Type**, auto-filling all primary form fields and synchronizing extracted credentials to the citizen profile.

---

### 2. Active Benefit Tracker (Dedicated Entitlement Hub)
- **Comprehensive Citizen Benefit Overview**: A dedicated workspace tracking all public benefits, statutory discounts, and government assistance programs that the citizen currently holds or has actively unlocked.
- **Coverage Status & Expiration Watchdog**: Continuously monitors the active status, validity windows, renewal dates, and annual re-certification deadlines for all held benefits (e.g. OSCA Senior Citizen Social Pensions, PhilHealth Konsulta validity, PWD ID validity, SSS loan amortization schedules).
- **Document Vault Cross-Referencing**: Directly links active benefits with supporting vault documents, proactively alerting the citizen if an expiring ID, clearance, or proof of billing threatens their benefit continuity.
- **Statutory Entitlement Value Summary**: Aggregates statutory discount privileges (20% discount + 12% VAT exemption under RA 9994 / RA 10754, 100% Free Higher Education under RA 10931, PhilHealth Zero-Balance Billing).

---

### 3. Multi-Factor Intelligent Benefits Matching Engine
- **Deterministic Rules Primacy**: Financial calculations and statutory qualification logic are executed deterministically by [`rulesEngine.js`](./src/services/rulesEngine.js) to guarantee **zero AI hallucination**.
- **Senior Citizens Centric Matching (RA 9994 / RA 10645)**: Intelligently calculates citizen age from Date of Birth and promotes OSCA social pensions, centenarian cash incentives, and 100% PhilHealth Zero-Balance Billing to the top with `🌟 Top Match for Senior Citizen ({age} yrs)`.
- **Solo Parents Welfare (RA 11861)**: Automatically flags statutory 10% infant discounts, educational assistance, and parental leaves with `👨‍👧 Solo Parent Priority`.
- **Persons with Disabilities (RA 10754)**: Detects PWD credentials and matches 20% discounts, 12% VAT exemption, and assistive medical devices (`♿ PWD Priority Support`).
- **Employment & Salary Loans**: Matches contributing members with SSS Salary/Calamity loans and Pag-IBIG MP2/Housing options (`💼 Employed Member Benefit`), and links displaced workers with DOLE TUPAD and DSWD SLP (`🤝 Emergency Employment & Aid`).
- **Indigent Safety Net**: Automatically matches low-income citizens with 100% DOH Medical Assistance for Indigent Patients (MAP), PCSO IMAP, and DSWD AICS emergency grants (`🤝 Indigent Safety Net Priority`).
- **First-Time Jobseekers Waiver (RA 11261)**: Automatically flags 100% fee waivers for Barangay Clearance, NBI Clearance, Police Clearance, and Medical Certificates for graduating jobseekers.

---

### 4. Auto-Apply Consent & Application Queue Engine
- **Strict 95%+ "Likely Eligible" Bar**: Automatically prepares and queues applications only when the citizen's demographics and verified vault documents achieve a 95%+ match.
- **Two Authorized Consent Modes**:
  - *Confirm Each Application (Recommended)*: AI prepares the submission as "Ready to Submit" for citizen review and 1-tap confirmation.
  - *Full Automation*: Submits 95%+ verified statutory claims autonomously and logs them in Application History.
- **Category Selectivity**: Citizens can restrict Auto-Apply to specific benefit sectors (e.g. Health, Social Welfare, Education, Jobs, Utility Assistance).

---

### 5. DocAgent AI Document Vault & Expiration Sentinel (`docAgentService.js`)
- **Autonomous Ingestion & Expiration Watchdog**: Computes statutory document validity periods (e.g., 90 days for utility bills/payslips, 180 days for barangay clearances, 1 year for NBI clearances, 10 years for PhilSys IDs, permanent for PSA birth certificates).
- **DocAgent Renewal Modal**: Provides 1-click step-by-step renewal packets and statutory requirement guides when documents approach expiration.
- **AES-256 Vault Encryption**: All stored citizen documents, credentials, and extracted attributes are encrypted with AES-256 standard security.

---

### 6. Conversational Application Intake Agent (`ApplicationIntakeAgent.jsx`)
- **Step-by-Step AI Form Assistant**: Interactive intake guide walking citizens through application forms, field-by-field preparation, and document attachment verification.
- **Direct Image & Document Parsing**: Citizens can drop document images (e.g., water bills, IDs, resumes, clearances) directly into the intake chat to auto-fill matching interview questions.
- **Readiness Verification**: Validates mandatory credentials before submission to avoid rejected applications at government front desks.

---

### 7. Intent-Aware Smart RAG & Multi-Strategy Web Scrapers
- **Subject vs. Intent Parser (`analyzeQuestion`)**: Separates query subject from requested intent (available options vs. requirements vs. eligibility vs. fees vs. application steps), eliminating keyword collision errors.
- **Scraped Agency Directory**: Live integration with official `.gov.ph` agency portals and statutory benefit circulars.
- **Cheerio & Facebook Scraper**: Continuous scanning of official government announcement feeds with SHA-256 deduplication hashing.

---

### 8. Bilingual English & Filipino (Tagalog) i18n Localization (`translations.js`)
- Seamless language toggle supporting both **English** and **Filipino (Tagalog)** across all navigation, dashboard, explore, documents, active benefit tracking, and profile screens.

---

### 9. Dedicated AI Citizen Consultation Workspace (`AskAlalayPageView.jsx`)
- **Full-Viewport Fixed Card Height**: Designed to fit snugly inside the screen viewport without creating outer browser scrollbars.
- **Fixed Header & Input Bar**: Docked header and bottom input island with an independently scrolling conversation stream.
- **Step-by-Step Interactive Cards**: AI responses are formatted into numbered procedural steps, clear requirement checklists, and verified `.gov.ph` citation badges.
- **Transcript Export**: 1-click download of the complete consultation log as a clean `.txt` document.

---

### 10. Admin Operations Hub (`AdminDashboard.jsx`)
- **Fixed Non-Scrolling Admin Sidebar**: Pinned with `h-screen sticky top-0` for permanent navigation access.
- **Citizen User Management**: Create and manage citizen profiles with **Date of Birth (`birth_date`)**, **Citizenship**, PWD, and Solo Parent flags.
- **Real-Time Web & Social Scraper**: Scrapes and analyzes government agency Facebook announcements and `.gov.ph` portals with automatic JSON parsing and AI categorization.

---

## 🛡️ AI Safety & Security Documentation

For detailed technical specifications on our safety architecture, refer to:
- 📖 [**`SYSTEM_ARCHITECTURE.md`**](./SYSTEM_ARCHITECTURE.md) — Comprehensive component architecture, data flow sequences, and pastable Mermaid diagrams.
- 🛡️ [**`AI_GUARDRAILS.md`**](./AI_GUARDRAILS.md) — The 10 layers of AI guardrails, anti-hallucination protocols, vision parsing guardrails, dual-key failover system, and Data Privacy Act (RA 10173) compliance.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, Vite 6 |
| **Styling & Design System** | Tailwind CSS 4, Custom Thin Scrollbars, Glassmorphism |
| **Icons & Typography** | Lucide React, Plus Jakarta Sans |
| **Generative AI** | Google Gemini Flash 3.6 / 3.7 / 2.0 / 1.5 (`@google/genai` & REST) |
| **Vision & OCR Engine** | Gemini Multimodal Vision API + Tesseract.js (Client-Side OCR) |
| **Backend & Database** | Supabase (PostgreSQL, Row-Level Security, Realtime) |
| **Deterministic Engine** | Custom JavaScript Rules Engine (`rulesEngine.js`) |
| **Document Sentinel** | DocAgent OCR, Image Parser & Expiration Service (`docAgentService.js`, `imageParserService.js`) |
| **Localization** | Custom Bilingual i18n Engine (`translations.js`) |

---

## ⚙️ Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/WMROger/Alalalalalalalay.git
cd Alalalalalalalay

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

# Run linting
npm run lint

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
- **RA 11261**: *First-Time Jobseekers Assistance Act*
- **RA 10931**: *Universal Access to Quality Tertiary Education Act (Free Higher Education)*
- **RA 11909**: *Permanent Validity of Birth Certificates Act*

---

*Developed with pride for Filipino Citizens.* 🇵🇭
