import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommonModule } from 'src/common/common.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, CommonModule, ConfigModule],
  controllers: [ReviewController],
  providers: [ReviewService]
})
export class ReviewModule {}
