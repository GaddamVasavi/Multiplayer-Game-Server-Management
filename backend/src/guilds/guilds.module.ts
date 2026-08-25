import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildsService } from './guilds.service';
import { GuildsController } from './guilds.controller';
import { GuildEntity, GuildMemberEntity } from './guild.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GuildEntity, GuildMemberEntity])],
  providers: [GuildsService],
  controllers: [GuildsController],
  exports: [GuildsService],
})
export class GuildsModule {}
