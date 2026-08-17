# ALALAY System Architecture & Engineering Blueprint

The **ALALAY (Alalalalalalalay)** platform is an intelligent Philippine Citizen Assistance, Statutory Benefits Discovery, and Government Service Navigation system. It connects verified Citizen's Charters with citizen demographic profiles through a multi-factor deterministic matching engine, automated scrapers, a secure DocAgent Document Vault, an Active Benefit Tracker, and grounded Google Gemini Generative AI.

---

## 1. System Architecture Flowchart

```mermaid
flowchart TB

    %% ─────────────────────────────────────────────
    %% 1. DATA SOURCING AND INGESTION
    %% ─────────────────────────────────────────────
    subgraph DataSourcing["1. Data Sourcing & Ingestion"]
        direction LR

        ADMIN_MGMT["Admin Operations Hub<br/>Citizen profiles, demographics, knowledge base"]
        TIER_A["Tier A Statutory Charters<br/>Citizen's Charters, PhilHealth, OSCA, SSS, DSWD, CHED"]
        TIER_B["Tier B Live Scraped Portals<br/>Official agency sites, .gov.ph directories, FB circulars"]
        SCRAPER_PIPE["Scraper Pipeline & Proxy<br/>Cheerio, webScraper.js, facebookScraper.js, SHA-256"]
        ALLOWLIST_GUARD["Allowlist & Domain Guard<br/>Official .gov.ph validation and CORS proxy"]

        TIER_B --> SCRAPER_PIPE --> ALLOWLIST_GUARD
    end

    %% ─────────────────────────────────────────────
    %% 2. PERSISTENCE AND CLIENT STATE
    %% ─────────────────────────────────────────────
    subgraph StateStorage["2. Persistence, Localization & State"]
        direction LR

        SUPABASE_DB[("Supabase PostgreSQL (RLS)<br/>users, opportunities, documents, archives")]
        GLOBAL_STATE["AppContext Global State<br/>Session, i18n (EN/FIL), Auto-Apply state"]
        LOCAL_STORAGE[("User-Isolated Local Cache<br/>alalay_chat_archives_userEmail, pinned items")]
        I18N_ENGINE["Bilingual i18n Engine<br/>translations.js (English & Filipino)"]

        SUPABASE_DB <--> GLOBAL_STATE
        GLOBAL_STATE <--> LOCAL_STORAGE
        GLOBAL_STATE <--> I18N_ENGINE
    end

    %% ─────────────────────────────────────────────
    %% 3. CORE ENGINES AND AI INTEGRATION
    %% ─────────────────────────────────────────────
    subgraph CoreEnginesAI["3. Core Engines & AI Integration"]
        direction LR

        RULES_ENGINE["Deterministic Rules Engine<br/>Age, RA 9994, RA 11861, RA 10754, RA 11261"]
        INTENT_RAG["Intent-Aware Smart RAG<br/>Topic vs. Intent classifier (analyzeQuestion)"]
        DOC_AGENT["DocAgent AI Sentinel<br/>OCR parsing, expiration watchdog, gap-filling"]
        AUTO_APPLY_ENG["Auto-Apply Consent Engine<br/>95%+ threshold, confirm-each / autonomous"]
        SECURE_PROXY["Secure Gemini API Proxy<br/>/api/alalay/chat, sliding-window rate limiter"]
        DUAL_KEY["Dual-Key Failover Router<br/>Primary and reserve API keys"]
        GEMINI_ENGINE["Google Gemini AI Flash Engine<br/>Grounded reasoning and step generation"]

        RULES_ENGINE --> INTENT_RAG
        DOC_AGENT --> INTENT_RAG
        INTENT_RAG --> SECURE_PROXY --> DUAL_KEY --> GEMINI_ENGINE
    end

    %% ─────────────────────────────────────────────
    %% 4. CLIENT WORKFLOWS & INTERFACES
    %% ─────────────────────────────────────────────
    subgraph ClientWorkflows["4. Client Workflows & Interfaces"]
        direction LR

        CITIZEN_DASH["Citizen Dashboard<br/>Personalized recommendations, Auto-Apply queue"]
        BENEFIT_TRACKER["Active Benefit Tracker Page<br/>Enrolled statutory benefits, claims, active status"]
        EXPLORE_VIEW["Explore & Categories<br/>Search, agency filters, citizen charter drawer"]
        DOC_VAULT["DocAgent Document Vault<br/>OCR upload, audit health, renewal modal"]
        INTAKE_AGENT["Conversational Intake Agent<br/>Step-by-step form completion and verification"]
        AI_WORKSPACE["Ask ALALAY Full-Page Workspace<br/>Bilingual chat, grounded procedures, exports"]
        DETAIL_MODAL["3:1 Dual-Card Modal<br/>Opportunity details and live side-AI chat"]
        ADMIN_PORTAL["Admin Triage & Operations<br/>Scraper pipeline monitor, review queue, audit logs"]

        CITIZEN_DASH --> BENEFIT_TRACKER
        CITIZEN_DASH --> EXPLORE_VIEW
        CITIZEN_DASH --> INTAKE_AGENT
        EXPLORE_VIEW --> DETAIL_MODAL
        DOC_VAULT --> BENEFIT_TRACKER
        DETAIL_MODAL --> AI_WORKSPACE
    end

    %% ─────────────────────────────────────────────
    %% CLEAN CROSS-LAYER DATA FLOW
    %% ─────────────────────────────────────────────
    ADMIN_MGMT -->|Demographic & Charter Updates| SUPABASE_DB
    TIER_A -->|Authoritative Charters| SUPABASE_DB
    ALLOWLIST_GUARD -->|Verified Ingestions| SUPABASE_DB

    GLOBAL_STATE -->|Citizen Profile & Docs| RULES_ENGINE
    GLOBAL_STATE -->|Uploaded Credentials| DOC_AGENT
    RULES_ENGINE -->|Eligibility & Entitlement Status| BENEFIT_TRACKER
    RULES_ENGINE -->|Ranked Match Scores| CITIZEN_DASH
    RULES_ENGINE -->|Auto-Apply Qualification| AUTO_APPLY_ENG

    DOC_AGENT -->|Vault Health & Readiness| DOC_VAULT
    DOC_AGENT -->|Document Verification Flags| BENEFIT_TRACKER

    INTENT_RAG -->|Grounded Charter Context| SECURE_PROXY
    GEMINI_ENGINE -->|Structured Step-by-Step Advice| AI_WORKSPACE
    GEMINI_ENGINE -->|Contextual Charter Guidance| DETAIL_MODAL
    GEMINI_ENGINE -->|Form Field Assistance| INTAKE_AGENT

    ADMIN_PORTAL -->|Pipeline Control & Review| SUPABASE_DB

    %% ─────────────────────────────────────────────
    %% VISUAL STYLES
    %% ─────────────────────────────────────────────
    classDef source fill:#eef2ff,stroke:#818cf8,stroke-width:1.5px,color:#1e1b4b
    classDef storage fill:#f0fdfa,stroke:#2dd4bf,stroke-width:1.5px,color:#134e4a
    classDef engine fill:#f5f3ff,stroke:#a78bfa,stroke-width:1.5px,color:#3b0764
    classDef workflow fill:#fff7ed,stroke:#fb923c,stroke-width:1.5px,color:#7c2d12

    class ADMIN_MGMT,TIER_A,TIER_B,SCRAPER_PIPE,ALLOWLIST_GUARD source
    class SUPABASE_DB,GLOBAL_STATE,LOCAL_STORAGE,I18N_ENGINE storage
    class RULES_ENGINE,INTENT_RAG,DOC_AGENT,AUTO_APPLY_ENG,SECURE_PROXY,DUAL_KEY,GEMINI_ENGINE engine
    class CITIZEN_DASH,BENEFIT_TRACKER,EXPLORE_VIEW,DOC_VAULT,INTAKE_AGENT,AI_WORKSPACE,DETAIL_MODAL,ADMIN_PORTAL workflow

    linkStyle default stroke:#64748b,stroke-width:1.3px
```

