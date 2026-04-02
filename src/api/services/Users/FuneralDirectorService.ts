import { Service } from 'typedi';
import { FuneralDirectorRepository } from '@api/repositories/Users/FuneralDirectorRepository';
import { FuneralDirectorNotFoundException } from '@api/exceptions/Users/FuneralDirectorNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { OrderContactRepository } from '@api/repositories/Orders/OrderContactRepository';
import { CustomerRepository } from '@api/repositories/Users/CustomerRepository';
import { BadRequestError } from 'routing-controllers';
import { CreatePrimaryContactRequest } from '@api/requests/Users/CreatePrimaryContactRequest';

@Service()
export class FuneralDirectorService {
  constructor(
    @InjectRepository() private funeralDirectorRepository: FuneralDirectorRepository,
    @InjectRepository() private orderContactRepository: OrderContactRepository,
    @InjectRepository() private customerRepository: CustomerRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object) {
    return await this.funeralDirectorRepository.getManyAndCount(resourceOptions);
  }

  public async findOneById(id: number, resourceOptions?: object) {
    return await this.getRequestedFuneralDirectorOrFail(id, resourceOptions);
  }

  public async create(data: object) {
    let funeralDirector = await this.funeralDirectorRepository.createFuneralDirector(data);

    this.eventDispatcher.dispatch('onFuneralDirectorCreate', funeralDirector);

    return funeralDirector;
  }

  public async updateOneById(id: number, data: object) {
    const funeralDirector = await this.getRequestedFuneralDirectorOrFail(id);

    return await this.funeralDirectorRepository.updateFuneralDirector(funeralDirector, data);
  }

  public async deleteOneById(id: number) {
    return await this.funeralDirectorRepository.delete(id);
  }

  public async getPrimaryContactsByCustomer(customerId: string) {
    const contacts = await this.orderContactRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.customer', 'customer')
      .where('contact.customer_id = :customerId', { customerId })
      .orderBy('contact.isPrimary', 'DESC')
      .addOrderBy('contact.createdAt', 'ASC')
      .getMany();

    return {
      data: contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone || contact.phoneNumber,
        relationship: contact.relationship,
        customer: contact.customer
          ? {
              id: contact.customer.id,
              user_id: contact.customer.user_id,
            }
          : undefined,
      })),
      count: contacts.length,
    };
  }

  public async getPrimaryContactsByCompany(companyId: string) {
    const contacts = await this.orderContactRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.customer', 'customer')
      .where('customer.company_id = :companyId', { companyId })
      .orderBy('contact.isPrimary', 'DESC')
      .addOrderBy('contact.createdAt', 'ASC')
      .getMany();

    return {
      data: contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone || contact.phoneNumber,
        relationship: contact.relationship,
        customer: contact.customer
          ? {
              id: contact.customer.id,
              user_id: contact.customer.user_id,
            }
          : undefined,
      })),
      count: contacts.length,
    };
  }

  public async createPrimaryContact(payload: CreatePrimaryContactRequest) {
    const customer = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.id = :customerId', { customerId: payload.customer_id })
      .andWhere('customer.company_id = :companyId', { companyId: payload.company_id })
      .getOne();

    if (!customer) {
      throw new BadRequestError('Customer not found for the provided company');
    }

    const contact = await this.orderContactRepository.createOrderContact({
      customerId: payload.customer_id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      relationship: payload.specialization,
      isPrimary: true,
    });

    return {
      data: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone || contact.phoneNumber,
        relationship: contact.relationship,
        customer: {
          id: customer.id,
          user_id: customer.user_id,
        },
      },
    };
  }

  private async getRequestedFuneralDirectorOrFail(id: number, resourceOptions?: object) {
    let funeralDirector = await this.funeralDirectorRepository.getOneById(id, resourceOptions);

    if (!funeralDirector) {
      throw new FuneralDirectorNotFoundException();
    }

    return funeralDirector;
  }
}

