import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessageService } from './message.service';
import { KafkaProducerService } from 'src/kafka/kafka.producer.service';
import { HandleErrorsService } from 'src/common/handleErrors.service';
import { SocketService } from 'src/common/socket.service';

@Controller()
export class MessageConsumer {
  private readonly MAX_RETRIES = 5;

  constructor(
    private readonly messageService: MessageService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly handleErrorsService: HandleErrorsService,
    private readonly socketService: SocketService
  ) { }

  @MessagePattern('message-topic')
  async handleMessage(@Payload() payload: any) {
    const { action, data, retryCount } = payload

    try {
      switch (action) {
        case 'create':
          return await this.messageService.createMessage(data);

        case 'update':
          return await this.messageService.updateMessage(data);

        case 'delete':
          return await this.messageService.deleteMessage(data);

        default:
          const error = {
            message: `Unknown action: ${action}`,
          }
          
          this.handleErrorsService.handleError(error);
      }
    }

    catch (error) {

      if (retryCount < this.MAX_RETRIES) {
        try {
          // Retry with incremented retryCount
          await this.kafkaProducer.triggerEvent('message-topic', {
            action,
            data,
            retryCount: retryCount + 1,
          });
        }

        catch (error) {
          // producer failure after 5 retries
          this.socketService.sendResponse(data.senderId, { status: "failed", message: `Message ${action} request failed after 5 retries. Error: ${error}` });
        }
      }

      else {
        // Move to DLQ(dead letter queue) after max retries
        try {
          await this.kafkaProducer.triggerEvent('message-dlq', {
            action,
            data,
            error: error.message,
            failedAt: new Date().toISOString(),
          });
        }

        catch (error) {
          // producer failure after 5 retries
          this.socketService.sendResponse(data.senderId, { status: "failed", message: `Message ${action} request failed after ${this.MAX_RETRIES} retries. Error: ${error}` });
        }
      }
    }
  }

  @MessagePattern('message-dlq')
  async handleFailedMessages(@Payload() payload: any) {
    const { action, data, error } = payload
    this.socketService.sendResponse(data.senderId, { status: "failed", message: `Message ${action} request failed after ${this.MAX_RETRIES} retries. Error: ${error}` });
  }
}
