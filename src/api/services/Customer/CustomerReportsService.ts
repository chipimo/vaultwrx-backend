import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { CustomerRepository } from '@base/api/repositories/Customer/CustomerRepository';

@Service()
export class CustomerReportsService {
  constructor(
    @InjectRepository() private customerRepository: CustomerRepository
  ) {}

  public async getDashboard(companyId: string): Promise<{
    totalCustomers: number;
    newCustomersThisMonth: number;
    activeCustomers: number;
    topCustomers: any[];
    customerGrowth: any[];
    loyaltyDistribution: any[];
  }> {
    const stats = await this.customerRepository.getCustomerStats(companyId);
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newCustomersThisMonth = await this.customerRepository.count({
      where: {
        companyId,
        createdAt: { $gte: startOfMonth } as any,
      },
    });

    const activeCustomers = await this.customerRepository.findWithRecentActivity(companyId, 30);

    const topCustomers = await this.customerRepository.findTopCustomersByLoyalty(companyId, 10);

    const customerGrowth = await this.getCustomerGrowthData(companyId, 12);

    const loyaltyDistribution = await this.getLoyaltyDistribution(companyId);

    return {
      totalCustomers: stats.totalCustomers,
      newCustomersThisMonth,
      activeCustomers: activeCustomers.length,
      topCustomers: topCustomers.map(customer => ({
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        loyaltyPoints: customer.loyaltyPoints,
        totalOrders: customer.orders?.length || 0,
        totalSpent: 0, 
      })),
      customerGrowth,
      loyaltyDistribution,
    };
  }

  public async getCustomerGrowth(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
    period: 'daily' | 'weekly' | 'monthly' = 'monthly'
  ): Promise<{
    period: string;
    data: any[];
    totalGrowth: number;
    averageGrowth: number;
  }> {
    const data = await this.getCustomerGrowthData(companyId, 12, startDate, endDate, period);
    
    const totalGrowth = data.reduce((sum, item) => sum + item.growth, 0);
    const averageGrowth = data.length > 0 ? totalGrowth / data.length : 0;

    return {
      period,
      data,
      totalGrowth,
      averageGrowth,
    };
  }

  public async getCustomerSegmentation(companyId: string): Promise<{
    byType: any[];
    byLoyaltyTier: any[];
    byActivity: any[];
    byLocation: any[];
  }> {
    const stats = await this.customerRepository.getCustomerStats(companyId);
    
    const byType = [
      { type: 'Individual', count: stats.individualCustomers, percentage: (stats.individualCustomers / stats.totalCustomers) * 100 },
      { type: 'Company', count: stats.companyCustomers, percentage: (stats.companyCustomers / stats.totalCustomers) * 100 },
    ];

    const byLoyaltyTier = await this.getLoyaltyDistribution(companyId);

    const activeCustomers = await this.customerRepository.findWithRecentActivity(companyId, 30);
    const inactiveCustomers = stats.totalCustomers - activeCustomers.length;
    
    const byActivity = [
      { activity: 'Active', count: activeCustomers.length, percentage: (activeCustomers.length / stats.totalCustomers) * 100 },
      { activity: 'Inactive', count: inactiveCustomers, percentage: (inactiveCustomers / stats.totalCustomers) * 100 },
    ];

    const customersByLocation = await this.customerRepository
      .createQueryBuilder('customer')
      .select('customer.address', 'location')
      .addSelect('COUNT(*)', 'count')
      .where('customer.companyId = :companyId', { companyId })
      .andWhere('customer.address IS NOT NULL')
      .andWhere('customer.address != :empty', { empty: '' })
      .groupBy('customer.address')
      .orderBy('count', 'DESC')
      .getRawMany();

    const byLocation = customersByLocation.map(item => ({
      location: item.location,
      count: parseInt(item.count),
      percentage: stats.totalCustomers > 0 ? (parseInt(item.count) / stats.totalCustomers) * 100 : 0,
    }));

    return {
      byType,
      byLoyaltyTier,
      byActivity,
      byLocation,
    };
  }

