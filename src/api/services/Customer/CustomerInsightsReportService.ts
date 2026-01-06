// services/CustomerInsightsReportService.ts
import { CustomerInsightsReport } from '@base/api/models/Reports-analytics/CustomerInsightsReport';
import { CustomerInsightsReportRepository } from '@base/api/repositories/Reports/CustomerInsightsReportRepository';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class CustomerInsightsReportService {
  constructor(@InjectRepository() private customerInsightsReportRepository: CustomerInsightsReportRepository) {}

  public async createCustomerInsightsReport(data: Partial<CustomerInsightsReport>): Promise<CustomerInsightsReport> {
    return this.customerInsightsReportRepository.createCustomerInsightsReport(data);
  }
}