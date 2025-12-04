import { Column, Entity, JoinColumn, OneToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { User } from './User';
import { Company } from '../Company/Company';
import { Order } from '../Orders/Order';

@ObjectType()
@Entity({ name: 'retailers' })
export class Retailer extends EntityBase {
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

  // Company relationship is managed through Company.retailer_id (inverse side)
  @Field(() => Company, { nullable: true })
  @OneToOne(() => Company, (company) => company.retailer)
  company: Company;

  @Field({ nullable: true })
  @Column({ name: 'business_license', nullable: true })
  businessLicense: string;

  @Field({ nullable: true })
  @Column({ name: 'tax_id', nullable: true })
  taxId: string;

  @Field()
  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  // Order relationships
  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order) => order.retailer, { cascade: false })
  orders: Order[];

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