  public async getCustomerLifetimeValue(
    companyId: string,
    segmentBy: 'tier' | 'type' | 'activity' = 'tier'
  ): Promise<{
    averageLTV: number;
    medianLTV: number;
    segments: any[];
    topCustomers: any[];
  }> {
    const ltvData = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoin('customer.orders', 'orders')
      .leftJoin('customer.payments', 'payments')
      .select('customer.id', 'customerId')
      .addSelect('customer.firstName', 'firstName')
      .addSelect('customer.lastName', 'lastName')
      .addSelect('customer.email', 'email')
      .addSelect('customer.loyaltyPoints', 'loyaltyPoints')
      .addSelect('customer.isCompany', 'isCompany')
      .addSelect('COALESCE(SUM(orders.totalAmount), 0)', 'totalSpent')
      .addSelect('COALESCE(SUM(payments.amount), 0)', 'totalPaid')
      .where('customer.companyId = :companyId', { companyId })
      .groupBy('customer.id, customer.firstName, customer.lastName, customer.email, customer.loyaltyPoints, customer.isCompany')
      .getRawMany();

    const customersWithLTV = ltvData.map(customer => ({
      ...customer,
      ltv: parseFloat(customer.totalSpent) || 0,
    }));

    const ltvValues = customersWithLTV.map(c => c.ltv).sort((a, b) => a - b);
    const averageLTV = ltvValues.length > 0 ? ltvValues.reduce((sum, val) => sum + val, 0) / ltvValues.length : 0;
    const medianLTV = ltvValues.length > 0 ? 
      (ltvValues.length % 2 === 0 ? 
        (ltvValues[ltvValues.length / 2 - 1] + ltvValues[ltvValues.length / 2]) / 2 : 
        ltvValues[Math.floor(ltvValues.length / 2)]) : 0;

    const segments = await this.getLTVSegmentsByTier(customersWithLTV);

    const topCustomers = customersWithLTV
      .sort((a, b) => b.ltv - a.ltv)
      .slice(0, 10)
      .map(customer => ({
        id: customer.customerId,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        ltv: customer.ltv,
        loyaltyPoints: customer.loyaltyPoints,
      }));

    return {
      averageLTV,
      medianLTV,
      segments,
      topCustomers,
    };
  }

  public async getCustomerRetention(
    companyId: string,
    period: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
  ): Promise<{
    retentionRate: number;
    churnRate: number;
    cohorts: any[];
    trends: any[];
  }> {
    const cohorts = await this.getCustomerCohorts(companyId, period);
    
    const totalCustomers = cohorts.reduce((sum, cohort) => sum + cohort.customers, 0);
    const totalRetained = cohorts.reduce((sum, cohort) => sum + cohort.retained, 0);
    const retentionRate = totalCustomers > 0 ? totalRetained / totalCustomers : 0;
    const churnRate = 1 - retentionRate;

    const trends = cohorts.map(cohort => ({
      period: cohort.cohort,
      retentionRate: cohort.retentionRate,
      churnRate: 1 - cohort.retentionRate,
    }));

    return {
      retentionRate,
      churnRate,
      cohorts,
      trends,
    };
  }

  public async getCustomerActivity(
    companyId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalActivities: number;
    activitiesByType: any[];
    mostActiveCustomers: any[];
    activityTrends: any[];
  }> {
    const activityData = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoin('customer.orders', 'orders')
      .leftJoin('customer.payments', 'payments')
      .leftJoin('customer.invoices', 'invoices')
      .select('customer.id', 'customerId')
      .addSelect('customer.firstName', 'firstName')
      .addSelect('customer.lastName', 'lastName')
      .addSelect('customer.email', 'email')
      .addSelect('customer.updatedAt', 'lastActivity')
      .addSelect('COUNT(DISTINCT orders.id)', 'orderCount')
      .addSelect('COUNT(DISTINCT payments.id)', 'paymentCount')
      .addSelect('COUNT(DISTINCT invoices.id)', 'invoiceCount')
      .where('customer.companyId = :companyId', { companyId })
      .groupBy('customer.id, customer.firstName, customer.lastName, customer.email, customer.updatedAt')
      .getRawMany();

    const totalActivities = activityData.reduce((sum, customer) => 
      sum + parseInt(customer.orderCount) + parseInt(customer.paymentCount) + parseInt(customer.invoiceCount), 0);

    // Calculate activities by type
    const totalOrders = activityData.reduce((sum, customer) => sum + parseInt(customer.orderCount), 0);
    const totalPayments = activityData.reduce((sum, customer) => sum + parseInt(customer.paymentCount), 0);
    const totalInvoices = activityData.reduce((sum, customer) => sum + parseInt(customer.invoiceCount), 0);

    const activitiesByType = [
      { type: 'Orders', count: totalOrders, percentage: totalActivities > 0 ? (totalOrders / totalActivities) * 100 : 0 },
      { type: 'Payments', count: totalPayments, percentage: totalActivities > 0 ? (totalPayments / totalActivities) * 100 : 0 },
      { type: 'Invoices', count: totalInvoices, percentage: totalActivities > 0 ? (totalInvoices / totalActivities) * 100 : 0 },
    ];

    // Get most active customers
    const mostActiveCustomers = activityData
      .map(customer => ({
        id: customer.customerId,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        activityCount: parseInt(customer.orderCount) + parseInt(customer.paymentCount) + parseInt(customer.invoiceCount),
        lastActivity: customer.lastActivity,
      }))
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, 10);

