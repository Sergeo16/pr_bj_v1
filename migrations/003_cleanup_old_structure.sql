-- Migration: Nettoyage complet de l'ancienne architecture
-- Description: Finalisation de la migration vers la nouvelle architecture avec bureaux de vote

-- Rendre bureau_vote_id NOT NULL (après avoir migré les données existantes si nécessaire)
-- D'abord, mettre à jour les votes existants qui n'ont pas de bureau_vote_id
-- On crée un bureau par défaut pour chaque centre qui a des votes sans bureau
DO $$
DECLARE
    centre_record RECORD;
    default_bureau_id INTEGER;
BEGIN
    FOR centre_record IN 
        SELECT DISTINCT centre_id 
        FROM vote 
        WHERE bureau_vote_id IS NULL
    LOOP
        -- Vérifier si un bureau par défaut existe déjà
        SELECT id INTO default_bureau_id
        FROM bureau_vote
        WHERE centre_id = centre_record.centre_id 
        AND name = 'Bureau de vote 1'
        LIMIT 1;
        
        -- Créer le bureau s'il n'existe pas
        IF default_bureau_id IS NULL THEN
            INSERT INTO bureau_vote (centre_id, name)
            VALUES (centre_record.centre_id, 'Bureau de vote 1')
            RETURNING id INTO default_bureau_id;
        END IF;
        
        -- Mettre à jour les votes sans bureau_vote_id
        UPDATE vote
        SET bureau_vote_id = default_bureau_id
        WHERE centre_id = centre_record.centre_id
        AND bureau_vote_id IS NULL;
    END LOOP;
END $$;

-- Maintenant on peut rendre bureau_vote_id NOT NULL (seulement s'il n'y a plus de NULL)
-- Vérifier d'abord s'il reste des NULL
DO $$
DECLARE
    null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_count
    FROM vote
    WHERE bureau_vote_id IS NULL;
    
    IF null_count = 0 THEN
        ALTER TABLE vote ALTER COLUMN bureau_vote_id SET NOT NULL;
    ELSE
        RAISE NOTICE 'Il reste % votes sans bureau_vote_id. Impossible de rendre la colonne NOT NULL.', null_count;
    END IF;
END $$;

-- Supprimer l'ancien index qui n'est plus nécessaire
DROP INDEX IF EXISTS idx_vote_duo_centre;

-- S'assurer que tous les nouveaux champs ont des valeurs par défaut appropriées
UPDATE vote 
SET 
    inscrits = COALESCE(inscrits, 0),
    votants = COALESCE(votants, 0),
    bulletins_nuls = COALESCE(bulletins_nuls, 0),
    bulletins_blancs = COALESCE(bulletins_blancs, 0),
    suffrages_exprimes = COALESCE(suffrages_exprimes, 0),
    voix_wadagni_talata = COALESCE(voix_wadagni_talata, 0),
    voix_hounkpe_hounwanou = COALESCE(voix_hounkpe_hounwanou, 0)
WHERE 
    inscrits IS NULL 
    OR votants IS NULL 
    OR bulletins_nuls IS NULL 
    OR bulletins_blancs IS NULL 
    OR suffrages_exprimes IS NULL 
    OR voix_wadagni_talata IS NULL 
    OR voix_hounkpe_hounwanou IS NULL;

