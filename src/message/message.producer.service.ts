import { Injectable } from "@nestjs/common";
import { HandleErrorsService } from "src/common/handleErrors.service";
import { KafkaProducerService } from "src/kafka/kafka.producer.service";

@Injectable()
export class MessageProducerService {

    constructor(
        private readonly kafkaProducer: KafkaProducerService,
        private readonly handleErrorsService: HandleErrorsService
    ) { }

    async sendCreateMessage(data: any) {
        try {
            await this.kafkaProducer.triggerEvent('message-topic', {
                action: 'create',
                data,
                retryCount: 0,
            });

            return { status: "queued", message: "Message creation request sent to Kafka" };
        }

        catch (error) {
            // producer exhausted after 5 retries
            this.handleErrorsService.handleError(error)
        }
    }

    async sendUpdateMessage(data: any) {
        try {
            await this.kafkaProducer.triggerEvent('message-topic', {
                action: 'update',
                data,
                retryCount: 0,
            });

            return { status: "queued", message: "Message update request sent to Kafka" };
        }

        catch (error) {
            // producer exhausted after 5 retries
            this.handleErrorsService.handleError(error)
        }
    }

    async sendDeleteMessage(data: any) {
        try {
            await this.kafkaProducer.triggerEvent('message-topic', {
                action: 'delete',
                data,
                retryCount: 0,
            });

            return { status: "queued", message: "Message delete request sent to Kafka" };
        }

        catch (error) {
            // producer exhausted after 5 retries
            this.handleErrorsService.handleError(error)
        }
    }
}
