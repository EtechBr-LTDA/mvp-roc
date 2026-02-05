-- =====================================================
-- VOUCHERS RLS PERFORMANCE (performance2.json)
-- 1) Auth em subselect na policy vouchers_select_by_code_validation
-- 2) Consolidar múltiplas políticas permissivas SELECT (3 -> 1)
-- 3) Consolidar múltiplas políticas permissivas UPDATE (2 -> 1)
-- Execute no Supabase SQL Editor (PostgreSQL 15+)
-- =====================================================

-- =====================================================
-- 1. AUTH EM SUBSELECT – vouchers_select_by_code_validation
-- =====================================================

DO $$
DECLARE
  pol_cmd text;
  pol_roles_arr name[];
  pol_roles_str text;
  pol_qual text;
  pol_with_check text;
  new_qual text;
  new_with_check text;
  qual_sql text;
  wc_sql text;
BEGIN
  SELECT cmd, roles, qual, with_check INTO pol_cmd, pol_roles_arr, pol_qual, pol_with_check
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'vouchers' AND policyname = 'vouchers_select_by_code_validation';

  IF pol_cmd IS NULL THEN
    RETURN;
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

  EXECUTE 'DROP POLICY IF EXISTS vouchers_select_by_code_validation ON public.vouchers';

  qual_sql := '';
  wc_sql := '';
  IF new_qual IS NOT NULL AND new_qual <> '' THEN
    qual_sql := ' USING (' || new_qual || ')';
  END IF;
  IF new_with_check IS NOT NULL AND new_with_check <> '' AND pol_cmd IN ('INSERT', 'UPDATE', 'ALL') THEN
    wc_sql := ' WITH CHECK (' || new_with_check || ')';
  END IF;

  EXECUTE format(
    'CREATE POLICY vouchers_select_by_code_validation ON public.vouchers FOR %s TO %s %s %s',
    pol_cmd,
    pol_roles_str,
    qual_sql,
    wc_sql
  );
END $$;

-- =====================================================
-- 2. CONSOLIDAR SELECT – 3 políticas -> 1
-- =====================================================

DO $$
DECLARE
  r record;
  quals text[] := '{}';
  combined_qual text;
  pol_qual text;
  new_qual text;
BEGIN
  FOR r IN
    SELECT policyname, qual
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'vouchers' AND cmd = 'SELECT'
      AND policyname IN (
        'vouchers_select_own',
        'vouchers_select_by_code_validation',
        'Users can view their own vouchers'
      )
  LOOP
    pol_qual := r.qual;
    IF pol_qual IS NOT NULL AND pol_qual <> '' THEN
      new_qual := regexp_replace(pol_qual, '\mauth\.uid\(\)', '(select auth.uid())', 'g');
      new_qual := regexp_replace(new_qual, '\mauth\.jwt\s*\(\)', '(select auth.jwt())', 'g');
      quals := array_append(quals, '(' || new_qual || ')');
    END IF;
  END LOOP;

  IF array_length(quals, 1) IS NULL OR array_length(quals, 1) < 2 THEN
    RETURN;
  END IF;

  combined_qual := array_to_string(quals, ' OR ');

  DROP POLICY IF EXISTS vouchers_select_own ON public.vouchers;
  DROP POLICY IF EXISTS vouchers_select_by_code_validation ON public.vouchers;
  EXECUTE 'DROP POLICY IF EXISTS "Users can view their own vouchers" ON public.vouchers';

  EXECUTE format(
    'CREATE POLICY vouchers_select ON public.vouchers FOR SELECT TO PUBLIC USING (%s)',
    combined_qual
  );
END $$;

-- =====================================================
-- 3. CONSOLIDAR UPDATE – 2 políticas -> 1
-- =====================================================

DO $$
DECLARE
  r record;
  quals text[] := '{}';
  with_checks text[] := '{}';
  combined_qual text;
  combined_wc text;
  pol_qual text;
  pol_wc text;
  new_qual text;
  new_wc text;
BEGIN
  FOR r IN
    SELECT policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'vouchers' AND cmd = 'UPDATE'
      AND policyname IN ('vouchers_update_own', 'vouchers_update_validation')
  LOOP
    pol_qual := r.qual;
    pol_wc := r.with_check;
    IF pol_qual IS NOT NULL AND pol_qual <> '' THEN
      new_qual := regexp_replace(pol_qual, '\mauth\.uid\(\)', '(select auth.uid())', 'g');
      new_qual := regexp_replace(new_qual, '\mauth\.jwt\s*\(\)', '(select auth.jwt())', 'g');
      quals := array_append(quals, '(' || new_qual || ')');
    END IF;
    IF pol_wc IS NOT NULL AND pol_wc <> '' THEN
      new_wc := regexp_replace(pol_wc, '\mauth\.uid\(\)', '(select auth.uid())', 'g');
      new_wc := regexp_replace(new_wc, '\mauth\.jwt\s*\(\)', '(select auth.jwt())', 'g');
      with_checks := array_append(with_checks, '(' || new_wc || ')');
    ELSE
      with_checks := array_append(with_checks, 'true');
    END IF;
  END LOOP;

  IF array_length(quals, 1) IS NULL OR array_length(quals, 1) < 2 THEN
    RETURN;
  END IF;

  combined_qual := array_to_string(quals, ' OR ');
  combined_wc := array_to_string(with_checks, ' OR ');

  DROP POLICY IF EXISTS vouchers_update_own ON public.vouchers;
  DROP POLICY IF EXISTS vouchers_update_validation ON public.vouchers;

  EXECUTE format(
    'CREATE POLICY vouchers_update ON public.vouchers FOR UPDATE TO PUBLIC USING (%s) WITH CHECK (%s)',
    combined_qual,
    combined_wc
  );
END $$;

-- =====================================================
-- 4. AUTH EM SUBSELECT – policy vouchers_select
-- (auth.uid(), auth.jwt(), current_setting() em subselect)
-- =====================================================

DO $$
DECLARE
  pol_qual text;
  new_qual text;
BEGIN
  SELECT qual INTO pol_qual
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'vouchers' AND policyname = 'vouchers_select';

  IF pol_qual IS NULL OR pol_qual = '' THEN
    RETURN;
  END IF;

  new_qual := pol_qual;
  -- Só substitui quando ainda não está em (select ...) para evitar double-wrap
  new_qual := regexp_replace(new_qual, '(?<!\(select )auth\.uid\s*\(\s*\)', '(select auth.uid())', 'g');
  new_qual := regexp_replace(new_qual, '(?<!\(select )auth\.jwt\s*\(\s*\)', '(select auth.jwt())', 'g');
  new_qual := regexp_replace(new_qual, '(?<!\(select )current_setting\s*\(([^)]*)\)', '(select current_setting(\1))', 'g');

  DROP POLICY IF EXISTS vouchers_select ON public.vouchers;

  EXECUTE format(
    'CREATE POLICY vouchers_select ON public.vouchers FOR SELECT TO PUBLIC USING (%s)',
    new_qual
  );
END $$;