---

## 2. Layer-by-Layer Architecture Details

### 2.1 Layer 1: Data Sourcing & Ingestion
- **Admin Operations Hub (`AdminDashboard.jsx`)**: Central hub for registering citizen profiles with **Date of Birth (`birth_date`)**, **Citizenship**, PWD, Solo Parent, and employment status. Also manages the official Citizen's Charter knowledge base and scraping schedules.
- **Tier A Statutory Sources (`Citizen's Charters, DOH, PhilHealth, OSCA, SSS, DSWD, CHED/UniFAST, DOLE, TESDA`)**: Authoritative statutory ground truths that define exact requirements, benefit caps, and application desk locations.
- **Tier B Public Web & Live Scrapers (`webScraper.js`, `facebookScraper.js`)**: Real-time government agency announcements scraped with Cheerio parsing, metadata extraction, and SHA-256 deduplication hashing.
- **Official Agency Directory & Allowlist Guard**: Strictly validates that all crawled content originates from official `.gov.ph` domains and verified agency portals, passing through a dedicated Vite proxy to overcome browser CORS limitations.

---

### 2.2 Layer 2: Persistence, Localization & Client State
- **Supabase Cloud PostgreSQL DB**: Stores structured entities (`users`, `opportunities`, `user_documents`, `chat_archives`, `scraping_logs`) secured with Row-Level Security (RLS) policies.
- **User-Isolated Local Cache**: Implements partitioned browser storage keys (`alalay_chat_archives_${userEmail}`) ensuring instant retrieval and complete multi-user privacy isolation.
- **Global Application Context (`AppContext.jsx`)**: Centralized reactive state managing citizen authentication, active tab routing, Document Locker, live opportunity ranking, and active consultation sessions.
- **Bilingual i18n Localization Engine (`translations.js`)**: Real-time dynamic language switcher supporting both **English** and **Filipino (Tagalog)** across all navigation, dashboard, document vault, profile, and UI elements.

