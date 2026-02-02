-- =====================================================
-- MELHORIAS GEO DISTRIBUTION - ROC Passaporte
-- Execute no Supabase SQL Editor
-- =====================================================

-- Funcao RPC para stats geograficos com usuarios unicos
CREATE OR REPLACE FUNCTION get_geo_stats(
  p_days INTEGER DEFAULT 30,
  p_event_types TEXT[] DEFAULT ARRAY['login','register']
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  v_since TIMESTAMPTZ;
BEGIN
  v_since := NOW() - (p_days || ' days')::INTERVAL;

  SELECT json_build_object(
    -- Totais gerais
    'totals', (
      SELECT json_build_object(
        'unique_users', COUNT(DISTINCT e.profile_id),
        'total_events', COUNT(*),
        'new_users', (
          SELECT COUNT(DISTINCT sub.profile_id)
          FROM user_geo_events sub
          WHERE sub.created_at >= v_since
            AND sub.event_type = ANY(p_event_types)
            AND sub.city IS NOT NULL
            AND NOT EXISTS (
              SELECT 1 FROM user_geo_events older
              WHERE older.profile_id = sub.profile_id
                AND older.created_at < v_since
                AND older.city IS NOT NULL
            )
        ),
        'returning_users', (
          SELECT COUNT(DISTINCT sub.profile_id)
          FROM user_geo_events sub
          WHERE sub.created_at >= v_since
            AND sub.event_type = ANY(p_event_types)
            AND sub.city IS NOT NULL
            AND EXISTS (
              SELECT 1 FROM user_geo_events older
              WHERE older.profile_id = sub.profile_id
                AND older.created_at < v_since
                AND older.city IS NOT NULL
            )
        )
      )
      FROM user_geo_events e
      WHERE e.created_at >= v_since
        AND e.event_type = ANY(p_event_types)
        AND e.city IS NOT NULL
    ),
    -- Cidades de Rondonia
    'cities', (
      SELECT COALESCE(json_agg(c ORDER BY c.unique_users DESC), '[]'::json)
      FROM (
        SELECT
          e.city,
          COUNT(DISTINCT e.profile_id) AS unique_users,
          COUNT(*) AS total_events
        FROM user_geo_events e
        WHERE e.created_at >= v_since
          AND e.event_type = ANY(p_event_types)
          AND e.state = 'RO'
          AND e.city IS NOT NULL
        GROUP BY e.city
      ) c
    ),
    -- Outros estados (fora de RO)
    'other_states', (
      SELECT COALESCE(json_agg(s ORDER BY s.unique_users DESC), '[]'::json)
      FROM (
        SELECT
          e.state,
          e.state_name,
          COUNT(DISTINCT e.profile_id) AS unique_users,
          COUNT(*) AS total_events
        FROM user_geo_events e
        WHERE e.created_at >= v_since
          AND e.event_type = ANY(p_event_types)
          AND e.state IS NOT NULL
          AND e.state != 'RO'
          AND e.city IS NOT NULL
        GROUP BY e.state, e.state_name
      ) s
    ),
    -- Todos os estados (para mapa Brasil)
    'all_states', (
      SELECT COALESCE(json_agg(s ORDER BY s.unique_users DESC), '[]'::json)
      FROM (
        SELECT
          e.state,
          e.state_name,
          COUNT(DISTINCT e.profile_id) AS unique_users,
          COUNT(*) AS total_events
        FROM user_geo_events e
        WHERE e.created_at >= v_since
          AND e.event_type = ANY(p_event_types)
          AND e.state IS NOT NULL
          AND e.city IS NOT NULL
        GROUP BY e.state, e.state_name
      ) s
    ),
    -- Tendencia semanal (ultimas semanas dentro do periodo)
    'weekly_trend', (
      SELECT COALESCE(json_agg(w ORDER BY w.week), '[]'::json)
      FROM (
        SELECT
          DATE_TRUNC('week', e.created_at)::date AS week,
          COUNT(DISTINCT e.profile_id) AS unique_users,
          COUNT(*) AS total_events,
          COUNT(DISTINCT e.profile_id) FILTER (
            WHERE NOT EXISTS (
              SELECT 1 FROM user_geo_events older
              WHERE older.profile_id = e.profile_id
                AND older.created_at < DATE_TRUNC('week', e.created_at)
                AND older.city IS NOT NULL
            )
          ) AS new_users
        FROM user_geo_events e
        WHERE e.created_at >= v_since
          AND e.event_type = ANY(p_event_types)
          AND e.city IS NOT NULL
        GROUP BY DATE_TRUNC('week', e.created_at)
        ORDER BY week
      ) w
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar
SELECT proname FROM pg_proc WHERE proname = 'get_geo_stats';
