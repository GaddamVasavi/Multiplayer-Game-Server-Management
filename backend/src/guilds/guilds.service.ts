import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuildEntity, GuildMemberEntity, GuildRole } from './guild.entity';

@Injectable()
export class GuildsService {
  private readonly logger = new Logger(GuildsService.name);

  constructor(
    @InjectRepository(GuildEntity)
    private readonly guildRepository: Repository<GuildEntity>,
    @InjectRepository(GuildMemberEntity)
    private readonly memberRepository: Repository<GuildMemberEntity>,
  ) {}

  async createGuild(leaderId: string, name: string, tag: string, description: string): Promise<GuildEntity> {
    const existingMember = await this.memberRepository.findOne({ where: { userId: leaderId } });
    if (existingMember) {
      throw new ConflictException('Player is already a member of a guild');
    }

    const existingGuild = await this.guildRepository.findOne({
      where: [{ name }, { tag }],
    });
    if (existingGuild) {
      throw new ConflictException('Guild name or tag is already taken');
    }

    const guild = this.guildRepository.create({
      name,
      tag: tag.toUpperCase(),
      description,
      leaderId,
      guildElo: 1200,
      maxMembers: 20,
    });

    const savedGuild = await this.guildRepository.save(guild);

    const leaderMember = this.memberRepository.create({
      guildId: savedGuild.id,
      userId: leaderId,
      role: GuildRole.LEADER,
    });

    await this.memberRepository.save(leaderMember);
    this.logger.log(`Created Guild '${savedGuild.name}' [${savedGuild.tag}] with Leader ${leaderId}`);
    return savedGuild;
  }

  async getGuildLeaderboard(): Promise<GuildEntity[]> {
    return this.guildRepository.find({
      order: { guildElo: 'DESC' },
      take: 50,
      relations: ['leader'],
    });
  }

  async joinGuild(guildId: string, userId: string): Promise<GuildEntity> {
    const existingMember = await this.memberRepository.findOne({ where: { userId } });
    if (existingMember) {
      throw new ConflictException('Player is already in a guild');
    }

    const guild = await this.guildRepository.findOne({
      where: { id: guildId },
      relations: ['members'],
    });

    if (!guild) {
      throw new NotFoundException('Guild not found');
    }

    if (guild.members.length >= guild.maxMembers) {
      throw new BadRequestException('Guild is full');
    }

    const member = this.memberRepository.create({
      guildId: guild.id,
      userId,
      role: GuildRole.MEMBER,
    });

    await this.memberRepository.save(member);
    this.logger.log(`Player ${userId} joined Guild ${guild.name}`);

    return this.guildRepository.findOne({
      where: { id: guildId },
      relations: ['members', 'members.user'],
    }) as Promise<GuildEntity>;
  }
}
