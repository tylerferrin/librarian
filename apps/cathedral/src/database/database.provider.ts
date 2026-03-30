import { ConfigService } from '@nestjs/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

export const DRIZZLE_TOKEN = Symbol('DRIZZLE_TOKEN');

export type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

export const DrizzleProvider = {
  provide: DRIZZLE_TOKEN,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): DrizzleDb => {
    const url = configService.getOrThrow<string>('DATABASE_URL');
    const client = postgres(url);
    return drizzle(client, { schema });
  },
};
