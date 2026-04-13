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
    const pool = getPool();

    // Statistiques nationales totales
    const nationalStats = await pool.query(`
      SELECT 
        COALESCE(SUM(inscrits), 0) as total_inscrits,
        COALESCE(SUM(votants), 0) as total_votants,
        COALESCE(SUM(bulletins_nuls), 0) as total_bulletins_nuls,
        COALESCE(SUM(bulletins_blancs), 0) as total_bulletins_blancs,
        COALESCE(SUM(suffrages_exprimes), 0) as total_suffrages_exprimes,
        COALESCE(SUM(voix_wadagni_talata), 0) as total_wadagni_talata,
        COALESCE(SUM(voix_hounkpe_hounwanou), 0) as total_hounkpe_hounwanou
      FROM vote
    `);

    const stats = nationalStats.rows[0];
    const totalInscrits = parseInt(stats.total_inscrits, 10);
    const totalVotants = parseInt(stats.total_votants, 10);
    const tauxParticipation = totalInscrits > 0 
      ? ((totalVotants / totalInscrits) * 100).toFixed(2)
      : '0.00';
    const totalVoix = parseInt(stats.total_wadagni_talata, 10) + parseInt(stats.total_hounkpe_hounwanou, 10);

    // Stats par duo (WADAGNI - TALATA et HOUNKPE - HOUNWANOU)
    const duoStatsWithPercent = [
      {
        id: 1,
        label: 'WADAGNI - TALATA',
        total: parseInt(stats.total_wadagni_talata, 10),
        percentage: totalVoix > 0 
          ? ((parseInt(stats.total_wadagni_talata, 10) / totalVoix) * 100).toFixed(2)
          : '0.00',
      },
      {
        id: 2,
        label: 'HOUNKPE - HOUNWANOU',
        total: parseInt(stats.total_hounkpe_hounwanou, 10),
        percentage: totalVoix > 0
          ? ((parseInt(stats.total_hounkpe_hounwanou, 10) / totalVoix) * 100).toFixed(2)
          : '0.00',
      },
    ];

    // Retourner seulement les données synthèse (pour les diagrammes et totaux)
    // Les données détaillées du tableau seront chargées à la demande via /api/dashboard/table
    return NextResponse.json({
      national: {
        totalInscrits,
        totalVotants,
        tauxParticipation,
        totalBulletinsNuls: parseInt(stats.total_bulletins_nuls, 10),
        totalBulletinsBlancs: parseInt(stats.total_bulletins_blancs, 10),
        totalSuffragesExprimes: parseInt(stats.total_suffrages_exprimes, 10),
        totalVoix,
        byDuo: duoStatsWithPercent,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = rateLimitMiddleware(handler);

