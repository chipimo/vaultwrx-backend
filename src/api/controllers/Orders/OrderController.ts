import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams, Req, OnUndefined } from 'routing-controllers';
import { OrderService } from '@api/services/Orders/OrderService';
import { AuditLogService } from '@api/services/Audit/AuditLogService';
import { Service } from 'typedi';
import { OrderCreateRequest } from '@api/requests/Orders/OrderCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { OrderUpdateRequest } from '@api/requests/Orders/OrderUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';
import { Request } from 'express';
import { NotFoundError, ForbiddenError, BadRequestError } from 'routing-controllers';
import { LoggedUser } from '@base/decorators/LoggedUser';
import { Order } from '@api/models/Orders/Order';
import { RoleType } from '@api/models/Security/Role';
import { AuditAction } from '@api/models/Audit/AuditLog';
import { ProductType } from '@api/models/Products/Product';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/orders')
@UseBefore(AuthCheck)
export class OrderController {
  constructor(
    private orderService: OrderService,
    private auditLogService: AuditLogService
  ) {}

  @Get()
  public async getAll(
    @QueryParams() parseResourceOptions: RequestQueryParser,
    @Req() request: any,
    @LoggedUser() user: any
  ): Promise<{ total_data: number; rows: Order[] }> {
    const companyId = request.headers['company-id'] || request.headers['x-company-id'];

    if (!companyId) {
      throw new NotFoundError('Company ID is required in the headers.');
    }

    if (!user) {
      throw new NotFoundError('Authentication required.');
    }

    // Ensure user belongs to the company
    if (user.roleType !== RoleType.ADMIN) {
      const userCompanyId = user.owned_company_id || user.company_id;
      if (!userCompanyId) {
        throw new ForbiddenError('You are not associated with any company.');
      }
      if (companyId !== userCompanyId) {
        throw new ForbiddenError('You are not allowed to access orders from this company.');
      }
    }

    const resourceOptions = parseResourceOptions.getAll();
    return await this.orderService.getAll(resourceOptions, companyId);
  }

  @Get('/by-product-type/:productType')
  public async getAllByProductType(
    @Param('productType') productType: string,
    @QueryParams() parseResourceOptions: RequestQueryParser,
    @Req() request: any,
    @LoggedUser() user: any
  ): Promise<{ total_data: number; rows: Order[] }> {
    const companyId = request.headers['company-id'] || request.headers['x-company-id'];

    if (!companyId) {
      throw new NotFoundError('Company ID is required in the headers.');
    }

    if (!user) {
      throw new NotFoundError('Authentication required.');
    }

    // Ensure user belongs to the company
    if (user.roleType !== RoleType.ADMIN) {
      const userCompanyId = user.owned_company_id || user.company_id;
      if (!userCompanyId) {
        throw new ForbiddenError('You are not associated with any company.');
      }
      if (companyId !== userCompanyId) {
        throw new ForbiddenError('You are not allowed to access orders from this company.');
      }
    }

    // Validate product type
    const validProductTypes = Object.values(ProductType);
    if (!validProductTypes.includes(productType as ProductType)) {
      throw new BadRequestError(`Invalid product type. Valid types are: ${validProductTypes.join(', ')}`);
    }

    const resourceOptions = parseResourceOptions.getAll();
    return await this.orderService.getAllByProductType(
      productType as ProductType,
      resourceOptions,
      companyId
    );
  }

  @Get('/grouped-by-date-and-product-type')
  public async getGroupedByDateAndProductType(
    @QueryParams() parseResourceOptions: RequestQueryParser,
    @Req() request: any,
    @LoggedUser() user: any
  ): Promise<Array<{ date: string; [key: string]: any }>> {
    const companyId = request.headers['company-id'] || request.headers['x-company-id'];

    if (!companyId) {
      throw new NotFoundError('Company ID is required in the headers.');
    }

    if (!user) {
      throw new NotFoundError('Authentication required.');
    }

    // Ensure user belongs to the company
    if (user.roleType !== RoleType.ADMIN) {
      const userCompanyId = user.owned_company_id || user.company_id;
      if (!userCompanyId) {
        throw new ForbiddenError('You are not associated with any company.');
      }
      if (companyId !== userCompanyId) {
        throw new ForbiddenError('You are not allowed to access orders from this company.');
      }
    }

    const resourceOptions = parseResourceOptions.getAll();
    
    const productTypeParam = request.query?.productType || request.query?.type || 'all';
    let productType: ProductType | 'all' = 'all';
    
    if (productTypeParam && productTypeParam !== 'all') {
      const validProductTypes = Object.values(ProductType);
      const normalizedParam = productTypeParam.toLowerCase().replace(/-/g, '_');
      
      if (validProductTypes.includes(normalizedParam as ProductType)) {
        productType = normalizedParam as ProductType;
      } else {
        const nameMap: Record<string, ProductType> = {
          'bulk': ProductType.BULK_PRECAST,
          'bulk_precast': ProductType.BULK_PRECAST,
          'bulk-precast': ProductType.BULK_PRECAST,
          'precast': ProductType.BULK_PRECAST,
        };
        
        if (nameMap[normalizedParam]) {
          productType = nameMap[normalizedParam];
        }
      }
    }

    return await this.orderService.getOrdersGroupedByDateAndProductType(
      resourceOptions,
      companyId,
      productType
    );
  }

