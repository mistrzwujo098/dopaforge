-- Migracja diagnostyczna i naprawcza dla tabeli scheduled_cues

DO $$
DECLARE
    col_record RECORD;
    table_exists BOOLEAN;
BEGIN
    -- Sprawdź czy tabela istnieje
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'scheduled_cues'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE 'Tabela scheduled_cues nie istnieje - tworzenie...';
        
        -- Utwórz tabelę
        CREATE TABLE scheduled_cues (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            title TEXT NOT NULL,
            cue_time TIME NOT NULL,
            days_of_week INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5], -- Monday to Friday
            enabled BOOLEAN DEFAULT true,
            notification_id TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Utwórz indeks
        CREATE INDEX idx_scheduled_cues_user_id ON scheduled_cues(user_id);
        
        -- Włącz RLS
        ALTER TABLE scheduled_cues ENABLE ROW LEVEL SECURITY;
        
        -- Utwórz politykę RLS
        CREATE POLICY "Users can manage their own scheduled cues"
            ON scheduled_cues FOR ALL
            USING (auth.uid() = user_id);
            
        RAISE NOTICE 'Tabela scheduled_cues została utworzona';
    ELSE
        RAISE NOTICE 'Tabela scheduled_cues istnieje - sprawdzanie struktury...';
        
        -- Wyświetl istniejące kolumny
        RAISE NOTICE 'Kolumny w tabeli scheduled_cues:';
        FOR col_record IN 
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'scheduled_cues'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  - %: % (nullable: %)', 
                col_record.column_name, 
                col_record.data_type, 
                col_record.is_nullable;
        END LOOP;
        
        -- Sprawdź czy brakuje kolumn i dodaj je
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'scheduled_cues' AND column_name = 'cue_time'
        ) THEN
            RAISE NOTICE 'Dodawanie brakującej kolumny cue_time...';
            ALTER TABLE scheduled_cues ADD COLUMN cue_time TIME NOT NULL DEFAULT '09:00'::TIME;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'scheduled_cues' AND column_name = 'days_of_week'
        ) THEN
            RAISE NOTICE 'Dodawanie brakującej kolumny days_of_week...';
            ALTER TABLE scheduled_cues ADD COLUMN days_of_week INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5];
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'scheduled_cues' AND column_name = 'enabled'
        ) THEN
            RAISE NOTICE 'Dodawanie brakującej kolumny enabled...';
            ALTER TABLE scheduled_cues ADD COLUMN enabled BOOLEAN DEFAULT true;
        END IF;
    END IF;
    
    -- Pokaż finalną strukturę
    RAISE NOTICE '';
    RAISE NOTICE 'Finalna struktura tabeli scheduled_cues:';
    FOR col_record IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'scheduled_cues'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: % (nullable: %, default: %)', 
            col_record.column_name, 
            col_record.data_type, 
            col_record.is_nullable,
            col_record.column_default;
    END LOOP;
END $$;