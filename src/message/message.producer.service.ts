import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { KafkaProducerService } from "src/kafka/kafka.producer.service";

@Injectable()
export class MessageProducerService {

    constructor(
        private readonly kafkaProducer: KafkaProducerService
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
            console.error("Kafka sendCreateMessage failed:", error.message);
            throw new ServiceUnavailableException("Kafka unavailable, try again later");
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
            console.error("Kafka sendUpdateMessage failed:", error.message);
            throw new ServiceUnavailableException("Kafka unavailable, try again later");
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
            console.error("Kafka sendDeleteMessage failed:", error.message);
            throw new ServiceUnavailableException("Kafka unavailable, try again later");
        }
    }
}
