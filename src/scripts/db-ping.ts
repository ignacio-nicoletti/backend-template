// test-connection.ts
import { checkDBHealth, connectDB } from '../core/database'
import logger from '../shared/utils/logger'

async function testConnection() {
  try {
    logger.info('🧪 Probando conexión a la base de datos...')

    // Intenta conectar
    const connected = await connectDB()
    if (connected) {
      logger.info('✅ Conexión exitosa a la base de datos')
    }

    // Verifica el estado de salud
    const health = await checkDBHealth()
    logger.info('📊 Estado de salud de la DB:', health)
  } catch (error) {
    logger.error('❌ Error en la conexión:', error)
  }
}

testConnection()
