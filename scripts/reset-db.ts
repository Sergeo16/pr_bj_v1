import 'dotenv/config';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { getPool, closePool } from '../lib/db';

async function resetDatabase() {
  const pool = getPool();
  
  try {
    console.log('⚠️  ATTENTION: Réinitialisation complète de la base de données...');
    console.log('🔄 Suppression de toutes les tables...');
    
    // Lire et exécuter le script de reset
    const resetSQL = readFileSync(
      join(process.cwd(), 'migrations', '000_reset_database.sql'),
      'utf-8'
    );
    
    await pool.query(resetSQL);
    console.log('✅ Toutes les tables supprimées');
    
    console.log('\n🔄 Réapplication de toutes les migrations...');
    
    // Lire tous les fichiers de migration dans l'ordre (sauf le reset)
    const migrationsDir = join(process.cwd(), 'migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql') && !file.startsWith('000_'))
      .sort();
    
    for (const migrationFile of migrationFiles) {
      console.log(`\n🔄 Exécution de ${migrationFile}...`);
      
      const migrationSQL = readFileSync(
        join(migrationsDir, migrationFile),
        'utf-8'
      );
      
      await pool.query(migrationSQL);
      console.log(`✅ ${migrationFile} exécutée avec succès`);
    }
    
    console.log('\n✅ Base de données réinitialisée avec succès');
    console.log('💡 Vous pouvez maintenant exécuter: npm run seed');
  } catch (error: any) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    if (error.message) {
      console.error('Message:', error.message);
    }
    if (error.code) {
      console.error('Code:', error.code);
    }
    process.exit(1);
  } finally {
    await closePool();
  }
}

resetDatabase();

