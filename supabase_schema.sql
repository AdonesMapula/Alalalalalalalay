-- ==============================================================================
-- ALALAY SUPABASE RBAC DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Project: https://kejkhhnouwdrcmifgkzb.supabase.co
-- Run this script in the Supabase SQL Editor:
-- Dashboard > SQL Editor > New query > Run
-- ==============================================================================

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'content_moderator', 'analyst', 'agency_verifier', 'citizen');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Profiles Table (RBAC User Accounts)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || COALESCE(middle_name || ' ', '') || last_name) STORED,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'citizen',
    phone TEXT,
    address TEXT,
    birth_date DATE DEFAULT '1992-04-18',
    citizenship TEXT DEFAULT 'Filipino',
    civil_status TEXT DEFAULT 'Single',
    is_senior_citizen BOOLEAN DEFAULT FALSE,
    is_pwd BOOLEAN DEFAULT FALSE,
    is_solo_parent BOOLEAN DEFAULT FALSE,
    employment_status TEXT DEFAULT 'Employed',
    monthly_income TEXT DEFAULT '₱25,000 - ₱35,000',
    otp_code VARCHAR(10) DEFAULT '891024',
    status TEXT DEFAULT 'Active',
    avatar_initials VARCHAR(4),
    egov_verified BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure demographic and onboarding columns exist on existing tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS citizenship TEXT DEFAULT 'Filipino';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS civil_status TEXT DEFAULT 'Single';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_senior_citizen BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_pwd BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_solo_parent BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employment_status TEXT DEFAULT 'Employed';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_income TEXT DEFAULT '₱25,000 - ₱35,000';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS egov_verified BOOLEAN DEFAULT FALSE;

-- 3. Create Documents Table (ID Cards & Paper-based files)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    file_url TEXT,
    file_size TEXT DEFAULT '1.2 MB',
    file_type TEXT DEFAULT 'PDF',
    status TEXT DEFAULT 'Valid',
    issuer TEXT,
    document_number TEXT,
    issue_date TEXT,
    expiration_date TEXT,
    verified_badge TEXT DEFAULT 'Verified ✓',
    is_egov_retrieved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Knowledge Sources Table (Government Scraper Targets)
CREATE TABLE IF NOT EXISTS public.knowledge_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_name TEXT NOT NULL,
    agency_type TEXT DEFAULT 'Executive Department',
    official_url TEXT NOT NULL,
    category TEXT NOT NULL,
    scraping_frequency TEXT DEFAULT 'Daily',
    status TEXT DEFAULT 'Active',
    health_score NUMERIC DEFAULT 99.4,
    documents_indexed INT DEFAULT 0,
    allowed_paths JSONB DEFAULT '["/benefits/*", "/circulars/*"]'::jsonb,
    priority TEXT DEFAULT 'High',
    notes TEXT,
    last_scraped_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Opportunities Table (Discovered & Approved Benefits)
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    agency TEXT NOT NULL,
    category TEXT NOT NULL,
    category_name TEXT NOT NULL,
    category_color TEXT DEFAULT '#093a96',
    short_desc TEXT NOT NULL,
    full_desc TEXT,
    match_score INT DEFAULT 85,
    match_status TEXT DEFAULT 'Likely Eligible',
    confidence TEXT DEFAULT '96% Confident',
    deadline TEXT DEFAULT 'Open Year-Round',
    is_approved BOOLEAN DEFAULT TRUE,
    benefits JSONB DEFAULT '[]'::jsonb,
    why_you_qualify JSONB DEFAULT '[]'::jsonb,
    requirements JSONB DEFAULT '[]'::jsonb,
    missing_items JSONB DEFAULT '[]'::jsonb,
    official_source JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    target TEXT,
    status TEXT DEFAULT 'Success',
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Chat Archives Table (Real AI Consultations & History)
CREATE TABLE IF NOT EXISTS public.chat_archives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_email TEXT,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'General Public Services',
    category_color TEXT DEFAULT '#093a96',
    preview TEXT,
    message_count INT DEFAULT 0,
    source_url TEXT,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & RBAC POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_archives ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies:
-- Allow public/anon read and insert for the prototype application
DROP POLICY IF EXISTS "Allow select on profiles" ON public.profiles;
CREATE POLICY "Allow select on profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert on profiles" ON public.profiles;
CREATE POLICY "Allow insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update on profiles" ON public.profiles;
CREATE POLICY "Allow update on profiles" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete on profiles" ON public.profiles;
CREATE POLICY "Allow delete on profiles" ON public.profiles FOR DELETE USING (true);

-- 2. Documents Policies:
DROP POLICY IF EXISTS "Allow all on documents" ON public.documents;
CREATE POLICY "Allow all on documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);

-- 3. Knowledge Sources Policies:
DROP POLICY IF EXISTS "Allow all on knowledge_sources" ON public.knowledge_sources;
CREATE POLICY "Allow all on knowledge_sources" ON public.knowledge_sources FOR ALL USING (true) WITH CHECK (true);

-- 4. Opportunities Policies:
DROP POLICY IF EXISTS "Allow all on opportunities" ON public.opportunities;
CREATE POLICY "Allow all on opportunities" ON public.opportunities FOR ALL USING (true) WITH CHECK (true);

-- 5. Audit Logs Policies:
DROP POLICY IF EXISTS "Allow all on audit_logs" ON public.audit_logs;
CREATE POLICY "Allow all on audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- 6. Chat Archives Policies:
DROP POLICY IF EXISTS "Allow all on chat_archives" ON public.chat_archives;
CREATE POLICY "Allow all on chat_archives" ON public.chat_archives FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Seed Initial Super Admin & Users
INSERT INTO public.profiles (first_name, middle_name, last_name, email, role, phone, address, otp_code, status, avatar_initials, egov_verified)
VALUES
    ('Super', 'Admin', 'Officer', 'admin@alalay.gov.ph', 'super_admin', '+63 917 000 0000', 'Malacañang Complex, San Miguel, Manila', '891024', 'Active', 'SA', true),
    ('Maria', 'Santos', 'Aquino', 'maria.aquino@gov.ph', 'super_admin', '+63 917 111 2222', 'Quezon City, Metro Manila', '891024', 'Active', 'MA', true),
    ('Jose', 'Protacio', 'Rizal', 'jrizal@gov.ph', 'content_moderator', '+63 918 333 4444', 'Calamba, Laguna', '449102', 'Invited', 'JR', true),
    ('Clara', 'Maria', 'Bonifacio', 'cbonifacio@gov.ph', 'analyst', '+63 919 555 6666', 'Tondo, Manila', '610294', 'Active', 'CB', true)
ON CONFLICT (email) DO NOTHING;

-- Seed Knowledge Sources
INSERT INTO public.knowledge_sources (agency_name, official_url, category, status, health_score, documents_indexed)
VALUES
    ('Department of Health', 'https://doh.gov.ph', 'Health', 'Active', 99.4, 310),
    ('Bureau of Internal Revenue', 'https://bir.gov.ph', 'Finance', 'Active', 98.2, 540),
    ('Department of Education', 'https://deped.gov.ph', 'Education', 'Sync Error', 92.1, 190),
    ('Department of Social Welfare and Development', 'https://dswd.gov.ph', 'Social', 'Inactive', 97.5, 410)
ON CONFLICT DO NOTHING;
