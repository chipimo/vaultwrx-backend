import { Column, Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Product } from './Product';
import { Color } from './Color';
import { Emblem } from './Emblem';

@ObjectType()
@Entity({ name: 'vaults' })
export class Vault extends EntityBase {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ name: 'product_id', type: 'uuid', unique: true })
  productId: string;

  @Field(() => Product)
  @OneToOne(() => Product, (product) => product.vault, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Field(() => Emblem, { nullable: true })
  @ManyToOne(() => Emblem, (emblem) => emblem.vaults, { nullable: true })
  @JoinColumn({ name: 'emblem_id' })
  emblem: Emblem;

  @Field(() => String, { nullable: true })
  @Column({ name: 'emblem_id', type: 'uuid', nullable: true })
  emblemId: string;

  @Field(() => Color, { nullable: true })
  @ManyToOne(() => Color, { nullable: true })
  @JoinColumn({ name: 'colour_id' })
  colour: Color;

  @Field(() => String, { nullable: true })
  @Column({ name: 'colour_id', type: 'uuid', nullable: true })
  colourId: string;

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

