// repositories/NotificationRepository.ts
import { EntityRepository } from 'typeorm';
import { Notification } from '@base/api/models/AppConfig/Notification';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(Notification)
export class NotificationRepository extends RepositoryBase<Notification> {
  public async createNotification(data: Partial<Notification>): Promise<Notification> {
    const notification = new Notification();
    Object.assign(notification, data);
    return await this.save(notification);
  }
}