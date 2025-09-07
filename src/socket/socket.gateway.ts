import { Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(SocketGateway.name);

  @WebSocketServer()
  server: Server;

  constructor() {
    this.logger.log('SocketGateway initialized');
  }

  private clients: Map<string, string> = new Map(); // userId -> socketId

  handleConnection(client: any) { // handles connection with frontend

    const userId = client.handshake.query.userId as string;

    this.logger.log('✅ Connected userId:', userId);
    this.logger.log('🆔 Client ID:', client.id);

    if (userId) {
      this.clients.set(userId, client.id);
    }
  }

  handleDisconnect(client: any) {
    const userId = [...this.clients.entries()].find(([, socketId]) => socketId === client.id)?.[0];

    this.logger.log('✅ Disconnected userId:', userId);
    if (userId) {
      this.clients.delete(userId);
    }
  }

  sendNotification(userId: string, traceId: string, notification: Record<string, any>) {
    const socketId = this.clients.get(userId);

    this.logger.log("📢 Sending notification to userId:", userId, "with socketId:", socketId, "with traceId:", traceId);

    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
      this.logger.log('✅ Notification sent to userId:', userId, "with traceId:", traceId);
    }

    else{
      this.logger.error('❌ Notification not sent to userId:', userId, "with traceId:", traceId);
    }
  }

  sendCreatedMessage(userId: string, traceId: string, data: Record<string, any>) {
    const socketId = this.clients.get(userId);

    this.logger.log('📢 Sending created message to userId:', userId, "with socketId:", socketId, "with traceId:", traceId);

    if (socketId) {
      this.server.to(socketId).emit('createMessage', data);
      this.logger.log('✅ Message sent to userId:', userId, "with traceId:", traceId);
    }

    else{
      this.logger.error('❌ Message not sent to userId:', userId, "with traceId:", traceId);
    }
  }

  sendUpdatedMessage(userId: string, traceId: string, data: Record<string, any>) {
    const socketId = this.clients.get(userId);

    this.logger.log('📢 Sending updated message to userId:', userId, "with socketId:", socketId, "with traceId:", traceId);

    if (socketId) {
      this.server.to(socketId).emit('updateMessage', data);
      this.logger.log('✅ Message sent to userId:', userId, "with traceId:", traceId);
    }

    else{
      this.logger.error('❌ Message not sent to userId:', userId, "with traceId:", traceId);
    }
  }

  sendDeletedMessage(userId: string, traceId: string, data: Record<string, any>) {
    const socketId = this.clients.get(userId);

    this.logger.log('📢 Sending deleted message to userId:', userId, "with socketId:", socketId, "with traceId:", traceId);

    if (socketId) {
      this.server.to(socketId).emit('deleteMessage', data);
      this.logger.log('✅ Message sent to userId:', userId, "with traceId:", traceId);
    }

    else{
      this.logger.error('❌ Message not sent to userId:', userId, "with traceId:", traceId);
    }
  }

  sendResponse(userId: string, response: Record<string, any>) {
    const socketId = this.clients.get(userId);

    this.logger.log("📢 Sending response to userId:", userId, "with socketId:", socketId, "with traceId:", response.traceId);

    if (socketId) {
      this.server.to(socketId).emit('response', response);
      this.logger.log('✅ Response sent to userId:', userId, "with traceId:", response.traceId);
    }

    else{
      this.logger.error('❌ Response not sent to userId:', userId, "with traceId:", response.traceId);
    }
  }
}
