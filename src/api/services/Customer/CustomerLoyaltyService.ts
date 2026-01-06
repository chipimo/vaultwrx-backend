import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { CustomerRepository } from '@base/api/repositories/Customer/CustomerRepository';

@Service()
export class CustomerLoyaltyService {
  constructor(
    @InjectRepository() private customerRepository: CustomerRepository
  ) {}

  /**
   * ✅ Get customer loyalty tier based on points
   */
  public getCustomerTier(points: number): string {
    if (points >= 10000) return 'platinum';
    if (points >= 5000) return 'gold';
    if (points >= 1000) return 'silver';
    return 'bronze';
  }

  /**
   * ✅ Log loyalty points transaction
   */
  public async logLoyaltyTransaction(
    customerId: string,
    points: number,
    type: 'earned' | 'redeemed',
    reason: string,
    userId: string
  ): Promise<void> {
    // In a real implementation, you would create a LoyaltyTransaction entity
    // and save it to the database
    console.log(`Loyalty transaction: Customer ${customerId}, ${type} ${points} points, reason: ${reason}, by user ${userId}`);
  }

  /**
   * ✅ Get customer loyalty history
   */
  public async getLoyaltyHistory(
    customerId: string,
    companyId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ transactions: any[]; total: number; page: number; limit: number }> {
    // In a real implementation, you would query the LoyaltyTransaction table
    // For now, return mock data
    return {
      transactions: [],
      total: 0,
      page,
      limit,
    };
  }

  /**
   * ✅ Get loyalty tiers configuration
   */
  public getLoyaltyTiers(): any[] {
    return [
      {
        name: 'bronze',
        minPoints: 0,
        maxPoints: 999,
        benefits: ['Basic support', 'Standard shipping'],
      },
      {
        name: 'silver',
        minPoints: 1000,
        maxPoints: 4999,
        benefits: ['Priority support', 'Free shipping', '5% discount'],
      },
      {
        name: 'gold',
        minPoints: 5000,
        maxPoints: 9999,
        benefits: ['VIP support', 'Free shipping', '10% discount', 'Early access'],
      },
      {
        name: 'platinum',
        minPoints: 10000,
        maxPoints: 999999,
        benefits: ['Dedicated support', 'Free shipping', '15% discount', 'Exclusive products', 'Personal account manager'],
      },
    ];
  }

  /**
   * ✅ Get customers by loyalty tier
   */
  public async getCustomersByTier(companyId: string, tier: string): Promise<any[]> {
    const tiers = this.getLoyaltyTiers();
    const tierConfig = tiers.find(t => t.name === tier);
    
    if (!tierConfig) {
      return [];
    }

    return await this.customerRepository.findByLoyaltyPointsRange(
      companyId,
      tierConfig.minPoints,
      tierConfig.maxPoints
    );
  }

  /**
   * ✅ Get loyalty statistics
   */
  public async getLoyaltyStats(companyId: string): Promise<{
    totalPointsIssued: number;
    totalPointsRedeemed: number;
    activeCustomers: number;
    tierDistribution: any[];
  }> {
    // Get customer statistics
    const stats = await this.customerRepository.getCustomerStats(companyId);
    
    // Get tier distribution
    const tiers = this.getLoyaltyTiers();
    const tierDistribution = [];
    
    for (const tier of tiers) {
      const customers = await this.getCustomersByTier(companyId, tier.name);
      tierDistribution.push({
        tier: tier.name,
        count: customers.length,
        percentage: (customers.length / stats.totalCustomers) * 100,
      });
    }

    return {
      totalPointsIssued: stats.totalLoyaltyPoints,
      totalPointsRedeemed: 0, // This would be calculated from transaction history
      activeCustomers: stats.totalCustomers,
      tierDistribution,
    };
  }

  /**
   * ✅ Calculate loyalty points for a purchase
   */
  public calculateLoyaltyPoints(amount: number, customerTier: string): number {
    const tierMultipliers: { [key: string]: number } = {
      bronze: 1,
      silver: 1.1,
      gold: 1.2,
      platinum: 1.5,
    };

    const multiplier = tierMultipliers[customerTier] || 1;
    return Math.floor(amount * 0.01 * multiplier); // 1% base rate
  }

  /**
   * ✅ Get loyalty rewards available for redemption
   */
  public getLoyaltyRewards(): any[] {
    return [
      {
        id: 'discount_5',
        name: '5% Discount',
        pointsRequired: 500,
        type: 'discount',
        value: 0.05,
      },
      {
        id: 'discount_10',
        name: '10% Discount',
        pointsRequired: 1000,
        type: 'discount',
        value: 0.10,
      },
      {
        id: 'free_shipping',
        name: 'Free Shipping',
        pointsRequired: 200,
        type: 'shipping',
        value: 0,
      },
      {
        id: 'gift_card_25',
        name: '$25 Gift Card',
        pointsRequired: 2500,
        type: 'gift_card',
        value: 25,
      },
      {
        id: 'gift_card_50',
        name: '$50 Gift Card',
        pointsRequired: 5000,
        type: 'gift_card',
        value: 50,
      },
    ];
  }
}

