-- ==========================================================
-- MIGRATION SupaHub V1 -> V1.1
-- A executer UNE SEULE FOIS dans l'editeur SQL Supabase
-- sur une base de donnees deja existante.
-- ==========================================================

-- 1. Ajout de la colonne 'plan' dans user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'FREE';

-- Contrainte de validation sur les valeurs du plan
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_profiles_plan_check'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_plan_check CHECK (plan IN ('FREE', 'PRO'));
  END IF;
END
$$;

-- 2. Ajout des colonnes de timestamps dans monitored_projects
ALTER TABLE public.monitored_projects
  ADD COLUMN IF NOT EXISTS last_keep_alive_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_backup_at TIMESTAMPTZ;

-- 3. Ajout de la colonne expires_at dans project_snapshots
ALTER TABLE public.project_snapshots
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- 4. Mettre a jour les profils existants sans plan (migration de donnees)
UPDATE public.user_profiles
  SET plan = 'FREE'
  WHERE plan IS NULL OR plan = '';

-- Verification
SELECT
  (SELECT COUNT(*) FROM public.user_profiles WHERE plan IS NOT NULL) AS profiles_with_plan,
  (SELECT COUNT(*) FROM public.monitored_projects WHERE last_keep_alive_at IS NULL) AS projects_without_ka_ts,
  'Migration V1.1 appliquee avec succes' AS status;

