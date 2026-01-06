import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';

export enum LoyaltyProgramStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft'
}

@ObjectType()
@Entity({ name: 'loyalty_programs' })
export class LoyaltyProgram {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'program_name' })
  programName: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field()
  @Column({ name: 'points_per_dollar', type: 'decimal', precision: 10, scale: 2, default: 1 })
  pointsPerDollar: number;

  @Field()
  @Column({ name: 'redemption_rate', type: 'decimal', precision: 10, scale: 2, default: 0.01 })
  redemptionRate: number;

  @Field()
  @Column({
    type: 'enum',
    enum: LoyaltyProgramStatus,
    default: LoyaltyProgramStatus.DRAFT
  })
  status: LoyaltyProgramStatus;

  @Field({ nullable: true })
  @Column({ name: 'company_id', nullable: true })
  companyId: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

