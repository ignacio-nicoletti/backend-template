'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const child_process_1 = require('child_process')
try {
  console.log('Generando migraciones...')
  ;(0, child_process_1.execSync)('npm run db:generate', { stdio: 'inherit' })
  console.log('Aplicando migraciones...')
  ;(0, child_process_1.execSync)('npm run db:migrate', { stdio: 'inherit' })
  console.log('✅ Migración completada')
} catch (error) {
  console.error('❌ Error en la migración:', error)
  process.exit(1)
}
