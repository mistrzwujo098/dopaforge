-- Diagnostyczna migracja dla naprawy tabeli lootbox_history

-- Sprawdź czy tabela istnieje i jakie ma kolumny
DO $$
BEGIN
    -- Jeśli tabela nie istnieje, utwórz ją
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lootbox_history') THEN
        CREATE TABLE lootbox_history (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            reward_type TEXT NOT NULL,
            reward_payload JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Utwórz indeksy
        CREATE INDEX idx_lootbox_history_user_id ON lootbox_history(user_id);
        CREATE INDEX idx_lootbox_history_created_at ON lootbox_history(created_at DESC);
        
        -- Włącz RLS
        ALTER TABLE lootbox_history ENABLE ROW LEVEL SECURITY;
        
        -- Utwórz polityki RLS
        CREATE POLICY "Users can view their own lootbox history"
            ON lootbox_history FOR SELECT
            USING (auth.uid() = user_id);
        
        CREATE POLICY "System can insert lootbox history"
            ON lootbox_history FOR INSERT
            WITH CHECK (true);
            
        RAISE NOTICE 'Tabela lootbox_history została utworzona';
    ELSE
        -- Jeśli tabela istnieje ale nie ma kolumny created_at, dodaj ją
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'lootbox_history' 
                      AND column_name = 'created_at') THEN
            ALTER TABLE lootbox_history ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
            CREATE INDEX IF NOT EXISTS idx_lootbox_history_created_at ON lootbox_history(created_at DESC);
            RAISE NOTICE 'Kolumna created_at została dodana do lootbox_history';
        ELSE
            RAISE NOTICE 'Tabela lootbox_history już ma kolumnę created_at';
        END IF;
        
        -- Sprawdź czy ma kolumnę opened_at i usuń ją jeśli istnieje
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'lootbox_history' 
                  AND column_name = 'opened_at') THEN
            -- Najpierw skopiuj dane z opened_at do created_at jeśli created_at jest puste
            UPDATE lootbox_history 
            SET created_at = opened_at 
            WHERE created_at IS NULL AND opened_at IS NOT NULL;
            
            -- Usuń kolumnę opened_at
            ALTER TABLE lootbox_history DROP COLUMN opened_at;
            RAISE NOTICE 'Kolumna opened_at została usunięta z lootbox_history';
        END IF;
    END IF;
END $$;

-- Wyświetl aktualną strukturę tabeli
DO $$
DECLARE
    col_record RECORD;
BEGIN
    RAISE NOTICE 'Struktura tabeli lootbox_history:';
    FOR col_record IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'lootbox_history'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: % (nullable: %, default: %)', 
            col_record.column_name, 
            col_record.data_type, 
            col_record.is_nullable,
            col_record.column_default;
    END LOOP;
END $$;