import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisasterRecoveryService } from './disaster_recovery.service';
import { DisasterRecoveryController } from './disaster_recovery.controller';
import { DatabaseBackupEntity, RecoveryEventEntity } from './disaster_recovery.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DatabaseBackupEntity, RecoveryEventEntity])],
  providers: [DisasterRecoveryService],
  controllers: [DisasterRecoveryController],
  exports: [DisasterRecoveryService],
})
export class DisasterRecoveryModule {}
