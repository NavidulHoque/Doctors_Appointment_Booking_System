import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessageService } from './message.service';
import { KafkaProducerService } from 'src/kafka/kafka.producer.service';
import { SocketGateway } from 'src/socket/socket.gateway';

@Controller()
export class MessageConsumer {
  private readonly logger = new Logger(MessageConsumer.name);

  private readonly MAX_RETRIES = 5;

  constructor(
    private readonly messageService: MessageService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly socketGateway: SocketGateway,
  ) { }

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
          this.logger.warn(`⚠️ traceId=${traceId} Unknown action: ${action}`);
      }
    }

    catch (error) {
      this.logger.error(`❌ Consumer error: ${error.message} with traceId=${traceId}`);

      if (retryCount < this.MAX_RETRIES) {
        try {
          await this.kafkaProducer.triggerEvent('message-topic', {
            traceId,
            action,
            data,
            retryCount: retryCount + 1,
          });
        }

        catch (error) {
          this.logger.error(
            `❌ Producer error trying to increase retryCount in consumer issue: ${error.message} with traceId=${traceId}`,
          );

          this.socketGateway.sendResponse(data.senderId, {
            traceId,
            status: 'failed',
            message: `Message ${action} request failed after 5 retries. Error: ${error}`,
          });
        }
      }

      else {
        try {
          await this.kafkaProducer.triggerEvent('message-dlq', {
            traceId,
            action,
            data,
            error: error.message,
            failedAt: new Date().toISOString(),
          });
        }

        catch (error) {
          this.logger.error(
            `❌ Producer error trying to insert the corrupted message into DLQ: ${error.message} with traceId=${traceId}`,
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

    this.logger.error(`❌ Message consumed by dlq: ${error.message} with traceId=${traceId}`);

    this.socketGateway.sendResponse(data.senderId, {
      traceId,
      status: 'failed',
      message: `Message ${action} request failed after ${this.MAX_RETRIES} retries. Error: ${error}`,
    });
  }
}
