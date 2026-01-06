import { AuditActionType, AuditResourceType } from '@base/api/models/Security-access-control/AuditLog';

export interface AuditLogOptions {
  action: AuditActionType;
  resourceType: AuditResourceType;
  resourceId?: string | ((result: any, params: any, body: any) => string);
  resourceName?: string | ((result: any, params: any, body: any) => string);
  description?: string | ((result: any, params: any, body: any) => string);
  captureOldValues?: boolean;
  captureNewValues?: boolean;
  skipOnError?: boolean;
}

export function AuditLog(options: AuditLogOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      let result: any;
      let error: any;
      let isSuccessful = true;

      try {
        result = await originalMethod.apply(this, args);
        return result;
      } catch (err) {
        error = err;
        isSuccessful = false;
        if (!options.skipOnError) {
          throw err;
        }
      } finally {
        // Get the audit service from the controller
        const auditService = (this as any).auditService;
        if (!auditService) {
          console.warn('AuditService not found in controller. Make sure to inject it.');
          return result;
        }

        // Get user and request from the method arguments
        const user = args.find(arg => arg && typeof arg === 'object' && 'userId' in arg);
        const req = args.find(arg => arg && typeof arg === 'object' && 'headers' in arg);
        
        if (!user || !req) {
          console.warn('User or Request not found in method arguments for audit logging');
          return result;
        }

        const companyId = req.headers['company-id'] as string;
        if (!companyId) {
          console.warn('Company ID not found in request headers for audit logging');
          return result;
        }

        // Resolve dynamic values
        const resourceId = typeof options.resourceId === 'function' 
          ? options.resourceId(result, args, args) 
          : options.resourceId;

        const resourceName = typeof options.resourceName === 'function'
          ? options.resourceName(result, args, args)
          : options.resourceName;

        const description = typeof options.description === 'function'
          ? options.description(result, args, args)
          : options.description;

        // Capture old and new values if requested
        let oldValues: any = undefined;
        let newValues: any = undefined;

        if (options.captureOldValues && options.action === AuditActionType.UPDATE) {
          // For updates, we might need to capture the old values before the update
          // This would require additional logic to fetch the old state
        }

        if (options.captureNewValues) {
          if (options.action === AuditActionType.CREATE) {
            newValues = result;
          } else if (options.action === AuditActionType.UPDATE) {
            newValues = result;
          }
        }

        const responseTime = Date.now() - startTime;

        // Log the audit entry
        try {
          await auditService.logActivity(user, companyId, req, {
            action: options.action,
            resourceType: options.resourceType,
            resourceId,
            resourceName,
            description,
            oldValues,
            newValues,
            isSuccessful,
            errorMessage: error?.message,
            responseTime,
          });
        } catch (auditError) {
          console.error('Failed to log audit entry:', auditError);
        }
      }

      return result;
    };

    return descriptor;
  };
}
