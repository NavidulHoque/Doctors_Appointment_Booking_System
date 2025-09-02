import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { KafkaProducerService } from 'src/kafka/kafka.producer.service';

@Injectable()
export class MessageProducerService {
  constructor(private readonly kafkaProducer: KafkaProducerService) {}

  async sendCreateMessage(data: any, traceId: string) {
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
      console.error(`[❌] traceId=${traceId} Kafka sendCreateMessage failed:`, error.message);
      throw new ServiceUnavailableException('Kafka unavailable, try again later');
    }
  }

  async sendUpdateMessage(data: any, traceId: string) {
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
      console.error(`[❌] traceId=${traceId} Kafka sendUpdateMessage failed:`, error.message);
      throw new ServiceUnavailableException('Kafka unavailable, try again later');
    }
  }

  async sendDeleteMessage(data: any, traceId: string) {
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
      console.error(`[❌] traceId=${traceId} Kafka sendDeleteMessage failed:`, error.message);
      throw new ServiceUnavailableException('Kafka unavailable, try again later');
    }
  }
}
