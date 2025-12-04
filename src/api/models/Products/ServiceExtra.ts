import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Retailer } from '../Users/Retailer';
import { OrderExtraCharge } from '../Orders/OrderExtraCharge';
import { Company } from '../Company/Company';

@ObjectType()
@Entity({ name: 'service_extras' })
export class ServiceExtra extends EntityBase {
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
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  category: string; // e.g., "Customization", "Delivery", "Setup"

  @Field()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Relationships
  @Field(() => [OrderExtraCharge], { nullable: true })
  @OneToMany(() => OrderExtraCharge, (orderExtraCharge) => orderExtraCharge.serviceExtra, { cascade: false })
  orderExtraCharges: OrderExtraCharge[];

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

