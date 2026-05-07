import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Retailer } from '../Users/Retailer';

/**
 * Maps to the existing `price_lists` table on Neon.
 * Note: this table is **retailer-scoped only** — there is no `company_id`
 * column. Companies see their price lists through the `company_price_lists`
 * junction table (modeled separately if/when needed).
 */
@ObjectType()
@Entity({ name: 'price_lists' })
export class PriceList extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Field()
  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Field()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