---

### 2.3 Layer 3: Core Engines & AI Integration
- **Multi-Factor Deterministic Rules Engine (`rulesEngine.js`)**: Evaluates exact Boolean and mathematical eligibility rules for Senior Citizens (RA 9994 / RA 10645), Solo Parents (RA 11861), PWDs (RA 10754), First-Time Jobseekers (RA 11261), salary loan contributions, and indigent safety nets (**DOH MAP / DSWD AICS**). **AI never calculates financial amounts or eligibility decisions.**
- **Intent-Aware Smart RAG Retriever (`geminiService.js`)**: Deconstructs citizen inquiries by separating the **Subject** (program/benefit/agency) from the **Intent** (available options, requirements, eligibility, application steps, fees, processing time, validity duration). Eliminates keyword collision errors.
- **DocAgent AI Document Sentinel (`docAgentService.js`)**: Autonomous OCR parser, expiration watchdog, and compliance health auditor. Proactively detects expiring IDs, clearances, and medical abstracts, offering 1-click renewal workflows.
- **Auto-Apply Consent & Queue Engine**: Evaluates citizen readiness against a strict 95%+ "Likely Eligible" bar. Operates in two user-authorized consent modes:
  - *Confirm Each Application* (Citizen reviews prepared forms and taps Submit).
  - *Full Automation* (System submits verified statutory claims automatically and notifies the user).
- **Secure Gemini API Proxy & Rate Limiter**: Encapsulates API tokens within a secure backend endpoint (`/api/alalay/chat`) with client direct fallback. Features a sliding-window rate limiter (20 RPM) and inter-request throttle delay (800ms).
- **Dual-Key Automatic Failover Router**: Automatically switches execution from Primary Key (`VITE_GEMINI_API`) to Reserve Key (`VITE_GEMINI_API_RESERVE`) upon encountering 401, 403, 429, or `RESOURCE_EXHAUSTED` responses.
- **Google Gemini Generative AI Service**: Produces structured, empathetic procedural guides formatted with numbered steps, requirement checklists, and `.gov.ph` citation badges.

---

### 2.4 Layer 4: Client Workflows & Interactive Interfaces

- **Citizen Home Dashboard (`HomeDashboard.jsx`)**: Displays prioritized opportunity feeds, Senior Citizen Mode entitlements, recommended services, and Auto-Apply queue status.
- **Active Benefit Tracker (`BenefitTrackerView.jsx` / Benefit Tracker Page)**:
  - **Comprehensive Benefit Dashboard**: Dedicated screen displaying all public benefits, statutory entitlements, and welfare programs that the citizen currently holds or has actively unlocked.
  - **Live Status & Expiration Watchdog**: Tracks active coverage status, validity windows, renewal dates, and annual re-certification requirements (e.g. OSCA social pension disbursement periods, PhilHealth Konsulta validity, PWD ID validity, SSS loan amortization schedules).
  - **Document Vault Linkage**: Cross-references held benefits with supporting vault documents, flagging any missing prerequisites required to maintain active benefit status.
  - **Entitlement Value Summary**: Aggregates statutory discount privileges (20% discount + 12% VAT exemption, free tuition under RA 10931, PhilHealth Zero-Balance Billing).
