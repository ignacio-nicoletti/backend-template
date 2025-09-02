import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import { createServer } from 'http'
import type { Response } from 'express'
import GeneralSocket from './services/socketService'

const app = express()
const server = createServer(app)

app.use(express.json())
app.use(cors())

// Configuración de Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Permite todos los orígenes (ajusta en producción)
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
})

// Pasar la instancia de io al socket service
GeneralSocket(io)

// Ruta de health check
app.get('/health', (res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  })
})

// Exportar el server para que server.ts lo use
export { server, io }
export default app
