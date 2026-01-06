// repositories/LoyaltyProgramRepository.ts
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { LoyaltyProgram } from '@base/api/models/Loyalty-promotions/LoyaltyProgram';

@EntityRepository(LoyaltyProgram)
export class LoyaltyProgramRepository extends RepositoryBase<LoyaltyProgram> {
  public async createLoyaltyProgram(data: Partial<LoyaltyProgram>): Promise<LoyaltyProgram> {
    const program = new LoyaltyProgram();
    Object.assign(program, data);
    return await this.save(program);
  }
}