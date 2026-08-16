# ALALAY System Architecture & Engineering Blueprint

The **ALALAY (Alalalalalalalay)** platform is an intelligent Philippine Citizen Assistance, Statutory Benefits Discovery, and Government Service Navigation system. It connects verified Citizen's Charters with citizen demographic profiles through a multi-factor deterministic matching engine, automated scrapers, a secure Document Locker vault, and grounded Gemini Generative AI.

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
        TIER_A["Tier A Statutory Charters<br/>Citizen's Charters, PhilHealth, OSCA, SSS, DSWD"]
        TIER_B["Tier B Public Web & Social<br/>Allowlisted agency portals and Facebook feeds"]
        SCRAPER_PIPE["Scraper Pipeline<br/>facebookScraper.js, Cheerio, SHA-256"]
        ALLOWLIST_GUARD["Allowlist & Domain Guard<br/>Official .gov.ph validation"]

        TIER_B --> SCRAPER_PIPE --> ALLOWLIST_GUARD
    end

    %% ─────────────────────────────────────────────
    %% 2. PERSISTENCE AND CLIENT STATE
    %% ─────────────────────────────────────────────
    subgraph StateStorage["2. Persistence & Client State"]
        direction LR

        SUPABASE_DB[("Supabase PostgreSQL<br/>users, opportunities, documents, archives")]
        GLOBAL_STATE["AppContext Global State<br/>Session, locker vault, dynamic tabs"]
        LOCAL_STORAGE[("User-Isolated Local Cache<br/>alalay_chat_archives_userEmail")]

        SUPABASE_DB <--> GLOBAL_STATE
        GLOBAL_STATE <--> LOCAL_STORAGE
    end

    %% ─────────────────────────────────────────────
    %% 3. CORE ENGINES AND AI INTEGRATION
    %% ─────────────────────────────────────────────
    subgraph CoreEnginesAI["3. Core Engines & AI Integration"]
        direction LR

        RULES_ENGINE["Deterministic Rules Engine<br/>Age, RA 9994, solo parent, PWD"]
        GAP_EVAL["Coverage-Gap & Document Match<br/>Net liability and locker readiness"]
        DICT_STORE["Knowledge & Dictionary Store<br/>dictionaryService.js"]
        CONTEXT_BUILDER["Grounded Context Builder<br/>geminiService.js"]
        RATE_LIMITER["Gemini API Rate Limiter<br/>10 RPM, 1500 ms delay"]
        DUAL_KEY_FAILOVER["Dual-Key Failover<br/>Primary and reserve API keys"]
        GEMINI_ENGINE["Google Gemini AI Service<br/>Gemini Flash models"]

        RULES_ENGINE --> GAP_EVAL
        DICT_STORE --> CONTEXT_BUILDER --> RATE_LIMITER --> DUAL_KEY_FAILOVER --> GEMINI_ENGINE
    end

    %% ─────────────────────────────────────────────
    %% 4. CLIENT WORKFLOWS & INTERFACES
    %% ─────────────────────────────────────────────
    subgraph ClientWorkflows["4. Client Workflows & Interfaces"]
        direction LR

        CITIZEN_APP["Citizen Workspace<br/>Dashboard, categories, document locker"]
        DUAL_CARD_MODAL["Service Detail Modal<br/>Opportunity details and side AI"]
        FULLPAGE_AI["Full-Page AI Workspace<br/>AskAlalayPageView"]
        ISOLATED_ARCHIVES["User-Isolated Chat Archives<br/>Per-user filtering"]
        ADMIN_PORTAL["Admin Triage Portal<br/>Admin dashboard and scraper monitoring"]

        CITIZEN_APP --> DUAL_CARD_MODAL
        DUAL_CARD_MODAL --> FULLPAGE_AI
        FULLPAGE_AI --> ISOLATED_ARCHIVES
        DUAL_CARD_MODAL --> ISOLATED_ARCHIVES
    end

    %% ─────────────────────────────────────────────
    %% CLEAN CROSS-LAYER DATA FLOW
    %% ─────────────────────────────────────────────
    ADMIN_MGMT -->|Demographic Updates| SUPABASE_DB
    TIER_A -->|Authoritative Charters| SUPABASE_DB
    ALLOWLIST_GUARD -->|Verified Ingestions| SUPABASE_DB

    GLOBAL_STATE -->|Profile Data| RULES_ENGINE
    GLOBAL_STATE -->|Search Terms| DICT_STORE

    GAP_EVAL -->|Ranked Matches| CITIZEN_APP
    GAP_EVAL -->|Document Readiness| DUAL_CARD_MODAL

    DUAL_CARD_MODAL -->|Charter Context| CONTEXT_BUILDER
    FULLPAGE_AI -->|Citizen Inquiry| CONTEXT_BUILDER

    GEMINI_ENGINE -->|Grounded Advice| DUAL_CARD_MODAL
    GEMINI_ENGINE -->|Structured Steps| FULLPAGE_AI

    ISOLATED_ARCHIVES <-->|User Session Sync| SUPABASE_DB
    ADMIN_PORTAL -->|Audit & Triage| SUPABASE_DB

    %% ─────────────────────────────────────────────
    %% VISUAL STYLES
    %% ─────────────────────────────────────────────
    classDef source fill:#eef2ff,stroke:#818cf8,stroke-width:1.5px,color:#1e1b4b
    classDef storage fill:#f0fdfa,stroke:#2dd4bf,stroke-width:1.5px,color:#134e4a
    classDef engine fill:#f5f3ff,stroke:#a78bfa,stroke-width:1.5px,color:#3b0764
    classDef workflow fill:#fff7ed,stroke:#fb923c,stroke-width:1.5px,color:#7c2d12

    class ADMIN_MGMT,TIER_A,TIER_B,SCRAPER_PIPE,ALLOWLIST_GUARD source
    class SUPABASE_DB,GLOBAL_STATE,LOCAL_STORAGE storage
    class RULES_ENGINE,GAP_EVAL,DICT_STORE,CONTEXT_BUILDER,RATE_LIMITER,DUAL_KEY_FAILOVER,GEMINI_ENGINE engine
    class CITIZEN_APP,DUAL_CARD_MODAL,FULLPAGE_AI,ISOLATED_ARCHIVES,ADMIN_PORTAL workflow

    linkStyle default stroke:#64748b,stroke-width:1.3px
