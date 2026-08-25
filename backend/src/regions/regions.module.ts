import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegionsService } from './regions.service';
import { RegionsController } from './regions.controller';
import { RegionEntity, GameServerInventoryEntity } from './region.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RegionEntity, GameServerInventoryEntity])],
  providers: [RegionsService],
  controllers: [RegionsController],
  exports: [RegionsService],
})
export class RegionsModule {}
