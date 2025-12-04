import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Retailer } from '../Users/Retailer';
import { OrderItem } from '../Orders/OrderItem';
import { Company } from '../Company/Company';

// Enum for color types
export enum ColorType {
  PAINT_COLOR = 'paint_color',
  LOCATION_COLOR = 'location_color',
}

registerEnumType(ColorType, {
  name: 'ColorType',
  description: 'Color types',
});

@ObjectType()
@Entity({ name: 'colors' })
export class Color extends EntityBase {
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

  // Retailer relationship (colors can be retailer-specific)
  @Field(() => Retailer, { nullable: true })
  @ManyToOne(() => Retailer, { nullable: true })
  @JoinColumn({ name: 'retailer_id' })
  retailer: Retailer;

  @Field(() => String, { nullable: true })
  @Column({ name: 'retailer_id', type: 'uuid', nullable: true })
  retailerId: string;

  @Field()
  @Column()
  name: string; // e.g., "Red", "Blue", "Grey", "Concrete", "Silver"

  @Field({ nullable: true })
  @Column({ nullable: true })
  hexCode: string; // Hex color code for UI display

  @Field(() => ColorType)
  @Column({
    type: 'varchar',
    length: 50,
    default: ColorType.PAINT_COLOR,
  })
  type: ColorType;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Relationships
  @Field(() => [OrderItem], { nullable: true })
  @OneToMany(() => OrderItem, (orderItem) => orderItem.paintColor, { cascade: false })
  orderItems: OrderItem[];

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