  @Get('/:id')
  @OnUndefined(NotFoundError)
  public async getOne(
    @Param('id') id: string,
    @QueryParams() parseResourceOptions: RequestQueryParser,
    @Req() request: any,
    @LoggedUser() user: any
  ): Promise<Order> {
    const companyId = request.headers['company-id'] || request.headers['x-company-id'];

    if (!companyId) {
      throw new NotFoundError('Company ID is required in the headers.');
    }

    if (!user) {
      throw new NotFoundError('Authentication required.');
    }

    if (user.roleType !== RoleType.ADMIN) {
      const userCompanyId = user.owned_company_id || user.company_id;
      if (!userCompanyId) {
        throw new ForbiddenError('You are not associated with any company.');
      }
      if (companyId !== userCompanyId) {
        throw new ForbiddenError('You are not allowed to access orders from this company.');
      }
    }

    const resourceOptions = parseResourceOptions.getAll();
    const order = await this.orderService.findOneById(id, resourceOptions, companyId);

    if (!order) {
      throw new NotFoundError('Order not found.');
    }

    if (order.companyId !== companyId) {
      throw new ForbiddenError('Order does not belong to the specified company.');
    }

    // Log view action
    const ipAddress = request.ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'];
    await this.auditLogService.logOrderAction(
      companyId,
      user,
      AuditAction.VIEW,
      order.id,
      `Viewed order ${order.id}`,
      undefined,
      undefined,
      ipAddress as string,
      userAgent
    );

    return order;
  }

  @Post('/create')
  @HttpCode(201)
  public async create(
    @Body() order: OrderCreateRequest,
    @Req() request: any,
    @LoggedUser() user: any
  ): Promise<Order> {
    const companyId = request.headers['company-id'] || request.headers['x-company-id'];

    if (!companyId) {
      throw new NotFoundError('Company ID is required in the headers.');
    }

    if (!user) {
      throw new NotFoundError('Authentication required.');
    }

    // Ensure user belongs to the company
    if (user.roleType !== RoleType.ADMIN) {
      const userCompanyId = user.owned_company_id || user.company_id;
      if (!userCompanyId) {
        throw new ForbiddenError('You are not associated with any company.');
      }
      if (companyId !== userCompanyId) {
        throw new ForbiddenError('You are not authorized to create an order for this company.');
      }
    }

    const createdOrder = await this.orderService.create(order, companyId, user);

    // Log create action
    const ipAddress = request.ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'];
    await this.auditLogService.logOrderAction(
      companyId,
      user,
      AuditAction.CREATE,
      createdOrder.id,
      `Created order ${createdOrder.id}`,
      undefined,
      order,
      ipAddress as string,
      userAgent
    );

    return createdOrder;
  }

  @Put('/:id')
  public async update(
    @Param('id') id: string,
    @Body() order: OrderUpdateRequest,
    @Req() request: any,
    @LoggedUser() user: any
  ): Promise<Order> {
    const companyId = request.headers['company-id'] || request.headers['x-company-id'];

    if (!companyId) {
      throw new NotFoundError('Company ID is required in the headers.');
    }

    if (!user) {
      throw new NotFoundError('Authentication required.');
    }

    // Ensure user belongs to the company
    if (user.roleType !== RoleType.ADMIN) {
      const userCompanyId = user.owned_company_id || user.company_id;
      if (!userCompanyId) {
        throw new ForbiddenError('You are not associated with any company.');
      }
      if (companyId !== userCompanyId) {
        throw new ForbiddenError('You are not allowed to access orders from this company.');
      }
    }

    const existingOrder = await this.orderService.findOneById(id, {}, companyId);
    if (!existingOrder) {
      throw new NotFoundError('Order not found.');
    }

    if (existingOrder.companyId !== companyId) {
      throw new ForbiddenError('Order does not belong to the specified company.');
    }

    // Store old values for audit
    const oldValues = {
      status: existingOrder.status,
      total: existingOrder.total,
      subtotal: existingOrder.subtotal,
      customerId: existingOrder.customerId,
      staffId: existingOrder.staffId,
      locationId: existingOrder.locationId,
      // Add other important fields as needed
    };

    const updatedOrder = await this.orderService.updateOneById(id, order, companyId);

    // Log update action
    const ipAddress = request.ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'];
    await this.auditLogService.logOrderAction(
      companyId,
      user,
      AuditAction.UPDATE,
      updatedOrder.id,
      `Updated order ${updatedOrder.id}`,
      oldValues,
      order,
      ipAddress as string,
      userAgent
    );

    return updatedOrder;
  }

  @Delete('/:id')
  @HttpCode(204)
  @OnUndefined(204)
  public async delete(
    @Param('id') id: string,
    @Req() request: any,
    @LoggedUser() user: any
  ): Promise<void> {
    const companyId = request.headers['company-id'] || request.headers['x-company-id'];

    if (!companyId) {
      throw new NotFoundError('Company ID is required in the headers.');
    }

    if (!user) {
      throw new NotFoundError('Authentication required.');
    }

    // Ensure user belongs to the company
    if (user.roleType !== RoleType.ADMIN) {
      const userCompanyId = user.owned_company_id || user.company_id;
      if (!userCompanyId) {
        throw new ForbiddenError('You are not associated with any company.');
      }
      if (companyId !== userCompanyId) {
        throw new ForbiddenError('You are not allowed to access orders from this company.');
      }
    }

    const order = await this.orderService.findOneById(id, {}, companyId);
    if (!order) {
      throw new NotFoundError('Order not found.');
    }

    if (order.companyId !== companyId) {
      throw new ForbiddenError('Order does not belong to the specified company.');
    }

    // Store order data for audit before deletion
    const orderData = {
      id: order.id,
      status: order.status,
      total: order.total,
      customerId: order.customerId,
      // Add other important fields as needed
    };

    await this.orderService.deleteOneById(id, companyId);

    // Log delete action
    const ipAddress = request.ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'];
    await this.auditLogService.logOrderAction(
      companyId,
      user,
      AuditAction.DELETE,
      order.id,
      `Deleted order ${order.id}`,
      orderData,
      undefined,
      ipAddress as string,
      userAgent
    );
  }
}

