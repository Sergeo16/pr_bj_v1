import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getPool, closePool } from '../lib/db';

interface Centre {
  code: string;
  libelle: string;
}

interface Village {
  code: string;
  centres: Centre[];
}

interface Arrondissement {
  code: string;
  villages: Record<string, Village>;
}

interface Commune {
  arrondissements: Record<string, Arrondissement>;
}

interface DepartementData {
  departement: string;
  communes: Record<string, Commune>;
}

// Structure du nouveau fichier: { "ALIBORI": { departement: "...", communes: {...} }, ... }
type Data = Record<string, DepartementData>;

async function seed() {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🗑️  Suppression des anciennes données...');
    // Supprimer d'abord les votes (car ils ont ON DELETE RESTRICT sur les départements)
    await client.query('DELETE FROM vote');
    console.log('✓ Votes supprimés');
    // Supprimer les départements en cascade (supprime aussi communes, arrondissements, villages, centres)
    await client.query('DELETE FROM departement');
    console.log('✓ Données géographiques supprimées');
    
    console.log('📖 Lecture du fichier JSON...');
    const dataFile = readFileSync(
      join(process.cwd(), 'data', 'BENIN_centres_vote_complet.json'),
      'utf-8'
    );
    const data: Data = JSON.parse(dataFile);
    
    const departementsList = Object.values(data);
    console.log(`📊 Traitement de ${departementsList.length} départements...`);
    
    for (const deptData of departementsList) {
      const deptName = deptData.departement.trim();
      
      // Upsert département
      const deptResult = await client.query(
        'INSERT INTO departement (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
        [deptName]
      );
      const departementId = deptResult.rows[0].id;
      
      console.log(`  ✓ Département: ${deptName} (ID: ${departementId})`);
      
      // Traiter les communes
      for (const [communeName, communeData] of Object.entries(deptData.communes)) {
        const communeNameClean = communeName.trim();
        
        // Upsert commune
        const communeResult = await client.query(
          'INSERT INTO commune (name, departement_id) VALUES ($1, $2) ON CONFLICT (name, departement_id) DO UPDATE SET name = EXCLUDED.name RETURNING id',
          [communeNameClean, departementId]
        );
        const communeId = communeResult.rows[0].id;
        
        // Traiter les arrondissements
        for (const [arrName, arrData] of Object.entries(communeData.arrondissements)) {
          const arrNameClean = arrName.trim();
          
          // Upsert arrondissement
          const arrResult = await client.query(
            'INSERT INTO arrondissement (name, commune_id) VALUES ($1, $2) ON CONFLICT (name, commune_id) DO UPDATE SET name = EXCLUDED.name RETURNING id',
            [arrNameClean, communeId]
          );
          const arrondissementId = arrResult.rows[0].id;
          
          // Traiter les villages
          if (arrData.villages && typeof arrData.villages === 'object') {
            for (const [villageName, villageData] of Object.entries(arrData.villages)) {
              const villageNameClean = villageName.trim();
              
              // Vérifier que villageData est un objet avec les propriétés attendues
              if (!villageData || typeof villageData !== 'object') {
                continue;
              }
              
              // Upsert village
              const villageResult = await client.query(
                'INSERT INTO village (name, arrondissement_id) VALUES ($1, $2) ON CONFLICT (name, arrondissement_id) DO UPDATE SET name = EXCLUDED.name RETURNING id',
                [villageNameClean, arrondissementId]
              );
              const villageId = villageResult.rows[0].id;
              
              // Traiter les centres
              if (villageData.centres && Array.isArray(villageData.centres)) {
                for (const centre of villageData.centres) {
                  if (centre && centre.libelle) {
                    const centreNameClean = centre.libelle.trim();
                    
                    // Upsert centre
                    await client.query(
                      'INSERT INTO centre (name, village_id) VALUES ($1, $2) ON CONFLICT (name, village_id) DO UPDATE SET name = EXCLUDED.name',
                      [centreNameClean, villageId]
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
    
    await client.query('COMMIT');
    console.log('✅ Seed terminé avec succès');
    
    // Statistiques
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM departement) as departements,
        (SELECT COUNT(*) FROM commune) as communes,
        (SELECT COUNT(*) FROM arrondissement) as arrondissements,
        (SELECT COUNT(*) FROM village) as villages,
        (SELECT COUNT(*) FROM centre) as centres
    `);
    
    console.log('\n📈 Statistiques:');
    console.log(`  - Départements: ${stats.rows[0].departements}`);
    console.log(`  - Communes: ${stats.rows[0].communes}`);
    console.log(`  - Arrondissements: ${stats.rows[0].arrondissements}`);
    console.log(`  - Villages: ${stats.rows[0].villages}`);
    console.log(`  - Centres: ${stats.rows[0].centres}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  } finally {
    client.release();
    await closePool();
  }
}

seed();

