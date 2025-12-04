import { Company } from '@api/models/Company/Company';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(Company)
export class CompanyRepository extends RepositoryBase<Company> {
  public async createCompany(data: object) {
    let entity = new Company();

    Object.assign(entity, data);

    return await this.save(entity);
  }

  public async updateCompany(company: Company, data: object) {
    Object.assign(company, data);

    return await company.save(data);
  }
}

