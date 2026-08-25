import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartyEntity, PartyMemberEntity } from './party.entity';

@Injectable()
export class PartyService {
  private readonly logger = new Logger(PartyService.name);

  constructor(
    @InjectRepository(PartyEntity)
    private readonly partyRepository: Repository<PartyEntity>,
    @InjectRepository(PartyMemberEntity)
    private readonly memberRepository: Repository<PartyMemberEntity>,
  ) {}

  async createParty(leaderId: string): Promise<PartyEntity> {
    const existingMember = await this.memberRepository.findOne({ where: { userId: leaderId } });
    if (existingMember) {
      throw new ConflictException('Player is already in a party');
    }

    const party = this.partyRepository.create({
      leaderId,
      maxMembers: 4,
      isInQueue: false,
    });

    const savedParty = await this.partyRepository.save(party);

    const leaderMember = this.memberRepository.create({
      partyId: savedParty.id,
      userId: leaderId,
      isReady: true,
    });

    await this.memberRepository.save(leaderMember);
    this.logger.log(`Created new party ${savedParty.id} with leader ${leaderId}`);
    return savedParty;
  }

  async getPartyByUserId(userId: string): Promise<PartyEntity | null> {
    const member = await this.memberRepository.findOne({
      where: { userId },
      relations: ['party', 'party.members', 'party.members.user'],
    });
    return member ? member.party : null;
  }

  async joinParty(partyId: string, userId: string): Promise<PartyEntity> {
    const party = await this.partyRepository.findOne({
      where: { id: partyId },
      relations: ['members'],
    });

    if (!party) {
      throw new NotFoundException('Party not found');
    }

    if (party.members.length >= party.maxMembers) {
      throw new BadRequestException('Party is full');
    }

    const member = this.memberRepository.create({
      partyId: party.id,
      userId,
      isReady: false,
    });

    await this.memberRepository.save(member);
    this.logger.log(`Player ${userId} joined party ${partyId}`);

    return this.getPartyByUserId(userId) as Promise<PartyEntity>;
  }

  async leaveParty(userId: string): Promise<void> {
    const member = await this.memberRepository.findOne({ where: { userId }, relations: ['party'] });
    if (!member) return;

    await this.memberRepository.remove(member);

    // If leader left, delete or transfer party
    if (member.party.leaderId === userId) {
      const remaining = await this.memberRepository.find({ where: { partyId: member.partyId } });
      if (remaining.length === 0) {
        await this.partyRepository.delete(member.partyId);
      } else {
        member.party.leaderId = remaining[0].userId;
        await this.partyRepository.save(member.party);
      }
    }
  }
}
