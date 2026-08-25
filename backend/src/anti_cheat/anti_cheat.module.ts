import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AntiCheatService } from './anti_cheat.service';
import { AntiCheatController } from './anti_cheat.controller';
import { AntiCheatViolationEntity } from './anti_cheat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AntiCheatViolationEntity])],
  providers: [AntiCheatService],
  controllers: [AntiCheatController],
  exports: [AntiCheatService],
})
export class AntiCheatModule {}
