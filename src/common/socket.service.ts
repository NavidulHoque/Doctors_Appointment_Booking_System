import { Injectable } from "@nestjs/common";
import { SocketGateway } from "src/socket/socket.gateway";

@Injectable()
export class SocketService{
    constructor(
        private readonly socketGateway: SocketGateway,
    ){}

    sendNotification(userId: string, notification: any){
        this.socketGateway.sendNotification(userId, notification);
    }

    sendMessage(userId: string, message: any){
        this.socketGateway.sendMessage(userId, message);
    }

    sendResponse(userId: string, response: any){
        this.socketGateway.sendResponse(userId, response);
    }
}