-- Migration: Initial Schema
-- Description: Création des tables pour la plateforme PR_2026

-- Table: duo
CREATE TABLE IF NOT EXISTS duo (
    id SERIAL PRIMARY KEY,
    label TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pré-remplir les duos
INSERT INTO duo (label) VALUES 
    ('Duo 1'),
    ('Duo 2'),
    ('Duo 3')
ON CONFLICT (label) DO NOTHING;

-- Table: departement
CREATE TABLE IF NOT EXISTS departement (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_departement_name ON departement(name);

-- Table: commune
CREATE TABLE IF NOT EXISTS commune (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    departement_id INTEGER NOT NULL REFERENCES departement(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, departement_id)
);

CREATE INDEX IF NOT EXISTS idx_commune_departement_id ON commune(departement_id);
CREATE INDEX IF NOT EXISTS idx_commune_name ON commune(name);

-- Table: arrondissement
CREATE TABLE IF NOT EXISTS arrondissement (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    commune_id INTEGER NOT NULL REFERENCES commune(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, commune_id)
);

CREATE INDEX IF NOT EXISTS idx_arrondissement_commune_id ON arrondissement(commune_id);
CREATE INDEX IF NOT EXISTS idx_arrondissement_name ON arrondissement(name);

-- Table: village
CREATE TABLE IF NOT EXISTS village (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    arrondissement_id INTEGER NOT NULL REFERENCES arrondissement(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, arrondissement_id)
);

CREATE INDEX IF NOT EXISTS idx_village_arrondissement_id ON village(arrondissement_id);
CREATE INDEX IF NOT EXISTS idx_village_name ON village(name);

-- Table: centre
CREATE TABLE IF NOT EXISTS centre (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    village_id INTEGER NOT NULL REFERENCES village(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, village_id)
);

CREATE INDEX IF NOT EXISTS idx_centre_village_id ON centre(village_id);
CREATE INDEX IF NOT EXISTS idx_centre_name ON centre(name);

-- Table: vote (structure de base, sera complétée par les migrations suivantes)
CREATE TABLE IF NOT EXISTS vote (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    duo_id INTEGER NOT NULL REFERENCES duo(id) ON DELETE RESTRICT,
    departement_id INTEGER NOT NULL REFERENCES departement(id) ON DELETE RESTRICT,
    commune_id INTEGER NOT NULL REFERENCES commune(id) ON DELETE RESTRICT,
    arrondissement_id INTEGER NOT NULL REFERENCES arrondissement(id) ON DELETE RESTRICT,
    village_id INTEGER NOT NULL REFERENCES village(id) ON DELETE RESTRICT,
    centre_id INTEGER NOT NULL REFERENCES centre(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index essentiels pour vote
CREATE INDEX IF NOT EXISTS idx_vote_duo_id ON vote(duo_id);
CREATE INDEX IF NOT EXISTS idx_vote_centre_id ON vote(centre_id);
CREATE INDEX IF NOT EXISTS idx_vote_duo_centre ON vote(duo_id, centre_id);
CREATE INDEX IF NOT EXISTS idx_vote_departement_id ON vote(departement_id);
CREATE INDEX IF NOT EXISTS idx_vote_commune_id ON vote(commune_id);
CREATE INDEX IF NOT EXISTS idx_vote_arrondissement_id ON vote(arrondissement_id);
CREATE INDEX IF NOT EXISTS idx_vote_village_id ON vote(village_id);
CREATE INDEX IF NOT EXISTS idx_vote_created_at ON vote(created_at);

