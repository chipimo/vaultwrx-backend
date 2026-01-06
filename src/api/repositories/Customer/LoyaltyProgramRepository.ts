import { EntityRepository, Repository } from 'typeorm';
import { LoyaltyProgram } from '@base/api/models/Loyalty-promotions/LoyaltyProgram';

@EntityRepository(LoyaltyProgram)
export class LoyaltyProgramRepository extends Repository<LoyaltyProgram> {
  public async createLoyaltyProgram(data: Partial<LoyaltyProgram>): Promise<LoyaltyProgram> {
    const entity = this.create(data);
    return await this.save(entity);
  }

  public async findByCompanyId(companyId: string): Promise<LoyaltyProgram[]> {
    return await this.find({ where: { companyId } });
  }
}
