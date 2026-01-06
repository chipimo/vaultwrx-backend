import { Repository, SelectQueryBuilder, In } from 'typeorm';
import { Service } from 'typedi';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { Photo, PhotoType } from '@base/api/models/Sales-and-orders/Photo';

export interface PhotoFilters {
  orderId?: string;
  userId?: string;
  type?: PhotoType[];
  mimeType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface PhotoListOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  includeOrder?: boolean;
  includeUser?: boolean;
}

@Service()
export class PhotoRepository extends RepositoryBase<Photo> {
  constructor() {
    super();
  }

  /**
   * Get photos with advanced filtering and pagination
   */
  public async getPhotosWithFilters(
    filters: PhotoFilters = {},
    options: PhotoListOptions = {}
  ): Promise<{ photos: Photo[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      includeOrder = false,
      includeUser = false
    } = options;

    const queryBuilder = this.createQueryBuilder('photo');

    // Apply filters
    this.applyFilters(queryBuilder, filters);

    // Apply includes
    if (includeOrder) {
      queryBuilder.leftJoinAndSelect('photo.order', 'order');
    }

    if (includeUser) {
      queryBuilder.leftJoinAndSelect('photo.user', 'user');
    }

    // Apply sorting
    queryBuilder.orderBy(`photo.${sortBy}`, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [photos, total] = await queryBuilder.getManyAndCount();

    return {
      photos,
      total,
      page,
      limit
    };
  }

  /**
   * Get photos by order ID
   */
  public async getPhotosByOrderId(orderId: string): Promise<Photo[]> {
    return await this.find({
      where: { orderId },
      relations: ['order'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Get photos by user ID
   */
  public async getPhotosByUserId(
    userId: string,
    options: PhotoListOptions = {}
  ): Promise<{ photos: Photo[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryBuilder = this.createQueryBuilder('photo')
      .where('photo.userId = :userId', { userId })
      .leftJoinAndSelect('photo.order', 'order')
      .orderBy(`photo.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [photos, total] = await queryBuilder.getManyAndCount();

    return { photos, total };
  }

  /**
   * Get photos by type
   */
  public async getPhotosByType(
    type: PhotoType,
    options: PhotoListOptions = {}
  ): Promise<{ photos: Photo[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryBuilder = this.createQueryBuilder('photo')
      .where('photo.type = :type', { type })
      .leftJoinAndSelect('photo.order', 'order')
      .orderBy(`photo.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [photos, total] = await queryBuilder.getManyAndCount();

    return { photos, total };
  }

  /**
   * Get photos by MIME type
   */
  public async getPhotosByMimeType(
    mimeType: string,
    options: PhotoListOptions = {}
  ): Promise<{ photos: Photo[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryBuilder = this.createQueryBuilder('photo')
      .where('photo.mimeType = :mimeType', { mimeType })
      .leftJoinAndSelect('photo.order', 'order')
      .orderBy(`photo.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [photos, total] = await queryBuilder.getManyAndCount();

    return { photos, total };
  }

  /**
   * Get photos by date range
   */
  public async getPhotosByDateRange(
    startDate: Date,
    endDate: Date,
    options: PhotoListOptions = {}
  ): Promise<{ photos: Photo[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryBuilder = this.createQueryBuilder('photo')
      .where('photo.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .leftJoinAndSelect('photo.order', 'order')
      .orderBy(`photo.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [photos, total] = await queryBuilder.getManyAndCount();

    return { photos, total };
  }

  /**
   * Get image photos only
   */
  public async getImagePhotos(
    options: PhotoListOptions = {}
  ): Promise<{ photos: Photo[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];

    const queryBuilder = this.createQueryBuilder('photo')
      .where('photo.mimeType IN (:...mimeTypes)', { mimeTypes: imageMimeTypes })
      .leftJoinAndSelect('photo.order', 'order')
      .orderBy(`photo.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [photos, total] = await queryBuilder.getManyAndCount();

    return { photos, total };
  }

  /**
   * Get document photos only
   */
  public async getDocumentPhotos(
    options: PhotoListOptions = {}
  ): Promise<{ photos: Photo[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const documentMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

    const queryBuilder = this.createQueryBuilder('photo')
      .where('photo.mimeType IN (:...mimeTypes)', { mimeTypes: documentMimeTypes })
      .leftJoinAndSelect('photo.order', 'order')
      .orderBy(`photo.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [photos, total] = await queryBuilder.getManyAndCount();

    return { photos, total };
  }

  /**
   * Get photo statistics
   */
  public async getPhotoStatistics(): Promise<{
    totalPhotos: number;
    photosByType: Record<PhotoType, number>;
    photosByMimeType: Record<string, number>;
    totalFileSize: number;
    averageFileSize: number;
    imageCount: number;
    documentCount: number;
  }> {
    // Total photos
    const totalPhotos = await this.count();

    // Photos by type
    const typeStats = await this.createQueryBuilder('photo')
      .select('photo.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('photo.type')
      .getRawMany();

    const photosByType = typeStats.reduce((acc, stat) => {
      acc[stat.type] = parseInt(stat.count);
      return acc;
    }, {} as Record<PhotoType, number>);

    // Photos by MIME type
    const mimeTypeStats = await this.createQueryBuilder('photo')
      .select('photo.mimeType', 'mimeType')
      .addSelect('COUNT(*)', 'count')
      .where('photo.mimeType IS NOT NULL')
      .groupBy('photo.mimeType')
      .getRawMany();

    const photosByMimeType = mimeTypeStats.reduce((acc, stat) => {
      acc[stat.mimeType] = parseInt(stat.count);
      return acc;
    }, {} as Record<string, number>);

    // File size statistics
    const sizeStats = await this.createQueryBuilder('photo')
      .select('SUM(photo.fileSize)', 'totalFileSize')
      .addSelect('AVG(photo.fileSize)', 'averageFileSize')
      .where('photo.fileSize IS NOT NULL')
      .getRawOne();

    // Image count
    const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    const imageCount = await this.count({
      where: {
        mimeType: In(imageMimeTypes)
      }
    });

    // Document count
    const documentMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const documentCount = await this.count({
      where: {
        mimeType: In(documentMimeTypes)
      }
    });

    return {
      totalPhotos,
      photosByType,
      photosByMimeType,
      totalFileSize: parseFloat(sizeStats.totalFileSize) || 0,
      averageFileSize: parseFloat(sizeStats.averageFileSize) || 0,
      imageCount,
      documentCount
    };
  }

  /**
   * Search photos
   */
  public async searchPhotos(
    searchTerm: string,
    options: PhotoListOptions = {}
  ): Promise<{ photos: Photo[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryBuilder = this.createQueryBuilder('photo')
      .leftJoin('photo.order', 'order')
      .where(
        '(photo.fileName ILIKE :search OR photo.type ILIKE :search OR photo.mimeType ILIKE :search)',
        { search: `%${searchTerm}%` }
      )
      .leftJoinAndSelect('photo.order', 'order')
      .orderBy(`photo.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [photos, total] = await queryBuilder.getManyAndCount();

    return { photos, total };
  }

  /**
   * Apply filters to query builder
   */
  private applyFilters(queryBuilder: SelectQueryBuilder<Photo>, filters: PhotoFilters): void {
    if (filters.orderId) {
      queryBuilder.andWhere('photo.orderId = :orderId', { orderId: filters.orderId });
    }

    if (filters.userId) {
      queryBuilder.andWhere('photo.userId = :userId', { userId: filters.userId });
    }

    if (filters.type && filters.type.length > 0) {
      queryBuilder.andWhere('photo.type IN (:...type)', { type: filters.type });
    }

    if (filters.mimeType) {
      queryBuilder.andWhere('photo.mimeType = :mimeType', { mimeType: filters.mimeType });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('photo.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('photo.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(photo.fileName ILIKE :search OR photo.type ILIKE :search OR photo.mimeType ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
  }
}
