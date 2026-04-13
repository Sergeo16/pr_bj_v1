-- Migration: Ajout des bureaux de vote et modification de la structure de vote
-- Description: Ajout de la table bureau_vote et modification de la table vote pour supporter les nouveaux champs

-- Table: bureau_vote
CREATE TABLE IF NOT EXISTS bureau_vote (
    id SERIAL PRIMARY KEY,
    centre_id INTEGER NOT NULL REFERENCES centre(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, centre_id)
);

CREATE INDEX IF NOT EXISTS idx_bureau_vote_centre_id ON bureau_vote(centre_id);
CREATE INDEX IF NOT EXISTS idx_bureau_vote_name ON bureau_vote(name);

-- Modifier la table duo pour remplacer par les deux duos fixes
-- D'abord mettre à jour les labels
UPDATE duo SET label = 'WADAGNI - TALATA' WHERE id = 1;
UPDATE duo SET label = 'HOUNKPE - HOUNWANOU' WHERE id = 2;

-- Mettre à jour les votes qui référencent des duos > 2 pour les rediriger vers le duo 1 ou 2
-- (on les met tous sur le duo 1 par défaut, mais vous pouvez ajuster la logique)
UPDATE vote SET duo_id = 1 WHERE duo_id > 2;

-- Maintenant on peut supprimer les duos > 2
DELETE FROM duo WHERE id > 2;

-- Supprimer l'ancien champ count s'il existe (ancienne architecture)
ALTER TABLE vote DROP COLUMN IF EXISTS count;

-- Ajouter les nouveaux champs à la table vote
ALTER TABLE vote ADD COLUMN IF NOT EXISTS bureau_vote_id INTEGER REFERENCES bureau_vote(id) ON DELETE RESTRICT;
ALTER TABLE vote ADD COLUMN IF NOT EXISTS inscrits INTEGER DEFAULT 0 CHECK (inscrits >= 0);
ALTER TABLE vote ADD COLUMN IF NOT EXISTS votants INTEGER DEFAULT 0 CHECK (votants >= 0);
ALTER TABLE vote ADD COLUMN IF NOT EXISTS bulletins_nuls INTEGER DEFAULT 0 CHECK (bulletins_nuls >= 0);
ALTER TABLE vote ADD COLUMN IF NOT EXISTS bulletins_blancs INTEGER DEFAULT 0 CHECK (bulletins_blancs >= 0);
ALTER TABLE vote ADD COLUMN IF NOT EXISTS suffrages_exprimes INTEGER DEFAULT 0 CHECK (suffrages_exprimes >= 0);
ALTER TABLE vote ADD COLUMN IF NOT EXISTS voix_wadagni_talata INTEGER DEFAULT 0 CHECK (voix_wadagni_talata >= 0);
ALTER TABLE vote ADD COLUMN IF NOT EXISTS voix_hounkpe_hounwanou INTEGER DEFAULT 0 CHECK (voix_hounkpe_hounwanou >= 0);
ALTER TABLE vote ADD COLUMN IF NOT EXISTS observations TEXT;

-- Index pour les nouveaux champs
CREATE INDEX IF NOT EXISTS idx_vote_bureau_vote_id ON vote(bureau_vote_id);
CREATE INDEX IF NOT EXISTS idx_vote_full_name ON vote(full_name);

