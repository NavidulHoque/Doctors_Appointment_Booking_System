import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { KafkaProducerService } from 'src/kafka/kafka.producer.service';
import { SocketGateway } from 'src/socket/socket.gateway';
import { DoctorService } from './doctor.service';

@Controller()
export class DoctorConsumer {
    private readonly logger = new Logger(DoctorConsumer.name);

    private readonly MAX_RETRIES = 5;

    constructor(
        private readonly doctorService: DoctorService,
        private readonly kafkaProducer: KafkaProducerService,
        private readonly socketGateway: SocketGateway
    ) { }

    @MessagePattern('doctor-topic')
    async handleDoctor(@Payload() payload: Record<string, any>) {
        const { action, data, retryCount, traceId } = payload;

        try {
            switch (action) {

                case 'update':
                    return await this.doctorService.updateDoctor(data, traceId);

                case 'create-stripe-account':
                    return await this.doctorService.createStripeAccount(data, traceId);

                case 'activate-stripe-account':
                    return await this.doctorService.activateStripeAccount(data, traceId);

                case 'delete':
                    return await this.doctorService.deleteDoctor(data, traceId);

                default:
                    this.logger.warn(`⚠️ traceId=${traceId} Unknown action: ${action}`);
            }
        }

        catch (error) {
            this.logger.error(`❌ Consumer error, Reason: ${error.message} with traceId=${traceId}`);

            if (retryCount < this.MAX_RETRIES) {
                try {
                    await this.kafkaProducer.triggerEvent('doctor-topic', {
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
                        message: `Doctor ${action} request failed. Reason: ${error.message}`,
                    });
                }
            }

            else {
                try {
                    await this.kafkaProducer.triggerEvent('doctor-dlq', {
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
                        message: `Doctor ${action} request failed after ${this.MAX_RETRIES} retries. Reason: ${error.message}`,
                    });
                }
            }
        }
    }

    @MessagePattern('doctor-dlq')
    async handleFailedDoctors(@Payload() payload: Record<string, any>) {
        const { action, data, error, traceId } = payload;

        this.logger.warn(`⚠️ Doctor ${action} consumed by dlq, Reason: ${error.message} with traceId=${traceId}`);

        this.socketGateway.sendResponse(data.userId, {
            traceId,
            status: 'failed',
            message: `Doctor ${action} request failed after ${this.MAX_RETRIES} retries. Reason: ${error.message}`
        });
    }
}
