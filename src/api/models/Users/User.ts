import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Exclude, Expose } from 'class-transformer';
import { Role } from '../Security/Role';
import { Company } from '../Company/Company';
import { Retailer } from './Retailer';
import { Customer } from './Customer';
import { Staff } from './Staff';
import { FuneralDirector } from './FuneralDirector';
import { Admin } from './Admin';
import { HashService } from '@base/infrastructure/services/hash/HashService';

@ObjectType()
@Entity({ name: 'users' })
export class User extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  first_name: string;

  @Field()
  @Column()
  last_name: string;

  @Field()
  @Column()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Field(() => String)
  @Column({ type: 'uuid' })
  role_id: string;

  @Field(() => Role, { nullable: true })
  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Field(() => String, { nullable: true })
  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  company_id: string;

  @Field(() => Company, { nullable: true })
  @ManyToOne(() => Company, (company) => company.users, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  // Relationships to specific user type models
  @Field(() => Retailer, { nullable: true })
  @OneToOne(() => Retailer, (retailer) => retailer.user, { nullable: true })
  retailer: Retailer;

  @Field(() => Customer, { nullable: true })
  @OneToOne(() => Customer, (customer) => customer.user, { nullable: true })
  customer: Customer;

  @Field(() => Staff, { nullable: true })
  @OneToOne(() => Staff, (staff) => staff.user, { nullable: true })
  staff: Staff;

  @Field(() => FuneralDirector, { nullable: true })
  @OneToOne(() => FuneralDirector, (funeralDirector) => funeralDirector.user, { nullable: true })
  funeralDirector: FuneralDirector;

  @Field(() => Admin, { nullable: true })
  @OneToOne(() => Admin, (admin) => admin.user, { nullable: true })
  admin: Admin;

  @Field(() => String, { nullable: true })
  @Column({ name: 'parent_user_id', type: 'uuid', nullable: true })
  parent_user_id: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.childStaff, { nullable: true })
  @JoinColumn({ name: 'parent_user_id' })
  parentUser: User;

  @Field(() => [User], { nullable: true })
  @OneToMany(() => User, (user) => user.parentUser)
  childStaff: User[];

  @Field()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Field(() => String)
  @Expose({ name: 'full_name' })
  get fullName(): string {
    return this.first_name + ' ' + this.last_name;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async setPassword() {
    if (this.password) this.password = await new HashService().make(this.password);
  }

  @BeforeInsert()
  async setDefaultRole() {
    // Note: Default role ID should be set via migration or seed data
    // This hook can be removed or updated to use a UUID lookup
  }
}
