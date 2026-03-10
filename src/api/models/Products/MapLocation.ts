import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field, Float } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Retailer } from '../Users/Retailer';
import { Company } from '../Company/Company';

@ObjectType()
@Entity({ name: 'map_locations' })
export class MapLocation extends EntityBase {
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

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Field({ nullable: true })
  @Column({ name: 'place_id', nullable: true })
  placeId: string;

  @Field({ nullable: true })
  @Column({ name: 'formatted_address', type: 'text', nullable: true })
  formattedAddress: string;

  @Field()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  color: string;

  @Field()
  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
