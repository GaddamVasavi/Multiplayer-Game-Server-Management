import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InGameMailEntity } from './mail.entity';
import { PlayerProfileEntity } from '../database/entities/player-profile.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @InjectRepository(InGameMailEntity)
    private readonly mailRepository: Repository<InGameMailEntity>,
    @InjectRepository(PlayerProfileEntity)
    private readonly profileRepository: Repository<PlayerProfileEntity>,
  ) {}

  async sendSystemMail(recipientId: string, subject: string, body: string, attachmentCoins: number = 0): Promise<InGameMailEntity> {
    const mail = this.mailRepository.create({
      recipientId,
      subject,
      body,
      attachmentCoins,
      isRead: false,
      isClaimed: false,
    });

    const saved = await this.mailRepository.save(mail);
    this.logger.log(`Sent system mail '${subject}' to user ${recipientId}`);
    return saved;
  }

  async getMyMail(userId: string): Promise<InGameMailEntity[]> {
    return this.mailRepository.find({
      where: { recipientId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async claimAttachment(userId: string, mailId: string): Promise<{ claimedCoins: number }> {
    const mail = await this.mailRepository.findOne({ where: { id: mailId, recipientId: userId } });
    if (!mail) {
      throw new NotFoundException('Mail message not found');
    }

    if (mail.isClaimed) {
      throw new BadRequestException('Attachment already claimed');
    }

    if (mail.attachmentCoins <= 0) {
      throw new BadRequestException('No coin attachments in this mail');
    }

    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (profile) {
      profile.totalScore = Number(profile.totalScore) + mail.attachmentCoins;
      await this.profileRepository.save(profile);
    }

    mail.isClaimed = true;
    mail.isRead = true;
    await this.mailRepository.save(mail);

    return { claimedCoins: mail.attachmentCoins };
  }
}
