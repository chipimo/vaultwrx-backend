import { Service } from 'typedi';
import { OrderStatus } from '@base/api/models/Sales-and-orders/Order';
import { OrderError, OrderErrorCode } from './OrderErrorService';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export enum LogCategory {
  ORDER_CREATION = 'order_creation',
  ORDER_UPDATE = 'order_update',
  ORDER_STATUS_CHANGE = 'order_status_change',
  ORDER_CANCELLATION = 'order_cancellation',
  ORDER_DELETION = 'order_deletion',
  ORDER_ITEM_ADDITION = 'order_item_addition',
  ORDER_ITEM_REMOVAL = 'order_item_removal',
  ORDER_ITEM_UPDATE = 'order_item_update',
  PHOTO_UPLOAD = 'photo_upload',
  PHOTO_DELETION = 'photo_deletion',
  VALIDATION = 'validation',
  ERROR = 'error',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  AUDIT = 'audit'
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: any;
  userId?: string;
  orderId?: string;
  retailerId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  duration?: number;
  error?: OrderError;
}

@Service()
export class OrderLoggingService {
  /**
   * Log order creation
   */
  public logOrderCreation(
    orderId: string,
    userId: string,
    retailerId: string,
    details?: any,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): LogEntry {
    return this.createLogEntry(
      LogLevel.INFO,
      LogCategory.ORDER_CREATION,
      `Order ${orderId} created by user ${userId}`,
      {
        orderId,
        userId,
        retailerId,
        ...details
      },
      userId,
      orderId,
      retailerId,
      sessionId,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log order update
   */
  public logOrderUpdate(
    orderId: string,
    userId: string,
    retailerId: string,
    changes: any,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): LogEntry {
    return this.createLogEntry(
      LogLevel.INFO,
      LogCategory.ORDER_UPDATE,
      `Order ${orderId} updated by user ${userId}`,
      {
        orderId,
        userId,
        retailerId,
        changes,
        timestamp: new Date()
      },
      userId,
      orderId,
      retailerId,
      sessionId,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log order status change
   */
  public logOrderStatusChange(
    orderId: string,
    userId: string,
    retailerId: string,
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
    reason?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): LogEntry {
    return this.createLogEntry(
      LogLevel.INFO,
      LogCategory.ORDER_STATUS_CHANGE,
      `Order ${orderId} status changed from ${fromStatus} to ${toStatus}`,
      {
        orderId,
        userId,
        retailerId,
        fromStatus,
        toStatus,
        reason,
        timestamp: new Date()
      },
      userId,
      orderId,
      retailerId,
      sessionId,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log order cancellation
   */
  public logOrderCancellation(
    orderId: string,
    userId: string,
    retailerId: string,
    reason?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): LogEntry {
    return this.createLogEntry(
      LogLevel.WARN,
      LogCategory.ORDER_CANCELLATION,
      `Order ${orderId} cancelled by user ${userId}`,
      {
        orderId,
        userId,
        retailerId,
        reason,
        timestamp: new Date()
      },
      userId,
      orderId,
      retailerId,
      sessionId,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log order deletion
   */
  public logOrderDeletion(
    orderId: string,
    userId: string,
    retailerId: string,
    reason?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): LogEntry {
    return this.createLogEntry(
      LogLevel.WARN,
      LogCategory.ORDER_DELETION,
      `Order ${orderId} deleted by user ${userId}`,
      {
        orderId,
        userId,
        retailerId,
        reason,
        timestamp: new Date()
      },
      userId,
      orderId,
      retailerId,
      sessionId,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log order item addition
   */
  public logOrderItemAddition(
    orderId: string,
    itemId: string,
    userId: string,
    retailerId: string,
    itemDetails: any,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): LogEntry {
    return this.createLogEntry(
      LogLevel.INFO,
      LogCategory.ORDER_ITEM_ADDITION,
      `Item ${itemId} added to order ${orderId}`,
      {
        orderId,
        itemId,
        userId,
        retailerId,
        itemDetails,
        timestamp: new Date()
      },
      userId,
      orderId,
      retailerId,
      sessionId,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log order item removal
   */
  public logOrderItemRemoval(
    orderId: string,
    itemId: string,
    userId: string,
    retailerId: string,
    reason?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): LogEntry {
    return this.createLogEntry(
      LogLevel.INFO,
      LogCategory.ORDER_ITEM_REMOVAL,
      `Item ${itemId} removed from order ${orderId}`,
      {
        orderId,
        itemId,
        userId,
        retailerId,
        reason,
        timestamp: new Date()
      },
      userId,
      orderId,
      retailerId,
      sessionId,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log photo upload
   */
  public logPhotoUpload(
    orderId: string,
    photoId: string,
    userId: string,
    retailerId: string,
    photoDetails: any,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): LogEntry {
    return this.createLogEntry(
      LogLevel.INFO,
      LogCategory.PHOTO_UPLOAD,
      `Photo ${photoId} uploaded for order ${orderId}`,
      {
        orderId,
        photoId,
        userId,
        retailerId,
        photoDetails,
        timestamp: new Date()
      },
      userId,
      orderId,
      retailerId,
      sessionId,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log photo deletion
   */
  public logPhotoDeletion(
    orderId: string,
    photoId: string,
    userId: string,
    retailerId: string,
    reason?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): LogEntry {
    return this.createLogEntry(
      LogLevel.INFO,
      LogCategory.PHOTO_DELETION,
      `Photo ${photoId} deleted from order ${orderId}`,
      {
        orderId,
        photoId,
        userId,
        retailerId,
        reason,
        timestamp: new Date()
      },
      userId,
      orderId,
      retailerId,
      sessionId,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log validation error
   */
  public logValidationError(
    orderId: string,
    userId: string,
    retailerId: string,
    validationErrors: string[],
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): LogEntry {
    return this.createLogEntry(
      LogLevel.WARN,
      LogCategory.VALIDATION,
      `Validation failed for order ${orderId}`,
      {
        orderId,
        userId,
        retailerId,
        validationErrors,
        timestamp: new Date()
      },
      userId,
      orderId,
      retailerId,
      sessionId,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log error
   */
  public logError(
    error: OrderError,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): LogEntry {
    return this.createLogEntry(
      LogLevel.ERROR,
      LogCategory.ERROR,
      `Error occurred: ${error.message}`,
      {
        error: error,
        timestamp: new Date()
      },
      error.userId,
      error.orderId,
      error.retailerId,
      sessionId,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log security event
   */
  public logSecurityEvent(
    event: string,
    userId: string,
    retailerId: string,
    details: any,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): LogEntry {
    return this.createLogEntry(
      LogLevel.WARN,
      LogCategory.SECURITY,
      `Security event: ${event}`,
      {
        event,
        userId,
        retailerId,
        details,
        timestamp: new Date()
      },
      userId,
      undefined,
      retailerId,
      sessionId,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log performance metric
   */
  public logPerformance(
    operation: string,
    duration: number,
    userId?: string,
    orderId?: string,
    retailerId?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): LogEntry {
    return this.createLogEntry(
      LogLevel.INFO,
      LogCategory.PERFORMANCE,
      `Performance: ${operation} took ${duration}ms`,
      {
        operation,
        duration,
        timestamp: new Date()
      },
      userId,
      orderId,
      retailerId,
      sessionId,
      ipAddress,
      userAgent,
      duration
    );
  }

  /**
   * Log audit event
   */
  public logAudit(
    action: string,
    userId: string,
    retailerId: string,
    details: any,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): LogEntry {
    return this.createLogEntry(
      LogLevel.INFO,
      LogCategory.AUDIT,
      `Audit: ${action}`,
      {
        action,
        userId,
        retailerId,
        details,
        timestamp: new Date()
      },
      userId,
      undefined,
      retailerId,
      sessionId,
      ipAddress,
      userAgent
    );
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    details?: any,
    userId?: string,
    orderId?: string,
    retailerId?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string,
    duration?: number
  ): LogEntry {
    return {
      id: this.generateLogId(),
      timestamp: new Date(),
      level,
      category,
      message,
      details,
      userId,
      orderId,
      retailerId,
      sessionId,
      ipAddress,
      userAgent,
      duration
    };
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Format log entry for display
   */
  public formatLogEntry(logEntry: LogEntry): string {
    const timestamp = logEntry.timestamp.toISOString();
    const level = logEntry.level.toUpperCase();
    const category = logEntry.category.toUpperCase();
    
    let formatted = `[${timestamp}] ${level} [${category}] ${logEntry.message}`;
    
    if (logEntry.userId) {
      formatted += ` | User: ${logEntry.userId}`;
    }
    
    if (logEntry.orderId) {
      formatted += ` | Order: ${logEntry.orderId}`;
    }
    
    if (logEntry.retailerId) {
      formatted += ` | Retailer: ${logEntry.retailerId}`;
    }
    
    if (logEntry.sessionId) {
      formatted += ` | Session: ${logEntry.sessionId}`;
    }
    
    if (logEntry.ipAddress) {
      formatted += ` | IP: ${logEntry.ipAddress}`;
    }
    
    if (logEntry.duration) {
      formatted += ` | Duration: ${logEntry.duration}ms`;
    }
    
    if (logEntry.details) {
      formatted += ` | Details: ${JSON.stringify(logEntry.details)}`;
    }
    
    return formatted;
  }

  /**
   * Get log entry severity
   */
  public getLogSeverity(logEntry: LogEntry): 'low' | 'medium' | 'high' | 'critical' {
    switch (logEntry.level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        return 'low';
      
      case LogLevel.WARN:
        return 'medium';
      
      case LogLevel.ERROR:
        return 'high';
      
      case LogLevel.FATAL:
        return 'critical';
      
      default:
        return 'low';
    }
  }

  /**
   * Check if log entry should be alerted
   */
  public shouldAlert(logEntry: LogEntry): boolean {
    return [
      LogLevel.ERROR,
      LogLevel.FATAL
    ].includes(logEntry.level) || 
    logEntry.category === LogCategory.SECURITY;
  }

  /**
   * Get log entry retention period
   */
  public getRetentionPeriod(logEntry: LogEntry): number {
    switch (logEntry.category) {
      case LogCategory.AUDIT:
      case LogCategory.SECURITY:
        return 7 * 365 * 24 * 60 * 60 * 1000; // 7 years
      
      case LogCategory.ERROR:
        return 365 * 24 * 60 * 60 * 1000; // 1 year
      
      case LogCategory.ORDER_CREATION:
      case LogCategory.ORDER_UPDATE:
      case LogCategory.ORDER_STATUS_CHANGE:
      case LogCategory.ORDER_CANCELLATION:
      case LogCategory.ORDER_DELETION:
        return 3 * 365 * 24 * 60 * 60 * 1000; // 3 years
      
      case LogCategory.PERFORMANCE:
        return 90 * 24 * 60 * 60 * 1000; // 90 days
      
      default:
        return 365 * 24 * 60 * 60 * 1000; // 1 year
    }
  }
}
