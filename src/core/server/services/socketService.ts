// src/services/socketService.ts
import { Server, Socket } from "socket.io";

export default function GeneralSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`Usuario conectado: ${socket.id}`);

    // Unirse a una room
    // socket.on("join_room", (data: { roomId: string; game: string }) => {
    //   const { roomId, game } = data;
    //   const roomName = `${game}-${roomId}`;
      
    //   socket.join(roomName);
    //   console.log(`Usuario ${socket.id} se unió a la room: ${roomName}`);
      
    //   socket.emit("joined_room", { 
    //     roomId, 
    //     game, 
    //     message: "Te has unido a la room exitosamente" 
    //   });
    // });

    // // Dejar una room
    // socket.on("leave_room", (data: { roomId: string; game: string }) => {
    //   const { roomId, game } = data;
    //   const roomName = `${game}-${roomId}`;
      
    //   socket.leave(roomName);
    //   console.log(`Usuario ${socket.id} dejó la room: ${roomName}`);
    // });

    // Manejar desconexión
    socket.on("disconnect", () => {
      console.log(`Usuario desconectado: ${socket.id}`);
    });
  });
}