    const activityTrends = await this.getActivityTrends(companyId, startDate, endDate);

    return {
      totalActivities,
      activitiesByType,
      mostActiveCustomers,
      activityTrends,
    };
  }


  public async getCustomerSatisfaction(
    companyId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    averageRating: number;
    ratingDistribution: any[];
    trends: any[];
    feedback: any[];
  }> {
    const satisfactionData = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoin('customer.orders', 'orders')
      .leftJoin('customer.payments', 'payments')
      .select('customer.id', 'customerId')
      .addSelect('customer.firstName', 'firstName')
      .addSelect('customer.lastName', 'lastName')
      .addSelect('COUNT(DISTINCT orders.id)', 'orderCount')
      .addSelect('COUNT(DISTINCT payments.id)', 'paymentCount')
      .addSelect('customer.updatedAt', 'lastActivity')
      .where('customer.companyId = :companyId', { companyId })
      .groupBy('customer.id, customer.firstName, customer.lastName, customer.updatedAt')
      .getRawMany();

    const satisfactionScores = satisfactionData.map(customer => {
      const orderCount = parseInt(customer.orderCount);
      const paymentCount = parseInt(customer.paymentCount);
      const activityScore = orderCount + paymentCount;
      
      if (activityScore >= 10) return 5;
      if (activityScore >= 5) return 4;
      if (activityScore >= 2) return 3;
      if (activityScore >= 1) return 2;
      return 1;
    });

    const averageRating = satisfactionScores.length > 0 ? 
      satisfactionScores.reduce((sum, rating) => sum + rating, 0) / satisfactionScores.length : 0;

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    satisfactionScores.forEach(rating => {
      ratingCounts[rating]++;
    });

    const ratingDistribution = Object.entries(ratingCounts).map(([rating, count]) => ({
      rating: parseInt(rating),
      count,
      percentage: satisfactionScores.length > 0 ? (count / satisfactionScores.length) * 100 : 0,
    }));

    const trends = await this.getSatisfactionTrends(companyId, startDate, endDate);

    const feedback = satisfactionData
      .filter(customer => parseInt(customer.orderCount) > 0)
      .slice(0, 10)
      .map(customer => ({
        customer: `${customer.firstName} ${customer.lastName}`,
        rating: satisfactionScores[satisfactionData.indexOf(customer)],
        comment: `Customer with ${customer.orderCount} orders and ${customer.paymentCount} payments`,
      }));

    return {
      averageRating,
      ratingDistribution,
      trends,
      feedback,
    };
  }

  public async exportCustomerData(
    companyId: string,
    format: 'csv' | 'excel' | 'pdf' = 'csv',
    filters: any = {}
  ): Promise<{ downloadUrl: string; expiresAt: Date }> {
    // Mock implementation - in a real system, this would generate actual files
    const downloadUrl = `/exports/customers_${companyId}_${Date.now()}.${format}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours

    return {
      downloadUrl,
      expiresAt,
    };
  }

  private async getLTVSegmentsByTier(customersWithLTV: any[]): Promise<any[]> {
    const tiers = [
      { name: 'Bronze', minPoints: 0, maxPoints: 999 },
      { name: 'Silver', minPoints: 1000, maxPoints: 4999 },
      { name: 'Gold', minPoints: 5000, maxPoints: 9999 },
      { name: 'Platinum', minPoints: 10000, maxPoints: 999999 },
    ];

    return tiers.map(tier => {
      const tierCustomers = customersWithLTV.filter(customer => 
        customer.loyaltyPoints >= tier.minPoints && customer.loyaltyPoints <= tier.maxPoints
      );
      
      const ltvValues = tierCustomers.map(c => c.ltv);
      const averageLTV = ltvValues.length > 0 ? ltvValues.reduce((sum, val) => sum + val, 0) / ltvValues.length : 0;
      const medianLTV = ltvValues.length > 0 ? 
        (ltvValues.length % 2 === 0 ? 
          (ltvValues[ltvValues.length / 2 - 1] + ltvValues[ltvValues.length / 2]) / 2 : 
          ltvValues[Math.floor(ltvValues.length / 2)]) : 0;

      return {
        segment: tier.name,
        averageLTV,
        medianLTV,
        customerCount: tierCustomers.length,
      };
    });
  }

  private async getCustomerCohorts(companyId: string, period: 'monthly' | 'quarterly' | 'yearly'): Promise<any[]> {
    const cohorts = [];
    const now = new Date();
    const monthsBack = period === 'yearly' ? 24 : period === 'quarterly' ? 12 : 6;

    for (let i = monthsBack - 1; i >= 0; i--) {
      const cohortDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextCohortDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const cohortCustomers = await this.customerRepository.findByDateRange(companyId, cohortDate, nextCohortDate);
      
      const activeCustomers = await this.customerRepository.findWithRecentActivity(companyId, 30);
      const retained = cohortCustomers.filter(customer => 
        activeCustomers.some(active => active.id === customer.id)
      ).length;

      const retentionRate = cohortCustomers.length > 0 ? retained / cohortCustomers.length : 0;

      cohorts.push({
        cohort: cohortDate.toISOString().substring(0, 7), 
        customers: cohortCustomers.length,
        retained,
        retentionRate,
      });
    }

    return cohorts;
  }

  public async getActivityTrends(companyId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    const trends = [];
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const defaultEndDate = endDate || now;

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const activities = await this.customerRepository
        .createQueryBuilder('customer')
        .leftJoin('customer.orders', 'orders')
        .leftJoin('customer.payments', 'payments')
        .leftJoin('customer.invoices', 'invoices')
        .select('COUNT(DISTINCT orders.id) + COUNT(DISTINCT payments.id) + COUNT(DISTINCT invoices.id)', 'activityCount')
        .where('customer.companyId = :companyId', { companyId })
        .andWhere('(orders.createdAt >= :date AND orders.createdAt < :nextDate) OR (payments.createdAt >= :date AND payments.createdAt < :nextDate) OR (invoices.createdAt >= :date AND invoices.createdAt < :nextDate)', 
          { date, nextDate })
        .getRawOne();

      trends.push({
        date: date.toISOString().substring(0, 10),
        activities: parseInt(activities.activityCount) || 0,
      });
    }

    return trends;
  }


  private async getSatisfactionTrends(companyId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    const trends = [];
    const now = new Date();
    const monthsBack = 6;

    for (let i = monthsBack - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthCustomers = await this.customerRepository.findByDateRange(companyId, monthDate, nextMonthDate);
      const activeCustomers = await this.customerRepository.findWithRecentActivity(companyId, 30);
      
      const activeInMonth = monthCustomers.filter(customer => 
        activeCustomers.some(active => active.id === customer.id)
      ).length;

      const satisfactionScore = monthCustomers.length > 0 ? 
        Math.min(5, Math.max(1, (activeInMonth / monthCustomers.length) * 5)) : 0;

      trends.push({
        period: monthDate.toISOString().substring(0, 7),
        averageRating: satisfactionScore,
      });
    }

    return trends;
  }

  private async getCustomerGrowthData(
    companyId: string,
    months: number,
    startDate?: Date,
    endDate?: Date,
    period: 'daily' | 'weekly' | 'monthly' = 'monthly'
  ): Promise<any[]> {
    const data = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const customers = await this.customerRepository.findByDateRange(companyId, date, nextDate);
      
      data.push({
        period: date.toISOString().substring(0, 7), 
        customers: customers.length,
        growth: customers.length,
      });
    }

    return data;
  }


  private async getLoyaltyDistribution(companyId: string): Promise<any[]> {
    const tiers = [
      { name: 'Bronze', minPoints: 0, maxPoints: 999 },
      { name: 'Silver', minPoints: 1000, maxPoints: 4999 },
      { name: 'Gold', minPoints: 5000, maxPoints: 9999 },
      { name: 'Platinum', minPoints: 10000, maxPoints: 999999 },
    ];

    const distribution = [];
    
    for (const tier of tiers) {
      const customers = await this.customerRepository.findByLoyaltyPointsRange(
        companyId,
        tier.minPoints,
        tier.maxPoints
      );
      
      distribution.push({
        tier: tier.name,
        count: customers.length,
        percentage: 0, 
      });
    }

    const total = distribution.reduce((sum, item) => sum + item.count, 0);
    distribution.forEach(item => {
      item.percentage = total > 0 ? (item.count / total) * 100 : 0;
    });

    return distribution;
  }
}
