// services/LoyaltyProgramService.ts
import { LoyaltyProgram } from '@base/api/models/Loyalty-promotions/LoyaltyProgram';
import { LoyaltyProgramRepository } from '@base/api/repositories/Customer/LoyaltyProgramRepository';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class LoyaltyProgramService {
  constructor(@InjectRepository() private loyaltyProgramRepository: LoyaltyProgramRepository) {}

  public async createLoyaltyProgram(data: Partial<LoyaltyProgram>): Promise<LoyaltyProgram> {
    return this.loyaltyProgramRepository.createLoyaltyProgram(data);
  }
}