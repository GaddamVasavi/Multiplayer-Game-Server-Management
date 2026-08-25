import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessageEntity, ChatChannel } from './chat.entity';
import { UserEntity } from '../database/entities/user.entity';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly profanityList = ['badword', 'cheat', 'hack', 'scam', 'abuse'];

  constructor(
    @InjectRepository(ChatMessageEntity)
    private readonly chatRepository: Repository<ChatMessageEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async saveMessage(
    senderId: string,
    message: string,
    channel: ChatChannel = ChatChannel.GLOBAL,
    roomId?: string,
    recipientId?: string,
  ): Promise<ChatMessageEntity> {
    if (!message || message.trim().length === 0) {
      throw new BadRequestException('Message body cannot be empty');
    }

    if (message.length > 500) {
      throw new BadRequestException('Message length exceeds maximum 500 characters limit');
    }

    // Basic profanity check
    const isFlagged = this.profanityList.some((word) =>
      message.toLowerCase().includes(word),
    );

    const chatMsg = this.chatRepository.create({
      senderId,
      message: isFlagged ? '*** [Content Flagged by Auto-Mod] ***' : message.trim(),
      channel,
      roomId,
      recipientId,
      isFlagged,
    });

    const saved = await this.chatRepository.save(chatMsg);
    this.logger.log(`Chat Message Saved [${channel}] from Sender ${senderId}`);
    return saved;
  }

  async getRecentMessages(
    channel: ChatChannel = ChatChannel.GLOBAL,
    roomId?: string,
    limit: number = 50,
  ): Promise<ChatMessageEntity[]> {
    const queryBuilder = this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.sender', 'sender')
      .where('chat.channel = :channel', { channel });

    if (roomId) {
      queryBuilder.andWhere('chat.roomId = :roomId', { roomId });
    }

    return queryBuilder
      .orderBy('chat.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }
}
