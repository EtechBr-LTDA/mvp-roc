-- =====================================================
-- REESTRUTURACAO ADMIN - ROC Passaporte
-- Execute no Supabase SQL Editor (em ordem)
-- =====================================================

-- =====================================================
-- PARTE 1: TABELAS RBAC
-- =====================================================

-- 1A. Tabela de cargos
CREATE TABLE IF NOT EXISTS admin_roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seeds de cargos
INSERT INTO admin_roles (name, display_name, description, is_system) VALUES
  ('super_admin', 'Super Administrador', 'Acesso total ao sistema, incluindo controle de admins', TRUE),
  ('admin', 'Administrador', 'Acesso completo exceto controle de admins', TRUE),
  ('editor', 'Editor', 'Pode visualizar e editar usuarios, restaurantes e vouchers', TRUE),
  ('viewer', 'Visualizador', 'Apenas visualizacao de dados', TRUE)
ON CONFLICT (name) DO NOTHING;

-- 1B. Tabela de permissoes (acoes do sistema)
CREATE TABLE IF NOT EXISTS admin_permissions (
  id SERIAL PRIMARY KEY,
  action VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(150) NOT NULL,
  description TEXT,
  module VARCHAR(50) NOT NULL,
  http_method VARCHAR(10),
  endpoint VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seeds de permissoes - todos os endpoints do sistema
INSERT INTO admin_permissions (action, display_name, description, module, http_method, endpoint) VALUES
  -- Dashboard
  ('dashboard.view', 'Ver Dashboard', 'Acesso ao painel principal com metricas', 'dashboard', 'GET', '/admin/dashboard'),
  -- Usuarios
  ('users.list', 'Listar Usuarios', 'Ver lista de usuarios do sistema', 'users', 'GET', '/admin/users'),
  ('users.detail', 'Ver Detalhes Usuario', 'Ver perfil completo de um usuario', 'users', 'GET', '/admin/users/:id'),
  ('users.suspend', 'Suspender Usuario', 'Suspender conta de usuario', 'users', 'POST', '/admin/users/:id/suspend'),
  ('users.activate', 'Ativar Usuario', 'Reativar conta de usuario suspensa', 'users', 'POST', '/admin/users/:id/activate'),
  -- Restaurantes
  ('restaurants.list', 'Listar Restaurantes', 'Ver lista de restaurantes parceiros', 'restaurants', 'GET', '/admin/restaurants'),
  ('restaurants.create', 'Criar Restaurante', 'Adicionar novo restaurante parceiro', 'restaurants', 'POST', '/admin/restaurants'),
  ('restaurants.update', 'Editar Restaurante', 'Alterar dados de restaurante', 'restaurants', 'PUT', '/admin/restaurants/:id'),
  ('restaurants.toggle', 'Ativar/Desativar Restaurante', 'Alterar status ativo do restaurante', 'restaurants', 'PATCH', '/admin/restaurants/:id/toggle'),
  -- Vouchers
  ('vouchers.list', 'Listar Vouchers', 'Ver lista de vouchers gerados', 'vouchers', 'GET', '/admin/vouchers'),
  ('vouchers.validate', 'Validar Voucher Manual', 'Validar voucher manualmente pelo admin', 'vouchers', 'POST', '/admin/vouchers/:id/validate'),
  -- Geo Stats
  ('geo.stats', 'Ver Estatisticas Geo', 'Ver distribuicao geografica de acessos', 'geo', 'GET', '/admin/geo-stats'),
  ('geo.events', 'Ver Eventos Geo', 'Ver eventos recentes de geolocalizacao', 'geo', 'GET', '/admin/geo-stats/events'),
  ('geo.track', 'Rastrear IP Geo', 'Registrar evento de geolocalizacao', 'geo', 'POST', '/admin/geo-stats/track'),
  -- Audit
  ('audit.list', 'Ver Logs de Auditoria', 'Ver historico de acoes administrativas', 'audit', 'GET', '/admin/audit-logs'),
  -- Estatisticas
  ('stats.users', 'Ver Estatisticas Usuarios', 'Ver metricas e demograficos de usuarios', 'stats', 'GET', '/admin/stats/users'),
  ('stats.financial', 'Ver Estatisticas Financeiras', 'Ver receita e dados financeiros', 'stats', 'GET', '/admin/stats/financial'),
  -- System Settings
  ('settings.view', 'Ver Configuracoes', 'Ver configuracoes do sistema', 'settings', 'GET', '/admin/system-settings'),
  ('settings.update', 'Alterar Configuracoes', 'Modificar configuracoes do sistema', 'settings', 'PUT', '/admin/system-settings'),
  -- RBAC (Controle de Admin)
  ('rbac.roles.list', 'Listar Cargos', 'Ver cargos do sistema', 'rbac', 'GET', '/admin/rbac/roles'),
  ('rbac.roles.create', 'Criar Cargo', 'Adicionar novo cargo', 'rbac', 'POST', '/admin/rbac/roles'),
  ('rbac.roles.update', 'Editar Cargo', 'Alterar dados de cargo', 'rbac', 'PUT', '/admin/rbac/roles/:id'),
  ('rbac.roles.delete', 'Deletar Cargo', 'Remover cargo nao-sistema', 'rbac', 'DELETE', '/admin/rbac/roles/:id'),
  ('rbac.permissions.list', 'Listar Permissoes', 'Ver todas as permissoes do sistema', 'rbac', 'GET', '/admin/rbac/permissions'),
  ('rbac.roles.permissions', 'Definir Permissoes do Cargo', 'Atribuir permissoes a um cargo', 'rbac', 'PUT', '/admin/rbac/roles/:id/permissions'),
  ('rbac.users.list', 'Listar Admins', 'Ver lista de administradores', 'rbac', 'GET', '/admin/rbac/users'),
  ('rbac.users.create', 'Criar Admin', 'Adicionar novo administrador', 'rbac', 'POST', '/admin/rbac/users'),
  ('rbac.users.update_role', 'Alterar Cargo Admin', 'Mudar cargo de um administrador', 'rbac', 'PUT', '/admin/rbac/users/:id/role'),
  ('rbac.users.delete', 'Remover Admin', 'Revogar acesso administrativo', 'rbac', 'DELETE', '/admin/rbac/users/:id')
ON CONFLICT (action) DO NOTHING;

-- 1C. Tabela de juncao: permissoes por cargo
CREATE TABLE IF NOT EXISTS admin_role_permissions (
  role_id INTEGER NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES admin_permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Atribuir TODAS permissoes ao super_admin
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Atribuir permissoes ao admin (tudo exceto rbac)
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.name = 'admin' AND p.module != 'rbac'
ON CONFLICT DO NOTHING;

-- Atribuir permissoes ao editor (dashboard, users, restaurants, vouchers, geo, stats - sem suspend/activate/validate/settings/audit)
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.name = 'editor' AND p.action IN (
  'dashboard.view',
  'users.list', 'users.detail',
  'restaurants.list', 'restaurants.create', 'restaurants.update', 'restaurants.toggle',
  'vouchers.list',
  'geo.stats', 'geo.events', 'geo.track',
  'stats.users', 'stats.financial'
)
ON CONFLICT DO NOTHING;

-- Atribuir permissoes ao viewer (somente visualizacao)
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.name = 'viewer' AND p.action IN (
  'dashboard.view',
  'users.list', 'users.detail',
  'restaurants.list',
  'vouchers.list',
  'geo.stats', 'geo.events',
  'audit.list',
  'stats.users', 'stats.financial'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PARTE 2: SYSTEM SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  label VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  value_type VARCHAR(20) NOT NULL DEFAULT 'string',
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seeds de configuracoes
INSERT INTO system_settings (key, value, label, description, category, value_type) VALUES
  ('system_name', '"ROC Passaporte"', 'Nome do Sistema', 'Nome exibido no painel e comunicacoes', 'general', 'string'),
  ('support_email', '"suporte@rocpassaporte.com.br"', 'Email de Suporte', 'Email para contato e notificacoes', 'general', 'string'),
  ('maintenance_mode', 'false', 'Modo Manutencao', 'Quando ativado, bloqueia acesso de usuarios ao app', 'general', 'boolean'),
  ('new_registrations_enabled', 'true', 'Novos Cadastros', 'Permitir novos registros de usuarios', 'general', 'boolean'),
  ('pass_price', '99.99', 'Preco do Passe (R$)', 'Valor cobrado pelo passe do ROC Passaporte', 'passes', 'number'),
  ('pass_duration_days', '30', 'Duracao do Passe (dias)', 'Quantidade de dias de validade do passe', 'passes', 'number'),
  ('voucher_generation_enabled', 'true', 'Geracao de Vouchers', 'Permitir que usuarios gerem novos vouchers', 'vouchers', 'boolean'),
  ('max_vouchers_per_restaurant', '1', 'Max Vouchers por Restaurante', 'Limite de vouchers ativos por restaurante por usuario', 'vouchers', 'number')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- PARTE 3: COLUNAS NOVAS EM PROFILES
-- =====================================================

-- FK para admin_roles (nullable: users normais nao tem cargo admin)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES admin_roles(id);

-- Campos para estatisticas demograficas
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Indices
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_birth_date ON profiles(birth_date);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login_at ON profiles(last_login_at);

-- Migrar role_id para admins existentes baseado na coluna role (text)
UPDATE profiles p
SET role_id = r.id
FROM admin_roles r
WHERE p.role = r.name
  AND p.role IN ('admin', 'super_admin')
  AND p.role_id IS NULL;

-- Atualizar CHECK constraint para incluir novos cargos
-- Primeiro remove a antiga
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
-- Recria com os novos valores
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'admin', 'super_admin', 'editor', 'viewer'));

-- =====================================================
-- PARTE 4: FUNCOES RPC (Supabase)
-- =====================================================

-- 4A. Demograficos de usuarios
CREATE OR REPLACE FUNCTION get_user_demographics(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles WHERE role = 'user'),
    'new_users', (
      SELECT COUNT(*) FROM profiles
      WHERE role = 'user'
        AND (p_start_date IS NULL OR created_at >= p_start_date)
        AND (p_end_date IS NULL OR created_at <= p_end_date)
    ),
    'active_users', (
      SELECT COUNT(DISTINCT p2.id) FROM profiles p2
      INNER JOIN passes ps ON ps.profile_id = p2.id AND ps.status = 'active'
      WHERE p2.role = 'user'
    ),
    'suspended_users', (
      SELECT COUNT(*) FROM profiles WHERE role = 'user' AND suspended_at IS NOT NULL
    ),
    'gender_distribution', (
      SELECT COALESCE(json_agg(g), '[]'::json)
      FROM (
        SELECT
          COALESCE(gender, 'nao_informado') AS gender,
          COUNT(*) AS count
        FROM profiles WHERE role = 'user'
        GROUP BY COALESCE(gender, 'nao_informado')
        ORDER BY count DESC
      ) g
    ),
    'age_ranges', (
      SELECT COALESCE(json_agg(a), '[]'::json)
      FROM (
        SELECT
          CASE
            WHEN birth_date IS NULL THEN 'nao_informado'
            WHEN EXTRACT(YEAR FROM AGE(birth_date)) BETWEEN 0 AND 17 THEN '0-17'
            WHEN EXTRACT(YEAR FROM AGE(birth_date)) BETWEEN 18 AND 24 THEN '18-24'
            WHEN EXTRACT(YEAR FROM AGE(birth_date)) BETWEEN 25 AND 34 THEN '25-34'
            WHEN EXTRACT(YEAR FROM AGE(birth_date)) BETWEEN 35 AND 44 THEN '35-44'
            WHEN EXTRACT(YEAR FROM AGE(birth_date)) BETWEEN 45 AND 54 THEN '45-54'
            ELSE '55+'
          END AS range,
          COUNT(*) AS count
        FROM profiles WHERE role = 'user'
        GROUP BY range
        ORDER BY range
      ) a
    ),
    'average_age', (
      SELECT ROUND(AVG(EXTRACT(YEAR FROM AGE(birth_date)))::numeric, 1)
      FROM profiles
      WHERE role = 'user' AND birth_date IS NOT NULL
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4B. Estatisticas financeiras
CREATE OR REPLACE FUNCTION get_financial_stats(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  v_pass_price NUMERIC;
BEGIN
  -- Buscar preco do passe das configuracoes
  SELECT (value)::numeric INTO v_pass_price
  FROM system_settings WHERE key = 'pass_price';
  IF v_pass_price IS NULL THEN v_pass_price := 99.99; END IF;

  SELECT json_build_object(
    'pass_price', v_pass_price,
    'total_passes', (SELECT COUNT(*) FROM passes),
    'active_passes', (SELECT COUNT(*) FROM passes WHERE status = 'active'),
    'expired_passes', (SELECT COUNT(*) FROM passes WHERE status != 'active'),
    'total_revenue', (SELECT COUNT(*) FROM passes) * v_pass_price,
    'active_revenue', (SELECT COUNT(*) FROM passes WHERE status = 'active') * v_pass_price,
    'period_passes', (
      SELECT COUNT(*) FROM passes
      WHERE (p_start_date IS NULL OR created_at >= p_start_date)
        AND (p_end_date IS NULL OR created_at <= p_end_date)
    ),
    'period_revenue', (
      SELECT COUNT(*) FROM passes
      WHERE (p_start_date IS NULL OR created_at >= p_start_date)
        AND (p_end_date IS NULL OR created_at <= p_end_date)
    ) * v_pass_price,
    'monthly_breakdown', (
      SELECT COALESCE(json_agg(m ORDER BY m.month), '[]'::json)
      FROM (
        SELECT
          TO_CHAR(created_at, 'YYYY-MM') AS month,
          COUNT(*) AS passes_count,
          COUNT(*) * v_pass_price AS revenue
        FROM passes
        WHERE (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY month DESC
        LIMIT 12
      ) m
    ),
    'voucher_stats', (
      SELECT json_build_object(
        'total', COUNT(*),
        'available', COUNT(*) FILTER (WHERE status = 'available'),
        'used', COUNT(*) FILTER (WHERE status = 'used'),
        'expired', COUNT(*) FILTER (WHERE status = 'expired')
      ) FROM vouchers
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICACAO
-- =====================================================

-- Verificar tabelas criadas
SELECT tablename FROM pg_tables
WHERE tablename IN ('admin_roles', 'admin_permissions', 'admin_role_permissions', 'system_settings')
ORDER BY tablename;

-- Verificar colunas novas em profiles
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('role_id', 'gender', 'birth_date', 'last_login_at');

-- Verificar seeds
SELECT name, display_name, is_system FROM admin_roles ORDER BY id;
SELECT COUNT(*) AS total_permissions FROM admin_permissions;
SELECT r.name, COUNT(rp.permission_id) AS permissions_count
FROM admin_roles r
LEFT JOIN admin_role_permissions rp ON rp.role_id = r.id
GROUP BY r.name ORDER BY permissions_count DESC;
SELECT key, value, category FROM system_settings ORDER BY category, key;

-- Verificar funcoes RPC
SELECT proname FROM pg_proc WHERE proname IN ('get_user_demographics', 'get_financial_stats');
