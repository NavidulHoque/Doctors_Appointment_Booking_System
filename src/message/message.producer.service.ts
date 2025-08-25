import { Injectable } from "@nestjs/common";
import { KafkaProducerService } from "src/kafka/kafka.producer.service";

@Injectable()
export class MessageProducerService {

    constructor(private readonly kafkaProducer: KafkaProducerService) { }

    async sendCreateMessage(data: any) {
        await this.kafkaProducer.triggerEvent('message-topic', { 
            action: 'create', 
            data,
            retryCount: 0, 
        });

        return { status: "queued", message: "Message creation request sent to Kafka" };
    }

    async sendUpdateMessage(data: any) {
        await this.kafkaProducer.triggerEvent('message-topic', { 
            action: 'update', 
            data,
            retryCount: 0,
        });
    }

    async sendDeleteMessage(data: any) {
        await this.kafkaProducer.triggerEvent('message-topic', { 
            action: 'delete', 
            data,
            retryCount: 0, 
        });
    }
}
