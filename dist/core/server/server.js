'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
require('dotenv/config')
const app_1 = __importDefault(require('./app'))
const logger_1 = __importDefault(require('../../shared/utils/logger'))
// Validación de variables de entorno
const validateEnv = () => {
  const requiredEnvVars = ['PORT']
  let missingVars = false
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      logger_1.default.error(`❌ Variable de entorno faltante: ${envVar}`)
      missingVars = true
    }
  })
  if (missingVars) {
    logger_1.default.error('⛔ Servidor no puede iniciar por configuración faltante')
    process.exit(1)
  }
}
const startServer = () => {
  validateEnv()
  const PORT = process.env.PORT || 3000
  const server = app_1.default.listen(PORT, () => {
    logger_1.default.info(`🚀 Servidor corriendo en el puerto: ${PORT}`)
    logger_1.default.info(`🌎 Entorno: ${process.env.NODE_ENV || 'development'}`)
    logger_1.default.info(`📅 Iniciado el: ${new Date().toLocaleString()}`)
  })
  // Manejadores de errores del servidor
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger_1.default.error(`⚠️  El puerto ${PORT} está en uso`)
    } else {
      logger_1.default.error('💥 Error crítico en el servidor:', error)
    }
    process.exit(1)
  })
  const shutdown = (signal) => {
    logger_1.default.info(`🛑 Recibida señal ${signal}. Cerrando servidor...`)
    server.close(() => {
      logger_1.default.info('✅ Servidor cerrado correctamente')
      process.exit(0)
    })
    setTimeout(() => {
      logger_1.default.error('⏳ Timeout: Forzando cierre del servidor')
      process.exit(1)
    }, 10000)
  }
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}
// Manejo global de errores
process.on('unhandledRejection', (reason) => {
  logger_1.default.error('⚠️  Unhandled Rejection:', reason instanceof Error ? reason.stack : reason)
})
process.on('uncaughtException', (error) => {
  logger_1.default.error('💥 Uncaught Exception:', error.stack)
  process.exit(1)
})
// Inicio del servidor
try {
  startServer()
} catch (error) {
  logger_1.default.error(
    '⛔ Error durante el inicio:',
    error instanceof Error ? error.stack : error
  )
  process.exit(1)
}
