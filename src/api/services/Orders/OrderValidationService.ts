import { Service } from 'typedi';
import { OrderStatus, ProductType, Gender, CremationType, WitnessType, GraveType } from '@base/api/models/Sales-and-orders/Order';
import { PhotoType } from '@base/api/models/Sales-and-orders/Photo';
import { CreateOrderRequest, CreateOrderItemRequest, CreateDeceasedRequest, CreatePhotoRequest } from './OrderService';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

@Service()
export class OrderValidationService {
  /**
   * Validate order creation request
   */
  public validateCreateOrderRequest(orderData: CreateOrderRequest): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!orderData.customerId) {
      errors.push('Customer ID is required');
    }

    if (!orderData.retailerId) {
      errors.push('Retailer ID is required');
    }

    if (!orderData.deceased?.name) {
      errors.push('Deceased name is required');
    }

    if (!orderData.orderItems || orderData.orderItems.length === 0) {
      errors.push('At least one order item is required');
    }

    // Validate order items
    if (orderData.orderItems) {
      orderData.orderItems.forEach((item, index) => {
        const itemValidation = this.validateOrderItem(item);
        if (!itemValidation.isValid) {
          itemValidation.errors.forEach(error => {
            errors.push(`Order item ${index + 1}: ${error}`);
          });
        }
        warnings.push(...itemValidation.warnings.map(warning => `Order item ${index + 1}: ${warning}`));
      });
    }

    // Validate deceased information
    if (orderData.deceased) {
      const deceasedValidation = this.validateDeceased(orderData.deceased);
      if (!deceasedValidation.isValid) {
        errors.push(...deceasedValidation.errors);
      }
      warnings.push(...deceasedValidation.warnings);
    }

    // Validate photos
    if (orderData.photos) {
      orderData.photos.forEach((photo, index) => {
        const photoValidation = this.validatePhoto(photo);
        if (!photoValidation.isValid) {
          photoValidation.errors.forEach(error => {
            errors.push(`Photo ${index + 1}: ${error}`);
          });
        }
      });
    }

    // Service date validation
    if (orderData.dateOfService) {
      const serviceDate = new Date(orderData.dateOfService);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (serviceDate < today) {
        warnings.push('Service date is in the past');
      }

      // Check if service date is too far in the future (more than 1 year)
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      if (serviceDate > oneYearFromNow) {
        warnings.push('Service date is more than 1 year in the future');
      }
    }

    // Time validation
    if (orderData.timeOfService && !this.isValidTimeFormat(orderData.timeOfService)) {
      errors.push('Invalid time format for service time. Use HH:MM format');
    }

    if (orderData.arrivalTime && !this.isValidTimeFormat(orderData.arrivalTime)) {
      errors.push('Invalid time format for arrival time. Use HH:MM format');
    }

    // Email validation
    if (orderData.email && !this.isValidEmail(orderData.email)) {
      errors.push('Invalid email format');
    }

    // Phone validation
    if (orderData.cellPhone && !this.isValidPhoneNumber(orderData.cellPhone)) {
      warnings.push('Phone number format may be invalid');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate order item
   */
  public validateOrderItem(item: CreateOrderItemRequest): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!item.productId) {
      errors.push('Product ID is required');
    }

    if (!item.productType) {
      errors.push('Product type is required');
    } else if (!Object.values(ProductType).includes(item.productType as ProductType)) {
      errors.push('Invalid product type');
    }

    if (!item.quantity || item.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (!item.unitPrice || item.unitPrice < 0) {
      errors.push('Unit price must be greater than or equal to 0');
    }

    // Product-specific validations
    if (item.productType === ProductType.CREMATION) {
      if (item.cremationType && !Object.values(CremationType).includes(item.cremationType as CremationType)) {
        errors.push('Invalid cremation type');
      }

      if (item.witnessType && !Object.values(WitnessType).includes(item.witnessType as WitnessType)) {
        errors.push('Invalid witness type');
      }
    }

    if (item.productType === ProductType.MONUMENT) {
      if (item.lastDayLettering === undefined) {
        warnings.push('Last day lettering status not specified for monument');
      }
    }

    if (item.productType === ProductType.GRAVE_DIGGING) {
      if (item.graveType && !Object.values(GraveType).includes(item.graveType as GraveType)) {
        errors.push('Invalid grave type');
      }
    }

    // Gender validation
    if (item.gender && !Object.values(Gender).includes(item.gender as Gender)) {
      errors.push('Invalid gender');
    }

    // Date validations
    if (item.deliverBy) {
      const deliverDate = new Date(item.deliverBy);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (deliverDate < today) {
        warnings.push('Delivery date is in the past');
      }
    }

    if (item.serviceDate) {
      const serviceDate = new Date(item.serviceDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (serviceDate < today) {
        warnings.push('Service date is in the past');
      }
    }

    // Time validation
    if (item.deliveryTime && !this.isValidTimeFormat(item.deliveryTime)) {
      errors.push('Invalid delivery time format. Use HH:MM format');
    }

    if (item.serviceTime && !this.isValidTimeFormat(item.serviceTime)) {
      errors.push('Invalid service time format. Use HH:MM format');
    }

    // Engraving validation
    if (item.engraving && item.engraving.length > 1200) {
      errors.push('Engraving text exceeds maximum length of 1200 characters');
    }

    if (item.customization && item.customization.length > 2000) {
      warnings.push('Customization text is very long');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate deceased information
   */
  public validateDeceased(deceased: CreateDeceasedRequest): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!deceased.name || deceased.name.trim().length === 0) {
      errors.push('Deceased name is required');
    }

    // Name length validation
    if (deceased.name && deceased.name.length > 255) {
      errors.push('Deceased name exceeds maximum length');
    }

    // Date validations
    if (deceased.birthDate && deceased.deathDate) {
      const birthDate = new Date(deceased.birthDate);
      const deathDate = new Date(deceased.deathDate);

      if (birthDate >= deathDate) {
        errors.push('Birth date must be before death date');
      }

      // Check for reasonable age
      const age = deathDate.getFullYear() - birthDate.getFullYear();
      if (age > 150) {
        warnings.push('Age at death seems unusually high');
      }

      if (age < 0) {
        errors.push('Invalid age calculation');
      }
    }

    // Gender validation
    if (deceased.gender && !Object.values(Gender).includes(deceased.gender as Gender)) {
      errors.push('Invalid gender');
    }

    // Physical characteristics validation
    if (deceased.height && !this.isValidHeight(deceased.height)) {
      warnings.push('Height format may be invalid. Use format like "5\'10" or "180cm"');
    }

    if (deceased.weight && !this.isValidWeight(deceased.weight)) {
      warnings.push('Weight format may be invalid. Use format like "150 lbs" or "70 kg"');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate photo
   */
  public validatePhoto(photo: CreatePhotoRequest): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!photo.url) {
      errors.push('Photo URL is required');
    }

    if (!photo.type) {
      errors.push('Photo type is required');
    } else if (!Object.values(PhotoType).includes(photo.type as PhotoType)) {
      errors.push('Invalid photo type');
    }

    // URL validation
    if (photo.url && !this.isValidUrl(photo.url)) {
      errors.push('Invalid photo URL format');
    }

    // File size validation
    if (photo.fileSize && photo.fileSize > 50 * 1024 * 1024) { // 50MB
      errors.push('File size exceeds maximum allowed size of 50MB');
    }

    if (photo.fileSize && photo.fileSize > 10 * 1024 * 1024) { // 10MB
      warnings.push('File size is large and may take time to upload');
    }

    // MIME type validation
    if (photo.mimeType && !this.isValidMimeType(photo.mimeType)) {
      warnings.push('MIME type may not be supported');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate order status transition
   */
  public validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.DRAFT]: [OrderStatus.PENDING, OrderStatus.CANCELLED],
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
      [OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: []
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      errors.push(`Cannot transition from ${currentStatus} to ${newStatus}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Helper methods for validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidHeight(height: string): boolean {
    // Accept formats like "5'10\"", "180cm", "6'2\"", etc.
    const heightRegex = /^(\d+['\"]?\d*['\"]?|\d+cm|\d+ft|\d+in)$/i;
    return heightRegex.test(height);
  }

  private isValidWeight(weight: string): boolean {
    // Accept formats like "150 lbs", "70 kg", "150lb", etc.
    const weightRegex = /^\d+(\.\d+)?\s*(lbs?|kg|pounds?|kilograms?)$/i;
    return weightRegex.test(weight);
  }

  private isValidMimeType(mimeType: string): boolean {
    const validMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    return validMimeTypes.includes(mimeType.toLowerCase());
  }
}
