-- =====================================================
-- SETUP DO SISTEMA ADMIN - ROC Passaporte
-- Execute no Supabase SQL Editor
-- =====================================================

-- 1. Adicionar role na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- Adicionar CHECK constraint (se nao existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('user', 'admin', 'super_admin'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 2. Adicionar campo de suspensao
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ DEFAULT NULL;

-- 3. Criar tabela de audit logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON admin_audit_logs(created_at DESC);

-- 4. Promover primeiro admin (ALTERE O EMAIL ABAIXO)
-- UPDATE profiles SET role = 'super_admin' WHERE email = 'seu-email@exemplo.com';

-- 5. Verificar
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name IN ('role', 'suspended_at');

SELECT tablename FROM pg_tables WHERE tablename = 'admin_audit_logs';
