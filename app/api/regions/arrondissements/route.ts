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
    const communeId = searchParams.get('communeId');

    if (!communeId) {
      return NextResponse.json(
        { error: 'communeId is required' },
        { status: 400 }
      );
    }

    const pool = getPool();
    const result = await pool.query(
      'SELECT id, name FROM arrondissement WHERE commune_id = $1 ORDER BY name',
      [parseInt(communeId, 10)]
    );

    return NextResponse.json({ arrondissements: result.rows });
  } catch (error) {
    console.error('Error fetching arrondissements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = rateLimitMiddleware(handler);

