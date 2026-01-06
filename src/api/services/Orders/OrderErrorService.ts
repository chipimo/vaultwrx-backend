import { Service } from 'typedi';
import { OrderStatus } from '@base/api/models/Sales-and-orders/Order';

export enum OrderErrorCode {
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ORDER_ALREADY_EXISTS = 'ORDER_ALREADY_EXISTS',
  INVALID_ORDER_STATUS = 'INVALID_ORDER_STATUS',
  ORDER_CANNOT_BE_UPDATED = 'ORDER_CANNOT_BE_UPDATED',
  ORDER_CANNOT_BE_CANCELLED = 'ORDER_CANNOT_BE_CANCELLED',
  ORDER_CANNOT_BE_DELETED = 'ORDER_CANNOT_BE_DELETED',
  CUSTOMER_NOT_FOUND = 'CUSTOMER_NOT_FOUND',
  RETAILER_NOT_FOUND = 'RETAILER_NOT_FOUND',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  INVALID_PRODUCT_TYPE = 'INVALID_PRODUCT_TYPE',
  INVALID_QUANTITY = 'INVALID_QUANTITY',
  INVALID_PRICE = 'INVALID_PRICE',
  INVALID_DATES = 'INVALID_DATES',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PHONE = 'INVALID_PHONE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface OrderError {
  code: OrderErrorCode;
  message: string;
  details?: any;
  timestamp: Date;
  orderId?: string;
  userId?: string;
  retailerId?: string;
}

