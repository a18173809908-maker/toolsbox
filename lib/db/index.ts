import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

type DbClient = ReturnType<typeof drizzle<typeof schema>>;

const databaseUrl = process.env.DATABASE_URL;

export const db: DbClient = databaseUrl
  ? drizzle(neon(databaseUrl), { schema })
  : new Proxy({} as DbClient, {
      get() {
        throw new Error('DATABASE_URL is not set');
      },
    });

export * from './schema';
