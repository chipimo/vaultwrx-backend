import { EntityRepository, Repository } from 'typeorm';
import { CustomerInsightsReport } from '@base/api/models/Reports-analytics/CustomerInsightsReport';

@EntityRepository(CustomerInsightsReport)
export class CustomerInsightsReportRepository extends Repository<CustomerInsightsReport> {
  public async createReport(data: Partial<CustomerInsightsReport>): Promise<CustomerInsightsReport> {
    const entity = this.create(data);
    return await this.save(entity);
  }

  public async createCustomerInsightsReport(data: Partial<CustomerInsightsReport>): Promise<CustomerInsightsReport> {
    return await this.createReport(data);
  }

  public async findByCompanyId(companyId: string): Promise<CustomerInsightsReport[]> {
    return await this.find({ where: { companyId } });
  }
}

