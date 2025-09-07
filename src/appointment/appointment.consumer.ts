import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { KafkaProducerService } from 'src/kafka/kafka.producer.service';
import { SocketGateway } from 'src/socket/socket.gateway';
import { AppointmentService } from './appointment.service';

@Controller()
export class AppointmentConsumer {
  private readonly logger = new Logger(AppointmentConsumer.name);

  private readonly MAX_RETRIES = 5;

  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly socketGateway: SocketGateway
  ) { }

  @MessagePattern('appointment-topic')
  async handleMessage(@Payload() payload: Record<string, any>) {
    const { action, data, retryCount, traceId } = payload;

    try {
      switch (action) {
        case 'create':
          return await this.appointmentService.createAppointment(data, traceId);

        case 'update':
          return await this.appointmentService.updateAppointment(data, traceId);

        default:
          this.logger.warn(`⚠️ traceId=${traceId} Unknown action: ${action}`);
      }
    }

    catch (error) {
      this.logger.error(`❌ Consumer error, Reason: ${error.message} with traceId=${traceId}`);

      if (retryCount < this.MAX_RETRIES) {
        try {
          await this.kafkaProducer.triggerEvent('appointment-topic', {
            traceId,
            action,
            data,
            retryCount: retryCount + 1,
          });
        }

        catch (error) {
          this.logger.error(
            `❌ Producer error trying to increase retryCount in consumer issue, Reason: ${error.message} with traceId=${traceId}`,
          );

          this.socketGateway.sendResponse(data.userId, {
            traceId,
            status: 'failed',
            message: `Appointment ${action} request failed. Reason: ${error.message}`,
          });
        }
      }

      else {
        try {
          await this.kafkaProducer.triggerEvent('appointment-dlq', {
            traceId,
            action,
            data,
            error: { // when Kafka serializes/deserializes payloads, the error object gets lost as it is not enumerable property
                message: error.message 
            },
            failedAt: new Date(),
          });
        }

        catch (error) {
          this.logger.error(
            `❌ Producer error trying to insert the corrupted message into DLQ, Reason: ${error.message} with traceId=${traceId}`,
          );

          this.socketGateway.sendResponse(data.userId, {
            traceId,
            status: 'failed',
            message: `Appointment ${action} request failed after ${this.MAX_RETRIES} retries. Reason: ${error.message}`,
          });
        }
      }
    }
  }

  @MessagePattern('appointment-dlq')
  async handleFailedAppointments(@Payload() payload: Record<string, any>) {
    const { action, data, error, traceId } = payload;

    this.logger.warn(`⚠️ Appointment consumed by dlq, Reason: ${error.message} with traceId=${traceId}`);

    this.socketGateway.sendResponse(data.userId, {
      traceId,
      status: 'failed',
      message: `Appointment ${action} request failed after ${this.MAX_RETRIES} retries. Reason: ${error.message}`
    });
  }
}
