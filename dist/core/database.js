'use strict'
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        var desc = Object.getOwnPropertyDescriptor(m, k)
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k]
            },
          }
        }
        Object.defineProperty(o, k2, desc)
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        o[k2] = m[k]
      })
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v })
      }
    : function (o, v) {
        o['default'] = v
      })
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = []
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k
          return ar
        }
      return ownKeys(o)
    }
    return function (mod) {
      if (mod && mod.__esModule) return mod
      var result = {}
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i])
      __setModuleDefault(result, mod)
      return result
    }
  })()
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.checkDBHealth = exports.disconnectDB = exports.connectDB = exports.db = void 0
const node_postgres_1 = require('drizzle-orm/node-postgres')
const pg_1 = require('pg')
const schema = __importStar(require('./database.schemas'))
const logger_1 = __importDefault(require('../shared/utils/logger'))
const config_1 = require('./server/config')
// Configuración del pool usando config.db
const poolConfig = {
  host: config_1.config.db.host,
  port: config_1.config.db.port,
  user: config_1.config.db.user,
  password: config_1.config.db.password,
  database: config_1.config.db.database,
  max: 20, // Número máximo de clientes en el pool
  idleTimeoutMillis: 30000, // Tiempo máximo de inactividad
  connectionTimeoutMillis: 2000, // Tiempo máximo para establecer conexión
  ...(config_1.config.env === 'production' && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
}
const pool = new pg_1.Pool(poolConfig)
// Manejo de eventos del pool
pool.on('connect', (client) => {
  logger_1.default.debug('🔄 Nueva conexión establecida con la base de datos')
})
pool.on('error', (err) => {
  logger_1.default.error('💥 Error inesperado en el pool de conexiones:', err)
})
exports.db = (0, node_postgres_1.drizzle)(pool, { schema })
// Conexión y desconexión
const connectDB = async () => {
  try {
    const client = await pool.connect()
    logger_1.default.info('✅ Conectado a la base de datos PostgreSQL')
    client.release()
    return true
  } catch (error) {
    logger_1.default.error('❌ Error al conectar a la base de datos:', error)
    throw error
  }
}
exports.connectDB = connectDB
const disconnectDB = async () => {
  try {
    await pool.end()
    logger_1.default.info('🚪 Conexión con la base de datos cerrada')
    return true
  } catch (error) {
    logger_1.default.error('❌ Error al desconectar de la base de datos:', error)
    throw error
  }
}
exports.disconnectDB = disconnectDB
// Health check mejorado
const checkDBHealth = async () => {
  let client = null
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
exports.checkDBHealth = checkDBHealth
