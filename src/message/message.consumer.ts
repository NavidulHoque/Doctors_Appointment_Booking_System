import { Injectable } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessageService } from './message.service';
import { KafkaProducerService } from 'src/kafka/kafka.producer.service';
import { HandleErrorsService } from 'src/common/handleErrors.service';

@Injectable()
export class MessageConsumer {
  private readonly MAX_RETRIES = 5;

  constructor(
    private readonly messageService: MessageService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly handleErrorsService: HandleErrorsService
  ) { }

  @MessagePattern('message-topic')
  async handleMessage(@Payload() payload: any) {
    const { action, data, retryCount } = payload

    try {
      switch (action) {
        case 'create':
          console.log(`Handling create message action with data: ${JSON.stringify(data)}`);
          return await this.messageService.createMessage(data);

        case 'update':
          return this.messageService.updateMessage(data);

        case 'delete':
          return this.messageService.deleteMessage(data);

        default:
          this.handleErrorsService.handleError(`Server side error: Unknown action: ${action}`);
      }
    }

    catch (error) {

      if (retryCount < this.MAX_RETRIES) {
        // Retry with incremented retryCount
        await this.kafkaProducer.triggerEvent('message-topic', {
          action,
          data,
          retryCount: retryCount + 1,
        });
      } 
      
      else {
        // Move to DLQ(dead letter queue) after max retries
        await this.kafkaProducer.triggerEvent('message-dlq', {
          action,
          data,
          error: error.message,
          failedAt: new Date().toISOString(),
        });
      }
    }
  }

  @MessagePattern('message-dlq')
  async handleFailedMessages(@Payload() payload: any) {
    console.error('Message moved to DLQ:', payload);
    // alert admins
  }
}
