import 'dotenv/config'
import { AppConfig, DBConfig } from '../../shared/types'

const env = (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development'

const dbConfig: Record<typeof env, DBConfig> = {
  development: {
    host: process.env.DEV_DB_HOST || 'localhost',
    port: Number(process.env.DEV_DB_PORT) || 5432,
    user: process.env.DEV_DB_USER || 'postgres',
    password: process.env.DEV_DB_PASSWORD || '',
    database: process.env.DEV_DB_NAME || '',
    whiteList: process.env.WHITE_LIST_FRONTEND?.split(',') || [],
  },
  production: {
    host: process.env.PROD_DB_HOST || '',
    port: Number(process.env.PROD_DB_PORT) || 5432,
    user: process.env.PROD_DB_USER || '',
    password: process.env.PROD_DB_PASSWORD || '',
    database: process.env.PROD_DB_NAME || '',
    whiteList: process.env.WHITE_LIST_FRONTEND?.split(',') || [],
  },
  test: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '12345678',
    database: 'test_db',
    whiteList: process.env.WHITE_LIST_FRONTEND?.split(',') || [],
  },
}

const encryptionKey = process.env.ENCRYPTION_KEY
if (!encryptionKey) {
  throw new Error('ENCRYPTION_KEY no está configurada en las variables de entorno')
}

export const config: AppConfig = {
  env,
  port: Number(process.env.PORT) || 3000,
  db: dbConfig[env],
  encryptionKey,
}
