-- =====================================================
-- FIX SUPABASE LINTER ISSUES (Performance, Errors, Security)
-- Execute no Supabase SQL Editor (PostgreSQL 15+)
-- Ordem: índices → view → funções → RLS auth → RLS cleanup
-- =====================================================

-- =====================================================
-- 1. ÍNDICES DUPLICADOS (Performance)
-- =====================================================

-- passes
DROP INDEX IF EXISTS public.passes_profile_id_idx;
DROP INDEX IF EXISTS public.passes_status_idx;

-- profiles
DROP INDEX IF EXISTS public.profiles_cpf_idx;
DROP INDEX IF EXISTS public.profiles_email_idx;

-- restaurants
DROP INDEX IF EXISTS public.restaurants_active_idx;
DROP INDEX IF EXISTS public.restaurants_city_idx;

-- vouchers (vouchers_code_key e vouchers_code_unique são constraints UNIQUE; remover só a duplicata)
DROP INDEX IF EXISTS public.vouchers_code_idx;
DROP INDEX IF EXISTS public.vouchers_pass_id_idx;
DROP INDEX IF EXISTS public.vouchers_profile_id_idx;
DROP INDEX IF EXISTS public.vouchers_restaurant_id_idx;
DROP INDEX IF EXISTS public.vouchers_status_idx;
ALTER TABLE public.vouchers DROP CONSTRAINT IF EXISTS vouchers_code_unique;

-- =====================================================
-- 2. VIEW SECURITY INVOKER (Erros – SECURITY DEFINER)
-- =====================================================

DO $$
DECLARE
  v_def text;
  v_oid oid;
BEGIN
  SELECT c.oid INTO v_oid
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'vouchers_with_restaurant' AND c.relkind = 'v';

  IF v_oid IS NOT NULL THEN
    v_def := pg_get_viewdef(v_oid, true);
    DROP VIEW IF EXISTS public.vouchers_with_restaurant;
    EXECUTE format(
      'CREATE VIEW public.vouchers_with_restaurant WITH (security_invoker = on) AS %s',
      v_def
    );
  END IF;
END $$;

-- =====================================================
-- 3. FUNÇÕES – search_path FIXO (Security)
-- =====================================================

DO $$
DECLARE
  r record;
  fns text[] := ARRAY[
    'generate_unique_voucher_code', 'cleanup_expired_reset_tokens', 'get_financial_stats',
    'get_user_demographics', 'get_geo_stats', 'handle_updated_at', 'validate_roc_code',
    'generate_roc_code', 'validate_voucher_status', 'can_use_voucher', 'use_voucher',
    'expire_old_vouchers'
  ];
  fn text;
BEGIN
  FOREACH fn IN ARRAY fns
  LOOP
    FOR r IN
      SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) AS args
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = fn
    LOOP
      EXECUTE format(
        'ALTER FUNCTION public.%I(%s) SET search_path = public',
        r.proname,
        r.args
      );
    END LOOP;
  END LOOP;
END $$;

-- =====================================================
-- 4. RLS – AUTH EM SUBSELECT (Performance)
-- =====================================================

DO $$
DECLARE
  r record;
  pol_schema text;
  pol_table text;
  pol_name text;
  pol_cmd text;
  pol_roles_arr name[];
  pol_roles_str text;
  pol_qual text;
  pol_with_check text;
  new_qual text;
  new_with_check text;
  policies_to_fix jsonb := '[
    {"s":"public","t":"profiles","p":"profiles_select_own"},
    {"s":"public","t":"profiles","p":"profiles_insert_own"},
    {"s":"public","t":"profiles","p":"profiles_update_own"},
    {"s":"public","t":"restaurants","p":"restaurants_admin_insert"},
    {"s":"public","t":"restaurants","p":"restaurants_admin_update"},
    {"s":"public","t":"vouchers","p":"vouchers_insert_own"},
    {"s":"public","t":"vouchers","p":"vouchers_select_own"},
    {"s":"public","t":"vouchers","p":"vouchers_update_own"},
    {"s":"public","t":"vouchers","p":"vouchers_select_by_code_validation"},
    {"s":"public","t":"vouchers","p":"Users can view their own vouchers"},
    {"s":"public","t":"passes","p":"passes_select_own"},
    {"s":"public","t":"passes","p":"passes_insert_own"},
    {"s":"public","t":"passes","p":"passes_update_own"}
  ]'::jsonb;
  pol jsonb;
  qual_sql text;
  wc_sql text;
BEGIN
  FOR pol IN SELECT * FROM jsonb_array_elements(policies_to_fix)
  LOOP
    pol_schema := pol->>'s';
    pol_table := pol->>'t';
    pol_name := pol->>'p';

    SELECT cmd, roles, qual, with_check INTO pol_cmd, pol_roles_arr, pol_qual, pol_with_check
    FROM pg_policies
    WHERE schemaname = pol_schema AND tablename = pol_table AND policyname = pol_name;

    IF pol_cmd IS NULL THEN
      CONTINUE;
    END IF;

    pol_roles_str := COALESCE(NULLIF(trim(array_to_string(pol_roles_arr, ', ')), ''), 'PUBLIC');

    new_qual := pol_qual;
    new_with_check := pol_with_check;

    IF new_qual IS NOT NULL AND new_qual <> '' THEN
      new_qual := regexp_replace(new_qual, '\mauth\.uid\(\)', '(select auth.uid())', 'g');
      new_qual := regexp_replace(new_qual, '\mauth\.jwt\s*\(\)', '(select auth.jwt())', 'g');
    END IF;
    IF new_with_check IS NOT NULL AND new_with_check <> '' THEN
      new_with_check := regexp_replace(new_with_check, '\mauth\.uid\(\)', '(select auth.uid())', 'g');
      new_with_check := regexp_replace(new_with_check, '\mauth\.jwt\s*\(\)', '(select auth.jwt())', 'g');
    END IF;

    EXECUTE format(
      'DROP POLICY IF EXISTS %s ON %I.%I',
      quote_ident(pol_name),
      pol_schema,
      pol_table
    );

    qual_sql := '';
    wc_sql := '';
    IF new_qual IS NOT NULL AND new_qual <> '' THEN
      qual_sql := ' USING (' || new_qual || ')';
    END IF;
    IF new_with_check IS NOT NULL AND new_with_check <> '' AND pol_cmd IN ('INSERT', 'UPDATE', 'ALL') THEN
      wc_sql := ' WITH CHECK (' || new_with_check || ')';
    END IF;

    EXECUTE format(
      'CREATE POLICY %s ON %I.%I FOR %s TO %s %s %s',
      quote_ident(pol_name),
      pol_schema,
      pol_table,
      pol_cmd,
      pol_roles_str,
      qual_sql,
      wc_sql
    );
  END LOOP;
END $$;

-- =====================================================
-- 5. RLS CLEANUP – Políticas redundantes / always true
-- =====================================================

DROP POLICY IF EXISTS passes_insert_demo ON public.passes;
DROP POLICY IF EXISTS profiles_insert_demo ON public.profiles;
DROP POLICY IF EXISTS vouchers_insert_demo ON public.vouchers;
DROP POLICY IF EXISTS "Allow update vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Allow voucher updates" ON public.vouchers;
