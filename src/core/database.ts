import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool, PoolClient } from 'pg'
import * as schema from './database.schemas'

import logger from '../shared/utils/logger'
import { config } from './server/config'

// Configuración del pool usando config.db
const poolConfig = {
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  max: 20, // Número máximo de clientes en el pool
  idleTimeoutMillis: 30000, // Tiempo máximo de inactividad
  connectionTimeoutMillis: 2000, // Tiempo máximo para establecer conexión
  ...(config.env === 'production' && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
}

const pool = new Pool(poolConfig)

// Manejo de eventos del pool
pool.on('connect', (client: PoolClient) => {
  logger.debug('🔄 Nueva conexión establecida con la base de datos')
})

pool.on('error', (err: Error) => {
  logger.error('💥 Error inesperado en el pool de conexiones:', err)
})

export const db = drizzle(pool, { schema })

// Conexión y desconexión
export const connectDB = async (): Promise<boolean> => {
  try {
    const client = await pool.connect()
    logger.info('✅ Conectado a la base de datos PostgreSQL')
    client.release()
    return true
  } catch (error) {
    logger.error('❌ Error al conectar a la base de datos:', error)
    throw error
  }
}

export const disconnectDB = async (): Promise<boolean> => {
  try {
    await pool.end()
    logger.info('🚪 Conexión con la base de datos cerrada')
    return true
  } catch (error) {
    logger.error('❌ Error al desconectar de la base de datos:', error)
    throw error
  }
}

// Health check mejorado
export const checkDBHealth = async () => {
  let client: PoolClient | null = null
  try {
    client = await pool.connect()
    const startTime = Date.now()
    const { rows } = await client.query('SELECT NOW() as current_time')
    const pingTime = Date.now() - startTime

    return {
      status: 'healthy',
      timestamp: rows[0].current_time,
      ping: `${pingTime}ms`,
      details: 'Database connection established',
      connections: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
      },
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }
  } finally {
    if (client) client.release()
  }
}
