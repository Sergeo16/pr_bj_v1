import 'dotenv/config';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { getPool, closePool } from '../lib/db';

async function migrate() {
  const pool = getPool();
  
  try {
    console.log('🔄 Démarrage des migrations...');
    
    // Lire tous les fichiers de migration dans l'ordre (exclure le script de reset)
    const migrationsDir = join(process.cwd(), 'migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql') && !file.startsWith('000_'))
      .sort(); // Trier pour exécuter dans l'ordre (001, 002, etc.)
    
    console.log(`📋 ${migrationFiles.length} migration(s) trouvée(s)`);
    
    let hasErrors = false;
    
    for (const migrationFile of migrationFiles) {
      console.log(`\n🔄 Exécution de ${migrationFile}...`);
      
      try {
        const migrationSQL = readFileSync(
          join(migrationsDir, migrationFile),
          'utf-8'
        );
        
        await pool.query(migrationSQL);
        console.log(`✅ ${migrationFile} exécutée avec succès`);
      } catch (error: any) {
        // Certaines erreurs sont normales (ex: table already exists avec CREATE TABLE IF NOT EXISTS)
        // On continue même en cas d'erreur pour permettre les migrations idempotentes
        const errorMessage = error.message || '';
        const errorCode = error.code || '';
        
        // Ignorer certaines erreurs non critiques
        const isNonCriticalError = 
          errorMessage.includes('already exists') ||
          errorMessage.includes('duplicate key') ||
          errorMessage.includes('does not exist') && errorMessage.includes('DROP') ||
          errorCode === '42P07' || // duplicate_table
          errorCode === '42710';   // duplicate_object
        
        if (isNonCriticalError) {
          console.log(`⚠️  ${migrationFile}: ${errorMessage} (erreur non critique, continuation...)`);
        } else {
          console.error(`❌ Erreur lors de l'exécution de ${migrationFile}:`, error.message);
          if (error.code) {
            console.error('Code:', error.code);
          }
          if (error.detail) {
            console.error('Detail:', error.detail);
          }
          hasErrors = true;
        }
      }
    }
    
    if (hasErrors) {
      console.log('\n⚠️  Certaines migrations ont échoué, mais le processus continue...');
      console.log('💡 Vérifiez les logs ci-dessus pour plus de détails');
    } else {
      console.log('\n✅ Toutes les migrations terminées avec succès');
    }
  } catch (error: any) {
    console.error('❌ Erreur fatale lors des migrations:', error);
    if (error.message) {
      console.error('Message:', error.message);
    }
    if (error.code) {
      console.error('Code:', error.code);
    }
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
    // Ne pas faire exit(1) pour permettre au serveur de démarrer quand même
    // Les migrations peuvent être exécutées manuellement si nécessaire
    console.log('⚠️  Continuation malgré l\'erreur...');
  } finally {
    await closePool();
  }
}

migrate();

