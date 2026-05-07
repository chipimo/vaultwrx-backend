import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Company } from '../Company/Company';
import { Retailer } from '../Users/Retailer';

/**
 * Maps to the existing `retailer_categories` table on Neon.
 * This is the **source of truth for the products-page header dropdown**:
 * each row is a category (Vault, Cremation, Urn, …) that a retailer/company
 * can independently enable or disable.
 */
@ObjectType()
@Entity({ name: 'retailer_categories' })
export class RetailerCategory extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Company)
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Field(() => String)
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Field(() => Retailer)
  @ManyToOne(() => Retailer)
  @JoinColumn({ name: 'retailer_id' })
  retailer: Retailer;

  @Field(() => String)
  @Column({ name: 'retailer_id', type: 'uuid' })
  retailerId: string;

  /** Stable machine key, e.g. "vaults", "cremation", "urns". */
  @Field()
  @Column()
  key: string;

  /** Human label shown in the UI, e.g. "Vaults", "Precasts (Bulk Vaults)". */
  @Field()
  @Column()
  label: string;

  @Field()
  @Column()
  enabled: boolean;

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
