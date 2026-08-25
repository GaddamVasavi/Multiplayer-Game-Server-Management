import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendEntity, FriendStatus } from './friend.entity';
import { UserEntity } from '../database/entities/user.entity';

@Injectable()
export class FriendsService {
  private readonly logger = new Logger(FriendsService.name);

  constructor(
    @InjectRepository(FriendEntity)
    private readonly friendRepository: Repository<FriendEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async sendFriendRequest(requesterId: string, addresseeUsername: string): Promise<FriendEntity> {
    const addressee = await this.userRepository.findOne({ where: { username: addresseeUsername } });
    if (!addressee) {
      throw new NotFoundException(`User with username '${addresseeUsername}' not found`);
    }

    if (addressee.id === requesterId) {
      throw new BadRequestException('You cannot send a friend request to yourself');
    }

    const existing = await this.friendRepository.findOne({
      where: [
        { requesterId, addresseeId: addressee.id },
        { requesterId: addressee.id, addresseeId: requesterId },
      ],
    });

    if (existing) {
      throw new ConflictException('Friend request or friendship already exists');
    }

    const request = this.friendRepository.create({
      requesterId,
      addresseeId: addressee.id,
      status: FriendStatus.PENDING,
    });

    const saved = await this.friendRepository.save(request);
    this.logger.log(`Friend request sent from ${requesterId} to ${addressee.id}`);
    return saved;
  }

  async getFriendsList(userId: string): Promise<UserEntity[]> {
    const friendships = await this.friendRepository.find({
      where: [
        { requesterId: userId, status: FriendStatus.ACCEPTED },
        { addresseeId: userId, status: FriendStatus.ACCEPTED },
      ],
      relations: ['requester', 'addressee', 'requester.profile', 'addressee.profile'],
    });

    return friendships.map((f) => (f.requesterId === userId ? f.addressee : f.requester));
  }

  async respondToRequest(userId: string, requestId: string, accept: boolean): Promise<void> {
    const request = await this.friendRepository.findOne({ where: { id: requestId, addresseeId: userId } });
    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    if (accept) {
      request.status = FriendStatus.ACCEPTED;
      await this.friendRepository.save(request);
      this.logger.log(`Friend request ${requestId} accepted by ${userId}`);
    } else {
      await this.friendRepository.remove(request);
      this.logger.log(`Friend request ${requestId} declined by ${userId}`);
    }
  }
}
