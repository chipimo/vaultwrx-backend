import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Retailer } from '../Users/Retailer';
import { Order } from '../Orders/Order';
import { Company } from '../Company/Company';

@ObjectType()
@Entity({ name: 'locations' })
export class Location extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Company relationship
  @Field(() => Company)
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Field(() => String)
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  // Retailer relationship
  @Field(() => Retailer)
  @ManyToOne(() => Retailer)
  @JoinColumn({ name: 'retailer_id' })
  retailer: Retailer;

  @Field(() => String)
  @Column({ name: 'retailer_id', type: 'uuid' })
  retailerId: string;

  @Field()
  @Column()
  name: string; // e.g., "Funeral Home", "Church", "Grave Site", "Other"

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  address: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  city: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  state: string;

  @Field({ nullable: true })
  @Column({ name: 'zip_code', nullable: true })
  zipCode: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  email: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Relationships
  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order) => order.location, { cascade: false })
  orders: Order[];

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

