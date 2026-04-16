-- Libellés duo + alignement historique : suffrages = votants - bulletins_nuls, bulletins blancs = 0
UPDATE duo SET label = 'Duo candidat 1' WHERE id = 1;
UPDATE duo SET label = 'Duo candidat 2' WHERE id = 2;

UPDATE vote SET
  suffrages_exprimes = GREATEST(0, votants - COALESCE(bulletins_nuls, 0)),
  bulletins_blancs = 0;