- **Explore & Categorized Services (`ExploreCategories.jsx`)**: Searchable index of verified Philippine public services with agency filters (PhilHealth, SSS, CHED, DOH, DSWD, OSCA) and Citizen's Charter drawer.
- **DocAgent Document Vault (`DocumentsView.jsx` & `DocAgentRenewalModal.jsx`)**: AES-256 encrypted digital locker with autonomous OCR ingestion, compliance score meter, and step-by-step renewal modal.
- **Conversational Application Intake Agent (`ApplicationIntakeAgent.jsx`)**: Interactive AI-assisted application intake assistant guiding citizens through form field completion, document validation, and submission preparation.
- **Dedicated Full-Page AI Workspace (`AskAlalayPageView.jsx`)**: Full-screen workspace with fixed card bounds, pinned header, independently scrolling middle conversation stream, and pinned bottom input island.
- **3 : 1 Dual-Card Service Detail Modal (`OpportunityDetailModal.jsx`)**: Responsive dual-card interface with smooth slide animation, sticky headers/action footers, and live side AI chat.
- **User-Isolated Chat Archives (`ChatArchivesView.jsx`)**: Displays exclusively the signed-in citizen's previous AI consultations with 1-click resumption.
- **Admin Triage & Operations Hub (`AdminDashboard.jsx`)**: Features a fixed, non-scrolling sticky sidebar (`h-screen sticky top-0`) for navigation, user management, live scraping monitors, and AI review queues.

---

## 3. Data Flow & Execution Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen User
    participant App as Client (AppContext & Views)
    participant Rules as Deterministic Rules Engine
    participant DocAgent as DocAgent Sentinel & Vault
    participant Tracker as Active Benefit Tracker
    participant RAG as Intent-Aware RAG Engine
    participant AI as Gemini AI Service
    participant DB as Supabase PostgreSQL

    %% Step 1: Authentication & Vault Initialization
    Citizen->>App: Sign in / Open App
    App->>DB: Fetch Citizen Profile & Uploaded Documents
    DB-->>App: Return user, user_documents, active_benefits

    %% Step 2: Deterministic Evaluation & Benefit Tracking
    App->>Rules: Evaluate Profile (Age, PWD, Solo Parent, Income)
    Rules-->>App: Return Match Scores (0-100%) & Statutory Entitlements
    App->>DocAgent: Audit Document Vault Health & Expirations
    DocAgent-->>App: Return Compliance Score & Expiration Flags
    App->>Tracker: Populate Active Benefits, Renewal Watchdog & Value Summary

    %% Step 3: Citizen Inquiry & Intent-Aware AI Grounding
    Citizen->>App: Submit Question ("How to renew my barangay clearance?")
    App->>RAG: Analyze Question (Subject vs. Intent)
    RAG->>DB: Retrieve Authoritative Charters & Scraped Directory
    DB-->>RAG: Return Candidate Records & Official Portals
    RAG->>AI: Dispatch Grounded Prompt with Scope Guardrails
    AI-->>App: Return Numbered Step-by-Step Guide with Official Citations
    App-->>Citizen: Render Formatted AI Guidance Cards
```

---

## 4. Architectural Principles & Guarantees

1. **Deterministic Primacy**: All eligibility evaluations, match percentages, and benefit amounts are computed deterministically. AI never decides eligibility.
2. **Intent-Separated RAG**: Retrieval is filtered by both subject and query intent to prevent keyword collisions.
3. **Continuous Benefit Tracking**: The Active Benefit Tracker maintains real-time visibility into citizen entitlements, preventing lapse of coverage.
4. **Proactive Document Sentinel**: DocAgent monitors expirations and auto-verifies vault documents against agency requirements.
5. **Strict Scope Guardrails**: Gemini AI is strictly bounded to Philippine government services and citizen welfare, rejecting off-topic queries.
6. **Zero Disruption Resilience**: Dual-key failover, sliding-window rate limiting, and local grounded reasoning fallbacks guarantee 99.9% uptime.
