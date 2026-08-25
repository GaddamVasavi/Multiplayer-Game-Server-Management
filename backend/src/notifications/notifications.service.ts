import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemNotificationEntity, NotificationType } from './notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(SystemNotificationEntity)
    private readonly notificationRepository: Repository<SystemNotificationEntity>,
  ) {}

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
  ): Promise<SystemNotificationEntity> {
    const notif = this.notificationRepository.create({
      userId,
      type,
      title,
      message,
      isRead: false,
    });

    const saved = await this.notificationRepository.save(notif);
    this.logger.log(`Created notification [${type}] for user ${userId}`);
    return saved;
  }

  async getUserNotifications(userId: string): Promise<SystemNotificationEntity[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notif = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });
    if (!notif) {
      throw new NotFoundException('Notification not found');
    }
    notif.isRead = true;
    await this.notificationRepository.save(notif);
  }
}
