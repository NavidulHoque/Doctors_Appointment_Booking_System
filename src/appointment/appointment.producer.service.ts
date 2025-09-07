import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { KafkaProducerService } from 'src/kafka/kafka.producer.service';

@Injectable()
export class AppointmentProducerService {
  private readonly logger = new Logger(AppointmentProducerService.name);
  
  constructor(private readonly kafkaProducer: KafkaProducerService) {}

  async sendCreateAppointment(data: Record<string, any>, traceId: string) {
    try {
      await this.kafkaProducer.triggerEvent('appointment-topic', {
        traceId,
        action: 'create',
        data,
        retryCount: 0,
      });

      return { status: 'queued', message: 'Appointment creation request sent to Kafka' };
    } 
    
    catch (error) {
      this.logger.error(`❌ Kafka sendCreateAppointment failed: ${error.message} with traceId=${traceId}`);
      throw new ServiceUnavailableException('Kafka unavailable, try again later');
    }
  }

  async sendUpdateAppointment(data: Record<string, any>, traceId: string) {
    try {
      await this.kafkaProducer.triggerEvent('appointment-topic', {
        traceId,
        action: 'update',
        data,
        retryCount: 0,
      });

      return { status: 'queued', message: 'Appointment update request sent to Kafka' };
    } 
    
    catch (error) {
      this.logger.error(`❌ Kafka sendUpdateAppointment failed: ${error.message} with traceId=${traceId}`);
      throw new ServiceUnavailableException('Kafka unavailable, try again later');
    }
  }
}
