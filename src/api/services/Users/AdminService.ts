import { Service } from 'typedi';
import { AdminRepository } from '@api/repositories/Users/AdminRepository';
import { AdminNotFoundException } from '@api/exceptions/Users/AdminNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class AdminService {
  constructor(
    @InjectRepository() private adminRepository: AdminRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object) {
    return await this.adminRepository.getManyAndCount(resourceOptions);
  }

  public async findOneById(id: number, resourceOptions?: object) {
    return await this.getRequestedAdminOrFail(id, resourceOptions);
  }

  public async create(data: object) {
    let admin = await this.adminRepository.createAdmin(data);

    this.eventDispatcher.dispatch('onAdminCreate', admin);

    return admin;
  }

  public async updateOneById(id: number, data: object) {
    const admin = await this.getRequestedAdminOrFail(id);

    return await this.adminRepository.updateAdmin(admin, data);
  }

  public async deleteOneById(id: number) {
    return await this.adminRepository.delete(id);
  }

  private async getRequestedAdminOrFail(id: number, resourceOptions?: object) {
    let admin = await this.adminRepository.getOneById(id, resourceOptions);

    if (!admin) {
      throw new AdminNotFoundException();
    }

    return admin;
  }
}

