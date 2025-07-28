-- Migracja diagnostyczna i naprawcza dla tabeli implementation_intentions

DO $$
DECLARE
    col_record RECORD;
    has_if_trigger BOOLEAN := FALSE;
    has_trigger_type BOOLEAN := FALSE;
BEGIN
    -- Sprawdź jakie kolumny ma tabela
    RAISE NOTICE 'Sprawdzanie struktury tabeli implementation_intentions...';
    
    FOR col_record IN 
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'implementation_intentions'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  Kolumna: % (%)', col_record.column_name, col_record.data_type;
        
        IF col_record.column_name = 'if_trigger' THEN
            has_if_trigger := TRUE;
        END IF;
        
        IF col_record.column_name = 'trigger_type' THEN
            has_trigger_type := TRUE;
        END IF;
    END LOOP;
    
    -- Jeśli tabela nie istnieje, utwórz ją
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'implementation_intentions') THEN
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
        
        CREATE POLICY "Users can manage their own implementation intentions"
            ON implementation_intentions FOR ALL
            USING (auth.uid() = user_id);
            
        RAISE NOTICE 'Tabela implementation_intentions została utworzona ze schematem if_trigger/then_action';
        
    -- Jeśli tabela ma kolumny trigger_type/trigger_value/action, przekonwertuj na if_trigger/then_action
    ELSIF has_trigger_type AND NOT has_if_trigger THEN
        RAISE NOTICE 'Konwersja z trigger_type/trigger_value/action na if_trigger/then_action...';
        
        -- Dodaj nowe kolumny
        ALTER TABLE implementation_intentions ADD COLUMN if_trigger TEXT;
        ALTER TABLE implementation_intentions ADD COLUMN then_action TEXT;
        
        -- Migruj dane
        UPDATE implementation_intentions 
        SET if_trigger = CONCAT(trigger_type, ': ', trigger_value),
            then_action = action;
        
        -- Ustaw NOT NULL
        ALTER TABLE implementation_intentions 
            ALTER COLUMN if_trigger SET NOT NULL,
            ALTER COLUMN then_action SET NOT NULL;
        
        -- Usuń stare kolumny
        ALTER TABLE implementation_intentions 
            DROP COLUMN IF EXISTS trigger_type,
            DROP COLUMN IF EXISTS trigger_value,
            DROP COLUMN IF EXISTS action;
            
        RAISE NOTICE 'Migracja zakończona - tabela używa teraz if_trigger/then_action';
        
    -- Jeśli tabela ma if_trigger/then_action, ale kod oczekuje trigger_type/trigger_value/action
    ELSIF has_if_trigger AND NOT has_trigger_type THEN
        RAISE NOTICE 'Tabela już używa schematu if_trigger/then_action - OK';
    END IF;
    
    -- Pokaż finalną strukturę
    RAISE NOTICE '';
    RAISE NOTICE 'Finalna struktura tabeli implementation_intentions:';
    FOR col_record IN 
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'implementation_intentions'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: % (nullable: %)', 
            col_record.column_name, 
            col_record.data_type, 
            col_record.is_nullable;
    END LOOP;
END $$;