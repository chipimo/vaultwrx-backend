import { Service } from 'typedi';
import { StaffRepository } from '@api/repositories/Users/StaffRepository';
import { StaffNotFoundException } from '@api/exceptions/Users/StaffNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class StaffService {
  constructor(
    @InjectRepository() private staffRepository: StaffRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object, companyId?: string) {
    return await this.staffRepository.getManyAndCount(resourceOptions, companyId);
  }

  public async findOneById(id: string, resourceOptions?: object, companyId?: string) {
    return await this.getRequestedStaffOrFail(id, resourceOptions, companyId);
  }

  public async create(data: object, companyId?: string) {
    let staff = await this.staffRepository.createStaff(data, companyId);

    this.eventDispatcher.dispatch('onStaffCreate', staff);

    return staff;
  }

  public async updateOneById(id: string, data: object, companyId?: string) {
    const staff = await this.getRequestedStaffOrFail(id, undefined, companyId);

    return await this.staffRepository.updateStaff(staff, data);
  }

  public async deleteOneById(id: string, companyId?: string) {
    if (companyId) {
      const staff = await this.getRequestedStaffOrFail(id, undefined, companyId);
      return await this.staffRepository.delete(staff.id);
    }
    return await this.staffRepository.delete(id);
  }

  private async getRequestedStaffOrFail(id: string, resourceOptions?: object, companyId?: string) {
    let staff = await this.staffRepository.getOneById(id, resourceOptions, companyId);

    if (!staff) {
      throw new StaffNotFoundException();
    }

    return staff;
  }
}

