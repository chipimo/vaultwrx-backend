import { Service } from 'typedi';
import { CompanyRepository } from '@api/repositories/Company/CompanyRepository';
import { CompanyNotFoundException } from '@api/exceptions/Company/CompanyNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class CompanyService {
  constructor(
    @InjectRepository() private companyRepository: CompanyRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object) {
    return await this.companyRepository.getManyAndCount(resourceOptions);
  }

  public async findOneById(id: number, resourceOptions?: object) {
    return await this.getRequestedCompanyOrFail(id, resourceOptions);
  }

  public async create(data: object) {
    let company = await this.companyRepository.createCompany(data);

    this.eventDispatcher.dispatch('onCompanyCreate', company);

    return company;
  }

  public async updateOneById(id: number, data: object) {
    const company = await this.getRequestedCompanyOrFail(id);

    return await this.companyRepository.updateCompany(company, data);
  }

  public async deleteOneById(id: number) {
    return await this.companyRepository.delete(id);
  }

  private async getRequestedCompanyOrFail(id: number, resourceOptions?: object) {
    let company = await this.companyRepository.getOneById(id, resourceOptions);

    if (!company) {
      throw new CompanyNotFoundException();
    }

    return company;
  }
}

