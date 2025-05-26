// notification.gateway.ts
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

export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients: Map<string, string> = new Map(); // userId -> socketId

  handleConnection(client: any) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.clients.set(userId, client.id);
    }
  }

  handleDisconnect(client: any) {
    const userId = [...this.clients.entries()].find(([, socketId]) => socketId === client.id)?.[0];
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
}
