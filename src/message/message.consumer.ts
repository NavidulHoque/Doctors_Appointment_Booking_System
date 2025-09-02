import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessageService } from './message.service';
import { KafkaProducerService } from 'src/kafka/kafka.producer.service';
import { SocketGateway } from 'src/socket/socket.gateway';

@Controller()
export class MessageConsumer {
  private readonly MAX_RETRIES = 5;

  constructor(
    private readonly messageService: MessageService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly socketGateway: SocketGateway,
  ) {}

  @MessagePattern('message-topic')
  async handleMessage(@Payload() payload: any) {
    const { action, data, retryCount, traceId } = payload;

    try {
      switch (action) {
        case 'create':
          return await this.messageService.createMessage(data, traceId);

        case 'update':
          return await this.messageService.updateMessage(data, traceId);

        case 'delete':
          return await this.messageService.deleteMessage(data, traceId);

        default:
          console.log(`[⚠️] traceId=${traceId} Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`[❌] traceId=${traceId} Consumer error: ${error.message}`);

      if (retryCount < this.MAX_RETRIES) {
        try {
          await this.kafkaProducer.triggerEvent('message-topic', {
            traceId,
            action,
            data,
            retryCount: retryCount + 1,
          });
        } catch (error) {
          console.error(
            `[❌] traceId=${traceId} producer error trying to increase retryCount in consumer issue: ${error.message}`,
          );

          this.socketGateway.sendResponse(data.senderId, {
            traceId,
            status: 'failed',
            message: `Message ${action} request failed after 5 retries. Error: ${error}`,
          });
        }
      } else {
        try {
          await this.kafkaProducer.triggerEvent('message-dlq', {
            traceId,
            action,
            data,
            error: error.message,
            failedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error(
            `[❌] traceId=${traceId} producer error trying to insert the corrupted message into DLQ: ${error.message}`,
          );

          this.socketGateway.sendResponse(data.senderId, {
            traceId,
            status: 'failed',
            message: `Message ${action} request failed after ${this.MAX_RETRIES} retries. Error: ${error}`,
          });
        }
      }
    }
  }

  @MessagePattern('message-dlq')
  async handleFailedMessages(@Payload() payload: any) {
    const { action, data, error, traceId } = payload;

    console.error(`[❌] traceId=${traceId} message consumed by dlq: ${error.message}`);

    this.socketGateway.sendResponse(data.senderId, {
      traceId,
      status: 'failed',
      message: `Message ${action} request failed after ${this.MAX_RETRIES} retries. Error: ${error}`,
    });
  }
}
