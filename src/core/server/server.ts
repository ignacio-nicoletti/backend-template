import 'dotenv/config'
import app from './app'
import logger from '../../shared/utils/logger'

// Validación de variables de entorno
const validateEnv = () => {
  const requiredEnvVars = ['PORT']
  let missingVars = false

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      logger.error(`❌ Variable de entorno faltante: ${envVar}`)
      missingVars = true
    }
  })

  if (missingVars) {
    logger.error('⛔ Servidor no puede iniciar por configuración faltante')
    process.exit(1)
  }
}

const startServer = () => {
  validateEnv()

  const PORT = process.env.PORT || 3000
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Servidor corriendo en el puerto: ${PORT}`)
    logger.info(`🌎 Entorno: ${process.env.NODE_ENV || 'development'}`)
    logger.info(`📅 Iniciado el: ${new Date().toLocaleString()}`)
  })

  // Manejadores de errores del servidor
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`⚠️  El puerto ${PORT} está en uso`)
    } else {
      logger.error('💥 Error crítico en el servidor:', error)
    }
    process.exit(1)
  })

  const shutdown = (signal: string) => {
    logger.info(`🛑 Recibida señal ${signal}. Cerrando servidor...`)
    server.close(() => {
      logger.info('✅ Servidor cerrado correctamente')
      process.exit(0)
    })

    setTimeout(() => {
      logger.error('⏳ Timeout: Forzando cierre del servidor')
      process.exit(1)
    }, 10000)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}
// Manejo global de errores
process.on('unhandledRejection', (reason: Error) => {
  logger.error('⚠️  Unhandled Rejection:', reason instanceof Error ? reason.stack : reason)
})

process.on('uncaughtException', (error: Error) => {
  logger.error('💥 Uncaught Exception:', error.stack)
  process.exit(1)
})

// Inicio del servidor
try {
  startServer()
} catch (error) {
  logger.error('⛔ Error durante el inicio:', error instanceof Error ? error.stack : error)
  process.exit(1)
}
