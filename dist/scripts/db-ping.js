'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
// test-connection.ts
const database_1 = require('../core/database')
const logger_1 = __importDefault(require('../shared/utils/logger'))
async function testConnection() {
  try {
    logger_1.default.info('🧪 Probando conexión a la base de datos...')
    // Intenta conectar
    const connected = await (0, database_1.connectDB)()
    if (connected) {
      logger_1.default.info('✅ Conexión exitosa a la base de datos')
    }
    // Verifica el estado de salud
    const health = await (0, database_1.checkDBHealth)()
    logger_1.default.info('📊 Estado de salud de la DB:', health)
  } catch (error) {
    logger_1.default.error('❌ Error en la conexión:', error)
  }
}
testConnection()
