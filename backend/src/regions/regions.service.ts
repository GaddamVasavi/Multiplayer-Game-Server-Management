import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegionEntity, GameServerInventoryEntity, RegionStatus } from './region.entity';

@Injectable()
export class RegionsService {
  private readonly logger = new Logger(RegionsService.name);

  constructor(
    @InjectRepository(RegionEntity)
    private readonly regionRepository: Repository<RegionEntity>,
    @InjectRepository(GameServerInventoryEntity)
    private readonly serverInventoryRepository: Repository<GameServerInventoryEntity>,
  ) {}

  async getAllRegions(): Promise<RegionEntity[]> {
    const regions = await this.regionRepository.find({
      relations: ['servers'],
      order: { code: 'ASC' },
    });

    if (regions.length === 0) {
      // Seed default regions if empty
      const defaultRegions = [
        { code: 'US-EAST', name: 'N. Virginia (US East)', datacenterLocation: 'us-east-1', maxCapacityPlayers: 5000 },
        { code: 'US-WEST', name: 'Oregon (US West)', datacenterLocation: 'us-west-2', maxCapacityPlayers: 3000 },
        { code: 'EU-CENTRAL', name: 'Frankfurt (Europe)', datacenterLocation: 'eu-central-1', maxCapacityPlayers: 4000 },
        { code: 'AP-SOUTH', name: 'Mumbai (Asia Pacific)', datacenterLocation: 'ap-south-1', maxCapacityPlayers: 2000 },
      ];

      for (const r of defaultRegions) {
        const created = this.regionRepository.create({
          ...r,
          isActive: true,
          isMaintenanceMode: false,
          status: RegionStatus.ONLINE,
        });
        await this.regionRepository.save(created);
      }
      return this.regionRepository.find({ relations: ['servers'] });
    }

    return regions;
  }

  async registerRegion(code: string, name: string, datacenterLocation: string, maxCapacityPlayers: number = 5000): Promise<RegionEntity> {
    const existing = await this.regionRepository.findOne({ where: { code } });
    if (existing) {
      throw new ConflictException(`Region code '${code}' already exists`);
    }

    const region = this.regionRepository.create({
      code: code.toUpperCase(),
      name,
      datacenterLocation,
      maxCapacityPlayers,
      isActive: true,
      isMaintenanceMode: false,
      status: RegionStatus.ONLINE,
    });

    const saved = await this.regionRepository.save(region);
    this.logger.log(`Registered new global region: ${saved.name} [${saved.code}]`);
    return saved;
  }

  async setMaintenanceMode(regionId: string, isMaintenanceMode: boolean): Promise<RegionEntity> {
    const region = await this.regionRepository.findOne({ where: { id: regionId } });
    if (!region) {
      throw new NotFoundException('Region not found');
    }

    region.isMaintenanceMode = isMaintenanceMode;
    region.status = isMaintenanceMode ? RegionStatus.MAINTENANCE : RegionStatus.ONLINE;
    const updated = await this.regionRepository.save(region);
    this.logger.warn(`Region ${region.code} maintenance mode updated to ${isMaintenanceMode}`);
    return updated;
  }
}
