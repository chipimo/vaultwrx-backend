// repositories/AppSettingRepository.ts
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { AppSetting } from '@base/api/models/AppConfig/AppSetting';

@EntityRepository(AppSetting)
export class AppSettingRepository extends RepositoryBase<AppSetting> {
  public async createAppSetting(data: Partial<AppSetting>): Promise<AppSetting> {
    const setting = new AppSetting();
    Object.assign(setting, data);
    return await this.save(setting);
  }
}