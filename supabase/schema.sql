-- ==========================================================
-- SUPAHUB DATABASE SCHEMA V1
-- ==========================================================

-- 1. Table Profils / Tokens
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  supabase_pat_encrypted TEXT,            -- Supabase PAT/OAuth tokens chiffrés AES-256-GCM
  plan TEXT NOT NULL DEFAULT 'FREE',      -- Plan de l'utilisateur : FREE | PRO
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_profiles_plan_check CHECK (plan IN ('FREE', 'PRO'))
);

-- 2. Projets Supabase Suivis
CREATE TABLE IF NOT EXISTS public.monitored_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  supabase_project_ref VARCHAR(255) NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  db_connection_uri_encrypted TEXT,       -- URI Postgres chiffrée
  organization_id VARCHAR(255),
  region VARCHAR(100) DEFAULT 'eu-west-1',
  status VARCHAR(50) CHECK (status IN ('ACTIVE', 'PAUSED', 'FROZEN', 'PROCESSING')) DEFAULT 'ACTIVE',
  keep_alive_enabled BOOLEAN DEFAULT TRUE,
  last_ping_at TIMESTAMPTZ,              -- Dernier ping Keep-Alive
  last_ping_status_code INTEGER,
  last_keep_alive_at TIMESTAMPTZ,        -- Alias lisible du dernier Keep-Alive réussi
  last_backup_at TIMESTAMPTZ,            -- Dernier snapshot/freeze réussi
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_project_ref UNIQUE(user_id, supabase_project_ref)
);

-- 3. Historique des Snapshots (R2)
CREATE TABLE IF NOT EXISTS public.project_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.monitored_projects ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  r2_file_key TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  supabase_project_ref VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ,                -- NULL = stockage illimité (PRO). Date = rétention FREE (60j)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitored_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can manage their own profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = id);

-- Policies for monitored_projects
CREATE POLICY "Users can manage their own monitored projects" ON public.monitored_projects
  FOR ALL USING (auth.uid() = user_id);

-- Policies for project_snapshots
CREATE POLICY "Users can manage their own snapshots" ON public.project_snapshots
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================================
-- MIGRATION V1 → V1.1 (À appliquer si la table existe déjà)
-- Exécuter ces commandes dans l'éditeur SQL Supabase :
-- ==========================================================
-- ALTER TABLE public.user_profiles
--   ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'FREE'
--   CONSTRAINT user_profiles_plan_check CHECK (plan IN ('FREE', 'PRO'));
--
-- ALTER TABLE public.monitored_projects
--   ADD COLUMN IF NOT EXISTS last_keep_alive_at TIMESTAMPTZ,
--   ADD COLUMN IF NOT EXISTS last_backup_at TIMESTAMPTZ;
--
-- ALTER TABLE public.project_snapshots
--   ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
-- ==========================================================
