import { Request } from 'express';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { EmployeeLoginLog } from '@base/api/models/Store-employee-management/EmployeeLoginLog';
import { Repository } from 'typeorm';

@Service()
export class LogEmployeeLoginService {
  constructor(
    @InjectRepository(EmployeeLoginLog)
    private assetRepository: Repository<EmployeeLoginLog>,
  ) {}

  public async getAll(): Promise<EmployeeLoginLog[]> {
    return this.assetRepository.find();
  }
  public async getById(id: string): Promise<EmployeeLoginLog | undefined> {
    return this.assetRepository.findOne({ where: { id } });
  }
  
}
