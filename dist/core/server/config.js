'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.config = void 0
require('dotenv/config')
const env = process.env.NODE_ENV || 'development'
const dbConfig = {
  development: {
    host: process.env.DEV_DB_HOST || 'localhost',
    port: Number(process.env.DEV_DB_PORT) || 5432,
    user: process.env.DEV_DB_USER || 'postgres',
    password: process.env.DEV_DB_PASSWORD || '',
    database: process.env.DEV_DB_NAME || '',
  },
  production: {
    host: process.env.PROD_DB_HOST || '',
    port: Number(process.env.PROD_DB_PORT) || 5432,
    user: process.env.PROD_DB_USER || '',
    password: process.env.PROD_DB_PASSWORD || '',
    database: process.env.PROD_DB_NAME || '',
  },
  test: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '12345678',
    database: 'test_db',
  },
}
// const encryptionKey = process.env.ENCRYPTION_KEY;
// if (!encryptionKey) {
//   throw new Error("ENCRYPTION_KEY no está configurada en las variables de entorno");
// }
exports.config = {
  env,
  port: Number(process.env.PORT) || 3000,
  db: dbConfig[env],
  // encryptionKey, // Ahora es required
}
