import { NextRequest, NextResponse } from 'next/server';
import { QueryResult } from 'pg';
import { getPool } from '@/lib/db';
import { rateLimitMiddleware } from '@/lib/rate-limit';
import { voteSchema, sanitizeString } from '@/lib/validation';

// Empêcher le pré-rendu de cette route (nécessite DB)
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const pool = getPool();
  const client = await pool.connect();

  let body: any;
  try {
    body = await req.json();
    
    // Log des données reçues (en développement uniquement)
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 Données reçues:', JSON.stringify(body, null, 2));
    }
    
    // Validation avec Zod
    const validatedData = voteSchema.parse({
      fullName: sanitizeString(body.fullName || ''),
      departementId: Number(body.departementId),
      communeId: Number(body.communeId),
      arrondissementId: Number(body.arrondissementId),
      villageId: Number(body.villageId),
      centreId: Number(body.centreId),
      bureauxVote: body.bureauxVote || [],
    });

    await client.query('BEGIN');

    // Vérifier que les IDs existent (intégrité référentielle)
    const checks = await Promise.all([
      client.query('SELECT id FROM departement WHERE id = $1', [validatedData.departementId]),
      client.query('SELECT id FROM commune WHERE id = $1', [validatedData.communeId]),
      client.query('SELECT id FROM arrondissement WHERE id = $1', [validatedData.arrondissementId]),
      client.query('SELECT id FROM village WHERE id = $1', [validatedData.villageId]),
      client.query('SELECT id FROM centre WHERE id = $1', [validatedData.centreId]),
    ]);

    if (checks.some((result: QueryResult) => result.rows.length === 0)) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Invalid reference IDs' },
        { status: 400 }
      );
    }

    // Créer ou récupérer les bureaux de vote pour ce centre
    // Les noms sont fixes : "Bureau de vote 1" et "Bureau de vote 2"
    const bureauNames = ['Bureau de vote 1', 'Bureau de vote 2'];
    const bureauMap = new Map<number, number>(); // Map: bureauVoteId (1 ou 2) -> id réel en DB

    try {
      // Vérifier d'abord si la table bureau_vote existe
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'bureau_vote'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { 
            error: 'Table bureau_vote does not exist',
            hint: 'Please run the migration: migrations/002_bureaux_vote.sql'
          },
          { status: 500 }
        );
      }

      for (let i = 0; i < bureauNames.length; i++) {
        const bureauName = bureauNames[i];
        const bureauId = i + 1; // 1 ou 2
        
        // Vérifier si le bureau existe déjà
        let bureauResult = await client.query(
          'SELECT id FROM bureau_vote WHERE centre_id = $1 AND name = $2',
          [validatedData.centreId, bureauName]
        );

        if (bureauResult.rows.length === 0) {
          // Créer le bureau s'il n'existe pas
          bureauResult = await client.query(
            'INSERT INTO bureau_vote (centre_id, name) VALUES ($1, $2) RETURNING id',
            [validatedData.centreId, bureauName]
          );
        }

        bureauMap.set(bureauId, bureauResult.rows[0].id);
      }
    } catch (bureauError: any) {
      await client.query('ROLLBACK').catch(() => {});
      console.error('Error creating/fetching bureaux:', bureauError);
      console.error('Error code:', bureauError.code);
      console.error('Error detail:', bureauError.detail);
      return NextResponse.json(
        { 
          error: 'Error managing bureaux de vote',
          message: bureauError.message,
          code: bureauError.code,
          hint: 'Make sure the migration 002_bureaux_vote.sql has been executed. Check server logs for more details.'
        },
        { status: 500 }
      );
    }

    // Insérer un vote pour chaque bureau de vote
    const insertedVotes = [];
    for (const bureau of validatedData.bureauxVote) {
      // Récupérer l'ID réel du bureau depuis la map
      const realBureauId = bureauMap.get(bureau.bureauVoteId);
      if (!realBureauId) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Invalid bureau de vote ID', bureauVoteId: bureau.bureauVoteId },
          { status: 400 }
        );
      }

      // Déterminer le duo_id basé sur les voix
      let duoId = 1; // Par défaut WADAGNI - TALATA
      if (bureau.voixHounkpeHounwanou > bureau.voixWadagniTalata) {
        duoId = 2; // HOUNKPE - HOUNWANOU
      }

      try {
        const result = await client.query(
          `INSERT INTO vote (
            full_name, bureau_vote_id, departement_id, commune_id, 
            arrondissement_id, village_id, centre_id, duo_id,
            inscrits, votants, bulletins_nuls, bulletins_blancs,
            suffrages_exprimes, voix_wadagni_talata, voix_hounkpe_hounwanou, observations
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          RETURNING id, created_at`,
          [
            validatedData.fullName,
            realBureauId,
            validatedData.departementId,
            validatedData.communeId,
            validatedData.arrondissementId,
            validatedData.villageId,
            validatedData.centreId,
            duoId,
            bureau.inscrits,
            bureau.votants,
            bureau.bulletinsNuls,
            bureau.bulletinsBlancs,
            bureau.suffragesExprimes,
            bureau.voixWadagniTalata,
            bureau.voixHounkpeHounwanou,
            bureau.observations || '',
          ]
        );
        insertedVotes.push(result.rows[0]);
      } catch (insertError: any) {
        await client.query('ROLLBACK');
        console.error('Error inserting vote:', insertError);
        console.error('SQL Error code:', insertError.code);
        console.error('SQL Error detail:', insertError.detail);
        console.error('SQL Error hint:', insertError.hint);
        console.error('Data being inserted:', {
          fullName: validatedData.fullName,
          realBureauId,
          departementId: validatedData.departementId,
          bureau: {
            inscrits: bureau.inscrits,
            votants: bureau.votants,
            bulletinsNuls: bureau.bulletinsNuls,
            bulletinsBlancs: bureau.bulletinsBlancs,
            suffragesExprimes: bureau.suffragesExprimes,
            voixWadagniTalata: bureau.voixWadagniTalata,
            voixHounkpeHounwanou: bureau.voixHounkpeHounwanou,
          }
        });
        return NextResponse.json(
          { 
            error: 'Error inserting vote',
            message: insertError.message,
            code: insertError.code,
            detail: insertError.detail,
            hint: insertError.hint || 'Check server logs for more details'
          },
          { status: 500 }
        );
      }
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      votes: insertedVotes,
    });
  } catch (error: any) {
    await client.query('ROLLBACK').catch(() => {
      // Ignorer les erreurs de rollback
    });
    
    if (error.name === 'ZodError') {
      console.error('❌ Erreur de validation Zod:', error.errors);
      console.error('📥 Données reçues qui ont échoué:', JSON.stringify(body, null, 2));
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('❌ Erreur lors de la création du vote:', error);
    console.error('📚 Stack trace:', error.stack);
    console.error('💬 Message d\'erreur:', error.message);
    if (error.code) {
      console.error('🔢 Code d\'erreur:', error.code);
    }
    if (error.detail) {
      console.error('📋 Détail:', error.detail);
    }
    if (error.hint) {
      console.error('💡 Indice:', error.hint);
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export const POST = rateLimitMiddleware(handler);