@Service()
export class OrderErrorService {
  /**
   * Create standardized error
   */
  public createError(
    code: OrderErrorCode,
    message: string,
    details?: any,
    orderId?: string,
    userId?: string,
    retailerId?: string
  ): OrderError {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
      orderId,
      userId,
      retailerId
    };
  }

  /**
   * Handle order not found error
   */
  public handleOrderNotFound(orderId: string, retailerId: string): OrderError {
    return this.createError(
      OrderErrorCode.ORDER_NOT_FOUND,
      `Order with ID ${orderId} not found for retailer ${retailerId}`,
      { orderId, retailerId },
      orderId,
      undefined,
      retailerId
    );
  }

  /**
   * Handle invalid order status error
   */
  public handleInvalidOrderStatus(
    currentStatus: OrderStatus,
    requestedStatus: OrderStatus,
    orderId: string
  ): OrderError {
    return this.createError(
      OrderErrorCode.INVALID_ORDER_STATUS,
      `Cannot change order status from ${currentStatus} to ${requestedStatus}`,
      { currentStatus, requestedStatus },
      orderId
    );
  }

  /**
   * Handle order cannot be updated error
   */
  public handleOrderCannotBeUpdated(status: OrderStatus, orderId: string): OrderError {
    return this.createError(
      OrderErrorCode.ORDER_CANNOT_BE_UPDATED,
      `Order with status ${status} cannot be updated`,
      { status },
      orderId
    );
  }

  /**
   * Handle order cannot be cancelled error
   */
  public handleOrderCannotBeCancelled(status: OrderStatus, orderId: string): OrderError {
    return this.createError(
      OrderErrorCode.ORDER_CANNOT_BE_CANCELLED,
      `Order with status ${status} cannot be cancelled`,
      { status },
      orderId
    );
  }

  /**
   * Handle order cannot be deleted error
   */
  public handleOrderCannotBeDeleted(status: OrderStatus, orderId: string): OrderError {
    return this.createError(
      OrderErrorCode.ORDER_CANNOT_BE_DELETED,
      `Order with status ${status} cannot be deleted`,
      { status },
      orderId
    );
  }

  /**
   * Handle customer not found error
   */
  public handleCustomerNotFound(customerId: string, retailerId: string): OrderError {
    return this.createError(
      OrderErrorCode.CUSTOMER_NOT_FOUND,
      `Customer with ID ${customerId} not found for retailer ${retailerId}`,
      { customerId, retailerId },
      undefined,
      undefined,
      retailerId
    );
  }

  /**
   * Handle retailer not found error
   */
  public handleRetailerNotFound(retailerId: string): OrderError {
    return this.createError(
      OrderErrorCode.RETAILER_NOT_FOUND,
      `Retailer with ID ${retailerId} not found`,
      { retailerId },
      undefined,
      undefined,
      retailerId
    );
  }

  /**
   * Handle product not found error
   */
  public handleProductNotFound(productId: string, retailerId: string): OrderError {
    return this.createError(
      OrderErrorCode.PRODUCT_NOT_FOUND,
      `Product with ID ${productId} not found for retailer ${retailerId}`,
      { productId, retailerId },
      undefined,
      undefined,
      retailerId
    );
  }

  /**
   * Handle validation error
   */
  public handleValidationError(
    errors: string[],
    orderId?: string,
    userId?: string,
    retailerId?: string
  ): OrderError {
    return this.createError(
      OrderErrorCode.VALIDATION_ERROR,
      'Validation failed',
      { errors },
      orderId,
      userId,
      retailerId
    );
  }

  /**
   * Handle file too large error
   */
  public handleFileTooLarge(
    fileName: string,
    fileSize: number,
    maxSize: number,
    orderId?: string
  ): OrderError {
    return this.createError(
      OrderErrorCode.FILE_TOO_LARGE,
      `File ${fileName} is too large. Size: ${fileSize} bytes, Max: ${maxSize} bytes`,
      { fileName, fileSize, maxSize },
      orderId
    );
  }

  /**
   * Handle invalid file type error
   */
  public handleInvalidFileType(
    fileName: string,
    mimeType: string,
    allowedTypes: string[],
    orderId?: string
  ): OrderError {
    return this.createError(
      OrderErrorCode.INVALID_FILE_TYPE,
      `File ${fileName} has invalid type ${mimeType}. Allowed types: ${allowedTypes.join(', ')}`,
      { fileName, mimeType, allowedTypes },
      orderId
    );
  }

  /**
   * Handle insufficient permissions error
   */
  public handleInsufficientPermissions(
    action: string,
    userId: string,
    orderId?: string,
    retailerId?: string
  ): OrderError {
    return this.createError(
      OrderErrorCode.INSUFFICIENT_PERMISSIONS,
      `User ${userId} does not have permission to ${action}`,
      { action, userId },
      orderId,
      userId,
      retailerId
    );
  }

  /**
   * Handle database error
   */
  public handleDatabaseError(
    operation: string,
    error: any,
    orderId?: string,
    userId?: string,
    retailerId?: string
  ): OrderError {
    return this.createError(
      OrderErrorCode.DATABASE_ERROR,
      `Database error during ${operation}`,
      { operation, originalError: error.message },
      orderId,
      userId,
      retailerId
    );
  }

  /**
   * Handle network error
   */
  public handleNetworkError(
    operation: string,
    error: any,
    orderId?: string,
    userId?: string,
    retailerId?: string
  ): OrderError {
    return this.createError(
      OrderErrorCode.NETWORK_ERROR,
      `Network error during ${operation}`,
      { operation, originalError: error.message },
      orderId,
      userId,
      retailerId
    );
  }

  /**
   * Handle unknown error
   */
  public handleUnknownError(
    error: any,
    orderId?: string,
    userId?: string,
    retailerId?: string
  ): OrderError {
    return this.createError(
      OrderErrorCode.UNKNOWN_ERROR,
      'An unknown error occurred',
      { originalError: error.message, stack: error.stack },
      orderId,
      userId,
      retailerId
    );
  }

  /**
   * Get user-friendly error message
   */
  public getUserFriendlyMessage(error: OrderError): string {
    switch (error.code) {
      case OrderErrorCode.ORDER_NOT_FOUND:
        return 'The requested order could not be found.';
      
      case OrderErrorCode.ORDER_ALREADY_EXISTS:
        return 'An order with this information already exists.';
      
      case OrderErrorCode.INVALID_ORDER_STATUS:
        return 'The order status cannot be changed at this time.';
      
      case OrderErrorCode.ORDER_CANNOT_BE_UPDATED:
        return 'This order cannot be updated in its current status.';
      
      case OrderErrorCode.ORDER_CANNOT_BE_CANCELLED:
        return 'This order cannot be cancelled in its current status.';
      
      case OrderErrorCode.ORDER_CANNOT_BE_DELETED:
        return 'This order cannot be deleted in its current status.';
      
      case OrderErrorCode.CUSTOMER_NOT_FOUND:
        return 'The specified customer could not be found.';
      
      case OrderErrorCode.RETAILER_NOT_FOUND:
        return 'The specified retailer could not be found.';
      
      case OrderErrorCode.PRODUCT_NOT_FOUND:
        return 'One or more products could not be found.';
      
      case OrderErrorCode.INVALID_PRODUCT_TYPE:
        return 'One or more products have invalid types.';
      
      case OrderErrorCode.INVALID_QUANTITY:
        return 'Product quantities must be greater than zero.';
      
      case OrderErrorCode.INVALID_PRICE:
        return 'Product prices must be valid positive numbers.';
      
      case OrderErrorCode.INVALID_DATES:
        return 'One or more dates are invalid.';
      
      case OrderErrorCode.INVALID_EMAIL:
        return 'The email address format is invalid.';
      
      case OrderErrorCode.INVALID_PHONE:
        return 'The phone number format is invalid.';
      
      case OrderErrorCode.FILE_TOO_LARGE:
        return 'One or more files are too large to upload.';
      
      case OrderErrorCode.INVALID_FILE_TYPE:
        return 'One or more files have unsupported formats.';
      
      case OrderErrorCode.INSUFFICIENT_PERMISSIONS:
        return 'You do not have permission to perform this action.';
      
      case OrderErrorCode.VALIDATION_ERROR:
        return 'Please check your input and try again.';
      
      case OrderErrorCode.DATABASE_ERROR:
        return 'A database error occurred. Please try again later.';
      
      case OrderErrorCode.NETWORK_ERROR:
        return 'A network error occurred. Please check your connection and try again.';
      
      case OrderErrorCode.UNKNOWN_ERROR:
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  }

  /**
   * Get error severity level
   */
  public getErrorSeverity(error: OrderError): 'low' | 'medium' | 'high' | 'critical' {
    switch (error.code) {
      case OrderErrorCode.ORDER_NOT_FOUND:
      case OrderErrorCode.CUSTOMER_NOT_FOUND:
      case OrderErrorCode.RETAILER_NOT_FOUND:
      case OrderErrorCode.PRODUCT_NOT_FOUND:
        return 'medium';
      
      case OrderErrorCode.INVALID_ORDER_STATUS:
      case OrderErrorCode.ORDER_CANNOT_BE_UPDATED:
      case OrderErrorCode.ORDER_CANNOT_BE_CANCELLED:
      case OrderErrorCode.ORDER_CANNOT_BE_DELETED:
      case OrderErrorCode.INSUFFICIENT_PERMISSIONS:
        return 'high';
      
      case OrderErrorCode.DATABASE_ERROR:
      case OrderErrorCode.NETWORK_ERROR:
      case OrderErrorCode.UNKNOWN_ERROR:
        return 'critical';
      
      case OrderErrorCode.VALIDATION_ERROR:
      case OrderErrorCode.INVALID_EMAIL:
      case OrderErrorCode.INVALID_PHONE:
      case OrderErrorCode.FILE_TOO_LARGE:
      case OrderErrorCode.INVALID_FILE_TYPE:
        return 'low';
      
      default:
        return 'medium';
    }
  }

  /**
   * Check if error is retryable
   */
  public isRetryable(error: OrderError): boolean {
    return [
      OrderErrorCode.DATABASE_ERROR,
      OrderErrorCode.NETWORK_ERROR,
      OrderErrorCode.UNKNOWN_ERROR
    ].includes(error.code);
  }

  /**
   * Get error category
   */
  public getErrorCategory(error: OrderError): string {
    switch (error.code) {
      case OrderErrorCode.ORDER_NOT_FOUND:
      case OrderErrorCode.ORDER_ALREADY_EXISTS:
      case OrderErrorCode.INVALID_ORDER_STATUS:
      case OrderErrorCode.ORDER_CANNOT_BE_UPDATED:
      case OrderErrorCode.ORDER_CANNOT_BE_CANCELLED:
      case OrderErrorCode.ORDER_CANNOT_BE_DELETED:
        return 'order';
      
      case OrderErrorCode.CUSTOMER_NOT_FOUND:
      case OrderErrorCode.RETAILER_NOT_FOUND:
      case OrderErrorCode.PRODUCT_NOT_FOUND:
        return 'entity';
      
      case OrderErrorCode.INVALID_PRODUCT_TYPE:
      case OrderErrorCode.INVALID_QUANTITY:
      case OrderErrorCode.INVALID_PRICE:
      case OrderErrorCode.INVALID_DATES:
      case OrderErrorCode.INVALID_EMAIL:
      case OrderErrorCode.INVALID_PHONE:
      case OrderErrorCode.VALIDATION_ERROR:
        return 'validation';
      
      case OrderErrorCode.FILE_TOO_LARGE:
      case OrderErrorCode.INVALID_FILE_TYPE:
        return 'file';
      
      case OrderErrorCode.INSUFFICIENT_PERMISSIONS:
        return 'permission';
      
      case OrderErrorCode.DATABASE_ERROR:
      case OrderErrorCode.NETWORK_ERROR:
      case OrderErrorCode.UNKNOWN_ERROR:
        return 'system';
      
      default:
        return 'unknown';
    }
  }
}
