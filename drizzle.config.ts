import { config } from './src/core/server/config'
import 'dotenv/config'
// Validación de variables de entorno
const requiredEnvVars = [
  'DEV_DB_HOST',
  'DEV_DB_PORT',
  'DEV_DB_USER',
  'DEV_DB_PASSWORD',
  'DEV_DB_NAME',
]
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is missing in environment variables`)
  }
}

const isDevelopment = process.env.NODE_ENV === 'development'

export default {
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',

  // Configuración mejorada de conexión
  dbCredentials: {
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    ...(config.env === 'production' ? { ssl: { rejectUnauthorized: false } } : { ssl: false }),
  },

  // Configuración de migraciones
  verbose: isDevelopment, // Más logs en desarrollo
  strict: !isDevelopment, // Estricto solo en producción
  breakpoints: isDevelopment, // Permite puntos de ruptura en desarrollo
}
