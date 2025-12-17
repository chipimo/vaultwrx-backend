import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { EntityBase } from '@base/infrastructure/abstracts/EntityBase';
import { Retailer } from '../Users/Retailer';
import { Company } from '../Company/Company';
import { Vault } from './Vault';

@ObjectType()
@Entity({ name: 'emblems' })
export class Emblem extends EntityBase {
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

  // Retailer relationship (emblems can be retailer-specific)
  @Field(() => Retailer, { nullable: true })
  @ManyToOne(() => Retailer, { nullable: true })
  @JoinColumn({ name: 'retailer_id' })
  retailer: Retailer;

  @Field(() => String, { nullable: true })
  @Column({ name: 'retailer_id', type: 'uuid', nullable: true })
  retailerId: string;

  @Field()
  @Column()
  name: string; // e.g., "Cross", "Star", "Angel", etc.

  @Field({ nullable: true })
  @Column({ nullable: true })
  image: string; // Image URL or path for the emblem

  @Field({ nullable: true })
  @Column({ nullable: true })
  imageName: string; // Image file name

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Relationships
  @Field(() => [Vault], { nullable: true })
  @OneToMany(() => Vault, (vault) => vault.emblem, { cascade: false })
  vaults: Vault[];

  @Field()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
