import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Retailer } from '../Users/Retailer';
import { OrderItem } from '../Orders/OrderItem';
import { Company } from '../Company/Company';
import { Vault } from './Vault';
import { Casket } from './Casket';
import { Urn } from './Urn';
import { GraveDigging } from './GraveDigging';
import { Cremation } from './Cremation';
import { Monument } from './Monument';
import { BulkPrecast } from './BulkPrecast';

// Define ProductType enum
export enum ProductType {
  VAULT = 'vault',
  CASKET = 'casket',
  URN = 'urn',
  GRAVE_DIGGING = 'grave_digging',
  CREMATION = 'cremation',
  MONUMENT = 'monument',
  BULK_PRECAST = 'bulk_precast',
}

registerEnumType(ProductType, {
  name: 'ProductType',
  description: 'Product types',
});

@ObjectType()
@Entity({ name: 'products' })
export class Product extends EntityBase {
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
  name: string;

  @Field(() => ProductType, { nullable: true })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  type: ProductType;

  @Field({ nullable: true })
  @Column({ nullable: true })
  category: string;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Field()
  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  image: string;

  @Field({ nullable: true })
  @Column({ name: 'image_name', nullable: true })
  imageName: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  history: string;

  @Field()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Relationships
  @Field(() => [OrderItem], { nullable: true })
  @OneToMany(() => OrderItem, (orderItem) => orderItem.product, { cascade: false })
  orderItems: OrderItem[];

  // Product type relationships (OneToOne)
  @Field(() => Vault, { nullable: true })
  @OneToOne(() => Vault, (vault) => vault.product, { nullable: true })
  vault: Vault;

  @Field(() => Casket, { nullable: true })
  @OneToOne(() => Casket, (casket) => casket.product, { nullable: true })
  casket: Casket;

  @Field(() => Urn, { nullable: true })
  @OneToOne(() => Urn, (urn) => urn.product, { nullable: true })
  urn: Urn;

  @Field(() => GraveDigging, { nullable: true })
  @OneToOne(() => GraveDigging, (graveDigging) => graveDigging.product, { nullable: true })
  graveDigging: GraveDigging;

  @Field(() => Cremation, { nullable: true })
  @OneToOne(() => Cremation, (cremation) => cremation.product, { nullable: true })
  cremation: Cremation;

  @Field(() => Monument, { nullable: true })
  @OneToOne(() => Monument, (monument) => monument.product, { nullable: true })
  monument: Monument;

  @Field(() => BulkPrecast, { nullable: true })
  @OneToOne(() => BulkPrecast, (bulkPrecast) => bulkPrecast.product, { nullable: true })
  bulkPrecast: BulkPrecast;

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

