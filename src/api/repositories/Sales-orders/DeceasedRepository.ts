import { Repository, SelectQueryBuilder } from 'typeorm';
import { Service } from 'typedi';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { Deceased, Gender } from '@base/api/models/Sales-and-orders/Deceased';

export interface DeceasedFilters {
  orderId?: string;
  gender?: Gender;
  isEmbalmed?: boolean;
  birthDateFrom?: Date;
  birthDateTo?: Date;
  deathDateFrom?: Date;
  deathDateTo?: Date;
  search?: string;
}

export interface DeceasedListOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  includeOrder?: boolean;
}

@Service()
export class DeceasedRepository extends RepositoryBase<Deceased> {
  constructor() {
    super();
  }

  /**
   * Get deceased records with advanced filtering and pagination
   */
  public async getDeceasedWithFilters(
    filters: DeceasedFilters = {},
    options: DeceasedListOptions = {}
  ): Promise<{ deceased: Deceased[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      includeOrder = false
    } = options;

    const queryBuilder = this.createQueryBuilder('deceased');

    // Apply filters
    this.applyFilters(queryBuilder, filters);

    // Apply includes
    if (includeOrder) {
      queryBuilder.leftJoinAndSelect('deceased.order', 'order');
    }

    // Apply sorting
    queryBuilder.orderBy(`deceased.${sortBy}`, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [deceased, total] = await queryBuilder.getManyAndCount();

    return {
      deceased,
      total,
      page,
      limit
    };
  }

  /**
   * Get deceased by order ID
   */
  public async getDeceasedByOrderId(orderId: string): Promise<Deceased | null> {
    return await this.findOne({
      where: { orderId },
      relations: ['order']
    });
  }

  /**
   * Get deceased by gender
   */
  public async getDeceasedByGender(
    gender: Gender,
    options: DeceasedListOptions = {}
  ): Promise<{ deceased: Deceased[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryBuilder = this.createQueryBuilder('deceased')
      .where('deceased.gender = :gender', { gender })
      .leftJoinAndSelect('deceased.order', 'order')
      .orderBy(`deceased.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [deceased, total] = await queryBuilder.getManyAndCount();

    return { deceased, total };
  }

  /**
   * Get deceased by embalming status
   */
  public async getDeceasedByEmbalmingStatus(
    isEmbalmed: boolean,
    options: DeceasedListOptions = {}
  ): Promise<{ deceased: Deceased[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryBuilder = this.createQueryBuilder('deceased')
      .where('deceased.isEmbalmed = :isEmbalmed', { isEmbalmed })
      .leftJoinAndSelect('deceased.order', 'order')
      .orderBy(`deceased.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [deceased, total] = await queryBuilder.getManyAndCount();

    return { deceased, total };
  }

  /**
   * Get deceased by birth date range
   */
  public async getDeceasedByBirthDateRange(
    startDate: Date,
    endDate: Date,
    options: DeceasedListOptions = {}
  ): Promise<{ deceased: Deceased[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'birthDate', sortOrder = 'ASC' } = options;

    const queryBuilder = this.createQueryBuilder('deceased')
      .where('deceased.birthDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .leftJoinAndSelect('deceased.order', 'order')
      .orderBy(`deceased.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [deceased, total] = await queryBuilder.getManyAndCount();

    return { deceased, total };
  }

  /**
   * Get deceased by death date range
   */
  public async getDeceasedByDeathDateRange(
    startDate: Date,
    endDate: Date,
    options: DeceasedListOptions = {}
  ): Promise<{ deceased: Deceased[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'deathDate', sortOrder = 'ASC' } = options;

    const queryBuilder = this.createQueryBuilder('deceased')
      .where('deceased.deathDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .leftJoinAndSelect('deceased.order', 'order')
      .orderBy(`deceased.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [deceased, total] = await queryBuilder.getManyAndCount();

    return { deceased, total };
  }

  /**
   * Get deceased statistics
   */
  public async getDeceasedStatistics(): Promise<{
    totalDeceased: number;
    deceasedByGender: Record<Gender, number>;
    embalmedCount: number;
    notEmbalmedCount: number;
    averageAge: number;
  }> {
    // Total deceased
    const totalDeceased = await this.count();

    // Deceased by gender
    const genderStats = await this.createQueryBuilder('deceased')
      .select('deceased.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .where('deceased.gender IS NOT NULL')
      .groupBy('deceased.gender')
      .getRawMany();

    const deceasedByGender = genderStats.reduce((acc, stat) => {
      acc[stat.gender] = parseInt(stat.count);
      return acc;
    }, {} as Record<Gender, number>);

    // Embalming statistics
    const embalmedCount = await this.count({
      where: { isEmbalmed: true }
    });

    const notEmbalmedCount = await this.count({
      where: { isEmbalmed: false }
    });

    // Average age calculation
    const ageStats = await this.createQueryBuilder('deceased')
      .select('AVG(EXTRACT(YEAR FROM AGE(deceased.deathDate, deceased.birthDate)))', 'averageAge')
      .where('deceased.birthDate IS NOT NULL')
      .andWhere('deceased.deathDate IS NOT NULL')
      .getRawOne();

    return {
      totalDeceased,
      deceasedByGender,
      embalmedCount,
      notEmbalmedCount,
      averageAge: parseFloat(ageStats.averageAge) || 0
    };
  }

  /**
   * Search deceased records
   */
  public async searchDeceased(
    searchTerm: string,
    options: DeceasedListOptions = {}
  ): Promise<{ deceased: Deceased[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryBuilder = this.createQueryBuilder('deceased')
      .leftJoin('deceased.order', 'order')
      .where(
        '(deceased.name ILIKE :search OR deceased.height ILIKE :search OR deceased.weight ILIKE :search)',
        { search: `%${searchTerm}%` }
      )
      .leftJoinAndSelect('deceased.order', 'order')
      .orderBy(`deceased.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [deceased, total] = await queryBuilder.getManyAndCount();

    return { deceased, total };
  }

  /**
   * Apply filters to query builder
   */
  private applyFilters(queryBuilder: SelectQueryBuilder<Deceased>, filters: DeceasedFilters): void {
    if (filters.orderId) {
      queryBuilder.andWhere('deceased.orderId = :orderId', { orderId: filters.orderId });
    }

    if (filters.gender) {
      queryBuilder.andWhere('deceased.gender = :gender', { gender: filters.gender });
    }

    if (filters.isEmbalmed !== undefined) {
      queryBuilder.andWhere('deceased.isEmbalmed = :isEmbalmed', { isEmbalmed: filters.isEmbalmed });
    }

    if (filters.birthDateFrom) {
      queryBuilder.andWhere('deceased.birthDate >= :birthDateFrom', { birthDateFrom: filters.birthDateFrom });
    }

    if (filters.birthDateTo) {
      queryBuilder.andWhere('deceased.birthDate <= :birthDateTo', { birthDateTo: filters.birthDateTo });
    }

    if (filters.deathDateFrom) {
      queryBuilder.andWhere('deceased.deathDate >= :deathDateFrom', { deathDateFrom: filters.deathDateFrom });
    }

    if (filters.deathDateTo) {
      queryBuilder.andWhere('deceased.deathDate <= :deathDateTo', { deathDateTo: filters.deathDateTo });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(deceased.name ILIKE :search OR deceased.height ILIKE :search OR deceased.weight ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
  }
}
