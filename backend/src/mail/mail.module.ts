import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { InGameMailEntity } from './mail.entity';
import { PlayerProfileEntity } from '../database/entities/player-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InGameMailEntity, PlayerProfileEntity])],
  providers: [MailService],
  controllers: [MailController],
  exports: [MailService],
})
export class MailModule {}
