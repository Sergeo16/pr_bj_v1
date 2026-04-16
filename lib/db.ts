import { Pool, PoolConfig } from 'pg';

let pool: Pool | null = null;

function buildPoolConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const onVercel = process.env.VERCEL === '1';
  const max = parseInt(
    process.env.PG_POOL_MAX || (onVercel ? '10' : '20'),
    10
  );

  return {
    connectionString,
    max,
    idleTimeoutMillis: onVercel ? 10_000 : 30_000,
    connectionTimeoutMillis: onVercel ? 10_000 : 5000,
  };
}

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(buildPoolConfig());

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

