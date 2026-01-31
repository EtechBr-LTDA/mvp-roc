-- ============================================
-- Geo Distribution: cache de IP + eventos de login
-- ============================================

-- 1. Cache de IP -> localizacao (evita consultas duplicadas ao IPWHOIS.IO)
CREATE TABLE IF NOT EXISTS ip_geo_cache (
  ip TEXT PRIMARY KEY,
  state TEXT,
  state_name TEXT,
  city TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ip_geo_cache_state ON ip_geo_cache(state);
CREATE INDEX IF NOT EXISTS idx_ip_geo_cache_city ON ip_geo_cache(city);

-- 2. Eventos de login com localizacao
CREATE TABLE IF NOT EXISTS user_geo_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id),
  ip TEXT NOT NULL,
  state TEXT,
  state_name TEXT,
  city TEXT,
  event_type TEXT NOT NULL DEFAULT 'login',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_geo_events_city ON user_geo_events(city);
CREATE INDEX IF NOT EXISTS idx_user_geo_events_created ON user_geo_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_geo_events_profile ON user_geo_events(profile_id);
