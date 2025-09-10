import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { KafkaProducerService } from 'src/kafka/kafka.producer.service';

@Injectable()
export class DoctorProducerService {
  private readonly logger = new Logger(DoctorProducerService.name);
  
  constructor(private readonly kafkaProducer: KafkaProducerService) {}

  async sendUpdateDoctor(data: Record<string, any>, traceId: string) {
    try {
      await this.kafkaProducer.triggerEvent('doctor-topic', {
        traceId,
        action: 'update',
        data,
        retryCount: 0,
      });

      return { status: 'queued', message: 'Doctor update request sent to Kafka' };
    } 
    
    catch (error) {
      this.logger.error(`❌ Kafka sendUpdateDoctor failed: ${error.message} with traceId=${traceId}`);
      throw new ServiceUnavailableException('Kafka unavailable, try again later');
    }
  }

  async sendCreateStripeAccount(data: Record<string, any>, traceId: string) {
    try {
      await this.kafkaProducer.triggerEvent('doctor-topic', {
        traceId,
        action: 'create-stripe-account',
        data,
        retryCount: 0,
      });

      return { status: 'queued', message: 'Stripe account creation request sent to Kafka' };
    } 
    
    catch (error) {
      this.logger.error(`❌ Kafka sendCreateStripeAccount failed: ${error.message} with traceId=${traceId}`);
      throw new ServiceUnavailableException('Kafka unavailable, try again later');
    }
  }

  async sendActivateStripeAccount(data: Record<string, any>, traceId: string) {
    try {
      await this.kafkaProducer.triggerEvent('doctor-topic', {
        traceId,
        action: 'activate-stripe-account',
        data,
        retryCount: 0,
      });

      return { status: 'queued', message: 'Stripe account activation request sent to Kafka' };
    } 
    
    catch (error) {
      this.logger.error(`❌ Kafka sendActivateStripeAccount failed: ${error.message} with traceId=${traceId}`);
      throw new ServiceUnavailableException('Kafka unavailable, try again later');
    }
  }

  async sendDeleteDoctor(data: Record<string, any>, traceId: string) {
    try {
      await this.kafkaProducer.triggerEvent('doctor-topic', {
        traceId,
        action: 'delete',
        data,
        retryCount: 0,
      });

      return { status: 'queued', message: 'Doctor delete request sent to Kafka' };
    } 
    
    catch (error) {
      this.logger.error(`❌ Kafka sendDeleteDoctor failed: ${error.message} with traceId=${traceId}`);
      throw new ServiceUnavailableException('Kafka unavailable, try again later');
    }
  }
}
