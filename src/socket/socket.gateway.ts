import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})

export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(){
    console.log('SocketGateway initialized');
  }

  private clients: Map<string, string> = new Map(); // userId -> socketId

  handleConnection(client: any) { // handles connection with frontend

    const userId = client.handshake.query.userId as string;

    console.log('✅ Connected userId:', userId);
    console.log('🆔 Client ID:', client.id);

    if (userId) {
      this.clients.set(userId, client.id);
    }
  }

  handleDisconnect(client: any) {
    const userId = [...this.clients.entries()].find(([, socketId]) => socketId === client.id)?.[0];
    
    console.log('✅ Disconnected userId:', userId);
    if (userId) {
      this.clients.delete(userId);
    }
  }

  sendNotification(userId: string, notification: any) {
    const socketId = this.clients.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }

  sendMessage(userId: string, message: any) {
    const socketId = this.clients.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('message', message);
    }
  }

  sendResponse(userId: string, response: any) {
    const socketId = this.clients.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('response', response);
    }
  }
}
