-- Script de réinitialisation complète de la base de données
-- ATTENTION: Ce script supprime TOUTES les données !
-- Utilisez uniquement en développement ou après sauvegarde

-- Supprimer toutes les tables dans le bon ordre (en respectant les contraintes)
DROP TABLE IF EXISTS vote CASCADE;
DROP TABLE IF EXISTS bureau_vote CASCADE;
DROP TABLE IF EXISTS centre CASCADE;
DROP TABLE IF EXISTS village CASCADE;
DROP TABLE IF EXISTS arrondissement CASCADE;
DROP TABLE IF EXISTS commune CASCADE;
DROP TABLE IF EXISTS departement CASCADE;
DROP TABLE IF EXISTS duo CASCADE;





