import { Module } from '@nestjs/common';
import { KafkaProducerService } from './kafka.service';

@Module({
  providers: [KafkaProducerService]
})
export class KafkaModule {}
