import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { rateLimitMiddleware } from '@/lib/rate-limit';

// Empêcher le pré-rendu de cette route (nécessite DB)
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'departement';
    const search = searchParams.get('search') || '';

    const pool = getPool();
    let result;

    switch (filter) {
      case 'departement':
        result = await pool.query(`
          SELECT 
            dept.id,
            dept.name,
            COALESCE(SUM(v.inscrits), 0) as total_inscrits,
            COALESCE(SUM(v.votants), 0) as total_votants,
            COALESCE(SUM(v.bulletins_nuls), 0) as total_bulletins_nuls,
            COALESCE(SUM(v.bulletins_blancs), 0) as total_bulletins_blancs,
            COALESCE(SUM(v.suffrages_exprimes), 0) as total_suffrages_exprimes,
            COALESCE(SUM(v.voix_wadagni_talata), 0) as total_wadagni_talata,
            COALESCE(SUM(v.voix_hounkpe_hounwanou), 0) as total_hounkpe_hounwanou
          FROM departement dept
          LEFT JOIN vote v ON v.departement_id = dept.id
          ${search ? `WHERE dept.name ILIKE $1` : ''}
          GROUP BY dept.id, dept.name
          ORDER BY dept.name
          ${search ? '' : 'LIMIT 500'}
        `, search ? [`%${search}%`] : []);
        break;

      case 'commune':
        result = await pool.query(`
          SELECT 
            c.id,
            c.name as commune_name,
            dept.name as departement_name,
            COALESCE(SUM(v.inscrits), 0) as total_inscrits,
            COALESCE(SUM(v.votants), 0) as total_votants,
            COALESCE(SUM(v.bulletins_nuls), 0) as total_bulletins_nuls,
            COALESCE(SUM(v.bulletins_blancs), 0) as total_bulletins_blancs,
            COALESCE(SUM(v.suffrages_exprimes), 0) as total_suffrages_exprimes,
            COALESCE(SUM(v.voix_wadagni_talata), 0) as total_wadagni_talata,
            COALESCE(SUM(v.voix_hounkpe_hounwanou), 0) as total_hounkpe_hounwanou
          FROM commune c
          JOIN departement dept ON c.departement_id = dept.id
          LEFT JOIN vote v ON v.commune_id = c.id
          ${search ? `WHERE c.name ILIKE $1 OR dept.name ILIKE $1` : ''}
          GROUP BY c.id, c.name, dept.name
          ORDER BY dept.name, c.name
          ${search ? '' : 'LIMIT 500'}
        `, search ? [`%${search}%`] : []);
        break;

      case 'arrondissement':
        result = await pool.query(`
          SELECT 
            a.id,
            a.name as arrondissement_name,
            c.name as commune_name,
            dept.name as departement_name,
            COALESCE(SUM(v.inscrits), 0) as total_inscrits,
            COALESCE(SUM(v.votants), 0) as total_votants,
            COALESCE(SUM(v.bulletins_nuls), 0) as total_bulletins_nuls,
            COALESCE(SUM(v.bulletins_blancs), 0) as total_bulletins_blancs,
            COALESCE(SUM(v.suffrages_exprimes), 0) as total_suffrages_exprimes,
            COALESCE(SUM(v.voix_wadagni_talata), 0) as total_wadagni_talata,
            COALESCE(SUM(v.voix_hounkpe_hounwanou), 0) as total_hounkpe_hounwanou
          FROM arrondissement a
          JOIN commune c ON a.commune_id = c.id
          JOIN departement dept ON c.departement_id = dept.id
          LEFT JOIN vote v ON v.arrondissement_id = a.id
          ${search ? `WHERE a.name ILIKE $1 OR c.name ILIKE $1 OR dept.name ILIKE $1` : ''}
          GROUP BY a.id, a.name, c.name, dept.name
          ORDER BY dept.name, c.name, a.name
          ${search ? '' : 'LIMIT 500'}
        `, search ? [`%${search}%`] : []);
        break;

      case 'village':
        result = await pool.query(`
          SELECT 
            v.id,
            v.name as village_name,
            a.name as arrondissement_name,
            c.name as commune_name,
            dept.name as departement_name,
            COALESCE(SUM(vote.inscrits), 0) as total_inscrits,
            COALESCE(SUM(vote.votants), 0) as total_votants,
            COALESCE(SUM(vote.bulletins_nuls), 0) as total_bulletins_nuls,
            COALESCE(SUM(vote.bulletins_blancs), 0) as total_bulletins_blancs,
            COALESCE(SUM(vote.suffrages_exprimes), 0) as total_suffrages_exprimes,
            COALESCE(SUM(vote.voix_wadagni_talata), 0) as total_wadagni_talata,
            COALESCE(SUM(vote.voix_hounkpe_hounwanou), 0) as total_hounkpe_hounwanou
          FROM village v
          JOIN arrondissement a ON v.arrondissement_id = a.id
          JOIN commune c ON a.commune_id = c.id
          JOIN departement dept ON c.departement_id = dept.id
          LEFT JOIN vote vote ON vote.village_id = v.id
          ${search ? `WHERE v.name ILIKE $1 OR a.name ILIKE $1 OR c.name ILIKE $1 OR dept.name ILIKE $1` : ''}
          GROUP BY v.id, v.name, a.name, c.name, dept.name
          ORDER BY dept.name, c.name, a.name, v.name
          ${search ? '' : 'LIMIT 500'}
        `, search ? [`%${search}%`] : []);
        break;

      case 'centre':
        result = await pool.query(`
          SELECT 
            c.id,
            c.name as centre_name,
            v.name as village_name,
            a.name as arrondissement_name,
            com.name as commune_name,
            dept.name as departement_name,
            COALESCE(SUM(vote.inscrits), 0) as total_inscrits,
            COALESCE(SUM(vote.votants), 0) as total_votants,
            COALESCE(SUM(vote.bulletins_nuls), 0) as total_bulletins_nuls,
            COALESCE(SUM(vote.bulletins_blancs), 0) as total_bulletins_blancs,
            COALESCE(SUM(vote.suffrages_exprimes), 0) as total_suffrages_exprimes,
            COALESCE(SUM(vote.voix_wadagni_talata), 0) as total_wadagni_talata,
            COALESCE(SUM(vote.voix_hounkpe_hounwanou), 0) as total_hounkpe_hounwanou
          FROM centre c
          JOIN village v ON c.village_id = v.id
          JOIN arrondissement a ON v.arrondissement_id = a.id
          JOIN commune com ON a.commune_id = com.id
          JOIN departement dept ON com.departement_id = dept.id
          LEFT JOIN vote vote ON vote.centre_id = c.id
          ${search ? `WHERE c.name ILIKE $1 OR v.name ILIKE $1 OR a.name ILIKE $1 OR com.name ILIKE $1 OR dept.name ILIKE $1` : ''}
          GROUP BY c.id, c.name, v.name, a.name, com.name, dept.name
          ORDER BY dept.name, com.name, a.name, v.name, c.name
          ${search ? '' : 'LIMIT 500'}
        `, search ? [`%${search}%`] : []);
        break;

      case 'bureau':
        result = await pool.query(`
          SELECT 
            bv.id,
            bv.name as bureau_name,
            c.name as centre_name,
            v.name as village_name,
            a.name as arrondissement_name,
            com.name as commune_name,
            dept.name as departement_name,
            COALESCE(SUM(vote.inscrits), 0) as total_inscrits,
            COALESCE(SUM(vote.votants), 0) as total_votants,
            COALESCE(SUM(vote.bulletins_nuls), 0) as total_bulletins_nuls,
            COALESCE(SUM(vote.bulletins_blancs), 0) as total_bulletins_blancs,
            COALESCE(SUM(vote.suffrages_exprimes), 0) as total_suffrages_exprimes,
            COALESCE(SUM(vote.voix_wadagni_talata), 0) as total_wadagni_talata,
            COALESCE(SUM(vote.voix_hounkpe_hounwanou), 0) as total_hounkpe_hounwanou
          FROM bureau_vote bv
          JOIN centre c ON bv.centre_id = c.id
          JOIN village v ON c.village_id = v.id
          JOIN arrondissement a ON v.arrondissement_id = a.id
          JOIN commune com ON a.commune_id = com.id
          JOIN departement dept ON com.departement_id = dept.id
          LEFT JOIN vote vote ON vote.bureau_vote_id = bv.id
          ${search ? `WHERE bv.name ILIKE $1 OR c.name ILIKE $1 OR v.name ILIKE $1 OR a.name ILIKE $1 OR com.name ILIKE $1 OR dept.name ILIKE $1` : ''}
          GROUP BY bv.id, bv.name, c.name, v.name, a.name, com.name, dept.name
          ORDER BY dept.name, com.name, a.name, v.name, c.name, bv.name
          ${search ? '' : 'LIMIT 500'}
        `, search ? [`%${search}%`] : []);
        break;

      case 'agent':
        result = await pool.query(`
          SELECT 
            vote.full_name,
            vote.id,
            vote.created_at,
            dept.name as departement_name,
            com.name as commune_name,
            a.name as arrondissement_name,
            v.name as village_name,
            c.name as centre_name,
            bv.name as bureau_name,
            vote.inscrits,
            vote.votants,
            vote.voix_wadagni_talata,
            vote.voix_hounkpe_hounwanou
          FROM vote
          JOIN departement dept ON vote.departement_id = dept.id
          JOIN commune com ON vote.commune_id = com.id
          JOIN arrondissement a ON vote.arrondissement_id = a.id
          JOIN village v ON vote.village_id = v.id
          JOIN centre c ON vote.centre_id = c.id
          LEFT JOIN bureau_vote bv ON vote.bureau_vote_id = bv.id
          ${search ? `WHERE vote.full_name ILIKE $1 OR dept.name ILIKE $1 OR com.name ILIKE $1 OR a.name ILIKE $1 OR v.name ILIKE $1 OR c.name ILIKE $1 OR bv.name ILIKE $1` : ''}
          ORDER BY vote.created_at DESC
          LIMIT 1000
        `, search ? [`%${search}%`] : []);
        break;

      default:
        return NextResponse.json({ error: 'Invalid filter' }, { status: 400 });
    }

    return NextResponse.json({
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching table data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = rateLimitMiddleware(handler);

