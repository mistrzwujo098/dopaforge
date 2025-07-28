-- Migracja dodająca przykładowe dane testowe do pustych tabel
-- UWAGA: Ta migracja powinna być wykonana tylko w środowisku developerskim

-- 1. Dodaj przykładowe nagrody dla użytkowników
INSERT INTO rewards (user_id, type, payload, granted_at)
SELECT 
    user_id,
    'xp' as type,
    jsonb_build_object('amount', 50, 'reason', 'First task completion'),
    NOW() - INTERVAL '7 days'
FROM user_profiles
WHERE total_xp > 0
LIMIT 5
ON CONFLICT DO NOTHING;

-- 2. Dodaj przykładowe odznaki użytkownikom
INSERT INTO user_badges (user_id, badge_code, granted_at)
SELECT 
    up.user_id,
    'starter',
    NOW() - INTERVAL '7 days'
FROM user_profiles up
WHERE up.total_xp > 0
AND NOT EXISTS (
    SELECT 1 FROM user_badges ub 
    WHERE ub.user_id = up.user_id 
    AND ub.badge_code = 'starter'
)
LIMIT 10;

-- 3. Dodaj przykładowe sesje samo-współczucia
INSERT INTO self_compassion_sessions (user_id, trigger_reason, duration_seconds, created_at)
SELECT 
    user_id,
    'Failed to complete daily goals',
    300,
    NOW() - INTERVAL '3 days'
FROM user_profiles
WHERE total_xp > 100
LIMIT 5
ON CONFLICT DO NOTHING;

-- 4. Dodaj przykładowe intencje implementacyjne (tylko dla użytkowników którzy już mają jakieś dane)
INSERT INTO implementation_intentions (user_id, trigger_type, trigger_value, action, active)
SELECT 
    user_id,
    'time',
    '09:00',
    'Rozpocznę pracę od najtrudniejszego zadania',
    true
FROM user_profiles
WHERE total_xp > 50
AND NOT EXISTS (
    SELECT 1 FROM implementation_intentions ii 
    WHERE ii.user_id = user_profiles.user_id
)
LIMIT 3;

-- 5. Dodaj przykładowe kontrakty zobowiązań
INSERT INTO commitment_contracts (user_id, goal, stake_type, stake_details, deadline, status)
SELECT 
    user_id,
    'Ukończ 5 zadań dziennie przez tydzień',
    'social',
    jsonb_build_object('partner', 'friend@example.com', 'message', 'Zobowiązuję się do regularnej pracy'),
    NOW() + INTERVAL '7 days',
    'active'
FROM user_profiles
WHERE total_xp > 200
AND NOT EXISTS (
    SELECT 1 FROM commitment_contracts cc 
    WHERE cc.user_id = user_profiles.user_id
    AND cc.status = 'active'
)
LIMIT 2;

-- 6. Dodaj przykładowe wpisy do historii lootboxów
INSERT INTO lootbox_history (user_id, reward_type, reward_payload, opened_at)
SELECT 
    user_id,
    CASE (RANDOM() * 3)::INT
        WHEN 0 THEN 'xp'
        WHEN 1 THEN 'badge'
        ELSE 'streak_shield'
    END,
    CASE (RANDOM() * 3)::INT
        WHEN 0 THEN jsonb_build_object('amount', 25)
        WHEN 1 THEN jsonb_build_object('name', 'Lucky Star')
        ELSE jsonb_build_object('days', 1)
    END,
    NOW() - (RANDOM() * 30 || ' days')::INTERVAL
FROM user_profiles
WHERE total_xp > 0
LIMIT 10;

-- 7. Dodaj przykładowe przeglądy tygodniowe
INSERT INTO weekly_reviews (user_id, week_start, satisfaction_score, burnout_score, addiction_score, reflections)
SELECT 
    user_id,
    date_trunc('week', NOW() - INTERVAL '1 week'),
    7,
    3,
    2,
    'Dobry tydzień, udało mi się utrzymać regularność. Czuję się zmotywowany do kontynuowania.'
FROM user_profiles
WHERE current_streak > 3
AND NOT EXISTS (
    SELECT 1 FROM weekly_reviews wr 
    WHERE wr.user_id = user_profiles.user_id
    AND wr.week_start = date_trunc('week', NOW() - INTERVAL '1 week')
)
LIMIT 3;

-- 8. Dodaj przykładowe cue primingowe
INSERT INTO priming_cues (user_id, cue_type, cue_details, priming_message, active)
SELECT 
    user_id,
    'location',
    jsonb_build_object('place', 'biurko', 'trigger', 'Gdy siadam przy biurku'),
    'Zaczynam od najtrudniejszego zadania',
    true
FROM user_profiles
WHERE total_xp > 100
AND NOT EXISTS (
    SELECT 1 FROM priming_cues pc 
    WHERE pc.user_id = user_profiles.user_id
)
LIMIT 2;

-- 9. Dodaj przykładowe zaplanowane przypomnienia
INSERT INTO scheduled_cues (user_id, cue_type, scheduled_time, message, active)
SELECT 
    user_id,
    'reminder',
    '14:00'::TIME,
    'Czas na przerwę! Wstań i się rozruszaj.',
    true
FROM user_profiles
WHERE total_xp > 50
AND NOT EXISTS (
    SELECT 1 FROM scheduled_cues sc 
    WHERE sc.user_id = user_profiles.user_id
)
LIMIT 3;

-- 10. Dodaj przykładowe wpisy future_self
INSERT INTO future_self (user_id, visualization, feelings, created_at)
SELECT 
    user_id,
    'Widzę siebie jako osobę zdyscyplinowaną, która konsekwentnie realizuje swoje cele.',
    ARRAY['dumny', 'spełniony', 'pewny siebie'],
    NOW() - INTERVAL '1 day'
FROM user_profiles
WHERE total_xp > 0
AND NOT EXISTS (
    SELECT 1 FROM future_self fs 
    WHERE fs.user_id = user_profiles.user_id
    AND fs.created_at::DATE = (NOW() - INTERVAL '1 day')::DATE
)
LIMIT 5;

-- Podsumowanie
DO $$
BEGIN
    RAISE NOTICE 'Dane testowe zostały dodane do następujących tabel:';
    RAISE NOTICE '- rewards: przykładowe nagrody XP';
    RAISE NOTICE '- user_badges: podstawowe odznaki dla aktywnych użytkowników';
    RAISE NOTICE '- self_compassion_sessions: sesje samo-współczucia';
    RAISE NOTICE '- implementation_intentions: intencje implementacyjne';
    RAISE NOTICE '- commitment_contracts: kontrakty zobowiązań';
    RAISE NOTICE '- lootbox_history: historia otwierania lootboxów';
    RAISE NOTICE '- weekly_reviews: przeglądy tygodniowe';
    RAISE NOTICE '- priming_cues: wskazówki primingowe';
    RAISE NOTICE '- scheduled_cues: zaplanowane przypomnienia';
    RAISE NOTICE '- future_self: wizualizacje przyszłego ja';
END $$;