```

---

## 2. Layer-by-Layer Architecture Details

### 2.1 Layer 1: Data Sourcing & Ingestion
- **Admin Operations Hub (`AdminDashboard.jsx`)**: Registers citizen profiles with **Date of Birth (`birth_date`)**, **Citizenship**, PWD, Solo Parent, and employment status. Also manages the official Citizen's Charter knowledge base.
- **Tier A Statutory Sources (`Citizen's Charters, DOH, PhilHealth, OSCA, SSS, DSWD, CHED/UniFAST`)**: Authoritative statutory ground truths that define exact requirements, benefit caps, and application desk locations.
- **Tier B Public Web & Social (`Agency Portals & Facebook Feeds`)**: Real-time government agency announcements scraped via [`facebookScraper.js`](./src/services/facebookScraper.js) with Cheerio parsing and SHA-256 content hashing.
- **Allowlist & Domain Guard**: Strictly validates that ingested data originates from official `.gov.ph` domains or verified public agency channels.

---

### 2.2 Layer 2: Persistence & Client State
- **Supabase Cloud PostgreSQL DB**: Stores structured tables (`users`, `opportunities`, `user_documents`, `chat_archives`, `scraping_logs`) secured by Row-Level Security (RLS).
- **User-Isolated Local Cache**: Implements partitioned browser storage keys (`alalay_chat_archives_${userEmail}`) to ensure instant retrieval and multi-user data isolation.
- **Client Global State (`AppContext.jsx`)**: Centralized reactive state managing citizen authentication, dynamic tabs, Document Locker, live opportunity ranking, and active consultation sessions.

---

### 2.3 Layer 3: Core Engines & AI Integration
- **Multi-Factor Deterministic Rules Engine (`rulesEngine.js`)**: Evaluates Boolean and mathematical eligibility rules for Senior Citizens (RA 9994 / RA 10645), Solo Parents (RA 11861), PWDs (RA 10754), salary loan contributions, and indigent safety nets (**DOH MAP / DSWD AICS**). **AI never calculates financial numbers.**
- **Coverage-Gap & Document Match Evaluator**: Dynamically cross-references the citizen's Document Locker with service requirements to generate match scores (0–99%), demographic badges, and exact document readiness percentages (`docReadinessPercent`).
- **Knowledge & Dictionary Store (`dictionaryService.js`)**: Provides localized dictionary lookups and semantic charter search.
- **Grounded Context Builder (`geminiService.js`)**: Synthesizes verified statutory charter excerpts, citizen demographics, and document readiness into grounded AI prompts.
- **Gemini API Rate Limiter (`GeminiApiLimiter`)**: Enforces a strict sliding window of **10 requests per minute** and a **1,500ms delay** between requests to prevent quota depletion.
- **Dual-Key Automatic Failover**: Automatically intercepts HTTP 401, 403, 429, and `RESOURCE_EXHAUSTED` errors to fail over from Primary Key (`VITE_GEMINI_API`) to Reserve Key (`VITE_GEMINI_API_RESERVE`).
- **Google Gemini AI Service**: Generates structured, empathetic procedural guides formatted with numbered steps, requirement checklists, and `.gov.ph` citation badges.

---

### 2.4 Layer 4: Client Workflows & Interactive Interfaces
- **Citizen Workspace (`HomeDashboard.jsx` & `ExploreCategories.jsx`)**: Displays ranked opportunities with demographic match tags, match percentages, and Document Locker readiness badges.
- **Dedicated Full-Page AI Workspace (`AskAlalayPageView.jsx`)**: Full-screen workspace with fixed card bounds, pinned header, independently scrolling middle conversation stream, and pinned bottom input island.
- **3 : 1 Dual-Card Service Detail Modal (`OpportunityDetailModal.jsx`)**: Responsive dual-card interface with smooth slide animation, sticky headers/action footers, and live side AI chat.
- **User-Isolated Chat Archives (`ChatArchivesView.jsx`)**: Displays exclusively the signed-in citizen's previous AI consultations with 1-click resumption.
- **Admin Triage & Operations Hub (`AdminDashboard.jsx`)**: Features a fixed, non-scrolling sticky sidebar (`h-screen sticky top-0`) for navigation, user management, and live scraping monitors.
