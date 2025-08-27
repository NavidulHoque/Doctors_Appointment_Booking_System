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

  constructor() {
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

    console.log("Sending notification to userId:", userId, "with socketId:", socketId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }

  sendCreatedMessage(userId: string, data: any) {
    const socketId = this.clients.get(userId);

    console.log('Sending created message to userId:', userId, "with socketId:", socketId);
    if (socketId) {
      this.server.to(socketId).emit('createMessage', data);
    }
  }

  sendUpdatedMessage(userId: string, data: any) {
    const socketId = this.clients.get(userId);

    console.log('Sending updated message to userId:', userId, "with socketId:", socketId);
    if (socketId) {
      this.server.to(socketId).emit('updateMessage', data);
    }
  }

  sendDeletedMessage(userId: string, data: any) {
    const socketId = this.clients.get(userId);

    console.log('Sending deleted message to userId:', userId, "with socketId:", socketId);
    if (socketId) {
      this.server.to(socketId).emit('deleteMessage', data);
    }
  }

  sendResponse(userId: string, response: any) {
    const socketId = this.clients.get(userId);

    console.log("Sending response to userId:", userId, "with socketId:", socketId);
    if (socketId) {
      this.server.to(socketId).emit('response', response);
    }
  }
}
