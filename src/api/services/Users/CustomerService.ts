import { Service } from 'typedi';
import { CustomerRepository } from '@api/repositories/Users/CustomerRepository';
import { UserRepository } from '@api/repositories/Users/UserRepository';
import { RoleRepository } from '@api/repositories/Users/RoleRepository';
import { CustomerNotFoundException } from '@api/exceptions/Users/CustomerNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { CustomerWithUserCreateRequest } from '@api/requests/Users/CustomerWithUserCreateRequest';
import { RoleType } from '@api/models/Security/Role';
import { User } from '@api/models/Users/User';
import { Customer } from '@api/models/Users/Customer';
import { BadRequestError } from 'routing-controllers';

@Service()
export class CustomerService {
  constructor(
    @InjectRepository() private customerRepository: CustomerRepository,
    @InjectRepository() private userRepository: UserRepository,
    @InjectRepository() private roleRepository: RoleRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object, companyId?: string) {
    return await this.customerRepository.getManyAndCount(resourceOptions, companyId);
  }

  public async findOneById(id: string, resourceOptions?: object, companyId?: string) {
    return await this.getRequestedCustomerOrFail(id, resourceOptions, companyId);
  }

  public async create(data: object, companyId?: string) {
    let customer = await this.customerRepository.createCustomer(data, companyId);

    this.eventDispatcher.dispatch('onCustomerCreate', customer);

    return customer;
  }

  /**
   * Creates a User (customer role) and linked Customer row for the retailer company.
   */
  public async createWithUser(data: CustomerWithUserCreateRequest, companyId: string) {
    const customerRole = await this.roleRepository.findOne({ where: { type: RoleType.CUSTOMER } });
    if (!customerRole) {
      throw new BadRequestError('Customer role is not configured. Run database seeds for roles.');
    }

    const existingUser = await this.userRepository.findOne({ where: { email: data.email.toLowerCase().trim() } });
    if (existingUser) {
      throw new BadRequestError('A user with this email already exists.');
    }

    const customer = await this.customerRepository.manager.transaction(async (em) => {
      const user = em.create(User, {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        role_id: customerRole.id,
        company_id: companyId,
        isActive: true
      });
      await em.save(user);

      const dob =
        data.dateOfBirth && String(data.dateOfBirth).trim() !== ''
          ? new Date(data.dateOfBirth)
          : undefined;

      const row = em.create(Customer, {
        user_id: user.id,
        company_id: companyId,
        phone: data.phone?.trim() || undefined,
        address: data.address?.trim() || undefined,
        city: data.city?.trim() || undefined,
        state: data.state?.trim() || undefined,
        zipCode: data.zipCode?.trim() || undefined,
        dateOfBirth: dob,
        preferredContactMethod: data.preferredContactMethod?.trim() || undefined,
        isActive: data.isActive ?? true,
        businessName: data.business_name?.trim() || undefined,
        businessEmail: data.business_email?.trim().toLowerCase() || undefined,
        fax: data.fax?.trim() || undefined,
        country: data.country?.trim() || undefined,
        contactPhone: data.contact_phone?.trim() || undefined,
        salesRepresentative: data.sales_representative?.trim() || undefined,
        billingOption: data.billing_option || undefined,
        tags: data.tags?.trim() || undefined,
        specialOrderInstructions: data.special_order_instructions?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
        pricelistSelections: data.pricelist_selections?.length
          ? data.pricelist_selections.map((p) => ({
              categoryId: p.categoryId,
              enabled: !!p.enabled,
              pricelistId: p.pricelistId ?? null,
              locationId: p.locationId ?? null
            }))
          : null,
        allowCustomerSeePrices: !!data.allow_customer_see_prices
      });
      await em.save(row);

      return row;
    });

    const withRelations = await this.customerRepository.getOneById(customer.id, { relations: ['user', 'company'] }, companyId);

    this.eventDispatcher.dispatch('onCustomerCreate', withRelations ?? customer);

    return withRelations ?? customer;
  }

  public async updateOneById(id: string, data: object, companyId?: string) {
    const customer = await this.getRequestedCustomerOrFail(id, undefined, companyId);

    return await this.customerRepository.updateCustomer(customer, data);
  }

  public async deleteOneById(id: string, companyId?: string) {
    if (companyId) {
      const customer = await this.getRequestedCustomerOrFail(id, undefined, companyId);
      return await this.customerRepository.delete(customer.id);
    }
    return await this.customerRepository.delete(id);
  }

  private async getRequestedCustomerOrFail(id: string, resourceOptions?: object, companyId?: string) {
    let customer = await this.customerRepository.getOneById(id, resourceOptions, companyId);

    if (!customer) {
      throw new CustomerNotFoundException();
    }

    return customer;
  }
}

