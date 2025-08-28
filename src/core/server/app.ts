import express from 'express'
import { setupSwagger } from './swagger'
const app = express()

app.use(express.json())

setupSwagger(app)
// Ejemplo de ruta



app.get('/', (req, res) => {
  res.send('API funcionando')
})

export default app
