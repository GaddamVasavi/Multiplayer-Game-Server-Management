import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartyService } from './party.service';
import { PartyController } from './party.controller';
import { PartyEntity, PartyMemberEntity } from './party.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PartyEntity, PartyMemberEntity])],
  providers: [PartyService],
  controllers: [PartyController],
  exports: [PartyService],
})
export class PartyModule {}
