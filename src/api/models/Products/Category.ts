import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Retailer } from '../Users/Retailer';
import { Company } from '../Company/Company';
import { Product } from './Product';

@ObjectType()
@Entity({ name: 'categories' })
export class Category extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Company relationship
  @Field(() => Company, { nullable: true })
  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Field(() => String, { nullable: true })
  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId: string;

  // Retailer relationship
  @Field(() => Retailer, { nullable: true })
  @ManyToOne(() => Retailer, { nullable: true })
  @JoinColumn({ name: 'retailer_id' })
  retailer: Retailer;

  @Field(() => String, { nullable: true })
  @Column({ name: 'retailer_id', type: 'uuid', nullable: true })
  retailerId: string;

  @Field()
  @Column()
  name: string; // e.g., "Premium", "Standard", "Budget", "Custom"

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  code: string; // Short code for the category

  @Field({ nullable: true })
  @Column({ type: 'int', nullable: true, default: 0 })
  sortOrder: number; // For ordering categories in UI

  @Field()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Relationships
  @Field(() => [Product], { nullable: true })
  @OneToMany(() => Product, (product) => product.category, { cascade: false })
  products: Product[];

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

