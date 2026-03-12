import "server-only";

import { Pool, type PoolConfig, type QueryResultRow } from "pg";

import { readDatabaseEnv } from "@/lib/env";

let pool: Pool | null = null;

function createPoolConfig(): PoolConfig {
  const env = readDatabaseEnv();

  return {
    connectionString: env.PG_URL,
    max: 10,
    ssl: {
      rejectUnauthorized: false,
    },
    application_name: "macro-frontend",
  };
}

export function getReadOnlyPool(): Pool {
  if (!pool) {
    pool = new Pool(createPoolConfig());
  }

  return pool;
}

export async function queryReadOnly<T extends QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<T[]> {
  const db = getReadOnlyPool();
  const env = readDatabaseEnv();
  const client = await db.connect();

  try {
    await client.query(`SET search_path TO "${env.MACRO_DB_SCHEMA}", public`);
    const result = await client.query<T>(text, values);
    return result.rows;
  } finally {
    client.release();
  }
}
