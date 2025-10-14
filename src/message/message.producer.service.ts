import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { KafkaProducerService } from 'src/kafka';

@Injectable()
export class MessageProducerService {
  private readonly logger = new Logger(MessageProducerService.name);
  
  constructor(private readonly kafkaProducer: KafkaProducerService) {}

  async sendCreateMessage(data: Record<string, any>, traceId: string) {
    try {
      await this.kafkaProducer.triggerEvent('message-topic', {
        traceId,
        action: 'create',
        data,
        retryCount: 0,
      });

      return { status: 'queued', message: 'Message creation request sent to Kafka' };
    } 
    
    catch (error) {
      this.logger.error(`❌ Kafka sendCreateMessage failed: ${error.message} with traceId=${traceId}`);
      throw new ServiceUnavailableException('Kafka unavailable, try again later');
    }
  }

  async sendUpdateMessage(data: Record<string, any>, traceId: string) {
    try {
      await this.kafkaProducer.triggerEvent('message-topic', {
        traceId,
        action: 'update',
        data,
        retryCount: 0,
      });

      return { status: 'queued', message: 'Message update request sent to Kafka' };
    } 
    
    catch (error) {
      this.logger.error(`❌ Kafka sendUpdateMessage failed: ${error.message} with traceId=${traceId}`);
      throw new ServiceUnavailableException('Kafka unavailable, try again later');
    }
  }

  async sendDeleteMessage(data: Record<string, any>, traceId: string) {
    try {
      await this.kafkaProducer.triggerEvent('message-topic', {
        traceId,
        action: 'delete',
        data,
        retryCount: 0,
      });

      return { status: 'queued', message: 'Message delete request sent to Kafka' };
    } 
    
    catch (error) {
      this.logger.error(`❌ Kafka sendDeleteMessage failed: ${error.message} with traceId=${traceId}`);
      throw new ServiceUnavailableException('Kafka unavailable, try again later');
    }
  }
}
