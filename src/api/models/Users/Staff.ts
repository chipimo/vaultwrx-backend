import { Column, Entity, JoinColumn, ManyToOne, OneToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { User } from './User';
import { Company } from '../Company/Company';
import { Order } from '../Orders/Order';

@ObjectType()
@Entity({ name: 'staff' })
export class Staff extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  user_id: string;

  @Field(() => User, { nullable: true })
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => String)
  @Column({ name: 'company_id', type: 'uuid' })
  company_id: string;

  @Field(() => Company, { nullable: true })
  @ManyToOne(() => Company, (company) => company.staff)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Field({ nullable: true })
  @Column({ name: 'employee_id', nullable: true })
  employeeId: string;

  @Field({ nullable: true })
  @Column({ name: 'department', nullable: true })
  department: string;

  @Field({ nullable: true })
  @Column({ name: 'position', nullable: true })
  position: string;

  @Field({ nullable: true })
  @Column({ name: 'hire_date', type: 'date', nullable: true })
  hireDate: Date;

  @Field()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Order relationships
  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order) => order.staff, { cascade: false })
  orders: Order[];

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

