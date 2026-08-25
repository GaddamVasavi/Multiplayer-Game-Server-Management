import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FailoverService } from './failover.service';
import { FailoverController } from './failover.controller';
import { FailoverEventEntity } from './failover.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FailoverEventEntity])],
  providers: [FailoverService],
  controllers: [FailoverController],
  exports: [FailoverService],
})
export class FailoverModule {}
