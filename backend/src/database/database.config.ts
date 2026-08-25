import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import Redis from 'ioredis';

export const getPostgresConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'nexus_arena_db',
  entities: [__dirname + '/entities/*.entity{.ts,.js}'],
  synchronize: true, // Set to false in production with proper migrations
  logging: process.env.NODE_ENV === 'development',
});

export const createRedisClient = (): Redis => {
  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;

  return new Redis({
    host,
    port,
    password,
    lazyConnect: true,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });
};
