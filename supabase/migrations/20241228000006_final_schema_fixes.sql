-- Finalna migracja naprawcza dla wszystkich tabel przed danymi testowymi

DO $$
BEGIN
    RAISE NOTICE '=== ROZPOCZĘCIE FINALNEJ NAPRAWY SCHEMATÓW ===';
    
    -- 1. NAPRAW TABELĘ lootbox_history
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lootbox_history') THEN
        RAISE NOTICE 'Tworzenie tabeli lootbox_history...';
        CREATE TABLE lootbox_history (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            reward_type TEXT NOT NULL,
            reward_payload JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX idx_lootbox_history_user_id ON lootbox_history(user_id);
        CREATE INDEX idx_lootbox_history_created_at ON lootbox_history(created_at DESC);
        ALTER TABLE lootbox_history ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can view their own lootbox history" ON lootbox_history FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "System can insert lootbox history" ON lootbox_history FOR INSERT WITH CHECK (true);
    ELSE
        -- Upewnij się że ma kolumnę created_at
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lootbox_history' AND column_name = 'created_at') THEN
            ALTER TABLE lootbox_history ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
    END IF;
    
    -- 2. NAPRAW TABELĘ implementation_intentions  
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'implementation_intentions') THEN
        RAISE NOTICE 'Tworzenie tabeli implementation_intentions...';
        CREATE TABLE implementation_intentions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            if_trigger TEXT NOT NULL,
            then_action TEXT NOT NULL,
            active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX idx_implementation_intentions_user_id ON implementation_intentions(user_id);
        ALTER TABLE implementation_intentions ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can manage their own implementation intentions" ON implementation_intentions FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    -- 3. NAPRAW TABELĘ scheduled_cues
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scheduled_cues') THEN
        RAISE NOTICE 'Tworzenie tabeli scheduled_cues...';
        CREATE TABLE scheduled_cues (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            title TEXT NOT NULL,
            cue_time TIME NOT NULL,
            days_of_week INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5],
            enabled BOOLEAN DEFAULT true,
            notification_id TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX idx_scheduled_cues_user_id ON scheduled_cues(user_id);
        ALTER TABLE scheduled_cues ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can manage their own scheduled cues" ON scheduled_cues FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    -- 4. UPEWNIJ SIĘ ŻE WSZYSTKIE INNE TABELE ISTNIEJĄ
    -- user_profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        RAISE WARNING 'Brak tabeli user_profiles - wykonaj podstawowe migracje!';
    END IF;
    
    -- rewards
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rewards') THEN
        RAISE WARNING 'Brak tabeli rewards - wykonaj podstawowe migracje!';
    END IF;
    
    -- user_badges
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_badges') THEN
        RAISE WARNING 'Brak tabeli user_badges - wykonaj podstawowe migracje!';
    END IF;
    
    -- self_compassion_sessions
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'self_compassion_sessions') THEN
        RAISE WARNING 'Brak tabeli self_compassion_sessions - wykonaj migrację 20240726000002!';
    END IF;
    
    -- commitment_contracts
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commitment_contracts') THEN
        RAISE WARNING 'Brak tabeli commitment_contracts - wykonaj migrację 20240726000002!';
    END IF;
    
    -- weekly_reviews
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'weekly_reviews') THEN
        RAISE WARNING 'Brak tabeli weekly_reviews - wykonaj migrację 20240726000004!';
    END IF;
    
    -- priming_cues
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'priming_cues') THEN
        RAISE WARNING 'Brak tabeli priming_cues - wykonaj migrację 20240726000002!';
    END IF;
    
    -- future_self
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'future_self') THEN
        RAISE WARNING 'Brak tabeli future_self - wykonaj migrację 20240726000003!';
    END IF;
    
    RAISE NOTICE '=== ZAKOŃCZENIE FINALNEJ NAPRAWY SCHEMATÓW ===';
    RAISE NOTICE 'Możesz teraz bezpiecznie wykonać migrację z danymi testowymi (20241228000002_add_test_data.sql)';
END $$;