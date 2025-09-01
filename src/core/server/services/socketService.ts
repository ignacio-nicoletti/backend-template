// src/services/socketService.ts
import { Server, Socket } from "socket.io";
import { DBConfig } from "../../../shared/types";


export class SocketService {
  private io: Server;
  private dbConfig: DBConfig;

  constructor(io: Server, dbConfig: DBConfig) {
    this.io = io;
    this.dbConfig = dbConfig;
    this.setupSocketEvents();
  }

  private setupSocketEvents(): void {
    this.io.on("connection", (socket: Socket) => {
      console.log("✅ Usuario conectado:", socket.id);

      this.setupConnectionMiddleware(socket);
      this.setupRoomEvents(socket);
      this.setupMessageEvents(socket);
      this.setupNotificationEvents(socket);
      this.setupUtilityEvents(socket);
      this.setupDisconnectionHandling(socket);
    });
  }

  private setupConnectionMiddleware(socket: Socket): void {
    // Middleware para autenticación de sockets
    socket.use((packet, next) => {
      console.log("📦 Evento recibido:", packet[0], "desde:", socket.id);
      
      // Aquí puedes agregar lógica de autenticación
      // Ejemplo: verificar token JWT
      const token = socket.handshake.auth.token;
      if (token) {
        // Validar token aquí
        console.log("🔐 Token recibido:", token);
      }
      
      next();
    });
  }

  private setupRoomEvents(socket: Socket): void {
    // Unirse a una sala
    socket.on("join_room", (data: { room: string; userId?: string }) => {
      this.handleJoinRoom(socket, data);
    });

    // Dejar una sala
    socket.on("leave_room", (room: string) => {
      this.handleLeaveRoom(socket, room);
    });

    // Listar salas disponibles
    socket.on("list_rooms", () => {
      this.handleListRooms(socket);
    });
  }

  private setupMessageEvents(socket: Socket): void {
    // Mensajes de chat
    socket.on("send_message", (data: { 
      room: string; 
      message: string; 
      user: string;
      type?: string;
    }) => {
      this.handleSendMessage(socket, data);
    });

    // Mensajes privados
    socket.on("send_private_message", (data: {
      toUserId: string;
      message: string;
      fromUser: string;
    }) => {
      this.handlePrivateMessage(socket, data);
    });
  }

  private setupNotificationEvents(socket: Socket): void {
    // Notificaciones
    socket.on("send_notification", (data: {
      userId: string;
      type: string;
      message: string;
      data?: any;
    }) => {
      this.handleSendNotification(data);
    });

    // Suscribirse a notificaciones
    socket.on("subscribe_notifications", (userId: string) => {
      this.handleSubscribeNotifications(socket, userId);
    });
  }

  private setupUtilityEvents(socket: Socket): void {
    // Heartbeat/ping
    socket.on("heartbeat", () => {
      this.handleHeartbeat(socket);
    });

    // Obtener información del socket
    socket.on("get_socket_info", () => {
      this.handleGetSocketInfo(socket);
    });
  }

  private setupDisconnectionHandling(socket: Socket): void {
    socket.on("disconnect", (reason: string) => {
      this.handleDisconnect(socket, reason);
    });

    socket.on("error", (error: Error) => {
      this.handleSocketError(socket, error);
    });
  }

  // Handlers específicos
  private handleJoinRoom(socket: Socket, data: { room: string; userId?: string }): void {
    const { room, userId } = data;
    socket.join(room);
    console.log(`👥 Usuario ${socket.id} se unió a la sala: ${room}`);
    
    socket.to(room).emit("user_joined", { 
      socketId: socket.id, 
      userId: userId,
      timestamp: new Date().toISOString()
    });
  }

  private handleLeaveRoom(socket: Socket, room: string): void {
    socket.leave(room);
    console.log(`🚪 Usuario ${socket.id} dejó la sala: ${room}`);
    
    socket.to(room).emit("user_left", { 
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
  }

  private handleListRooms(socket: Socket): void {
    const rooms = Array.from(this.io.sockets.adapter.rooms.keys())
      .filter(room => !this.io.sockets.adapter.sids.get(room)?.has(room)); // Filtrar salas personales

    socket.emit("rooms_list", {
      rooms: rooms,
      count: rooms.length,
      timestamp: new Date().toISOString()
    });
  }

  private handleSendMessage(socket: Socket, data: { 
    room: string; 
    message: string; 
    user: string;
    type?: string;
  }): void {
    console.log("💬 Mensaje recibido:", data);
    
    this.io.to(data.room).emit("receive_message", {
      ...data,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
      messageId: Date.now().toString()
    });
  }

  private handlePrivateMessage(socket: Socket, data: {
    toUserId: string;
    message: string;
    fromUser: string;
  }): void {
    console.log("🔒 Mensaje privado:", data);
    
    // Enviar a un usuario específico por su ID de socket o user ID
    this.io.emit(`private_message_${data.toUserId}`, {
      ...data,
      fromSocketId: socket.id,
      timestamp: new Date().toISOString()
    });
  }

  private handleSendNotification(data: {
    userId: string;
    type: string;
    message: string;
    data?: any;
  }): void {
    console.log("🔔 Notificación:", data);
    
    this.io.emit(`notification_${data.userId}`, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  private handleSubscribeNotifications(socket: Socket, userId: string): void {
    console.log("📩 Usuario suscrito a notificaciones:", userId);
    
    socket.join(`notifications_${userId}`);
    socket.emit("subscription_confirmed", {
      userId: userId,
      timestamp: new Date().toISOString()
    });
  }

  private handleHeartbeat(socket: Socket): void {
    socket.emit("heartbeat_response", { 
      timestamp: new Date().toISOString(),
      status: "alive",
      socketId: socket.id
    });
  }

  private handleGetSocketInfo(socket: Socket): void {
    const socketInfo = {
      id: socket.id,
      connected: socket.connected,
      rooms: Array.from(socket.rooms),
      handshake: socket.handshake,
      timestamp: new Date().toISOString()
    };

    socket.emit("socket_info", socketInfo);
  }

  private handleDisconnect(socket: Socket, reason: string): void {
    console.log("❌ Usuario desconectado:", socket.id, "Razón:", reason);
    
    // Notificar a todas las salas que el usuario dejó
    socket.rooms.forEach(room => {
      if (room !== socket.id) {
        socket.to(room).emit("user_disconnected", { 
          socketId: socket.id,
          timestamp: new Date().toISOString(),
          reason: reason
        });
      }
    });
  }

  private handleSocketError(socket: Socket, error: Error): void {
    console.error("❌ Error de Socket:", error);
    
    socket.emit("socket_error", {
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }

  // Métodos públicos para usar desde otras partes de la aplicación
  public broadcastToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  public sendToUser(userId: string, event: string, data: any): void {
    this.io.emit(`${event}_${userId}`, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  public getConnectedUsersCount(): number {
    return this.io.engine.clientsCount;
  }

  public getActiveRooms(): string[] {
    return Array.from(this.io.sockets.adapter.rooms.keys())
      .filter(room => !this.io.sockets.adapter.sids.get(room)?.has(room));
  }
}

export default SocketService;