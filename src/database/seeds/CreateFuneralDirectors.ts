import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';
import { User } from '@api/models/Users/User';
import { FuneralDirector } from '@api/models/Users/FuneralDirector';
import { Company } from '@api/models/Company/Company';
import { Role, RoleType } from '@api/models/Security/Role';

export default class CreateFuneralDirectors implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const userRepository = connection.getRepository(User);
    const funeralDirectorRepository = connection.getRepository(FuneralDirector);
    const companyRepository = connection.getRepository(Company);
    const roleRepository = connection.getRepository(Role);

    // Get Funeral Director role
    const funeralDirectorRole = await roleRepository.findOne({ where: { type: RoleType.FUNERAL_DIRECTOR } });
    if (!funeralDirectorRole) {
      console.log('Funeral Director role not found. Please run CreateRoles seed first.');
      return;
    }

    // Get companies
    const companies = await companyRepository.find();
    if (companies.length === 0) {
      console.log('No companies found. Please run CreateCompanies seed first.');
      return;
    }

    // Create funeral directors for each company
    for (const company of companies) {
      const funeralDirectors = [
        {
          user: {
            first_name: 'David',
            last_name: 'Director',
            email: `director1@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
            password: 'Pass313',
            role_id: funeralDirectorRole.id,
            company_id: company.id,
            isActive: true,
          },
          funeralDirector: {
            licenseNumber: `FD-LIC-${company.id}-001`,
            licenseExpiry: new Date('2025-12-31'),
            isVerified: true,
            specialization: 'Traditional Services',
            yearsOfExperience: 10,
          },
        },
        {
          user: {
            first_name: 'Emily',
            last_name: 'Professional',
            email: `director2@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
            password: 'Pass313',
            role_id: funeralDirectorRole.id,
            company_id: company.id,
            isActive: true,
          },
          funeralDirector: {
            licenseNumber: `FD-LIC-${company.id}-002`,
            licenseExpiry: new Date('2026-06-30'),
            isVerified: true,
            specialization: 'Cremation Services',
            yearsOfExperience: 5,
          },
        },
      ];

      for (const directorData of funeralDirectors) {
        let user = await userRepository.findOne({ where: { email: directorData.user.email } });

        if (!user) {
          user = userRepository.create(directorData.user);
          user = await userRepository.save(user);

          // Create funeral director record
          const existingDirector = await funeralDirectorRepository.findOne({ where: { user_id: user.id } });
          if (!existingDirector) {
            const funeralDirector = funeralDirectorRepository.create({
              user_id: user.id,
              company_id: company.id,
              ...directorData.funeralDirector,
            });
            await funeralDirectorRepository.save(funeralDirector);
          }
        }
      }
    }
  }
}

